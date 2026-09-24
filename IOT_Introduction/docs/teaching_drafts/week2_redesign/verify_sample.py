import hashlib
import json
import math
import re
from html.parser import HTMLParser
from pathlib import Path

import fitz

root = Path(__file__).resolve().parent
repository = root.parents[3]
(root / 'tmp').mkdir(exist_ok=True)


class CodeBlocks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.inside = False
        self.texts = []

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.inside = True
            self.blocks.append('')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.inside = False

    def handle_data(self, data):
        self.texts.append(data)
        if self.inside:
            self.blocks[-1] += data


html = (root / 'Week2_main_layout_sample.html').read_text(encoding='utf-8')
assert '沿用先前已成功上傳 Serial 範例' not in html
assert '先把腳位設成讀取按鈕' not in html
parser = CodeBlocks()
parser.feed(html)
assert 'TPO' not in ''.join(parser.texts)
assert '舊教材' not in ''.join(parser.texts)
for removed in ('下一頁', '做完再講', '這一頁先', '先知道作品要做什麼',
                '先不用解釋程式', '還不用理解', '不要求現在逐行讀懂',
                '原理等看到紀錄後再講', '才進下一頁', '原版', '新版本',
                '五人版本', '本版', '先跟著試這一串動作', '待教師確認'):
    assert removed not in ''.join(parser.texts), removed
hello = (root / 'hello_first/hello_first.ino').read_text(encoding='utf-8').strip()
button = '\n'.join((root / 'button_follow_along/button_follow_along.ino').read_text(encoding='utf-8').split('\n')[2:]).strip()
assert parser.blocks[0].strip() == hello
assert parser.blocks[2].strip() == button
counter = (root / 'counter_practice/counter_practice.ino').read_text(encoding='utf-8').strip()
assert counter in [block.strip() for block in parser.blocks]
for excluded in ('MAX_COUNT', 'MIN_COUNT', 'millis', 'readyForPress', 'DEBOUNCE', 'printCount', 'event='):
    assert excluded not in counter
assert 'void stepCount' not in ''.join(parser.texts)
assert 'boundaryReported' not in ''.join(parser.texts)
pdf = repository / 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf'
assert pdf.read_bytes() == (root / 'Week2_main_layout_sample.pdf').read_bytes()
doc = fitz.open(pdf)
assert len(doc) == 37
expected_titles = {
    21: '沒按按鈕，為什麼是 3.3V？',
    22: '按下後，為什麼變成 0V？',
    23: '如果把電阻換成導線？',
    29: '加鍵增加，減鍵減少',
    30: '雙按鈕計數器完整程式',
    31: '數字是誰算的？誰負責顯示？',
    32: '按下哪顆按鈕，哪條路接通？',
    33: '活動入場人數登記',
    34: '用這些結果檢查自己的程式',
}
for number, title in expected_titles.items():
    assert title in doc[number-1].get_text(), (number,title)
assert '第30頁' in ''.join(doc[25].get_text().split())
all_text = ''.join(page.get_text() for page in doc)
for removed in ('停在哪一步，就處理那一步', '第 38 頁', '小房間', '完整程式（1／2）'):
    assert removed not in all_text, removed
basic = ''.join(doc[i].get_text() for i in range(24,32))
for removed in ('readyForPress','DEBOUNCE_MS','event=','millis()','FULL'):
    assert removed not in basic, removed
for text in ('CH343','UART','Serial.println(count)'):
    assert text in doc[30].get_text()
assert '晶片內部' in doc[31].get_text()
assert 'INPUT_PULLUP' in doc[31].get_text()
assert '延伸練習' in doc[32].get_text() and '延伸練習' in doc[33].get_text()
room = ''.join(doc[i].get_text() for i in (32,33))
for text in ('FULL', '0～20', '兩鍵都放開', 'loop()', '負數', 'RST'):
    assert text in room, text
for removed in ('800', '300', '6200', '6500', 'event=', '負數、長按與重新開始', '一次按下，不等於一次 loop'):
    assert removed not in room, removed
voltage = doc[20].get_text() + doc[21].get_text()
assert 'V_R' not in voltage and 'V_GPIO' not in voltage
for text in ('電阻兩端', 'GPIO4 與 GND', '比較的位置不同'):
    assert text in voltage, text
