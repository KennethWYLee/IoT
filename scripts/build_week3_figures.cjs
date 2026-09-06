// Original, code-native teaching diagrams. This is the editable design source.
// Generate SVG + PNG and embed PNGs/one original photo into the Week 3 notebook.
// npm dependency: sharp (use NODE_PATH when supplied by a bundled runtime).
// No hardware interaction. --check compares artifacts without writing.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/images/wiring');
const notebook = path.join(root, 'IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb');
const check = process.argv.includes('--check');
const ink = '#183047', muted = '#52657a', blue = '#1765ad', red = '#ae2842', green = '#087768';
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = (x,y,s,size=24,color=ink,anchor='start',weight=400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${esc(s)}</text>`;
const line = (x1,y1,x2,y2,color=muted,width=3,dash='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const wire = (d,color=muted,width=4) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;
const box = (x,y,w,h,fill='#f3f7fb',stroke='#ccd7e1',r=12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const dot = (x,y,color=ink,r=6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function svg(title,desc,w,h,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>
<style>text{font-family:'Microsoft JhengHei','Noto Sans CJK TC',sans-serif}</style>
<rect width="${w}" height="${h}" fill="white"/>${text(32,48,title,32,ink,'start',700)}${body}
</svg>\n`;}

function probes(){
  let b=text(32,90,'直流電壓檔：顯示值＝紅表筆所在電位 − 黑表筆所在電位。以下為概念例子。',23);
  const cases=[['正常方向','第6列：3V3','第3列：GND','3.3 − 0 ≈ +3.3 V'],['交換表筆方向','第3列：GND','第6列：3V3','0 − 3.3 ≈ −3.3 V'],['量同一節點','第6列：3V3','第6列：3V3','3.3 − 3.3 ≈ 0 V']];
  cases.forEach((c,i)=>{const x=28+i*397;
    b+=box(x,123,378,423)+text(x+20,165,c[0],26,ink,'start',700);
    b+=text(x+22,218,'紅表筆',24,red)+text(x+22,257,c[1],25);
    b+=line(x+24,279,x+354,279,'#cfdae4',2);
    b+=text(x+22,324,'黑表筆',24,ink)+text(x+22,364,c[2],25);
    b+=box(x+16,408,346,102,'#eaf4ff','#90b7db')+text(x+189,470,c[3],26,blue,'middle',700);
  });
  b+=text(32,591,'a6～e6是同一節點的入口；a3～e3也是。第6列與第3列不是同一節點。',24);
  b+=text(32,634,'電表用內部高輸入電阻量測，不是用普通導線直接連接第6列與第3列。',24,red);
  b+=text(32,677,'同點讀到0 V，不代表整片板子沒電；負號也不表示應交換板上的供電線。',24);
  return svg('電壓像尺：先說清楚在比較哪兩個位置','三種表筆方向比較。示意數字非新增實測，所有移線先斷電。',1230,710,b);
}

function ohmsReading(){
  let b=text(32,92,'理想紙上例子：只有一顆1 kΩ電阻；忽略電表分流。不新增實驗、不用電流檔。',23);
  b+=text(32,139,'電壓表另外跨在A、B兩點；不是串進主路徑。',25,blue,'start',700);
  b+=box(56,314,170,173,'#edf4fb')+text(141,359,'理想電源',25,ink,'middle',700);
  b+=text(141,404,'兩端3.0 V',25,ink,'middle')+text(141,450,'維持電位差',22,muted,'middle');
  b+=wire('M141 314V229H484V339',red,5)+wire('M484 433V572H141V487',green,5);
  b+=box(459,339,50,94,'#fff5d9','#ad914f',3)+text(370,373,'1 kΩ',26,ink,'end',700)+text(370,411,'1000 Ω',23,ink,'end');
  b+=dot(484,229,red,8)+dot(484,572,green,8)+text(463,198,'A：相對B為+3.0 V',24,red,'end');
  b+=text(464,614,'B：GND，選作0 V',24,green,'end');
  b+=text(275,267,'→ 主路徑',24,green)+text(519,493,'↓ 3 mA（計算）',23,green)+text(270,552,'← 回程',24,green);
  b+=wire('M484 229H824V331',red,4)+wire('M484 572H824V465',ink,4);
  b+=text(649,204,'紅表筆：接A',24,red)+text(653,610,'黑表筆：接B',24,ink);
  b+=box(691,331,267,134,'#e8eef3','#74899d')+box(710,350,228, 60,'#e5ecd8','#849271',4);
  b+=text(824,393,'3.00',38,ink,'middle',700)+text(824,447,'V⎓ 20（不是A檔）',21,blue,'middle');
  b+=box(32,659,951,181)+text(55,702,'電表回答：A比B高3.00 V。',26,blue,'start',700);
  b+=text(55,750,'計算回答：I＝3.0 V ÷ 1000 Ω＝0.003 A＝3 mA。',25);
  b+=text(55,797,'兩個數字都有3，但量不同、單位不同；不是電表讀到3 mA。',24,red);
  return svg('讀到3.0 V，怎麼算出3 mA？','單電阻閉合迴路與並聯電壓表；A-B電壓和相同電阻才可代入歐姆定律。示意非實測。',1015,873,b);
}

