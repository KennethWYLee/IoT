// Export the saved notebook content without executing code or contacting devices.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const manifestPath = path.join(root, 'IOT_Introduction/docs/notebook_pdf_manifest.json');
const scratch = path.join(root, '_outputs/notebook_pdfs');
const self = path.relative(root, __filename).replaceAll('\\', '/');
const text = value => Array.isArray(value) ? value.join('') : (value || '');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const digest = file => hash(/\.(ipynb|cjs|css|md|svg)$/.test(file)
  ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(file));
const relative = file => path.relative(root, file).replaceAll('\\', '/');

function notebooks() {
  return [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root })
    .toString('utf8').split('\0').filter(name => name.endsWith('.ipynb')))].sort();
}

function localFile(url, notebook) {
  const name = decodeURIComponent(url.split('#')[0]);
  const resolved = path.resolve(path.dirname(notebook), name);
  assert(!path.relative(root, resolved).startsWith('..'), `Outside repository: ${url}`);
  assert(fs.existsSync(resolved), `Missing asset/link: ${url}`);
  return resolved;
}

function imageData(url, cell, notebook, inputs) {
  if (url.startsWith('data:')) return url;
  if (url.startsWith('attachment:')) {
    const payload = cell.attachments?.[decodeURIComponent(url.slice(11))];
    assert(payload, `Missing attachment: ${url}`);
    const mime = Object.keys(payload).find(key => /^image\/(png|jpeg|svg\+xml)$/.test(key));
    assert(mime, `Unsupported attachment: ${url}`);
    return `data:${mime};base64,${text(payload[mime])}`;
  }
  assert(!/^https?:/i.test(url), `Remote image must be reviewed before export: ${url}`);
  const file = localFile(url, notebook);
  inputs[relative(file)] = digest(file);
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' }[path.extname(file).toLowerCase()];
  assert(mime, `Unsupported image: ${url}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}

function publicLink(url, notebook) {
  if (/^(https?:|mailto:|#)/i.test(url)) return url;
  const file = localFile(url, notebook);
  const anchor = url.includes('#') ? url.slice(url.indexOf('#')) : '';
  const target = relative(file).replace(/\.ipynb$/, '.pdf');
  return 'https://github.com/KennethWYLee/IoT/blob/main/' + target.split('/').map(encodeURIComponent).join('/') + anchor;
}

const style = `
@page { size: A4; margin: 17mm 15mm 18mm; }
* { box-sizing: border-box; }
body { color: #202a30; font: 10.5pt/1.6 "Microsoft JhengHei", "Noto Sans CJK TC", sans-serif; margin: 0; }
h1 { font-size: 21pt; line-height: 1.35; margin: 0 0 7mm; }
h2 { font-size: 15pt; border-bottom: 1px solid #bac9cb; padding-bottom: 2mm; margin: 9mm 0 4mm; }
h3 { font-size: 12pt; margin: 6mm 0 3mm; }
h4,h5,h6 { font-size: 10.5pt; margin: 4mm 0 2mm; }
h1,h2,h3,h4,h5,h6 { break-after: avoid; }
p { margin: 2.5mm 0; orphans: 3; widows: 3; }
ul,ol { padding-left: 6mm; margin: 3mm 0; }
li { margin: 1mm 0; }
a { color: #125c69; text-decoration: underline; overflow-wrap: anywhere; }
img { display: block; max-width: 100%; max-height: 205mm; width: auto; height: auto; margin: 4mm auto; object-fit: contain; break-inside: avoid; }
p:has(>img) { break-inside: avoid; }
pre { font: 8.3pt/1.5 Consolas,"Microsoft JhengHei",monospace; white-space: pre-wrap; overflow-wrap: anywhere; margin: 4mm 0; padding: 3mm; background: #f3f5f6; border-left: 2px solid #71888e; }
code { font-family: Consolas,"Microsoft JhengHei",monospace; overflow-wrap: anywhere; }
pre code { font: inherit; }
table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 4mm 0; font-size: 9pt; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th,td { border: 0.5pt solid #b6c3c7; padding: 1.8mm; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
th { background: #e9eff0; font-weight: 700; }
blockquote { border-left: 3px solid #b58b35; margin: 4mm 0; padding: 1mm 4mm; background: #faf8f1; }
hr { border: 0; border-top: 1px solid #ccd3d5; margin: 6mm 0; }
`;

async function renderNotebook(name, browser, marked) {
  const file = path.join(root, name);
  const nb = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(nb.nbformat, 4);
  const inputs = { [name]: digest(file), [self]: digest(__filename) };
  const fragments = [];
  let expectedImages = 0;
  for (const cell of nb.cells) {
    if (cell.cell_type === 'markdown') {
      const renderer = new marked.Renderer();
      renderer.image = function(token) {
        expectedImages++;
        return `<img alt="${escape(token.text)}" src="${imageData(token.href, cell, file, inputs)}">`;
      };
      renderer.link = function(token) {
        return `<a href="${escape(publicLink(token.href, file))}">${this.parser.parseInline(token.tokens)}</a>`;
      };
      fragments.push(marked.parse(text(cell.source), { renderer }));
    } else if (cell.cell_type === 'code') {
      fragments.push(`<pre><code>${escape(text(cell.source))}</code></pre>`);
      for (const output of cell.outputs || []) {
        if (output.output_type === 'stream') fragments.push(`<pre>${escape(text(output.text))}</pre>`);
        else if (output.data?.['image/png']) {
          fragments.push(`<img alt="Saved notebook output" src="data:image/png;base64,${text(output.data['image/png'])}">`);
          expectedImages++;
        } else if (output.data?.['text/plain']) fragments.push(`<pre>${escape(text(output.data['text/plain']))}</pre>`);
        else throw Error(`Unsupported saved output in ${name}; export stopped to avoid losing content.`);
      }
    } else throw Error(`Unsupported cell type: ${cell.cell_type}`);
  }
  const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="UTF-8"><style>${style}</style></head><body>${fragments.join('\n')}</body></html>`;
  const page = await browser.newPage({ viewport: { width: 680, height: 990 } });
  try {
    await page.route('**/*', route => route.abort());
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator('img').count(), expectedImages);
    // Resolve Markdown heading links while retaining explicit notebook anchors.
    const issues = await page.evaluate(() => {
      const used = new Set([...document.querySelectorAll('[id]')].map(el => el.id));
      for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
        if (h.id) continue;
        const base = h.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s+/g, '-');
        let id = base, n = 0;
        while (used.has(id)) id = base + '-' + (++n);
        h.id = id; used.add(id);
      }
      document.title = document.querySelector('h1')?.textContent || 'IoT';
      const badLinks = [...document.querySelectorAll('a[href^="#"]')].map(a => decodeURIComponent(a.getAttribute('href').slice(1))).filter(id => !document.getElementById(id));
      const overflow = [...document.querySelectorAll('pre,table,img,p,li')].filter(el => el.scrollWidth > el.clientWidth + 2).map(el => el.tagName);
      return { badLinks, overflow, title: document.title };
    });
    assert.deepEqual(issues.badLinks, [], `Broken internal links in ${name}`);
    assert.deepEqual(issues.overflow, [], `Horizontal clipping in ${name}`);
    const target = name.replace(/\.ipynb$/, '.pdf');
    await page.pdf({ path: path.join(root, target), preferCSSPageSize: true, printBackground: true,
      displayHeaderFooter: true, tagged: true, outline: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;padding:0 15mm;font:9px Arial;color:#606b70;display:flex;justify-content:space-between"><span>${escape(path.basename(target, '.pdf'))}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>` });
    fs.writeFileSync(path.join(scratch, path.basename(target, '.pdf') + '.html'), await page.content());
    console.log(`EXPORTED ${target}: ${nb.cells.length} cells, ${expectedImages} images`);
    return { notebook: name, pdf: target, pdf_sha256: digest(path.join(root, target)), inputs, cells: nb.cells.length, images: expectedImages };
  } finally { await page.close(); }
}

function check() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(manifest.documents.map(doc => doc.notebook), notebooks(), 'Notebook inventory changed; rebuild PDFs');
  for (const doc of manifest.documents) {
    for (const [name, expected] of Object.entries(doc.inputs)) assert.equal(digest(path.join(root, name)), expected, `Stale PDF input: ${name}`);
    const pdf = path.join(root, doc.pdf);
    assert.equal(digest(pdf), doc.pdf_sha256, `Changed/missing PDF: ${doc.pdf}`);
    assert(fs.readFileSync(pdf).subarray(0, 5).equals(Buffer.from('%PDF-')));
  }
  console.log(`PASS ${manifest.documents.length} PDF exports match notebooks, linked images, and exporter.`);
}

async function main() {
  if (process.argv.includes('--check')) return check();
  const marked = require('marked');
  const { chromium } = require('playwright');
  fs.mkdirSync(scratch, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const documents = [];
    for (const name of notebooks()) documents.push(await renderNotebook(name, browser, marked));
    fs.writeFileSync(manifestPath, JSON.stringify({ format: 1, browser: browser.version(), documents }, null, 2) + '\n');
  } finally { await browser.close(); }
  check();
}
main().catch(error => { console.error(error); process.exitCode = 1; });