for text in ('隔著大電阻', '電阻幾乎為零', 'GPIO4 接到 GND（0V）'):
    assert ''.join(text.split()) in ''.join(doc[21].get_text().split()), text
assert '你的提問' not in voltage
no_resistor = ''.join(doc[22].get_text().split())
for text in ('只看圖理解，不要照圖接線', '按鈕斷開', '按鈕接通：短路', '電壓不保證固定', '電源和線路'):
    assert text in no_resistor, text
assert 'void loop' not in room and 'MAX_COUNT' not in room
assert '0.00011 A = 0.11 mA' in doc[21].get_text()
assert math.isclose(3.3 / 30_000 * 1000, 0.11)
page_checks = []
for number, page in enumerate(doc, 1):
    content = page.get_text()
    assert len(content) > 250, (number, len(content))
    assert f'{number} / 37' in content, number
    assert '\ufffd' not in content, number
    outside = []
    for block in page.get_text('dict')['blocks']:
        if 'lines' not in block:
            continue
        for line in block['lines']:
            for span in line['spans']:
                rect = fitz.Rect(span['bbox'])
                if not page.rect.contains(rect):
                    outside.append(span['text'])
    assert not outside, (number, outside)
    page_checks.append({'page': number, 'characters': len(content), 'text_outside_page': outside})
originals = json.loads((root / 'original_hashes.json').read_text(encoding='utf-8'))
archive = repository / 'IOT_Introduction/docs/archive/week2_before_layout_promotion'
unchanged = {name: hashlib.sha256((archive / (Path(name).name + ('.json' if name.endswith('.ipynb') else ''))).read_bytes()).hexdigest() == old for name, old in originals.items()}
assert all(unchanged.values()), unchanged
reviewed = fitz.open(archive / 'Week2_layout_before_answer_move.pdf')
assert len(reviewed) == 37
# Concept-first edits on 2026-09-23 supersede the old wording on these pages.
concept_pages = {0, 1, 3, 4, 10, 19, 23}
for new_index, old_index in [(i,i) for i in range(22) if i not in {8,11,20,21} | concept_pages] + [(26,25),(27,26),(36,36)]:
    before = re.sub(r'\d+\s*/\s*37\s*$', '', reviewed[old_index].get_text())
    after = re.sub(r'\d+\s*/\s*37\s*$', '', doc[new_index].get_text())
    assert ''.join(before.split()) == ''.join(after.split()), (new_index+1,old_index+1)
for number, terms in {5: ('GND', '0V'), 11: ('Flash', 'PSRAM'),
                      24: ('UART', 'CH343'), 32: ('壓降', '電阻')}.items():
    for term in terms:
        assert term in ''.join(doc[number-1].get_text().split()), (number, term)
assert '可傳資料的 USB 線' in doc[8].get_text()
assert '失敗時保留錯誤文字' in doc[11].get_text()
manifest = json.loads((root / 'checks/published_main.json').read_text(encoding='utf-8'))
assert manifest['pdf_sha256'] == hashlib.sha256(pdf.read_bytes()).hexdigest()
for name, expected in manifest['inputs'].items():
    file = repository / name
    data = file.read_text(encoding='utf-8').replace('\r\n', '\n').encode('utf-8') if file.suffix in {'.cjs', '.ino'} else file.read_bytes()
    assert hashlib.sha256(data).hexdigest() == expected, name
result = {
    'pages': page_checks,
    'archived_originals_byte_identical': unchanged,
    'pdf_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
    'code_in_html_matches_sketches': True,
    'counter_has_no_custom_bounds': True,
    'minimal_counter_then_information_and_current_then_exercises': True,
    'room_capacity_20_and_repeat_conflict_requirements_checked': True,
    'room_solution_not_in_main': True,
    'unaffected_pages_preserved': True,
    'hardware_tested': False,
    'student_trial_completed': False,
    'published': False,
    'visual_review': 'See dated lab note for Poppler render inspection.',
}
(root / 'tmp/verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
(root / 'checks/verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'pages':len(doc),'pdf_sha256':result['pdf_sha256'],'checks':'PASS'}))
