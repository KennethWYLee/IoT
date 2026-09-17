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
const hash = data => crypto.createHash('sha256').update(typeof data === 'string' ? data.replace(/\r\n/g,'\n') : data).digest('hex');
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


const diagrams = {
 goal:()=>svg(
  text(325,25,'程式中的同一個 count = 3',20,'middle')+
  box(10,93,205,85,'OLED：COUNT 3/6')+text(267,144,'與',22,'middle')+
  [0,1,2,3,4,5,6].map(n=>{
    const a=Math.PI*(1-n/6);
    return text(470+130*Math.cos(a),210-130*Math.sin(a),n,24,'middle');
  }).join('')+line(470,216,470,103,colors.red)+dot(470,216)+
  text(470,260,'紙指針指在第 3 格',20,'middle')+
  text(325,301,'成果示意：數字是格數，不是實測角度。',18,'middle'),323),
 information:()=>flow(['鍵盤輸入 3 → USB／UART','ESP32：60 + 3 × 10 = 90','Serial 印出示例；沒有 GPIO 動作']),
 threewires:()=>svg(
  [['外部 VOUT+','舵機 V+'],['外部 VOUT− ＋ 板 GND','舵機 GND'],['位置命令 GPIO','舵機 signal']].map((p,i)=>
   box(5,20+70*i,275,46,p[0])+box(420,20+70*i,225,46,p[1])+line(280,43+70*i,420,43+70*i)).join('')+
  text(325,257,'按功能排列，不代表實物三針左右順序。',18,'middle'),280),
 meter:()=>svg(
  box(20,25,200,45,'VOUT+ 測點')+box(430,25,200,45,'VOUT− 測點')+
  box(205,140,240,55,'電表：直流 20 V')+
  line(120,70,120,167,colors.red)+line(120,167,205,167,colors.red)+
  line(530,70,530,167,colors.black)+line(530,167,445,167,colors.black)+
  text(120,115,'紅筆',19,'middle')+text(530,115,'黑筆',19,'middle')+
  text(325,235,'電表並聯跨兩端；不是串成供電線。',19,'middle'),257),
 stopwire:()=>flow(['STOP GPIO → a27 → 按鈕 e27','按下接通 e27 與 e29 → a29 → c3','c3 與 a3 相通 → ESP32 GND']),
 pullup:()=>flow(['晶片內部 3.3 V → 上拉電阻','GPIO 輸入節點 → 按鈕（按下才接通）','GND → 板上電源回路']),
 power:()=>svg(
  box(10,10,240,44,'電池正／負 → VIN')+arrow(130,54,130,93)+
  box(10,96,240,48,'降壓模組 VOUT')+
  box(395,96,245,48,'SG90 舵機')+arrow(250,109,395,109)+
  text(322,93,'V+',17,'middle')+text(364,160,'GND',17,'middle')+
  line(395,134,250,134,colors.black)+
  box(10,210,240,48,'ESP32（USB 供電）')+
  line(130,210,130,180,colors.black)+line(130,180,320,180,colors.black)+
  line(320,180,320,134,colors.black)+dot(320,134)+
  arrow(250,222,515,222)+line(515,222,515,144)+
  text(410,207,'signal',19,'middle')+text(286,285,'板 GND → VOUT−；正極不相接',18,'middle'),308),
 reference:()=>flow(['ESP32 GPIO 的高低，是相對板上 GND','舵機 signal 的高低，是相對舵機 GND','兩邊指定 GND 相接 → 共同參考']),
 pulse:()=>svg(
  line(60,145,100,145)+line(100,145,100,65)+line(100,65,220,65)+
  line(220,65,220,145)+line(220,145,555,145)+line(555,145,555,65)+
  text(160,40,'高 1.5 ms',20,'middle')+
  line(100,198,555,198)+text(327,233,'一個週期 20 ms（50 Hz）',21,'middle')+
  text(325,277,'時間示意，寬度不按比例；不是實物核准值。',18,'middle'),300),
 shared:()=>svg(
  box(200,10,250,46,'同一份 count = 4')+line(325,56,325,85)+line(130,85,520,85)+
  arrow(130,85,130,122)+arrow(520,85,520,122)+
  box(10,125,240,48,'OLED：COUNT 4/6')+box(400,125,240,48,'計算角度 → 舵機')+
  text(325,230,'螢幕是程式資料；紙指針位置另行觀察。',19,'middle'),254),
 counter:()=>flow(['鍵盤 +／− → 計算下一個 count','檢查上下限、狀態、STOP、1 秒間隔','接受才更新 OLED 與舵機命令'])
};

const input = fs.readFileSync(path.join(__dirname,'week6_main.md'),'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
const pageNumbers = Object.fromEntries(parts.map((m,i)=>[m[1],i+1]));
const pages = parts.map(m=>({id:m[1],tag:m[2],body:m[3]}));
const sketchNames=['count_preview','week06_servo_pointer','serial_pointer_counter'];
const inputs = [];
for(const name of sketchNames) {
  const p=name !== 'week06_servo_pointer' ? path.join(__dirname,name,name+'.ino') : path.join(course,'examples',name,name+'.ino');
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
  // Avoid leaving only a closing brace or a few lines on the final program page.
  if(chunks.length>1) {
    const tail=chunks.at(-1),prev=chunks.at(-2);
    const visualCost=items=>items.reduce((n,l)=>n+Math.max(1,Math.ceil(l.length/78)),0);
    while(visualCost(tail.lines)<12&&prev.lines.length>12)tail.lines.unshift(prev.lines.pop());
    tail.start=prev.start+prev.lines.length;
  }
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
      'RGB_HW479_3.jpg': [870,570,520,710,2048,1536],
      'OLED_1.jpg': [290,625,510,490,1108,1477]
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
#answer th:first-child{width:12%}#answer th:last-child{width:88%}
figure{margin:4mm 0}.photo img{width:100%;object-fit:contain;display:block}figcaption{font-size:9.5pt;line-height:1.45;color:#52686c;margin-top:2mm}
svg{width:100%;display:block;max-height:82mm;fill:#263b40;font-family:"Microsoft JhengHei",sans-serif}
aside{padding:3mm 4mm;margin:4mm 0;border-left:4px solid #9b7837;background:#faf5e8;font-size:11pt;line-height:1.6}.safety{border-color:#b14a3a;background:#fff2ee}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:10.5pt/1.5 Consolas,"Microsoft JhengHei",monospace;background:#f1f4f5;border-left:3px solid #849ba1;padding:3mm;margin:3mm 0}code{font-family:Consolas,"Microsoft JhengHei",monospace;font-size:.92em;overflow-wrap:anywhere}
footer{position:absolute;bottom:9mm;left:17mm;right:17mm;display:flex;justify-content:space-between;color:#617277;font-size:8.5pt}a{color:#1c666e;text-decoration:underline}.lead{font-size:12pt;color:#51676d}.code-title{font-size:17pt;overflow-wrap:anywhere}.fullcode{font-size:10pt;line-height:1.45}.next{border-top:1px solid #acc1c3;padding-top:3mm;font-size:11pt}
@media screen{.page{margin:8mm auto;box-shadow:0 1px 6px #aaa}}
`;
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 6 舵機紙指針與加減計數 - 完整重設稿</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>Week 6 · 舵機紙指針與加減計數</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>一起操作 → 看到結果 → 解釋原理 · 重設稿</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(__dirname,'week6_main.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(__dirname,'week6_main.html')).href);
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
  const pdf=path.join(__dirname,'week6_main.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={textHashLineEndings:'LF',pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename,'utf8')),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(__dirname,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
