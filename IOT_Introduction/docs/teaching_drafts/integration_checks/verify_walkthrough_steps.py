"""Static checks of repaired instructions and ideal breadboard connectivity.

This does not operate a board, establish electrical ratings, or test a student.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[4]
DRAFTS = ROOT / 'IOT_Introduction/docs/teaching_drafts'


def sections(week):
    source = (DRAFTS / f'week{week}_redesign/week{week}_main.md').read_text(encoding='utf-8')
    parts = list(re.finditer(r'<!-- page: (\w+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)', source))
    assert len({p[1] for p in parts}) == len(parts)
    return {p[1]: p[3] for p in parts}, [p[1] for p in parts]


def connected(wires, pressed=()):
    parent = {}

    def find(a):
        parent.setdefault(a, a)
        if parent[a] != a:
            parent[a] = find(parent[a])
        return parent[a]

    def join(a, b):
        parent[find(a)] = find(b)

    for row in range(1, 31):
        for side in ('abcde', 'fghij'):
            for column in side[1:]:
                join(f'{side[0]}{row}', f'{column}{row}')
    for first, last in [(21, 23), (27, 29)]:
        join(f'e{first}', f'f{first}')
        join(f'e{last}', f'f{last}')
        if first in pressed:
            join(f'e{first}', f'e{last}')
    for a, b in wires:
        join(a, b)
    return lambda a, b: find(a) == find(b)


for week in range(3, 8):
    blocks, order = sections(week)
    assert 'Download ZIP' in blocks['files'] and 'Ctrl+F' in blocks['files']
    for filename in re.findall(r'`((?:examples|docs)/[^`]+\.ino)`', blocks['files']):
        assert (ROOT / 'IOT_Introduction' / filename).is_file(), filename
    assert order.index('answer') == order.index('exercise') + 1
    assert order.index('buildanswer') == order.index('buildexercise') + 1

w3, _ = sections(3)
assert '1000' in w3['buildexercise'] and '改回 200' in w3['buildexercise']
assert '記事本' in w3['savelog'] and 'UTF-8' in w3['savelog']
w5, _ = sections(5)
assert '按鈕版不接受 x、z、o' in w5['finish']
w6, order6 = sections(6)
assert order6.index('loadcode') < order6.index('stopwire')
assert '**a6' in w6['oled'] and '| ESP32 3V3 |' in w6['oled']
assert 'd3 → 外部負極端子' in w6['finalwire']
w7, order7 = sections(7)
assert order7.index('settings') < order7.index('prepareupload') < order7.index('rails')
assert '重新插入' in w7['prepareupload']
assert 'LESSON_STAGE=1' in w7['slower'] and 'COLOR_MS=3000' in w7['slower']
assert '第二局' in w7['finish'] and '新的一局' in w7['hold']
assert 'e3' in w7['rgb'] and 'b29 → a23' in w7['buttons']

# Model the explicit new wiring separately from the prose, including every return.
for week, pins, ground_wires in [
    (3, [('GPIO5', 'a27')], [('a29', 'e3')]),
    (4, [('GPIO5', 'a27')], [('a29', 'e3')]),
    (5, [('GPIO4', 'a27'), ('GPIO5', 'a21')], [('a29', 'c3'), ('a23', 'e3')]),
    (6, [('STOP', 'a27')], [('a29', 'c3')]),
    (7, [('GPIO5', 'a27'), ('GPIO6', 'a21')], [('a29', 'd3'), ('b29', 'a23')]),
]:
    wires = [('GND', 'a3'), ('3V3', 'a6')] + pins + ground_wires
    endpoints = [p for wire in wires for p in wire if re.fullmatch(r'[a-j]\d+', p)]
    assert len(endpoints) == len(set(endpoints)), (week, 'two plugs share a hole')
    for pressed in [(), (27,), (21,), (27, 21)]:
        is_connected = connected(wires, pressed)
        assert not is_connected('3V3', 'GND')
        for signal, hole in pins:
            assert is_connected(signal, 'GND') == (int(hole[1:]) in pressed), (week, signal, pressed)
    print(f'Week {week}: ideal button return paths pass; not physical validation.')

oled = connected([('3V3', 'a6'), ('OLED_VDD', 'b6'), ('GND', 'a3'), ('OLED_GND', 'b3')])
assert oled('OLED_VDD', '3V3') and oled('OLED_GND', 'GND')
assert not oled('OLED_VDD', 'GND')
print('PASS: file paths, instruction order, exercise adjacency, command/mode distinctions and ideal wiring.')
