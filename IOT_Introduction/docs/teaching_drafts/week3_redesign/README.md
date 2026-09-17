# Week 3 主教材重設稿

依 2026-09-16 教師要求，沿用 Week 2 重設稿的教學方式：全班同步操作，先看到結果，再解釋原理。這是完整重設稿，不是只改前幾頁的版面樣本。

- 維護來源：`week3_main.md`、`build.cjs`；引用既有三份 `.ino`，另有本目錄新增的 `button_light_capture/button_light_capture.ino`。附錄直接嵌入來源，不另維護複本。
- 閱讀成品：本目錄 `week3_main.pdf`，54 頁。觀念題／解答在 p32／33；p34–39 為按鈕＋光敏紀錄器，其中 p38 動手改三筆取樣、p39 解答。新增程式取得及 Serial 保存步驟。
- 原 `Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb` 與 PDF 保留，尚未切換為本稿。Week 2 與 QA 不修改。
- 教師檢查、內容對照、建置及驗證限制見 `review.md`。
- 本稿不是新的實機通過紀錄。GPIO4 ADC 仍沒有全班已核准紀錄；教師必須在課前完成板型與適用腳位確認。課堂不安排逐組等待教師核准。

## 重建

在已安裝 Node、Playwright 及 Edge 的 Windows 執行：

```powershell
$env:NODE_PATH='C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node IOT_Introduction/docs/teaching_drafts/week3_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week3_redesign/verify.py
```

輸出包含 PDF、忽略追蹤的 HTML、`tmp/layout_check.json` 及逐頁檢查圖。編譯、文件檢查與實機測試分開記錄；建置不會連接或寫入開發板。
