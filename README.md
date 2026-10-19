# IoT 課程與無人機專題

## 課程入口

- [IoT：18 週教材](IOT_Introduction/README.md)
- [Week1：採購與 Arduino／ESP32 電腦設定](IOT_Introduction/Week_01_Course_Orientation/week1_main.pdf)
- [Week2 Ans](IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2Ans.pdf) · [Week3 Ans](IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf) · [Week4 Ans](IOT_Introduction/Week_04_Sensors_and_Data_Quality/week4Ans.pdf)
- [Week4 修訂版 Main／Ans](IOT_Introduction/Week_04_Sensors_and_Data_Quality/README_withClaude.md)（`_withClaude`；舊版保留）
- [Week5 Main](IOT_Introduction/Week_05_RGB_OLED_Countdown/week5_main.pdf) · [Week5 Ans](IOT_Introduction/Week_05_RGB_OLED_Countdown/week5Ans.pdf) · [Week5 Q1、Q2 程式](program/week5/README.md) · [Week5 Q1～Q4 動畫總覽：同頁播放](IOT_Introduction/Week_05_RGB_OLED_Countdown/animations/README.md)
- [Week6 Main](IOT_Introduction/Week_06_Servo_Pointer/week6_main.pdf) · [Week6 Ans](IOT_Introduction/Week_06_Servo_Pointer/week6Ans.pdf) · [Week6 兩件作品線上動畫與 Ans](https://iot-week6-two-works.wy-lee9591.chatgpt.site/)
- [Week7 Main](IOT_Introduction/Week_07_Traffic_Light_Challenge/week7_main.pdf) · [Week7 Ans](IOT_Introduction/Week_07_Traffic_Light_Challenge/week7Ans.pdf) · [Week7 Q1～Q4 動畫](IOT_Introduction/Week_07_Traffic_Light_Challenge/animations/README.md)
- [Week2 程式](program/week2/README.md) · [Week3 程式](program/week3/README.md) · [Week4 Q1～Q4 程式](program/week4/README.md)
- [Drone：無人機專題](Drone/README.md)

2026-09-30 重建：Week1 尚無元件，先完成採購與電腦設定；Week2 按鈕，Week3 加光敏與 OLED，Week4 加 DHT，Week5 加 RGB，Week6 加舵機，Week7 整合已學內容。OLED 自 Week3 起作主要畫面，Serial 留作排錯；僅 Week4 可等效選用 OLED 或 Serial Monitor。

Week4 有四件實作：環境顯示器、超標提示器、警報紀錄器、電腦分析結果顯示；每件均提供 OLED／Serial 兩版。Q3 在裝置累計警報次數與時間；Q4 保留光敏、DHT、按鈕，保存 CSV、產生報告，將光線與溫度各自的次數、累計及最長時間回傳裝置，濕度只顯示。實體按鈕只確認警報；沒有新的電腦分析時顯示等待或逾時，不沿用舊結果。Q1 用光敏與 DHT，Q2 只用 DHT，Q3 用 DHT 與按鈕。

各實作週先說作品用途、預期結果與驗證，Ans 先接線、開程式、看結果及排錯，再解釋原理。Week2～7 的作品由簡到深；Week4 的 Q4 是完整電腦分析作品，2026-10-11 改版的 Week5 為單按鈕變色、OLED 倒數提醒、自動夜燈與環境巡檢。其他週不因此增加大作品。後段網路週在既有作品內採同一順序；Week1、考試、報告、出國及空白週不套固定題數，不另加配分或課後繳交。

**每週硬體實作都從空麵包板重新搭建。**沿用的是已學知識與同一批零件，不保留上週實體電路。各週操作講義須有當週完整接線圖、表與步驟；同堂課的階段之間可保留已確認接線，改線前仍須斷電。下課先停止操作，關閉並斷開 USB、外接供電等所有電源，確認斷電後才拆下跳線與模組、收納零件。這項原則也適用 Week7 之後原有活動中的硬體操作，不增加活動或採購。

Main 提供作品、預期結果、驗證及少量問答。Ans 先接線、開程式、看結果，再解釋原理與答案；完整程式另放同名 Arduino 資料夾，不塞進 PDF。

## 發布範圍

GitHub repository 已依教師於 2026-10-12 的指示改為 public，不用登入即可讀取已發布教材。以 `.gitignore` 排除尚未釋出的答案與程式；它不會隱藏已提交的 Git 歷史。所有現行 Main 已納入 Git；Week1 安裝教學直接在 Main，沒有獨立 Ans；目前另獲授權納入 Week2～7 Ans PDF，其他週答案仍忽略。

PDF 與程式分別由教師決定何時公開。教師於 2026-10-06 批准公開最新 Week2、Week3 程式；2026-10-07 另批准 Week4 Q1～Q4 的 OLED／Serial 八支程式及 Q4 電腦工具，放在 `program/week4`。Week5 公開 Main、Ans 與 Q1、Q2 程式；Q3、Q4 和其他週未授權程式仍留本機與教師雲端。每支 `.ino` 保留同名 Arduino 資料夾；不因一般 commit、push 或已有檔案就公開其他程式。

雲端程式位置：`codex / 課堂教材 / IoT / IOT_Introduction / program`，依週次分類。教師雲端保存完整 Main、Ans 與程式；提供學生的入口由教師決定，不因上傳就變更分享權限。[Week5 最新修訂](IOT_Introduction/docs/lab_notes/2026-10-11-week5-single-button.md)及[發布紀錄](IOT_Introduction/docs/lab_notes/2026-10-11-week5-publication.md)。歷史發布紀錄另保留，不代表現行釋出範圍。

Week8 改一次實作考、Week9 教師出國、Week10 第一次報告、Week16 一般實作課。正式實作考的配分及規則待教師確認，三次報告內容不因此加量。

## 維護與同步

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
```

既有工作目錄先檢查 `git status`，保存自己的修改後再 `git pull --ff-only`。Git 不會同步未提交的本機檔案，也不代表硬體接線狀態已同步。

[正式課程計畫](IOT_Introduction/docs/course/18_week_plan.md) · [維護來源](IOT_Introduction/docs/teaching_drafts/README.md) · [工具說明](IOT_Introduction/scripts/README.md) · [實物確認紀錄](IOT_Introduction/docs/hardware/hardware_state.md)

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`、其他週答案、憑證、學生個資與執行資料不公開。舊版修改與發布紀錄保留在 `IOT_Introduction/docs/lab_notes/`，不覆蓋本頁現行安排。
