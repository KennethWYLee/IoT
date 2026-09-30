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
const answers = process.argv.includes('--answers');
const destination = answers ? path.resolve(__dirname, '../week3_answers') : __dirname;
const stem = answers ? 'week3Ans' : 'week3_main';
const title = answers ? 'Week 3 Ans · 光線顯示與按鈕快照' : 'Week 3 · 光線顯示與按鈕快照';
const tmp = path.join(destination, 'tmp');
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

// Only the a-e side is shown. Dashed lines represent internal breadboard strips.
function nodes(rows) {
  const h=65+rows.length*64;
  let s='<rect x="195" y="8" width="244" height="'+(h-25)+'" fill="#f8faf9" stroke="#a5b5b8"/><rect x="445" y="8" width="18" height="'+(h-25)+'" fill="#e2e7e9"/>';
  'abcde'.split('').forEach((c,i)=>s+=text(220+i*42,35,c,18,'middle'));
  rows.forEach(([r,left,right],i)=>{
    const y=67+i*64;
    s+=line(220,y,388,y,colors.teal,'stroke-dasharray="3 4"');
    for(let c=0;c<5;c++)s+=`<circle cx="${220+c*42}" cy="${y}" r="7" fill="white" stroke="#5c747b"/>`;
    s+=text(419,y-12,r,17,'middle');
    if(left)s+=text(5,y-12,left,18)+line(38,y,220,y)+dot(220,y);
    if(right){const pin=right.match(/^([abcde])\d/);const x=pin?220+'abcde'.indexOf(pin[1])*42:388;s+=line(x,y,490,y)+dot(x,y)+text(485,y-12,right,18);}
  });
  return svg(s+text(330,h-1,'字母欄＋數字列是麵包板孔位；灰色是中央溝槽。',16,'middle'),h+6);
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
  s+=text(6,42,'板 3V3 → b6',18)+line(20,60,205,60,colors.red)+dot(205,60);
  s+=text(6,261,'板 GND → b3',18)+line(20,276,205,276,colors.black)+dot(205,276);
  s+=line(285,60,285,84)+line(285,144,285,168)+`<rect x="268" y="84" width="34" height="60" fill="#fbf3df" stroke="#96662b"/>`+text(332,121,upper,19);
  s+=line(325,168,325,192)+line(325,252,325,276)+`<rect x="308" y="192" width="34" height="60" fill="#fbf3df" stroke="#96662b"/>`+text(373,229,lower,19);
  s+=dot(365,168)+line(365,168,490,168)+text(470,146,'e23 → 紅色筆尖',19);
  s+=text(325,322,'黑色筆尖碰麵包板 e3 孔延長端；電阻跨不同列。',18,'middle');
  return svg(s,338);
}