function meterScale(){
  let b=text(32,92,'下方是模擬LCD，不是實拍或新實測。檔位標在螢幕外；先看功能，再讀小數點。',22);
  const cases=[
    ['Ω 200；外部斷電','0.6','0.6 Ω','短接表筆：低電阻通路。'],
    ['Ω 200k；模組斷電','0.6','0.6 kΩ＝600 Ω','不能與上一列當成相同阻值。'],
    ['V⎓ 20；模組供電','0.60','+0.60 V','紅S、黑GND：兩點電位差。'],
    ['Ω 20k；模組斷電','1','不填數值與Ω','左側單獨1：超量程或開路提示。'],
    ['Ω 20k；模組斷電','1.00','1.00 kΩ＝1000 Ω','正常有效數字，不是上一列的提示。']
  ];
  cases.forEach((c,i)=>{const y=127+i*184;
    b+=box(28,y,945,167)+text(50,y+39,c[0],24,blue,'start',700);
    b+=box(49,y+61,257,81,'#e5ecd8','#849271',4);
    b+=text(i===3?68:287,y+117,c[1],40,ink,i===3?'start':'end',700);
    b+=text(339,y+91,c[2],28,ink,'start',700)+text(339,y+134,c[3],23);
  });
  b+=text(32,1090,'蜂鳴檔有聲音≠0 Ω；未核對檔位的「61」不能補上Ω。',24,red);
  return svg('相似的數字，可能是完全不同的量','模擬LCD對照200歐姆、200k歐姆、20伏特及左側單獨1與有效1.00。',1005,1126,b);
}

function current(){
  let b=text(32,90,'圖只比較外部電阻負載。箭頭為傳統電流方向；不是要求實際斷線或短接。',23);
  ['完整負載路徑','負載路徑中斷','禁止實作：電源短接'].forEach((label,i)=>{
    const x=28+i*397, cx=x+235, color=i===2?red:green;
    b+=box(x,125,378,600,i===2?'#fff4f4':'#f5f9fc')+text(x+18,166,label,25,i===2?red:ink,'start',700);
    b+=box(x+23,285,118,160,'#e9f2f7')+text(x+82,334,'供電電路',22,ink,'middle')+text(x+82,374,'維持兩端',21,ink,'middle')+text(x+82,409,'電位差',21,ink,'middle');
    b+=wire(`M${x+82} 285V222H${cx}V267`,color)+dot(cx,222,color)+text(cx+14,229,'3V3',22,color);
    if(i<2){
      b+=box(cx-24,267,48,74,'#fff5d9','#ad914f',3)+text(cx+34,310,'10 kΩ',21);
      b+=line(cx,341,cx,366,color,4);
      b+=line(cx,i===1?395:366,cx,415,color,4);
      if(i===1)b+=text(cx+14,387,'斷開',21,red);
      b+=box(cx-24,415,48,74,'#fff5d9','#ad914f',3)+text(cx+34,460,'1 kΩ',21);
      b+=line(cx,489,cx,530,color,4);
    }else{
      b+=line(cx,267,cx,530,red,6)+text(cx+17,360,'只剩',21,red)+text(cx+17,393,'導線',21,red);
    }
    b+=wire(`M${cx} 530H${x+82}V445`,color)+dot(cx,530,color)+text(cx+12,538,'GND',21,color);
    if(i!==1)b+=text(x+188,252,'→',29,color)+text(x+170,525,'←',29,color);
    const notes=i===0?['電流經兩顆電阻再回電源。','3.3 V ÷ 11 kΩ = 0.30 mA','這是計算，不用電流檔量。']:i===1?['原來的負載支路不能持續通流。','不代表整片ESP32都沒電。','USB仍可能供應板上其他電路。']:['繞過電阻，電流可能過大。','實際電流受電源與線路限制。','不要為了觀察而搭這種接法。'];
    notes.forEach((s,j)=>b+=text(x+18,603+j*37,s,21,i===2?red:ink));
  });
  b+=text(32,775,'串聯電阻消耗的是電能，不是把電流分成兩半；電源讓迴路能持續運作。',24);
  return svg('封閉迴路不是「再把3V3直接接回GND」','三個概念電路分別為正常串聯、中斷及禁止短接。不是板內接線圖。',1230,810,b);
}

