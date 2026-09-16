# Week 4 主教材重設稿

依 2026-09-16 教師要求，沿用 Week 2「一起操作、看到結果、再講原理」的教學方式，並承接新版 Week 3。本稿是完整課堂閱讀稿，不是前幾頁的樣式試排。

- 維護來源：`week4_main.md`、`build.cjs`。完整程式由既有兩支 `.ino` 自動嵌入，不另維護複本。
- 閱讀成品：本目錄 `week4_main.pdf`，47 頁。其中第 1–33 頁是課堂內容與排錯，第 34–35 頁補充與來源，第 36–47 頁完整程式。
- 練習與解答：第 16／17 頁、第 30／31 頁，均為題目後緊接解答。這是教師與學生共讀的形成性練習，不是未公開的考卷。
- 正式 `Week_04_Sensors_and_Data_Quality/week4_main.ipynb`、PDF、原 Markdown 來源與程式均未改動。尚未切換正式出版來源。
- Week 2、Week 3、QA、硬體實測紀錄及採購數量未更動。沒有 commit、push 或雲端上傳。
- 課前仍需確認 DHT11 的實際三針腳序、3.3 V 供電及 DATA 電位；蜂鳴器僅有局部測試，不能當成全班已可照接。本稿沒有虛構這些確認結果。

## 重建

從 IoT repository 根目錄執行，環境需有 Node、marked、Playwright、Edge、Python、PyMuPDF、Pillow：

```powershell
$env:NODE_PATH='C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py
```

建置產生 PDF 與來源雜湊清單。HTML、版面檢查、每頁 PNG 和縮圖放在忽略追蹤的暫存區。這些命令不使用 USB、不上傳韌體。

## 教師備課

詳見 `review.md`。優先完成 DHT11 的課前核對與一輪實際取樣，因為它是新增的共同核心硬體。蜂鳴器尚未確認時可完成無聲整合作品；DHT 尚未確認時，不能宣稱已完成雙感測器實作。
