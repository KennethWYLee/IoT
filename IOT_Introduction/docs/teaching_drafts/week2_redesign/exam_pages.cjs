module.exports = ({page}) => [
page(1, 'Q1 · 實作', '一顆按鈕計數器', '用途：用按鈕記下完成了幾次動作，結果顯示在 Serial Monitor。', `
<p>Serial Monitor 是 Arduino IDE 中顯示板子傳回文字的視窗。三件作品依序練習<b>記次數、保留開關狀態、累計活動時間</b>。各自只用一顆按鈕，不增加 LED；同堂可沿用已確認接線，分別上傳程式。</p>
<aside class="safety">每週從空麵包板開始。接線及改線前拔除 USB 與全部電源；不把按鈕直接接在電源正極與 GND 之間。下課先斷開全部電源，再拆除導線與元件收好。</aside>
<h2>作品要做到</h2><ul><li>重啟後次數為 0；放開後每按一次加 1。</li><li>按住約兩秒只算一次；必須放開再按才增加。</li><li>開機時若按住，不自動加次數，先放開再按。</li></ul>
<h2>預期結果與驗證</h2><table class="settings"><tr><th>操作</th><th>最新顯示</th></tr><tr><td>放開按鈕，按板上 RST 重啟</td><td>count=0</td></tr><tr><td>按住兩秒</td><td>count=1，保持不變</td></tr><tr><td>放開約一秒，再按</td><td>count=2</td></tr></table>
<p class="sources">以上是預期輸出示例，不是本組實測紀錄。count 表示次數。</p>
<h2>完成後回答</h2><p>展示上述操作。你按住兩秒時，次數從多少變成多少？</p><div class="write-space" style="height:30mm"></div>
`),
page(2, 'Q2 · 實作', '按一下切換的文字開關', '用途：手放開後仍保留開或關的狀態，不必一直按住。', `
<h2>作品要做到</h2><ul><li>Serial Monitor 顯示 OFF（關）或 ON（開）；這裡只切換文字，不控制外接電器。</li><li>重啟從 OFF 開始。每次按下在 OFF、ON 之間切換一次，放開時不切換。</li><li>按住不反覆切換；開機時按住必須先放開，才接受下一次按下。</li></ul>
<h2>預期結果與驗證</h2><table class="settings"><tr><th>操作</th><th>最新顯示</th></tr><tr><td>放開後重啟</td><td>OFF</td></tr><tr><td>按住兩秒，再放開</td><td>ON，放開後仍是 ON</td></tr><tr><td>再按住兩秒，再放開</td><td>OFF，放開後仍是 OFF</td></tr><tr><td>再按一次</td><td>ON</td></tr></table>
<p class="sources">預期文字示例，不是本組實測。每次切換才新增一行，判斷時看最新一行。</p>
<h2>完成後回答</h2><p>展示 ON 與 OFF 的切換。第一次放開按鈕後，畫面保留什麼？</p><div class="write-space" style="height:35mm"></div>
`),
page(3, 'Q3 · 實作', '可以暫停的單鍵碼表', '用途：累計實際進行活動的時間，休息時暫停，再按可接著計時。', `
<h2>作品要做到</h2><ul><li>重啟顯示 STOP、elapsed_ms=0。STOP 表示暫停；RUN 表示正在計時。</li><li>按一下開始，下一次按下暫停，再按從原數字繼續；暫停期間不累加。</li><li>elapsed_ms 是累計時間，單位毫秒（ms）：1000 ms = 1 秒。按住只切換一次。</li><li>放開後按板上 RST 清為 0 並停止；開機按住也必須先放開。</li></ul>
<h2>預期結果與驗證</h2><p>開始後等約兩秒再暫停；暫停約兩秒；再開始約一秒後暫停。手動操作不要求精準到毫秒。</p>
<table class="settings"><tr><th>狀態</th><th>顯示示例</th></tr><tr><td>第一次暫停</td><td>STOP elapsed_ms=2100</td></tr><tr><td>暫停兩秒後</td><td>仍為 2100</td></tr><tr><td>繼續約一秒再暫停</td><td>STOP elapsed_ms=3200</td></tr></table><p class="sources">2100、3200 是示例，不是要求抄出的實測值。最後數字應只多出再次 RUN 的時間。</p>
<h2>完成後回答</h2><p>記下暫停前、暫停約兩秒後、再次計時後的三個實際數字。</p><div class="write-space" style="height:28mm"></div>
`),
page(4, 'Q4 · 觀念', '放開按鈕時，訊號由誰決定？', '上拉電阻是晶片內的一個電阻，讓輸入接點經電阻接向 3.3 V。', `
<p>本題用 GND 作 0 V 參考。HIGH 表示輸入電壓高，LOW 表示輸入電壓低；它們不是按下次數。</p>
<figure><svg viewBox="0 0 650 110" role="img" aria-label="3.3V經內部上拉電阻接輸入，放開的按鈕使通往GND的路斷開"><text x="5" y="55" font-size="18">3.3 V</text><path d="M68 48H115 M225 48H405 M485 48H560" fill="none" stroke="#246f74" stroke-width="3"/><rect x="115" y="34" width="110" height="28" fill="#fff2dc" stroke="#80632d"/><text x="170" y="24" font-size="18" text-anchor="middle">上拉電阻</text><circle cx="310" cy="48" r="5" fill="#246f74"/><text x="310" y="88" font-size="18" text-anchor="middle">輸入接點</text><path d="M405 48L475 24" stroke="#246f74" stroke-width="3"/><text x="445" y="88" font-size="18" text-anchor="middle">按鈕放開</text><text x="567" y="55" font-size="18">GND</text></svg><figcaption>線是電路連接，不是實物排針順序。這些情況只作紙上推理，不改線製造故障。</figcaption></figure>
<p>正常接法中，放開及按下時，各會讀到 HIGH 還是 LOW？請說明輸入接點分別連到哪裡。</p><div class="write-space" style="height:35mm"></div>
<p>只取消晶片內的上拉電阻，按鈕及其餘接線不變。放開時能保證讀到 LOW 嗎？為什麼？</p><div class="write-space" style="height:35mm"></div>
`)
];