function kyBreadboard(){
  let b=text(32,92,'只畫本實驗使用的左半部a～e；同列有內部金屬片，不同列沒有直接橋接。',24);
  const xs=[435,500,565,630,695];
  ['a','b','c','d','e'].forEach((s,i)=>b+=text(xs[i],144,s,26,ink,'middle',700));
  const rows=[
    {n:3,y:230,from:['ESP32 GND','棕線 → a3'],c:['綠線 → 模組−','共同地，不是負電源'],e:['黑色延長線','黑表筆的PGND測點'],color:'#795548'},
    {n:6,y:425,from:['ESP32 3V3','紅線 → a6'],c:['橘線 → 模組M','M：已核對的中間供電腳'],e:['白色延長線','只量3V3電源，不是S'],color:red},
    {n:15,y:620,from:['模組S','黃線 → a15'],c:['藍線母頭先留空','更換程式、斷電及profile確認後才接ADC'],e:['S測試延長線','紅表筆量S時用這個端點'],color:'#a77700'}
  ];
  for(const r of rows){
    b+=box(24,r.y-73,1268,155,'#f7fafc');
    b+=text(44,r.y-23,r.from[0],25,ink,'start',700)+text(44,r.y+20,r.from[1],24,r.color);
    b+=line(285,r.y,435,r.y,r.color,4)+text(345,r.y-13,`第${r.n}列`,23);
    b+=line(435,r.y,695,r.y,'#97a9b9',15);
    xs.forEach((x,i)=>{b+=dot(x,r.y,'white',13)+dot(x,r.y,ink,5)+text(x,r.y+48,`${'abcde'[i]}${r.n}`,21,ink,'middle');});
    b+=wire(`M565 ${r.y}V${r.y-47}H765`,r.n===15?blue:green,3);
    b+=text(782,r.y-43,r.c[0],24,r.n===15?blue:green)+text(782,r.y-12,r.c[1],21);
    b+=wire(`M695 ${r.y}H750V${r.y+33}H765`,muted,3)+text(782,r.y+32,r.e[0],24)+text(782,r.y+64,r.e[1],21);
  }
  b+=text(32,760,'a15、c15、e15是同一個S節點，不是把訊號逐段分壓。',25,blue,'start',700);
  b+=text(32,805,'中央溝槽另一側f～j是另一組：f15不是S，除非另外接線；本實驗不跨過去。',24);
  b+=text(32,850,'功能與座標示意，非板卡排針排列圖。所有改線都先拔USB，不能由線色決定功能。',23,red);
  return svg('從模組追到麵包板：三列、三個不同節點','第3列為GND，第6列為3V3，第15列為S。a、c、e各接不同導線但同列同節點。',1320,885,b);
}

