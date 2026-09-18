// Render the maintained network lessons without executing sketches or services.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
const scratch = path.join(root, '_outputs/network_pdfs');
const manifestPath = path.join(root, 'IOT_Introduction/docs/network_pdf_manifest.json');
const lessons = [
  [11, 'Week_11_HTTP_WebSocket_Backend'],
  [12, 'Week_12_MQTT_Database_and_Logs'],
  [14, 'Week_14_Mobile_PWA'],
  [15, 'Week_15_Automation_and_Safety'],
].map(([week, folder]) => `IOT_Introduction/${folder}/week${week}_main.md`);
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const digest = file => crypto.createHash('sha256').update(/\.(md|cjs|svg)$/.test(file)
  ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(file)).digest('hex');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const style = `
@page { size:A4; margin:17mm 15mm 18mm; }
* { box-sizing:border-box; }
body { color:#202a30; font:10.5pt/1.6 "Microsoft JhengHei","Noto Sans CJK TC",sans-serif; margin:0; }
h1 { font-size:21pt; line-height:1.35; margin:0 0 7mm; }
h2 { font-size:15pt; border-bottom:1px solid #bac9cb; padding-bottom:2mm; margin:8mm 0 4mm; }
h3 { font-size:12pt; margin:6mm 0 3mm; }
h4,h5,h6 { font-size:10.5pt; margin:4mm 0 2mm; }
h1,h2,h3,h4,h5,h6 { break-after:avoid; }
h2.appendix { break-before:page; }
p { margin:2.5mm 0; orphans:3; widows:3; }
ul,ol { padding-left:6mm; margin:3mm 0; }
li { margin:1mm 0; orphans:2; widows:2; }
a { color:#125c69; text-decoration:underline; overflow-wrap:anywhere; }
img { display:block; max-width:100%; max-height:100mm; width:auto; height:auto; margin:3mm auto; object-fit:contain; break-inside:avoid; }
pre { font:8.3pt/1.5 Consolas,"Microsoft JhengHei",monospace; white-space:pre-wrap; overflow-wrap:anywhere; margin:4mm 0; padding:3mm; background:#f3f5f6; border-left:2px solid #71888e; }
code { font-family:Consolas,"Microsoft JhengHei",monospace; overflow-wrap:anywhere; }
pre code { font:inherit; }
pre.short-code { break-inside:avoid; }
table { border-collapse:collapse; table-layout:fixed; width:100%; margin:4mm 0; font-size:9pt; }
thead { display:table-header-group; }
tr { break-inside:avoid; }
th,td { border:0.5pt solid #b6c3c7; padding:1.8mm; text-align:left; vertical-align:top; overflow-wrap:anywhere; }
th { background:#e9eff0; }
blockquote { border-left:3px solid #b58b35; margin:4mm 0; padding:1mm 4mm; }
hr { border:0; border-top:1px solid #ccd3d5; margin:6mm 0; }
`;

function resolveLocal(href, source) {
  const target = path.resolve(path.dirname(source), decodeURIComponent(href.split('#')[0]));
  assert(!path.relative(root, target).startsWith('..'), `Outside repository: ${href}`);
  assert(fs.existsSync(target), `Missing local file: ${href}`);
  return target;
}

function check() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(manifest.documents.map(d => d.source), lessons);
  for (const doc of manifest.documents) {
    for (const [name, expected] of Object.entries(doc.inputs)) {
      assert.equal(digest(path.join(root, name)), expected, `Stale input: ${name}`);
    }
    assert.equal(digest(path.join(root, doc.pdf)), doc.pdf_sha256, `Changed PDF: ${doc.pdf}`);
    assert(fs.readFileSync(path.join(root, doc.pdf)).subarray(0, 5).equals(Buffer.from('%PDF-')));
  }
  console.log(`PASS: ${manifest.documents.length} network PDFs match sources, images and exporter.`);
}

