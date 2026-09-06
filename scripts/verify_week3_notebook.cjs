// Document/math/optional browser checks only. This script never contacts a board.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const notebookPath=path.join(root,'IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb');
const nb=JSON.parse(fs.readFileSync(notebookPath,'utf8'));
const allSources=nb.cells.map(c=>c.source.join('')), all=allSources.join('\n');
// Original material has stable assertions; the additive unit is checked separately.
const sources=nb.cells.filter(c=>c.metadata?.maintenance_source!=='week3_classification.source.md').map(c=>c.source.join(''));
assert.equal(sources.length,20);
assert.equal(nb.cells.length,23);
assert.deepEqual(fs.readdirSync(path.dirname(notebookPath)),['week3_main.ipynb']);
const sketches=nb.cells.filter(c=>c.cell_type==='code');
assert.equal(sketches.length,3);
for(const [i,name] of ['week03_gpio_voltage_cycle','week03_ky018_raw','week03_light_classifier'].entries()){
  assert.equal(sketches[i].source.join('').trim(),fs.readFileSync(path.join(root,`examples/${name}/${name}.ino`),'utf8').trim());
  assert.match(sketches[i].source.join(''),/const int PIN_\w+ = -1;/);
  assert.equal(sketches[i].execution_count,null);
  assert.deepEqual(sketches[i].outputs,[]);
}
console.log('PASS three notebook sketches match public examples, -1 gates preserved, no invented runtime output.');
let images=0;
for(const [i,c] of nb.cells.entries()){
  const refs=[...allSources[i].matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m=>m[1]);
  for(const ref of refs){
    assert.ok(ref.startsWith('attachment:'),`Image should work offline: ${ref}`);
    const name=ref.slice('attachment:'.length), payload=c.attachments?.[name];
    assert(payload,`Missing ${name}`);
    const [mime,data]=Object.entries(payload)[0];
    assert.ok(['image/png','image/jpeg'].includes(mime));
    assert.ok(Buffer.from(data,'base64').length>1000);
    images++;
  }
  for(const key of Object.keys(c.attachments||{}))assert.ok(refs.includes(`attachment:${key}`),`Unused image ${key}`);
}
assert.equal(images,15);
for(const phrase of ['w3-classification','12A.1','12A.9','between_baselines','calibration_missing_or_overlap','各5筆'])assert(all.includes(phrase),phrase);
assert(!all.includes('本週不建立threshold'));
console.log('PASS fifteen embedded images and classifier teaching/limitation checks.');
assert(sources[4].indexOf('先分清三個問題')<sources[4].indexOf('I＝V÷R'));
assert(sources[4].indexOf('1 kΩ＝1000 Ω')<sources[4].indexOf('attachment:week3-current-loop.png'));
assert(sources[4].includes('同一顆電阻'));
assert(sources[5].includes('0.6 kΩ＝600 Ω'));
assert(sources[6].includes('attachment:week3-ky018-pin-labels.jpg'));
assert(!sources[11].includes('attachment:week3-ky018-pin-labels.jpg'));
assert(sources[7].indexOf('先結束Week 2線路')<sources[7].indexOf('### 步驟1'));
assert(sources[7].includes('黑線插e3')&&sources[7].includes('白線插e6')&&sources[7].includes('另選線插e12'));
assert(sources[8].includes('白色公對公延長端 → 紅表筆'));
assert(sources[8].includes('## 九、實驗四')&&sources[8].includes('### 完整GPIO量測程式'));
assert(sources[10].startsWith('### 步驟1：準備與上傳'));
assert(sources[12].includes('## 十二、實驗五')&&sources[12].includes('### 完整ADC取樣程式'));
assert(sources[14].startsWith('### Verify的21%與6%'));
assert(sources[11].includes('## 十、KY-018分壓'));
assert.equal(3/1000*1000,3);assert.equal(1.5/1000*1000,1.5);
assert.equal(0.6*1000,600);
assert(Buffer.from(nb.cells[5].attachments['week3-a830l-multimeter.jpg']['image/jpeg'],'base64').equals(fs.readFileSync(path.join(root,'docs/images/hardware/actual/a830l-multimeter-actual-front.jpg'))));
console.log('PASS novice reading order, unit conversion, phase transition and unmodified meter photo.');
const practice=sources[15].slice(sources[15].indexOf('### 13.7'));
const rows=practice.split('\n').filter(l=>l.startsWith('| ')).map(l=>l.split('|').slice(1,-1).map(v=>v.trim()));
function row(label){const result=rows.find(r=>r[0]===label);assert(result,label);return result;}
function node(hole){const m=/^([a-j])(\d+)$/.exec(hole);assert(m,hole);assert(+m[2]>=1&&+m[2]<=30);return(m[1]<='e'?'L':'R')+m[2];}
const parents=new Map();
function find(k){if(!parents.has(k))parents.set(k,k);return parents.get(k)===k?k:find(parents.get(k));}
function connect(a,b){parents.set(find(node(a)),find(node(b)));}
function same(a,b){return find(node(a))===find(node(b));}
for(const label of ['供電分配公對公線','共地分配公對公線']){const r=row(label);connect(r[1],r[2]);}
const top=row('上方10 kΩ'),bottom=row('下方1 kΩ');
assert(same('a6',top[1]));assert(same(top[2],bottom[1]));assert(same(bottom[2],'a3'));
assert(same(row('中間點公對公延長線')[1],top[2]));assert(same(row('GND公對公延長線')[1],'a3'));
assert(!same('a6','a3'));assert(!same('a6','e25'));assert(!same('a3','e25'));
assert(!same('a15','f15'));assert(same('a15','c15'));assert(same('c15','e15'));
assert(practice.includes('1 kΩ改插b20／b25'));assert(practice.includes('10 kΩ改插d25／d30'));
for(const [upper,lower,expected] of [[10000,10000,1.65],[10000,20000,2.20],[10000,1000,.30],[10000,5000,1.10],[1000,10000,3.00]]){
  const current=3.3/(upper+lower),v=current*lower;
  assert(Math.abs(v-expected)<1e-10);assert(Math.abs(current*upper+v-3.3)<1e-10);
  console.log(`PASS ideal divider ${upper}/${lower} ohms: S=${v.toFixed(2)} V; current=${(current*1000).toFixed(3)} mA (calculation only)`);
}
assert.equal(327680-21936,305744);
assert.equal(190007-188007,4*500);
const ranges=[[696,696,691,698,701],[1011,1013,1019,1020,1007]].map(a=>[Math.min(...a),Math.max(...a)]);
assert.deepEqual(ranges,[[691,701],[1007,1020]]);
for(const phrase of ['各10筆','共20筆','不是已完成的實機量測','完整備課版（含參考答案）','P3V3 ↔ TPO','不另交一份同類紙上作業'])assert(all.includes(phrase),phrase);
assert(!/30～80 Ω或198 Ω/.test(all));
console.log('PASS ideal breadboard nodes, divider calculations, raw ranges, timing, safety and disclosure checks.');

