# IoT Introduction：18 週課程教材

每週三 13:30–16:15，2026-09-09 至 2027-01-06。

**Week1 先設定電腦，Week2 才開始實物操作。**每週硬體實作從空麵包板重新搭建，沿用已學知識與同一批零件，不保留上週實體電路。Week3 起用 OLED 看裝置結果，電腦 Serial 主要作排錯；僅 Week4 可等效選用 OLED 或 Serial Monitor。

各週操作講義提供當週完整接線圖、表與步驟，不以「上週已接好」省略。同堂課的階段之間可保留已確認的接線，改線前先斷電。下課先停止操作、關閉並斷開 USB 與外接供電等所有電源，確認斷電後再拆跳線、模組並收納。Week7 之後的原有硬體活動也遵守此原則；不為報告、出國或空白週另加實作。

## 18 週導覽

| 週次 | 日期 | 內容 | 現行 Main |
|---:|---|---|---|
| 1 | 09-09 | 採購、Arduino／ESP32 設定、儲存修改與編譯 | [PDF](Week_01_Course_Orientation/week1_main.pdf)／[網頁文字](Week_01_Course_Orientation/week1_main.md) |
| 2 | 09-16 | 第一次上傳；按鈕計數、ON/OFF 切換、單鍵碼表 | [PDF](Week_02_ESP32_Hardware_Basics/week2_main.pdf) |
| 3 | 09-23 | OLED：光線觀測、快照、可暫停計數 | [Main](Week_03_Electrical_Measurement_and_ADC/week3_main.pdf)／[Ans](Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)／[程式](../program/week3/README.md) |
| 4 | 09-30 | DHT：環境顯示、超標提示、A/B 比較；OLED 或 Serial Monitor 擇一 | [PDF](docs/teaching_drafts/week4_redesign/week4_main.pdf) |
| 5 | 10-07 | RGB：桌面狀態、光線狀態、溫濕度提醒 | [PDF](docs/teaching_drafts/week5_redesign/week5_main.pdf) |
| 6 | 10-14 | 手動、光線、溫度紙指針；外接電源與停止 | [PDF](docs/teaching_drafts/week6_redesign/week6_main.pdf) |
| 7 | 10-21 | 環境比較、可暫停提醒、可切換感測方式的紙指針 | [PDF](docs/teaching_drafts/week7_redesign/week7_main.pdf) |
| 8 | 10-28 | 第一次實作考 | [通知 PDF](Week_08_Project_Report_1/week8_main.pdf) |
| 9 | 11-04 | 教師出國，不到校、不收新成果 | [PDF](Week_09_Self_Study/week9_main.pdf) |
| 10 | 11-11 | 第一次專題報告：題目與技術可行性 | [PDF](Week_10_Individual_Written_Exam/week10_main.pdf) |
| 11 | 11-18 | Wi-Fi、HTTP、JSON、WebSocket 與後端 | [PDF](Week_11_HTTP_WebSocket_Backend/week11_main.pdf) |
| 12 | 11-25 | MQTT、資料庫與紀錄 | [PDF](Week_12_MQTT_Database_and_Logs/week12_main.pdf) |
| 13 | 12-02 | 第二次專題報告 | [教材](Week_13_Project_Report_2/week13_main.md) |
| 14 | 12-09 | 手機前台、PWA 與權限 | [PDF](Week_14_Mobile_PWA/week14_main.pdf) |
| 15 | 12-16 | 自動反應、安全、復原與重建 | [PDF](Week_15_Automation_and_Safety/week15_main.pdf) |
| 16 | 12-23 | 一般實作課，修正期末作品 | [PDF](Week_16_Integrated_Framework_Exam/week16_main.pdf) |
| 17 | 12-30 | 期末展示與個人問答 | [教材](Week_17_Project_Report_3/week17_main.md) |
| 18 | 01-06 | 校定期末考週，保留空白 | [保留檔](Week_18_Reserved/week18_main.md) |

## Main、Ans、Program

- Main：作品用途、成品示意、預期行為、實際驗證與少量回答空間，不附逐步解法。
- Ans：從空麵包板開始，提供當週完整安全接線與程式開檔步驟，確認成功畫面；再看短篇原理、反例及同題號答案。
- Program：完整 `.ino` 在同名資料夾。下載後依 Ans 核對設定，不把網頁另存成程式。

Week4 的三件作品是環境顯示器、環境超標提示器、兩個位置的環境比較器；每件均提供 OLED／Serial Monitor 兩版，學生擇一，功能要求相同。Q1 用光敏與 DHT，Q2 只用 DHT，Q3 用 DHT 與按鈕；無效溫濕度顯示 `--`，不冒充正常值。其他週顯示安排、採購與配分不變。

Week2～7 每週三件不同用途的作品（Q1～Q3）加一題觀念（Q4），由簡到深；不把同一作品的操作步驟拆成三題。每件只使用需要的元件，同堂可沿用已確認接線。Main 先說作品、預期結果和驗證，再留必要作答；Ans 先接線、程式、結果與排錯，最後補短原理。Week1、考試及報告週不套用此題數，不另加配分或課後繳交。

Week1 的安裝教學直接在 Main，沒有另設答案卷。GitHub 所有 Main 開放；各週 Ans 與對應 program 由教師在課堂進行中開放。目前已開放 Week3，其他週維持 `.gitignore`，不依日期或一般更新指令自動公開。教師雲端可保存全套檔案，學生的答案／程式入口依相同時點提供。

Week4～7 請使用上表入口，原週目錄的舊 Notebook／PDF 是歷史版本，不代表目前必做進度。

## 本次驗證範圍

本輪重建 Week1～7，並同步 Week8／9／10／16 通知；Week11 之後的網路教材未重新設計。PDF、程式編譯和桌面測試不能代替實物確認，DHT 腳序、RGB 電流、舵機帶載電源與安全行程仍須依每組實物核對。

實作考的正式配分、時間、個人或分組、可用資料與 AI 規則尚待教師確認；不把課堂可查資料的安排自動套到考試。

## 教師與維護資料

[課程計畫](docs/course/18_week_plan.md) · [教材修訂準則](docs/teaching_drafts/week2_redesign/revision_guidelines.md) · [維護來源](docs/teaching_drafts/README.md) · [本次修訂與發布紀錄](docs/lab_notes/2026-09-30-cumulative-rebuild.md) · [硬體狀態](docs/hardware/hardware_state.md)
