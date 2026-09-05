// Editable source for original Week 2 concept diagrams, not hardware photographs.
// Rebuild SVG/PNG assets and embedded PNG attachments. --check is read-only.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb');
const dir = path.join(root, 'docs/images/wiring');
const check = process.argv.includes('--check');
const ink='#183047', muted='#53667a', blue='#1765ad', red='#ad2944', green='#087768';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,size=24,color=ink,anchor='start',bold=false)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${bold?700:400}">${esc(s)}</text>`;
const line=(x,y,a,b,color=muted,w=3)=>`<line x1="${x}" y1="${y}" x2="${a}" y2="${b}" stroke="${color}" stroke-width="${w}"/>`;
const wire=(d,color=blue,w=4)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round"/>`;
const box=(x,y,w,h,fill='#f3f7fb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="#c6d4e0" stroke-width="2"/>`;
const dot=(x,y,color=blue,r=6)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function svg(title,desc,w,h,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><style>text{font-family:'Microsoft JhengHei','Noto Sans CJK TC',sans-serif}</style><rect width="${w}" height="${h}" fill="white"/>${t(32,49,title,32,ink,'start',true)}${body}</svg>\n`;}
function journey(){
 let b=t(32,94,'三段流程、三種證據；不是IDE真實畫面，也不是三支程式同時執行。');
 const rows=[['1  Verify／Compile','電腦的 .ino 原始碼','→','電腦產生韌體','證據：編譯成功與容量摘要。板子此時不一定已收到新版。'],['2  Upload','電腦 → COM USB → CH343','→','ESP32 Flash','證據：寫入、hash比對成功，且後續沒有錯誤。'],['3  Serial Monitor','ESP32執行程式並印文字','→','CH343 → 電腦Monitor','證據：自己的組別、新版本與預期事件，而非只看燈亮。']];
 rows.forEach((r,i)=>{const y=127+i*184;b+=box(28,y,1275,163)+t(48,y+39,r[0],27,blue,'start',true)+t(48,y+90,r[1],26)+t(650,y+90,r[2],32,green)+t(720,y+90,r[3],26)+t(48,y+134,r[4],23);});
 b+=t(32,735,'RST重啟板子Flash中的程式；只改電腦檔案或只Verify，不會把新版寫進板子。',25,red);
 b+=t(32,778,'COM8是此電腦的Port編號，不是GPIO8；CH343是通訊橋，不是執行sketch的CPU。',24);
 return svg('程式在哪裡？文字往哪裡走？','編譯在電腦，上傳寫入Flash，執行後Serial文字返回Monitor。',1330,815,b);
}
function memory(){
 let b=t(32,96,'以下使用先前候選按鈕程式的編譯摘要；示意框不按容量比例，不是本次重編譯結果。',23);
 b+=box(28,135,670,422)+t(52,179,'Flash：非揮發儲存',29,blue,'start',true)+t(52,224,'N16：整顆容量16,777,216 bytes',25);
 b+=box(52,252,620,185,'#e7f1ff')+t(76,294,'當次應用分割區 Maximum = 3,145,728',24)+t(76,342,'這支sketch = 302,598 bytes',27,blue,'start',true)+t(76,391,'302598 ÷ 3145728 ≈ 9.62%',27);
 b+=t(52,485,'其餘區域另有系統／其他分割用途。',24)+t(52,527,'9%不代表占用整顆16 MB Flash的9%。',24,red);
 b+=box(724,135,624,422)+t(747,179,'RAM：執行工作空間',29,green,'start',true)+t(747,224,'摘要預算：327,680 bytes',25);
 b+=box(747,252,578,185,'#e8f5ef')+t(768,294,'Global variables = 22,136 bytes',25)+t(768,342,'22136 ÷ 327680 ≈ 6.76%',27,green,'start',true)+t(768,391,'摘要剩餘：305,544 bytes',25);
 b+=t(747,485,'後續stack／heap／系統仍會用RAM。',24)+t(747,527,'6%不是完整執行期間的峰值用量。',24,red);
 b+=box(28,589,1320,132)+t(52,632,'R8 PSRAM是另一項額外RAM；要看runtime識別，不能由Global variables那行證明。',25)+t(52,683,'分割區、核心套件或程式變了，百分比可不同；不要為了數字好看而亂改設定。',25);
 return svg('兩個百分比，必須分開找分母','用歷史Verify數字比較Flash應用分割區與編譯時RAM摘要，PSRAM另行判定。',1380,751,b);
}
function pullup(){
 let b=t(32,93,'功能示意：輸入電路在晶片內部使用共同GND；不是照比例畫的板內配線圖。',23);
 for(let i=0;i<2;i++) {const x=28+i*680,cx=x+190;
  b+=box(x,126,653,600)+t(x+25,170,i?'按住：開關閉合':'放開：開關開路',28,ink,'start',true);
  b+=`<rect x="${x+18}" y="194" width="610" height="274" fill="#eaf4ff" stroke="${blue}" stroke-dasharray="9 6"/>`+t(x+37,229,'板上供電與ESP32內部功能',23,blue);
  b+=t(cx,268,'約3.3V',23,red,'middle')+line(cx,280,cx,305,red,4)+box(cx-25,305,50,62,'#fff3d8')+t(cx+38,340,'內部上拉電阻',23);
  b+=line(cx,367,cx,440,blue,4)+dot(cx,407)+line(cx,407,x+450,407,blue,4);
  b+=box(x+437,277,167,103,'#fff')+t(x+520,315,'輸入判定',23,ink,'middle')+t(x+520,353,i?'LOW':'HIGH',28,blue,'middle',true)+line(x+450,380,x+450,407,blue,4);
  b+=wire(`M${x+579} 380V679H${cx}`,green,3)+t(x+485,630,'內部共同地',20,green);
  b+=t(cx+22,495,'GPIO → 按鈕',22,blue)+line(cx,440,cx,521,blue,4)+dot(cx,521);
  b+=line(cx,521,i?cx:cx+48,571,blue,4)+dot(cx,571)+line(cx,571,cx,679,green,4)+dot(cx,679,green);
  b+=t(cx+65,594,i?'閉合，接回GND':'斷開，沒有這段通流',22)+t(cx+26,670,'外部GND線',23,green);
  b+=wire(`M${cx} 285H${x+76}V320`,red,3)+box(x+33,320,87,103,'#fff')+t(x+76,362,'板上',22,ink,'middle')+t(x+76,397,'供電',22,ink,'middle');
  b+=wire(`M${cx} 679H${x+76}V423`,green,3);
  if(i)b+=t(x+104,617,'↑',26,green);
  b+=t(x+27,712,i?'按鈕支路有小電流；上拉限制電流。':'GPIO被上拉維持HIGH；不是GPIO自動供電。',22);
 }
 b+=t(32,775,'true表示「按下」，不表示電壓HIGH；另一支測試輸出GPIO的狀態由程式另行命令。',25,blue);
 b+=t(32,820,'拿掉按鈕GND線只會中斷該支路，不表示USB供電的整片板子都沒有電流。',24);
 return svg('為何按下變LOW？上拉與GND如何形成路徑？','內部上拉接3.3V，按鈕放開為HIGH，按住接地為LOW，圖不表示晶片精確內部構造。',1380,855,b);
}
function nodes(){
 let b=t(32,95,'座標對應已核對方向的按鈕；GPIO依教師公布profile，圖不代表全班profile已發布。',23);
 const xs=[510,585,660,735,810],ys=[220,350,480,620],rows=[20,22,27,29];
 'abcde'.split('').forEach((c,i)=>b+=t(xs[i],157,c,25,ink,'middle',true));
 b+=t(954,157,'f',25,ink,'middle',true)+t(1234,157,'j',25,ink,'middle',true);
 ys.forEach((y,j)=>{b+=box(465,y-36,390,78)+line(510,y,810,y,'#a6b7c5',14)+t(425,y-15,rows[j],25);xs.forEach(x=>b+=dot(x,y,'white',11)+dot(x,y,ink,4));});
 const names=['測試輸出（候選5）','GND（棕）','按鈕輸入（候選4）'];
 [220,350,480].forEach((y,i)=>{b+=t(35,y-25,names[i],26)+(i===2?wire('M35 480H324Q340 458 356 480H510',red,4):line(35,y,510,y,[blue,green][i],4))+t(35,y+35,['橘線 → a20：TPO','棕線 → a22：TPG','紅線 → a27：BTN-A'][i],23);});
 b+=wire('M585 350V402H340V620H510',green,4)+t(36,675,'公對公 b22 → a29',25,green);
 b+=line(810,480,1234,480,muted,4)+line(810,620,1234,620,muted,4);
 b+=box(874,429,160,240,'#fff6df')+line(810,480,954,480,ink,5)+line(810,620,954,620,ink,5)+dot(954,480)+dot(954,620)+wire('M954 480L1000 592',ink,4);
 b+=t(1055,463,'按鈕內部A組',23)+t(1055,603,'按鈕內部B組',23)+t(1055,558,'按住才接A、B',23,blue);
 b+=t(877,400,'中央溝槽',22,muted)+t(1055,710,'e27↔f27原本同組',22)+t(1055,749,'e29↔f29原本同組',22);
 b+=t(32,726,'線交叉的拱橋處不連接；實際不要讓外露金屬相碰。',23,red);
 b+=t(32,762,'a29改b29：仍同節點；改a28：不同節點。右半部f／j本次不另外接線。',24);
 b+=t(32,808,'第20列TPO不可接第22列TPG。圖只畫用到的列，所有插線與通斷檢查先斷電。',24,red);
 return svg('四條線不是四個電源：沿節點追蹤每一條路','同側同列五孔互通，按鈕內部同組跨槽，按下才把27和29列接通。',1360,846,b);
}
function meter(){
 let b=t(32,96,'以下為示意LCD，不是新實測照片。兩欄都選「電阻區 Ω 200」，待測物完全斷電。',22);
 for(let i=0;i<2;i++){
  const x=28+i*507;
  b+=box(x,135,484,342)+t(x+23,178,i?'尖端穩定相碰':'兩支表筆分開',27,blue,'start',true);
  b+=`<rect x="${x+25}" y="207" width="434" height="101" rx="5" fill="#e5ecd8" stroke="#849271"/>`;
  b+=t(i?x+433:x+43,278,i?'0.6':'1',48,ink,i?'end':'start',true);
  b+=t(x+23,354,i?'0.6 Ω：低電阻通路':'左側單獨1：狀態提示',25,ink,'start',true);
  b+=t(x+23,401,i?'含表筆與接觸電阻，不必恰好0。':'開路或超量程，不是1 Ω。',23);
  b+=t(x+23,448,i?'若不穩定，先固定接觸與核對插孔。':'短接仍如此，先查接觸與插孔。',22);
 }
 b+=box(28,510,991,171,'#edf5ff')+t(50,552,'改成聲波符號的通斷檔，才用「蜂鳴」作判斷。',25,blue,'start',true);
 b+=t(50,599,'分開：不蜂鳴；穩定碰觸：應蜂鳴。不要求Ω 200一定會響。',24);
 b+=t(50,647,'蜂鳴有門檻，不代表剛好0 Ω；未確認的61、198、5x不補單位。',23);
 b+=box(28,716,991,158,'#fff5ef')+t(50,758,'黑COM、紅VΩmA；10A孔保持空置。',25,red,'start',true);
 b+=t(50,805,'V区的200是電壓量程，A區200m是電流量程；都不是Ω 200。'.replace('区','區'),23);
 b+=t(50,852,'本週不量電壓或電流；通斷由電表自己的電池提供小測試訊號。',23);
 return svg('數字在哪一邊？現在是什麼檔位？','A830L讀表示例：左側單獨1與右側0.6；區分Ω數值和通斷聲音。',1050,908,b);
}
function decision(){
 let b=t(32,94,'每次loop仍會讀輸入；DEBOUNCE_MS不是每次loop都delay同樣時間。',24);
 const labels=[['讀取raw與now','rawPressed = (digitalRead(PIN_BUTTON) == LOW)'],['raw與前一次不同？','是：保存新raw，changedAtMs = now；否：保留原起點'],['同時滿足兩個條件？','now − changedAtMs ≥ DEBOUNCE_MS，而且 raw ≠ stable'],['符合才接受一次','更新stable、輸出命令及計數；不符合則保持原狀']];
 labels.forEach((r,i)=>{const y=135+i*145;b+=box(32,y,1285,109)+t(57,y+41,r[0],28,blue,'start',true)+t(57,y+82,r[1],25);if(i<3)b+=t(657,y+143,'↓',31,green,'middle');});
 b+=t(32,768,'然後回到下一次loop。一直按住時raw等於stable，不會每輪重複增加press。',25);
 b+=t(32,810,'這是邏輯流程，不是接線圖；Serial列印仍可能增加輪詢間隔。',24,red);
 return svg('去抖判斷：重設起點，再檢查兩個條件','對應本課>=比較與raw stable邏輯，不直接照搬官方5V外部下拉接線。',1350,843,b);
}
function trace(y,events,end,x0,scale,startValue=false,color=blue){
 let v=startValue,prev=0,d=`M${x0} ${y+(v?55:0)}`;
 for(const [tm,nv]of events){d+=`H${x0+tm*scale}V${y+(nv?55:0)}`;prev=tm;v=nv;}
 d+=`H${x0+end*scale}`;return wire(d,color,4);
}
function timeline(){
 const x0=220,k=17;let b=t(32,93,'紙上模型：從5000 ms起觀察；每毫秒讀一次，5020之後持續LOW。',24);
 b+=t(35,180,'HIGH',24)+t(35,235,'LOW',24)+trace(173,[[0,true],[6,false],[11,true],[18,false],[20,true]],60,x0,k);
 for(const n of [0,6,11,18,20,50,60])b+=line(x0+n*k,280,x0+n*k,n===20?330:298,muted,2)+t(x0+n*k,n===20?358:321,String(5000+n),22,ink,'middle');
 b+=line(x0,283,x0+60*k,283,muted,2);
 b+=box(x0+20*k,366,30*k,68,'#e8f5ef')+t(x0+35*k,410,'最後一段連續30 ms',25,green,'middle',true);
 b+=t(35,486,'stable',25)+t(35,522,'未接受按下',20)+trace(480,[[50,true]],60,x0,k,false,green);
 b+=t(x0+50*k,580,'5050才接受',24,green,'middle',true);
 b+=box(28,620,1290,163)+t(51,665,'raw一共變5次；stable只接受1次按下。5049 − 5020 = 29：還不能接受。',25)+t(51,711,'5050 − 5020 = 30：兩條件都成立。5051仍LOW：raw等於stable，不再重複。',25)+t(51,756,'若實際loop到5053才檢查，可在5053接受；不是保證固定延遲的精密計時器。',24);
 return svg('不是從第一次LOW等30 ms：要從最後一次變化算','HIGH LOW波形為邏輯示意，5000到5020五次raw變化，5050接受。',1350,812,b);
}
function comparison(){
 let b=t(32,94,'模擬條件：同一段raw、每毫秒輪詢、忽略Serial耗時；不是實機按鈕波形。',24);
 const x=335,k=1.58,events=[[0,true],[3,false],[8,true],[200,false],[400,true],[450,false]];
 b+=t(36,147,'第一段含短暫反彈',22)+t(867,147,'第二次：短按50 ms',22,red);
 b+=t(32,205,'raw輸入',26,ink,'start',true)+trace(180,events,620,x,k);
 const states=[[[0,true],[3,false],[8,true],[200,false],[400,true],[450,false]],[[18,true],[210,false],[410,true],[460,false]],[[38,true],[230,false],[430,true],[480,false]],[[108,true],[300,false]]];
 [0,10,30,100].forEach((n,i)=>{const y=290+i*128;b+=t(32,y+22,`${n} ms → stable`,26,green,'start',true)+t(32,y+64,['3按／3放','2按／2放','2按／2放','1按／1放'][i],23);b+=trace(y,states[i],620,x,k,false,green);});
 [0,200,400,450,620].forEach(n=>b+=line(x+n*k,819,x+n*k,835,muted,2)+t(x+n*k,869,String(1000+n),23,ink,'middle'));
 b+=t(37,867,'time_ms',23)+t(32,929,'每條線上方＝放開、下方＝按下；線高低只是邏輯示意，不是電表電壓。',24);
 b+=t(32,972,'100 ms漏掉50 ms短按；0 ms接受了第一段反彈。這組數據不能證明30 ms永遠最好。',24,red);
 b+=t(32,1014,'1000～1008反彈在此全長圖很窄，精確事件時間請對照正文表格。',23);
 return svg('同一組輸入：等待越久，不一定越好','0 10 30 100ms對同一段合成raw的接受結果，含一次50ms短按。',1350,1050,b);
}
const figures=[['week2-program-journey',journey],['week2-memory-budget',memory],['week2-pullup-loop',pullup],['week2-breadboard-nodes',nodes],['week2-meter-reading',meter],['week2-debounce-decision',decision],['week2-debounce-timeline',timeline],['week2-debounce-comparison',comparison]];
async function main(){
 const nb=JSON.parse(fs.readFileSync(target,'utf8'));
 const photoKey='week2-a830l-multimeter.jpg';
 const photo=fs.readFileSync(path.join(root,'docs/images/hardware/actual/a830l-multimeter-actual-front.jpg'));
 const photoCells=nb.cells.filter(c=>c.source.join('').includes(`attachment:${photoKey}`));
 assert.equal(photoCells.length,1);const photoExpected={'image/jpeg':photo.toString('base64')};
 if(check)assert.deepEqual(photoCells[0].attachments?.[photoKey],photoExpected);
 else{photoCells[0].attachments??={};photoCells[0].attachments[photoKey]=photoExpected;}
 for(const [name,draw]of figures){
  const source=draw(),png=await sharp(Buffer.from(source),{density:120}).png().toBuffer();
  for(const [ext,data]of [['svg',Buffer.from(source)],['png',png]]){
   const file=path.join(dir,`${name}.${ext}`);
   if(check){
    if(ext==='svg')assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),source,file);
    else assert(fs.readFileSync(file).equals(data),file);
   }else fs.writeFileSync(file,data);
  }
  const key=`${name}.png`,cells=nb.cells.filter(c=>(Array.isArray(c.source)?c.source.join(''):c.source).includes(`attachment:${key}`));
  assert.equal(cells.length,1,key);const expected={'image/png':png.toString('base64')};
  if(check)assert.deepEqual(cells[0].attachments?.[key],expected);else{cells[0].attachments??={};cells[0].attachments[key]=expected;}
  console.log(`${check?'PASS':'BUILT'} ${key}`);
 }
 for(const c of nb.cells)if(c.attachments?.['week2-wiring.svg']){
  assert(!(Array.isArray(c.source)?c.source.join(''):c.source).includes('attachment:week2-wiring.svg'));
  if(check)throw Error('Obsolete SVG attachment');else delete c.attachments['week2-wiring.svg'];
 }
 if(!check){
  // Mechanical source normalization and sequential placement; existing cell IDs/photos retained.
  for(const c of nb.cells)if(typeof c.source==='string')c.source=c.source.match(/[^\n]*\n|[^\n]+$/g)||[];
  const meterIndex=nb.cells.findIndex(c=>/^## 七、萬用/m.test(c.source.join('')));
  const boardIndex=nb.cells.findIndex(c=>/^## 八、麵包板/m.test(c.source.join('')));
  assert(meterIndex>=0&&boardIndex>=0,'Meter and breadboard headings must exist');
  if(meterIndex>boardIndex){const [c]=nb.cells.splice(meterIndex,1);nb.cells.splice(boardIndex,0,c);}
  fs.writeFileSync(target,JSON.stringify(nb,null,1)+'\n');
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
