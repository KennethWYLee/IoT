# IoT 課程與無人機專題

## 課程入口

- [IoT：18 週教材](IOT_Introduction/README.md)
- [Week1：採購與 Arduino／ESP32 電腦設定](IOT_Introduction/Week_01_Course_Orientation/week1_main.pdf)
- [Week3 公開程式](program/week3/README.md)
- [Drone：無人機專題](Drone/README.md)

2026-09-30 重建：Week1 尚無元件，先完成採購與電腦設定；Week2 按鈕，Week3 加光敏與 OLED，Week4 加 DHT，Week5 加 RGB，Week6 加舵機，Week7 整合已學內容。OLED 自 Week3 起作主要畫面，Serial 留作排錯。

Main 提供作品、預期結果、驗證及少量問答。Ans 先接線、開程式、看結果，再解釋原理與答案；完整程式另放同名 Arduino 資料夾，不塞進 PDF。

## 發布範圍

GitHub 提供所有現行 Main；Ans PDF 和 `program` **僅公開 Week3**。其他週 Ans 與程式由教師雲端提供，不因這次重建而公開。

雲端程式位置：`codex / 課堂教材 / IoT / IOT_Introduction / program`，依週次分類。教材與程式的核對、發布及未實測項目見[本次紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-cumulative-rebuild.md)。

Week8 改一次實作考、Week9 教師出國、Week10 第一次報告、Week16 一般實作課。正式實作考的配分及規則待教師確認，三次報告內容不因此加量。

## 維護與同步

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
```

既有工作目錄先檢查 `git status`，保存自己的修改後再 `git pull --ff-only`。Git 不會同步未提交的本機檔案，也不代表硬體接線狀態已同步。

[正式課程計畫](IOT_Introduction/docs/course/18_week_plan.md) · [維護來源](IOT_Introduction/docs/teaching_drafts/README.md) · [工具說明](IOT_Introduction/scripts/README.md) · [實物確認紀錄](IOT_Introduction/docs/hardware/hardware_state.md)

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`、其他週答案、憑證、學生個資與執行資料不公開。舊版修改與發布紀錄保留在 `IOT_Introduction/docs/lab_notes/`，不覆蓋本頁現行安排。
