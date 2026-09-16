const fs = require('node:fs');
const path = require('node:path');

module.exports = ({page, escape, svg, text, line, dot, marker, block, arrow, photo}) => {
  const code = fs.readFileSync(path.join(__dirname, 'counter_two_buttons/counter_two_buttons.ino'), 'utf8').trim();
  const split = code.indexOf('\nvoid loop()');
  const solution = fs.readFileSync(path.join(__dirname, 'counter_exercise_solution/counter_exercise_solution.ino'), 'utf8');
  const answer = solution.slice(solution.indexOf('void printCount('), solution.indexOf('\nvoid setup()')).trim();
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
      s+=text(138,y-24,'板內電阻',17,'text-anchor="middle"');
      s+=line(187,y,271,y)+dot(231,y)+text(231,y+40,i?'GPIO5':'GPIO4',18,'text-anchor="middle"');
      s+=line(271,y,350,y)+dot(350,y)+line(350,y,413,i?y-25:y)+dot(413,y)+line(413,y,520,y);
      s+=text(380,y+40,i?'減鍵放開':'加鍵按下',18,'text-anchor="middle"');
      if(!i)s+=arrow(275,y-21,333,y-21);
    });
    s+=line(520,70,520,214)+text(537,145,'GND',19);
    return svg(s,245);
  }
  return [
    page(22,'延伸作品 · 先看要做什麼','兩個按鈕，做一個計數器','沿用剛才的按鈕，讓電腦不只顯示按下，還能顯示累計數字。',`
      <figure class="diagram">${svg(marker+block(12,24,157,66,'加鍵：加一')+arrow(171,57,253,105)+block(260,74,185,68,'ESP32 記住數字')+block(12,151,157,66,'減鍵：減一')+arrow(171,184,253,113)+arrow(445,108,496,108)+block(503,74,137,68,'電腦顯示'),242)}<figcaption>資訊流，不是接線圖。數字由 ESP32 計算，經 USB 傳回電腦；本段不用 Wi-Fi、手機或 OLED。</figcaption></figure>
      <h2>先跟著試這一串動作</h2>
      <p><b>從 0 開始 → 加、加、加 → 顯示 3 → 減、減 → 顯示 1。</b><br>每次按完都先放開，再按下一次。</p>
      <table><thead><tr><th>這個範例採用的規則</th><th>預期結果</th></tr></thead><tbody>
      <tr><td>按一下加鍵／減鍵</td><td>加一／減一；按住不連續加減</td></tr>
      <tr><td>數字是 0，再按減鍵</td><td>維持 0，不出現負數</td></tr>
      <tr><td>數字是 99，再按加鍵</td><td>維持 99；99 是這次選的上限</td></tr>
      <tr><td>兩鍵重疊按住</td><td>停止接受新計數；兩鍵都放開才恢復</td></tr>
      <tr><td>按板上 RST 或斷電重開</td><td>重新從 0 開始，不保存上次數字</td></tr></tbody></table>
      <p>已有一顆按鈕、兩條公對母線與麵包板。<b>再拿一顆按鈕、一條公對母線、一條公對公線</b>即可。用既有材料，不另外買螢幕。</p>
      <p class="next">下一頁：先換成計數程式，再接第二顆按鈕。不要直接沿用舊的 GPIO5 輸出程式。</p>
    `),
    page(23,'一起做 · 先換程式','先讓板子準備好讀兩顆按鈕','這次 GPIO4 和 GPIO5 都讀按鈕；GPIO5 不再用作 TPO 輸出。',`
      <ol class="steps"><li>關閉 Serial Monitor，拔 USB，移除其他電源。PWR 熄滅後，把開發板上的杜邦線全部拔下；按鈕可留在麵包板上。</li>
      <li>開發板單獨放桌上，只接板背標示 <b>COM</b> 的 USB 接頭。</li>
      <li>在 Arduino IDE 點 <b>File → Open（檔案 → 開啟）</b>，開啟隨講義提供的 <b>counter_two_buttons.ino</b>。若沒有檔案，可把第 29、30 頁程式依序貼進同一個新草稿，存成 counter_two_buttons。</li>
      <li>依第 10–11 頁選板型、Port 與選項。按右箭頭 <b>Upload</b>，等到上傳完成。</li>
      <li>開 <b>Tools → Serial Monitor</b>，選 <b>115200</b>。不按 BOOT，短按一次板上 <b>RST</b>，應看到下面這一行。</li></ol>
      <pre>event=start count=0</pre>
      <p><b>start</b> 表示程式剛開始；<b>count=0</b> 表示目前數字是 0。這是預期文字，不是本次硬體實測。</p>
      <p>這支程式沒有持續洗出文字：沒有按鈕操作時，畫面不增加是正常的。看不到起始文字，先回第 33 頁排查，不靠接線嘗試解決上傳問題。</p>
      <aside class="safety">看到起始文字後，再關閉 Monitor、拔 USB，確認 PWR 熄滅。這個順序先把兩腳改為輸入，避免把按鈕接到舊程式的輸出腳。此時先照做，程式原理在做出數字後講。</aside>
      <p class="next">下一頁：USB 保持拔除，放第二顆按鈕，先用電表確認方向。</p>
    `),
    page(24,'一起做 · 第二顆按鈕','原本的加鍵留下，再放一顆減鍵','先放按鈕；此頁仍不接開發板、不插 USB。',`
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
      <p class="next">下一頁：先恢復加鍵兩條線，再增加減鍵兩條線。</p>
    `),
    page(25,'一起做 · 完整接線','四條線，連好加鍵與減鍵','USB 仍拔除。兩顆按鈕共用同一個 GND。',`
      <figure class="diagram">${wiring()}<figcaption>俯視關係圖，圓點表示線插入的孔；線段交叉但沒有圓點，不表示相接。板卡放桌上，不插在麵包板；以孔位與接點辨認，不靠線色。</figcaption></figure>
      <table class="settings"><thead><tr><th>順序</th><th>線材</th><th>兩端接點</th></tr></thead><tbody>
      <tr><td>1. 恢復加鍵</td><td>公對母</td><td>GPIO4 → a27</td></tr>
      <tr><td>2. 恢復 GND</td><td>公對母</td><td>第 5 頁指定 GND → a29</td></tr>
      <tr><td>3. 增加減鍵</td><td>公對母</td><td>GPIO5 → a21</td></tr>
      <tr><td>4. 讓減鍵也接到 GND</td><td>公對公</td><td>b29 → a23</td></tr></tbody></table>
      <p><b>為什麼用 b29？</b>a29 已插 GND 線，b29 和 a29 是板內相通的孔。從 b29 拉線到 a23，就是把 GND 接到第二顆按鈕的另一組腳。</p>
      <aside class="safety">全班一起核對四條線：不接 3V3、5Vin、TPO 或其他模組。GPIO4 與 GPIO5 不可接在同一列相通的孔。電表、量測線已移除，才進下一頁。</aside>
      <p class="next">下一頁：插回 USB，看數字能否依照手的動作加減。</p>
    `),
    page(26,'一起做 · 看到作品結果','加、加、加，再減、減','先不用解釋程式。用自己的操作確認這個計數器。',`
      <ol class="steps compact"><li>插回 <b>COM</b> USB 接頭，開 Serial Monitor，選 <b>115200</b>。</li><li>兩鍵都放開，短按板上 RST，等一秒。看見 <b>event=start count=0</b> 後開始。</li><li>每次按約半秒、放開約半秒，再按下一次。不要重疊按兩鍵。</li></ol>
      <table><thead><tr><th>依序操作</th><th>應看到的數字</th><th>我實際看到</th></tr></thead><tbody>
      <tr><td>第一次按加鍵</td><td>1</td><td>________</td></tr><tr><td>第二次按加鍵</td><td>2</td><td>________</td></tr><tr><td>第三次按加鍵</td><td>3</td><td>________</td></tr><tr><td>第一次按減鍵</td><td>2</td><td>________</td></tr><tr><td>第二次按減鍵</td><td>1</td><td>________</td></tr></tbody></table>
      <h2>預期訊息，不是本次實測</h2>
      <pre>event=start count=0
event=plus count=1
event=plus count=2
event=plus count=3
event=minus count=2
event=minus count=1</pre>
      <p><b>plus</b> 是加一，<b>minus</b> 是減一，<b>count</b> 後面是計算後的數字。這次只在開始或接受操作時留一筆紀錄，不每隔 0.3 秒重複印出狀態。</p>
      <p class="question">接著按住加鍵兩秒。預期只從 1 變 2，不會一直增加。放開後，再按一下才變 3。</p>
      <p class="next">下一頁：用剛剛的結果，說明數字存在哪裡、按住為什麼不連加。</p>
    `),
    page(27,'做完再講 · 數字與電流','為什麼按一次，只加一次？','電線只告訴板子按鈕狀態；「加一」是程式訂的規則。',`
      <h2>數字存在 ESP32 執行中的程式裡</h2>
      <p><b>count</b> 是存放目前數字的變數。假設原本是 2，<code>count = count + 1;</code> 的意思是「先算 2 + 1，再把 3 存回 count」。不是數學上永遠成立的等式。</p>
      <p><code>count = count - 1;</code> 就是把目前數字減一再存回。電腦只接收並顯示結果；本版沒有把 count 存進斷電後仍保留的儲存空間，所以重啟會歸零。</p>
      <figure class="diagram">${current()}<figcaption>電流路徑示例：只有加鍵按下。上方有經電阻限流的小電流回到 GND；下方按鈕開路。兩腳各有自己的板內上拉電阻，GPIO 只是讀取接點狀態。</figcaption></figure>
      <h2>避免多算，其實是兩件事</h2>
      <table class="settings"><thead><tr><th>可能發生什麼</th><th>程式怎麼處理</th></tr></thead><tbody>
      <tr><td>手按住兩秒，程式讀到很多次「按下」</td><td>接受一次後暫停計數；兩鍵都放開並穩定後，才準備接受下一次。</td></tr>
      <tr><td>按鈕剛接觸時，短時間反覆接通、斷開</td><td>讀值連續 40 毫秒沒變才接受，這是本例的去抖設定。</td></tr></tbody></table>
      <p>40 毫秒＝0.04 秒，是本範例的選擇，不保證適用所有按鈕。太短的按下或放開可能不被接受；因此先用半秒的動作練習。兩鍵共用穩定等待時間，其中一鍵變化也會重新等待。</p>
      <p class="next">下一頁：不是只有「能加減」就完成，還要試長按、上下限與重新啟動。</p>
    `),
    page(28,'一起驗證 · 不只試成功一次','把計數器的規則逐項試出來','先寫預測，再操作；觀察不符就保留紀錄，不改成標準答案。',`
      <table class="settings"><thead><tr><th>測試條件與動作</th><th>預期</th><th>實際結果</th></tr></thead><tbody>
      <tr><td>RST 後，放開兩鍵一秒，再按減鍵</td><td>minimum，維持 0</td><td>________</td></tr>
      <tr><td>從 0 按加鍵並保持兩秒</td><td>只加到 1</td><td>________</td></tr>
      <tr><td>放開半秒，再按加鍵</td><td>加到 2</td><td>________</td></tr>
      <tr><td>放開後重做「加、加、減」三輪</td><td>從 2 依序到 3、4、5</td><td>________</td></tr>
      <tr><td>數字不是 0 時按 RST</td><td>start，回到 0</td><td>________</td></tr>
      <tr><td>啟動時按住加鍵，再放開；之後再按</td><td>啟動不計數，重新按才加到 1</td><td>________</td></tr></tbody></table>
      <h2>不用按 99 次，也能測上限</h2>
      <p>USB 拔除後，先拔下開發板所有杜邦線，再只接 USB。把程式 <code>MAX_COUNT = 99</code> 改為 <code>MAX_COUNT = 3</code> 並上傳。斷電後照第 25 頁恢復四條線；每次放開後再按，第四次加鍵應顯示 <b>maximum count=3</b>。這是測上限規則，不是宣稱實測到 99。</p>
      <h2>兩鍵一起按，不能拿來加減相抵</h2>
      <p>程式讀到兩鍵都按下，就等待兩鍵都放開。若第一顆早已被接受，原本那一次不會撤銷；本例不是精密的同時按壓辨識器。請測試「一起放開後，下一次單鍵能否正常計數」。</p>
      <p class="question"><b>想一想：</b>重新開啟電腦的 Monitor，一定會讓 count 歸零嗎？不一定；只有 ESP32 真的重新啟動才會。看有沒有新的 <code>event=start</code>，不能只看電腦視窗開關。</p>
      <p><b>保留作品證據：</b>一張接線照片、一段加減紀錄，以及本頁實際結果。記得寫下測試用的 MAX_COUNT。</p>
      <p class="next">作品先到這裡。結束時關閉 Monitor、拔 USB；後兩頁是完整程式，供開檔或回看使用。</p>
    `),
    page(29,'完整程式 · 前半段','程式先記住哪些事？','先完成操作再回來看。前後兩頁屬於同一個 Arduino 草稿。',`
      <pre class="counter-code" style="line-height:1.3">${escape(code.slice(0,split))}</pre>
      <table class="settings"><thead><tr><th>程式內容</th><th>對應剛才的操作</th></tr></thead><tbody><tr><td>PLUS_PIN、MINUS_PIN</td><td>加鍵接 4，減鍵接 5</td></tr><tr><td>count、MAX_COUNT</td><td>目前數字與上限；最低是 0</td></tr><tr><td>readyForPress</td><td>是否已放開兩鍵，準備接受下一次</td></tr><tr><td>setup()</td><td>重新啟動時設定兩腳輸入，開始傳訊息</td></tr></tbody></table>
      <p class="next">下一頁：把 loop() 接在同一個草稿後面。不要只上傳這一頁。</p>
    `),
    page(30,'完整程式 · 後半段','反覆查看，必要時才改數字','此段接在上一頁後面；不要再貼一份 setup()。',`
      <pre class="counter-code" style="line-height:1.3">${escape(code.slice(split).trim())}</pre>
      <p class="sources">官方原理依據：<a href="https://docs.arduino.cc/built-in-examples/digital/StateChangeDetection/">Arduino State Change Detection</a>、<a href="https://docs.arduino.cc/built-in-examples/digital/Debounce/">Arduino Debounce</a>、<a href="https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html">Espressif GPIO</a>。本例另訂兩鍵需放開、0～99 上下限規則；不能照搬官方 UNO 範例的 5V 接線。</p>
      <p class="note">本計數器已做軟體檢查；雙按鈕新接法仍須實物核對與上機驗證。範例畫面不是本次硬體測試結果。</p>
    `),
    page(31,'練習題 · 先做，再翻頁','最多五人的小房間','把剛才的計數器改成人數紀錄；沿用原接線，不新增零件。',`
      <div class="goal"><b>情境：</b>房間最多容納 5 人。加鍵模擬一人進入，減鍵模擬一人離開。這是手動計數，不會偵測真人或控制門鎖。</div>
      <h2>請修改原計數器，完成兩件事</h2>
      <ol class="steps compact"><li>人數只能在 <b>0～5</b> 之間。0 人時按減鍵仍是 0；5 人時按加鍵仍是 5。</li><li>保留原本每筆 <b>event=… count=…</b> 紀錄。每次印完紀錄，如果目前是 5 人，下一行再印 <b>FULL</b>，表示已滿。不到 5 人時，不新增這行。</li></ol>
      <p>保留長按一次、兩鍵放開才接受下次、RST 歸零的規則。<b>不改 GPIO 或接線。</b>可參考既有範例與講義，先自己修改再翻頁核對。</p>
      <p><b>先填預測，再測試：</b>前四列依序操作，每次按半秒、放開半秒。最後一列重新按 RST 後再測。</p>
      <table class="settings"><thead><tr><th>操作</th><th>預測人數／有無新 FULL</th><th>實際結果</th></tr></thead><tbody>
      <tr><td>RST，兩鍵放開一秒；按減鍵</td><td>________／________</td><td>________</td></tr>
      <tr><td>依序按加鍵五次</td><td>________／________</td><td>________</td></tr>
      <tr><td>再按第六次加鍵</td><td>________／________</td><td>________</td></tr>
      <tr><td>按減鍵一次</td><td>________／________</td><td>________</td></tr>
      <tr><td>RST 後放開一秒，長按加鍵兩秒</td><td>________／________</td><td>________</td></tr></tbody></table>
      <p class="question"><b>再回答：</b>已經顯示過 FULL，減成 4 人後，舊的 FULL 還留在視窗中，代表現在仍然滿了嗎？應該看哪筆紀錄？</p>
      <aside class="safety">上傳修改版前，沿用第 23 頁：斷電拆開發板外接線，再只接 USB 上傳。完成後再斷電，依第 25 頁恢復四條線。不要帶電改線。</aside>
      <p class="next">完成程式、預測與實測紀錄後再翻頁。下一頁就是參考解答。</p>
    `),
    page(32,'參考解答 · 對照上一頁','上限改成五，滿了再印 FULL','只需修改上限與印出紀錄的函式，其餘計數與接線不變。',`
      <p><b>修改一：</b>把原本那行換成 <code>const int MAX_COUNT = 5;</code>，不要另加第二個同名設定。</p>
      <p><b>修改二：</b>用下列內容取代原本整個 <code>printCount()</code>：</p>
      <pre>${escape(answer)}</pre>
      <p><code>==</code> 是比較兩邊是否相等，不會修改 count；<code>=</code> 是把右邊的數值存回左邊。兩者用途不同。</p>
      <table class="settings"><thead><tr><th>上一頁的測試</th><th>答案：數字與新訊息</th></tr></thead><tbody>
      <tr><td>0 人時按減鍵</td><td>0；minimum，不新增 FULL</td></tr><tr><td>加鍵五次</td><td>1、2、3、4、5；第五次新增 FULL</td></tr><tr><td>第六次加鍵</td><td>維持 5；maximum，仍新增 FULL</td></tr><tr><td>減鍵一次</td><td>4；minus，不新增 FULL</td></tr><tr><td>重新 RST 後長按加鍵</td><td>只到 1；不新增 FULL</td></tr></tbody></table>
      <h2>第五次加鍵、第六次加鍵、減鍵的預期紀錄</h2>
      <pre>event=plus count=5
FULL
event=maximum count=5
FULL
event=minus count=4</pre>
      <p><b>觀念題：</b>舊 FULL 是過去的紀錄，不是現在的狀態。看最新的 <b>count=4</b>，現在沒有滿。程式不會自動刪除舊訊息。</p>
      <p class="sources">以上為參考答案與程式預期輸出，不是實機結果。完整解答另附 counter_exercise_solution.ino；仍需照題目自行觀察與留下紀錄。</p>
    `)
  ];
};
