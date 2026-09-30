"""Check the cumulative Week 3 sources and render every current PDF page."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import sys
from PIL import Image, ImageDraw
from pypdf import PdfReader

BUILDER = Path(__file__).resolve().parent
ANSWERS = "--answers" in sys.argv
HERE = BUILDER.parent / "week3_answers" if ANSWERS else BUILDER
STEM = "week3Ans" if ANSWERS else "week3_main"
COURSE = BUILDER.parents[2]
manifest = json.loads((HERE / "build_manifest.json").read_text(encoding="utf-8"))

def sha(path):
    data = path.read_bytes()
    if path.suffix in (".md", ".cjs", ".ino"):
        data = data.replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()

assert sha(HERE / f"{STEM}.md") == manifest["sourceSha256"]
assert sha(BUILDER / "build.cjs") == manifest["builderSha256"]
assert sha(HERE / f"{STEM}.pdf") == manifest["pdfSha256"]
for item in manifest["sketches"]:
    assert sha(COURSE / item["path"]) == item["sha256"]
for item in manifest["photos"]:
    assert sha(COURSE / "docs/images/hardware/actual" / item["name"]) == item["sha256"]
source = (HERE / f"{STEM}.md").read_text(encoding="utf-8")
html = (HERE / f"{STEM}.html").read_text(encoding="utf-8")
doc = PdfReader(HERE / f"{STEM}.pdf")
text = "\n".join(page.extract_text() for page in doc.pages)
assert len(doc.pages) == len(manifest["pages"])
assert all(token not in text for token in ("{{", "\ufffd", "**"))
assert 'class="fullcode"' not in html
assert "{{program:" not in source
ids = [p["id"] for p in manifest["pages"]]
assert re.findall(r"^### (Q[123])", source, re.M) == ["Q1", "Q2", "Q3"]
if ANSWERS:
    assert ids == ["start", "oledwire", "fixedsettings", "fixedresult", "lightwire",
                   "lightresult", "allwiring", "snapshotresult", "adctheory",
                   "savetheory", "answers"]
    for sketch in ("oled_fixed_text", "oled_light", "oled_light_snapshot"):
        assert f"{sketch}/{sketch}.ino" in source
        sketch_source = (HERE / "programs" / sketch / f"{sketch}.ino").read_text()
        assert "PROFILE_CONFIRMED = false" in sketch_source
        assert "OLED_CONTROLLER 1306" in sketch_source
        assert "OLED_CONTROLLER == 1315" in sketch_source
        assert "Wire.begin(PIN_SDA, PIN_SCL, 100000)" in sketch_source
    assert "e20、f20、e22、f22" in source and "d3→a22" in source
    assert "0.720 V" in source and "lux" in source
    assert "savedRaw = raw" in source
else:
    assert ids == ["goal", "tests", "questions"]
    assert not re.search(r"GPIO|\.ino|PROFILE_CONFIRMED|savedRaw|參考答案|week3_answers", source)
    assert not manifest["sketches"] and not manifest["photos"]
    assert "畫面示例" in source and "LAST ---" in source and "SAVED 0" in source
    assert source.count('<div class="write-space"') == 3
    assert chr(96) * 3 not in source

audit = json.loads((HERE / "tmp/layout_check.json").read_text(encoding="utf-8"))
assert all(not p["overflow"] and p["gap"] >= 8 and not p["horizontal"]
           and not p["svgText"] for p in audit["pages"])
assert all(i["loaded"] for i in audit["images"])
poppler = shutil.which("pdftoppm")
if not poppler:
    raise SystemExit("pdftoppm not found; no render pass claimed")
out = HERE / "tmp/cumulative_render"
out.mkdir(parents=True, exist_ok=True)
subprocess.run([poppler, "-r", "120", "-png", str(HERE / f"{STEM}.pdf"),
                str(out / "page")], check=True)
paths = sorted(out.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
assert len(paths) == len(doc.pages)
for offset in range(0, len(paths), 6):
    group = paths[offset:offset + 6]
    sheet = Image.new("RGB", (1260, 650 * ((len(group) + 2) // 3)), "white")
    draw = ImageDraw.Draw(sheet)
    for i, path in enumerate(group):
        im = Image.open(path).convert("RGB")
        assert im.getextrema() != ((255, 255), (255, 255), (255, 255))
        im.thumbnail((410, 610))
        x, y = (i % 3) * 420, (i // 3) * 650
        sheet.paste(im, (x, y + 25))
        draw.text((x + 12, y + 5), f"{STEM} page {offset + i + 1}", fill="black")
    sheet.save(out / f"contact-{offset // 6 + 1}.png")
result = {"pdf": str(HERE / f"{STEM}.pdf"), "pages": len(paths),
          "sha256": sha(HERE / f"{STEM}.pdf"), "rendered_every_page": True,
          "layout_audit_passed": True,
          "manual_visual_review": "passed" if "--visual-reviewed" in sys.argv else "pending",
          "physical_test": False}
(HERE / "tmp/cumulative_document_checks.json").write_text(
    json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps(result))
