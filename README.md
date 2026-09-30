# IoT 課程與無人機專題

## 課程入口

- [IoT：18 週教材](IOT_Introduction/README.md)
- [Week1：採購與 Arduino／ESP32 電腦設定](IOT_Introduction/Week_01_Course_Orientation/week1_main.pdf)
- [Week3 公開程式](program/week3/README.md)
- [Drone：無人機專題](Drone/README.md)

2026-09-30 重建：Week1 尚無元件，先完成採購與電腦設定；Week2 按鈕，Week3 加光敏與 OLED，Week4 加 DHT，Week5 加 RGB，Week6 加舵機，Week7 整合已學內容。OLED 自 Week3 起作主要畫面，Serial 留作排錯；僅 Week4 可等效選用 OLED 或 Serial Monitor。

Week4 的三件作品是環境顯示器、環境超標提示器、兩個位置的環境比較器；每件均提供 OLED／Serial Monitor 兩版，學生擇一，功能要求相同。Q1 用光敏與 DHT，Q2 只用 DHT，Q3 用 DHT 與按鈕；無效溫濕度顯示 `--`，不冒充正常值。其他週顯示安排、採購與配分不變。

Week2～7 每週三件不同用途的作品（Q1～Q3）加一題觀念（Q4），由簡到深；不把同一作品的操作步驟拆成三題。每件只使用需要的元件，同堂可沿用已確認接線。Main 先說作品、預期結果和驗證，再留必要作答；Ans 先接線、程式、結果與排錯，最後補短原理。Week1、考試及報告週不套用此題數，不另加配分或課後繳交。

**每週硬體實作都從空麵包板重新搭建。**沿用的是已學知識與同一批零件，不保留上週實體電路。各週操作講義須有當週完整接線圖、表與步驟；同堂課的階段之間可保留已確認接線，改線前仍須斷電。下課先停止操作，關閉並斷開 USB、外接供電等所有電源，確認斷電後才拆下跳線與模組、收納零件。這項原則也適用 Week7 之後原有活動中的硬體操作，不增加活動或採購。

Main 提供作品、預期結果、驗證及少量問答。Ans 先接線、開程式、看結果，再解釋原理與答案；完整程式另放同名 Arduino 資料夾，不塞進 PDF。

## 發布範圍

使用一個公開 GitHub repository，以 `.gitignore` 控制尚未公布的答案與程式。所有現行 Main 開放；各週 Ans PDF 與對應 code 由教師在該堂課進行中開放。目前已開放 Week3，其餘週仍保留忽略規則；一般 commit、push 或更新教材不會自動開放其他週。

開放某週時，公布該週 Ans PDF 與 `program/weekN` 中同名資料夾的 `.ino`，核對兩者一致後一併提交與推送。答案維護來源、測試及教師紀錄仍留本機；新增週次不因已有檔案就公開。

雲端程式位置：`codex / 課堂教材 / IoT / IOT_Introduction / program`，依週次分類。教師雲端可保存完整 Main、Ans 與程式；提供學生的 Ans／code 同樣依課堂開放時點，不因上傳就變更分享權限。教材與程式的核對、發布及未實測項目見[本次紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-three-practical-publication.md)。

Week8 改一次實作考、Week9 教師出國、Week10 第一次報告、Week16 一般實作課。正式實作考的配分及規則待教師確認，三次報告內容不因此加量。

## 維護與同步

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
```

既有工作目錄先檢查 `git status`，保存自己的修改後再 `git pull --ff-only`。Git 不會同步未提交的本機檔案，也不代表硬體接線狀態已同步。

[正式課程計畫](IOT_Introduction/docs/course/18_week_plan.md) · [維護來源](IOT_Introduction/docs/teaching_drafts/README.md) · [工具說明](IOT_Introduction/scripts/README.md) · [實物確認紀錄](IOT_Introduction/docs/hardware/hardware_state.md)

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`、其他週答案、憑證、學生個資與執行資料不公開。舊版修改與發布紀錄保留在 `IOT_Introduction/docs/lab_notes/`，不覆蓋本頁現行安排。
