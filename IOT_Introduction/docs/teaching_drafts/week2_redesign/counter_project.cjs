const fs = require('node:fs');
const path = require('node:path');

module.exports = ({page, escape, svg, text, line, dot, marker, block, arrow, photo}) => {
  const code = fs.readFileSync(path.join(__dirname, 'counter_two_buttons/counter_two_buttons.ino'), 'utf8').trim();
  const split = code.indexOf('\nvoid loop()');
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
    page(24,'延伸作品 · 雙按鈕計數器','兩個按鈕，做一個計數器','沿用剛才的按鈕，讓電腦不只顯示按下，還能顯示累計數字。',`
      <figure class="diagram">${svg(marker+block(12,24,157,66,'加鍵：加一')+arrow(171,57,253,105)+block(260,74,185,68,'ESP32 記住數字')+block(12,151,157,66,'減鍵：減一')+arrow(171,184,253,113)+arrow(445,108,496,108)+block(503,74,137,68,'電腦顯示'),242)}<figcaption>資訊流，不是接線圖。數字由 ESP32 計算，經 USB 傳回電腦；本段不用 Wi-Fi、手機或 OLED。</figcaption></figure>
      <h2>計數器的預期反應</h2>
      <p><b>從 0 開始 → 加、加、加 → 顯示 3 → 減、減 → 顯示 1。</b><br>每次按完都先放開，再按下一次。</p>
      <table><thead><tr><th>這個範例採用的規則</th><th>預期結果</th></tr></thead><tbody>
      <tr><td>按一下加鍵／減鍵</td><td>加一／減一；按住不連續加減</td></tr>
      <tr><td>數字是 0，再按減鍵</td><td>維持 0，不出現負數</td></tr>
      <tr><td>數字是 99，再按加鍵</td><td>維持 99；99 是這次選的上限</td></tr>
      <tr><td>兩鍵重疊按住</td><td>停止接受新計數；兩鍵都放開才恢復</td></tr>
      <tr><td>按板上 RST 或斷電重開</td><td>重新從 0 開始，不保存上次數字</td></tr></tbody></table>
      <p>已有一顆按鈕、兩條公對母線與麵包板。<b>再拿一顆按鈕、一條公對母線、一條公對公線</b>即可。用既有材料，不另外買螢幕。</p>
      <p>單按鈕程式只回報按下或放開；計數器需要換成雙按鈕計數程式。</p>
    `),
    page(25,'一起做 · 先換程式','先讓板子準備好讀兩顆按鈕','剛才只用 GPIO4；這次增加 GPIO5，兩個腳都用來讀按鈕。',`
      <ol class="steps"><li>關閉 Serial Monitor，拔 USB，移除其他電源。PWR 熄滅後，把開發板上的杜邦線全部拔下；按鈕可留在麵包板上。</li>
      <li>開發板單獨放桌上，只接板背標示 <b>COM</b> 的 USB 接頭。</li>
      <li>有教師的 IoT 資料夾就沿用；否則開<a href="https://github.com/KennethWYLee/IoT">課程 GitHub</a>，按 <b>Code → Download ZIP</b>，下載後右鍵「全部解壓縮」。</li>
      <li>在資料夾依序開 <b>IOT_Introduction → docs → teaching_drafts → week2_redesign → counter_two_buttons</b>。IDE 選 <b>檔案 → 開啟</b>，開裡面的 <b>counter_two_buttons.ino</b>，不用抄第 31、32 頁。</li>
      <li>先選 <b>檔案 → 另存新檔</b>，存成自己的 counter_practice。依第 10–11 頁選板型、Port 與選項，按 <b>Upload</b> 等上傳完成。</li>
      <li>開 <b>Tools → Serial Monitor</b>，選 <b>115200</b>。不按 BOOT，短按一次板上 <b>RST</b>，應看到下面這一行。</li></ol>
      <pre>event=start count=0</pre>
      <p><b>start</b> 表示程式剛開始；<b>count=0</b> 表示目前數字是 0。</p>
      <p>這支程式沒有持續洗出文字：沒有按鈕操作時，畫面不增加是正常的。看不到起始文字，先回第 35 頁排查，不靠接線嘗試解決上傳問題。</p>
      <aside class="safety">看到起始文字後，關閉 Monitor、拔 USB，確認 PWR 熄滅。程式已將 GPIO4、GPIO5 設為讀取按鈕的輸入腳；接線時保持斷電。</aside>
    `),
    page(26,'一起做 · 第二顆按鈕','原本的加鍵留下，再放一顆減鍵','安裝與測試按鈕時，不接開發板，也不插 USB。',`
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
    page(27,'一起做 · 完整接線','四條線，連好加鍵與減鍵','USB 仍拔除。兩顆按鈕共用同一個 GND。',`
      <figure class="diagram">${wiring()}<figcaption>俯視關係圖，圓點表示線插入的孔；線段交叉但沒有圓點，不表示相接。板卡放桌上，不插在麵包板；以孔位與接點辨認，不靠線色。</figcaption></figure>
      <table class="settings"><thead><tr><th>順序</th><th>線材</th><th>兩端接點</th></tr></thead><tbody>
      <tr><td>1. 恢復加鍵</td><td>公對母</td><td>GPIO4 → a27</td></tr>
      <tr><td>2. 恢復 GND</td><td>公對母</td><td>第 5 頁指定 GND → a29</td></tr>
      <tr><td>3. 增加減鍵</td><td>公對母</td><td>GPIO5 → a21</td></tr>
      <tr><td>4. 讓減鍵也接到 GND</td><td>公對公</td><td>b29 → a23</td></tr></tbody></table>
      <p><b>為什麼用 b29？</b>a29 已插 GND 線，b29 和 a29 是麵包板內相通的孔。從 b29 拉線到 a23，就是把 GND 接到第二顆按鈕的另一組腳。</p>
      <aside class="safety">核對四條線：不接 3V3、5Vin 或其他模組。GPIO4 與 GPIO5 不可接在同一列相通的孔。確認接線正確，移除電表與量測線後，才接 USB。</aside>
    `),
    page(28,'一起做 · 看到作品結果','加、加、加，再減、減','從 0 開始，按三次加鍵、兩次減鍵，預期最後顯示 1。',`
      <ol class="steps compact"><li>插回 <b>COM</b> USB 接頭，開 Serial Monitor，選 <b>115200</b>。</li><li>兩鍵都放開，短按板上 RST，等一秒。看見 <b>event=start count=0</b> 後開始。</li><li>每次按約半秒、放開約半秒，再按下一次。不要重疊按兩鍵。</li></ol>
      <table><thead><tr><th>依序操作</th><th>預期顯示的數字</th></tr></thead><tbody>
      <tr><td>第一次按加鍵</td><td>1</td></tr><tr><td>第二次按加鍵</td><td>2</td></tr><tr><td>第三次按加鍵</td><td>3</td></tr><tr><td>第一次按減鍵</td><td>2</td></tr><tr><td>第二次按減鍵</td><td>1</td></tr></tbody></table>
      <h2>Serial Monitor 預期訊息</h2>
      <pre>event=start count=0
event=plus count=1
event=plus count=2
event=plus count=3
event=minus count=2
event=minus count=1</pre>
      <p><b>plus</b> 是加一，<b>minus</b> 是減一，<b>count</b> 後面是計算後的數字。計數器只在開始或接受按壓時留一筆紀錄。</p>
      <p class="question">接著按住加鍵兩秒。預期只從 1 變 2，不會一直增加。放開後，再按一下才變 3。</p>
    `),
    page(29,'數字與電流','為什麼按一次，只加一次？','電線只告訴板子按鈕狀態；「加一」是程式訂的規則。',`
      <h2>數字存在 ESP32 執行中的程式裡</h2>
      <p><b>count</b> 是存放目前數字的變數。假設原本是 2，<code>count = count + 1;</code> 的意思是「先算 2 + 1，再把 3 存回 count」。不是數學上永遠成立的等式。</p>
      <p><code>count = count - 1;</code> 就是把目前數字減一再存回。電腦只接收並顯示結果；程式沒有把 count 存進斷電後仍保留的儲存空間，所以重啟會歸零。</p>
      <figure class="diagram">${current()}<figcaption>電流路徑示例：只有加鍵按下。上方有經電阻限流的小電流回到 GND；下方按鈕開路。兩腳各有 ESP32 晶片內的上拉電阻，GPIO 讀的是接點電壓的高低。</figcaption></figure>
      <h2>避免多算，其實是兩件事</h2>
      <table class="settings"><thead><tr><th>可能發生什麼</th><th>程式怎麼處理</th></tr></thead><tbody>
      <tr><td>手按住兩秒，程式讀到很多次「按下」</td><td>接受一次後暫停計數；兩鍵都放開並穩定後，才準備接受下一次。</td></tr>
      <tr><td>按鈕剛接觸時，短時間反覆接通、斷開</td><td>讀值連續 40 毫秒沒變才接受，這是本例的去抖設定。</td></tr></tbody></table>
      <p>40 毫秒＝0.04 秒，是本範例的選擇，不保證適用所有按鈕。太短的按下或放開可能不被接受；因此先用半秒的動作練習。兩鍵共用穩定等待時間，其中一鍵變化也會重新等待。</p>
    `),
    page(30,'計數器測試','計數器的三個測試','使用 counter_practice 與第 27 頁的接線。',`
      <div class="goal"><b>測試項目：</b>0 不能再減、按住只加一次、RST 會歸零。</div>
      <h2>從第一列往下做，不要跳著測</h2>
      <p>USB 接 COM，Serial Monitor 選 115200。開始時兩鍵都放開。表中訊息是<b>應新增的一行</b>，不是要你輸入的指令。</p>
      <table class="settings"><thead><tr><th>依序操作</th><th>預期新增訊息</th></tr></thead><tbody>
      <tr><td>1. 短按 RST，等一秒</td><td><code>event=start count=0</code></td></tr>
      <tr><td>2. 按減鍵半秒，再放開半秒</td><td><code>event=minimum count=0</code><br>最低是 0，不會變成 −1。</td></tr>
      <tr><td>3. 按住加鍵兩秒，先不放</td><td><code>event=plus count=1</code><br>只新增這一筆；繼續按住不連加。</td></tr>
      <tr><td>4. 放開半秒</td><td>沒有新訊息；數字仍是 1。</td></tr>
      <tr><td>5. 再按加鍵半秒，放開半秒</td><td><code>event=plus count=2</code></td></tr>
      <tr><td>6. 兩鍵放開，短按 RST</td><td><code>event=start count=0</code><br>剛才的 2 已歸零。</td></tr></tbody></table>
      <p><b>minimum</b> 表示已到最低值。沒有新訊息不等於故障；此程式只在開始或接受按壓時印訊息。</p>
      <aside class="note">結果不符時，確認已上傳 counter_practice、兩鍵有確實放開、Monitor 為 115200；改線前須拔 USB。</aside>
    `),
    page(31,'雙按鈕計數器 · 程式備查','計數器程式：設定與起始動作','counter_practice：加減範圍 0～99，對應第 24–30 頁。',`
      <pre class="counter-code" style="line-height:1.3">${escape(code.slice(0,split))}</pre>
      <table class="settings"><thead><tr><th>程式內容</th><th>對應剛才的操作</th></tr></thead><tbody><tr><td>PLUS_PIN、MINUS_PIN</td><td>加鍵接 4，減鍵接 5</td></tr><tr><td>count、MAX_COUNT</td><td>目前數字與上限；最低是 0</td></tr><tr><td>readyForPress</td><td>是否已放開兩鍵，準備接受下一次</td></tr><tr><td>setup()</td><td>重新啟動時設定兩腳輸入，開始傳訊息</td></tr></tbody></table>
      <p>第 31–32 頁合為完整的 counter_practice 程式；單獨一頁無法編譯。</p>
    `),
    page(32,'雙按鈕計數器 · 程式備查','計數器程式：持續讀取按鈕','counter_practice 的 loop()，搭配第 31 頁的設定與 setup()。',`
      <pre class="counter-code" style="line-height:1.3">${escape(code.slice(split).trim())}</pre>
      <p class="sources">官方原理依據：<a href="https://docs.arduino.cc/built-in-examples/digital/StateChangeDetection/">Arduino State Change Detection</a>、<a href="https://docs.arduino.cc/built-in-examples/digital/Debounce/">Arduino Debounce</a>、<a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html">Espressif GPIO</a>。本例另訂兩鍵需放開、0～99 上下限規則；不能照搬官方 UNO 範例的 5V 接線。</p>
    `),
    page(33,'練習題 · 房間人數計數器','最多五人的小房間','用兩個按鈕記錄進出人數，滿五人時顯示 FULL。',`
      <div class="goal"><b>你是小房間的管理員。</b>房間最多容納 5 人，開始時沒有人。你想用剛才的兩個按鈕，記錄目前有幾個人，並在滿額時提醒自己。</div>
      <figure class="diagram">${svg(marker+block(12,20,175,58,'加鍵：一人進入')+arrow(187,49,267,89)+block(275,68,185,70,'房內目前人數')+block(12,135,175,58,'減鍵：一人離開')+arrow(187,164,267,111)+arrow(460,103,504,103)+block(512,68,126,70,'電腦紀錄'),220)}<figcaption>情境示意，不是新增接線。每按一次模擬一人進出；程式不會真的看見人，也不會控制門鎖。</figcaption></figure>
      <h2>你要完成的作品，應遵守這些規則</h2>
      <table class="settings"><thead><tr><th>房間的情況</th><th>計數器應該怎麼做</th></tr></thead><tbody>
      <tr><td>還沒有人</td><td>從 0 開始；再按減鍵，也不能變成負數。</td></tr>
      <tr><td>目前 0～4 人，按加鍵</td><td>加一；到 5 人時，另外顯示 FULL。</td></tr>
      <tr><td>已經 5 人，又按加鍵</td><td>仍記 5，不變成 6；再次顯示 FULL。</td></tr>
      <tr><td>目前 5 人，按減鍵</td><td>變成 4；這次不再新增 FULL。</td></tr></tbody></table>
      <p><b>FULL 就是「已滿」。</b>這個模擬把第六次按加鍵當成「嘗試進入但未計入」；它不會阻止真人進門。</p>
      <p><b>你的任務：</b>將雙按鈕計數器改成房間人數計數器，符合以上規則，並以 <code>event=… count=…</code> 記錄每次接受的按壓。按住只算一次，兩鍵放開後才能再計數，按 RST 歸零。</p>
    `),
    page(34,'練習題 · 預期結果','做完後，應該看到這些訊息','人數從 0 加到 5，滿額後不再增加；減到 4 時不新增 FULL。',`
      <p>測試房間人數計數器時，USB 接 COM，Serial Monitor 選 115200；兩鍵都放開，從第一列依序操作。</p>
      <p>每次按半秒、放開半秒，再按下一次。右欄是 <b>Monitor 應新增的文字</b>，不是要輸入的指令；表中的每一列都接續上一列的人數。</p>
      <table class="settings"><thead><tr><th>依序操作</th><th>預期新增訊息</th></tr></thead><tbody>
      <tr><td>1. 短按 RST，等一秒</td><td><code>event=start count=0</code></td></tr>
      <tr><td>2. 空房間，按減鍵一次</td><td><code>event=minimum count=0</code></td></tr>
      <tr><td>3. 第一次按加鍵</td><td><code>event=plus count=1</code></td></tr>
      <tr><td>4. 第二次按加鍵</td><td><code>event=plus count=2</code></td></tr>
      <tr><td>5. 第三次按加鍵</td><td><code>event=plus count=3</code></td></tr>
      <tr><td>6. 第四次按加鍵</td><td><code>event=plus count=4</code></td></tr>
      <tr><td>7. 第五次按加鍵：滿了</td><td><code>event=plus count=5</code><br><code>FULL</code></td></tr>
      <tr><td>8. 第六次按加鍵：仍維持 5</td><td><code>event=maximum count=5</code><br><code>FULL</code></td></tr>
      <tr><td>9. 按減鍵一次：剩 4 人</td><td><code>event=minus count=4</code></td></tr></tbody></table>
      <p><b>minimum</b> 表示已到最低值；<b>maximum</b> 表示已到上限。到 5 人及滿額後再按加鍵，都應新增兩行；其餘步驟只有一行。</p>
      <aside class="note">減到 4 時，最新一行是 count=4，不再新增 FULL。先前的 FULL 仍留在歷史紀錄中。</aside>
    `)
  ];
};
