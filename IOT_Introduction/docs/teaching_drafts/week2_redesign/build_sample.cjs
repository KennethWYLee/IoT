const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../../..');
const official = path.join(root, 'IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf');
const inputs = new Set(['build_sample.cjs', 'beginner_setup.cjs', 'ohms_law_pages.cjs', 'counter_project.cjs',
  'hello_first/hello_first.ino', 'button_follow_along/button_follow_along.ino',
  'counter_practice/counter_practice.ino'].map(name => path.join(__dirname, name)));
const digest = file => crypto.createHash('sha256').update(/\.(cjs|ino)$/.test(file)
  ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : fs.readFileSync(file)).digest('hex');
const asset = file => { inputs.add(file); return fs.readFileSync(file).toString('base64'); };
fs.mkdirSync(path.join(__dirname, 'tmp'), { recursive: true });
const photos = path.join(root, 'IOT_Introduction/docs/images/hardware/actual');
const photo = name => `data:image/${name.endsWith('.png')?'png':'jpeg'};base64,${asset(path.join(photos, name))}`;
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const sketch = fs.readFileSync(path.join(__dirname,'button_follow_along/button_follow_along.ino'),'utf8').split('\n').slice(2).join('\n').trim();
const hello = fs.readFileSync(path.join(__dirname,'hello_first/hello_first.ino'),'utf8').trim();
const reference = name => `data:image/${path.extname(name).slice(1)};base64,${asset(path.join(__dirname,'reference_images',name))}`;
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
  s += text(324,228,'中央槽把左右分開；虛線是麵包板內的金屬連接。',18,'text-anchor="middle"');
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
  let s='';
  [false,true].forEach((closed,k)=>{
    const y=94+k*164;
    s+=text(12,y-66,closed?'按下：GPIO4 約 0V → LOW':'放開：GPIO4 約 3.3V → HIGH',22);
    s+=`<rect x="9" y="${y-49}" width="304" height="93" rx="3" fill="#edf5f4" stroke="#246f74" stroke-dasharray="5 4"/>`;
    s+=text(20,y-27,'ESP32 晶片內部（簡化）',17);
    s+=text(19,y+6,'3.3V',18)+line(72,y,94,y);
    s+=`<rect x="94" y="${y-11}" width="86" height="22" fill="#fff4d6" stroke="#8d6725" stroke-width="2"/>`;
    s+=text(137,y+31,'上拉電阻',16,'text-anchor="middle"');
    s+=line(180,y,380,y)+dot(268,y)+text(268,y+31,'GPIO4',17,'text-anchor="middle"');
    s+=dot(380,y)+dot(452,y)+line(380,y,452,closed?y:y-22)+line(452,y,540,y);
    s+=text(415,y+31,closed?'按鈕接通':'按鈕斷開',17,'text-anchor="middle"');
    s+=text(552,y+6,'GND',18)+text(552,y+31,'0V',17);
    s+=text(12,y+69,closed?'電流路徑：3.3V → 上拉電阻 → 按鈕 → GND。':'按鈕斷開，這條支路幾乎沒有電流；不是電流最強。',18);
  });
  return svg(s,340);
}
function flow() {
  let s=marker;
  const labels=['手按下按鈕：GPIO4 接到 GND','digitalRead：讀到 LOW','if：選擇要印出的文字 pressed','Serial.println：將文字送出','經板上 CH343、USB 線 → 電腦 Serial Monitor'];
  labels.forEach((label,i)=>{
    const y=8+i*64;
    s+=block(17,y,616,44,label);
    if(i<4)s+=arrow(325,y+44,325,y+62);
  });
  return svg(s,312);
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
const footer = n => `<footer><span>Week 2 · 按鈕與計數器</span><span>${n} / 35</span></footer>`;
const page = (n, tag, title, lead, body) => `<section class="page"><header><span>ESP32-S3 硬體基礎</span><span>${tag}</span></header><main><h1>${title}</h1><p class="lead">${lead}</p>${body}</main>${footer(n)}</section>`;
const pages = [
page(1,'按鈕與電腦訊息','按一下按鈕，電腦怎麼知道？','按鈕改變電路的連接，ESP32 讀取狀態，再把文字傳回電腦。',`
  <div class="goal"><b>按鈕、電路與紀錄：</b><br>按鈕改變哪一條路？GPIO 為什麼讀到不同狀態？電腦上的紀錄從哪裡來？</div>
  <h2>零件與功能</h2>
  <ol class="sequence">
    <li><b>一條線</b><span>用電表確認兩端是否相通。</span></li>
    <li><b>麵包板</b><span>找出原本就在麵包板內接通的孔。</span></li>
    <li><b>按鈕</b><span>比較放開和按下時，哪些腳接通。</span></li>
    <li><b>ESP32 程式</b><span>把 GPIO 讀值解釋成按下或放開，再送出紀錄。</span></li>
  </ol>
  <div class="photo-row"><img src="${photo('Breadboard400_1.jpg')}" alt="課堂使用的 400 孔麵包板實物"/><div><h2>先拿這些就好</h2><p>電表、麵包板、杜邦線、四腳按鈕。</p><p>照片用來認實物；後面的孔位圖才用來找位置。</p></div></div>
  <aside class="safety"><b>通斷測試時，不接電源。</b>受測物不接 ESP32、USB、電池或其他電源。電表會用自己的電池進行小電流測試。</aside>
`),
page(2,'操作 1 · 不接外部電源','電表先回答：通，還是不通？','這次只用通斷功能，不量電流，也不量供電電壓。',`
  <div class="meter-row"><figure><img style="height:84mm" src="${photo('A830L_1.jpg')}" alt="A830L：黑筆插 COM，紅筆插 VΩmA，左側 10A 空著；旋鈕照片為 OFF"/><figcaption>實物照片的旋鈕在 OFF。<br>接好表筆後，還要選通斷檔。</figcaption></figure><div>
  <h2>先認三個位置</h2><ol class="steps"><li><b>黑筆插 COM。</b><br>在這台表的下方中間。</li><li><b>紅筆插 VΩmA。</b><br>在下方右邊。左邊 10A 不用。</li><li><b>旋鈕轉到通斷蜂鳴符號。</b><br>找聲波圖案，不是 200 Ω 的數字。實物標示不同時，先一起核對，不猜檔位。</li></ol>
  </div></div>
  <h2>先做自測，再測一條線</h2>
  <table><thead><tr><th>你的動作</th><th>預期</th><th>我的實際結果</th></tr></thead><tbody><tr><td>兩個筆尖分開</td><td>不叫</td><td>____________</td></tr><tr><td>兩個金屬筆尖接觸</td><td>會叫</td><td>____________</td></tr><tr><td>同一條公對公線的兩端，各碰一筆</td><td>完好的線會叫</td><td>____________</td></tr></tbody></table>
  <p><b>怎麼判讀：</b>會叫，表示兩筆間有足夠低電阻的路徑；不代表每次都是故障。這裡是刻意讓筆尖接通。</p>
  <aside class="safety">結果不符時，檢查插孔、檔位與接觸。不要改接電源來試。通斷檔不能用在帶電電路。</aside>
`),
page(3,'操作 2 · 不接外部電源','麵包板：哪些孔原本就相通？','孔靠得很近，不一定相通。用電表驗證，不只看外觀。',`
  <figure class="diagram">${board()}<figcaption>示意圖只畫中央接線區兩列，不含兩側電源軌；依實物字母與列號找孔。</figcaption></figure>
  <h2>先讀一個孔位</h2><p><b>a10</b> 是 a 欄、第 10 列。這張圖中，a10 到 e10 是同一組；f10 到 j10 是另一組。</p>
  <h2>用兩條杜邦線把測試位置引出來</h2>
  <ol class="steps compact"><li>在要比較的兩個孔，各插入一條公對公杜邦線。</li><li>紅、黑表筆各碰一條線另一端的金屬針。</li><li>兩條線末端不要互碰；不要把粗表筆硬塞進麵包板孔。</li></ol>
  <table><thead><tr><th>比較的兩孔</th><th>先猜：叫／不叫</th><th>實測：叫／不叫</th></tr></thead><tbody><tr><td>a10 與 e10</td><td>____________</td><td>____________</td></tr><tr><td>a10 與 a11</td><td>____________</td><td>____________</td></tr><tr><td>a10 與 f10</td><td>____________</td><td>____________</td></tr></tbody></table>
  <p><b>核對：</b>正常、未加其他接線的這類麵包板，三次應是「叫、不叫、不叫」。不符時先確認列號、線是否插到底，以及表筆接觸。</p>
`),
page(4,'操作 3 · 不接外部電源','按鈕不是四個互不相干的腳','先找「一直相通」的一組，再找「按下才相通」的兩組。',`
  <figure class="diagram">${svg(switchDiagram(false)+switchDiagram(true),268)}<figcaption>這是內部連接示意，不是腳位擺放圖。A1、A2、B1、B2 是本頁為說明測試而標的腳，必須實測辨認。</figcaption></figure>
  <h2>按鈕先不要裝進其他電路</h2>
  <ol class="steps compact"><li>放開按鈕，用通斷檔比較各腳，找出原本就相通的兩腳，記為 A1、A2。</li><li>確認另兩腳放開時也相通，記為 B1、B2。</li><li>紅筆碰 A1、黑筆碰 B1。固定接觸後，再比較放開與按下。</li></ol>
  <table><thead><tr><th>量哪兩腳</th><th>放開時的預期</th><th>按下時的預期</th></tr></thead><tbody><tr><td>A1 與 A2（同組）</td><td>會叫</td><td>會叫</td></tr><tr><td>A1 與 B1（跨組）</td><td>不叫</td><td>會叫</td></tr></tbody></table>
  <p><b>最重要的判斷：</b>要讓按鈕改變連通，必須從兩組各取一腳。只取同組兩腳，按不按都相通。</p>
  <p class="question">我的按鈕哪兩腳是同組？在紙上畫四個腳，把相通的一組圈起來。若測不出上表結果，先一起核對接觸與腳位，不接 ESP32。</p>
`),
page(5,'一起做 · 先找位置','拿出開發板，找到兩個腳位','先找印字，不接線。這一段只用 GPIO4 與 GND。',`
  <figure class="diagram"><img style="width:100%;height:90mm;object-fit:contain" src="${photo('ESP32S3_1.png')}" alt="YD-ESP32-S3 實物正面，天線向左、USB 向右；GPIO4 在下排，左上端有 GND"/><figcaption>照片：課堂既有 YD-ESP32-S3 Type-A V1.5。把你的板子轉成相同方向：天線在左，兩個 USB 接頭在右。</figcaption></figure>
  <h2>跟著找到，先用手指出來</h2>
  <table><thead><tr><th>這次找哪個腳</th><th>照片中的位置</th></tr></thead><tbody><tr><td>印字「4」</td><td>下排，印字 RST 的右邊、5 的左邊。這是 GPIO4，不是「數第四個腳」。</td></tr><tr><td>印字「GND」</td><td>上排最左端，靠天線這一側。這次統一使用這個 GND。</td></tr></tbody></table>
  <p><b>板子先放桌上：</b>放在乾燥、不導電的平面，不插進這塊 400 孔麵包板。稍後用公對母杜邦線連過去。</p>
  <aside class="safety">本接法只對應圖示板型。你的印字或板型不一樣，就停在辨認這一步，和全班一起核對，不靠外形猜腳位。板上若還有其他作品的接線，先斷開所有電源，另用空白器材準備本實驗。</aside>
`),
...require('./beginner_setup.cjs')({page,photo,reference,escape,hello,svg,marker,block,arrow}),
page(15,'一起做 · 換成按鈕程式','先換程式，再拔 USB 接按鈕','剛才只會傳回 Hello；現在換成能回報「按下／放開」的程式。',`
  <p>在剛才的 Arduino IDE 點 <b>File → New Sketch</b>，將編輯區全選，換成下面整段程式，再用 Ctrl+S 存成 <b>button_follow_along</b>。板子仍只接 USB，沒有杜邦線。</p>
  <h2>開新草稿，整段貼上並上傳</h2>
  <pre>${escape(sketch)}</pre>
  <ol class="steps compact"><li>依第 10–11 頁核對板型、Port 與選項；新視窗不一定沿用前一份設定。先關閉 Hello 草稿的訊息視窗。</li><li>按左上方右箭頭 <b>Upload</b>。完成後點 <b>Tools → Serial Monitor</b>，選 <b>115200</b>。</li><li>現在還沒有接按鈕，應持續出現 <b>released</b>，意思是「放開」。這是預期畫面，不是本次實測紀錄。</li><li>看到後，關閉訊息分頁、拔掉 USB，確認 PWR 燈熄滅。</li></ol>
  <aside class="safety">未完成上傳或看不到 released，先核對程式、Port 與 USB 接頭，不先接線猜原因。</aside>
`),
page(16,'一起做 · USB 保持拔除','先放按鈕，暫時不接開發板','拿剛才已測出兩組腳的按鈕，跨中央槽放入。',`
  <figure class="diagram">${buttonBoard()}<figcaption>俯視孔位圖。按鈕跨過中央槽；圓點標出四個腳插入的位置。圖中沒有開發板接線。</figcaption></figure>
  <ol class="steps"><li>找到麵包板第 <b>27</b> 列與第 <b>29</b> 列。</li><li>將四腳放在 <b>e27、f27、e29、f29</b>。若腳距不能自然對孔，不硬壓。</li><li>方向要符合：第 27 列兩腳原本同組；第 29 列兩腳是另一組。</li></ol>
  <h2>用剛才學會的通斷測試一起核對</h2>
  <table><thead><tr><th>測哪裡</th><th>預期</th></tr></thead><tbody><tr><td>a27 與 j27，按鈕放開</td><td>會叫：跨槽兩腳是同組</td></tr><tr><td>a29 與 j29，按鈕放開</td><td>會叫：另一組也相通</td></tr><tr><td>a27 與 a29，先放開，再按住</td><td>不叫 → 會叫</td></tr></tbody></table>
  <p>沿用兩條公對公線引出測點。結果不同，先找按鈕方向、孔位與接觸；此時不接 USB。完成後移除量測延長線，電表轉 OFF、表筆放旁邊。</p>
`),
page(17,'一起做 · 第一條線','GPIO4 接到 a27','拿一條公對母杜邦線。線色只是方便辨認，接點才是重點。',`
  <figure class="diagram">${buttonBoard(1)}<figcaption>接線關係圖，不是開發板實體排針排列圖。GPIO4 的實物位置請對照第 5 頁。</figcaption></figure>
  <h2>這條線只有兩端</h2>
  <table><thead><tr><th>哪一端</th><th>接哪裡</th></tr></thead><tbody><tr><td>母頭：有插孔的一端</td><td>套到開發板印字「4」的排針</td></tr><tr><td>公頭：有金屬針的一端</td><td>插麵包板 a27</td></tr></tbody></table>
  <p>按鈕一腳已在 e27；a27 和 e27 是同一組孔，所以這條線已連到按鈕的一組腳。</p>
  <p class="question"><b>一起看目前狀態：</b>板子放桌上，只有這一條線；USB 沒插，3V3、5Vin、GPIO5 都沒有接線。</p>
`),
page(18,'一起做 · 第二條線','GND 接到 a29','拿第二條公對母杜邦線。第一條線保持不動。',`
  <figure class="diagram">${buttonBoard(2)}<figcaption>目前完整接法：GPIO4 → a27；GND → a29。兩線分別連到按鈕的兩組，不是接在同一組。</figcaption></figure>
  <table><thead><tr><th>哪一端</th><th>接哪裡</th></tr></thead><tbody><tr><td>母頭</td><td>套到第 5 頁指定的 GND 排針</td></tr><tr><td>公頭</td><td>插麵包板 a29</td></tr></tbody></table>
  <h2>全班一起照圖核對，現在仍不插 USB</h2>
  <ol class="steps compact"><li>按鈕仍在 e27、f27、e29、f29，方向沒有改變。</li><li>GPIO4 的線在 a27；GND 的線在 a29。不是 a28，也不是都在第 27 列。</li><li>只有這兩條開發板接線；沒有線接 3V3 或 5Vin。金屬針沒有意外碰到旁邊的腳。</li><li>電表已 OFF，表筆、量測延長線與其他模組都已移開。</li></ol>
  <aside class="safety">這一段不接 GPIO5，也不用另外接一顆電阻。接點或板型還不確定，就保持斷電，一起對照處理；不靠通電試錯。</aside>
`),
page(19,'一起做 · 看到結果','按下、放開，看文字改變','現在才插回板背標示 COM 的 USB 接頭，不用重新上傳。',`
  <ol class="steps"><li>打開 Serial Monitor，選同一塊板子的 Port 與 <b>115200</b>。</li><li>先不碰按鈕，看見什麼？接著按住約一秒，再放開約一秒。</li><li>一起重複三次，對照下表。不要快速點一下就放開。</li></ol>
  <table><thead><tr><th>手的動作</th><th>預期會持續出現</th><th>我看到的文字</th></tr></thead><tbody><tr><td>放開</td><td><code>released</code></td><td>____________</td></tr><tr><td>按住</td><td><code>pressed</code></td><td>____________</td></tr><tr><td>再次放開</td><td><code>released</code></td><td>____________</td></tr></tbody></table>
  <h2>預期畫面示例，不是實測紀錄</h2>
  <pre>released\nreleased\npressed\npressed\nreleased</pre>
  <p>這支程式約每 0.3 秒讀一次並印一行。按住時出現多行 pressed 是這次程式的預期行為，不是「按了很多次」，也不能用來判定按鈕彈跳。</p>
  <aside class="safety">文字不變：先拔 USB，再回第 16–18 頁核對方向與接點。完全沒有文字：先核對 Port、接頭與 115200。改線時不插 USB。</aside>
`),
page(20,'電壓與電流','按下會接通，為什麼讀到 LOW？','這個接法：放開是 HIGH，按下才是 LOW。',`
  <p><b>GPIO4 讀的是相對 GND 的電壓，不是電流大小。</b>GND 當作 0V；此處接點接近 3.3V 時讀到 HIGH，接近 0V 時讀到 LOW。</p>
  <p><b>電阻在哪裡？</b>在開發板上的 <b>ESP32 晶片內部</b>，不是按鈕或麵包板裡。第 15 頁的 <code>INPUT_PULLUP</code> 會開啟這顆「上拉電阻」，把 GPIO4 接向 3.3V。</p>
  <figure class="diagram">${pullup()}<figcaption>同一個電路的兩種狀態。框內是晶片內部，框外是已接好的線與按鈕。電壓為正常接線的近似說明，不是本次實測值。</figcaption></figure>
  <p><b>放開：</b>按鈕切斷通往 GND 的路。GPIO 輸入只取用極小電流，電阻兩端幾乎沒有電壓差，所以 GPIO4 仍接近 3.3V。</p>
  <p><b>按下：</b>GPIO4 經按鈕連到 GND，接點就接近 0V。此時有小電流經過上拉電阻與按鈕，但「有電流」不等於 HIGH。</p>
  <aside class="safety">這顆電阻會限制按下時的電流；不能改成把 3V3 電源腳直接用線接到 GND。</aside>
  <p>HIGH／LOW 是電壓的高低，不是電流的強弱。</p>
`),
...require('./ohms_law_pages.cjs')({page,svg,text,line,dot,marker,block,arrow}),
page(24,'GPIO 與訊息','LOW 怎麼變成電腦上的 pressed？','程式依照 GPIO4 的讀值，選擇傳回 pressed 或 released。',`
  <figure class="diagram">${flow()}<figcaption>按下時的資訊流。箭頭表示處理與傳送順序，不是電流路徑，也不是要新增的杜邦線。</figcaption></figure>
  <h2>文字是程式選的，不是按鈕自己送出的</h2>
  <p>第 15 頁的 <code>digitalRead(BUTTON_PIN)</code> 先讀 GPIO4，存進 <code>value</code>（暫存讀值的名字）。<br><code>if (value == LOW)</code> 再問：「讀值是不是 LOW？」是就印 <code>pressed</code>；不是就印 <code>released</code>。</p>
  <table><thead><tr><th>這個接法的動作</th><th>GPIO4 讀值</th><th>程式送出的文字</th></tr></thead><tbody><tr><td>放開</td><td>HIGH</td><td>released（放開）</td></tr><tr><td>按下</td><td>LOW</td><td>pressed（按下）</td></tr></tbody></table>
  <p class="question"><b>想一想：</b>若只把程式中的 <code>"pressed"</code> 改成 <code>"Hello"</code>，按下時 GPIO4 會變成 HIGH 嗎？<br><b>不會。</b>接線沒變，仍是 LOW；改變的只有送到電腦的文字。</p>
  <p>結束操作時，關閉 Monitor、拔掉 USB。</p>
  <p class="sources">原理核對：<a href="https://www.fluke.com/en/learn/blog/digital-multimeters/how-to-test-for-continuity">Fluke 通斷測試</a>；<a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html">Espressif GPIO</a>。預期結果為教學推演，非本次實測。</p>
`),
...require('./counter_project.cjs')({page,escape,svg,text,line,dot,marker,block,arrow,photo}),
page(35,'參考資料','操作依據與圖片來源','Arduino IDE 操作、ESP32 GPIO 與通斷測試的文件來源。',`
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
const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>Week 2 主教材：按鈕與計數器</title><style>${css}pre{font:10.5pt/1.4 Consolas,monospace;white-space:pre-wrap;margin:3mm 0;padding:3mm;background:#f1f4f5;border-left:3px solid #718991}code{font-family:Consolas,monospace}.reference{width:100%;object-fit:contain}.urlbox{padding:3mm;background:#edf5f4;font:10.5pt/1.5 Consolas,monospace;overflow-wrap:anywhere}.settings td,.settings th{padding:2mm 2.5mm}.troubleshooting{font-size:10.5pt}.troubleshooting th:first-child,.troubleshooting td:first-child{width:27%}.troubleshooting td{padding:2mm 2.5mm}ul{padding-left:6mm;margin:2mm 0}li{margin:1.5mm 0}</style></head><body>${pages.join('')}</body></html>`;
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
  await page.pdf({path:official,format:'A4',printBackground:true,preferCSSPageSize:true});
  fs.copyFileSync(official, path.join(__dirname,'Week2_main_layout_sample.pdf'));
  fs.mkdirSync(path.join(__dirname, 'checks'), {recursive:true});
  fs.writeFileSync(path.join(__dirname, 'checks/layout_check.json'), JSON.stringify(audit, null, 2) + '\n');
  fs.writeFileSync(path.join(__dirname, 'checks/published_main.json'), JSON.stringify({
    pdf: path.relative(root, official).replaceAll('\\', '/'), pages: pages.length,
    pdf_sha256: digest(official),
    inputs: Object.fromEntries([...inputs].sort().map(file => [path.relative(root, file).replaceAll('\\', '/'), digest(file)])),
  }, null, 2) + '\n');
  await browser.close();
  console.log(JSON.stringify(audit,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
