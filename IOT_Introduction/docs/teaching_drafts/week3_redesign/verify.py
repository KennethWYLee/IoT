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
def sha(p):
    data = p.read_bytes()
    if p.suffix in (".md", ".cjs", ".ino"):
        data = data.replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()

assert manifest["textHashLineEndings"] == "LF"
assert sha(HERE / "week3_main.md") == manifest["sourceSha256"]
assert sha(HERE / "build.cjs") == manifest["builderSha256"]
assert sha(HERE / "week3_main.pdf") == manifest["pdfSha256"]
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
parser.feed((HERE / "week3_main.html").read_text(encoding="utf-8"))
expected = "\n".join((COURSE / item["path"]).read_text(encoding="utf-8").rstrip()
                     for item in manifest["sketches"])
assert "\n".join(parser.blocks) == expected

doc = fitz.open(HERE / "week3_main.pdf")
assert len(doc) == len(manifest["pages"])
ids = {p["id"]: p["number"] for p in manifest["pages"]}
assert ids["answer"] == ids["exercise"] + 1
assert ids["buildanswer"] == ids["buildexercise"] + 1
all_text = "\n".join(p.get_text() for p in doc)
assert "\ufffd" not in all_text
assert "{{" not in all_text
assert "**" not in all_text
assert "720" in doc[ids["answer"] - 1].get_text()
assert "4095" in doc[ids["answer"] - 1].get_text()
assert math.isclose(3.3 * 1000 / 11000, 0.3)
assert math.isclose(3.3 * 10000 / 11000, 3.0)
assert math.isclose(3.3 / 11000, 0.0003)
assert math.isclose(3.3 / 330, 0.01)
assert (440 + 1000) // 2 == 720
assert (320 + 900) // 2 == 610

# Breadboard connectivity is independently represented by (bank, row).
def node(hole):
    return ("left" if hole[0] in "abcde" else "right", int(hole[1:]))

assert node("a3") == node("e3") != node("a6")
assert node("a15") == node("c15") == node("e15")
assert node("c23") == node("d23") == node("e23")
assert node("c20") != node("c23")
assert node("d23") != node("d26")
assert node("a15") != node("f15")

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
    "hands_on_exercise_page": ids["buildexercise"],
    "hands_on_answer_page": ids["buildanswer"],
    "source_hashes": "pass",
    "complete_embedded_programs_match_canonical_sources": "pass",
    "page_dimensions_text_and_placeholders": "pass",
    "circuit_arithmetic_and_node_checks": "pass",
    "rendered_pages": len(rendered),
    "physical_test": "not performed",
}
(TMP / "verification.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result))