function combinedCurrent() {
  let s=text(12,25,'按鈕按下時：傳統電流方向',19);
  s+=box(12,52,82,42,'3.3 V')+box(139,52,176,42,'晶片內上拉電阻')
    +box(388,52,82,42,'按鈕')+box(548,52,90,42,'GND');
  s+=arrow(94,73,139,73)+arrow(315,73,388,73)+arrow(470,73,548,73);
  s+=dot(347,73)+text(347,123,'GPIO5：約 0 V',18,'middle');
  s+=line(593,94,593,157)+line(593,157,54,157)+arrow(54,157,54,96);
  s+=text(325,149,'經板上電源回路返回',16,'middle');
  s+=text(12,202,'光敏電路：供電與感測接點',19);
  s+=box(12,230,82,42,'3V3')+box(139,230,130,42,'固定電阻')
    +box(388,230,130,42,'光敏電阻')+box(548,230,90,42,'GND');
  s+=arrow(94,251,139,251)+arrow(269,251,388,251)+arrow(518,251,548,251);
  s+=dot(327,251)+line(327,251,327,293)+text(327,316,'S → GPIO4 讀取電壓；不是供電線',18,'middle');
  s+=line(593,272,593,350)+line(593,350,54,350)+arrow(54,350,54,274);
  s+=text(325,343,'經板上電源回路返回',16,'middle');
  return svg(s,370);
}
function snapshotWiring() {
  const tx=(x,y,s,size=22)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`;
  const wire=(points,color=colors.teal)=>`<polyline points="${points}" fill="none" stroke="${color}" stroke-width="3"/>`;
  const hole=(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="white" stroke="#526c70" stroke-width="2"/>`;
  let s=tx(15,26,'板 8 ─ OLED SDA；板 9 ─ OLED SCK（SCL）',23);
  s+='<rect x="295" y="48" width="214" height="455" fill="#f5f8f8" stroke="#a5b5b8"/>';
  s+='<rect x="510" y="355" width="22" height="148" fill="#dce3e4"/>';
  s+='<rect x="533" y="355" width="198" height="148" fill="#f5f8f8" stroke="#a5b5b8"/>';
  'abcde'.split('').forEach((c,i)=>s+=tx(312+i*40,75,c,20));
  'fghij'.split('').forEach((c,i)=>s+=tx(552+i*40,385,c,20));
  const rows=[[3,115],[6,210],[15,305],[20,415],[22,480]];
  for(const [r,y] of rows){
    s+=`<line x1="320" y1="${y}" x2="480" y2="${y}" stroke="#a7b9bc" stroke-width="5"/>`;
    for(let i=0;i<5;i++)s+=hole(320+i*40,y);
    s+=tx(265,y-13,String(r),20);
    if(r>=20){for(let i=0;i<5;i++)s+=hole(560+i*40,y);}
  }
  s+=tx(15,105,'板 GND → a3')+wire('180,115 320,115',colors.black);
  s+=wire('360,115 360,90 580,90',colors.black)+tx(595,97,'b3 → OLED GND');
  s+=wire('400,115 400,142 580,142',colors.black)+tx(595,149,'c3 → 光敏 −');
  s+=wire('440,115 440,168 580,168',colors.black)+tx(595,175,'d3 → a22 地線');
  s+=tx(15,200,'板 3V3 → a6')+wire('180,210 320,210',colors.red);
  s+=wire('360,210 360,190 580,190',colors.red)+tx(595,197,'b6 → OLED VDD');
  s+=wire('400,210 400,240 580,240',colors.red)+tx(595,247,'c6 → 光敏供電腳');
  s+=tx(15,295,'光敏 S → a15')+wire('180,305 320,305');
  s+=wire('400,305 400,325 580,325')+tx(595,332,'c15 → 板 4');
  s+=tx(15,405,'板 5 → a20')+wire('180,415 320,415');
  s+=tx(15,470,'d3 → a22')+wire('180,480 320,480',colors.black);
  s+='<rect x="478" y="408" width="84" height="78" rx="3" fill="#d7dfe0" stroke="#526c70" stroke-width="2"/>';
  s+='<circle cx="520" cy="447" r="21" fill="#526c70"/>';
  for(const y of [415,480])for(const x of [480,560])s+=hole(x,y);
  s+=tx(15,541,'按鈕腳：e20／f20／e22／f22；跨中央溝槽。',23);
  s+=tx(15,574,'線兩端依實物印字辨認；列距省略，不是等比例安裝照片。',21);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 595" role="img">${s}</svg>`;
}
const diagrams = {
 oledfirst:()=>nodes([[3,'板 GND → a3','b3 → OLED GND'],[6,'板 3V3 → a6','b6 → OLED VDD']]).replace('</svg>',text(20,232,'板 8 → OLED SDA；板 9 → OLED SCK（SCL）',20)+'</svg>').replace('viewBox="0 0 650 199"','viewBox="0 0 650 258"'),
 lightadded:()=>nodes([[3,'保留板 GND → a3','c3 ← 光敏 −'],[6,'保留板 3V3 → a6','c6 ← 光敏供電'],[15,'光敏 S → a15','c15 → 板 4']]),
 fullsnapshotwiring:snapshotWiring,
 oledpower:()=>svg(
   text(325,22,'供電回路示意：傳統電流分成兩條支路',18,'middle')
   +box(10,72,95,44,'3V3')+box(250,45,155,44,'光敏模組')
   +box(250,135,155,44,'OLED 模組')+box(545,72,95,44,'GND')
   +line(105,94,167,94)+line(167,67,167,157)+arrow(167,67,250,67)+arrow(167,157,250,157)
   +arrow(405,67,483,67)+arrow(405,157,483,157)+line(483,67,483,157)
   +line(483,94,545,94)+dot(167,94)+dot(483,94)
   +line(592,116,592,222)+line(592,222,57,222)+arrow(57,222,57,116)
   +text(325,216,'經板上電源回路返回；不是 OLED 的資料傳遞',16,'middle'),240),
 oledconnections:()=>svg(
   text(325,24,'連接關係示意；依模組絲印辨認，不是排針實際順序',17,'middle')
   +box(10,50,220,42,'ESP32 3V3')+box(420,50,220,42,'OLED VDD')+line(230,71,420,71,colors.red)
   +box(10,112,220,42,'ESP32 GND')+box(420,112,220,42,'OLED GND')+line(230,133,420,133,colors.black)
   +box(10,174,220,42,'GPIO8／PIN_SDA')+box(420,174,220,42,'OLED SDA')+line(230,195,420,195)
   +box(10,236,220,42,'GPIO9／PIN_SCL')+box(420,236,220,42,'OLED SCK／SCL')+line(230,257,420,257)
   +text(325,307,'GPIO8、GPIO9：開發板接腳',17,'middle')
   +text(325,330,'PIN_SDA、PIN_SCL：程式設定名稱',17,'middle'),344),
 observerflow:()=>flow(['光線 → S 電壓 → GPIO4 的 raw','程式比較：更新本次最小值與最大值','同一組 raw／min／max → OLED 畫面','同一組資料 → Serial → 電腦紀錄']),
 snapshotflow:()=>svg(
   box(10,15,300,46,'定時：讀取目前 raw')+box(350,15,290,46,'按鈕：辨識新的按下')
   +arrow(495,61,495,84)+box(350,86,290,46,'再取樣，保存並加次數')
   +line(160,61,160,159)+arrow(160,159,160,183)
   +line(495,132,495,159)+arrow(495,159,495,183)
   +box(10,185,630,46,'OLED：RAW 持續更新；LAST／SAVED 只在保存時改')
   +arrow(495,132,632,152)+text(625,176,'Serial 紀錄',15,'end')
   +text(325,275,'箭頭是資訊處理順序，不是接線或電流。',17,'middle'),289),
 worksheetinformation:()=>svg(
   box(10,8,300,42,'光線 → 光敏電阻變化')+box(350,8,290,42,'按鈕按下／放開')
   +arrow(160,50,160,68)+arrow(495,50,495,68)
   +box(10,70,300,42,'模組 S 的電壓改變')+box(350,70,290,42,'GPIO5 → 辨識新按壓')
   +arrow(160,112,160,130)+line(495,112,495,151)
   +arrow(495,151,312,151)+text(420,141,'觸發取樣',16,'middle')
   +box(10,132,300,42,'GPIO4 → ADC → raw')
   +arrow(160,174,160,192)+box(10,194,630,42,'程式記錄：序號、raw、開機時間')
   +arrow(325,236,325,254)+box(10,256,630,42,'Serial／UART → CH343 → USB → Monitor'),308),
 worksheetdivider:()=>svg(
   '<rect x="24" y="69" width="146" height="139" fill="#edf5f4" stroke="#526c70"/>'
   +text(97,125,'板上電源',20,'middle')+text(97,151,'3.3 V',20,'middle')
   +text(97,91,'＋',18,'middle')+text(97,197,'−',18,'middle')
   +line(97,69,97,26)+line(97,26,325,26)+line(325,26,325,52)
   +text(218,17,'3V3：3.3 V',18,'middle')
   +'<rect x="298" y="52" width="54" height="43" fill="white" stroke="#526c70"/>'
   +text(369,80,'1 kΩ',20)+line(325,95,325,138)+dot(325,138)
   +line(325,138,447,138)+dot(447,138)
   +text(460,128,'兩顆電阻連接處',18)+text(460,157,'電壓：____ V',18)
   +line(325,138,325,180)+'<rect x="298" y="180" width="54" height="43" fill="white" stroke="#526c70"/>'
   +text(369,208,'10 kΩ',20)+line(325,223,325,253)
   +line(325,253,97,253)+line(97,253,97,208)+dot(325,253)
   +text(369,258,'GND：0 V',19),274),
 combinedwiring:()=>nodes([[3,'板 GND → a3','b3 ← 光敏 − 腳'],[6,'板 3V3 → a6','b6 ← 光敏供電腳'],[15,'光敏 S → a15','c15 → 板 GPIO4'],[27,'板 GPIO5 → a27','e27 → 按鈕'],[29,'e3 → a29','e29 → 按鈕']]),
 combinedcurrent:combinedCurrent,
 answerflow:()=>flow(['辨識一次新按壓','空閒：開始三筆；忙碌：回報不接受','每到間隔才重新讀 ADC，index 加一','第三筆後停止，等待下一次按下']),

 cumulative:()=>flow(['按鈕 → 板 GPIO5：一次新的有效按下','光敏 S 腳 → 板 GPIO4／ADC → raw','程式：記錄序號、raw 與開機時間','UART → CH343 → USB → 電腦視窗']),
 overview:()=>flow(['電表量電壓','遮住光敏模組，看電壓改變','ESP32 讀數字，程式印出判斷']),
 power:()=>nodes([[3,'板 GND → a3','e3 → 黑色筆尖'],[6,'板 3V3 → a6','e6 → 紅色筆尖']]),
 voltage:()=>svg(box(15,35,170,70,'板 3V3／e6 孔')+box(465,35,170,70,'板 GND／e3 孔')+box(227,25,195,92,'電表直流電壓檔')+line(185,69,227,69,colors.red)+line(422,69,465,69,colors.black)+text(201,135,'紅色筆尖',19,'middle')+text(444,135,'黑色筆尖',19,'middle')+text(325,195,'e6、e3 是麵包板孔位；示例顯示約 +3.3 V。',19,'middle'),220),
 meterpath:()=>svg(text(22,30,'正常量測：',20)+box(25,60,100,50,'3V3')+box(237,60,170,50,'電壓表高電阻')+box(522,60,100,50,'GND')+line(125,85,237,85)+line(407,85,522,85)+text(22,159,'不要實作：',20)+box(25,189,100,50,'3V3')+box(522,189,100,50,'GND')+line(125,214,522,214,colors.red)+text(320,194,'普通線直接接通',19,'middle')+text(320,270,'低電阻路徑 → 短路',19,'middle'),295),
 gpio:()=>nodes([[3,'板 GND → a3','e3 → 黑色筆尖'],[6,'板 3V3 → a6','這段不量'],[12,'板 GPIO5 → a12','e12 → 紅色筆尖']]),
 command:()=>svg(box(183,10,285,50,'ESP32 程式設定 HIGH')+line(325,60,325,87)+line(162,87,488,87)+arrow(162,87,162,114)+arrow(488,87,488,114)+box(20,116,285,55,'Serial → USB → Monitor')+box(345,116,285,55,'GPIO5 → 第12列 → 電表')+text(162,218,'看到程式回報',20,'middle')+text(488,218,'量到實際電壓',20,'middle'),245),
 kycircuit:kyCircuit,
 ky:()=>nodes([[3,'板 GND → a3','c3 ← 光敏 − 腳'],[6,'板 3V3 → a6','c6 ← 光敏供電腳'],[15,'光敏 S → a15','e15 → 紅色筆尖']]),
 adc:()=>svg(text(325,27,'新增訊號線；模組供電接法保持不變',20,'middle')+box(10,75,130,55,'光敏 S 腳')+box(231,75,188,55,'麵包板第15列')+box(504,75,136,55,'板 GPIO4')+arrow(140,102,231,102)+arrow(419,102,504,102)+text(185,76,'a15 孔',18,'middle')+text(460,76,'c15 孔',18,'middle')+line(326,130,326,190)+text(326,218,'e15 孔延長線 → 紅色筆尖',19,'middle')+text(325,267,'黑色筆尖碰 e3 孔延長端；e3、c3 通開發板 GND。',18,'middle'),290),
 information:()=>flow(['光線改變 → 光敏電阻改變','S 電壓 → GPIO4 → 晶片內 ADC','raw 整數 → 程式 → Serial','UART → CH343 → USB → 電腦 Monitor']),
 ranges:()=>svg(text(15,24,'教學假資料；raw 無單位，不是 V',18)+line(55,106,600,106)+`<rect x="65" y="66" width="130" height="55" fill="#dfefee" stroke="#246e73"/><rect x="448" y="66" width="130" height="55" fill="#fff1d7" stroke="#96662b"/>`+text(130,100,'300～320',20,'middle')+text(513,100,'900～920',20,'middle')+text(130,155,'室內光',19,'middle')+text(513,155,'遮光',19,'middle')+line(324,51,324,129,colors.red)+text(324,177,'分界 610',20,'middle')+text(325,220,'示意位置非等比例。兩段之間的值沒有基準資料。',18,'middle'),245),
 classflow:()=>flow(['新的 raw','端點先不判；其他值依分界給標籤','另查是否落在已觀察基準','一起保存 raw、label、quality、reason']),
 dividera:()=>divider(false),
 dividerb:()=>divider(true),
 current:()=>svg(box(18,50,113,52,'3V3')+box(202,50,104,52,'上方電阻')+box(374,50,104,52,'下方電阻')+box(533,50,103,52,'GND')+arrow(131,76,202,76)+arrow(306,76,374,76)+arrow(478,76,533,76)+line(585,102,585,177)+line(585,177,73,177)+arrow(73,177,73,104)+text(325,209,'經板上電源回路返回；畫的是傳統電流方向。',18,'middle')+text(325,28,'兩顆串聯電阻流過相同電流',20,'middle'),230)
};

