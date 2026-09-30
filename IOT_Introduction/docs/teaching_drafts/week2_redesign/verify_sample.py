"""Verify the cumulative Week2 Main/Ans without modifying other weeks."""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
ANS = HERE.parent / 'week2_answers'
MAIN = ROOT / 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf'

def digest(path):
    data = path.read_bytes()
    if path.suffix in {'.cjs', '.ino', '.css'}:
        data = data.replace(b'\r\n', b'\n')
    return hashlib.sha256(data).hexdigest()

texts = []
for pdf, manifest_path, expected in [
    (MAIN, HERE/'checks/published_main.json', 3),
    (ANS/'week2Ans.pdf', ANS/'checks/published_answers.json', 11),
]:
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    assert manifest['pdf_sha256'] == digest(pdf)
    assert manifest['pages'] == expected
    for name, value in manifest['inputs'].items():
        assert digest(ROOT/name) == value, name
    reader = PdfReader(pdf)
    assert len(reader.pages) == expected
    extracted = []
    for i, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        assert len(text) > 100 and '\ufffd' not in text
        assert f'{i} / {expected}' in text
        for annotation in page.get('/Annots', []):
            action = annotation.get_object().get('/A', {})
            if action.get('/URI'):
                assert action['/URI'].startswith('https://')
        extracted.append(text)
    texts.append('\n'.join(extracted))
    audit = json.loads((manifest_path.parent/'layout_check.json').read_text())
    assert all(i['loaded'] for i in audit['images'])
    assert all(not p['overflow'] and not p['horizontalOverflow'] and p['gap'] >= 8 for p in audit['pages'])

assert MAIN.read_bytes() == (HERE/'Week2_main_layout_sample.pdf').read_bytes()
main_manifest = json.loads((HERE/'checks/published_main.json').read_text())
assert not any('week2_answers' in name or name.endswith('.ino') for name in main_manifest['inputs'])
main, ans = texts
assert all(q in main and q in ans for q in ['Q1', 'Q2', 'Q3', 'Q4'])
assert not any(x in main for x in ['void setup', 'void loop', '.ino', 'INPUT_PULLUP', 'readyForPress', 'GPIO5', '參考答案'])
assert not any(x in ans for x in ['void setup', 'void loop'])
assert ans.index('接 USB') < ans.index('GPIO5') < ans.index('INPUT_PULLUP') < ans.index('同題號回答')
for name, page_number in [('week2_hello_serial',2), ('week2_button_state',7), ('week2_button_count',9)]:
    file = ANS/'programs'/name/f'{name}.ino'
    assert file.exists() and file.parent.name == file.stem
    assert f'programs/{name}/{name}.ino' in ans
    if name != 'week2_hello_serial':
        assert 'BUTTON_PIN = 5;' in file.read_text()
sim = json.loads((ANS/'checks/source_simulation.json').read_text())
assert len(sim['results']) == 10 and all(t['passed'] for t in sim['results'])
for name, sha in sim['sources'].items():
    assert hashlib.sha256((ANS/'programs'/name/f'{name}.ino').read_bytes()).hexdigest() == sha
compile_report = json.loads((ANS/'checks/arduino_compile.json').read_text())
assert len(compile_report['results']) == 3
for result in compile_report['results']:
    assert result['exit_code'] == 0
    file = ANS/'programs'/result['sketch']/f"{result['sketch']}.ino"
    assert hashlib.sha256(file.read_bytes()).hexdigest() == result['sha256']
archive = ANS/'supplemental/pre_cumulative_20260930/programs'
for name in ['hello_first', 'button_follow_along', 'counter_practice', 'room_counter']:
    assert (archive/name/f'{name}.ino').read_bytes() == (ANS/'programs'/name/f'{name}.ino').read_bytes()
report = {'main_pages':3, 'answer_pages':11, 'checks':['source/PDF hashes','page count and footers',
    'loaded images','DOM overflow and footer clearance','Main answer isolation','no full code in PDFs',
    'Q1-Q4 alignment','program folder/name and GPIO5 mapping','source simulation current',
    'three target-compile hashes current','four original program archives byte-identical'],
    'limitations':['visual review is recorded separately','no physical hardware validation','simulation is not native C++ execution']}
(ANS/'checks/cumulative_pdf_check.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
