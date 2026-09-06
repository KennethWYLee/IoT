// Read-only document checks; --render writes previews under ignored _outputs.
// This is a notebook-style HTML preview, not a claim of live GitHub rendering.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'IoT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.ipynb');
const nb=JSON.parse(fs.readFileSync(file,'utf8')),all=nb.cells.map(c=>c.source.join('')).join('\n');
assert.equal(nb.nbformat,4);assert.equal(nb.nbformat_minor,5);
assert.deepEqual(fs.readdirSync(path.dirname(file)),['week4_main.ipynb']);
assert.equal(new Set(nb.cells.map(c=>c.id)).size,nb.cells.length);
const code=nb.cells.filter(c=>c.cell_type==='code');assert.equal(code.length,2);
for(const [i,name]of ['week04_dht11_quality','week04_dual_sensor_alarm'].entries()){
 assert.equal(code[i].source.join(''),fs.readFileSync(path.join(root,`examples/${name}/${name}.ino`),'utf8').replace(/\r\n/g,'\n'));
 assert.match(code[i].source.join(''),/const int PIN_\w+ = -1;/);assert.equal(code[i].execution_count,null);assert.deepEqual(code[i].outputs,[]);
}
const anchorIds=new Set([...all.matchAll(/<a id="([^"]+)"/g)].map(m=>m[1]));let images=0,links=0;
for(const c of nb.cells){
 const s=c.source.join(''),used=[];
 for(const m of s.matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)){
   assert(m[1].startsWith('attachment:'));const key=m[1].slice(11),payload=c.attachments?.[key];assert(payload,key);used.push(key);
   const [mime,data]=Object.entries(payload)[0];assert(['image/png','image/jpeg'].includes(mime));
   const original=key.startsWith('week4-')?path.join(root,'docs/images/wiring',key):path.join(root,'docs/images/hardware/actual',key);
   assert(Buffer.from(data,'base64').equals(fs.readFileSync(original)),`Attachment differs from canonical asset ${key}`);images++;
 }
 assert.deepEqual(Object.keys(c.attachments||{}).sort(),used.sort());
 if(c.cell_type!=='markdown')continue;
 for(const m of s.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)){
   const url=m[1];if(url.startsWith('http'))continue;
   if(url.startsWith('#'))assert(anchorIds.has(url.slice(1)),url);
   else assert(fs.existsSync(path.resolve(path.dirname(file),url.split('#')[0])),url);links++;
 }
 assert.equal((s.match(/^```/gm)||[]).length%2,0,'balanced fences');
}
assert.equal(images,16);assert(!all.includes('<!-- sketch:'));
for(let i=1;i<=7;i++)assert(all.includes(`### 13.${i}`));
for(const s of ['完整備課版（含參考解答）','### 教學目標','### 教學內容','母對母','MODULE_PROFILE_CONFIRMED = false','source=injected','不是DHT11原廠','不接舵機','20k','220 Ω','330 Ω','w4-integration','cover_event','BUZZER_PROFILE_CONFIRMED = false','age_ms','候選'])assert(all.includes(s),s);
const indoor=[300,304,308,312,316,320,304,308,312,316],shade=indoor.map(x=>x+600);
const avg=a=>a.reduce((a,b)=>a+b,0)/a.length;
assert.equal(avg(indoor),310);assert.equal(avg(shade),910);assert.equal((Math.max(...indoor)+Math.min(...shade))/2,610);
assert.equal(avg([...indoor.slice(0,9),900]),368.4);
assert.equal(9*500,4500);assert.equal(9*2500,22500);assert.equal(.33*1000,330);
assert.equal((330*.05).toFixed(1),'16.5');assert.equal((220*.05).toFixed(0),'11');
function node(h){const m=/^([a-j])(\d+)$/.exec(h);assert(m);return(m[1]<='e'?'L':'R')+m[2];}
for(const [a,b]of [['a6','c6'],['a3','c3'],['a15','c15'],['c15','e15'],['b20','e20'],['b25','e25']])assert.equal(node(a),node(b));
for(const [a,b]of [['a3','a6'],['b20','b25'],['a15','f15']])assert.notEqual(node(a),node(b));
console.log(`PASS ${nb.cells.length} cells, ${images} byte-matched attachments, ${links} local links/anchors, two source-identical gated sketches, seven Discussion questions, example math and modeled breadboard nodes.`);

async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href),{chromium}=require('playwright');
 const out=path.join(root,'_outputs/week4_review');fs.mkdirSync(out,{recursive:true});
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 let body='';nb.cells.forEach((c,i)=>{let s=c.source.join('');for(const [name,p]of Object.entries(c.attachments||{})){const [mime,data]=Object.entries(p)[0];s=s.replaceAll('attachment:'+name,`data:${mime};base64,${data}`);}body+=`<section id="cell-${i}">${c.cell_type==='code'?'<pre><code>'+esc(s)+'</code></pre>':marked.parse(s)}</section>`;});
 const html='<!doctype html><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>body{font:18px/1.7 "Microsoft JhengHei",sans-serif;color:#183047;margin:24px}main{max-width:1100px;margin:auto}img{max-width:100%;height:auto;display:block;margin:24px auto}table{display:block;overflow:auto;border-collapse:collapse}td,th{border:1px solid #ccd7e1;padding:10px;min-width:85px}pre{overflow:auto;padding:18px;background:#f3f7fb;font:16px/1.55 Consolas,monospace}p,li,code{overflow-wrap:anywhere}h2{margin-top:52px}h3{margin-top:36px}</style><main>'+body+'</main>';
 fs.writeFileSync(path.join(out,'week4_review.html'),html);
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:940}});await page.setContent(html);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('img').count(),16);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const [name,prefix]of [['4.1A','range'],['6.1','ky-event'],['9.3','dht-wiring'],['10.3','library'],['12A.3','dual-wiring'],['12A.6','integrated-test'],['13.4','discussion']]){
   await page.getByRole('heading').filter({hasText:new RegExp('^'+name.replace('.','\\.'))}).first().evaluate(el=>el.scrollIntoView({block:'start'}));
   await page.screenshot({path:path.join(out,prefix+'.png')});
  }
  await page.setViewportSize({width:420,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'mobile.png')});
  const figureDir=path.join(root,'docs/images/wiring');let count=0;
  for(const name of fs.readdirSync(figureDir).filter(s=>/^week4-.*\.svg$/.test(s))){
   await page.setContent(fs.readFileSync(path.join(figureDir,name),'utf8'));
   const issues=await page.evaluate(()=>{const svg=document.querySelector('svg'),v=svg.viewBox.baseVal;return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height;}).map(t=>t.textContent);});
   assert.deepEqual(issues,[],name);count++;
  }
  console.log(`PASS Edge notebook-style preview: 16 decoded images, 1200/420px no page overflow; ${count} SVG text-boundary checks. Manual image review is separate.`);
 }finally{await browser.close();}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
