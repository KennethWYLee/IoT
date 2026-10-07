# Week4 Q1、Q2 程式

[Main](../../IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4Ans.pdf)

目前只公開 Q1、Q2。Q3、Q4 程式與電腦工具由教師另行提供，不在這個公開資料夾。

| 題目 | OLED 版 | Serial Monitor 版 | 成功結果 |
|---|---|---|---|
| Q1 桌上環境顯示器 | [environment_display_oled.ino](environment_display_oled/environment_display_oled.ino) | [environment_display_serial.ino](environment_display_serial/environment_display_serial.ino) | 顯示光線 RAW、溫度 T、相對濕度 RH |
| Q2 環境超標提示器 | [environment_alert_oled.ino](environment_alert_oled/environment_alert_oled.ino) | [environment_alert_serial.ino](environment_alert_serial/environment_alert_serial.ino) | 分別判斷溫度、濕度，顯示 HIGH／NORMAL 與總狀態 |

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

Q2 預設門檻為 `TEMP_LIMIT_C = 28.0`、`RH_LIMIT_PERCENT = 65.0`。大於才 HIGH，等於未超標；任一項 HIGH 就 ALERT。這些是練習門檻，不是健康或設備安全標準。

Q1 不接按鈕，Q2 不新增按鈕。若 OLED 黑畫面，先核對四條線、控制器設定與實際上傳的檔案；DHT 無有效值先斷電核對 DATA 的 GPIO、供電及接地。

程式公開版使用講義預設設定，不採教師 GPIO1 的個人工作檔。公開複本只統一換行並移除行尾空白，不更動程式邏輯。目標編譯與桌面測試不能替代本組實物核對。下課保存自己的程式，斷電後拆線收納。
