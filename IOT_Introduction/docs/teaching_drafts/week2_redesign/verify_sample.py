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
counter = (root / 'counter_two_buttons/counter_two_buttons.ino').read_text(encoding='utf-8').strip()
assert any('\n\n'.join(block.strip() for block in parser.blocks[i:i + 2]) == counter
           for i in range(len(parser.blocks) - 1))
solution = (root / 'counter_exercise_solution/counter_exercise_solution.ino').read_text(encoding='utf-8')
answer = solution[solution.index('void printCount('):solution.index('\nvoid setup()')].strip()
assert not any(block.strip() == answer for block in parser.blocks)
assert '上限改成五，滿了再印 FULL' not in ''.join(parser.texts)
assert 'const int MAX_COUNT = 5;' not in ''.join(parser.texts)
assert 'Serial.println("FULL")' not in ''.join(parser.texts)

pdf = repository / 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf'
assert pdf.read_bytes() == (root / 'Week2_main_layout_sample.pdf').read_bytes()
doc = fitz.open(pdf)
assert len(doc) == 36, len(doc)
assert '計數器程式：設定與起始動作' in doc[30].get_text()
assert '計數器程式：持續讀取按鈕' in doc[31].get_text()
assert '第 31–32 頁' in doc[30].get_text()
assert '第 31 頁' in doc[31].get_text()
assert '最多五人的小房間' in doc[32].get_text()
assert '做完後，應該看到這些訊息' in doc[33].get_text()
assert 'void printCount' not in doc[32].get_text()
assert 'void printCount' not in doc[33].get_text()
assert 'Ctrl+F' not in doc[32].get_text() + doc[33].get_text()
for number in (32, 33):
    exercise_text = doc[number].get_text()
    for excluded in ('99', 'MAX_COUNT', 'counter_practice', '原版', '新版本'):
        assert excluded not in exercise_text, (number + 1, excluded)
pullup_page = doc[19].get_text()
assert 'ESP32 晶片內部' in pullup_page
assert '放開：GPIO4 約 3.3V → HIGH' in pullup_page
assert '按下：GPIO4 約 0V → LOW' in pullup_page
assert '不是電流大小' in pullup_page
assert '幾乎沒有電流' in pullup_page
assert 'LOW 怎麼變成電腦上的 pressed' in doc[22].get_text()
assert '改變的只有送到電腦的文字' in doc[22].get_text()
assert '放開時，電壓都留在 ESP32' in doc[20].get_text()
assert '按下後，哪裡沒有電壓差' in doc[21].get_text()
assert '不是實物精確阻值' in doc[20].get_text()
assert '0.00011 A = 0.11 mA' in doc[21].get_text()
assert math.isclose(3.3 / 30_000, 0.00011)
assert math.isclose(3.3 / 30_000 * 1000, 0.11)
assert '第 31、32 頁' in doc[24].get_text()
assert '第 35 頁' in doc[24].get_text()
walkthrough = ''.join(doc[i].get_text() for i in range(27, 34))
for removed in ('實際結果', '我實際看到', '________', 'MAX_COUNT = 3'):
    assert removed not in walkthrough, removed
assert '計數器的三個測試' in doc[29].get_text()
assert '第 35 頁' in doc[8].get_text()
assert '第 35 頁' in doc[11].get_text()
for expected in ('event=start count=0', 'event=minimum count=0', 'event=plus count=1', 'event=plus count=2'):
    assert expected in doc[29].get_text(), expected
assert 'event=maximum count=5' in doc[33].get_text()
for n in range(1, 6):
    assert f'event=plus count={n}' in doc[33].get_text()
assert 'event=minus count=4' in doc[33].get_text()
assert 'FULL' in doc[33].get_text()
assert 'MAX_COUNT = 99' in doc[30].get_text()
assert 'counter_practice' in doc[30].get_text()
assert 'counter_practice' in doc[31].get_text()
assert 'room_counter' not in ''.join(page.get_text() for page in doc)
page_checks = []
for number, page in enumerate(doc, 1):
    content = page.get_text()
    assert len(content) > 250, (number, len(content))
    assert f'{number} / 36' in content, number
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
reviewed_order = [*range(30), 33, 34, 30, 31, 35, 36]
for new_index, old_index in enumerate(reviewed_order):
    before = re.sub(r'\d+\s*/\s*37\s*$', '', reviewed[old_index].get_text())
    after = re.sub(r'\d+\s*/\s*36\s*$', '', doc[new_index].get_text())
    before, after = ''.join(before.split()), ''.join(after.split())
    if old_index in {8, 11, 24}:
        before = before.replace('第36頁', '第35頁')
    if old_index == 24:
        before = before.replace('第34、35頁', '第31、32頁')
    if old_index == 33:
        before = before.replace('第34–35頁', '第31–32頁')
    if old_index == 34:
        before = before.replace('第34頁', '第31頁')
    assert before == after, f'Unexpected content change: old page {old_index + 1}, new page {new_index + 1}'
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
    'visual_review': 'Recorded separately in the redesign review after inspecting Poppler renders.',
    'hardware_tested': False,
    'student_trial_completed': False,
    'published': False,
    'code_in_html_matches_sketches': True,
    'removed_assumed_prior_serial_setup': True,
    'pullup_voltage_and_message_explanation_checked': True,
    'student_lesson_has_no_tpo_or_old_lesson_reference': True,
    'ohms_law_example_and_shifted_page_references_checked': True,
    'counter_code_pages31_32_precedes_room_exercise_pages33_34': True,
    'room_scenario_and_results_preserved_answer_removed': True,
    'official_main_matches_layout_alias_and_current_sources': True,
    'all_retained_pages_match_reviewed_layout_except_order_and_page_references': True,
    'lesson_pacing_narration_removed': True,
    'student_text_has_no_original_or_revised_program_comparisons': True,
    'room_exercise_pages_are_self_contained_without_counter_99_comparison': True,
}
(root / 'tmp/verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
(root / 'checks/verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'pages': len(doc), 'archived_originals_byte_identical': all(unchanged.values()), 'pdf_sha256': result['pdf_sha256']}))
