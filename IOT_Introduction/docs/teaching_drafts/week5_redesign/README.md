# Week 5 主教材重設稿

依 2026-09-16 教師要求，沿用 Week 2 的同步帶做方式：先觀察結果，再解釋原理。完成一個可中止、可重新準備的 RGB／OLED 倒數器，不新增遮光計分、舵機、電池或雲端要求。

- 閱讀成品：[week5_main.pdf](week5_main.pdf)，55 頁。p32–37 新增雙按鈕 OLED 倒數器；p36 改五秒一格、p37 緊接解答。p42 起為完整程式。
- 維護來源：`week5_main.md`、`build.cjs`。兩支既有 `.ino` 加上本目錄 `button_oled_timer/button_oled_timer.ino`，附錄直接嵌入，不另維護副本。
- p30 是六題練習，p31 緊接完整解答；本稿含答案，不用作未公開考卷。
- 原正式 `Week_05_RGB_OLED_Countdown/week5_main.ipynb`／PDF、`docs/course_materials/week5_main.source.md` 及 canonical 程式未改動。尚未切換正式出口。
- 先前三週重設稿已隨 869418b 推送。本次新增舊零件整合活動也獲教師授權提交並推送；實際版本以 Git 歷史為準。入口在上層 README。
- 課前硬體待辦、120 分鐘安排、內容對照與檢查結果見 [review.md](review.md)。沒有新實機通過紀錄。

## 重建

從 IoT repository 根目錄執行。需有 Node、marked、Playwright、Edge、Python、PyMuPDF 與 Pillow。

```powershell
$env:NODE_PATH='C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node IOT_Introduction/docs/teaching_drafts/week5_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week5_redesign/verify.py
```

`build_manifest.json` 保存來源、程式、照片與 PDF 雜湊。HTML、逐頁圖、版面檢查放在忽略追蹤的暫存區；不必在另一台電腦重新建置才能閱讀 PDF。

## 優先下一步

核對同批 RGB 的限流及各色電流、OLED 的供電與 SDA／SCL 電位，再完成一輪正式倒數器的實機開始／中止／故障恢復。T01 曾有三色和顯示回報，不足以把這次整合標成硬體通過。
