// Reading-navigation and optional local Week 1 browser checks. No board/network requests.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname, '../..');
const files=[
 'IOT_Introduction/Week_01_Course_Orientation/week1_main.md',
 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb',
 'IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb'
];
function read(file){const raw=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');return file.endsWith('.ipynb')?JSON.parse(raw).cells.map(c=>c.source.join('')).join('\n'):raw;}
function anchors(text){return [...text.matchAll(/<a id="([^"]+)"><\/a>/g)].map(m=>m[1]);}
const docs=files.map(f=>read(path.join(root,f)));
let links=0;
for(const [i,text]of docs.entries()){
 const ids=anchors(text);assert.equal(new Set(ids).size,ids.length,files[i]);assert(ids.length>5);
 for(const m of text.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)){
  const [target,fragment]=m[1].split('#');
  if(!fragment||/^[a-z]+:/i.test(target))continue;
  // This verifier checks the explicit anchors introduced for the introductory reading paths.
  if(!/^(?:w[23]-|first-iot-example|course-schedule|assessment$|final-project|materials$|purchase-(?:table|budget)$|safety$|records-and-ai|idea-card|week1-evidence|before-week2|group-measurement-tool|delivery-check|architecture-extension|assessment-details)/.test(fragment))continue;
  const dest=target?path.resolve(path.dirname(path.join(root,files[i])),target):path.join(root,files[i]);
  assert(fs.existsSync(dest),dest);assert(anchors(read(dest)).includes(fragment),`${files[i]}: ${m[1]}`);links++;
 }
}
for(const id of ['purchase-table','purchase-budget','course-schedule','assessment','group-measurement-tool','week-2-preclass-setup'])assert(anchors(docs[0]).includes(id));
assert(docs[0].includes('## 6. 材料準備'),'Week 1 uses the unified materials heading');
assert(docs[0].includes('### 每人必備零件'),'Week 1 contains the Chinese required-parts list');
// Amounts in this table already include each student's quantities; do not multiply again.
const partsSection=docs[0].split('### 每人必備零件\n')[1]?.split('<a id="purchase-budget">')[0];
assert(partsSection,'Required-parts section exists');
const parts=partsSection.split('\n').filter(line=>/^\|.*NT\$/.test(line))
 .map(line=>line.split('|').slice(1,-1).map(cell=>cell.trim()));
assert.equal(parts.length,12,'Twelve required part categories, not optional project purchases');
for(const row of parts){
 assert.equal(row.length,5,'Required-parts table column count');
 assert.match(row[4],/Week [2-7](?!\d)/,`${row[0]} needs a Week 2–7 common task`);
 assert.match(row[3],/^NT\$\d+/,'Known historical budget amount');
}
for(const name of ['ESP32-S3','麵包板','杜邦線','指定阻值電阻','四腳輕觸按鈕','光敏電阻模組',
 '溫濕度模組','三色發光模組','蜂鳴器模組','小型舵機','電池盒','OLED']){
 assert.equal(parts.filter(row=>row[0].includes(name)).length,1,`${name} occurs once`);
}
const partAmount=row=>Number(row[3].match(/^NT\$(\d+)/)[1]);
const subtotal=parts.reduce((sum,row)=>sum+partAmount(row),0);
const statedSubtotal=docs[0].match(/上表每人零件參考小計：NT\$(\d+)/);
assert(statedSubtotal,'Explicit required-parts subtotal');
assert.equal(Number(statedSubtotal[1]),subtotal,'Displayed subtotal equals all row amounts, including OLED');
assert.equal(partAmount(parts.find(row=>row[0].includes('杜邦線'))),25*3);
assert.equal(partAmount(parts.find(row=>row[0].includes('四腳輕觸按鈕'))),2*2);
const resistor=parts.find(row=>row[0].includes('指定阻值電阻'));
const firstWeeks=parts.map(row=>{
 assert.match(row[4],/^Week [2-7]/,'First-use week starts each task description');
 return Number(row[4].match(/^Week ([2-7])/)[1]);
});
assert.deepEqual(firstWeeks,[...firstWeeks].sort((a,b)=>a-b),'Required parts sorted by first use');
const oledSpec=parts.find(row=>row[0].includes('OLED'))[1];
for(const term of ['0.96','SSD1306','128×64','四針I²C','3.3 V供電','3.3 V邏輯','排針已焊'])assert(oledSpec.includes(term),`OLED purchasing spec: ${term}`);
assert(parts.find(row=>row[0].includes('三色發光模組'))[1].includes('不是WS2812B'));
assert(docs[0].includes('每顆標稱1.2 V')&&docs[0].includes('NiMH')&&docs[0].includes('標稱4.8 V'));
assert(docs[0].includes('不限定購買「2P端子轉12P排針板」'));
for(const stale of ['OLED須於核准規格公布後','OLED以外','教師這筆訂單已購5個','尚待教師公布的電池盒安全轉接端子'])assert(!docs[0].includes(stale),`No stale purchasing rule: ${stale}`);
for(const value of ['220 Ω','330 Ω','1 kΩ','10 kΩ'])assert(resistor[1].includes(value));
assert(resistor[3].includes('整包估算'),'Resistor package price is not a four-piece quotation');
const groupSection=docs[0].split('### 每組必備的量測工具\n')[1]?.split('### 學生也須自備')[0];
assert(groupSection,'Group-tool section exists');
const meterPrice=Number(groupSection.match(/A830L既有成交參考NT\$(\d+)/)?.[1]);
assert(Number.isFinite(meterPrice));
const budgets=[...groupSection.matchAll(/^\| ([123])人 \| NT\$(\d+(?:\.\d+)?) \| NT\$(\d+(?:\.\d+)?) \|$/gm)];
assert.equal(budgets.length,3,'Budget examples cover 1–3-person groups');
for(const [,people,share,total]of budgets){
 assert.equal(Number(share),meterPrice/Number(people),'Meter cost split');
 assert.equal(Number(total),subtotal+Number(share),'Parts plus meter, not an all-inclusive cost');
}
console.log(`PASS procurement: ${parts.length} Week 2–7 required categories, NT$${subtotal} historical parts subtotal, three group-budget calculations.`);
for(const heading of ['### 教學目標','### 教學內容'])assert(docs[0].includes(heading));
assert(docs[0].indexOf('### A First IoT Example')<docs[0].indexOf('## 5. Minimum Final Project'));
assert(docs[0].includes('not a tested'));
assert(docs[0].includes('不是已完成實機驗證的成品'));
assert.equal((docs[1].match(/#### 先找已知與未知/g)||[]).length,1);
assert(docs[1].indexOf('#### 先找已知與未知')<docs[1].indexOf('## 八、麵包板'));
assert(docs[1].includes('[依課程profile完成GPIO與GND接線](#w2-wiring)'));
assert(docs[2].includes('[F2. KY-018原始值](#w3-adc-concept)'));
assert(docs[2].indexOf('## 九、實驗四')<docs[2].indexOf('const int PIN_TEST_OUTPUT'));
assert(docs[2].indexOf('## 十二、實驗五')<docs[2].indexOf('const int PIN_LIGHT'));
console.log(`PASS three introductory documents: ${links} explicit navigation links, unique anchors, integrated Week 1 outline/purchase list and first-use order.`);

async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href);
 const {chromium}=require('playwright');
 const out=path.join(root,'_outputs');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:960}});
  for(const index of [0]){
   let body=docs[index];
   body=body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,relative)=>{
    assert(!/^[a-z]+:/i.test(relative),'Render only local evidence images');
    const image=path.resolve(path.dirname(path.join(root,files[index])),relative);
    const mime=/\.png$/i.test(image)?'image/png':'image/jpeg';
    return `![${alt}](data:${mime};base64,${fs.readFileSync(image).toString('base64')})`;
   });
   const html='<!doctype html><html lang="'+(index?'zh-Hant':'en')+'"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font:18px/1.7 "Microsoft JhengHei",sans-serif;color:#183047;margin:24px}main{max-width:1120px;margin:auto}h2{margin-top:48px}h3{margin-top:32px}p,li{overflow-wrap:anywhere}table{display:block;overflow-x:auto;border-collapse:collapse}th,td{border:1px solid #ccd6df;padding:10px;min-width:80px}img{max-width:100%;height:auto}pre{overflow-x:auto;background:#f2f6fa;padding:16px;font:15px/1.8 Consolas,monospace}a[id]{scroll-margin-top:80px}</style><main>'+marked.parse(body)+'</main></html>';
   fs.writeFileSync(path.join(out,`week1_${index?'support':'main'}_review.html`),html);
   await page.setContent(html);
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   const internal=await page.locator('a[href^="#"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
   for(const fragment of internal){
    const link=page.locator(`a[href="${fragment}"]`).first();await link.click();
    assert.equal(decodeURIComponent(await page.evaluate(()=>location.hash)),decodeURIComponent(fragment));
    assert.equal(await page.locator(fragment).count(),1);
   }
   for(const width of [1200,420]){
    await page.setViewportSize({width,height:960});
    await page.locator('details').evaluateAll(elements=>elements.forEach(e=>e.open=true));
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    for(const focus of ['first-iot-example','course-schedule','purchase-table','purchase-budget','group-measurement-tool','week-2-preclass-setup']){
     await page.locator('#'+focus).evaluate(e=>e.scrollIntoView());
     await page.screenshot({path:path.join(out,`week1_${focus}_${width}.png`)});
    }
    for(const [focus,selector]of [['oled-row','tr:has-text("有機發光顯示器")'],['rgb-photo','img[alt^="HW-479"]'],['buzzer-photo','img[alt^="HW-508"]']]){
     await page.locator(selector).first().evaluate(e=>e.scrollIntoView({block:'start'}));
     await page.screenshot({path:path.join(out,`week1_${focus}_${width}.png`)});
    }
   }
   console.log(`PASS Week 1 ${index?'support':'main'} local Edge: ${internal.length} anchor clicks, ${await page.locator('img').count()} loaded images, 1200/420px widths.`);
  }
 }finally{await browser.close();}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
