from pathlib import Path
from PIL import Image, ImageDraw
import fitz

root = Path(__file__).resolve().parent / 'tmp'
page_count = len(fitz.open(root.parent / 'Week2_main_layout_sample.pdf'))
for group in range((page_count + 3) // 4):
    canvas = Image.new('RGB', (1100, 1630), '#d7dde0')
    draw = ImageDraw.Draw(canvas)
    for index in range(4):
        number = group * 4 + index + 1
        if number > page_count:
            continue
        item = Image.open(root / f'from_zero-{number:02}.png').convert('RGB')
        item.thumbnail((530, 775))
        x, y = (index % 2) * 550 + 10, (index // 2) * 815 + 30
        draw.text((x, y - 20), f'Page {number}', fill='black')
        canvas.paste(item, (x, y))
    canvas.save(root / f'zero_contact_{group + 1}.png')
