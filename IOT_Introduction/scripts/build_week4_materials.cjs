// Week 4 only: authored SVG diagrams -> PNG -> notebook attachments.
// Canonical prose: week4_main.source.md; code: IOT_Introduction/examples/week04_*/*.ino.
// --check is read-only. Never rebuild or alter Week 2 / Week 3 assets.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const crypto=require('node:crypto'), sharp=require('sharp');
const root=path.resolve(__dirname, '../..'), check=process.argv.includes('--check');
const sourcePath=path.join(root,'IOT_Introduction/docs/course_materials/week4_main.source.md');
const notebookPath=path.join(root,'IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.ipynb');
const ink='#183047',blue='#1765ad',red='#ae2842',green='#087768',muted='#52657a';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,size=25,color=ink,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
const box=(x,y,w,h,fill='#f3f7fb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#bccbd8" stroke-width="2"/>`;
const line=(x,y,x2,y2,color=muted,width=3)=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const dot=(x,y,color=ink)=>`<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>`;
const arr=(x,y,x2,y2,color=blue)=>line(x,y,x2,y2,color,4)+`<path d="M ${x2-10} ${y2-7} L ${x2} ${y2} L ${x2-10} ${y2+7}" fill="none" stroke="${color}" stroke-width="3"/>`;
function svg(title,subtitle,h,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}" role="img"><title>${esc(title)}</title><desc>${esc(subtitle)}</desc><style>text{font-family:'Microsoft JhengHei','Noto Sans CJK TC',sans-serif}</style><rect width="1200" height="${h}" fill="white"/>${t(30,48,title,32)}${t(30,91,subtitle,23,muted)}${body}</svg>\n`;}
const figures={};
{
 let b=''; const rows=[['四環 220 Ω ±5%',['#df3427','#df3427','#8b4d22','#c9a43b'],'2、2 → 22 × 10 Ω；金色±5%'],['四環 330 Ω ±5%',['#ef8720','#ef8720','#8b4d22','#c9a43b'],'3、3 → 33 × 10 Ω；金色±5%'],['五環 220 Ω ±1%',['#df3427','#df3427','#151515','#151515','#8b4d22'],'2、2、0 → 220 × 1 Ω；棕色±1%'],['五環 330 Ω ±1%',['#ef8720','#ef8720','#151515','#151515','#8b4d22'],'3、3、0 → 330 × 1 Ω；棕色±1%']];
 rows.forEach(([name,colors,note],i)=>{let y=125+i*150;b+=box(25,y,1150,133)+t(45,y+36,name,26,blue)+line(60,y+86,410,y+86)+box(95,y+56,270,58,'#f7e4b4');colors.forEach((c,j)=>{const x=112+j*39+(j===colors.length-1?30:0);b+=`<rect x="${x}" y="${y+57}" width="17" height="56" fill="${c}"/>`;});b+=t(450,y+89,note,26);});
 b+=t(30,767,'由讀取端向容差環讀；沒有確定方向或色環數時，先查包裝與規格。',24,red);
 figures['resistor-bands']=svg('色環表示標稱阻值，不是當下量測值','教學示意，非本包電阻實拍；四色／五色環的讀法不能混用。',800,b);
}
{
 let b='';[['200 Ω檔','1 / OL','220 Ω可能超量程','不是「1 Ω」'],['2 kΩ檔','220 Ω','此圖直接寫出單位','實際LCD依表型號'],['20 kΩ檔','0.22 kΩ','0.22 × 1000 = 220 Ω','較粗顯示可能隱藏差異']].forEach((a,i)=>{let x=25+i*393;b+=box(x,135,375,350)+t(x+22,180,a[0],29,blue)+box(x+20,206,335,95,'#e4ecd8')+t(x+187,270,a[1],38,ink,'middle')+t(x+18,355,a[2],23)+t(x+18,411,a[3],23);});
 b+=t(30,543,'模擬LCD：圖上的單位用來教判讀，不宣稱所有A830L版本都這樣顯示。',24);
 b+=t(30,596,'330 Ω同理；先確認Ω功能。換量程改變可讀範圍／細節，不改變電阻本身。',24);
 b+=t(30,649,'沒有外部供電；電阻與其他支路分離。不要用10A孔或電流檔。',24,red);
 figures['meter-ranges']=svg('同一顆電阻，換量程要連單位一起讀','220 Ω的理想顯示示例，非實測；實表可能有OL、左側1或不同小數位。',685,b);
}
{
 let b=box(40,140,590,430)+t(65,185,'隔離的麵包板左半區 a～e',26,blue);
 ['a','b','c','d','e'].forEach((s,i)=>b+=t(160+i*85,235,s,24,ink,'middle'));
 [20,25].forEach((r,j)=>{let y=310+j*180;b+=t(80,y+8,`列${r}`,24)+line(160,y,500,y,green,9);for(let i=0;i<5;i++)b+=dot(160+i*85,y);});
 b+=line(245,310,245,355)+box(224,355,42,84,'#f7e4b4')+line(245,439,245,490)+t(298,388,'電阻：b20 ↔ b25',25)+t(298,426,'220 Ω或330 Ω',24);
 b+=line(500,310,790,310,red)+line(500,490,790,490,ink)+box(790,260,360,285,'#edf2f4')+t(970,304,'電表 Ω',30,blue,'middle')+t(970,365,'跨在電阻兩端',26,ink,'middle')+t(818,417,'紅：e20延長端',24,red)+t(818,466,'黑：e25延長端',24);
 b+=t(30,620,'同列b20與e20相通；b25與e25相通。第20列與第25列只經電阻相連。',24);
 b+=t(30,668,'沒有ESP32、USB、3V3或GND供電線。電表用自己的測試電路量阻值。',24,red);
 figures['resistor-measurement']=svg('把量測端固定，比同時捏住兩根表筆容易','節點示意，非按孔比例的實物照片；所有插線在外部電源分離後進行。',710,b);
}
{
 let b=t(30,146,'一輪開始 → 等500 ms → 第1筆 → …… → 第10筆 → 停止',27,blue);
 b+=line(95,245,1100,245);
 for(let i=0;i<10;i++){let x=105+i*108;b+=dot(x,245,blue)+t(x,206,`${i+1}`,25,ink,'middle')+t(x,291,`${(i+1)*500}`,21,muted,'middle');}
 b+=t(30,340,'上排：筆序；下排：相對輪次開始的理想毫秒。實際以log為準。',24);
 b+=box(35,385,1130,139)+t(60,432,'第1筆到第10筆：10 − 1 = 9個間隔',29,blue)+t(60,480,'9 × 500 ms = 4500 ms = 4.5秒；不是10個間隔。',27);
 b+=t(30,577,'室內光：固定模組、方向、供電、間隔 → 記10筆。',26);
 b+=t(30,625,'遮光：只增加固定遮光物，其餘相同 → 另記10筆。',26);
 b+=t(30,677,'有波動不立即判壞；缺筆不補造。10筆平均不能代替原始log。',25,red);
 figures['sample-window']=svg('取樣是一串有時間與條件的觀察','教學時間示例，不是實體ESP32精確排程量測。',715,b);
}
function threshold(overlap){let b=''; const x=v=>100+v*.83;
 b+=line(100,440,1100,440);for(let v=0;v<=1200;v+=200)b+=line(x(v),433,x(v),449)+t(x(v),478,v,22,ink,'middle');
 const ranges=overlap?[[300,700,'室內光',blue,220],[600,1000,'遮光',green,340]]:[[300,320,'室內光',blue,220],[900,920,'遮光',green,340]];
 for(const [a,z,label,c,y]of ranges){b+=t(40,y-43,`${label}：${a}～${z}`,26,c)+line(x(a),y,x(z),y,c,18)+dot(x(a),y,c)+dot(x(z),y,c);}
 if(overlap){b+=`<rect x="${x(600)}" y="170" width="${x(700)-x(600)}" height="240" fill="#ae2842" opacity=".14"/>`+t(600,143,'600～700：同一raw可能來自兩種條件',25,red)+t(30,542,'區間重疊 → 不建立可保證分開的單一門檻。',29,red)+t(30,595,'例如raw=650：只看數字，無法知道真實是室內光或遮光。',25);}
 else{b+=line(x(610),170,x(610),440,red)+t(x(610),149,'610',28,red,'middle')+t(30,542,'門檻 = (320 + 900) ÷ 2 = 610',30,blue)+t(30,590,'raw ≤ 610 → INDOOR；raw > 610 → SHADE（本例方向）。',26)+t(30,641,'用另一輪新資料驗證；落在空隙也不等於曾有充分校正資料。',24,red);}
 b+=t(30,690,'raw是ADC原始碼，無電壓／照度單位；數據為教學示例。',24,muted);
 return svg(overlap?'當兩組重疊，平均中點不是保證':'相對門檻：只在本地條件下比較', '橫軸為raw，彩色線是這次各條件觀察區間，不是未來所有可能值。',730,b);}
figures['threshold-separated']=threshold(false);figures['threshold-overlap']=threshold(true);
{
 let b=box(30,140,300,390)+box(850,140,320,390);
 b+=t(65,185,'ESP32（已核准）',28,blue)+t(885,185,'KY-018（已核對）',27,green);
 [['3V3','M：供電',235,red,'a6 ↔ c6'],['GND','−：GND',350,ink,'a3 ↔ c3'],['ADC GPIO','S：類比訊號',465,blue,'c15 ↔ a15']].forEach(([a,z,y,c,m])=>{b+=t(55,y,a,25,c)+t(880,y,z,25,c)+line(330,y-8,850,y-8,c,4)+t(590,y-26,m,25,c,'middle');});
 b+=t(30,593,'M是本課對中間腳的代稱；電路分壓取樣點是S，不是M。',26);
 b+=t(30,644,'ADC比較S對共同GND；本圖省略模組內電阻，只追三條外部路徑。',25);
 b+=t(30,695,'實物腳位依核准照片，不依圖的上下位置。上電前先Upload輸入程式。',24,red);
 figures['ky-path']=svg('承接Week 3：保留功能與節點，這次研究資料品質','功能連線示意；不是實物左右腳序，也不是公開GPIO編號。',735,b);
}
{
 let b=box(30,140,300,420)+box(850,140,320,420);
 b+=t(65,188,'ESP32排針',29,blue)+t(882,188,'DHT11功能接點',27,green);
 [['3V3','VCC',265,red,'a6 ↔ c6','兩段公對母'],['GND','GND',385,ink,'a3 ↔ c3','兩段公對母'],['DHT_GPIO','DATA',505,blue,'直接一條母對母','雙向時序資料']].forEach(([a,z,y,c,m,n])=>{b+=t(55,y,a,26,c)+t(890,y,z,27,c)+line(330,y-7,850,y-7,c,4)+t(590,y-30,m,25,c,'middle')+t(590,y+28,n,22,muted,'middle');});
 b+=t(30,614,'前提：三腳、3.3 V供電、DATA上拉／邏輯電壓與GPIO均已核准。',25,red);
 b+=t(30,665,'DATA兩端都是排針，所以兩端用母頭；不是為了用線而繞接麵包板。',25);
 b+=t(30,716,'方框內上下位置不代表實物腳序。未核准：保持斷電，不把旗標改true。',24,red);
 figures['dht-wiring']=svg('DHT11需要供電、共同GND與DATA三種功能','功能示意，不是本片模組腳序或已完成的實機驗證；不使用5Vin。',760,b);
}
{
 let b=''; [['KY-018','S對GND的電壓','ESP32 ADC','raw：0～4095','再以本地基準比較'],['DHT11','DATA高低時序','DHT library','°C、%RH 或NaN','再檢查來源與品質']].forEach((a,i)=>{let y=150+i*260;b+=box(30,y,1140,222)+t(55,y+43,a[0],30,i?green:blue);[a[1],a[2],a[3]].forEach((s,j)=>{let x=55+j*378;b+=box(x,y+67,333,68,'white')+t(x+166,y+110,s,25,ink,'middle');if(j<2)b+=arr(x+335,y+101,x+373,y+101);});b+=t(55,y+183,a[4],26);});
 b+=t(30,723,'共同GND提供準位參考；DHT DATA的直流平均V不是溫度，也不是濕度。',24,red);
 figures['analog-digital']=svg('同樣有訊號線，讀法卻不同','資料流程示意，非量測波形；數位通訊仍可能發生讀取失敗。',765,b);
}
{
 let b=box(35,145,1130,385)+t(65,192,'同一個溫度下的假設壓力例子：',28,blue);
 b+=t(65,264,'實際水蒸氣壓',26)+box(345,228,330,52,'#78afdb')+t(705,263,'2 kPa',28);
 b+=t(65,359,'飽和水蒸氣壓',26)+box(345,323,660,52,'#c7dced')+t(1030,359,'4 kPa',26);
 b+=t(65,454,'RH = 2 ÷ 4 × 100% = 50%',32,blue)+t(65,496,'壓力單位相除抵消；DHT11本例不直接輸出kPa。',23);
 b+=t(30,589,'不是空氣體積有50%是水，也不是空氣中水的重量占50%。',26,red);
 b+=t(30,643,'溫度改變，比較基準也改變；不能拿不同溫度的基準直接套同一比例。',24);
 b+=t(30,695,'50%RH → 60%RH：增加10個百分點。不是增加10 °C。',25);
 figures['humidity']=svg('相對濕度：先說清楚「相對於什麼」','物理量說明的示例，不是學生實測，也不是sensor精度證明。',740,b);
}
{
 let b=''; const a=[['兩欄都是有限數字？','否 → invalid / read_failed；注入時為injected_read_failed'],['RH在0～100之內？','否 → invalid / rh_out_of_bounds'],['溫度在教室政策10～40 °C？','否 → suspect / outside_classroom_policy'],['符合短時突變規則？','是 → suspect / abrupt_change'],['前面都未命中','usable / basic_checks_passed']];
 a.forEach(([q,r],i)=>{let y=128+i*117;b+=box(30,y,1140,98)+t(50,y+40,q,26,blue)+t(50,y+78,r,24,i===4?green:red);});
 b+=t(30,760,'依序檢查：只印第一個命中原因。第3、4層的suspect仍是valid=true。',24);
 b+=t(30,811,'usable只代表通過本程式檢查；不是已校正，更不是永遠可信。',26,red);
 figures['quality-flow']=svg('數字、基本有效與可用判斷，不是同一件事','本課程式政策；不是DHT11原廠性能規格或完整故障診斷。',850,b);
}
{
 let b=''; const a=[['真實模式','source=hardware','25 °C / 55%RH','先保存真實起點'],['輸入 f 後等待','source=injected','NaN / NaN','略過硬體讀取'],['輸入 r 後等待','source=hardware','26 °C / 56%RH','要看到結果才談恢復']];
 a.forEach((r,i)=>{let x=25+i*393;b+=box(x,150,375,376)+t(x+20,198,r[0],27,blue)+t(x+20,260,r[1],24)+t(x+20,329,r[2],29)+t(x+20,397,r[3],24)+t(x+20,479,i===1?'invalid / injected_read_failed':'結果仍須檢查',i===1?19:24,i===1?red:green);});
 b+=t(30,581,'切模式後等2500 ms；sample不中斷計數，第一筆恢復不跨缺口比突變。',24);
 b+=t(30,633,'r代表恢復「呼叫硬體」，不是保證成功。若仍NaN，記錄真實讀取失敗。',24,red);
 b+=t(30,686,'全部數字為示例。注入成功只驗證缺值處理，不能證明斷線偵測已測過。',24);
 figures['recovery']=svg('故障注入與恢復：命令不等於結果','不拔帶電線；軟體注入必須標記來源，不能冒充實體sensor故障。',735,b);
}
function artifact(file,data){const bytes=Buffer.isBuffer(data)?data:Buffer.from(data);if(check){assert(fs.existsSync(file),`Missing ${file}`);assert(fs.readFileSync(file).equals(bytes),`Stale artifact: ${file}`);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}}
async function build(){
 Object.assign(figures,require('./week4_integration_figures.cjs')({svg,t,box,line,arr,ink,blue,red,green,muted}));
 for(const [name,markup]of Object.entries(figures)){
   const base=path.join(root,`IOT_Introduction/docs/images/wiring/week4-${name}`);
   artifact(base+'.svg',markup); artifact(base+'.png',await sharp(Buffer.from(markup)).png().toBuffer());
 }
 let source=fs.readFileSync(sourcePath,'utf8').replace(/\r\n/g,'\n').replace(/^<!-- Week 4 editable[^\n]*-->\n/,'');
 const cells=[];
 function markdown(s){s=s.trim();if(!s)return;const attachments={};
   s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>{const file=path.resolve(path.dirname(sourcePath),url);assert(fs.existsSync(file),file);const name=path.basename(file),mime=file.endsWith('.png')?'image/png':'image/jpeg';assert(/\.(png|jpg|jpeg)$/.test(file));attachments[name]={[mime]:fs.readFileSync(file).toString('base64')};return `![${alt}](attachment:${name})`;});
   // Rebase non-image local links; explicit anchors remain in the same notebook.
   s=s.replace(/(?<!!)\[([^\]]*)\]\(([^)]+)\)/g,(match,label,url)=>{if(/^(https?:|#|attachment:)/.test(url))return match;const [file,anchor]=url.split('#');const relative=path.relative(path.dirname(notebookPath),path.resolve(path.dirname(sourcePath),file)).replaceAll('\\','/');return `[${label}](${relative}${anchor?'#'+anchor:''})`;});
   const cell={cell_type:'markdown',metadata:{},source:(s+'\n').match(/.*\n/g)};if(Object.keys(attachments).length)cell.attachments=attachments;cells.push(cell);
 }
 for(const section of source.split(/<!-- cell -->/)){
   const pieces=section.split(/<!-- sketch:(week04_[a-z0-9_]+) -->/);
   for(let i=0;i<pieces.length;i++)if(i%2===0)markdown(pieces[i]);else{
     const name=pieces[i],code=fs.readFileSync(path.join(root,`IOT_Introduction/examples/${name}/${name}.ino`),'utf8').replace(/\r\n/g,'\n');
     cells.push({cell_type:'code',metadata:{language:'cpp'},execution_count:null,outputs:[],source:code.match(/.*\n|.+$/g)});
   }
 }
 cells.forEach((c,i)=>c.id='w4-'+crypto.createHash('sha256').update(i+':'+c.source.join('')).digest('hex').slice(0,12));
 const nb={cells,metadata:{language_info:{name:'cpp'},course_edition:'complete-preparation-with-reference-answers',maintenance_source:'IOT_Introduction/docs/course_materials/week4_main.source.md',hardware_validation:'pending-exact-module-and-gpio-profiles'},nbformat:4,nbformat_minor:5};
 artifact(notebookPath,JSON.stringify(nb,null,1)+'\n');
 console.log(`PASS ${check?'compared':'built'} ${Object.keys(figures).length} SVG/PNG figures, ${cells.length} cells; only Week 4 outputs.`);
}
build().catch(e=>{console.error(e);process.exitCode=1;});
