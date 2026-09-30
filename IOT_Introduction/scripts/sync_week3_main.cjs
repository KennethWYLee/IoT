// Publish the maintained Week 3 question paper at its weekly reading entry.
// No code cells, answer sources, network requests, or hardware operations.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const draft = path.join(root, 'IOT_Introduction/docs/teaching_drafts/week3_redesign');
const weekly = path.join(root, 'IOT_Introduction/Week_03_Electrical_Measurement_and_ADC');
const source = 'IOT_Introduction/docs/teaching_drafts/week3_redesign/week3_main.md';
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const normalize = text => text.replace(/\r\n/g, '\n');
async function main() {
  const check = process.argv.includes('--check');
  const markdown = normalize(fs.readFileSync(path.join(root, source), 'utf8'));
  const html = fs.readFileSync(path.join(draft, 'week3_main.html'), 'utf8');
  const pdf = fs.readFileSync(path.join(draft, 'week3_main.pdf'));
  const manifest = JSON.parse(fs.readFileSync(path.join(draft, 'build_manifest.json'), 'utf8'));
  assert.equal(hash(markdown), manifest.sourceSha256, 'Rebuild maintained Main first');
  assert.equal(hash(normalize(fs.readFileSync(path.join(draft, 'build.cjs'), 'utf8'))), manifest.builderSha256);
  assert.equal(hash(pdf), manifest.pdfSha256);
  assert(!/\{\{program:|week3_answers|參考答案/.test(markdown));
  const parts = [...markdown.matchAll(/<!-- page: (\w+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
  assert.deepEqual(parts.map(p => p[1]), manifest.pages.map(p => p.id));
  const cells = [];
  for (const [index, part] of parts.entries()) {
    const attachments = {};
    let body = part[3];
    for (const match of body.matchAll(/\{\{diagram:(\w+)\}\}/g)) {
      const figure = new RegExp('<figure class="diagram" aria-label="' + match[1] + '">([\\s\\S]*?)</figure>').exec(html);
      assert(figure, 'Missing diagram ' + match[1]);
      const png = await require('sharp')(Buffer.from(figure[1])).resize({width:1300}).flatten({background:'#ffffff'}).png().toBuffer();
      const name = match[1] + '.png';
      attachments[name] = {'image/png':png.toString('base64')};
      body = body.replace(match[0], `![Q3：3.3 V 電源、兩顆串聯電阻、電流方向與電壓作答空格](attachment:${name})`);
    }
    body = body.replace(/<aside class="safety">([\s\S]*?)<\/aside>/g, (_, text) => '> ' + text)
      .replace(/<div class="write-space" style="height:\d+mm"><\/div>/g, '\n__________________________\n\n__________________________\n');
    const cell = {cell_type:'markdown',id:part[1],metadata:{},source:(`<a id="${part[1]}"></a>\n\n` + body.trim() + '\n').match(/.*\n/g)};
    if (Object.keys(attachments).length) cell.attachments = attachments;
    cells.push(cell);
  }
  const notebook = JSON.stringify({cells,metadata:{language_info:{name:'markdown'},course_source:source,source_sha256:hash(markdown)},nbformat:4,nbformat_minor:5},null,1)+'\n';
  const nbPath = path.join(weekly,'week3_main.ipynb'), pdfPath = path.join(weekly,'week3_main.pdf');
  if (check) {
    assert.equal(normalize(fs.readFileSync(nbPath,'utf8')), notebook, 'Run sync_week3_main.cjs');
    assert(fs.readFileSync(pdfPath).equals(pdf), 'Weekly PDF differs from maintained Main');
  } else {
    fs.writeFileSync(nbPath,notebook);
    fs.copyFileSync(path.join(draft,'week3_main.pdf'),pdfPath);
  }
  console.log(`PASS Week 3: ${cells.length} question pages; weekly PDF identical to maintained Main; no answer/code cells.`);
}
main().catch(error => { console.error(error); process.exitCode=1; });
