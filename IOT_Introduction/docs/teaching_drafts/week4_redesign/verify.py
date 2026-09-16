"""Check the exported draft and render every page for visual review."""
from pathlib import Path
import hashlib
import json
import math
from html.parser import HTMLParser
import fitz
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
COURSE = HERE.parents[2]
TMP = HERE / "tmp"
TMP.mkdir(exist_ok=True)
manifest = json.loads((HERE / "build_manifest.json").read_text(encoding="utf-8"))
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(HERE / "week4_main.md") == manifest["sourceSha256"]
assert sha(HERE / "build.cjs") == manifest["builderSha256"]
assert sha(HERE / "week4_main.pdf") == manifest["pdfSha256"]
for item in manifest["sketches"]:
    assert sha(COURSE / item["path"]) == item["sha256"]
for item in manifest["photos"]:
    assert sha(COURSE / "docs/images/hardware/actual" / item["name"]) == item["sha256"]

class CodeBlocks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.blocks = []
        self.current = None

    def handle_starttag(self, tag, attrs):
        if tag == "pre" and dict(attrs).get("class") == "fullcode":
            self.current = ""

    def handle_data(self, data):
        if self.current is not None:
            self.current += data

    def handle_endtag(self, tag):
        if tag == "pre" and self.current is not None:
            self.blocks.append(self.current)
            self.current = None

parser = CodeBlocks()
parser.feed((HERE / "week4_main.html").read_text(encoding="utf-8"))
expected = "\n".join((COURSE / item["path"]).read_text(encoding="utf-8").rstrip()
                     for item in manifest["sketches"])
assert "\n".join(parser.blocks) == expected

doc = fitz.open(HERE / "week4_main.pdf")
assert len(doc) == len(manifest["pages"])
ids = {p["id"]: p["number"] for p in manifest["pages"]}
assert ids["answer"] == ids["exercise"] + 1
all_text = "\n".join(p.get_text() for p in doc)
assert "\ufffd" not in all_text
assert "{{" not in all_text
assert "**" not in all_text

assert ids["qualityanswer"] == ids["qualityquestion"] + 1
assert "475" in doc[ids["answer"] - 1].get_text()
assert "rh_out_of_bounds" in doc[ids["qualityanswer"] - 1].get_text()
assert "dht_age_ms" not in all_text
assert "light_sample" not in all_text
assert "stable=UNKNOWN" not in all_text
assert math.isclose(4 / 330 * 100, 1.2121212121212122)
assert math.isclose(330 * .95, 313.5)
assert math.isclose(330 * 1.05, 346.5)
assert 3500 - 3025 == 475
assert (320 + 900) // 2 == 610

# Independent table checks: each row has the same preceding reading.
def classify(t, rh):
    if not math.isfinite(t) or not math.isfinite(rh):
        return False, "invalid", "read_failed"
    if not 0 <= rh <= 100:
        return False, "invalid", "rh_out_of_bounds"
    if not 10 <= t <= 40:
        return True, "suspect", "outside_classroom_policy"
    if abs(t - 25) > 5 or abs(rh - 50) > 10:
        return True, "suspect", "abrupt_change"
    return True, "usable", "basic_checks_passed"

cases = [
    (math.nan, 50, (False, "invalid", "read_failed")),
    (25, 120, (False, "invalid", "rh_out_of_bounds")),
    (45, 50, (True, "suspect", "outside_classroom_policy")),
    (31, 50, (True, "suspect", "abrupt_change")),
    (30, 60, (True, "usable", "basic_checks_passed")),
]
for t, rh, expected in cases:
    assert classify(t, rh) == expected

# Separate accepted stable-state transitions reproduce the final exercise.
armed, count = False, 0
counts = []
for states in ([1], [0, 1], [1], [0, 1], [1]):
    for state in states:
        if state == 0:
            armed = True
        elif armed:
            count += 1
            armed = False
    counts.append(count)
assert counts == [0, 1, 1, 2, 2]

def node(hole):
    return ("left" if hole[0] in "abcde" else "right", int(hole[1:]))

assert node("a3") == node("b3") == node("c3") != node("a6")
assert node("a6") == node("b6") == node("c6")
assert node("a15") == node("c15") != node("f15")
assert node("b20") == node("e20") != node("b25")
assert node("b25") == node("e25")

rendered = []
for i, page in enumerate(doc):
    assert abs(page.rect.width - 595.28) < 1
    assert abs(page.rect.height - 841.89) < 1
    assert len(page.get_text().strip()) > 100
    pix = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
    out = TMP / f"page-{i+1:02}.png"
    pix.save(out)
    rendered.append(out)

for start in range(0, len(rendered), 8):
    sheet = Image.new("RGB", (1160, 860), "#dde3e5")
    draw = ImageDraw.Draw(sheet)
    for j, filename in enumerate(rendered[start:start+8]):
        im = Image.open(filename)
        # Use individual PNGs for detailed review after scanning these contact sheets.
        im.thumbnail((277, 390))
        x = 15 + (j % 4) * 290
        y = 28 + (j // 4) * 425
        sheet.paste(im, (x, y))
        draw.text((x, y - 20), f"Page {start+j+1}", fill="black")
    sheet.save(TMP / f"review-{start//8+1:02}.png")

result = {
    "pages": len(doc),
    "exercise_page": ids["exercise"],
    "answer_page": ids["answer"],
    "source_hashes": "pass",
    "complete_embedded_programs_match_canonical_sources": "pass",
    "page_dimensions_text_and_placeholders": "pass",
    "arithmetic_node_checks_and_independent_exercise_answers": "pass",
    "quality_exercise_page": ids["qualityquestion"],
    "quality_answer_page": ids["qualityanswer"],
    "rendered_pages": len(rendered),
    "physical_test": "not performed",
}
(TMP / "verification.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result))
