module.exports = ({page}) => [
page(1, 'Q1 · 實作', '一顆按鈕計數器', '用途：用按鈕記下完成了幾次動作，結果顯示在 Serial Monitor。', `
<p>Serial Monitor 是 Arduino IDE 顯示板子傳回文字的視窗。外接按鈕是按下才接通的開關；ESP32 執行程式、計次及保存次數，再傳到電腦顯示。麵包板讓元件不用焊接就能連起來，接法看 Ans。</p>
<p>板上 RST 是重新啟動程式的小按鍵，與外接按鈕不同。GND 是電路共同的 0 V 參考。同堂可沿用接線，分別上傳三件作品的程式。</p>
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
<p>按鈕送出開始／暫停操作；ESP32 程式計算並保存累計時間，Serial Monitor 顯示結果。</p>
<h2>作品要做到</h2><ul><li>重啟顯示 STOP、elapsed_ms=0。STOP 表示暫停；RUN 表示正在計時。</li><li>按一下開始，下一次按下暫停，再按從原數字繼續；暫停期間不累加。</li><li>elapsed_ms 是累計時間，單位毫秒（ms）：1000 ms = 1 秒。按住只切換一次。</li><li>放開後按板上 RST 清為 0 並停止；開機按住也必須先放開。</li></ul>
<h2>預期結果與驗證</h2><p>開始後等約兩秒再暫停；暫停約兩秒；再開始約一秒後暫停。手動操作不要求精準到毫秒。</p>
<table class="settings"><tr><th>狀態</th><th>顯示示例</th></tr><tr><td>第一次暫停</td><td>STOP elapsed_ms=2100</td></tr><tr><td>暫停兩秒後</td><td>仍為 2100</td></tr><tr><td>繼續約一秒再暫停</td><td>STOP elapsed_ms=3200</td></tr></table><p class="sources">2100、3200 是示例，不是要求抄出的實測值。最後數字應只多出再次 RUN 的時間。</p>
<h2>完成後回答</h2><p>記下第一次 STOP、STOP 約兩秒後、再次 RUN 約一秒後的第二次 STOP，這三個時刻的實際數字。</p><div class="write-space" style="height:28mm"></div>
`),
page(4, 'Q4 · 實作檢查', '按鈕狀態與重啟後的次數', '用途：分清按鈕現在是否按住，與這次啟動後已接受幾次新按下。沿用 Q1 計數器，不增加元件。', `
<h2>作品要做到</h2><ul><li>Serial Monitor 同時顯示 pressed（按住）或 released（放開），以及 count 次數。</li><li>按住按鈕並按板上 RST 重啟；狀態應為按住，但次數清為 0。</li><li>先放開，再按一次，才接受第一次新按下。繼續按住不連加。</li></ul>
<h2>預期結果與驗證</h2>
<table class="settings"><tr><th>操作</th><th>最新顯示</th></tr><tr><td>按住按鈕，按 RST；仍按住約兩秒</td><td>pressed count=0，保持不變</td></tr><tr><td>放開約一秒</td><td>released count=0</td></tr><tr><td>再按住約兩秒</td><td>pressed count=1，保持不變</td></tr></table>
<p class="sources">預期格式示例。看最新一行；狀態改變才新增一行，不要求每秒重複列印。</p>
<h2>完成後回答</h2><p>展示上述操作。按住並重啟後，狀態與次數各是什麼？接著做什麼動作，次數才第一次增加？</p><div class="write-space" style="height:40mm"></div>
<aside class="safety">檢查使用原本正常接法，不取消上拉或帶電拔線。下課先拔除全部電源，再拆除元件。</aside>
`)
];
