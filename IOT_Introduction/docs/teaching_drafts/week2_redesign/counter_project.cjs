const fs = require('node:fs');
const path = require('node:path');

module.exports = ({page, escape, svg, text, line, dot, marker, block, arrow, photo}) => {
  const code = fs.readFileSync(path.join(__dirname, 'counter_practice/counter_practice.ino'), 'utf8').trim();
  function wiring() {
    const xs = [172,200,228,256,284,358,386,414,442,470];
    let s = '<rect x="145" y="8" width="358" height="363" fill="#fafafa" stroke="#839399"/><rect x="305" y="10" width="32" height="357" fill="#e6e9eb"/>';
    'abcdefghij'.split('').forEach((c,i)=>s+=text(xs[i],30,c,16,'text-anchor="middle"'));
    const y = r => 53+(r-21)*36;
    for(let r=21;r<=29;r++) {
      s+=text(516,y(r)+5,r,17);
      s+=line(xs[0],y(r),xs[4],y(r),'stroke-dasharray="3 4"')+line(xs[5],y(r),xs[9],y(r),'stroke-dasharray="3 4"');
      xs.forEach(x=>s+=`<circle cx="${x}" cy="${y(r)}" r="5" fill="white" stroke="#64757c"/>`);
    }
    [21,27].forEach(r=>{
      s+=`<rect x="276" y="${y(r)-8}" width="90" height="88" rx="3" fill="#e3e7ea" stroke="#43535c"/><circle cx="321" cy="${y(r)+36}" r="22" fill="#566973"/>`;
      [[284,y(r)],[358,y(r)],[284,y(r+2)],[358,y(r+2)]].forEach(([x,v])=>s+=`<circle cx="${x}" cy="${v}" r="5" fill="#fff4d6" stroke="#43535c"/>`);
      s+=text(556,y(r)+40,r===21?'減一':'加一',19);
    });
    s+=text(8,47,'GPIO5',19)+`<path d="M80 43 V53 H172" fill="none" stroke="#a46d21" stroke-width="4"/>`;
    s+=text(8,264,'GPIO4',19)+`<path d="M80 258 V269 H172" fill="none" stroke="#b44139" stroke-width="4"/>`;
    s+=text(8,351,'GND',19)+`<path d="M62 345 V341 H172" fill="none" stroke="#26343e" stroke-width="4"/>`;
    s+=`<path d="M200 341 V320 H127 V125 H172" fill="none" stroke="#35735b" stroke-width="4"/>`;
    [[172,53],[172,125],[172,269],[172,341],[200,341]].forEach(([x,v])=>s+=dot(x,v));
    s+=text(321,400,'公對公線：b29 → a23，共用 GND',19,'text-anchor="middle"');
    return svg(s,415);
  }
  function current() {
    let s = marker;
    [70,184].forEach((y,i)=>{
      s+=text(8,y+7,'3.3V',18)+line(65,y,92,y);
      s+=`<rect x="92" y="${y-12}" width="95" height="24" fill="#fff4d6" stroke="#947336"/>`;
      s+=text(138,y-24,'晶片內電阻',17,'text-anchor="middle"');
      s+=line(187,y,271,y)+dot(231,y)+text(231,y+40,i?'GPIO5':'GPIO4',18,'text-anchor="middle"');
      s+=line(271,y,350,y)+dot(350,y)+line(350,y,413,i?y-25:y)+dot(413,y)+line(413,y,520,y);
      s+=text(380,y+40,i?'減鍵放開':'加鍵按下',18,'text-anchor="middle"');
      if(!i)s+=arrow(275,y-21,333,y-21);
    });
    s+=line(520,70,520,214)+text(537,145,'GND',19);
    return svg(s,245);
  }
  return [
    page(25,'雙按鈕計數器','兩個按鈕，讓數字加減','加鍵讓數字增加，減鍵讓數字減少；結果顯示在 Serial Monitor。',`
      <figure class="diagram">${svg(marker+block(12,24,157,66,'加鍵：加一')+arrow(171,57,253,105)+block(260,74,185,68,'ESP32 記住數字')+block(12,151,157,66,'減鍵：減一')+arrow(171,184,253,113)+arrow(445,108,496,108)+block(503,74,137,68,'電腦顯示'),242)}<figcaption>資訊流，不是接線圖。數字由 ESP32 計算，經 USB 傳回電腦。</figcaption></figure>
      <table><thead><tr><th>操作</th><th>預期反應</th></tr></thead><tbody>
      <tr><td>按加鍵</td><td>畫面上的數字增加。</td></tr>
      <tr><td>按減鍵</td><td>畫面上的數字減少。</td></tr>
      <tr><td>兩键都放開</td><td>畫面不再新增數字。</td></tr></tbody></table>
      <p>已有一顆按鈕、兩條公對母線與麵包板。<b>再拿一顆按鈕、一條公對母線、一條公對公線</b>。本作品不需要 OLED、Wi-Fi 或手機。</p>
      <p>數字從 0 開始。這個程式只做加減，沒有名額、滿額提示或其他操作規則。</p>
    `),
    page(26,'一起做 · 先換程式','先讓板子準備好讀兩顆按鈕','剛才只用 GPIO4；這次增加 GPIO5，兩個腳都用來讀按鈕。',`
      <ol class="steps"><li>關閉 Serial Monitor，拔 USB，移除其他電源。PWR 熄滅後，把開發板上的杜邦線全部拔下；按鈕可留在麵包板上。</li>
      <li>開發板單獨放桌上，只接板背標示 <b>COM</b> 的 USB 接頭。</li>
      <li>有教師的 IoT 資料夾就沿用；否則開<a href="https://github.com/KennethWYLee/IoT">課程 GitHub</a>，按 <b>Code → Download ZIP</b>，下載後右鍵「全部解壓縮」。</li>
      <li>在資料夾依序開 <b>IOT_Introduction → docs → teaching_drafts → week2_redesign → counter_practice</b>。IDE 選 <b>檔案 → 開啟</b>，開裡面的 <b>counter_practice.ino</b>，不用抄第 30 頁。</li>
      <li>選 <b>檔案 → 另存新檔</b>，存到自己的練習位置，名稱仍用 <b>counter_practice</b>。依第 10–11 頁選板型、Port 與選項，按 <b>Upload</b> 等上傳完成。</li>
      <li>開 <b>Tools → Serial Monitor</b>，選 <b>115200</b>。不按 BOOT，短按一次板上 <b>RST</b>，應看到下面這一行。</li></ol>
      <pre>0</pre>
      <p>畫面上的 <b>0</b> 是計數器的起始數字。</p>
      <p>兩鍵都放開時，不會持續新增數字。看不到 0，確認 COM 接頭、自己的 Port 與 115200，再短按 RST；不要更動接線嘗試解決上傳問題。</p>
      <aside class="safety">看到起始文字後，關閉 Monitor、拔 USB，確認 PWR 熄滅。程式已將 GPIO4、GPIO5 設為讀取按鈕的輸入腳；接線時保持斷電。</aside>
    `),
    page(27,'一起做 · 第二顆按鈕','原本的加鍵留下，再放一顆減鍵','安裝與測試按鈕時，不接開發板，也不插 USB。',`
      <figure class="diagram"><img style="width:100%;height:59mm;object-fit:contain" src="${photo('ESP32S3_1.png')}" alt="同一塊 YD-ESP32-S3，GPIO5 在下排的印字 4 與 6 之間"/><figcaption>新增加的 GPIO5 是下排印字「5」，在「4」與「6」之間。不是從旁邊數第五腳。圖示板型不同時，先停止並核對。</figcaption></figure>
      <table><thead><tr><th>哪顆按鈕</th><th>四腳放在哪裡</th><th>稍後接哪個 GPIO</th></tr></thead><tbody>
      <tr><td>原本那顆，貼「＋」</td><td>e27、f27、e29、f29</td><td>GPIO4</td></tr>
      <tr><td>新增加的，貼「−」</td><td>e21、f21、e23、f23</td><td>GPIO5</td></tr></tbody></table>
      <h2>減鍵也要測，不用外形猜方向</h2>
      <p>沿用第 2–4 頁的電表通斷檔，以及公對公線引出測點。<b>兩顆按鈕現在都沒有接開發板。</b></p>
      <table><thead><tr><th>減鍵測點</th><th>預期</th></tr></thead><tbody>
      <tr><td>a21 與 j21，放開</td><td>會叫，同一組腳</td></tr>
      <tr><td>a23 與 j23，放開</td><td>會叫，另一組腳</td></tr>
      <tr><td>a21 與 a23，放開 → 按住</td><td>不叫 → 會叫</td></tr></tbody></table>
      <p>測試不符就停在方向與接觸檢查，不通電試錯。完成後移除量測線，電表 OFF、表筆放旁邊。</p>
    `),
    page(28,'一起做 · 完整接線','四條線，連好加鍵與減鍵','USB 仍拔除。兩顆按鈕共用同一個 GND。',`
      <figure class="diagram">${wiring()}<figcaption>俯視關係圖，圓點表示線插入的孔；線段交叉但沒有圓點，不表示相接。板卡放桌上，不插在麵包板；以孔位與接點辨認，不靠線色。</figcaption></figure>
      <table class="settings"><thead><tr><th>順序</th><th>線材</th><th>兩端接點</th></tr></thead><tbody>
      <tr><td>1. 恢復加鍵</td><td>公對母</td><td>GPIO4 → a27</td></tr>
      <tr><td>2. 恢復 GND</td><td>公對母</td><td>第 5 頁指定 GND → a29</td></tr>
      <tr><td>3. 增加減鍵</td><td>公對母</td><td>GPIO5 → a21</td></tr>
      <tr><td>4. 讓減鍵也接到 GND</td><td>公對公</td><td>b29 → a23</td></tr></tbody></table>
      <p><b>為什麼用 b29？</b>a29 已插 GND 線，b29 和 a29 是麵包板內相通的孔。從 b29 拉線到 a23，就是把 GND 接到第二顆按鈕的另一組腳。</p>
      <aside class="safety">核對四條線：不接 3V3、5Vin 或其他模組。GPIO4 與 GPIO5 不可接在同一列相通的孔。確認接線正確，移除電表與量測線後，才接 USB。</aside>
    `),
    page(29,'一起做 · 看到數字','加鍵增加，減鍵減少','看 Serial Monitor 中最後新增的數字。',`
      <ol class="steps"><li>插回 <b>COM</b> USB，開 Serial Monitor，選 <b>115200</b>。</li>
      <li>兩鍵放開，短按 RST，畫面應出現 <b>0</b>。</li>
      <li>只按加鍵，看到數字往上增加後放開。</li>
      <li>只按減鍵，看到數字往下減少後放開。</li></ol>
      <h2>預期畫面示例</h2>
      <pre>0
1
2
3
2
1</pre>
      <p>這段示例是三次加一、接著兩次減一的結果。<b>不是要求按三下就必定到 3</b>；手指按住多久、程式讀到幾次，會影響增加或減少的次數。</p>
      <p>畫面只印數字。每新增一行，表示 ESP32 剛做了一次加一或減一；放開後沒有新數字是正常的。</p>
      <aside class="safety">接線仍使用第 28 頁的四條線。需要改線時，先拔 USB。</aside>
    `),
    page(30,'雙按鈕計數器 · 完整程式','雙按鈕計數器完整程式','counter_practice.ino：讀按鈕、加減數字、顯示結果。',`
      <pre class="counter-code">${escape(code)}</pre>
      <table class="settings"><thead><tr><th>程式</th><th>意思</th></tr></thead><tbody>
      <tr><td>count = count + 1;</td><td>把目前數字加一，再存回 count。</td></tr>
      <tr><td>count = count - 1;</td><td>把目前數字減一，再存回 count。</td></tr>
      <tr><td>Serial.println(count);</td><td>顯示目前數字，然後換行。</td></tr></tbody></table>
    `),
    page(31,'計數器原理 · 資訊流','數字是誰算的？誰負責顯示？','以 count 原本是 2、這次讀到加鍵按下為例。',`
      <figure class="diagram">${svg(marker+
        block(60,12,530,48,'加鍵按下 → GPIO4 讀到 LOW')+arrow(325,60,325,88)+
        block(60,92,530,48,'ESP32 計算 count：2 → 3')+arrow(325,140,325,168)+
        block(60,172,530,48,'Serial.println(count) 輸出 3')+arrow(325,220,325,248)+
        block(60,252,530,48,'UART → 板上 CH343 → USB')+arrow(325,300,325,328)+
        block(60,332,530,48,'電腦 Serial Monitor 顯示 3'),395)}
      <figcaption>資訊流，不是電流方向或新增接線；對應本課板型、COM 接頭與 IDE 設定。</figcaption></figure>
      <h2>變數是程式記住的一個值</h2>
      <p><code>count = count + 1;</code> 先取出 2，計算 2 + 1，再把 3 存回 count。<code>=</code> 是存入，不是數學上的相等。</p>
      <p><code>Serial.println(count);</code> 把目前的 3 傳給電腦。ESP32 負責計算，Monitor 只負責顯示。</p>
      <p>按鈕沒有傳出「3」這個數字；按鈕改變 GPIO 的電壓，程式才決定如何修改 count。</p>
    `),
    page(32,'計數器原理 · 電流','按鈕的電流，不是 USB 的訊息','只有加鍵按下、減鍵放開時，兩條按鈕支路並不相同。',`
      <figure class="diagram">${current()}<figcaption>簡化電路：兩顆上拉電阻在 ESP32 晶片內部，不在按鈕或麵包板內。GPIO 是讀取接點電壓的位置。</figcaption></figure>
      <h2>加鍵按下：有一條經電阻的回路</h2>
      <p><b>3.3V → 晶片內上拉電阻 → 加鍵 → GND</b>。電阻限制電流，GPIO4 與 GND 之間的電壓接近 0V，所以讀到 LOW。不是電流變大就讀 HIGH。</p>
      <h2>減鍵放開：按鈕處斷開</h2>
      <p>減鍵這條支路幾乎沒有電流。上拉電阻上的壓降很小，GPIO5 對 GND 的電壓接近 3.3V，所以讀到 HIGH。不是電壓被「卡住」或用完。</p>
      <table><thead><tr><th>觀察的是什麼</th><th>對應內容</th></tr></thead><tbody>
      <tr><td>電流路徑</td><td>供電、上拉電阻、按鈕、GND；不是 count 的傳遞路徑</td></tr>
      <tr><td>資訊流</td><td>GPIO 讀值 → 程式計數 → Serial → 電腦</td></tr></tbody></table>
      <aside class="safety">兩個 GPIO 都是 INPUT_PULLUP。共用 GND 不代表把 GPIO4 和 GPIO5 短接。不要把 3V3 直接接到 GND；改線前拔 USB。</aside>
    `),
page(33,'延伸練習 · 20 人名額','活動入場人數登記','兩個按鈕登記人員進出，最多容納 20 人。',`
      <div class="goal">活動開始時有 0 人。有人進入就按加鍵，有人離開就按減鍵；多人進出時，可以按住按鈕連續登記。</div>
      <p>沿用第 28 頁的四條線，不加零件。IDE 選「檔案 → 另存新檔」，把 counter_practice 另存成 <b>room_counter</b>，再修改程式。</p>
      <table><thead><tr><th>操作</th><th>完成後應有的反應</th></tr></thead><tbody>
      <tr><td>短按加鍵或減鍵</td><td>每次加一或減一，顯示目前人數。</td></tr>
      <tr><td>按住加鍵不放</td><td>人數持續增加，到了 20 就停住，顯示 FULL。</td></tr>
      <tr><td>按住減鍵不放</td><td>人數持續減少，到了 0 就停住。</td></tr>
      <tr><td>兩鍵同時按住</td><td>暫停計數，保留目前人數；兩鍵都放開後才能重新操作。</td></tr>
      <tr><td>短按板上 RST</td><td>重新從 0 開始；放開兩鍵後再登記。</td></tr></tbody></table>
      <p>人數只能在 <b>0～20</b> 之間。長按時以固定、看得清楚的速度連續計數，不能因為程式跑得快就瞬間跳到 20。</p>
      <p>放開按鈕、停在上下限或雙鍵暫停時，不要一直印出相同訊息。到 20 顯示 FULL；有人離開後，再顯示更新的人數。</p>
      <aside class="safety">這是人數登記模擬，不會偵測真人。重新上傳前關 Monitor、拔 USB，拍下並拆除板上外接線；只接 COM USB 上傳。完成後拔 USB，照第 28 頁恢復接線，再通電測試。</aside>
    `),
    page(34,'延伸練習 · 預期結果與思考','用這些結果檢查自己的程式','USB 接 COM，Serial Monitor 選 115200。',`
      <p>表中的數字是完成練習後應顯示的人數；每列以「起始人數」為準。</p>
      <table class="settings"><thead><tr><th>起始人數</th><th>操作</th><th>預期結果</th></tr></thead><tbody>
      <tr><td>0</td><td>短按加鍵，放開，再短按減鍵</td><td>1 → 0</td></tr>
      <tr><td>0</td><td>按住減鍵</td><td>維持 0，不出現負數</td></tr>
      <tr><td>18</td><td>按住加鍵</td><td>19 → 20，顯示 FULL；繼續按仍是 20</td></tr>
      <tr><td>2</td><td>按住減鍵</td><td>1 → 0；繼續按仍是 0</td></tr>
      <tr><td>5</td><td>兩鍵一起按住</td><td>維持 5；只放開一鍵也不變</td></tr>
      <tr><td>5，雙鍵暫停中</td><td>兩鍵都放開，再短按加鍵</td><td>6</td></tr>
      <tr><td>任意人數</td><td>兩鍵放開，短按 RST</td><td>0</td></tr></tbody></table>
      <h2>回頭觀察 counter_practice</h2>
      <p><code>loop()</code> 是會反覆執行的程式區塊。請用第 30 頁的程式與操作結果回答：</p>
      <ol><li>從 0 按減鍵，為什麼可能出現負數？要在哪個判斷加入下限？</li>
      <li>按住不放，為什麼數字會一直變？「手指按一次」和「loop 執行一次」相同嗎？</li>
      <li>兩鍵都讀到 LOW 時，兩個 if 會依序做什麼？如何改成保留人數？</li>
      <li>短按 RST 後，數字會保留嗎？哪一行決定起始數字？</li></ol>
      <p>請在 room_counter 完成規則，再用表格測試。參考解答另見 week2Ans.pdf。</p>
    `)
  ];
};
