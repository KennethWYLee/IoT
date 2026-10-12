# Week5：RGB 提示與環境巡檢

[Q1～Q4 動畫](../../../Week_05_RGB_OLED_Countdown/animations/README.md)供對照操作與預期結果；Main 各題與 PDF 都有對應 GitHub 連結。新版左邊固定顯示完整示範步驟與預期結果，標記目前步驟；右邊顯示當下狀況。動畫是教學示意，非實物錄影；Q3 是自動小夜燈，Q4 是環境提示與保存資料。repository 已於 2026-10-12 改為 public；本次替換動畫不釋出 Q3／Q4 程式，也不再變更存取權限。

2026-10-11 教師指定獨立改版，不使用 Claude：Q1 單按鈕變色燈、Q2 OLED 倒數提醒燈、Q3 可選色的自動小夜燈、Q4 環境巡檢與比較。前兩題只用按鈕、OLED、RGB；Q3 加光敏，Q4 再加 DHT。每個元件先交代用途，接線、程式與結果在 Ans 前段，短原理在後。四題是本週指定範圍，不推定其他週須增題。

Q1 短按放開才開啟／換色，長按達 1 秒關閉並記住顏色；Q3 在明暗設定後沿用手勢，短按啟用／換色、長按停用，但實際亮燈還需判為暗。Q2 是開始／取消計時，Q4 是設定後保存新資料，兩題不套用長按關燈。

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
本輪舊檔保存在本機 archives/week5_before_20261011/current；檢查在私有 week5_answers/checks/20261011。後續教師已授權 commit、push 及雲端更新，範圍不擴張到 GitHub 的 Q3／Q4 程式。[修訂紀錄](../../lab_notes/2026-10-11-week5-single-button.md)另列軟體、PDF 與實機檢查範圍；[發布紀錄](../../lab_notes/2026-10-11-week5-publication.md)記錄同步核對。沒有操作硬體。
