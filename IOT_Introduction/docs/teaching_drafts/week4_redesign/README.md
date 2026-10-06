# Week4：環境顯示、提示與警報紀錄

現行 Main 是作品需求、預期行為、驗證與少量問答。維護來源為本目錄 `week4_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week4_answers`。

Q1 環境顯示器、Q2 超標提示器、Q3 環境警報紀錄器、Q4 電腦分析結果顯示。四件有 OLED／Serial 完整版本。Q3 只在裝置記憶體計次、計時及按鈕確認，開機直接開始，RST 歸零；Q4 才在授權資料夾建立 CSV、保存、分析、產生報告及回傳裝置。Q4 的 Serial 輸出在工具顯示，連線時不開 Monitor。不要求學生另學 Python。每週從空麵包板接線，下課斷電拆除。

現行程式維護來源為私有 `week4_answers/generate_three_projects.cjs`，Q3、Q4 使用同層 `alarm_recorder.cjs`。產生八支獨立程式，工具維護於 `week4_answers/tools/`，`programs.sources.json` 指定現行複本。舊 A/B 程式僅供歷史追查，不是本週開檔入口。

```powershell
node IOT_Introduction/docs/teaching_drafts/week4_answers/generate_three_projects.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 4
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs --answers
node IOT_Introduction/scripts/package_answer_programs.cjs 4
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 本週允許發布 Main、Ans PDF 和 Main 必要的維護來源；答案維護來源及 Week4 程式仍只留本機與教師雲端。教師已授權本輪 commit、push 與雲端更新。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
目前 Main 5 頁、Ans 11 頁。Q3 現行檢查在私有 `week4_answers/checks/device_recorder_20261006`；較早 `checks/alarm_20261006` 的 Q3 CSV 測試只描述舊版，不適用於本輪。[本輪修訂與發布紀錄](../../lab_notes/2026-10-06-week4-csv-q4.md)列出檢查與限制。Q4 程式及工具與前版逐位元組相同，本輪重新通過 `checks/analysis_20261006` 的 24 項網頁模擬測試；未做實機操作。
