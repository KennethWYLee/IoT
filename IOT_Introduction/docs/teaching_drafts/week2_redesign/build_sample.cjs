const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../../..');
fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });
const photos = path.join(root, 'IOT_Introduction/docs/images/hardware/actual');
const photo = name => `data:image/${name.endsWith('.png')?'png':'jpeg'};base64,${fs.readFileSync(path.join(photos, name)).toString('base64')}`;
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const sketch = fs.readFileSync(path.join(__dirname,'button_follow_along/button_follow_along.ino'),'utf8').split('\n').slice(2).join('\n').trim();
const hello = fs.readFileSync(path.join(__dirname,'hello_first/hello_first.ino'),'utf8').trim();
const reference = name => `data:image/${path.extname(name).slice(1)};base64,${fs.readFileSync(path.join(__dirname,'reference_images',name)).toString('base64')}`;
const svg = (content, h = 240) => `<svg viewBox="0 0 650 ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${content}</svg>`;
const text = (x,y,t,size=19,extra='') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${t}</text>`;
const line = (x1,y1,x2,y2,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#246f74" stroke-width="3" ${extra}/>`;
const dot = (x,y) => `<circle cx="${x}" cy="${y}" r="5" fill="#246f74"/>`;
const block = (x,y,w,h,label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#edf5f4" stroke="#246f74"/>${text(x+w/2,y+h/2+7,label,20,'text-anchor="middle"')}`;
const arrow = (x1,y1,x2,y2) => `${line(x1,y1,x2,y2,'marker-end="url(#arrow)"')}`;
const marker = '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#246f74"/></marker></defs>';
function board() {
  let s = '<rect x="25" y="25" width="600" height="172" rx="5" fill="#fafafa" stroke="#87939a"/><rect x="305" y="28" width="38" height="165" fill="#e7e9ec"/>';
  const xs = [82,128,174,220,266,382,428,474,520,566];
  'abcdefghij'.split('').forEach((c,i) => s += text(xs[i],56,c,20,'text-anchor="middle"'));
  [10,11].forEach((r,k) => {
    const y=96+k*63;
    s += text(43,y+6,r,17,'text-anchor="middle"');
    s += line(82,y,266,y,'stroke-dasharray="5 4"') + line(382,y,566,y,'stroke-dasharray="5 4"');
    xs.forEach(x=>s+=`<circle cx="${x}" cy="${y}" r="10" fill="white" stroke="#43515b" stroke-width="2"/>`);
  });
  s += text(324,228,'灰色中央槽把左右兩組分開；虛線表示板內連接。',18,'text-anchor="middle"');
  return svg(s,242);
}
function switchDiagram(closed) {
  const offset=closed?340:0;
  let s=text(offset+150,28,closed?'按下':'放開',22,'text-anchor="middle"');
  s+=line(offset+75,75,offset+75,180)+line(offset+235,75,offset+235,180);
  s+=line(offset+75,123,offset+116,123);
  s+=line(offset+194,123,offset+235,123);
  s+=line(offset+116,123,offset+194,closed?123:89);
  [[75,75,'A1'],[75,180,'A2'],[235,75,'B1'],[235,180,'B2']].forEach(([x,y,t])=>{s+=dot(offset+x,y)+text(offset+x,y+(y<100?-14:28),t,18,'text-anchor="middle"');});
  s+=text(offset+155,248,closed?'A 組與 B 組接通':'A 組與 B 組不接通',18,'text-anchor="middle"');
  return s;
}
function pullup() {
  let s=marker;
  [false,true].forEach((closed,k)=>{
    const y=68+k*154;
    s+=text(15,y-38,closed?'按下：GPIO 讀到 LOW':'放開：GPIO 讀到 HIGH',21);
    s+=text(18,y+6,'3.3V',18)+line(77,y,116,y);
    s+=`<rect x="116" y="${y-13}" width="94" height="26" fill="#fff4d6" stroke="#8d6725" stroke-width="2"/>`;
    s+=text(163,y+45,'板內上拉電阻',17,'text-anchor="middle"');
    s+=line(210,y,282,y)+dot(282,y)+line(282,y,282,y-20)+text(291,y-18,'GPIO 輸入',18);
    s+=line(282,y,380,y)+dot(380,y)+dot(458,y)+line(380,y,458,closed?y:y-25)+line(458,y,523,y);
    s+=text(413,y+45,'按鈕',17,'text-anchor="middle"');
    s+=line(523,y,523,y+18)+line(505,y+18,541,y+18)+line(511,y+25,535,y+25)+line(518,y+32,528,y+32)+text(554,y+9,'GND',18);
    if(closed) s+=arrow(219,y+61,354,y+61)+text(373,y+67,'小電流通過電阻與按鈕',16);
  });
  return svg(s,330);
}
function flow() {
  return svg(marker+block(6,14,115,48,'手按按鈕')+arrow(121,38,153,38)+block(156,14,144,48,'GPIO 輸入')+arrow(300,38,335,38)+block(339,14,240,48,'ESP32 程式判斷')+line(459,62,459,106)+line(175,106,459,106)+arrow(175,106,175,135)+arrow(459,106,459,135)+block(57,139,236,53,'送出 Serial 紀錄')+block(346,139,243,53,'設定 GPIO 輸出')+arrow(175,192,175,224)+arrow(459,192,459,224)+block(57,228,236,53,'USB → 電腦 Monitor')+block(346,228,243,53,'杜邦線 → TPO')+text(175,315,'看到程式回報',19,'text-anchor="middle"')+text(459,315,'下一週用電表驗證',19,'text-anchor="middle"'),338);
}
function buttonBoard(wires=0) {
  const xs=[160,192,224,256,288,378,410,442,474,506];
  let s='<rect x="125" y="10" width="421" height="260" rx="4" fill="#fafafa" stroke="#839399"/><rect x="317" y="14" width="32" height="250" fill="#e6e9eb"/>';
  'abcdefghij'.split('').forEach((c,i)=>s+=text(xs[i],39,c,18,'text-anchor="middle"'));
  for(let r=26;r<=30;r++) {
    const y=70+(r-26)*44;
    s+=text(560,y+5,r,17);
    s+=line(xs[0],y,xs[4],y,'stroke-dasharray="3 4"')+line(xs[5],y,xs[9],y,'stroke-dasharray="3 4"');
    xs.forEach(x=>s+=`<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="#64757c"/>`);
  }
  s+='<rect x="276" y="104" width="115" height="107" rx="3" fill="#e3e7ea" stroke="#43535c" stroke-width="2"/><circle cx="333" cy="157" r="26" fill="#566973"/>';
  [[288,114],[378,114],[288,202],[378,202]].forEach(([x,y])=>s+=`<circle cx="${x}" cy="${y}" r="6" fill="#f9f1d8" stroke="#3a4b53" stroke-width="2"/>`);
  if(wires>=1) s+=text(8,85,'GPIO4',18)+`<path d="M24 92 V114 H160" fill="none" stroke="#b44139" stroke-width="4"/>`+dot(160,114)+text(173,103,'a27',17);
  if(wires>=2) s+=text(10,248,'GND',18)+`<path d="M25 228 V202 H160" fill="none" stroke="#26343e" stroke-width="4"/>`+dot(160,202)+text(173,192,'a29',17);
  s+=text(333,299,'按鈕四腳：e27、f27、e29、f29',19,'text-anchor="middle"');
  return svg(s,316);
}
const footer = n => `<footer><span>Week 2 · 從零開始操作的樣稿 · 待教師確認</span><span>${n} / 34</span></footer>`;
const page = (n, tag, title, lead, body) => `<section class="page"><header><span>ESP32-S3 硬體基礎</span><span>${tag}</span></header><main><h1>${title}</h1><p class="lead">${lead}</p>${body}</main>${footer(n)}</section>`;
const pages = [
page(1,'本段的目的','按一下按鈕，電腦怎麼知道？','先看懂線怎麼接通，再看程式怎麼讀。',`
  <div class="goal"><b>這段完成後，你要能解釋：</b><br>按鈕改變哪一條路？GPIO 為什麼讀到不同狀態？電腦上的紀錄從哪裡來？</div>
  <h2>同一件事，分成四步看</h2>
  <ol class="sequence">
    <li><b>一條線</b><span>用電表確認兩端是否相通。</span></li>
    <li><b>麵包板</b><span>找出原本就在板內接通的孔。</span></li>
    <li><b>按鈕</b><span>比較放開和按下時，哪些腳接通。</span></li>
    <li><b>ESP32 程式</b><span>把 GPIO 讀值解釋成按下或放開，再送出紀錄。</span></li>
  </ol>
  <div class="photo-row"><img src="${photo('Breadboard400_1.jpg')}" alt="課堂使用的 400 孔麵包板實物"/><div><h2>先拿這些就好</h2><p>電表、麵包板、杜邦線、四腳按鈕。</p><p>照片用來認實物；後面的孔位圖才用來找位置。</p></div></div>
  <aside class="safety"><b>先不接電源。</b>接下來三頁的通斷練習，不接 ESP32、USB、電池或其他電源。電表會用自己的電池進行小電流測試。</aside>
  <p class="next">下一頁：先讓電表自己證明，它能分辨「接觸」和「分開」。</p>
`),
page(2,'操作 1 · 不接外部電源','電表先回答：通，還是不通？','這次只用通斷功能，不量電流，也不量供電電壓。',`
  <div class="meter-row"><figure><img style="height:84mm" src="${photo('A830L_1.jpg')}" alt="A830L：黑筆插 COM，紅筆插 VΩmA，左側 10A 空著；旋鈕照片為 OFF"/><figcaption>實物照片的旋鈕在 OFF。<br>接好表筆後，還要選通斷檔。</figcaption></figure><div>
  <h2>先認三個位置</h2><ol class="steps"><li><b>黑筆插 COM。</b><br>在這台表的下方中間。</li><li><b>紅筆插 VΩmA。</b><br>在下方右邊。左邊 10A 不用。</li><li><b>旋鈕轉到通斷蜂鳴符號。</b><br>找聲波圖案，不是 200 Ω 的數字。實物標示不同時，先一起核對，不猜檔位。</li></ol>
  </div></div>
  <h2>先做自測，再測一條線</h2>
  <table><thead><tr><th>你的動作</th><th>預期</th><th>我的實際結果</th></tr></thead><tbody><tr><td>兩個筆尖分開</td><td>不叫</td><td>____________</td></tr><tr><td>兩個金屬筆尖接觸</td><td>會叫</td><td>____________</td></tr><tr><td>同一條公對公線的兩端，各碰一筆</td><td>完好的線會叫</td><td>____________</td></tr></tbody></table>
  <p><b>怎麼判讀：</b>會叫，表示兩筆間有足夠低電阻的路徑；不代表每次都是故障。這裡是刻意讓筆尖接通。</p>
  <aside class="safety">結果不符時，停在這頁，檢查插孔、檔位與接觸。不要改接電源來試。通斷檔不能用在帶電電路。</aside>
  <p class="next">下一頁：用同一個方法，找出麵包板內部的連接。</p>
`),
page(3,'操作 2 · 不接外部電源','麵包板：哪些孔原本就相通？','孔靠得很近，不一定相通。用電表驗證，不只看外觀。',`
  <figure class="diagram">${board()}<figcaption>示意圖只畫中央接線區兩列，不含兩側電源軌；依實物字母與列號找孔。</figcaption></figure>
  <h2>先讀一個孔位</h2><p><b>a10</b> 是 a 欄、第 10 列。這張圖中，a10 到 e10 是同一組；f10 到 j10 是另一組。</p>
  <h2>用兩條杜邦線把測試位置引出來</h2>
  <ol class="steps compact"><li>在要比較的兩個孔，各插入一條公對公杜邦線。</li><li>紅、黑表筆各碰一條線另一端的金屬針。</li><li>兩條線末端不要互碰；不要把粗表筆硬塞進麵包板孔。</li></ol>
  <table><thead><tr><th>比較的兩孔</th><th>先猜：叫／不叫</th><th>實測：叫／不叫</th></tr></thead><tbody><tr><td>a10 與 e10</td><td>____________</td><td>____________</td></tr><tr><td>a10 與 a11</td><td>____________</td><td>____________</td></tr><tr><td>a10 與 f10</td><td>____________</td><td>____________</td></tr></tbody></table>
  <p><b>核對：</b>正常、未加其他接線的這類麵包板，三次應是「叫、不叫、不叫」。不符時先確認列號、線是否插到底，以及表筆接觸。</p>
  <p class="next">下一頁：麵包板的連接不會自己變；按鈕則會改變連接。</p>
`),
page(4,'操作 3 · 不接外部電源','按鈕不是四個互不相干的腳','先找「一直相通」的一組，再找「按下才相通」的兩組。',`
  <figure class="diagram">${svg(switchDiagram(false)+switchDiagram(true),268)}<figcaption>這是內部連接示意，不是腳位擺放圖。A1、A2、B1、B2 是本頁為說明測試而標的腳，必須實測辨認。</figcaption></figure>
  <h2>按鈕先不要裝進其他電路</h2>
  <ol class="steps compact"><li>放開按鈕，用通斷檔比較各腳，找出原本就相通的兩腳，記為 A1、A2。</li><li>確認另兩腳放開時也相通，記為 B1、B2。</li><li>紅筆碰 A1、黑筆碰 B1。固定接觸後，再比較放開與按下。</li></ol>
  <table><thead><tr><th>量哪兩腳</th><th>放開時的預期</th><th>按下時的預期</th></tr></thead><tbody><tr><td>A1 與 A2（同組）</td><td>會叫</td><td>會叫</td></tr><tr><td>A1 與 B1（跨組）</td><td>不叫</td><td>會叫</td></tr></tbody></table>
  <p><b>最重要的判斷：</b>要讓按鈕改變連通，必須從兩組各取一腳。只取同組兩腳，按不按都相通。</p>
  <p class="question">我的按鈕哪兩腳是同組？在紙上畫四個腳，把相通的一組圈起來。若測不出上表結果，先一起核對接觸與腳位，不接 ESP32。</p>
  <p class="next">下一頁：拿出開發板，先找到要接線的兩個腳位。原理等看到紀錄後再講。</p>
`),
page(5,'一起做 · 先找位置','拿出開發板，找到兩個腳位','先找印字，不接線。這一段只用 GPIO4 與 GND。',`
  <figure class="diagram"><img style="width:100%;height:90mm;object-fit:contain" src="${photo('ESP32S3_1.png')}" alt="YD-ESP32-S3 實物正面，天線向左、USB 向右；GPIO4 在下排，左上端有 GND"/><figcaption>照片：課堂既有 YD-ESP32-S3 Type-A V1.5。把你的板子轉成相同方向：天線在左，兩個 USB 接頭在右。</figcaption></figure>
  <h2>跟著找到，先用手指出來</h2>
  <table><thead><tr><th>這次找哪個腳</th><th>照片中的位置</th></tr></thead><tbody><tr><td>印字「4」</td><td>下排，印字 RST 的右邊、5 的左邊。這是 GPIO4，不是「數第四個腳」。</td></tr><tr><td>印字「GND」</td><td>上排最左端，靠天線這一側。這次統一使用這個 GND。</td></tr></tbody></table>
  <p><b>板子先放桌上：</b>放在乾燥、不導電的平面，不插進這塊 400 孔麵包板。稍後用公對母杜邦線連過去。</p>
  <aside class="safety">本接法只對應圖示板型。你的印字或板型不一樣，就停在辨認這一步，和全班一起核對，不靠外形猜腳位。板上若還有其他作品的接線，先斷開所有電源，另用空白器材準備本實驗。</aside>
  <p class="next">下一頁：從安裝電腦軟體開始，先讓 ESP32 傳回一句 Hello。還不接按鈕。</p>
`),
...require('./beginner_setup.cjs')({page,photo,reference,escape,hello,svg,marker,block,arrow}),
page(15,'一起做 · 換成按鈕程式','先換程式，再拔 USB 接按鈕','剛才只會傳回 Hello；現在換成能回報「按下／放開」的程式。',`
  <p>在剛才的 Arduino IDE 點 <b>File → New Sketch</b>，將編輯區全選，換成下面整段程式，再用 Ctrl+S 存成 <b>button_follow_along</b>。板子仍只接 USB，沒有杜邦線。</p>
  <h2>開新草稿，整段貼上並上傳</h2>
  <pre>${escape(sketch)}</pre>
  <ol class="steps compact"><li>依第 10–11 頁核對板型、Port 與選項；新視窗不一定沿用前一份設定。先關閉 Hello 草稿的訊息視窗。</li><li>按左上方右箭頭 <b>Upload</b>。完成後點 <b>Tools → Serial Monitor</b>，選 <b>115200</b>。</li><li>現在還沒有接按鈕，應持續出現 <b>released</b>，意思是「放開」。這是預期畫面，不是本次實測紀錄。</li><li>看到後，關閉訊息分頁、拔掉 USB，確認 PWR 燈熄滅。再翻下一頁。</li></ol>
  <aside class="safety">未完成上傳或看不到 released，先一起處理程式、Port 與 USB 接頭，不先接線猜原因。此頁不要求先理解每行程式，做完按鈕操作後再回來解釋。</aside>
  <p class="next">下一頁：USB 已拔除，把剛才測過的按鈕放上麵包板。</p>
`),
page(16,'一起做 · USB 保持拔除','先放按鈕，暫時不接開發板','拿剛才已測出兩組腳的按鈕，跨中央槽放入。',`
  <figure class="diagram">${buttonBoard()}<figcaption>俯視孔位圖。按鈕跨過中央槽；圓點標出四個腳插入的位置。圖中沒有開發板接線。</figcaption></figure>
  <ol class="steps"><li>找到麵包板第 <b>27</b> 列與第 <b>29</b> 列。</li><li>將四腳放在 <b>e27、f27、e29、f29</b>。若腳距不能自然對孔，不硬壓。</li><li>方向要符合：第 27 列兩腳原本同組；第 29 列兩腳是另一組。</li></ol>
  <h2>用剛才學會的通斷測試一起核對</h2>
  <table><thead><tr><th>測哪裡</th><th>預期</th></tr></thead><tbody><tr><td>a27 與 j27，按鈕放開</td><td>會叫：跨槽兩腳是同組</td></tr><tr><td>a29 與 j29，按鈕放開</td><td>會叫：另一組也相通</td></tr><tr><td>a27 與 a29，先放開，再按住</td><td>不叫 → 會叫</td></tr></tbody></table>
  <p>沿用兩條公對公線引出測點。結果不同，先找按鈕方向、孔位與接觸；此時不接 USB。完成後移除量測延長線，電表轉 OFF、表筆放旁邊。</p>
  <p class="next">下一頁：先接第一條線，從 GPIO4 到 a27。</p>
`),
page(17,'一起做 · 第一條線','GPIO4 接到 a27','拿一條公對母杜邦線。線色只是方便辨認，接點才是重點。',`
  <figure class="diagram">${buttonBoard(1)}<figcaption>接線關係圖，不是開發板實體排針排列圖。GPIO4 的實物位置請對照第 5 頁。</figcaption></figure>
  <h2>這條線只有兩端</h2>
  <table><thead><tr><th>哪一端</th><th>接哪裡</th></tr></thead><tbody><tr><td>母頭：有插孔的一端</td><td>套到開發板印字「4」的排針</td></tr><tr><td>公頭：有金屬針的一端</td><td>插麵包板 a27</td></tr></tbody></table>
  <p>按鈕一腳已在 e27；a27 和 e27 是同一組孔，所以這條線已連到按鈕的一組腳。</p>
  <p class="question"><b>一起看目前狀態：</b>板子放桌上，只有這一條線；USB 沒插，3V3、5Vin、GPIO5 都沒有接線。</p>
  <p class="next">下一頁：保留第一條線，再接 GND 到 a29。</p>
`),
page(18,'一起做 · 第二條線','GND 接到 a29','拿第二條公對母杜邦線。第一條線保持不動。',`
  <figure class="diagram">${buttonBoard(2)}<figcaption>目前完整接法：GPIO4 → a27；GND → a29。兩線分別連到按鈕的兩組，不是接在同一組。</figcaption></figure>
  <table><thead><tr><th>哪一端</th><th>接哪裡</th></tr></thead><tbody><tr><td>母頭</td><td>套到第 5 頁指定的 GND 排針</td></tr><tr><td>公頭</td><td>插麵包板 a29</td></tr></tbody></table>
  <h2>全班一起照圖核對，現在仍不插 USB</h2>
  <ol class="steps compact"><li>按鈕仍在 e27、f27、e29、f29，方向沒有改變。</li><li>GPIO4 的線在 a27；GND 的線在 a29。不是 a28，也不是都在第 27 列。</li><li>只有這兩條開發板接線；沒有線接 3V3 或 5Vin。金屬針沒有意外碰到旁邊的腳。</li><li>電表已 OFF，表筆、量測延長線與其他模組都已移開。</li></ol>
  <aside class="safety">這一段不接 GPIO5 或 TPO，也不用另外接一顆電阻。接點或板型還不確定，就保持斷電，一起對照處理；不靠通電試錯。</aside>
  <p class="next">下一頁：接法一致後，一起插 USB，看看按鈕能不能改變電腦上的文字。</p>
`),
page(19,'一起做 · 看到結果','按下、放開，看文字改變','現在才插回板背標示 COM 的 USB 接頭，不用重新上傳。',`
  <ol class="steps"><li>打開 Serial Monitor，選同一塊板子的 Port 與 <b>115200</b>。</li><li>先不碰按鈕，看見什麼？接著按住約一秒，再放開約一秒。</li><li>一起重複三次，對照下表。不要快速點一下就放開。</li></ol>
  <table><thead><tr><th>手的動作</th><th>預期會持續出現</th><th>我看到的文字</th></tr></thead><tbody><tr><td>放開</td><td><code>released</code></td><td>____________</td></tr><tr><td>按住</td><td><code>pressed</code></td><td>____________</td></tr><tr><td>再次放開</td><td><code>released</code></td><td>____________</td></tr></tbody></table>
  <h2>預期畫面示例，不是實測紀錄</h2>
  <pre>released\nreleased\npressed\npressed\nreleased</pre>
  <p>這支程式約每 0.3 秒讀一次並印一行。按住時出現多行 pressed 是這次程式的預期行為，不是「按了很多次」，也不能用來判定按鈕彈跳。</p>
  <aside class="safety">文字不變：先拔 USB，再回第 16–18 頁核對方向與接點。完全沒有文字：先核對 Port、接頭與 115200。改線時不插 USB。</aside>
  <p class="question"><b>我們現在完成了：</b>手按實體按鈕，電腦上的文字跟著改變。先保留這個結果，接著才解釋它如何發生。</p>
  <p class="next">下一頁：回頭看剛才的兩條線，解釋 GPIO 為什麼讀到不同值。</p>
`),
page(20,'做完再講 · 對照剛才的結果','為什麼按下後，文字會改變？','剛才看到 pressed 和 released，現在才拆開其中的原因。',`
  <p><b>「內部上拉」：</b>板內透過一個電阻，把 GPIO 接點接向 3.3V。按鈕再決定這個接點是否接到 GND。</p>
  <figure class="diagram">${pullup()}<figcaption>電氣路徑示意。GND 接回板上電源回路；GPIO 分支是讀取接點狀態，不是把電流送進電腦。</figcaption></figure>
  <table><thead><tr><th>按鈕狀態</th><th>接點怎麼了</th><th>程式讀值</th></tr></thead><tbody><tr><td>放開</td><td>沒有經按鈕接到 GND</td><td>HIGH（高）</td></tr><tr><td>按下</td><td>經按鈕接到 GND</td><td>LOW（低）</td></tr></tbody></table>
  <p><b>為什麼不是把 3.3V 直接短接 GND？</b>按下時的這條路中間有上拉電阻，它限制電流。不能把電阻省掉，再把 3V3 電源腳直接用線接到 GND。</p>
  <aside class="note">這個 HIGH／LOW 對應只適用於此圖的上拉接法。不是所有按鈕都「按下 = LOW」。尚未開啟上拉、接錯腳或懸空時，不能套用上表。</aside>
  <p class="next">回第 15 頁對照：INPUT_PULLUP 開啟上拉；digitalRead 讀狀態；if 把 LOW 對應到 pressed。下一頁分清「讀值、紀錄、輸出」。</p>
`),
page(21,'做完再講 · 延伸輸出先不接','紀錄與輸出，是兩條不同的路','左邊是剛才已完成的路；右邊是後續延伸，本次尚未接線。',`
  <figure class="diagram" style="margin:2mm 0"><div style="max-width:145mm;margin:auto">${flow()}</div><figcaption>資訊與控制關係圖。箭頭不是實體接線圖；沒有畫出的供電與 GND 仍須依正式接線圖連接。</figcaption></figure>
  <h2>先知道為什麼要有 TPO</h2><p>電腦紀錄告訴我們「程式怎麼回報」。另留一個 GPIO 輸出接點，下一週才能用電表查「腳位電壓是否真的改變」。</p>
  <p>舊教材把這個輸出測試位置標成 <b>TPO</b>。它不是額外的元件或電源；也不是按鈕資料傳到電腦時必經的位置。</p>
  <table><thead><tr><th>紀錄或動作</th><th>能知道什麼</th><th>還不能宣稱什麼</th></tr></thead><tbody><tr><td>程式回報「按下」</td><td>程式把讀值判成按下</td><td>接線一定全對</td></tr><tr><td>程式設定輸出 HIGH</td><td>程式要求輸出高電位</td><td>已實測到 3.3V</td></tr></tbody></table>
  <p class="question"><b>用自己的話回答：</b>剛才沒有接 TPO，為什麼仍能看到 pressed？<br>在圖上找出「按鈕 → 電腦」的路，再解釋。</p>
  <p class="next">先關閉 Monitor、拔掉 USB。下一段加一顆按鈕做計數器，練習一次按壓只計一次；TPO 輸出仍留後續，不與計數器同時接線。</p>
  <p class="sources">原理核對：<a href="https://www.fluke.com/en/learn/blog/digital-multimeters/how-to-test-for-continuity">Fluke 通斷測試</a>；<a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html">Espressif GPIO</a>。預期結果為教學推演，非本次實測。</p>
`),
...require('./counter_project.cjs')({page,escape,svg,text,line,dot,marker,block,arrow,photo}),
page(33,'需要時才看 · 不打斷正常操作','停在哪一步，就處理那一步','不要同時換線、換板型、換程式。一次只改一件事，才知道問題在哪裡。',`
  <table class="troubleshooting"><thead><tr><th>現在遇到什麼</th><th>先一起做這些</th></tr></thead><tbody>
  <tr><td>不能安裝 IDE</td><td>確認下載的是 Windows 64-bit .exe。學校電腦要求管理權限時，交由管理人員處理，不繞過限制。</td></tr>
  <tr><td>找不到 esp32／安裝失敗</td><td>回第 7 頁核對網址與網路；第 8 頁選 Espressif Systems。保存錯誤文字，不反覆亂換版本。</td></tr>
  <tr><td>沒有新增 COM</td><td>板子先不接杜邦線。換已確認可傳資料的 USB 線，插板背 COM 接頭、直接接電腦。比較拔掉／插回前後清單。</td></tr>
  <tr><td>有供電，仍沒有 COM</td><td>在 Windows 開始鈕按右鍵 → 裝置管理員，看「連接埠（COM 和 LPT）」或未知裝置。圖示板使用 CH343；需要驅動時只用 WCH 官方 CH343SER，不隨便裝別型號。</td></tr>
  <tr><td>上傳失敗</td><td>先關閉所有 Serial Monitor，核對第 10–11 頁的板型／Port／選項。等待其他程式釋放連接埠，再重試一次並保存錯誤文字。</td></tr>
  <tr><td>卡在 Connecting，無法連上</td><td>僅對圖示板，無外接線時：重試 Upload，在 Connecting 時按住 BOOT、點一下 RST；開始 Writing 後放開 BOOT。上傳完成後必要時點一下 RST 啟動。這不是每次必做。</td></tr>
  <tr><td>沒有 Hello／是亂碼</td><td>確認正在看 Serial Monitor 而非 Output；速度選 115200。確認已上傳新程式，而不是只按勾勾編譯；USB 接頭是 COM。</td></tr>
  </tbody></table>
  <p class="safety">改實體接線前拔 USB、移除其他電源。板子異常發熱、有異味或冒煙，立即停止供電，不繼續測試。</p>
  <p class="sources">驅動程式官方來源：<a href="https://www.wch.cn/downloads/CH343SER_EXE.html">WCH CH343SER</a>。無權限或裝置身分不明時，先由教師與管理人員一起確認，不盲目安裝。</p>
`),
page(34,'參考資料 · 不必課堂逐項閱讀','操作依據與圖片來源','這份包含從零操作、按鈕紀錄與計數器；不是整堂 Week 2 的全部內容。',`
  <h2>Arduino 官方文件與截圖</h2><ul>
  <li><a href="https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-downloading-and-installing/">Downloading and installing the Arduino IDE 2</a>：安裝總覽，作者 Karl Söderby。</li>
  <li><a href="https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-uploading-a-sketch/">How to upload a sketch with the Arduino IDE 2</a>：選單、上傳按鈕，作者 Karl Söderby、Jacob Hylén。</li>
  <li><a href="https://docs.arduino.cc/software/ide-v2/tutorials/ide-v2-serial-monitor/">Using the Serial Monitor tool</a>：訊息視窗，作者 Karl Söderby。</li>
  <li><a href="https://support.arduino.cc/hc/en-us/articles/4406856349970-Select-board-and-port-in-Arduino-IDE">Select board and port in Arduino IDE</a>：板型與連接埠的操作。</li></ul>
  <p>Arduino 截圖取自官方 docs-content，未修改影像；原圖採 <a href="https://github.com/arduino/docs-content/blob/main/LICENSE.md">CC BY-SA 4.0</a> 授權。舊版截圖只用來辨認入口，不代表本課的板型、速度或版本。</p>
  <h2>Espressif 官方文件與截圖</h2><ul>
  <li><a href="https://developer.espressif.com/blog/2025/10/arduino-get-started/">Getting Started with ESP32 Arduino</a>，Jan Procházka，2025-10-01：偏好設定與管理員畫面，未修改影像；原圖權利屬 Espressif。</li>
  <li><a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html">Installing</a>：穩定版安裝網址。</li>
  <li><a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html">Arduino IDE Tools Menu</a>：設定意義。</li>
  <li><a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html">GPIO</a>：按鈕程式與內部上拉。</li></ul>
  <h2>實物與量測</h2><p>板卡、電表與麵包板照片為本課既有實物照片。孔位圖是教學示意；不把圖片當成所有同名商品都相同的保證。通斷原則參考 <a href="https://www.fluke.com/en/learn/blog/digital-multimeters/how-to-test-for-continuity">Fluke 通斷測試說明</a>。</p>
  <p class="note">所有程式輸出示例都是預期格式，不是這次操作的實測紀錄。學習者應以自己實際看到的畫面記錄結果。網路來源查核：2026-09-16。</p>
`)
];
const css = `
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#24343b;background:#e4e7e8;font:12pt/1.6 "Microsoft JhengHei",sans-serif;letter-spacing:0} .page{background:white;width:210mm;height:297mm;padding:14mm 17mm 16mm;position:relative;break-after:page;overflow:hidden}.page:last-child{break-after:auto}header{display:flex;justify-content:space-between;color:#506b70;font-size:9pt;border-bottom:1px solid #a8bdbd;padding-bottom:3mm;margin-bottom:6mm}main{height:246mm}h1{font-size:23pt;line-height:1.4;margin:0 0 3mm;color:#194e54}h2{font-size:14pt;line-height:1.45;margin:5mm 0 2mm}p{margin:2.5mm 0}p.lead{font-size:13pt;color:#4d636d;margin-bottom:5mm}.goal{border-left:4px solid #287d80;padding:3mm 4mm;background:#edf5f4}.sequence{list-style:none;padding:0;margin:3mm 0;counter-reset:step}.sequence li{counter-increment:step;display:grid;grid-template-columns:9mm 30mm 1fr;gap:3mm;align-items:start;padding:3mm 0;border-bottom:1px solid #dce2e3}.sequence li:before{content:counter(step);font-weight:700;color:#246f74}.photo-row{display:grid;grid-template-columns:62mm 1fr;gap:6mm;align-items:center;margin:5mm 0}.photo-row img{width:62mm;height:43mm;object-fit:contain}.meter-row{display:grid;grid-template-columns:67mm 1fr;gap:6mm}.meter-row figure{margin:0}.meter-row img{height:104mm;width:65mm;object-fit:contain}.meter-row h2{margin-top:0}.steps{padding-left:6mm;margin:2mm 0}.steps li{margin:3mm 0}.steps.compact li{margin:1.5mm 0}figure.diagram{margin:3mm 0}svg{display:block;width:100%;height:auto;max-height:92mm;font-family:"Microsoft JhengHei",sans-serif;fill:#24343b}figcaption{font-size:9.5pt;line-height:1.5;color:#52636c;margin-top:2mm}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:11pt;line-height:1.5;margin:4mm 0}th{text-align:left;background:#eaf1f2;font-weight:700}td,th{border-bottom:1px solid #c6d3d6;padding:3mm 2.5mm;vertical-align:top}aside{padding:3mm 4mm;line-height:1.55;font-size:11pt;margin:4mm 0}.safety{border-left:4px solid #ae493c;background:#fff2ee}.note{border-left:4px solid #947336;background:#fbf6e8}.question{border-top:1px solid #a7bfc2;padding-top:3mm}.next{border-top:1px solid #a7bfc2;padding-top:3mm;margin-top:5mm;color:#194e54;font-weight:700;font-size:11pt}.sources{font-size:9pt;line-height:1.5;color:#5d6b72}a{color:#194e54}footer{position:absolute;bottom:9mm;left:17mm;right:17mm;display:flex;justify-content:space-between;color:#607079;font-size:8.5pt} @media screen{.page{margin:10mm auto;box-shadow:0 1px 8px #aaa}}
`;
const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 2 主教材版面樣稿</title><style>${css}pre{font:10.5pt/1.4 Consolas,monospace;white-space:pre-wrap;margin:3mm 0;padding:3mm;background:#f1f4f5;border-left:3px solid #718991}code{font-family:Consolas,monospace}.reference{width:100%;object-fit:contain}.urlbox{padding:3mm;background:#edf5f4;font:10.5pt/1.5 Consolas,monospace;overflow-wrap:anywhere}.settings td,.settings th{padding:2mm 2.5mm}.troubleshooting{font-size:10.5pt}.troubleshooting th:first-child,.troubleshooting td:first-child{width:27%}.troubleshooting td{padding:2mm 2.5mm}ul{padding-left:6mm;margin:2mm 0}li{margin:1.5mm 0}</style></head><body>${pages.join('')}</body></html>`;
fs.writeFileSync(path.join(__dirname,'Week2_main_layout_sample.html'),html);
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.join(__dirname,'Week2_main_layout_sample.html')).href);
  await page.emulateMedia({media:'print'});
  await page.evaluate(()=>document.fonts.ready);
  const audit=await page.evaluate(()=>({images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0})),pages:[...document.querySelectorAll('.page')].map((p,i)=>{const m=p.querySelector('main'), f=p.querySelector('footer'), last=m.lastElementChild;return{page:i+1,overflow:m.scrollHeight>m.clientHeight+1,lastBottom:last.getBoundingClientRect().bottom,footerTop:f.getBoundingClientRect().top,gap:f.getBoundingClientRect().top-last.getBoundingClientRect().bottom};})}));
  fs.writeFileSync(path.join(__dirname,'tmp/layout_check.json'),JSON.stringify(audit,null,2));
  if(audit.images.some(i=>!i.loaded)||audit.pages.some(p=>p.overflow||p.gap<8)) { await browser.close(); throw Error(JSON.stringify(audit)); }
  await page.pdf({path:path.join(__dirname,'Week2_main_layout_sample.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
  await browser.close();
  console.log(JSON.stringify(audit,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
