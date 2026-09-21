"""Inventory and render the maintained practical lessons without running devices."""
import argparse
import hashlib
import json
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
COURSE = ROOT / "IOT_Introduction"
TARGETS = {
    2: "Week_02_ESP32_Hardware_Basics/week2_main.pdf",
    **{n: f"docs/teaching_drafts/week{n}_redesign/week{n}_main.pdf" for n in range(3, 8)},
    11: "Week_11_HTTP_WebSocket_Backend/week11_main.pdf",
    12: "Week_12_MQTT_Database_and_Logs/week12_main.pdf",
    14: "Week_14_Mobile_PWA/week14_main.pdf",
    15: "Week_15_Automation_and_Safety/week15_main.pdf",
}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--render", action="store_true")
    parser.add_argument("--weeks", nargs="*", type=int, default=list(TARGETS))
    args = parser.parse_args()
    output = ROOT / "_outputs" / "lesson_review"
    output.mkdir(parents=True, exist_ok=True)
    for week in args.weeks:
        source = COURSE / TARGETS[week]
        folder = output / f"week{week:02}"
        folder.mkdir(exist_ok=True)
        records, texts, thumbnails = [], [], []
        with fitz.open(source) as pdf:
            for number, page in enumerate(pdf, 1):
                text = page.get_text(sort=True)
                texts.append(f"\n===== PAGE {number} =====\n{text}")
                outside = [list(b[:4]) for b in page.get_text("blocks")
                           if b[4].strip() and not page.rect.contains(fitz.Rect(b[:4]))]
                records.append({"page": number, "text_sha256": hashlib.sha256(text.encode()).hexdigest(),
                                "outside_page": outside, "replacement_glyph": "\ufffd" in text,
                                "links": [link.get("uri", "") for link in page.get_links()]})
                if args.render:
                    pix = page.get_pixmap(matrix=fitz.Matrix(1.25, 1.25), alpha=False)
                    pix.save(str(folder / f"page-{number:03}.png"))
                    tile = Image.new("RGB", (600, 874), "#d0d0d0")
                    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                    img.thumbnail((595, 842))
                    tile.paste(img, (2, 28))
                    ImageDraw.Draw(tile).text((10, 7), f"Week {week} | Page {number}", fill="black")
                    thumbnails.append(tile)
            if args.render:
                for first in range(0, len(thumbnails), 9):
                    sheet = Image.new("RGB", (1800, 2622), "#aaa")
                    for index, tile in enumerate(thumbnails[first:first + 9]):
                        sheet.paste(tile, ((index % 3) * 600, (index // 3) * 874))
                    sheet.save(folder / f"sheet-{first // 9 + 1:02}.png")
        (folder / "text.txt").write_text("".join(texts), encoding="utf-8")
        manifest = {"source": str(source.relative_to(ROOT)),
                    "sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "pages": records}
        (folder / "pages.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Week {week}: {len(records)} pages; {sum(bool(p['outside_page']) for p in records)} outside-page warnings")


if __name__ == "__main__":
    main()
