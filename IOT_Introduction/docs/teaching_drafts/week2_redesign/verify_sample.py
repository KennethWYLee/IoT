"""Verify the Week 2 question paper and preserved complete teaching/answers."""
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path
import fitz
from bs4 import BeautifulSoup

root = Path(__file__).resolve().parent
repository = root.parents[3]
answers = root.parent / 'week2_answers'
formal = repository / 'IOT_Introduction/Week_02_ESP32_Hardware_Basics'

for pdf, mirror, manifest_file, expected in [
    (formal/'week2_main.pdf', root/'Week2_main_layout_sample.pdf', root/'checks/published_main.json', 5),
    (formal/'week2Ans.pdf', answers/'week2Ans.pdf', answers/'checks/published_answers.json', 43),
]:
    assert pdf.read_bytes() == mirror.read_bytes()
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    assert manifest['pdf_sha256'] == hashlib.sha256(pdf.read_bytes()).hexdigest()
    for name, expected_hash in manifest['inputs'].items():
        p = repository / name
        data = p.read_text(encoding='utf-8').replace('\r\n','\n').encode() if p.suffix in {'.cjs','.ino'} else p.read_bytes()
        assert hashlib.sha256(data).hexdigest() == expected_hash, name
    doc = fitz.open(pdf)
    assert len(doc) == expected, (pdf, len(doc))
    for i, page in enumerate(doc, 1):
        assert len(page.get_text().strip()) > 30 and '\ufffd' not in page.get_text()
        assert f'{i} / {expected}' in page.get_text()
        for block in page.get_text('dict')['blocks']:
            for line in block.get('lines', []):
                for span in line['spans']:
                    assert page.rect.contains(fitz.Rect(span['bbox'])), (i,span['text'])

main = fitz.open(formal/'week2_main.pdf')
main_text = '\n'.join(p.get_text() for p in main)
assert all(q in main_text for q in ['Q1','Q2','Q3','Q4','Q5'])
assert 'void setup' not in main_text and 'void loop' not in main_text
ans = fitz.open(formal/'week2Ans.pdf')
voltage = ans[20].get_text() + ans[21].get_text()
assert 'V_R' not in voltage and 'V_GPIO' not in voltage
for term in ['電阻兩端','GPIO4 與 GND','比較的位置不同']:
    assert term in voltage, term
assert math.isclose(3.3/30000*1000,0.11)
assert '0.00011 A = 0.11 mA' in ans[21].get_text()
assert '不要照圖接線' in ''.join(ans[22].get_text().split())
html = answers / 'week2Ans.html'
soup = BeautifulSoup(html.read_text(encoding='utf-8'),'html.parser')
embedded = ' '.join(p.get_text() for p in soup.select('pre')).split()
flat = ' '.join(embedded)
assert 'void setup()' not in flat and 'void loop()' not in flat
subprocess.run([sys.executable, str(repository / 'IOT_Introduction/scripts/verify_answer_programs.py'), '2'], check=True)
assert 'MAX_COUNT' not in (root/'counter_practice/counter_practice.ino').read_text(encoding='utf-8')
print('PASS Week2 Main 5 / Ans 43: hashes, external program files, voltage regression, text bounds and separation')
