// Reading-navigation and optional local Week 1 browser checks. No board/network requests.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const files=[
 'IoT_Introduction/Week_01_Course_Orientation/week1_main.md',
 'IoT_Introduction/Week_01_Course_Orientation/week1_support.md',
 'IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb',
 'IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb'
];
function read(file){const raw=fs.readFileSync(file,'utf8');return file.endsWith('.ipynb')?JSON.parse(raw).cells.map(c=>c.source.join('')).join('\n'):raw;}
function anchors(text){return [...text.matchAll(/<a id="([^"]+)"><\/a>/g)].map(m=>m[1]);}
const docs=files.map(f=>read(path.join(root,f)));
let links=0;
for(const [i,text]of docs.entries()){
 const ids=anchors(text);assert.equal(new Set(ids).size,ids.length,files[i]);assert(ids.length>5);
 for(const m of text.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)){
  const [target,fragment]=m[1].split('#');
  if(!fragment||/^[a-z]+:/i.test(target))continue;
  // This verifier checks the explicit anchors introduced for the introductory reading paths.
  if(!/^(?:w[23]-|first-iot-example|course-schedule|assessment$|final-project|materials$|safety$|records-and-ai|idea-card|week1-evidence|before-week2|group-measurement-tool|delivery-check|architecture-extension|assessment-details)/.test(fragment))continue;
  const dest=target?path.resolve(path.dirname(path.join(root,files[i])),target):path.join(root,files[i]);
  assert(fs.existsSync(dest),dest);assert(anchors(read(dest)).includes(fragment),`${files[i]}: ${m[1]}`);links++;
 }
}
assert(!/[\u3400-\u9fff]/.test(docs[0]),'Week 1 main remains English');
assert(docs[0].indexOf('### A First IoT Example')<docs[0].indexOf('## 5. Minimum Final Project'));
assert(docs[0].includes('not a tested')&&docs[0].includes('after class, before Week 2'));
assert(docs[1].includes('不是已完成實機驗證的成品'));
assert.equal((docs[2].match(/#### 先找已知與未知/g)||[]).length,1);
assert(docs[2].indexOf('#### 先找已知與未知')<docs[2].indexOf('## 八、麵包板'));
assert(docs[2].includes('[依課程profile完成GPIO與GND接線](#w2-wiring)'));
assert(docs[3].includes('[F2. KY-018原始值](#w3-adc-concept)'));
assert(docs[3].indexOf('## 九、實驗四')<docs[3].indexOf('const int PIN_TEST_OUTPUT'));
assert(docs[3].indexOf('## 十二、實驗五')<docs[3].indexOf('const int PIN_LIGHT'));
console.log(`PASS four introductory documents: ${links} explicit navigation links, unique anchors, English outline and first-use order.`);

async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href);
 const {chromium}=require('playwright');
 const out=path.join(root,'_outputs');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:960}});
  for(const index of [0,1]){
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
    assert.equal(await page.evaluate(()=>location.hash),fragment);
    assert.equal(await page.locator(fragment).count(),1);
   }
   for(const width of [1200,420]){
    await page.setViewportSize({width,height:960});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const focus=index?'#week-2-preclass-setup':'#first-iot-example';
    await page.locator(focus).evaluate(e=>e.scrollIntoView());
    await page.screenshot({path:path.join(out,`week1_${index?'support':'example'}_${width}.png`)});
   }
   console.log(`PASS Week 1 ${index?'support':'main'} local Edge: ${internal.length} anchor clicks, ${await page.locator('img').count()} loaded images, 1200/420px widths.`);
  }
 }finally{await browser.close();}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
