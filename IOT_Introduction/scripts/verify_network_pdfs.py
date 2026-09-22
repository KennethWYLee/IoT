"""Check and render the network lesson PDFs; no device or lesson code is run."""
from pathlib import Path
import json
import argparse
import os
import shutil
import subprocess

import fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--answers", type=int, choices=(11,12,14,15))
args = parser.parse_args()
answer_dir = ROOT / f'IOT_Introduction/docs/teaching_drafts/week{args.answers}_answers' if args.answers else None
OUT = answer_dir / 'tmp/review' if answer_dir else ROOT / '_outputs/network_pdfs/review'
OUT.mkdir(parents=True, exist_ok=True)
manifest_path = answer_dir / 'network_pdf_manifest.json' if answer_dir else ROOT / 'IOT_Introduction/docs/network_pdf_manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
poppler = shutil.which('pdftoppm') or str(Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
if not Path(poppler).exists():
    raise SystemExit('Poppler pdftoppm is required for rendering.')
results = []
for entry in manifest['documents']:
    pdf = ROOT / entry['pdf']
    document = fitz.open(pdf)
    render_dir = OUT / (pdf.stem + '-' + entry['pdf_sha256'][:12])
    render_dir.mkdir(exist_ok=True)
    subprocess.run([poppler, '-scale-to', '1100', '-png', str(pdf), str(render_dir / 'page')], check=True, capture_output=True)
    rendered = sorted(render_dir.glob('page-*.png'))
    assert len(rendered) == len(document), (pdf, len(rendered), len(document))
    pictures = []
    warnings = []
    for index, page in enumerate(document):
        assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1
        text = page.get_text()
        assert '\ufffd' not in text, (pdf.name, index + 1, 'replacement glyph')
        assert len(text.strip()) > 20, (pdf.name, index + 1, 'blank page')
        for x0, y0, x1, y1, *rest in page.get_text('words'):
            assert 35 <= x0 <= x1 <= page.rect.width - 35, (pdf.name, index + 1, rest)
            bottom = page.rect.height - (6 if y0 > 800 else 45)
            assert 35 <= y0 <= y1 <= bottom, (pdf.name, index + 1, rest)
        for link in page.get_links():
            if link['kind'] == fitz.LINK_GOTO:
                assert 0 <= link['page'] < len(document)
            if link['kind'] == fitz.LINK_URI:
                assert link['uri'].startswith(('http://', 'https://', 'mailto:'))
        if len(text.strip()) < 120:
            warnings.append(index + 1)
        picture = Image.open(rendered[index]).convert('RGB')
        picture.thumbnail((340, 480))
        pictures.append(picture)
    for start in range(0, len(pictures), 12):
        sheet = Image.new('RGB', (1050, 2020), '#d5dcde')
        draw = ImageDraw.Draw(sheet)
        for offset, picture in enumerate(pictures[start:start+12]):
            x, y = (offset % 3) * 350, (offset // 3) * 505
            draw.text((x+5,y+4),f'{pdf.stem} p{start+offset+1}',fill='black')
            sheet.paste(picture,(x+5,y+22))
        sheet.save(OUT / f'{pdf.stem}-contact-{start//12+1}.png')
    results.append({'pdf':entry['pdf'],'pages':len(document),'sparse_pages_to_review':warnings})
    print(json.dumps(results[-1]))
(OUT / 'checks.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print('PASS: A4 dimensions, text bounds, replacement glyphs, links and full-page rendering.')
