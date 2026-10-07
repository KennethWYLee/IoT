# Week4 program

從空麵包板開始，完整接法在 Week4 Ans。每件選 OLED 或 Serial Monitor；兩版功能相同。每支 .ino 保留同名資料夾。

| 題目 | OLED | Serial Monitor |
|---|---|---|
| Q1 環境顯示器 | environment_display_oled/environment_display_oled.ino | environment_display_serial/environment_display_serial.ino |
| Q2 超標提示器 | environment_alert_oled/environment_alert_oled.ino | environment_alert_serial/environment_alert_serial.ino |
| Q3 警報紀錄器 | environment_recorder_oled/environment_recorder_oled.ino | environment_recorder_serial/environment_recorder_serial.ino |
| Q4 電腦分析結果顯示 | environment_analysis_oled/environment_analysis_oled.ino | environment_analysis_serial/environment_analysis_serial.ino |

## 接線與上傳

DHT11 模組 DATA 預設 GPIO10；若接 GPIO1，PIN_DHT 必須改 1。Q1、Q4 光敏 S 接 GPIO4；Q3、Q4 按鈕接 GPIO5 與 GND。OLED 版 SDA 接 GPIO8、本片印字 SCK 接 GPIO9。供電與腳序依自己的模組確認；改線先拔全部電源。

ESP32 3V3 接麵包板＋軌，GND 接－軌；DHT、光敏、OLED 共用同一段電源軌。板外模組的 Q4 OLED 接法共 14 條杜邦線，不含 USB；Serial 版不接 OLED，10 條。不加光敏延長線，也不另加按鈕電阻。

核對 DHT 的 VCC、GND、DATA 及 3.3 V 相容性後才改 DHT_WIRING_CONFIRMED = true。OLED_CONTROLLER 依已確認型號選 1306 或 1315。Q1、Q2 Serial 版不需 Wire 或 U8g2；OLED 版另裝 U8g2，兩版皆需 Adafruit DHT sensor library 及依賴。Serial 速度 115200。

Q2、Q3 預設 28°C、65%RH；Q4 改為光線 RAW > 3000、溫度 > 28°C 各自警報，濕度只顯示。大於才超標，等於正常；是練習設定，不是照度校正或安全標準。核對本組遮光方向與 RAW 分界。每 2.5 秒讀取，DHT 失敗顯示 --。環境示範先由教師確認規格與實物反應，不用火、直接熱風或讓液體／蒸氣碰電路。

## Q3 警報次數與時間

1. 上傳 Q3。OLED 版直接看螢幕；Serial 版開 Serial Monitor，選 115200。
2. 等有效讀值，展示正常、進入警報、按鈕確認及恢復正常；核對 COUNT 與 TIME。
3. 持續同一次警報，次數不反覆增加；時間繼續累計。按鈕只改 ACK，不清除次數。
4. 按 RST 或重新上電，次數與時間歸零。本題只在裝置記憶體累計，不保存 CSV，也不需電腦工具。

按鈕確認不取消警報，不清除紀錄。持續超標只計一次；有效正常後再次超標才加次。UNKNOWN 暫停計時，之後仍超標延續原次，不重複計次。累計時間是程式警報時間，不是物理超標精確時間。

## Q4 自動保存與分析回傳

1. 上傳 Q4 OLED 或 Serial 程式；保留光敏、DHT、按鈕及所選顯示。同堂 Q3 沒接光敏時，斷電加光敏，S 接 GPIO4。
2. 關閉 Serial Monitor、Plotter 及其他占用同一 Port 的程式。桌面 Chrome／Edge 開 dual_alarm_analysis.html，保留旁邊四支 JS：analysis_client.js、alarm_report.js、dual_alarm_report.js、dual_analysis_ui.js。alarm_analysis.html 是舊版單組警報工具，不搭配新版 Q4。
3. 按「連接裝置」，選本片 ESP32。按「選擇資料夾」，選本機保存位置並允許寫入。
4. 按「開始新紀錄」。工具建立新 CSV，每筆保存後分析，再回傳光線、溫度各自的次數、累計與最長時間。
5. OLED 每三秒切換讀值／統計兩頁；L 是光線，T 是溫度。Serial 版核對工具的「裝置回傳」，不另開 Monitor。一顆實體按鈕確認當時仍開啟且未確認的警報，不清空統計。
6. 按「停止紀錄」，等保存完成；再次開始建立不同檔名，不覆蓋舊檔。中斷連線後才能重新上傳。
7. 在選定資料夾打開 CSV，按「下載報告」保存本機 HTML，可列印／另存 PDF。核對電腦、報告與裝置的 COUNT、TOTAL、MAX。

CSV 每列是一筆資料，包含 RAW、溫濕度、光線與溫度兩組狀態、確認及統計。DHT 失敗只暫停溫度計時，光線獨立運作。報告分列兩組警報，附 RAW、溫度及濕度圖；濕度沒有門檻線，不作健康判定。一次紀錄內不改門檻、不重啟，不補 0 或編造事件。

取消授權、檔案寫入失敗、裝置重啟或斷線不是成功保存；保留已寫入部分並說明限制。Q4 沒收到新的分析結果就顯示等待或逾時，不用舊結果冒充目前結果。選擇資料夾的功能需要桌面支援瀏覽器；不支援時不能以手動下載取代 Q4 的驗證。

編譯、模擬與網頁測試不等於硬體實測。下載自己的紀錄後，關閉連線、拔全部電源，再拆線收好。