async function main() {
  if (process.argv.includes('--check')) return check();
  const marked = require('marked');
  const {chromium} = require('playwright');
  fs.mkdirSync(scratch, {recursive:true});
  const browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || 'msedge'});
  const documents = [];
  try {
    for (const name of lessons) {
      const file = path.join(root, name);
      const inputs = {[name]:digest(file), [relative(__filename)]:digest(__filename)};
      let imageCount = 0;
      const renderer = new marked.Renderer();
      renderer.image = token => {
        assert(!/^(https?:|data:)/i.test(token.href), 'Only reviewed local images are allowed');
        const asset = resolveLocal(token.href, file);
        const mime = {'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'}[path.extname(asset).toLowerCase()];
        assert(mime, `Unsupported image: ${asset}`);
        inputs[relative(asset)] = digest(asset); imageCount++;
        return `<img alt="${escape(token.text)}" src="data:${mime};base64,${fs.readFileSync(asset).toString('base64')}">`;
      };
      renderer.link = function(token) {
        let href = token.href;
        if (!/^(https?:|mailto:|#)/i.test(href)) {
          const target = resolveLocal(href, file);
          const anchor = href.includes('#') ? href.slice(href.indexOf('#')) : '';
          href = 'https://github.com/KennethWYLee/IoT/blob/main/' + relative(target).split('/').map(encodeURIComponent).join('/') + anchor;
        }
        return `<a href="${escape(href)}">${this.parser.parseInline(token.tokens)}</a>`;
      };
      const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>${style}</style></head><body>${marked.parse(fs.readFileSync(file,'utf8'),{renderer})}</body></html>`;
      const page = await browser.newPage({viewport:{width:680,height:990}});
      try {
        await page.route('**/*', route => route.abort());
        await page.setContent(html, {waitUntil:'load'});
        await page.emulateMedia({media:'print'});
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
        const layout = await page.evaluate(() => {
          for (const pre of document.querySelectorAll('pre')) {
            if (pre.getBoundingClientRect().height <= 300) pre.classList.add('short-code');
          }
          const used = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
          for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
            if (h.tagName === 'H2' && h.textContent.startsWith('附錄')) h.classList.add('appendix');
            if (h.id) continue;
            const base = h.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s+/g,'-');
            let id = base, n = 0;
            while(used.has(id)) id = base + '-' + (++n);
            h.id = id; used.add(id);
          }
          const badLinks = [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)))).map(a=>a.getAttribute('href'));
          const overflow = [...document.querySelectorAll('pre,table,img,p,li')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.tagName);
          document.title = document.querySelector('h1').textContent;
          return {badLinks,overflow,images:document.images.length};
        });
        assert.deepEqual(layout.badLinks, [], `${name}: broken anchors`);
        assert.deepEqual(layout.overflow, [], `${name}: horizontal overflow`);
        assert.equal(layout.images, imageCount);
        const pdf = name.replace(/\.md$/, '.pdf');
        await page.pdf({path:path.join(root,pdf), preferCSSPageSize:true, printBackground:true,
          displayHeaderFooter:true, tagged:true, outline:true, headerTemplate:'<span></span>',
          footerTemplate:`<div style="width:100%;padding:0 15mm;font:9px Arial;color:#606b70;display:flex;justify-content:space-between"><span>${escape(path.basename(pdf,'.pdf'))}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`});
        fs.writeFileSync(path.join(scratch,path.basename(pdf,'.pdf')+'.html'),await page.content());
        documents.push({source:name,pdf,pdf_sha256:digest(path.join(root,pdf)),inputs,images:imageCount});
        console.log(`EXPORTED ${pdf} (${imageCount} images)`);
      } finally {await page.close();}
    }
    fs.writeFileSync(manifestPath,JSON.stringify({format:1,browser:browser.version(),documents},null,2)+'\n');
  } finally {await browser.close();}
  check();
}
main().catch(error=>{console.error(error);process.exitCode=1;});
