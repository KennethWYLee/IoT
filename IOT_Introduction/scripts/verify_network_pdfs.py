"""Check and render the network lesson PDFs; no device or lesson code is run."""
from pathlib import Path
import json

import fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '_outputs/network_pdfs/review'
OUT.mkdir(parents=True, exist_ok=True)
manifest = json.loads((ROOT / 'IOT_Introduction/docs/network_pdf_manifest.json').read_text(encoding='utf-8'))
results = []
for entry in manifest['documents']:
    pdf = ROOT / entry['pdf']
    document = fitz.open(pdf)
    pictures = []
    warnings = []
    for index, page in enumerate(document):
        assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1
        text = page.get_text()
        assert '\ufffd' not in text, (pdf.name, index + 1, 'replacement glyph')
        assert len(text.strip()) > 20, (pdf.name, index + 1, 'blank page')
        for x0, y0, x1, y1, *rest in page.get_text('words'):
            assert 35 <= x0 <= x1 <= page.rect.width - 35, (pdf.name, index + 1, rest)
            bottom = page.rect.height - (6 if y0 > 800 else 45)
            assert 35 <= y0 <= y1 <= bottom, (pdf.name, index + 1, rest)
        for link in page.get_links():
            if link['kind'] == fitz.LINK_GOTO:
                assert 0 <= link['page'] < len(document)
            if link['kind'] == fitz.LINK_URI:
                assert link['uri'].startswith(('http://', 'https://', 'mailto:'))
        if len(text.strip()) < 120:
            warnings.append(index + 1)
        pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
        pix.save(OUT / f'{pdf.stem}-p{index+1:03}.png')
        picture = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
        picture.thumbnail((340, 480))
        pictures.append(picture)
    for start in range(0, len(pictures), 12):
        sheet = Image.new('RGB', (1050, 2020), '#d5dcde')
        draw = ImageDraw.Draw(sheet)
        for offset, picture in enumerate(pictures[start:start+12]):
            x, y = (offset % 3) * 350, (offset // 3) * 505
            draw.text((x+5,y+4),f'{pdf.stem} p{start+offset+1}',fill='black')
            sheet.paste(picture,(x+5,y+22))
        sheet.save(OUT / f'{pdf.stem}-contact-{start//12+1}.png')
    results.append({'pdf':entry['pdf'],'pages':len(document),'sparse_pages_to_review':warnings})
    print(json.dumps(results[-1]))
(OUT / 'checks.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
print('PASS: A4 dimensions, text bounds, replacement glyphs, links and full-page rendering.')
