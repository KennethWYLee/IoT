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
 game:()=>svg(
  box(25,15,260,50,'Start → 開始 30 秒')+box(365,15,260,50,'Finish → 判斷是否達 6')+
  box(25,110,260,60,'綠燈：新遮光 +1')+box(365,110,260,60,'紅燈：新遮光 −1')+
  text(325,223,'未遮 → 遮住 → 移開 → 再遮，才是下一次',20,'middle')+
  text(325,268,'OLED 顯示時間與 count；上限 6、下限 0',19,'middle'),290),
 rails:()=>svg(
  [0,1].map(k=>{const y=60+k*100;return line(60,y,580,y,k?colors.red:colors.black)+
    ['a','b','c','d','e'].map((c,n)=>dot(60+130*n,y)+text(60+130*n,y+30,c+(k?6:3),19,'middle')).join('');}).join('')+
  text(325,28,'GND：a3，分接 OLED、KY、按鈕',19,'middle')+
  text(325,129,'3V3：a6，分接已確認的低功率模組',19,'middle')+
  text(325,238,'兩列分開；不把 3V3 直接接到 GND。',19,'middle'),263),
 buttons:()=>svg(
  box(10,10,200,46,'GPIO5：Start')+box(245,10,160,46,'a27／e27')+box(450,10,190,46,'開始鍵')+
  line(210,33,245,33)+line(405,33,450,33)+
  box(10,97,200,46,'GPIO6：Finish')+box(245,97,160,46,'a21／e21')+box(450,97,190,46,'結束鍵')+
  line(210,120,245,120)+line(405,120,450,120)+
  text(325,205,'e29 與 e23 → 分接線 → d3／a3 → GND',19,'middle')+
  text(325,248,'一鍵一條 GPIO；不是把兩個輸入短在一起。',18,'middle'),270),
 screen:()=>svg('<rect x="130" y="8" width="390" height="206" rx="3" fill="#172d30"/>'+
  ['RUNNING','TIME 24 s  2/6','GREEN: COVER','STAGE1: NO SERVO/BEEP'].map((t,n)=>
    '<text x="151" y="'+(47+46*n)+'" font-size="22" fill="#e4f7f3" font-family="Consolas,monospace">'+t+'</text>').join('')+
  text(325,255,'畫面示意，不是實機截圖。',18,'middle'),276),
 edge:()=>flow(['未遮穩定：準備下一次','新的穩定遮光：只產生一次事件','繼續遮住：沒有新事件','移開並穩定：只重新準備，不加分']),
 clock:()=>svg(
  text(325,30,'示例：開始 10000 ms，現在 12500 ms',20,'middle')+
  box(40,70,570,50,'經過 2500 ms → 剩餘 27500 ms')+
  box(40,155,570,50,'畫面向上取整 → 顯示 28 秒')+
  text(325,251,'計時看時間差；不是畫面更新一次才減一次。',18,'middle'),275),
 flow:()=>flow(['光線電壓 → ADC raw 數字','raw → 候選分類 → 連續穩定確認','新遮光事件 ＋ 當時燈色 → count','同一份狀態 → RGB、OLED、log']),
 thresholds:()=>svg(
  box(10,30,195,62,'raw ≤ 513')+box(225,30,200,62,'513 < raw < 706')+box(445,30,195,62,'raw ≥ 706')+
  text(107,133,'候選未遮',20,'middle')+text(325,133,'先不確認',20,'middle')+text(542,133,'候選遮光',20,'middle')+
  text(325,191,'僅此示例：遮光數值較大。',19,'middle'),214),
 priority:()=>flow(['1. 中止或裝置故障','2. 是否已到 30 秒期限','3. 依這一輪時間決定紅／綠','4. 新遮光更新 count','5. Finish 用更新後 count 結算']),
 states:()=>svg(
  box(15,20,170,46,'IDLE 待機')+arrow(185,43,245,43)+box(250,20,210,46,'RUNNING')+
  line(355,66,355,100)+line(115,100,545,100)+
  arrow(115,100,115,135)+arrow(335,100,335,135)+arrow(545,100,545,135)+
  box(10,138,205,48,'SUCCESS 成功')+box(230,138,205,48,'FAILED 失敗')+box(450,138,190,48,'ABORTED 中止')+
  text(325,243,'主流程示意；待機也可能因故障中止。',19,'middle'),265),
 outputs:()=>svg(['同一個 count → OLED 與舵機角度命令','FAILED → 一次 200 ms 短聲命令',
  'SUCCESS／ABORTED → 不發玩家失敗聲','所有結果 → 停指針脈波；外部仍須人工 OFF']
  .map((s,i)=>box(45,10+i*65,560,46,s)).join(''),275),
 layout:()=>svg(
  box(25,15,235,65,'手勢與 KY 區')+box(390,15,235,65,'RGB／OLED 區')+
  box(175,158,300,55,'指針掃動區：避開 KY')+
  text(325,118,'光、手臂、紙片：不要互相干擾',20,'middle')+
  text(325,258,'布局示意；重新擺位後需核對分類基準。',18,'middle'),280),
 tempo:()=>svg(
  text(15,27,'原版：每 3 秒換色',19)+
  Array.from({length:10},(_,n)=>'<rect x="'+(20+n*61)+'" y="47" width="61" height="43" fill="'+(n%2?'#f9e9e5':'#e1f1e9')+'" stroke="#697b7d"/>'+text(50+n*61,76,n%2?'紅':'綠',18,'middle')).join('')+
  text(15,137,'修改：每 5 秒換色',19)+
  Array.from({length:6},(_,n)=>'<rect x="'+(20+n*101.67)+'" y="157" width="101.67" height="43" fill="'+(n%2?'#f9e9e5':'#e1f1e9')+'" stroke="#697b7d"/>'+text(70.8+n*101.67,186,n%2?'紅':'綠',18,'middle')).join('')+
  text(20,242,'0 秒',18)+text(630,242,'30 秒',18,'end')+
  text(325,283,'兩者總綠燈都 15 秒，段數不同。',19,'middle'),305)
};

const input = fs.readFileSync(path.join(__dirname,'week7_main.md'),'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
const pageNumbers = Object.fromEntries(parts.map((m,i)=>[m[1],i+1]));
const pages = parts.map(m=>({id:m[1],tag:m[2],body:m[3]}));
const sketchNames=['week07_traffic_light_challenge'];
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
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 7 紅綠燈遮光挑戰 - 完整重設稿</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>Week 7 · 紅綠燈遮光挑戰</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>一起操作 → 看到結果 → 解釋原理 · 重設稿</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(__dirname,'week7_main.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(__dirname,'week7_main.html')).href);
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
  const pdf=path.join(__dirname,'week7_main.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={textHashLineEndings:'LF',pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename,'utf8')),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(__dirname,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
