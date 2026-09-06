// Canonical source equality, attachments, links, tables and optional local render.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname, '../..'),week=Number(process.argv[2]);
const dirs={5:'Week_05_RGB_OLED_Countdown',6:'Week_06_Servo_Pointer',7:'Week_07_Traffic_Light_Challenge'};
assert(dirs[week]);
const file=path.join(root,`IOT_Introduction/${dirs[week]}/week${week}_main.ipynb`);
const nb=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(nb.nbformat,4);assert.equal(nb.nbformat_minor,5);
assert.deepEqual(fs.readdirSync(path.dirname(file)),[`week${week}_main.ipynb`]);
assert.equal(nb.metadata.course_edition,'complete-preparation-with-reference-answers');
assert.equal(new Set(nb.cells.map(c=>c.id)).size,nb.cells.length);
const all=nb.cells.map(c=>c.source.join('')).join('\n');let images=0,sketches=0,links=0;
const anchors=new Set([...all.matchAll(/<a id="([^"]+)"/g)].map(m=>m[1]));
const files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(e.isDirectory())walk(q);else files.push(q);}}
walk(path.join(root,'IOT_Introduction/docs/images'));
for(const c of nb.cells){
 const s=c.source.join('');
 if(c.cell_type==='code'){
  const name=c.metadata.sketch;assert(name);
  assert.equal(s,fs.readFileSync(path.join(root,`IOT_Introduction/examples/${name}/${name}.ino`),'utf8').replace(/\r\n/g,'\n'));
  assert.equal(c.execution_count,null);assert.deepEqual(c.outputs,[]);sketches++;continue;
 }
 assert.equal(c.cell_type,'markdown');assert.equal((s.match(/^```/gm)||[]).length%2,0,'code fence');
 const used=[];
 for(const m of s.matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)){
  if(!m[1].startsWith('attachment:')){require('./hardware_galleries.cjs').verifyPhotoReference(s,m[1],file);images++;continue;}
  assert(m[1].startsWith('attachment:'));const key=m[1].slice(11);used.push(key);
  const payload=c.attachments?.[key];assert(payload);const [mime,data]=Object.entries(payload)[0];
  assert(['image/png','image/jpeg'].includes(mime));const originals=files.filter(f=>path.basename(f)===key);
  assert.equal(originals.length,1,key);assert(Buffer.from(data,'base64').equals(fs.readFileSync(originals[0])),key);images++;
 }
 assert.deepEqual(Object.keys(c.attachments||{}).sort(),used.sort());
 for(const m of s.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)){
  const url=m[1];if(/^https?:/.test(url))continue;
  if(url.startsWith('#'))assert(anchors.has(url.slice(1)),url);else assert(fs.existsSync(path.resolve(path.dirname(file),url.split('#')[0])),url);links++;
 }
 let columns=null;
 for(const l of s.split('\n')){
  if(l.startsWith('|')&&l.endsWith('|')){const n=l.split('|').length;if(columns===null)columns=n;assert.equal(n,columns,`table: ${l}`);}else columns=null;
 }
}
for(const term of ['完整備課版（含參考解答）','### 教學目標','### 教學內容','Discussion','預期答案','未進行實機驗證','GPIO'])assert(all.includes(term),term);
assert(!all.includes('<!-- sketch:'));assert(images>=5);assert(sketches>=1);
console.log(`PASS Week ${week}: ${nb.cells.length} cells; ${sketches} source-identical sketches; ${images} byte-matched images; ${links} local links; tables/fences/edition.`);
async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href),{chromium}=require('playwright');
 const out=path.join(root,`_outputs/week${week}_review`);fs.mkdirSync(out,{recursive:true});
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 let body='';for(const c of nb.cells){let s=require('./hardware_galleries.cjs').inlineLocalPhotos(c.source.join(''),file);for(const [k,p]of Object.entries(c.attachments||{})){const [mime,data]=Object.entries(p)[0];s=s.replaceAll('attachment:'+k,`data:${mime};base64,${data}`);}body+=c.cell_type==='code'?'<pre><code>'+esc(s)+'</code></pre>':marked.parse(s);}
 const html='<!doctype html><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>body{font:18px/1.7 "Microsoft JhengHei",sans-serif;color:#183047;margin:24px}main{max-width:1100px;margin:auto}img{max-width:100%;height:auto;display:block;margin:24px auto}table{display:block;overflow:auto;border-collapse:collapse}td,th{border:1px solid #ccd7e1;padding:10px;min-width:85px}pre{overflow:auto;padding:18px;background:#f3f7fb;font:16px/1.55 Consolas,monospace}p,li,code{overflow-wrap:anywhere}h2{margin-top:52px}h3{margin-top:36px}</style><main>'+body+'</main>';
 fs.writeFileSync(path.join(out,'preview.html'),html);
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:920}});await page.setContent(html);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('img').count(),images);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const headings=page.locator('h2');for(let i=0;i<await headings.count();i++){
   await headings.nth(i).evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(out,`section-${i}.png`)});
  }
  await page.setViewportSize({width:420,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'mobile.png')});
  let count=0;for(const f of files.filter(f=>new RegExp(`week${week}-.*\\.svg$`).test(f))){
   await page.setContent(fs.readFileSync(f,'utf8'));
   const issues=await page.evaluate(()=>{const v=document.querySelector('svg').viewBox.baseVal;return [...document.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height;}).map(t=>t.textContent);});
   assert.deepEqual(issues,[],f);count++;
  }
  console.log(`PASS local Edge 1200/420px notebook-style render; all ${images} images decoded; ${count} SVG text bounds. Live GitHub and manual visual inspection are separate.`);
 }finally{await browser.close();}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