// The complete preparation edition includes answer guidance, not fabricated student readings.
const answerSection=sources[15].slice(sources[15].indexOf('### 13.8'));
for(const heading of [
  '步驟三：四個預測小題的預期回答',
  '步驟七：四個觀察小題的預期回答',
  '結果不符合預期時，可以怎麼回答',
  '附錄F2的預期完成內容',
  '### 13.9 其他課中練習與閱讀檢查的預期回答',
  'A. 電表功能、量程與數字','B. 三組KY-018電阻路徑的預測',
  'C. 麵包板節點、電壓方向與5Vin','D. GPIO電壓、Serial與程式',
  'E. ADC共同零點閱讀檢查','F. raw、時間與Verify摘要的判讀',
  'G. 開放式紀錄的答案界線'
])assert(answerSection.includes(heading),`Missing answer guidance: ${heading}`);
for(const phrase of ['理論上預期B較高，實測尚未完成','不是要求學生故意搭出故障',
  'B約3.00 V本身是理想預期','尚未量測／尚未確認','不增加新實驗、題數或繳交項目'
])assert(answerSection.includes(phrase),phrase);
assert(sources[0].includes('13.9節為參考解答'));
assert.equal(9*500/1000,4.5);
assert.equal((3.2/11).toFixed(3),'0.291');
assert.equal((3.2*10/11).toFixed(3),'2.909');
console.log('PASS practice answer coverage, theory/measurement separation, and additional worked values.');