function divider(){
  let b=text(32,92,'三欄皆為理想計算：上方固定10 kΩ、供電3.3 V，忽略量測負載。不是新增三種光線實驗。',23);
  const cases=[{r:10,v:1.65,top:1.65,i:'0.165'},{r:20,v:2.20,top:1.10,i:'0.110'},{r:1,v:0.30,top:3.00,i:'0.300'}];
  cases.forEach((c,j)=>{const x=25+j*454,cx=x+90;
    b+=box(x,127,432,555)+text(x+20,167,`下方光敏電阻假設為 ${c.r} kΩ`,25,ink,'start',700);
    b+=text(cx,213,'3.30 V',25,red,'middle')+line(cx,226,cx,263,red,4);
    b+=box(cx-25,263,50,73,'#fff5d9','#ad914f',3)+text(x+142,291,'固定10 kΩ',23)+text(x+142,324,`兩端差 ${c.top.toFixed(2)} V`,24);
    b+=line(cx,336,cx,401,blue,4)+dot(cx,369,blue)+text(x+142,378,`S = ${c.v.toFixed(2)} V`,28,blue,'start',700);
    b+=box(cx-25,401,50,73,'#fff5d9','#ad914f',3)+text(x+142,429,`光敏 ${c.r} kΩ`,23)+text(x+142,462,`兩端差 ${c.v.toFixed(2)} V`,24);
    b+=line(cx,474,cx,518,green,4)+dot(cx,518,green)+text(x+142,527,'GND = 0 V',24,green);
    b+=text(x+20,589,`整條串聯電流：${c.i} mA`,24)+text(x+20,631,`${c.top.toFixed(2)} + ${c.v.toFixed(2)} = 3.30 V`,25,blue);
  });
  b+=text(32,736,'供電不變，S也能改變；決定位置的是「下方電阻／總電阻」的比例。',26,blue,'start',700);
  b+=text(32,783,'同一顆10 kΩ不會固定扣掉1.65 V。只知道3.3 V與一顆電阻，還不能求出S。',24);
  return svg('分壓分的是兩段電壓差，不是把電流分成兩半','10k與10k、20k、1k三種理想模型，對照S電位、電流及上下兩段電壓差。',1395,820,b);
}

function resistorBoard(){
  let b=text(32,92,'只使用1 kΩ與10 kΩ各一顆。先預測；不接GPIO、KY-018、5Vin或電流檔。',24);
  b+=box(26,125,741,662)+text(53,170,'接法A：上10 kΩ，下1 kΩ',27,ink,'start',700);
  const xs=[150,260,370,480,590], ys=[250,450,650], rows=[20,25,30];
  'abcde'.split('').forEach((c,i)=>b+=text(xs[i],211,c,25,ink,'middle',700));
  ys.forEach((y,j)=>{b+=line(150,y,590,y,'#97a9b9',15)+text(76,y+8,rows[j],25);xs.forEach((x,i)=>{const onLead=(j===0&&i===1)||(j===1&&i===3);b+=dot(x,y,'white',13)+dot(x,y,ink,5)+text(onLead?x+23:x,y+44,`${'abcde'[i]}${rows[j]}`,onLead?19:21,ink,onLead?'start':'middle');});});
  b+=line(260,250,260,310,red,4)+box(236,310,48,80,'#fff5d9','#ad914f',3)+line(260,390,260,450,blue,4);
  b+=text(305,342,'10 kΩ',25)+text(305,376,'b20 ↔ b25',23);
  b+=line(480,450,480,510,blue,4)+box(456,510,48,80,'#fff5d9','#ad914f',3)+line(480,590,480,650,green,4);
  b+=text(296,543,'1 kΩ',25)+text(296,580,'d25 ↔ d30',23);
  b+=wire('M150 250H111V225',red,4)+wire('M150 650H111V678',green,4)+text(620,256,'供電節點',22,red);
  b+=text(54,724,'b6 → a20：已核對的3V3',24,red)+text(54,764,'b3 → a30：共同GND',24,green);
  b+=wire('M590 450H716V425',red,4)+text(603,388,'e25延長端',21,red)+text(603,418,'紅表筆',23,red);
  b+=text(620,657,'GND節點',22,green);
  b+=box(795,125,485,300,'#edf5ff','#a7c5e2')+text(817,169,'接法B：斷電後才交換',27,blue,'start',700);
  ['b20 ↔ b25 改放1 kΩ','d25 ↔ d30 改放10 kΩ','其餘線與測點全部保持不變。','不是調換表筆，也不是電源反接。'].forEach((s,i)=>b+=text(817,226+i*49,s,i<2?25:23));
  b+=box(795,453,485,334)+text(817,500,'電表：直流V⎓ 20',27,ink,'start',700);
  b+=text(817,551,'紅表筆 → e25的S_R延長端',24,red)+text(817,599,'黑表筆 → e3的PGND延長端',24);
  b+=text(817,654,'第25列：b25、d25、e25相通。',23)+text(817,699,'兩顆電阻在此相接，沒有被繞過。',23)+text(817,752,'USB供電前，核對每一端座標。',23,red);
  b+=text(32,838,'孔位示意，列距非實物比例。第20、25、30列彼此分開；電阻兩腳不能插同一五孔組。',23);
  b+=text(32,881,'藍圖只表示設計接法，不是已完成實機驗證；預期值與解釋見第13.8節。',23,muted);
  return svg('把分壓真正搭出來：三個節點、兩顆電阻','接法A上電阻b20-b25下電阻d25-d30，電表紅e25黑e3；接法B只交換阻值。',1310,915,b);
}

