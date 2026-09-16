const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { marked } = require('marked');
const { chromium } = require('playwright');

// CommonMark punctuation boundaries do not cover every Chinese emphasis boundary.
marked.use({extensions:[{
  name:'cjkStrong',level:'inline',
  start(src){return src.indexOf('**');},
  tokenizer(src){
    const match=/^\*\*([^\n]+?)\*\*/.exec(src);
    if(match)return {type:'cjkStrong',raw:match[0],tokens:this.lexer.inlineTokens(match[1])};
  },
  renderer(token){return '<strong>'+this.parser.parseInline(token.tokens)+'</strong>';}
}]});

const course = path.resolve(__dirname, '../../..');
const tmp = path.join(__dirname, 'tmp');
fs.mkdirSync(tmp, { recursive: true });
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const actual = path.join(course, 'docs/images/hardware/actual');
const colors = {ink:'#263b40', teal:'#246e73', red:'#b34839', black:'#263b40', gold:'#96662b'};
const text = (x,y,s,size=19,anchor='start') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${esc(s)}</text>`;
const line = (x1,y1,x2,y2,color=colors.teal,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" ${extra}/>`;
const dot = (x,y) => `<circle cx="${x}" cy="${y}" r="5" fill="${colors.ink}"/>`;
const box = (x,y,w,h,s) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#edf5f4" stroke="${colors.teal}"/>${text(x+w/2,y+h/2+6,s,19,'middle')}`;
const arrow = (x1,y1,x2,y2) => line(x1,y1,x2,y2,colors.teal,'marker-end="url(#arrow)"');
const defs = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#246e73"/></marker></defs>';
const svg = (s,h=260) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 ${h}" role="img">${defs}${s}</svg>`;

function flow(labels) {
  return svg(labels.map((s,i)=>box(70,12+i*64,510,45,s)+(i<labels.length-1?arrow(325,57+i*64,325,74+i*64):'')).join(''),labels.length*64+4);
}

// Only the a-e side is shown. Dashed lines represent internal breadboard strips.
function nodes(rows) {
  const h=65+rows.length*64;
  let s='<rect x="195" y="8" width="244" height="'+(h-25)+'" fill="#f8faf9" stroke="#a5b5b8"/><rect x="445" y="8" width="18" height="'+(h-25)+'" fill="#e2e7e9"/>';
  'abcde'.split('').forEach((c,i)=>s+=text(220+i*42,35,c,18,'middle'));
  rows.forEach(([r,left,right],i)=>{
    const y=67+i*64;
    s+=line(220,y,388,y,colors.teal,'stroke-dasharray="3 4"');
    for(let c=0;c<5;c++)s+=`<circle cx="${220+c*42}" cy="${y}" r="7" fill="white" stroke="#5c747b"/>`;
    s+=text(419,y+6,r,17,'middle');
    if(left)s+=text(5,y-12,left,18)+line(38,y,220,y)+dot(220,y);
    if(right){const x=right.startsWith('c')?304:388;s+=line(x,y,490,y)+dot(x,y)+text(485,y-12,right,18);}
  });
  return svg(s+text(330,h-1,'左半部 a～e；灰色為中央槽，右半部未畫出。',16,'middle'),h+6);
}


