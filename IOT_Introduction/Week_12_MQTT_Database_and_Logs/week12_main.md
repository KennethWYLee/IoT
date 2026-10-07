# Week 12：多裝置訊息與歷史資料

日期：2026-11-25　組別／姓名：________________

可查資料與使用 AI；展示作品後回答。數字用自己的紀錄，未完成處如實註明。

## A．各自收到命令的兩台裝置

<strong>作品：</strong>與同意配對的組共用兩台既有裝置，代號不同，稱 A、B，不另買設備。各自送光線資料、收指定命令；OLED 顯示狀態／讀值，RGB 顯示待機／啟動／停止。

<strong>各部分：</strong>光敏模組將光線轉成訊號電壓；ESP32 讀成整數 raw、判斷狀態及收發資料。START／STOP 提出啟動／停止要求。OLED 顯示文字，RGB 用藍／綠／紅表示狀態；手機送要求、查紀錄。

<strong>訊息路徑：</strong>MQTT 是按主題轉送訊息的通訊方式。broker 是轉送程式；topic 是主題名稱，例如 course/A/telemetry；payload 是其中的內容。bridge 轉接程式把訊息交給後端；後端接收、檢查並保存到 SQLite 資料庫，再供手機查看。broker 收到不代表已保存。

從空板分段搭建，一台成功再配對。改線斷電；用已核對的 3.3 V 模組、有限流的低功率 RGB，不接舵機或高功率負載。只用獲准私人網路與臨時帳密，不公開服務或密碼。

### 預期結果與驗證

兩台先放開 STOP、各送 reset，確認 STATE:idle／藍色。error 在本程式代表停止鎖定，必須 reset 後才能重新啟動。

| 操作 | 應看見什麼 |
|---|---|
| 兩台各自遮光 | OLED raw 隨本台光線變化；手機資料標自己的代號，不互相覆蓋 |
| 只對 A 送 start | A 顯示 active／綠色並回 done；B 維持 idle／藍色 |
| 只對 B 送 stop | B 顯示 error／紅色並回 done；A 保持 active／綠色 |
| 主題送往 A，內容卻寫 B | A 拒絕處理，兩台不因此改變；這項是直接 MQTT 測試 |

SIM 尚未啟用按鈕／RGB，不算實物完成。MQTT:ONLINE 表示連上 broker；LAST CMD 是裝置最近結果，不證明後端收到。command_id 是命令代號，用手機或 USB 文字核對全文；OLED CID 只有前八字。

### Q1．誰收到，誰決定？

選一筆成功命令，寫 command_id 及 A、B 的反應。用箭頭畫手機命令到 A，再回手機的資料路徑。說明「送往 A、內容寫 B」由誰拒絕；箭頭表示資料，不是電流。

<div class="write-space" style="height:27mm"></div>

<div class="exam-page"></div>

## Q2．訂閱範圍

訂閱是登記要接收哪些主題。`+` 配對一層名稱，`#` 配對該位置以下的名稱。telemetry 傳感測資料，events 傳事件，acks 傳命令回覆。

保持同一組訊息，只換訂閱字串。在表中填實際是否收到；A、B 換成配對裝置代號。未測的列註明未測，不把主題配對推算寫成實測。

| 發布主題 | course/+/telemetry | course/A/# | course/# |
|---|---|---|---|
| course/A/telemetry | | | |
| course/A/events | | | |
| course/B/telemetry | | | |
| course/B/acks | | | |

主題配對不授予操作其他裝置的權限。

## B．看得出裝置失聯

<strong>作品：</strong>監看 A 上線、意外離線與重連，B 仍正常。presence 是連線狀態訊息；retained 是 broker 替主題保留最後一筆，讓較晚監看的人也能看到。Last Will 是裝置連線時預先交給 broker、失聯時由 broker 代發的訊息。

### 預期結果與驗證

1. A 上線後才開始訂閱 presence，仍收到 online／mqtt_session。這是最後狀態，不是新量測。
2. 拔 A 的 USB，保持 broker 執行，等待 offline／last_will 出現，再接回。B 持續工作；Will 的 state 可能是連線當時的舊狀態。
3. 暫停 bridge，在 A 離線時直接向 broker 發一筆新 reset，不保留該訊息。A 重連後不執行這筆；恢復 bridge 前確認後端沒有本台尚有效的待處理命令。

手機命令先存在後端，bridge 可能在期限內再送；這和第 3 項只發到 broker 的訊息不同。不把「不保留」寫成所有離線命令都不會再送。

### Q3．資料在哪一段停止增加？

展示上述狀態。接著只停 bridge，核對 broker 仍有的新訊息與手機最後一筆歷史資料，寫出缺少哪一段傳遞；不要重抄 Q1 的命令。

<div class="write-space" style="height:30mm"></div>

<div class="exam-page"></div>

## Q4．重送與故障反應

沿用 A、B。除立即重送外，每項都用新 command_id；恢復正常後再測下一項。