function memory(){
  let b=text(32,92,'Verify在電腦上產生編譯摘要；不是在讀取板子的即時記憶體占用。框格不按容量比例繪製。',23);
  b+=box(28,128,662,510,'#f4f8ff','#a6bdd8')+text(52,177,'Flash：存放程式的「倉庫」',28,blue,'start',700);
  b+=text(52,225,'BOARD-T01曾回報16,777,216 bytes',24)+text(52,265,'實體Flash總容量；不是下方21%的分母。',24);
  b+=box(53,303,611,303,'white','#a6bdd8')+text(76,348,'本次設定給程式的一間房間',27,blue,'start',700);
  b+=text(76,394,'Maximum：1,310,720 bytes',26)+text(76,440,'Sketch uses：286,973 bytes',26);
  b+=box(78,471,557,29,'#e4eaf1','#e4eaf1',3)+box(78,471,557*286973/1310720,29,'#1765ad','#1765ad',3);
  b+=text(76,545,'IDE顯示21%：相對這間房的上限。',25)+text(76,580,'不是整棟16 MB倉庫占用21%。',24);
  b+=box(715,128,579,350,'#f2faf6','#9cc6b5')+text(741,177,'RAM：執行時的「工作桌」',28,green,'start',700);
  b+=text(741,227,'摘要上限：327,680 bytes',25)+text(741,270,'已計入靜態配置：21,936 bytes（6%）',23);
  b+=text(741,318,'此階段剩餘：305,744 bytes',25)+text(741,370,'程式跑起來還會使用暫存與動態空間。',23)+text(741,421,'不是「執行時永遠只用6%」。',25,green);
  b+=box(715,500,579,138,'#fff8ed','#d8c399')+text(741,543,'PSRAM：另外的記憶體配置',26,ink,'start',700)+text(741,588,'本板曾回報8 MB；不是上面6%的分母。',23);
  b+=text(32,697,'21%與6%不能相加：分母不同，儲存程式與執行時用的空間也不同。',27,blue,'start',700);
  b+=text(32,745,'這是既有編譯紀錄的格式解讀。修改程式或設定後數字可能改變，不必追求同一個百分比。',23);
  return svg('Sketch uses與Global variables：兩行在說不同空間','對照Flash總量與程式分割區、RAM編譯配置及PSRAM，保留不同分母與時點。',1320,780,b);
}