const diagrams = {
 overview:()=>flow(['DHT11 → 溫度、濕度與讀取狀態','加回 KY → 保留不同時間的兩筆資料','穩定放開 → 穩定遮光 → 記一次事件','確認蜂鳴器接法後 → 短叫一次']),
 resistor:()=>svg(
   text(325,24,'外部斷電，測試區不接 ESP32',20,'middle')+
   box(30,90,115,50,'第20列')+box(505,90,115,50,'第25列')+
   line(145,115,255,115)+box(255,90,140,50,'220 Ω')+line(395,115,505,115)+
   text(183,93,'b20',18,'middle')+text(460,93,'b25',18,'middle')+
   line(88,140,88,205,colors.red)+line(562,140,562,205,colors.black)+
   text(88,234,'e20 → 紅筆',18,'middle')+text(562,234,'e25 → 黑筆',18,'middle')+
   text(325,284,'每列 a～e 相通；第20列與第25列不相通。',18,'middle'),305),
 dhtwire:()=>svg(
   box(20,20,145,45,'ESP32 GND')+box(245,20,155,45,'a3／第3列')+box(475,20,165,45,'c3 → DHT GND')+
   line(165,42,245,42)+line(400,42,475,42)+
   box(20,104,145,45,'ESP32 3V3')+box(245,104,155,45,'a6／第6列')+box(475,104,165,45,'c6 → DHT VCC')+
   line(165,126,245,126,colors.red)+line(400,126,475,126,colors.red)+
   box(20,190,210,45,'指定 GPIO')+box(425,190,215,45,'DHT DATA')+line(230,212,425,212)+
   text(325,272,'三條功能路徑；不是模組排針的實際排列。',18,'middle'),294),
 dhtflows:()=>svg(
   text(15,27,'供電回路（簡化）',20)+
   box(20,56,135,45,'3V3')+box(255,56,140,45,'DHT 模組')+box(495,56,135,45,'GND')+
   arrow(155,78,255,78)+arrow(395,78,495,78)+line(560,101,560,133)+line(560,133,88,133)+arrow(88,133,88,102)+
   text(325,164,'經板上電源返回；DATA 不是供電替代品。',17,'middle')+
   text(15,211,'資訊流',20)+
   box(20,240,150,45,'DHT 感測結果')+box(240,240,170,45,'DATA → GPIO')+box(480,240,150,45,'程式庫解讀')+
   arrow(170,262,240,262)+arrow(410,262,480,262)+
   text(325,327,'ESP32 → UART → CH343 → USB → Monitor',20,'middle'),350),
 dualwire:()=>svg(
   text(325,25,'每一橫線表示同一列 a～e 內部相通',18,'middle')+
   line(100,80,580,80,colors.black)+dot(100,80)+dot(320,80)+dot(580,80)+
   text(100,63,'a3 板 GND',17,'middle')+text(320,63,'b3 DHT GND',17,'middle')+text(580,63,'c3 KY −',17,'middle')+
   line(100,150,580,150,colors.red)+dot(100,150)+dot(320,150)+dot(580,150)+
   text(100,133,'a6 板 3V3',17,'middle')+text(320,133,'b6 DHT VCC',17,'middle')+text(565,133,'c6 KY 中間',17,'middle')+
   box(20,195,160,40,'KY S → a15')+box(385,195,245,40,'c15 → PIN_LIGHT')+line(180,215,385,215)+
   box(20,260,160,40,'DHT DATA')+box(385,260,245,40,'另一腳 PIN_DHT')+line(180,280,385,280)+
   text(325,340,'電源共用；兩條訊號路徑分開。',18,'middle'),358),
 sampling:()=>svg(
   text(20,27,'安排的間隔，非精準時間保證',18)+
   box(20,65,160,50,'KY 讀取')+arrow(180,90,295,90)+text(330,97,'約每 50 ms',22)+
   box(20,145,160,50,'印出紀錄')+arrow(180,170,295,170)+text(330,177,'約每 500 ms',22)+
   box(20,225,160,50,'DHT 讀取')+arrow(180,250,295,250)+text(330,257,'約每 2500 ms',22),300),
 event:()=>flow(['穩定室內光 → 準備接受下一次遮光','穩定遮光 → 事件數加 1，取消準備','持續遮光 → 不重複增加','再穩定室內光 → 才重新準備']),
 timeline:()=>svg(
   text(20,27,'假設四次取樣都暫分為遮光',20)+line(60,108,590,108)+
   [0,50,100,150].map((t,i)=>dot(60+i*176,108)+text(60+i*176,81,t+' ms',18,'middle')).join('')+
   text(60,147,'開始等',18,'middle')+text(575,147,'確認穩定',18,'middle')+
   text(325,206,'raw 可以是 905、908、902、910。',19,'middle')+
   text(325,247,'中途分類不同，就重新計時。',19,'middle'),273)
};