| 操作 | 應看見什麼 |
|---|---|
| 同次開機，立即重送相同 ID、相同內容 | 只回原最終結果，不再狀態轉換。最近八筆結果存在記憶體，重開機清除 |
| 刪去正常 JSON 最後的右大括號再發布 | 裝置拒絕解析，RGB 不變。JSON 是以欄位名與值傳資料的格式 |
| 新 ID 的 spin_forever | 最終 rejected／unknown command，不執行；accepted 只代表已收到 |
| 停 broker，按住實體 STOP 到變紅 | 本機改 error／紅色，不必先恢復 broker；回報可能失敗 |
| 按住 STOP，以新 ID 送 reset | rejected、保持紅色；放開後另送新 reset 可回 idle |
| 只停 bridge | broker 仍有新資料，手機與資料庫不沿此路徑增加 |

展示後，選同 ID 重送：寫原回覆與重送回覆，核對 USB 文字紀錄是否再出現 `state=… reason=remote_…`。遠端命令的狀態轉換在這裡核對，不拿實體按鈕事件冒充。

<div class="write-space" style="height:34mm"></div>

## Q5．離線時 STOP 多久有反應？

先定低功率 RGB 可接受的反應上限。broker 離線、裝置重試連線時，按住 STOP 直到紅色，用同一段影片估計按下到變紅的最慢時間，不用手按毫秒。寫明觀察方式並對照上限。

測前上限：____________　觀察結果：____________

<div class="write-space" style="height:25mm"></div>

網路呼叫可能阻塞，短按可能被漏讀。這不證明能作為馬達或高功率設備的緊急停止。

<div class="exam-page"></div>

## C．關掉網頁仍找得到紀錄

<strong>作品：</strong>查 A、B 已保存的光線資料及命令。手機可重新查歷史；指定事件種類與時間的查詢用後端 API。API 是程式提供的資料讀取入口；SQLite 保存紀錄，關掉網頁不會刪掉它。

### 預期結果與驗證

選定不再增加的時段。記裝置、事件種類、開始／結束時間及筆數上限，依同樣條件用 API 和只讀資料庫工具查詢，核對相同 id 的內容。正常重啟後端後仍找得到舊紀錄，欄位不重複新增。不刪資料湊筆數。

### Q6．兩種查詢是否一致？

寫查詢條件、實際筆數及同一筆 id。說明感測值、單位、valid（裝置判定是否有效）、uptime_ms（裝置開機後毫秒）及 recorded_at（後端收到時間）的意思。兩個時間來自不同時鐘。

<div class="write-space" style="height:35mm"></div>

### Q7．查到的是哪台裝置、哪種光線？

依自己的沒遮光／遮光讀值訂分界，寫明大於分界算哪類，等於分界算哪類；先確認兩種條件能區分，不能照抄別組方向。這和程式判定可接受讀值的上下限不同。

用同一段 light_sample 資料計兩類有效筆數、無效筆數／總筆數；valid 為空另列，沒資料不算零讀值。固定時段、事件種類、上限及分界，只拿掉裝置篩選再查。核對新增列的 device_id／id；沒有增加也如實記錄，碰到上限不能稱作全部紀錄。

<div class="write-space" style="height:40mm"></div>

<div class="exam-page"></div>

## D．找出失敗發生在哪一段

<strong>作品：</strong>用同一 command_id 核對手機要求、後端保存與裝置回覆。requested 是後端建立要求；accepted 是裝置的接受回報，兩者均未完成。done／rejected／timeout 是本次最終結果；STATE:error 是裝置停止鎖定，不是命令回覆。

### Q8．目前能確認走到哪裡？

選已完成與未取得最終結果的命令各一筆。若沒有未完成命令，可拔自己的 USB，用手機建立安全 reset，查它是否仍 requested，或已到 timeout。恢復前確認該 ID 及期限；期限內 bridge 可能再送，不用馬達測試。

選一筆寫目前狀態、已確認走到哪裡，及下一步應查看哪個程式的哪項紀錄，才能確認裝置執行與否。

<div class="write-space" style="height:24mm"></div>

### Q9．被拒絕與已保存的無效值

對不被其他程式寫入的測試代號，送 uptime_ms 為 −1 的資料。後端應回 422、不新增列；只改成非負整數再送，應回 201、加一列。HTTP 狀態碼是請求結果數字，422 是欄位不合規則，201 是新增成功。

| 觀察 | 實際結果 |
|---|---|
| 測試前筆數 | |
| 錯誤資料後：狀態碼／筆數 | |
| 修正後：狀態碼／筆數 | |

解釋這和格式正確、已保存但 valid=false 有何不同。

<div class="write-space" style="height:17mm"></div>

### Q10．展示資料的秘密檢查

檢查實際資料、截圖與程式，保留辨認命令、時間、結果的欄位；移除密碼、金鑰與不必要個資。只寫遮去了哪些項目或確認未包含，不寫秘密內容。

<div class="write-space" style="height:16mm"></div>

下課停止作品與本組服務，斷開所有電源後拆線收納。關閉後端視窗、下次用新 key；broker 臨時密碼不另作他用，設定只留本機，不放展示或 Git。
