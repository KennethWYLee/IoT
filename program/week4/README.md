# Week4 Q1～Q4 程式

[Main](../../IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4Ans.pdf)

[修訂版 Main／Ans](../../IOT_Introduction/Week_04_Sensors_and_Data_Quality/README_withClaude.md) 補上實物腳位、完整接線圖及逐步排錯；舊版保留。

Q1～Q4 各提供 OLED／Serial Monitor 版。完整操作見修訂版 Ans；下載後保留每支程式的同名資料夾。

| 題目 | OLED 版 | Serial Monitor 版 | 成功結果 |
|---|---|---|---|
| Q1 桌上環境顯示器 | [environment_display_oled.ino](environment_display_oled/environment_display_oled.ino) | [environment_display_serial.ino](environment_display_serial/environment_display_serial.ino) | 顯示光線 RAW、溫度 T、相對濕度 RH |
| Q2 環境超標提示器 | [environment_alert_oled.ino](environment_alert_oled/environment_alert_oled.ino) | [environment_alert_serial.ino](environment_alert_serial/environment_alert_serial.ino) | 分別判斷溫度、濕度，顯示 HIGH／NORMAL 與總狀態 |
| Q3 環境警報紀錄器 | [environment_recorder_oled.ino](environment_recorder_oled/environment_recorder_oled.ino) | [environment_recorder_serial.ino](environment_recorder_serial/environment_recorder_serial.ino) | 顯示警報次數、累計時間及按鈕確認 |
| Q4 電腦分析結果顯示 | [environment_analysis_oled.ino](environment_analysis_oled/environment_analysis_oled.ino) | [environment_analysis_serial.ino](environment_analysis_serial/environment_analysis_serial.ino) | 保存 CSV，分析光線／溫度並回傳裝置 |

## Q4 電腦工具

下載 [dual_alarm_analysis.html](dual_alarm_analysis.html) 及 [alarm_report.js](alarm_report.js)、[dual_alarm_report.js](dual_alarm_report.js)、[analysis_client.js](analysis_client.js)、[dual_analysis_ui.js](dual_analysis_ui.js)，五個檔案放在同一資料夾。用桌面 Chrome／Edge 開本機 HTML，不是 GitHub 的文字預覽。

上傳 Q4 後關閉 Serial Monitor／Plotter。依序連接裝置、等待「Q4 裝置已就緒」、選擇可寫入資料夾、開始新紀錄。OLED 看兩組統計；Serial 版看工具的「裝置回傳」。實體按鈕只表示已看到當次警報，不清零、不停止計時，也不建立 CSV。[完整開檔說明](START_HERE.md)。

## 開檔與設定

每支 `.ino` 保留同名資料夾。GitHub 開啟檔案後選 **Download raw file**，不要另存整個網頁；Arduino IDE 用 File → Open 開啟。

每週從空麵包板接線，依 Ans 核對實物。改線前拔除 USB 與全部電源。

- 課堂參考板：YD-ESP32-S3 Type-A V1.5、N16R8；USB 使用板背標示 COM 的接頭。
- DHT11 模組 VCC／GND／DATA 依實物標字，供電及訊號須相容 3.3 V。DATA 預設 GPIO10；若實際接 GPIO1，將 `PIN_DHT` 改為 `1`，各題保持一致。
- 程式預設 `DHT_WIRING_CONFIRMED = false`。完成接線與供電核對後才改為 `true`，否則不啟動 DHT，會顯示 CHECK DHT WIRING。
- Q1 光敏訊號 S 接 GPIO4；供電腳與 GND 依實物核對。Q2 不使用光敏，不要求拆掉同堂已核對的光敏接線。
- OLED 版：VDD 接 3V3、GND 共地、SDA 接 GPIO8、這片模組標示 SCK 的時脈腳接 GPIO9。`OLED_CONTROLLER` 預設 1306，已確認採 1315 相容設定的模組改為 1315；I2C 位址不代表控制器型號。
- 安裝 Adafruit 的 **DHT sensor library**、**Adafruit Unified Sensor**；OLED 版另需 **U8g2**。Serial 版不需要 OLED，也不需要 U8g2。
- Serial Monitor 速度 **115200**。DHT 每 2.5 秒讀取一次；上傳後等待新讀值，`--` 不是 0。

每次開另一題都用 Ctrl+F 查 `PIN_DHT`、`DHT_WIRING_CONFIRMED`；OLED 版另查 `OLED_CONTROLLER`，不能以為上一個檔案的修改會自動套用。接線已核對後，上傳 Q1 初期的 WAIT DHT 是等待第一次讀取；約 5 秒後應有溫濕度數字，持續等待才按 Ans 排錯。

Q2 預設門檻為 `TEMP_LIMIT_C = 28.0`、`RH_LIMIT_PERCENT = 65.0`。大於才 HIGH，等於未超標；任一項 HIGH 就 ALERT。這些是練習門檻，不是健康或設備安全標準。

Q1 不接按鈕，Q2 不新增按鈕。若 OLED 黑畫面，先核對四條線、控制器設定與實際上傳的檔案；DHT 無有效值先斷電核對 DATA 的 GPIO、供電及接地。

OLED 版正常時 Serial Monitor 沒有讀值輸出；螢幕沒有回應時才印 OLED: check… 的提示。偶爾一次 WAIT DHT 可先等下一次讀取，持續沒有數字才按 Ans 排錯；不把失敗填成 0。

程式公開版使用講義預設設定，不採教師 GPIO1 的個人工作檔。公開複本只統一換行並移除行尾空白，不更動程式邏輯。目標編譯與桌面測試不能替代本組實物核對。下課保存自己的程式，斷電後拆線收納。
