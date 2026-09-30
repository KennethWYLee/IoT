const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../../../..');
const answers = process.argv.includes('--answers');
const answerDir = path.resolve(__dirname, '../week2_answers');
const out = answers ? answerDir : __dirname;
const inputs = new Set([__filename]);
const read = file => { inputs.add(file); return fs.readFileSync(file); };
const digest = file => crypto.createHash('sha256').update(/\.(cjs|ino|css)$/.test(file)
  ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(file)).digest('hex');
const photo = name => `data:image/${name.endsWith('.png') ? 'png' : 'jpeg'};base64,${read(path.join(root, 'IOT_Introduction/docs/images/hardware/actual', name)).toString('base64')}`;
const reference = name => `data:image/png;base64,${read(path.join(__dirname, 'reference_images', name)).toString('base64')}`;
const page = (n, tag, title, lead, body) => `<section class="page"><header><span>ESP32-S3 硬體基礎</span><span>${tag}</span></header><main><h1>${title}</h1><p class="lead">${lead}</p>${body}</main><footer></footer></section>`;
const source = answers ? path.join(answerDir, 'current_lesson.cjs') : path.join(__dirname, 'exam_pages.cjs');
read(source);
// Main never loads private lessons or answer sketches.
if (answers) {
  for (const name of ['week2_hello_serial', 'week2_button_state', 'week2_button_count']) {
    read(path.join(answerDir, 'programs', name, `${name}.ino`));
  }
}
const pages = require(source)({page, photo, reference}).map((p, i, all) => p.replace('<footer></footer>',
  `<footer><span>Week 2 · ${answers ? '教學與解答' : '一顆按鈕計數'}</span><span>${i + 1} / ${all.length}</span></footer>`));
const css = read(path.join(__dirname, 'print.css')).toString();
const htmlFile = path.join(out, answers ? 'week2Ans.html' : 'Week2_main_layout_sample.html');
const pdfFile = answers ? path.join(answerDir, 'week2Ans.pdf') : path.join(root, 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf');
fs.writeFileSync(htmlFile, `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 2 一顆按鈕計數</title><style>${css}</style></head><body>${pages.join('')}</body></html>`);
(async () => {
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const tab = await browser.newPage();
    await tab.goto(pathToFileURL(htmlFile).href);
    await tab.emulateMedia({media: 'print'});
    await tab.evaluate(() => document.fonts.ready);
    const audit = await tab.evaluate(() => ({
      images: [...document.images].map(i => ({loaded: i.complete && i.naturalWidth > 0})),
      pages: [...document.querySelectorAll('.page')].map((p, i) => {
        const m = p.querySelector('main'), f = p.querySelector('footer');
        const bounds = m.getBoundingClientRect();
        const walker = document.createTreeWalker(m, NodeFilter.SHOW_TEXT);
        const outside = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (r.left < bounds.left - 1 || r.right > bounds.right + 1) outside.push(node.textContent.trim());
          }
        }
        return {page: i + 1, overflow: m.scrollHeight > m.clientHeight + 1,
          horizontalOverflow: [...new Set(outside)],
          gap: f.getBoundingClientRect().top - m.lastElementChild.getBoundingClientRect().bottom};
      })
    }));
    const checks = path.join(out, 'checks');
    fs.mkdirSync(checks, {recursive: true});
    fs.writeFileSync(path.join(checks, 'layout_check.json'), JSON.stringify(audit, null, 2) + '\n');
    if (audit.images.some(i => !i.loaded) || audit.pages.some(p => p.overflow || p.horizontalOverflow.length || p.gap < 8)) throw Error(JSON.stringify(audit));
    await tab.pdf({path: pdfFile, format: 'A4', printBackground: true, preferCSSPageSize: true});
    if (!answers) fs.copyFileSync(pdfFile, path.join(__dirname, 'Week2_main_layout_sample.pdf'));
    fs.writeFileSync(path.join(checks, answers ? 'published_answers.json' : 'published_main.json'), JSON.stringify({
      pdf: path.relative(root, pdfFile).replaceAll('\\', '/'), pages: pages.length,
      pdf_sha256: digest(pdfFile),
      inputs: Object.fromEntries([...inputs].sort().map(f => [path.relative(root, f).replaceAll('\\', '/'), digest(f)]))
    }, null, 2) + '\n');
    console.log(JSON.stringify({pdf: pdfFile, ...audit}, null, 2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
