# Week 11：事件、手機與遠端命令
日期：2026-11-18。可查資料或使用 AI；展示作品後回答，不重抄操作紀錄。

## A．按按鈕，手機看見事件
<strong>作品</strong>：兩顆按鈕控制 RGB，OLED 顯示裝置狀態；筆電保存事件，手機不用刷新就能看見新紀錄。

<strong>各部分的工作：</strong>START、STOP 是輸入；ESP32 收到按壓後決定狀態，RGB 用顏色表示，OLED 用文字顯示。兩者都不負責保存網路紀錄。

<strong>筆電與手機：</strong>後端是筆電上接收資料、處理命令的程式；SQLite 資料庫把紀錄存成檔案。手機頁顯示資料並提出操作要求。HTTP 傳送一次請求與回覆；WebSocket 保持連線，讓後端把新資料送到手機。

> 從空麵包板開始，改線先斷電。只用已核對的 3.3 V 相容 OLED、按鈕及有限流的低功率 RGB，不接舵機。只用允許的區域網路；不公開服務、不展示密碼或操作金鑰。

### 預期結果與驗證
| 操作 | 應看到什麼 |
|---|---|
| 先用筆電送一筆測試事件 | 後端保存，筆電頁面查到；這尚未測到 ESP32 |
| 裝置待機時按 START | OLED STATE:active、RGB 綠色；網路正常時手機新增 start_pressed |
| 按 STOP | OLED STATE:error、RGB 紅色，保持停止鎖定；網路正常時新增 stop_pressed |
| 手機頁面保持前景，不刷新 | 收到新事件；OLED 的 EV:201 表示後端接受最近事件，ID 用來核對這筆紀錄 |

先完成筆電測試，再確認 ESP32、OLED、按鈕／RGB與手機。手機選本組 DEVICE_ID（裝置代號）；事件 id 是後端給每筆事件的整數編號，兩者用途不同。SIM 是未驅動按鈕／RGB的測試模式，不算完成實物作品。

### Q1．你找到的是同一次按壓嗎？
展示一次 START 的燈色、OLED 與手機同一事件。寫下事件 id，用箭頭畫出按壓到手機的資料路徑；箭頭表示資訊傳遞，不表示電流。
<div class="write-space" style="height:34mm"></div>

<div class="exam-page"></div>

## B．手機送命令，裝置回報結果
<strong>作品</strong>：用手機 start、stop、reset 控制同一裝置，核對手機命令結果與 OLED／RGB 的實際反應。

<strong>特色</strong>：手機提出要求，後端保存；ESP32 每隔一段時間詢問是否有命令，稱為輪詢。ESP32 執行後回報。command_id 是每筆命令的編號，不是事件 id。

requested 表示後端已收到要求，accepted 表示裝置收到；done 表示裝置程式完成，rejected 表示拒絕，timeout 表示期限內未收到完成結果。後端也接受 error 作為失敗結果，本週裝置範例不會主動回報這個結果。<strong>裝置 STATE:error 是停止鎖定，不代表 stop 命令失敗。</strong>

### 預期結果與驗證
若 A 結束為 error，先放開 STOP、排除原因，用手機 reset，確認 done／idle／藍色，再測下表。
| 開始條件與手機操作 | OLED／RGB 與命令最終結果 |
|---|---|
| idle、藍色，送 start | active、綠色；done |
| 送 stop | error、紅色；done |
| error 時送 start | rejected，保持紅色 |
| 按住實體 STOP，送 reset | rejected，保持停止 |
| 放開 STOP、排除原因，再送 reset | idle、藍色；done；之後的新 start 才啟動 |

手機需填本組裝置代號與教師核准的臨時操作金鑰；後端只接受附正確金鑰的命令。accepted 可能很快變成最終結果，不要求用手截到每一個中間狀態。OLED LAST CMD 是最近處理的結果，CID 只顯示編號前八字；完整編號查手機或 Serial Monitor（Arduino IDE 經 USB 與板子互傳文字的視窗）。

<strong>程式核對：</strong>同次開機仍保存在最近八筆中的相同 command_id，只回報舊結果，不再次改輸出或新增事件。手機每按一次傳送會建立新 ID，不能用連按兩次當作這項驗證；也不保證重啟後仍記得舊 ID。

### Q2．手機結果與裝置反應一致嗎？
選一筆 done 及一筆 rejected，寫下完整 command_id、結果與實物反應。未確認結果時，先查原 ID，不以新的命令掩蓋前一筆。
<div class="write-space" style="height:45mm"></div>

<div class="exam-page"></div>

## C．啟動中不接受另一筆 start
<strong>作品</strong>：替 B 增加一條規則：裝置 active 時，另一個新 ID 的 start 必須被拒絕，不重做啟動事件。

<strong>特色</strong>：同一作品只增加狀態判斷，保留停止、reset 及相同 ID 不重做的規則。remote_start 是 ESP32 執行手機 start 後送出的事件名稱。

