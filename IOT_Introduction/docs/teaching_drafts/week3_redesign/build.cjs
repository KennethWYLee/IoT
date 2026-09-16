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

function kyCircuit() {
  return svg(text(325,24,'中間供電腳 → 3V3',20,'middle')+line(325,35,325,56)+
    '<rect x="285" y="56" width="80" height="50" fill="#fbf3df" stroke="#96662b"/>'+text(386,86,'固定電阻',19)+
    line(325,106,325,159)+dot(325,134)+line(325,134,495,134)+text(505,140,'S 訊號',19)+
    '<rect x="285" y="159" width="80" height="50" fill="#edf5f4" stroke="#246e73"/>'+text(386,190,'光敏電阻',19)+
    line(325,209,325,244)+text(325,272,'− 排針 → GND → 電源回路',20,'middle'),287);
}

function divider(swap=false) {
  const upper=swap?'1 kΩ':'10 kΩ', lower=swap?'10 kΩ':'1 kΩ';
  let s='';
  'abcde'.split('').forEach((c,i)=>s+=text(205+i*40,23,c,18,'middle'));
  const ys=[60,168,276];
  [20,23,26].forEach((r,i)=>{
    s+=line(205,ys[i],365,ys[i],colors.teal,'stroke-dasharray="3 4"')+text(388,ys[i]+6,r,18);
    for(let c=0;c<5;c++)s+=`<circle cx="${205+c*40}" cy="${ys[i]}" r="6" fill="white" stroke="#536a71"/>`;
  });
  s+=text(6,42,'3V3／b6',18)+line(20,60,205,60,colors.red)+dot(205,60);
  s+=text(6,261,'GND／b3',18)+line(20,276,205,276,colors.black)+dot(205,276);
  s+=line(285,60,285,84)+line(285,144,285,168)+`<rect x="268" y="84" width="34" height="60" fill="#fbf3df" stroke="#96662b"/>`+text(332,121,upper,19);
  s+=line(325,168,325,192)+line(325,252,325,276)+`<rect x="308" y="192" width="34" height="60" fill="#fbf3df" stroke="#96662b"/>`+text(373,229,lower,19);
  s+=dot(365,168)+line(365,168,490,168)+text(470,146,'e23 → 紅筆',19);
  s+=text(325,322,'黑筆仍碰 e3 延長端；電阻兩端跨不同列。',18,'middle');
  return svg(s,338);
}

