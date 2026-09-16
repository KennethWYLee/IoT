import hashlib
import json
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

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.inside = True
            self.blocks.append('')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.inside = False

    def handle_data(self, data):
        if self.inside:
            self.blocks[-1] += data


html = (root / 'Week2_main_layout_sample.html').read_text(encoding='utf-8')
assert '沿用先前已成功上傳 Serial 範例' not in html
assert '先把腳位設成讀取按鈕' not in html
parser = CodeBlocks()
parser.feed(html)
hello = (root / 'hello_first/hello_first.ino').read_text(encoding='utf-8').strip()
button = '\n'.join((root / 'button_follow_along/button_follow_along.ino').read_text(encoding='utf-8').split('\n')[2:]).strip()
assert parser.blocks[0].strip() == hello
assert parser.blocks[2].strip() == button
counter = (root / 'counter_two_buttons/counter_two_buttons.ino').read_text(encoding='utf-8').strip()
assert '\n\n'.join(block.strip() for block in parser.blocks[-2:]) == counter

pdf = root / 'Week2_main_layout_sample.pdf'
doc = fitz.open(pdf)
assert len(doc) == 32, len(doc)
page_checks = []
for number, page in enumerate(doc, 1):
    content = page.get_text()
    assert len(content) > 250, (number, len(content))
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
unchanged = {name: hashlib.sha256((repository / name).read_bytes()).hexdigest() == old for name, old in originals.items()}
assert all(unchanged.values()), unchanged
result = {
    'pages': page_checks,
    'originals_unchanged': unchanged,
    'pdf_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
    'visual_review': 'Recorded separately in the redesign review after inspecting Poppler renders.',
    'hardware_tested': False,
    'student_trial_completed': False,
    'published': False,
    'code_in_html_matches_sketches': True,
    'removed_assumed_prior_serial_setup': True,
}
(root / 'tmp/verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'pages': len(doc), 'originals_unchanged': all(unchanged.values()), 'pdf_sha256': result['pdf_sha256']}))