const sourceFile = path.join(destination, stem + '.md');
const input = fs.readFileSync(sourceFile,'utf8');
const parts = [...input.matchAll(/<!-- page: ([\w]+) \| (.*?) -->\s*([\s\S]*?)(?=<!-- page:|$)/g)];
if(!parts.length) throw Error('No pages');
if (new Set(parts.map(m => m[1])).size !== parts.length) throw Error('Duplicate source page ID');
if (!answers && /\{\{program:/.test(input)) throw Error('Main is an exam; programs belong in Ans');
const pages = [];
const inputs = [];
if (answers) for (const name of ['oled_fixed_text','oled_light','oled_light_snapshot']) {
  const p=path.join(destination,'programs',name,name+'.ino');
  inputs.push({path:path.relative(course,p).replaceAll('\\','/'),sha256:hash(fs.readFileSync(p,'utf8'))});
}
const sourceAnchors = new Map();
for(const m of parts) {
  const match = m[3].trim().match(/^\{\{program:(\w+)\}\}$/);
  if(!match) { pages.push({id:m[1],tag:m[2],body:m[3]}); continue; }
  const name=match[1];
  const p=name==='button_light_capture'
    ? path.join(__dirname,name,name+'.ino')
    : ['three_light_samples','shade_counter','light_observer','light_snapshot'].includes(name) && answers
      ? path.join(destination,name,name+'.ino')
      : path.join(course,'examples',name,name+'.ino');
  sourceAnchors.set(path.resolve(p), m[1]);
  const source=fs.readFileSync(p,'utf8');
  inputs.push({path:path.relative(course,p).replaceAll('\\','/'),sha256:hash(source)});
  const lines=source.trimEnd().split(/\r?\n/);
  const chunks=[];let group=[],cost=0,start=1;
  for(let i=0;i<lines.length;i++) {
    const c=Math.max(1,Math.ceil(lines[i].length/78));
    if(cost+c>34&&group.length) {chunks.push({start,lines:group});group=[];cost=0;start=i+1;}
    group.push(lines[i]);cost+=c;
  }
  if(group.length) chunks.push({start,lines:group});
  if(chunks.length>1) {
    const tail=chunks.at(-1),prev=chunks.at(-2);
    const visualCost=items=>items.reduce((n,l)=>n+Math.max(1,Math.ceil(l.length/78)),0);
    while(visualCost(tail.lines)<12&&prev.lines.length>12)tail.lines.unshift(prev.lines.pop());
    tail.start=prev.start+prev.lines.length;
  }
  // Keep complete functions together in the two button examples.
  if(name==='button_light_capture' || name==='three_light_samples') {
    const starts=name==='button_light_capture'
      ? [0,lines.findIndex(l=>l.startsWith('void setup()')),lines.length]
      : [0,lines.findIndex(l=>l.startsWith('// 每次都讀')),lines.findIndex(l=>l.startsWith('void loop()')),lines.length];
    if(starts.some(n=>n<0)) throw Error('Program section boundary missing');
    chunks.length=0;
    for(let i=0;i<starts.length-1;i++) chunks.push({start:starts[i]+1,lines:lines.slice(starts[i],starts[i+1])});
  }
  chunks.forEach((chunk,i)=>pages.push({id:i?m[1]+'_'+i:m[1],tag:'完整程式 · '+(i+1)+' / '+chunks.length,
    html:`<h2 class="code-title">${esc(name)}.ino</h2><p class="lead">第 ${chunk.start}～${chunk.start+chunk.lines.length-1} 行。</p><pre class="fullcode">${esc(chunk.lines.join('\n'))}</pre><p class="next">同一份 .ino 檔案；分頁不代表另開程式。</p>`}));
}
const pageNumbers = Object.fromEntries(pages.map((p,i)=>[p.id,i+1]));
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
    const media=name==='ESP32S3_1.png'
      ? `<svg viewBox="100 145 1460 625" style="width:${height*1460/625}mm;height:${height}mm;max-height:none;margin:auto;overflow:hidden" role="img" aria-label="${esc(caption)}"><image href="${uri}" width="1672" height="940"/></svg>`
      : name==='OLED_1.jpg'
      ? `<svg viewBox="325 655 435 420" style="width:${height*435/420}mm;height:${height}mm;max-height:none;margin:auto;overflow:hidden" role="img" aria-label="${esc(caption)}"><image href="${uri}" width="1108" height="1477"/></svg>`
      : name==='KY018_1.jpg'
      ? `<svg viewBox="350 540 290 640" style="width:${height*290/640}mm;height:${height}mm;max-height:none;margin:auto;overflow:hidden" role="img" aria-label="${esc(caption)}"><image href="${uri}" width="1108" height="1477"/></svg>`
      : `<img style="height:${height}mm" alt="${esc(caption)}" src="${uri}"/>`;
    return `<figure class="photo">${media}<figcaption>${esc(caption)}</figcaption></figure>`;
  });
  return marked.parse(body).replace(/href="([^"]+)"/g,(_,link)=>{
    if (/^(https?:|mailto:|data:|#)/i.test(link)) return 'href="'+link+'"';
    const [file, anchor] = link.split('#');
    const target = path.resolve(destination, decodeURIComponent(file));
    const repo = path.resolve(__dirname, '../../../..');
    const relative = path.relative(repo, target);
    if (relative.startsWith('..') || !fs.existsSync(target)) throw Error('Missing course file '+link);
    if(sourceAnchors.has(target)) return 'href="#'+sourceAnchors.get(target)+'"';
    if(answers) return 'href="'+pathToFileURL(target).href+(anchor?'#'+anchor:'')+'"';
    if(relative.includes('week3_answers')) throw Error('Private answer linked from Main');
    const url = relative.split(path.sep).map(encodeURIComponent).join('/');
    return 'href="https://github.com/KennethWYLee/IoT/blob/main/'+url+(anchor?'#'+anchor:'')+'"';
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
.write-space{border:1px solid #a7b9bc;margin:3mm 0 4mm;background:white}
.response-table td{height:13mm}
#exercisemeter figure.diagram{margin:2mm 0}#exercisemeter .diagram svg{max-height:52mm}
#allwiring .diagram svg{max-height:125mm}#oledwire .diagram svg{max-height:65mm}
@media screen{.page{margin:8mm auto;box-shadow:0 1px 6px #aaa}}
`;
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>'+title+'</title><style>'+css+'</style></head><body>'+pages.map((p,i)=>`<section id="${p.id}" class="page"><header><span>${esc(title)}</span><span>${esc(p.tag)}</span></header><main>${p.html||render(p.body)}</main><footer><span>${esc(title)}</span><span>${i+1} / ${pages.length}</span></footer></section>`).join('')+'</body></html>';
fs.writeFileSync(path.join(destination,stem+'.html'),html);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const tab=await browser.newPage();
  await tab.goto(pathToFileURL(path.join(destination,stem+'.html')).href);
  await tab.emulateMedia({media:'print'});
  await tab.evaluate(()=>document.fonts.ready);
  const audit=await tab.evaluate(()=>({
    images:[...document.images].map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0})),
    pages:[...document.querySelectorAll('.page')].map((p,i)=>{
      const m=p.querySelector('main'),f=p.querySelector('footer'),last=m.lastElementChild;
      const bounds=m.getBoundingClientRect();
      return {page:i+1,id:p.id,overflow:m.scrollHeight>m.clientHeight+1,gap:f.getBoundingClientRect().top-last.getBoundingClientRect().bottom,
        horizontal:[...m.querySelectorAll('*')].filter(e=>!(e instanceof SVGElement)&&e.getBoundingClientRect().right>bounds.right+2).map(e=>e.tagName),
        svgText:[...m.querySelectorAll('svg text')].filter(e=>{
          const r=e.getBoundingClientRect(),s=e.closest('svg').getBoundingClientRect();
          return r.left<s.left-2||r.right>s.right+2||r.top<s.top-2||r.bottom>s.bottom+2;
        }).map(e=>e.textContent)};
    })
  }));
  const links=await tab.locator('a').evaluateAll(items=>items.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
  for(const link of links)if(!fs.existsSync(path.resolve(__dirname,link)))throw Error('Missing local link '+link);
  fs.writeFileSync(path.join(tmp,'layout_check.json'),JSON.stringify(audit,null,2));
  const bad=audit.pages.filter(p=>p.overflow||p.gap<8||p.horizontal.length||p.svgText.length);
  if(bad.length||audit.images.some(i=>!i.loaded))throw Error(JSON.stringify({bad,images:audit.images}));
  const pdf=path.join(destination,stem+'.pdf');
  await tab.pdf({path:pdf,format:'A4',printBackground:true,preferCSSPageSize:true});
  const manifest={textHashLineEndings:'LF',pages:pages.map((p,i)=>({number:i+1,id:p.id})),sourceSha256:hash(input),builderSha256:hash(fs.readFileSync(__filename,'utf8')),sketches:inputs,photos:[...photoInputs].map(([name,sha256])=>({name,sha256})),pdfSha256:hash(fs.readFileSync(pdf))};
  fs.writeFileSync(path.join(destination,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,minimumGap:Math.min(...audit.pages.map(p=>p.gap)),pdf}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
