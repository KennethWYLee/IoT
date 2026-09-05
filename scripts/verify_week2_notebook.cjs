// Focused document checks and an explicit JavaScript model of the debounce rule.
// Model results are NOT execution of the Arduino firmware or physical measurements.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const file=path.join(root,'IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb');
const nb=JSON.parse(fs.readFileSync(file,'utf8')),sources=nb.cells.map(c=>Array.isArray(c.source)?c.source.join(''):c.source),all=sources.join('\n');
assert.equal(nb.cells.length,25);
const sketchNames=['week02_serial_basics','week02_button_input','week02_button_debounce_lab'];
const code=nb.cells.filter(c=>c.cell_type==='code');assert.equal(code.length,3);
const normalizeText=s=>s.replace(/\r\n/g,'\n').trimEnd();
sketchNames.forEach((name,i)=>{
 assert.equal(normalizeText(code[i].source.join('')),normalizeText(fs.readFileSync(path.join(root,`examples/${name}/${name}.ino`),'utf8')));
 assert.equal(code[i].execution_count,null);assert.deepEqual(code[i].outputs,[]);
 if(i>0){assert(code[i].source.join('').includes('PIN_BUTTON = -1'));assert(code[i].source.join('').includes('PIN_TEST_OUTPUT = -1'));assert(code[i].source.join('').includes('release_button_then_reset'));}
});
console.log('PASS three public sketch copies, unpublished GPIO guards, and no invented cell outputs.');
let images=0;
for(const [i,c]of nb.cells.entries()){
 const refs=[...sources[i].matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]);
 for(const ref of refs){assert(ref.startsWith('attachment:'));const a=c.attachments?.[ref.slice(11)];assert(a,ref);assert(['image/png','image/jpeg'].includes(Object.keys(a)[0]));images++;}
 for(const name of Object.keys(c.attachments||{}))assert(refs.includes(`attachment:${name}`),name);
}
assert.equal(images,13);
const meter=sources.findIndex(s=>s.startsWith('## 七、萬用')),board=sources.findIndex(s=>s.startsWith('## 八、麵包板')),gpio=sources.findIndex(s=>s.startsWith('## 九、按鈕'));
assert(meter<board&&board<gpio);
for(const p of ['完整備課版（含參考答案）','### 10.7','### 10.8','### 10.9','### 10.10','總數剛好10','模擬教學log','5020','5050','不要求額外穩定時間'])assert(all.includes(p),p);
assert(!all.includes('E27` 與 `F27`：應不導通'));
assert(!all.includes('本週只量電壓與'));
assert.equal(105096-104914,182);assert.equal(327680-22136,305544);
assert.equal((100*302598/3145728).toFixed(2),'9.62');assert.equal((100*22136/327680).toFixed(2),'6.76');
function node(h){const m=/^([a-j])(\d+)$/.exec(h);assert(m,h);return (m[1]<='e'?'L':'R')+m[2];}
assert.equal(node('a29'),node('b29'));assert.notEqual(node('a29'),node('a28'));
assert.equal(node('a22'),node('b22'));assert.notEqual(node('a20'),node('a22'));
assert.notEqual(node('a10'),node('f10'));assert.equal(node('a27'),node('e27'));
console.log('PASS thirteen raster images, sequential meter-before-wiring flow, selected concepts and calculations.');

// Model the two if conditions of the actual diagnostic sketch, with explicit sampling.
const diagnostic=code[2].source.join('');
for(const snippet of ['if (rawPressed != lastRawPressed)', 'lastRawPressed = rawPressed;', 'changedAtMs = now;',
 'now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed', 'stablePressed = rawPressed;',
 'acceptedPressCount++;', 'acceptedReleaseCount++;'])assert(diagnostic.includes(snippet),snippet);
