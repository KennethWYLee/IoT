# Week5：RGB 提示與環境巡檢

2026-10-07 教師批准四件作品：Q1 桌上狀態燈、Q2 倒數提醒燈、Q3 自動小夜燈、Q4 環境巡檢與比較。前兩題只用按鈕、OLED、RGB；Q3 加光敏，Q4 再加 DHT。每個元件先交代用途，接線、程式與結果在 Ans 前段，短原理在後。四題是本週指定範圍，不推定其他週須增題。

維護來源為本目錄 `week5_main.md`；完整接線、程式設定、短原理及答案在教師私有 `week5_answers/week5Ans.md`。Ans 使用自己的完整接線內容，不展開跨週的 weekly_setup。程式由本週 `generate_week5.cjs` 維護；舊跨週 generator／environment_rgb 不再是 Week5 現行維護來源，勿用它覆蓋本週設定。私人舊版檔案保留供追查，不列入 programs.sources.json 現行清單。

```powershell
node IOT_Introduction/docs/teaching_drafts/week5_answers/generate_week5.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 5
node IOT_Introduction/docs/teaching_drafts/week5_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week5_redesign/build.cjs --answers
python IOT_Introduction/scripts/verify_cumulative_lesson.py 5 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 5 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 批准 Main、Ans PDF 與 Q1／Q2 程式；Q3／Q4 程式及答案維護來源仍忽略。教師雲端提供四題全部程式；上傳不改分享權限。舊版保存在本機 archives/week5_before_20261007，不是現行入口。
本輪檢查在私有 week5_answers/checks/20261007，正式發布狀態以 Git 和本輪記錄為準。[先前實作優先紀錄](../../lab_notes/2026-10-06-practical-first-weeks.md)保留歷史結果，不能取代本版測試。沒有操作硬體。
