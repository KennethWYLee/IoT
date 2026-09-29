"""Check maintained paginated lessons and optionally render every page with Poppler."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import subprocess
import sys
import fitz
from PIL import Image, ImageDraw

COURSE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("week", type=int)
parser.add_argument("--answers", action="store_true")
parser.add_argument("--render", action="store_true")
args = parser.parse_args()
w = args.week
directory = COURSE / "docs/teaching_drafts" / f"week{w}_{'answers' if args.answers else 'redesign'}"
stem = f"week{w}Ans" if args.answers else f"week{w}_main"
manifest = json.loads((directory / "build_manifest.json").read_text(encoding="utf-8"))
def digest(p, text=False):
    value = p.read_text(encoding="utf-8").replace("\r\n", "\n").encode() if text else p.read_bytes()
    return hashlib.sha256(value).hexdigest()
assert digest(directory / f"{stem}.md", True) == manifest["sourceSha256"]
assert digest(directory / f"{stem}.pdf") == manifest["pdfSha256"]
builder = directory.parent / f"week{w}_redesign/build.cjs"
assert digest(builder, True) == manifest["builderSha256"]
md = (directory / f"{stem}.md").read_text(encoding="utf-8")
if not args.answers:
    assert not re.search(r"<!-- page: (?:answer|qualityanswer|buildanswer) \|", md), "Answer page in Main"
    assert not re.search(r"\]\([^)]*week\d+_answers", md), "Private answer link in Main"
for sketch in manifest["sketches"]:
    assert digest(COURSE / sketch["path"], True) == sketch["sha256"], sketch["path"]
for photo in manifest["photos"]:
    assert digest(COURSE / "docs/images/hardware/actual" / photo["name"]) == photo["sha256"]
html = (directory / f"{stem}.html").read_text(encoding="utf-8")
from bs4 import BeautifulSoup
soup = BeautifulSoup(html, "html.parser")
embedded = "\n".join(p.get_text() for p in soup.select("pre.fullcode"))
for sketch in manifest["sketches"]:
    code = (COURSE / sketch["path"]).read_text(encoding="utf-8").strip()
    assert code in embedded, f"Incomplete embedded sketch: {sketch['path']}"
if args.answers:
    assert not manifest["sketches"] and not embedded, "Complete programs belong in programs/"
    subprocess.run([sys.executable, str(COURSE / "scripts/verify_answer_programs.py"), str(w)], check=True)
ids = {node["id"] for node in soup.select("section[id]")}
assert len(ids) == len(soup.select("section[id]")), "Duplicate anchor"
for link in soup.select('a[href^="#"]'):
    assert link["href"][1:] in ids, link["href"]
doc = fitz.open(directory / f"{stem}.pdf")
assert len(doc) == len(manifest["pages"])
pages = []
for i, page in enumerate(doc):
    text = page.get_text()
    assert len(text.strip()) > 20 and "\ufffd" not in text
    bad = [tuple(span["bbox"]) for block in page.get_text("dict")["blocks"] if "lines" in block
           for line in block["lines"] for span in line["spans"]
           if span["bbox"][0] < 0 or span["bbox"][2] > page.rect.width+1
           or span["bbox"][1] < 0 or span["bbox"][3] > page.rect.height+1]
    assert not bad, (i+1, bad)
    pages.append({"page":i+1,"id":manifest["pages"][i]["id"],"text_bounds":"pass"})
out = directory / "tmp"
out.mkdir(exist_ok=True)
if args.render:
    poppler = Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe"
    render = out / "render" / manifest["pdfSha256"][:12]
    render.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(poppler),"-scale-to","1000","-png",str(directory/f"{stem}.pdf"),str(render/"page")],check=True)
    files = sorted(render.glob("page-*.png"))
    assert len(files) == len(doc)
    for start in range(0,len(files),8):
        sheet = Image.new("RGB",(1400,1030),"#d8e0e2")
        draw = ImageDraw.Draw(sheet)
        for j,f in enumerate(files[start:start+8]):
            im = Image.open(f).convert("RGB");im.thumbnail((340,480))
            x=(j%4)*350+5;y=(j//4)*510+25
            sheet.paste(im,(x,y));draw.text((x,y-18),f"p{start+j+1}",fill="black")
        sheet.save(out/f"contact-{start//8+1:02d}.jpg")
(out/"verification.json").write_text(json.dumps({"week":w,"answers":args.answers,
    "pages":pages,"rendered":args.render,"physical_test":False},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"PASS Week{w} {'Ans' if args.answers else 'Main'}: {len(doc)} pages; source/code/anchors/bounds; render={args.render}")