async function render(){
  const {marked}=await import(pathToFileURL(require.resolve('marked')).href);
  const {chromium}=require('playwright');
  const out=path.join(root,'_outputs');fs.mkdirSync(out,{recursive:true});
  const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  let sections='';
  nb.cells.forEach((c,i)=>{
    let source=allSources[i];
    for(const [name,payload] of Object.entries(c.attachments||{})){
      const [mime,data]=Object.entries(payload)[0];source=source.replaceAll(`attachment:${name}`,`data:${mime};base64,${data}`);
    }
    sections+=`<section id="cell-${i}">${c.cell_type==='code'?'<pre><code>'+esc(source)+'</code></pre>':marked.parse(source)}</section>`;
  });
  const html='<!doctype html><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><style>body{font:18px/1.7 "Microsoft JhengHei",sans-serif;color:#183047;margin:28px}main{max-width:1100px;margin:auto}img{max-width:100%;height:auto;display:block;margin:24px auto}table{display:block;overflow:auto;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;min-width:80px}pre{overflow:auto;background:#f4f6f8;padding:16px;font:16px/1.6 Consolas,monospace}h2{margin-top:48px}h3{margin-top:32px}code{overflow-wrap:anywhere}p,li{overflow-wrap:anywhere}</style><main>'+sections+'</main>';
  fs.writeFileSync(path.join(out,'week3_review.html'),html);
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  try{
    const page=await browser.newPage({viewport:{width:1200,height:920}});
    await page.setContent(html);
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
    assert.equal(await page.locator('img').count(),15);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    for(const i of [4,12,14]){await page.locator(`#cell-${i}`).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`week3_review_cell${i}.png`)});}
    for(const [heading,name] of [
      ['一顆電阻的完整例子：電表讀值與計算電流是兩件事','ohms'],
      ['每筆數字都寫成五欄，不只說「14」或「0.6」','meter'],
      ['步驟三：四個預測小題的預期回答','predictions'],
      ['13.9 其他課中練習與閱讀檢查的預期回答','reading']
    ]){
      await page.getByRole('heading',{name:heading,exact:true}).evaluate(el=>el.scrollIntoView({block:'start'}));
      await page.screenshot({path:path.join(out,`week3_review_answers_${name}.png`)});
    }
    await page.setViewportSize({width:420,height:900});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    console.log('PASS Edge preview: all 15 images decoded; 1200px and 420px no page overflow (wide tables/code scroll).');
    // Inspect actual SVG text boxes, not only successful rasterization.
    for(const name of fs.readdirSync(path.join(root,'docs/images/wiring')).filter(n=>/^week3-.*\.svg$/.test(n))){
      const source=fs.readFileSync(path.join(root,'docs/images/wiring',name),'utf8');
      await page.setContent(source);
      const issues=await page.evaluate(()=>{
        const svg=document.querySelector('svg'),v=svg.viewBox.baseVal;
        return [...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height;}).map(t=>t.textContent);
      });
      assert.deepEqual(issues,[],`Text outside ${name}`);
    }
    console.log('PASS generated SVG text stays within viewBox; manual diagram inspection still required.');
  }finally{await browser.close();}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