### 預期結果與驗證
| 開始條件與操作 | 應有結果 |
|---|---|
| idle，送新 start | 最終 done，active、綠色，新增 remote_start |
| active，再送新 start | 最終 rejected，理由 already active；不新增 remote_start |
| error 時 start、按住 STOP 時 reset | 仍 rejected；放開及排除原因後 reset 可恢復 |
| 閱讀相同 ID 的處理分支 | 回原結果並結束，不走新的 start；用程式核對，非手機連按測試 |

先正常啟動，再送另一筆 start，核對兩個不同 ID 與事件清單；最後用 stop、reset 確認仍可恢復。

### Q3．哪個判斷阻止了重做？
指出自己程式中「已啟動時拒絕」的位置，說明為什麼要在改輸出、新增事件之前判斷；再指出相同 ID 在哪裡先被處理。
<div class="write-space" style="height:37mm"></div>

### 修改測試事件的原因文字
serial_test 是在 Serial Monitor 輸入 test-event 產生的測試事件。JSON 用欄位名稱及值表示資料；reason 是原因文字。先送一筆修改前的 test-event 並記下 id；再於自己的 .ino 將 reason 從 manual_host_path_test 改成 classroom_test，重新上傳後送一筆。event_type、state、unit 不改。

展示修改前後後端接受的資料。只回答：哪個欄位改變？為什麼這不能當成新增一次實體按壓的證據？事件 id 與時間不同是正常的。
<div class="write-space" style="height:22mm"></div>

<div class="exam-page"></div>

## D．即時畫面與歷史查詢
<strong>作品</strong>：用兩個手機頁籤，核對 WebSocket 即時送來的事件與資料庫讀回的同一筆紀錄。

<strong>特色</strong>：兩頁選同一裝置。一頁保持前景、不刷新；另一頁之後重新整理。刷新只查詢紀錄，不再製造一次按壓。

### 預期結果與驗證
1. 裝置為 idle 時按 START：前景頁新增事件；另一頁刷新後找到相同事件 id 與內容。
2. 關閉手機頁面，保持 ESP32 與後端執行，再按一次 START；待機不是這項傳輸測試的必要條件，實體 START 仍會送按壓事件。
3. OLED 最近事件顯示 EV:201 與新 id 後，重新開啟手機頁面，查回同一 id。未收到 201 時先排錯，不假設已保存。

關閉頁面只關掉手機顯示及 WebSocket 連線。後端仍可接收 HTTP 並存入 SQLite；停止後端則收不到新資料，手機留著的舊畫面不算更新成功。

### Q4．手機關閉時，哪一部分還在工作？
寫下重新開頁後查到的事件 id，對照裝置回應。用這次結果說明，資料由誰接收、誰保存、誰顯示。
<div class="write-space" style="height:41mm"></div>

### Q5．手機如何找到你的筆電？
填本次成功網址中的筆電區域網路 IPv4 與連接埠。IPv4 找到電腦，連接埠 8000 找到本次服務；127.0.0.1 指向使用它的裝置自己，手機不能用它找到筆電。
<div class="write-space" style="height:32mm"></div>

<div class="exam-page"></div>

## 故障測試與恢復
每次只改一項，只操作本組裝置與服務；測完恢復，再成功送一筆事件。

| 測試 | 應看到什麼、如何驗證 |
|---|---|
| 手機改用不存在的裝置代號，送 start | 本組 ESP32 不會取得；後端 20 秒期限後顯示 timeout。這表示未確認執行，不是已完成 |
| ESP32 將目的網址暫改為 http://127.0.0.1:8000 | 指向 ESP32 自己，事件送不到筆電；改回筆電網址後送新事件，核對 201 與 id |
| 停止本組後端，按住實體 STOP 直到變紅 | ESP32 本機改 error／紅色；事件送達失敗。重啟後端後，以新事件核對恢復 |
| 由 /docs（後端內建的介面測試頁）傳 blink-forever | 這是範例不認識的命令，最終 rejected；缺金鑰的 403 或欄位錯誤的 422 不是裝置拒絕 |

實體 STOP 在 ESP32 處理，不以後端成功為條件；HTTP 請求仍可能暫時阻塞程式。可由影片估計按下到變色時間，不能宣稱即時急停。STOP 按住仍不得 reset，放開且排除原因後才恢復。

### Q6．第一個沒成功的是哪一段？
選一項故障，引用裝置訊息、HTTP 結果或命令狀態，說明仍工作與未完成的部分；修正後用什麼新結果確認恢復？
<div class="write-space" style="height:53mm"></div>

> 下課停止作品與服務、撤銷臨時金鑰，斷開 USB 及所有電源。確認斷電後拆下跳線與模組，留下空麵包板。未確認的硬體保持停用，只做不驅動按鈕／RGB的測試。