const input = fs.readFileSync(path.join(__dirname,'week4_main.md'),'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
const pageNumbers = Object.fromEntries(parts.map((m,i)=>[m[1],i+1]));
const pages = parts.map(m=>({id:m[1],tag:m[2],body:m[3]}));
const sketchNames=['week04_dht11_quality','week04_dual_sensor_alarm'];
const inputs = [];
for(const name of sketchNames) {
  const p=path.join(course,'examples',name,name+'.ino');
  const source=fs.readFileSync(p,'utf8');
  inputs.push({path:path.relative(course,p).replaceAll('\\','/'),sha256:hash(source)});
  const lines=source.trimEnd().split(/\r?\n/);
  // Bound visual line count, including wrapping, without changing the program text.
  const chunks=[];let group=[],cost=0,start=1;
  for(let i=0;i<lines.length;i++) {
    const c=Math.max(1,Math.ceil(lines[i].length/78));
    if(cost+c>34&&group.length) {chunks.push({start,lines:group});group=[];cost=0;start=i+1;}
    group.push(lines[i]);cost+=c;
  }
  if(group.length) chunks.push({start,lines:group});
  chunks.forEach((chunk,i)=>pages.push({id:name+'-'+i,tag:'完整程式 · '+(i+1)+' / '+chunks.length,html:`<h2 class="code-title">${esc(name)}</h2><p class="lead">第 ${chunk.start}～${chunk.start+chunk.lines.length-1} 行。所有分頁合起來才是完整程式。</p><pre class="fullcode">${esc(chunk.lines.join('\n'))}</pre><p class="next">${i+1<chunks.length?'下一頁接續同一支程式，不另開草稿。':'這支程式到此結束。原始檔保留未確認腳位的保護值；不要把編譯成功當成實機通過。'}</p>`}));
}
const photoInputs=new Map();
function render(body) {
  body=body.replace(/\{\{page:(\w+)\}\}/g,(_,id)=>{
    if(!pageNumbers[id])throw Error('Unknown page '+id);return pageNumbers[id];
  }).replace(/\{\{diagram:(\w+)\}\}/g,(_,id)=>{
    if(!diagrams[id])throw Error('Unknown diagram '+id);
    return `<figure class="diagram" aria-label="${esc(id)}">${diagrams[id]()}</figure>`;
  }).replace(/\{\{photo:([^|]+)\|(\d+)\|([^}]+)\}\}/g,(_,name,height,caption)=>{
    const data=fs.readFileSync(path.join(actual,name));
    photoInputs.set(name,hash(data));
    const uri=`data:image/${name.endsWith('.png')?'png':'jpeg'};base64,${data.toString('base64')}`;
    const crops = {
      'DHT11_1.jpg': [240,210,980,650,2048,1536],
      'Buzzer_HW508_3.jpg': [700,550,960,880,2048,1536]
    };
    const crop=crops[name];
    const media=crop
      ? `<svg viewBox="${crop.slice(0,4).join(' ')}" style="height:${height}mm;max-height:none" role="img" aria-label="${esc(caption)}"><image href="${uri}" width="${crop[4]}" height="${crop[5]}"/></svg>`
      : `<img style="height:${height}mm" alt="${esc(caption)}" src="${uri}"/>`;
    return `<figure class="photo">${media}<figcaption>${esc(caption)}</figcaption></figure>`;
  });
  return marked.parse(body).replace(/href="(\.\.\/\.\.\/\.\.\/examples\/[^\"]+)"/g,(_,link)=>{
    if(!fs.existsSync(path.resolve(__dirname,link)))throw Error('Missing example '+link);
    return 'href="https://github.com/KennethWYLee/IoT/blob/main/IOT_Introduction/'+link.slice(9)+'"';
  });
}
const css=`
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#263b40;background:#e4e8e9;font:12pt/1.65 "Microsoft JhengHei",sans-serif;letter-spacing:0}
.page{width:210mm;height:297mm;padding:14mm 17mm 16mm;background:white;position:relative;break-after:page;overflow:hidden}.page:last-child{break-after:auto}
header{display:flex;justify-content:space-between;font-size:9pt;color:#526c70;border-bottom:1px solid #afc2c4;padding-bottom:3mm;margin-bottom:5mm}
main{height:246mm}h2{font-size:23pt;line-height:1.4;margin:0 0 3mm;color:#194e54}h3{font-size:14pt;margin:4mm 0 2mm}
blockquote{margin:0 0 5mm;padding:0;color:#51676d;font-size:13pt}p{margin:3mm 0}li{margin:2mm 0}ol,ul{padding-left:7mm;margin:3mm 0}
table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11pt;line-height:1.55;margin:4mm 0}th,td{text-align:left;vertical-align:top;padding:2.7mm 2.4mm;border-bottom:1px solid #c5d4d6;overflow-wrap:anywhere}th{background:#edf3f3}
#qualityanswer th:nth-child(1){width:10%}#qualityanswer th:nth-child(2){width:15%}#qualityanswer th:nth-child(3){width:18%}#qualityanswer th:nth-child(4){width:57%}
figure{margin:4mm 0}.photo img{width:100%;object-fit:contain;display:block}figcaption{font-size:9.5pt;line-height:1.45;color:#52686c;margin-top:2mm}
svg{width:100%;display:block;max-height:82mm;fill:#263b40;font-family:"Microsoft JhengHei",sans-serif}
aside{padding:3mm 4mm;margin:4mm 0;border-left:4px solid #9b7837;background:#faf5e8;font-size:11pt;line-height:1.6}.safety{border-color:#b14a3a;background:#fff2ee}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:10.5pt/1.5 Consolas,"Microsoft JhengHei",monospace;background:#f1f4f5;border-left:3px solid #849ba1;padding:3mm;margin:3mm 0}code{font-family:Consolas,"Microsoft JhengHei",monospace;font-size:.92em;overflow-wrap:anywhere}
footer{position:absolute;bottom:9mm;left:17mm;right:17mm;display:flex;justify-content:space-between;color:#617277;font-size:8.5pt}a{color:#1c666e;text-decoration:underline}.lead{font-size:12pt;color:#51676d}.code-title{font-size:17pt;overflow-wrap:anywhere}.fullcode{font-size:10pt;line-height:1.45}.next{border-top:1px solid #acc1c3;padding-top:3mm;font-size:11pt}
@media screen{.page{margin:8mm auto;box-shadow:0 1px 6px #aaa}}
`;
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 4 感測與環境紀錄 - 完整重設稿</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>Week 4 · 感測與環境紀錄</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>一起操作 → 看到結果 → 解釋原理 · 重設稿</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(__dirname,'week4_main.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(__dirname,'week4_main.html')).href);
  await tab.emulateMedia({media:'print'});
  await tab.evaluate(()=>document.fonts.ready);
  const audit=await tab.evaluate(()=>({
    images:[...document.images].map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),
    pages:[...document.querySelectorAll('.page')].map((p,i)=>{
      const m=p.querySelector('main'),f=p.querySelector('footer'),last=m.lastElementChild;
      const bounds=m.getBoundingClientRect();
      return {page:i+1,id:p.id,overflow:m.scrollHeight>m.clientHeight+1,gap:f.getBoundingClientRect().top-last.getBoundingClientRect().bottom,
        horizontal:[...m.querySelectorAll('*')].filter(e=>!(e instanceof SVGElement)&&e.getBoundingClientRect().right>bounds.right+2).map(e=>e.tagName)};
    })
  }));
  const links=await tab.locator('a').evaluateAll(items=>items.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
  for(const link of links)if(!fs.existsSync(path.resolve(__dirname,link)))throw Error('Missing local link '+link);
  fs.writeFileSync(path.join(tmp,'layout_check.json'),JSON.stringify(audit,null,2));
  const bad=audit.pages.filter(p=>p.overflow||p.gap<8||p.horizontal.length);
  if(bad.length||audit.images.some(i=>!i.loaded))throw Error(JSON.stringify({bad,images:audit.images}));
  const pdf=path.join(__dirname,'week4_main.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename)),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(__dirname,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