function model(events,delay,end,{step=1,start=0}={}){
 let raw=false,last=false,stable=false,changed=start>>>0,edge=0,press=0,release=0,index=0;
 const rows=[];
 for(let elapsed=0;elapsed<=end;elapsed+=step){
  while(index<events.length&&events[index][0]<=elapsed)raw=events[index++][1];
  const now=(start+elapsed)>>>0;
  if(raw!==last){last=raw;changed=now;edge++;rows.push({event:'raw',now,raw,edge});}
  const wait=(now-changed)>>>0;
  if(wait>=delay&&raw!==stable){stable=raw;if(stable)press++;else release++;rows.push({event:'stable',now,pressed:stable,press,release,wait});}
 }
 return {rows,press,release,edge};
}
const stable=r=>r.rows.filter(x=>x.event==='stable').map(x=>[x.now,x.pressed]);
assert.deepEqual(stable(model([[1000,true],[1003,false],[1008,true],[2000,false]],30,2100)),[[1038,true],[2030,false]]);
const paper=model([[5000,true],[5006,false],[5011,true],[5018,false],[5020,true]],30,5100);
assert.equal(paper.edge,5);assert.deepEqual(stable(paper),[[5050,true]]);
const trace=[[1000,true],[1003,false],[1008,true],[1200,false],[1400,true],[1450,false]];
const expected=[[[1000,true],[1003,false],[1008,true],[1200,false],[1400,true],[1450,false]],[[1018,true],[1210,false],[1410,true],[1460,false]],[[1038,true],[1230,false],[1430,true],[1480,false]],[[1108,true],[1300,false]]];
[0,10,30,100].forEach((delay,i)=>{const r=model(trace,delay,1650);assert.deepEqual(stable(r),expected[i]);console.log(`PASS JS model ${delay} ms: press=${r.press}, release=${r.release}, stable=${JSON.stringify(stable(r))}`);});
// No transition, long hold, release filtering, polling gap, >= boundary, unsigned wrap.
assert.equal(model([],30,500).press,0);
assert.deepEqual(stable(model([[10,true]],30,1000)),[[40,true]]);
assert.deepEqual(stable(model([[100,true],[2000,false],[2050,true],[2500,false]],100,2700)),[[200,true],[2600,false]]);
assert.equal(model([[10,true],[20,false]],0,100,{step:25}).edge,0);
assert.equal(model([[10,true],[40,false]],30,100).press,0); // read changed raw before acceptance at exact boundary
assert.deepEqual(stable(model([[10,true],[41,false]],30,100)),[[40,true],[71,false]]);
assert.deepEqual(stable(model([[10,true]],30,80,{start:0xfffffff0})),[[24,true]]);
console.log('PASS JS model boundaries, held state, filtered release gap, unseen short pulse and 32-bit wrap. Not a target test.');

async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href);
 const {chromium}=require('playwright'),out=path.join(root,'_outputs');fs.mkdirSync(out,{recursive:true});
 const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 let content='';nb.cells.forEach((c,i)=>{let s=sources[i];for(const [key,v]of Object.entries(c.attachments||{})){const [mime,data]=Object.entries(v)[0];s=s.replaceAll(`attachment:${key}`,`data:${mime};base64,${data}`);}content+=`<section id="cell-${i}">${c.cell_type==='code'?'<pre><code>'+esc(s)+'</code></pre>':marked.parse(s)}</section>`;});
 const html='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font:18px/1.75 "Microsoft JhengHei",sans-serif;color:#183047;margin:24px}main{max-width:1150px;margin:auto}img{display:block;max-width:100%;height:auto;margin:24px auto}table{display:block;overflow:auto;border-collapse:collapse}td,th{border:1px solid #ccd6df;padding:8px;min-width:70px}pre{overflow:auto;background:#f2f6fa;padding:16px;font:16px/1.7 Consolas,monospace}p,li,code{overflow-wrap:anywhere}h2{margin-top:48px}h3{margin-top:32px}</style><main>'+content+'</main>';
 fs.writeFileSync(path.join(out,'week2_review.html'),html);
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:960}});await page.setContent(html);
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('img').count(),13);
  for(const width of [1280,420]){await page.setViewportSize({width,height:960});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.setViewportSize({width:1280,height:960});
  for(const heading of ['10.7 練習一預期答案：時間從「最後一次變化」起算','10.8 練習二預期答案：逐行連回狀態與計數','10.9 練習三預期答案：等待時間的取捨','10.10 課中判讀的預期回答']){
   await page.getByRole('heading',{name:heading,exact:true}).evaluate(e=>e.scrollIntoView({block:'start'}));
   await page.screenshot({path:path.join(out,`week2_review_${heading.slice(0,4)}.png`)});
  }
  const diagrams=fs.readdirSync(path.join(root,'docs/images/wiring')).filter(s=>/^week2-.*\.svg$/.test(s));
  for(const name of diagrams){await page.setContent(fs.readFileSync(path.join(root,'docs/images/wiring',name),'utf8'));
   const issues=await page.evaluate(()=>{const s=document.querySelector('svg'),v=s.viewBox.baseVal;return [...s.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height;}).map(t=>t.textContent);});
   assert.deepEqual(issues,[],`Outside viewBox: ${name}`);
  }
  console.log('PASS local Edge render: thirteen decoded images, 1280/420px page widths, SVG text bounds. Manual review still required.');
 }finally{await browser.close();}
}
async function main(){
 if(process.argv.includes('--render'))await render();
 if(process.argv.includes('--compile')){
  const {spawnSync}=require('node:child_process');
  const cli=process.env.ARDUINO_CLI||'C:/Program Files/Arduino IDE/resources/app/lib/backend/resources/arduino-cli.exe';
  for(const name of [...sketchNames,'week02_board_check']){
   console.log(`COMPILE ${name}`);
   const result=spawnSync(cli,['compile','--fqbn','esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi',path.join(root,'examples',name)],{encoding:'utf8'});
   process.stdout.write(result.stdout||'');process.stdout.write(result.stderr||'');assert.equal(result.status,0,result.error?.message||name);
  }
  console.log('PASS four Arduino builds. No upload, serial session or physical test performed.');
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