const figures = [
  ['week3-voltage-probes',probes],['week3-current-loop',current],
  ['week3-ohms-law-reading',ohmsReading],['week3-meter-scale',meterScale],
  ['week3-ky018-breadboard',kyBreadboard],['week3-divider-comparison',divider],
  ['week3-resistor-breadboard',resistorBoard],['week3-memory-summary',memory]
];
async function main(){
  const nb=JSON.parse(fs.readFileSync(notebook,'utf8'));
  // The additive classifier owns its three cells; preserve them while maintaining
  // the twenty original measurement/ADC cells and their existing attachments.
  const classifierCells=nb.cells.filter(c=>c.metadata?.maintenance_source==='week3_classification.source.md');
  assert.equal(nb.cells.length-classifierCells.length,20,'Unexpected base notebook structure');
  assert([0,3].includes(classifierCells.length),'Unexpected classifier extension structure');
  // Relocate existing original bytes when a photo's first-use explanation moves.
  // Never synthesize or retouch the evidence photographs.
  for(const key of ['week3-a830l-multimeter.jpg','week3-ky018-pin-labels.jpg','week3-ky018-solder.jpg']){
    const sourceCells=nb.cells.filter(c=>c.attachments?.[key]);
    const destCells=nb.cells.filter(c=>c.source.join('').includes(`attachment:${key}`));
    assert.equal(destCells.length,1,key);assert(sourceCells.length>0,key);
    const payload=sourceCells[0].attachments[key];
    for(const c of sourceCells)assert.deepEqual(c.attachments[key],payload);
    if(check)assert.deepEqual(sourceCells,destCells,`Relocate original ${key}`);
    else{for(const c of sourceCells)if(c!==destCells[0])delete c.attachments[key];destCells[0].attachments??={};destCells[0].attachments[key]=payload;}
    if(key==='week3-a830l-multimeter.jpg'){
      const original=Buffer.from(payload['image/jpeg'],'base64');
      const photoPath=path.join(root,'docs/images/hardware/actual/a830l-multimeter-actual-front.jpg');
      if(check||fs.existsSync(photoPath))assert(fs.readFileSync(photoPath).equals(original),'Original meter photo changed');
      else fs.writeFileSync(photoPath,original); // Lossless extraction of the existing attachment.
    }
  }
  for(const [name,draw] of figures){
    const source=draw(), png=await sharp(Buffer.from(source),{density:120}).png().toBuffer();
    for(const [ext,data] of [['svg',Buffer.from(source)],['png',png]]){
      const dest=path.join(output,`${name}.${ext}`);
      if(check)assert.ok(fs.readFileSync(dest).equals(data),`Rebuild ${dest}`);else fs.writeFileSync(dest,data);
    }
    const key=`${name}.png`, cells=nb.cells.filter(c=>c.source.join('').includes(`attachment:${key}`));
    assert.equal(cells.length,1,`Expected one reference for ${key}`);
    const expected={'image/png':png.toString('base64')};
    if(check)assert.deepEqual(cells[0].attachments?.[key],expected,`Attachment stale: ${key}`);
    else{cells[0].attachments??={};cells[0].attachments[key]=expected;}
    console.log(`${check?'PASS':'BUILT'} ${key}`);
  }
  // Embed the original, unmodified label photo so offline/GitHub readers do not depend on a relative image URL.
  const photoKey='week3-ky018-pin-labels.jpg', photoRelative='../../docs/images/hardware/actual/ky018-photoresistor-module-actual-pin-labels.jpg';
  const photo=fs.readFileSync(path.resolve(path.dirname(notebook),photoRelative));
  const photoCell=nb.cells.find(c=>c.source.join('').includes(`attachment:${photoKey}`));
  const photoExpected={'image/jpeg':photo.toString('base64')};
  if(check){assert.deepEqual(photoCell.attachments?.[photoKey],photoExpected);assert.ok(photoCell.source.join('').includes(`attachment:${photoKey}`));}
  else{photoCell.attachments??={};photoCell.attachments[photoKey]=photoExpected;photoCell.source=photoCell.source.map(l=>l.replace(photoRelative,`attachment:${photoKey}`));}
  // Superseded SVG-only functional picture is replaced by the readable coordinate PNG above.
  for(const cell of nb.cells)if(cell.attachments?.['week3-ky018-wiring.svg']){
    assert.ok(!cell.source.join('').includes('attachment:week3-ky018-wiring.svg'));
    if(!check)delete cell.attachments['week3-ky018-wiring.svg'];
  }
  if(!check)fs.writeFileSync(notebook,JSON.stringify(nb,null,1)+'\n');
  console.log('PASS original photo preserved; notebook has a single reference per generated figure.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
