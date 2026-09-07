// Shared, deterministic equipment galleries. No photo is generated or retouched.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const base = path.join(root, 'IOT_Introduction/docs/images/hardware');
const catalog = JSON.parse(fs.readFileSync(path.join(base, 'photo_catalog.json'), 'utf8'));
const start = '<!-- hardware-gallery:start -->';
const end = '<!-- hardware-gallery:end -->';
const normalize = s => s.replace(/\r\n/g, '\n');
const lines = s => s.match(/.*\n|.+$/g) || [];
const relative = (from, to) => path.relative(path.dirname(from), to).replaceAll('\\', '/');

function lessonPath(week) {
  const directory = fs.readdirSync(path.join(root, 'IOT_Introduction')).filter(n => n.startsWith(`Week_${String(week).padStart(2, '0')}_`));
  assert.equal(directory.length, 1);
  return path.join(root, 'IOT_Introduction', directory[0], `week${week}_main.${week >= 2 && week <= 7 ? 'ipynb' : 'md'}`);
}
function selectedPhotos(week, id) {
  const component = catalog.components[id];
  // Week 2 uses MM/MF. The FF connector appears when its task starts in Week 4.
  return component.photos.filter(p => !p.extra && !(id === 'JumperWire' && [2,3].includes(Number(week)) && p.file.includes('_FF_')));
}
function gallery(week, document) {
  const lesson = catalog.weeks[week]; assert(lesson);
  let s = `${start}\n<a id="equipment-photos"></a>\n\n### ${Number(week) === 1 ? '採購零件外觀' : '本週器材外觀'}\n\n${lesson.task}\n\n`;
  s += (lesson.intro ?? '照片下方標示拍攝角度與來源。先辨認零件，再依本週器材表與接線步驟操作；照片本身不是接線指令，也不表示已完成電氣驗證。') + '\n\n';
  s += lesson.parts.map(id => `[${catalog.components[id].name.split('（')[0].trim()}](#equipment-${id.toLowerCase()})`).join(' · ') + '\n\n';
  for (const id of lesson.parts) {
    const part = catalog.components[id];
    s += `<a id="equipment-${id.toLowerCase()}"></a>\n\n#### ${part.name}\n\n${lesson.notes?.[id] ?? part.note}\n\n`;
    const photos = selectedPhotos(week, id);
    for (let i = 0; i < photos.length; i += 2) {
      const row = photos.slice(i, i + 2);
      s += '| ' + row.map(p => `${p.kind}：${p.view}`).join(' | ') + ' |\n';
      s += '| ' + row.map(() => '---').join(' | ') + ' |\n';
      s += '| ' + row.map(p => `![${part.name}；${p.kind}；${p.view}](${relative(document, path.join(base, p.file))})`).join(' | ') + ' |\n\n';
    }
    const extras = part.photos.filter(p => p.extra);
    if (extras.length) s += '其他留存角度：' + extras.map(p => `[${p.view}](${relative(document, path.join(base, p.file))})`).join('；') + '。\n\n';
  }
  return s + end;
}
function imageCount(week) {
  return catalog.weeks[week].parts.reduce((n, id) => n + selectedPhotos(week,id).length, 0);
}
function expand(source, file) {
  return source.replace(/<!-- hardware-gallery:(\d+) -->/g, (_, week) => gallery(week, file));
}
function replaceBlock(source, block) {
  const first = source.indexOf(start), last = source.indexOf(end);
  if (first < 0) { assert.equal(last, -1); return null; }
  assert(last > first && source.indexOf(start, first + start.length) < 0, 'Duplicate gallery');
  return source.slice(0, first) + block + source.slice(last + end.length);
}
function embedded(week, file) {
  // Full-resolution photos are shared relative assets, not duplicated base64.
  // Existing operational diagrams/photos keep their original attachments.
  return {source: gallery(week, file), attachments: {}};
}
function rebaseGallery(source, from, to) {
  if (!source.includes(start)) return null;
  return source.replace(/(!?\[[^\]]+\])\(([^)]+)\)/g, (match,label,url) => {
    if (/^(https?:|#|attachment:)/.test(url)) return match;
    return `${label}(${relative(to,path.resolve(path.dirname(from),url))})`;
  });
}
function verifyPhotoReference(source, url, file) {
  assert(source.includes(start), 'Only the shared gallery uses relative photos');
  const full = path.resolve(path.dirname(file),url);
  const photo = Object.values(catalog.components).flatMap(p=>p.photos).find(p=>path.join(base,p.file)===full);
  assert(photo, `Uncatalogued gallery photo: ${url}`);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'),photo.sha256);
}
function inlineLocalPhotos(source, file) {
  // Preview-only substitution; published documents keep their relative paths.
  return source.replace(/(!\[[^\]]+\])\(([^)]+)\)/g,(match,label,url)=>{
    if (/^(https?:|attachment:|data:)/.test(url)) return match;
    const full=path.resolve(path.dirname(file),url);
    const mime=full.endsWith('.png')?'image/png':'image/jpeg';
    return `${label}(data:${mime};base64,${fs.readFileSync(full).toString('base64')})`;
  });
}
function artifact(file, text, check) {
  if (check) assert.equal(normalize(fs.readFileSync(file, 'utf8')), text, `Stale gallery: ${file}`);
  else fs.writeFileSync(file, text);
}
function sync(check) {
  const names = new Set(); let count = 0;
  for (const part of Object.values(catalog.components)) for (const photo of part.photos) {
    const full = path.join(base, photo.file), name = path.basename(full);
    assert(!names.has(name), `Duplicate filename: ${name}`); names.add(name);
    assert(fs.existsSync(full), full);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex'), photo.sha256, `Photo changed: ${full}`);
    if (photo.file.startsWith('actual/')) assert(/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)*_\d+\.(jpg|png)$/.test(name), name);
    count++;
  }
  for (const week of Object.keys(catalog.weeks).map(Number)) {
    const file = lessonPath(week);
    if (week >= 4 && week <= 7) {
      const source = fs.readFileSync(path.join(root, `IOT_Introduction/docs/course_materials/week${week}_main.source.md`),'utf8');
      assert.equal((source.match(new RegExp(`<!-- hardware-gallery:${week} -->`, 'g')) || []).length, 1);
      if (check) {
        const nb = JSON.parse(fs.readFileSync(file, 'utf8'));
        const cell = nb.cells.find(c => c.source.join('').includes(start));
        const expected = embedded(week, file); assert(cell, file);
        assert.equal(cell.source.join('').trim(), expected.source);
        assert.deepEqual(cell.attachments || {}, expected.attachments);
      }
      continue; // The existing canonical builders own these notebooks.
    }
    if (week === 2 || week === 3) {
      const nb = JSON.parse(fs.readFileSync(file, 'utf8')), cell = nb.cells[2];
      assert(cell.cell_type === 'markdown' && cell.source.join('').includes('器材'));
      const expected = embedded(week, file), old = cell.source.join('');
      const updated = replaceBlock(old, expected.source) ?? (old.trimEnd() + '\n\n' + expected.source + '\n');
      cell.source = lines(updated);
      const photoKeys = Object.values(catalog.components).flatMap(c=>c.photos).map(p=>path.basename(p.file));
      for (const key of Object.keys(cell.attachments || {})) if (photoKeys.includes(key)) delete cell.attachments[key];
      if (!Object.keys(cell.attachments || {}).length) delete cell.attachments;
      artifact(file, JSON.stringify(nb,null,1) + '\n',check);
    } else {
      const old = normalize(fs.readFileSync(file,'utf8')), block = gallery(week,file);
      let updated = replaceBlock(old, block);
      if (updated === null) {
        const marker = week === 1 ? '<a id="purchase-budget"></a>' : '## 二、';
        const offset = old.indexOf(marker); assert(offset >= 0, file);
        updated = old.slice(0,offset) + block + '\n\n' + old.slice(offset);
      }
      artifact(file, updated, check);
    }
  }
  let index = '# 零件照片與來源對照\n\n本頁是共用圖片維護索引；各週所需照片已直接放入主教材，不需要學生另開此頁。\n\n';
  index += '編號只代表照片。原檔內容保持不變，來源、角度與 SHA-256 由 [photo_catalog.json](photo_catalog.json) 記錄；同一張照片由各週引用，不在每週目錄複製原檔。實物後製展示圖與蝦皮商品參考圖均不當作實物接線證據。\n\n';
  for (const [id, part] of Object.entries(catalog.components)) {
    index += `## ${part.name}\n\n${part.note}\n\n| 檔案 | 來源與角度 | 原檔名／上傳名稱 |\n|---|---|---|\n`;
    for (const p of part.photos) index += `| [${path.basename(p.file)}](${p.file}) | ${p.kind}：${p.view} | ${[p.originalUpload || p.legacy || '既有訂單截圖',...(p.duplicateUploads || [])].join('；')} |\n`;
    index += '\n';
  }
  artifact(path.join(base,'item_gallery.md'),index.trimEnd()+'\n',check);
  console.log(`PASS ${check?'checked':'synchronized'} ${Object.keys(catalog.weeks).length} weekly galleries; ${count} photo sources with SHA-256; source index.`);
}
module.exports = {catalog, gallery, imageCount, expand, embedded, lessonPath, base, rebaseGallery, verifyPhotoReference, inlineLocalPhotos};
if (require.main === module) sync(process.argv.includes('--check'));
