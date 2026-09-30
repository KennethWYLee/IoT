# IoT Introduction：18 週課程教材

每週三 13:30–16:15，2026-09-09 至 2027-01-06。

**Week1 先設定電腦，Week2 才開始實物操作。**之後每週保留已成功的接線，集中完成一個新部分。Week3 起用 OLED 看裝置結果，電腦 Serial 主要作排錯。

## 18 週導覽

| 週次 | 日期 | 內容 | 現行 Main |
|---:|---|---|---|
| 1 | 09-09 | 採購、Arduino／ESP32 設定、儲存修改與編譯 | [PDF](Week_01_Course_Orientation/week1_main.pdf)／[網頁文字](Week_01_Course_Orientation/week1_main.md) |
| 2 | 09-16 | 第一次上傳、一顆按鈕與一次按壓計數 | [PDF](Week_02_ESP32_Hardware_Basics/week2_main.pdf) |
| 3 | 09-23 | OLED、光線與按鈕快照 | [Main](Week_03_Electrical_Measurement_and_ADC/week3_main.pdf)／[Ans](Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)／[程式](../program/week3/README.md) |
| 4 | 09-30 | 加 DHT，環境顯示與保存 | [PDF](docs/teaching_drafts/week4_redesign/week4_main.pdf) |
| 5 | 10-07 | 加 RGB，以燈色表示光線狀態 | [PDF](docs/teaching_drafts/week5_redesign/week5_main.pdf) |
| 6 | 10-14 | 加舵機紙指針、外接電源與停止 | [PDF](docs/teaching_drafts/week6_redesign/week6_main.pdf) |
| 7 | 10-21 | 整合已學材料、修正接線與展示 | [PDF](docs/teaching_drafts/week7_redesign/week7_main.pdf) |
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
- Ans：先安全接線與程式開檔，確認成功畫面；再看短篇原理、反例及同題號答案。
- Program：完整 `.ino` 在同名資料夾。下載後依 Ans 核對設定，不把網頁另存成程式。

Week1 的安裝教學直接在 Main，沒有另設答案卷。GitHub 只公開 Week3 Ans 與 Week3 program；其他週由教師雲端提供。

Week4～7 請使用上表入口，原週目錄的舊 Notebook／PDF 是歷史版本，不代表目前必做進度。

## 本次驗證範圍

本輪重建 Week1～7，並同步 Week8／9／10／16 通知；Week11 之後的網路教材未重新設計。PDF、程式編譯和桌面測試不能代替實物確認，DHT 腳序、RGB 電流、舵機帶載電源與安全行程仍須依每組實物核對。

實作考的正式配分、時間、個人或分組、可用資料與 AI 規則尚待教師確認；不把課堂可查資料的安排自動套到考試。

## 教師與維護資料

[課程計畫](docs/course/18_week_plan.md) · [教材修訂準則](docs/teaching_drafts/week2_redesign/revision_guidelines.md) · [維護來源](docs/teaching_drafts/README.md) · [本次修訂與發布紀錄](docs/lab_notes/2026-09-30-cumulative-rebuild.md) · [硬體狀態](docs/hardware/hardware_state.md)
