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


const diagrams = {
 overview:()=>flow(['RGB：o 全關 → r 紅 → g 綠 → b 藍','OLED：掃描回應 → 固定文字 → 改示例數字','整合：s 開始倒數 → x 中止 → z 重新準備']),
 rgbwire:()=>svg(
   ['R','G','B'].map((c,i)=>box(20,20+65*i,225,42,'對應 GPIO '+c)+box(420,20+65*i,210,42,'模組 '+c)+line(245,41+65*i,420,41+65*i)).join('')+
   box(20,223,225,42,'ESP32 GND → a3')+box(420,223,210,42,'e3 → 共同端 −')+line(245,244,420,244)+
   text(325,304,'此圖按功能排列，不代表模組排針左右順序。',18,'middle'),323),
 rgbcurrent:()=>svg(
   ['紅','綠','藍'].map((c,i)=>box(10,30+70*i,135,40,c+' GPIO')+box(215,30+70*i,115,40,'電阻')+
    box(400,30+70*i,115,40,c+' LED')+arrow(145,50+70*i,215,50+70*i)+arrow(330,50+70*i,400,50+70*i)+
    line(515,50+70*i,570,50+70*i)).join('')+
   line(570,50,570,244)+text(570,272,'GND',20,'middle')+
   text(260,286,'經板上電源返回；各支路的電阻不可略去。',17,'middle'),307),
 oledwire:()=>svg(
   [['GND → a3','b3 → OLED GND'],['3V3 → a6','b6 → OLED VDD'],['PIN_SDA GPIO','OLED SDA'],['PIN_SCL GPIO','OLED SCK']].map((pair,i)=>
    box(15,15+65*i,245,44,pair[0])+box(390,15+65*i,245,44,pair[1])+line(260,37+65*i,390,37+65*i,i==1?colors.red:colors.teal)).join('')+
   text(325,299,'供電分成兩列；訊號直接連兩個不同 GPIO。',18,'middle'),320),
 oledflow:()=>svg(
   box(15,30,170,105,'ESP32 程式')+box(450,30,180,105,'OLED 控制器')+
   arrow(185,54,450,54)+text(317,38,'SDA 資料',18,'middle')+
   arrow(185,110,450,110)+text(317,96,'SCL 時脈',18,'middle')+
   box(15,167,170,48,'3V3／GND')+box(450,167,180,48,'VDD／GND')+line(185,191,450,191)+
   text(325,260,'上：資訊與時序；下：供電與共同參考。',19,'middle'),281),
 screen:()=>svg('<rect x="150" y="10" width="350" height="206" fill="#162528" rx="3"/>'+
    ['IDLE','TIME 30 s','NOT RUNNING','DEMO 3/6 NOT SCORE'].map((t,i)=>'<text x="171" y="'+(49+46*i)+'" fill="#d7f2e9" font-size="24" font-family="Consolas,monospace">'+t+'</text>').join('')+
    text(325,248,'版面示意，不是實機照片；四行都要能看清楚。',18,'middle'),271),
 buffer:()=>flow(['clearBuffer：清掉記憶體中的上一張圖','drawStr：把四行文字畫進緩衝區','sendBuffer：經 I2C 傳到螢幕']),
 combined:()=>svg(
   text(325,28,'以下為已確認共陰 RGB 的配置',18,'middle')+
   line(90,82,575,82)+dot(90,82)+dot(330,82)+dot(575,82)+text(90,62,'a3 板 GND',17,'middle')+text(330,62,'b3 OLED GND',17,'middle')+text(565,62,'e3 RGB −',17,'middle')+
   line(90,150,330,150,colors.red)+dot(90,150)+dot(330,150)+text(90,132,'a6 板 3V3',17,'middle')+text(330,132,'b6 OLED VDD',17,'middle')+
   text(325,212,'R、G、B、SDA、SCL → 五個不同 GPIO',21,'middle'),237),
 states:()=>svg(
   box(230,10,190,46,'IDLE 待機')+arrow(325,56,325,98)+text(354,85,'s',19)+
   box(230,100,190,46,'RUNNING 進行中')+
   arrow(230,125,100,198)+arrow(420,125,550,198)+text(128,157,'到期',18)+text(508,157,'x',19)+
   box(10,200,205,46,'EXPIRED 到期')+box(430,200,205,46,'ABORTED 中止')+
   text(325,299,'兩者都先 z 回待機，再 s 才開始新一輪。',19,'middle')+
   text(325,337,'存在顯示故障時，z 仍被拒絕。',18,'middle'),355),
 time:()=>svg(
   line(60,94,590,94)+dot(100,94)+dot(360,94)+text(100,56,'10000 ms',21,'middle')+text(360,56,'11500 ms',21,'middle')+
   text(100,134,'開始',20,'middle')+text(360,134,'現在',20,'middle')+
   text(325,192,'兩個時刻相減 → 經過 1500 ms',21,'middle')+
   text(325,237,'時間軸示意，非等比例。',17,'middle'),257),
 loop:()=>flow(['讀目前時間 → 先檢查是否到期','有命令就處理；到刷新時間才傳畫面','重新讀時間 → 再查到期 → 印紀錄','回到下一輪，不為等一秒而停住']),
 fault:()=>svg(
   box(200,10,250,44,'送 f：模擬顯示失敗')+arrow(325,54,325,90)+
   box(200,92,250,44,'程式狀態 ABORTED')+line(325,136,325,165)+line(110,165,540,165)+
   arrow(110,165,110,190)+arrow(325,165,325,190)+arrow(540,165,540,190)+
   box(10,192,200,50,'RGB 全關')+box(225,192,200,50,'Serial 更新原因')+box(440,192,200,50,'OLED 可停舊圖')+
   text(325,293,'三者要分開觀察，不只看螢幕。',19,'middle'),314),
 lightwire:()=>svg(
   [['KY − → c3','第3列共地'],['KY 中間 → c6','第6列 3V3'],['KY S → a15','c15 → ADC GPIO']].map((pair,i)=>
    box(15,20+i*68,230,43,pair[0])+box(400,20+i*68,235,43,pair[1])+line(245,41+i*68,400,41+i*68)).join('')+
   text(325,259,'不是把第15列接到 RGB 的 GPIO15。',20,'middle'),280)
};

const input = fs.readFileSync(path.join(__dirname,'week5_main.md'),'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
const pageNumbers = Object.fromEntries(parts.map((m,i)=>[m[1],i+1]));
const pages = parts.map(m=>({id:m[1],tag:m[2],body:m[3]}));
const sketchNames=['week05_i2c_check','week05_rgb_oled_timer'];
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
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 5 RGB、OLED 與倒數 - 完整重設稿</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>Week 5 · RGB、OLED 與倒數</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>一起操作 → 看到結果 → 解釋原理 · 重設稿</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(__dirname,'week5_main.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(__dirname,'week5_main.html')).href);
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
  const pdf=path.join(__dirname,'week5_main.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename)),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(__dirname,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