const diagrams = {
 overview:()=>flow(['電表量電壓','遮住光敏模組，看電壓改變','ESP32 讀數字，程式印出判斷']),
 power:()=>nodes([[3,'GND → a3','e3 → 黑筆'],[6,'3V3 → a6','e6 → 紅筆']]),
 voltage:()=>svg(box(15,35,170,70,'3V3／e6')+box(465,35,170,70,'GND／e3')+box(227,25,195,92,'直流電壓表')+line(185,69,227,69,colors.red)+line(422,69,465,69,colors.black)+text(201,135,'紅筆',19,'middle')+text(444,135,'黑筆',19,'middle')+text(325,195,'顯示例：約 +3.3 V；兩端不可用普通線直接互接。',19,'middle'),220),
 meterpath:()=>svg(text(22,30,'正常量測：',20)+box(25,60,100,50,'3V3')+box(237,60,170,50,'電壓表高電阻')+box(522,60,100,50,'GND')+line(125,85,237,85)+line(407,85,522,85)+text(22,159,'不要實作：',20)+box(25,189,100,50,'3V3')+box(522,189,100,50,'GND')+line(125,214,522,214,colors.red)+text(320,194,'普通線直接接通',19,'middle')+text(320,270,'低電阻路徑 → 短路',19,'middle'),295),
 gpio:()=>nodes([[3,'GND → a3','e3 → 黑筆'],[6,'3V3 → a6','這段不量'],[12,'GPIO5 → a12','e12 → 紅筆']]),
 command:()=>svg(box(183,10,285,50,'ESP32 程式設定 HIGH')+line(325,60,325,87)+line(162,87,488,87)+arrow(162,87,162,114)+arrow(488,87,488,114)+box(20,116,285,55,'Serial → USB → Monitor')+box(345,116,285,55,'GPIO5 → 第12列 → 電表')+text(162,218,'看到程式回報',20,'middle')+text(488,218,'量到實際電壓',20,'middle'),245),
 kycircuit:kyCircuit,
 ky:()=>nodes([[3,'板子 GND → a3','c3 ← KY −'],[6,'板子 3V3 → a6','c6 ← KY 中間'],[15,'KY S → a15','e15 → 紅筆']]),
 adc:()=>svg(text(325,27,'新增訊號線；模組供電接法保持不變',20,'middle')+box(10,75,130,55,'KY S')+box(231,75,188,55,'第15列 a～e')+box(504,75,136,55,'GPIO4')+arrow(140,102,231,102)+arrow(419,102,504,102)+text(185,76,'a15',18,'middle')+text(460,76,'c15',18,'middle')+line(326,130,326,190)+text(326,218,'e15 → 紅筆延長線',19,'middle')+text(325,267,'黑筆 → e3／GND；模組 − → c3／GND。',18,'middle'),290),
 information:()=>flow(['光線改變 → 光敏電阻改變','S 電壓 → GPIO4 → 晶片內 ADC','raw 整數 → 程式 → Serial','UART → CH343 → USB → 電腦 Monitor']),
 ranges:()=>svg(text(15,24,'教學假資料；raw 無單位，不是 V',18)+line(55,106,600,106)+`<rect x="65" y="66" width="130" height="55" fill="#dfefee" stroke="#246e73"/><rect x="448" y="66" width="130" height="55" fill="#fff1d7" stroke="#96662b"/>`+text(130,100,'300～320',20,'middle')+text(513,100,'900～920',20,'middle')+text(130,155,'室內光',19,'middle')+text(513,155,'遮光',19,'middle')+line(324,51,324,129,colors.red)+text(324,177,'分界 610',20,'middle')+text(325,220,'示意位置非等比例。兩段之間的值沒有基準資料。',18,'middle'),245),
 classflow:()=>flow(['新的 raw','端點先不判；其他值依分界給標籤','另查是否落在已觀察基準','一起保存 raw、label、quality、reason']),
 dividera:()=>divider(false),
 dividerb:()=>divider(true),
 current:()=>svg(box(18,50,113,52,'3V3')+box(202,50,104,52,'R上')+box(374,50,104,52,'R下')+box(533,50,103,52,'GND')+arrow(131,76,202,76)+arrow(306,76,374,76)+arrow(478,76,533,76)+line(585,102,585,177)+line(585,177,73,177)+arrow(73,177,73,104)+text(325,209,'經板上電源回路返回；畫的是傳統電流方向。',18,'middle')+text(325,28,'兩顆串聯電阻流過相同電流',20,'middle'),230)
};

const input = fs.readFileSync(path.join(__dirname,'week3_main.md'),'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
const pageNumbers = Object.fromEntries(parts.map((m,i)=>[m[1],i+1]));
const pages = parts.map(m=>({id:m[1],tag:m[2],body:m[3]}));
const sketchNames=['week03_gpio_voltage_cycle','week03_ky018_raw','week03_light_classifier'];
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
    const media=name==='KY018_1.jpg'
      ? `<svg viewBox="350 540 290 640" style="height:${height}mm;max-height:none" role="img" aria-label="${esc(caption)}"><image href="${uri}" width="1108" height="1477"/></svg>`
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
figure{margin:4mm 0}.photo img{width:100%;object-fit:contain;display:block}figcaption{font-size:9.5pt;line-height:1.45;color:#52686c;margin-top:2mm}
svg{width:100%;display:block;max-height:82mm;fill:#263b40;font-family:"Microsoft JhengHei",sans-serif}
aside{padding:3mm 4mm;margin:4mm 0;border-left:4px solid #9b7837;background:#faf5e8;font-size:11pt;line-height:1.6}.safety{border-color:#b14a3a;background:#fff2ee}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:10.5pt/1.5 Consolas,"Microsoft JhengHei",monospace;background:#f1f4f5;border-left:3px solid #849ba1;padding:3mm;margin:3mm 0}code{font-family:Consolas,"Microsoft JhengHei",monospace;font-size:.92em;overflow-wrap:anywhere}
footer{position:absolute;bottom:9mm;left:17mm;right:17mm;display:flex;justify-content:space-between;color:#617277;font-size:8.5pt}a{color:#1c666e;text-decoration:underline}.lead{font-size:12pt;color:#51676d}.code-title{font-size:17pt;overflow-wrap:anywhere}.fullcode{font-size:10pt;line-height:1.45}.next{border-top:1px solid #acc1c3;padding-top:3mm;font-size:11pt}
@media screen{.page{margin:8mm auto;box-shadow:0 1px 6px #aaa}}
`;
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 3 電氣量測與 ADC - 完整重設稿</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>Week 3 · 電氣量測與 ADC</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>一起操作 → 看到結果 → 解釋原理 · 重設稿</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(__dirname,'week3_main.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(__dirname,'week3_main.html')).href);
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
  const pdf=path.join(__dirname,'week3_main.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename)),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(__dirname,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
