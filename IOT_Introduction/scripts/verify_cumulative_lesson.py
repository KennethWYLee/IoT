"""Verify the current cumulative lesson artifacts; never operate a device."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import subprocess
from pypdf import PdfReader

parser = argparse.ArgumentParser()
parser.add_argument('week', type=int, choices=range(4, 8))
parser.add_argument('--answers', action='store_true')
parser.add_argument('--render', action='store_true')
args = parser.parse_args()
course = Path(__file__).resolve().parents[1]
directory = course / f'docs/teaching_drafts/week{args.week}_{"answers" if args.answers else "redesign"}'
stem = f'week{args.week}Ans' if args.answers else f'week{args.week}_main'
manifest = json.loads((directory/'build_manifest.json').read_text(encoding='utf-8'))
def digest(file):
    data = file.read_text(encoding='utf-8').replace('\r\n','\n').encode() if file.suffix in ('.md','.cjs','.json','.ino','.css') else file.read_bytes()
    return hashlib.sha256(data).hexdigest()
assert manifest['format'] == 2
for item in manifest['inputs']:
    assert digest(course/item['file']) == item['sha256'], f'Stale input: {item["file"]}'
pdf = directory/(stem+'.pdf')
assert digest(pdf) == manifest['pdfSha256'], 'PDF bytes changed'
source = (directory/(stem+'.md')).read_text(encoding='utf-8')
assert not re.search(r'```(?:cpp|c\+\+)|void\s+(?:setup|loop)\s*\(', source), 'Full program in PDF source'
if not args.answers:
    assert not re.search(r'\{\{diagram:|\]\([^)]*week\d+_answers',source), 'Answer-only material in Main'
    assert all(word in source for word in ('作品','預期','Q1','Q2','Q3','Q4','write-space'))
    assert '驗證' in source or '展示' in source
else:
    if '{{weekly_setup}}' in source:
        assert any(item['file'].endswith('/weekly_setup.cjs') for item in manifest['inputs'])
    else:
        assert '麵包板' in source and ('空板' in source or '空麵包板' in source), 'Missing standalone starting setup'
    config = json.loads((directory/'programs.sources.json').read_text(encoding='utf-8'))
    compact = re.sub(r'\s+','',source)
    for entry in config['entries']:
        assert entry['file'] in compact, f'Missing opening instruction: {entry["file"]}'
    for item in config['files']:
        assert (directory/'programs'/item['destination']).read_bytes() == (course/item['source']).read_bytes(), item['destination']
    if args.week == 4:
        assert len(config['entries']) == 6, 'Week 4 needs three works with two display versions each'
        assert 'Serial Monitor' in source
        names = {entry['file'] for entry in config['entries']}
        for kind in ('display','alert','compare'):
            for output in ('oled','serial'):
                name = f'environment_{kind}_{output}'
                assert f'{name}/{name}.ino' in names
            serial = directory/f'src/environment_{kind}_serial/environment_{kind}_serial.ino'
            code = serial.read_text(encoding='utf-8')
            assert not re.search(r'#include\s*[<"](?:Wire|U8g2)', code), 'Serial version must not require OLED libraries'
            assert 'Serial.begin(115200)' in code
reader = PdfReader(pdf)
assert len(reader.pages) == len(manifest['pages'])
all_text = '\n'.join(page.extract_text() for page in reader.pages)
if args.answers:
    for phrase in ('GND', '3V3', 'GPIO4', 'GPIO5', 'GPIO10', '115200', '拆下'):
        assert phrase in all_text, f'Missing standalone instruction: {phrase}'
    assert not re.search(r'保留上週接線|先確認上週 OLED', all_text), 'Stale previous-week wiring assumption'
for i,p in enumerate(reader.pages,1):
    text=p.extract_text()
    assert len(text)>60 and '\ufffd' not in text, i
    assert abs(float(p.mediabox.width)-595.28)<2 and abs(float(p.mediabox.height)-841.89)<2, i
if args.render:
    out=course.parent/'_outputs/cumulative_verify'/stem/manifest['pdfSha256'][:12]
    out.mkdir(parents=True,exist_ok=True)
    poppler=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
    subprocess.run([str(poppler),'-r','110','-png',str(pdf),str(out/'page')],check=True)
    assert len(list(out.glob('page-*.png')))==len(reader.pages)
print(f'PASS {stem}: {len(reader.pages)} pages; source/figure/program/PDF hashes; references and page format. Physical test: no.')
