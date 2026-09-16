# Week 3–5 舊零件整合活動與檢查

2026-09-16 教師決定：每週可以加入前一週或更早教過的零件，做更多變化。本次只修改 Week 3–5 重設稿與新增範例，不改正式 notebook、正式 PDF、QA 或實機紀錄，不操作硬體。

## 作品與教學範圍

| 週次 | 新增範例 | 舊能力／新用途 | 練習與解答 |
|---|---|---|---|
| 3 | `button_light_capture` | Week 2 按鈕觸發 KY 取樣；batch、index、raw、時間 | 一筆改三筆；忙碌時不另排隊 |
| 4 | `button_environment_log` | 同一按鈕加入 DHT 最近結果與時間；光線仍當下讀 | 無效 DHT 不收錄但保留 skipped |
| 5 | `button_oled_timer` | Week 2 兩鍵直接控制 OLED 倒數；保留 log | 10–60 秒改為 5–30 秒、每格 5 秒 |

三週 p32–35 為作品目標、接線、操作與原理，p36 動手改造、p37 下一頁解答。完整 `.ino` 都放在各週同名資料夾並原文嵌入 PDF。答案是對完整程式的設定變更，不是孤立兩行程式；主機測試會實際套用那些設定執行。

原先 p30／31 觀念題與解答不刪，Week 4 p16／17 資料判讀題也保留。新增活動約需 20–30 分鐘，是備課估時而非已量到的時間；可取代重複演示或作延伸，不追加評量權重，不聲稱原兩小時安排能全部加做。

## 安全與不同程式的界線

- GPIO5 在 Week 3 前段曾是輸出，新增例改回 INPUT_PULLUP。先拆全部外線、上傳新程式、斷電，再接按鈕；不可把按鈕接在舊輸出上。
- GPIO4 在 Week 3／4 是 KY ADC，Week 5 額外例改為按鈕。Week 5 額外例要求移除 KY、DHT、RGB，不能照上一套整合接線原封不動使用。
- 按鈕 A／B 是斷電驗證過的兩組端子，不臆測四腳方向。模組供電、GPIO 與訊號電位仍依本組實物確認；預設 −1／false 不會開始操作。
- DHT 範例的 valid 只查有限數值及課堂接受範圍（溫度 0–50°C、濕度 0–100%），不是精度保證或完整品質分類。新範例以 dht_age_ms 命名合併紀錄的時間欄，前段原程式仍是 age_ms；不得混稱原程式已改。
- Week 5 額外例沒有 s/x/f/c 指令；按鈕決定動作，ACK 失敗停止且需排查後重啟。ACK 不證明像素正確。沒有帶電拔訊號線的測試。
- Serial 輸出不等於已存成檔案或資料庫；Reset 會清除 RAM 中計數。後續連網課程才處理遠端控制與儲存。

## 重現主機測試

在 IoT repo 根目錄執行：

```powershell
python IOT_Introduction/docs/teaching_drafts/integration_checks/run.py
```

Windows 使用既有 `host_compiler.py` 找 MSVC；其他平台用 g++／clang++。`fakes` 替代 GPIO、時間、DHT、Wire、OLED。未連接 USB，不掃描或開啟序列埠。

runner 從三支真正 `.ino` 建立暫存測試版本：只替換已列出的腳位／確認值，以及題目答案設定；不重寫核心邏輯。輸出在忽略追蹤的 `tmp/`，逐案 compile.txt 及 results.json 可重建。

本輪 10 組、159 個 CHECK 通過：

| 週次 | 未確認設定 | 範例 | 題目答案 | SSD1315 配置 |
|---|---:|---:|---:|---:|
| 3 | 6 | 10 | 16 | 不適用 |
| 4 | 6 | 17 | 17 | 不適用 |
| 5 | 6 | 27 | 27 | 27 |

測試含開機按住、放開後接受、長按一次、短暫彈跳、取樣間隔、忙碌時忽略、ADC 端點、DHT 首次等待、25 ms 模擬讀取延遲、無效值不冒充舊值、兩鍵同按、倒數長度上限回繞、中止／重啟、到期一次、millis 回繞、顯示失敗與禁止自動恢復。不是按鈕彈跳、匯流排錯誤或真實時間的完整模型。

## 文件及編譯證據

三週 `build.cjs` 重新產生 PDF、頁碼及雜湊清單；`verify.py` 核對新增與既有程式附錄逐字一致，並驗證 p36／37 題解相鄰。頁面規格為 A4；逐頁渲染後目視新增頁、資訊流、接線表、解答與程式附錄，詳細數值由各週 tmp/verification.json 取得。

此次 Git 提示 Windows 可能轉換換行，因此文字來源雜湊統一為 LF 後計算，manifest 明記 `textHashLineEndings=LF`；照片與 PDF 仍核對原始 bytes。這避免另一台電腦只因 CRLF／LF 差異誤報來源變動，不忽略任何實際文字差異。

Arduino 目標編譯使用 `esp32:esp32:esp32s3:CDCOnBoot=default`、Arduino-ESP32 3.3.11。三支原始範例均編譯成功：

| 範例 | 程式空間 bytes | 全域 RAM bytes |
|---|---:|---:|
| Week 3 | 286265 | 22264 |
| Week 4 | 313134 | 22488 |
| Week 5（預設 1306） | 332878 | 24848 |

這三次編譯保留原檔未確認設定，並未上傳。已啟用設定及答案版本的動作由前述主機測試驗證，不冒充目標上的執行。Week 4 使用 DHT sensor library 1.4.7／Adafruit Unified Sensor 1.1.15；Week 5 依既有 `_outputs/profile_compile/arduino_user/libraries` 路徑使用 U8g2 2.36.15。其他電腦需安裝真實 U8g2，不可把 fakes 加入 Arduino 程式庫。

原理核對來源：[Espressif GPIO](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html)、[ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)、[Adafruit DHT 原始碼](https://github.com/adafruit/DHT-sensor-library/blob/master/DHT.cpp)、[U8g2 API](https://github.com/olikraus/u8g2/wiki/u8g2reference)。本次未宣稱新的硬體規格。

## 優先下一步與發布

優先仍是核對實際板型、模組腳序、3.3 V 訊號與供電，再依新增頁實測長按、時間欄及倒數動作。完成條件是接線照片、程式設定、實際 Serial 紀錄及目視結果；不能用主機測試或編譯代替。

教師後續已授權將本輪新增 commit 並 push；提交前重新核對三份 PDF／來源與題解頁序，發布版本見 Git 歷史。沒有 Drive 上傳。根目錄未追蹤的 `examples/` 資料庫未碰；各週原 review 的頁數及發布描述是前一版沿革，本檔與各週 README 記錄本輪新增。
