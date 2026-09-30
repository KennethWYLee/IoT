# Week4：環境顯示、提示與比較

現行 Main 是作品需求、預期行為、驗證與少量問答。維護來源為本目錄 `week4_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week4_answers`。

Q1 環境顯示器、Q2 環境超標提示器、Q3 兩個位置的環境比較器，Q4 討論舊值與讀取失敗。三件分別有 OLED／Serial Monitor 完整版本，擇一即可。每週從空麵包板接線，下課斷電拆除；Ans 提供當週完整接法，不要求保留上週電路。最新本機修訂與驗證見[三作品紀錄](../../lab_notes/2026-09-30-three-practical-works.md)。

現行程式維護來源為私有 `week4_answers/generate_three_projects.cjs`，產生六支獨立程式及 `programs.sources.json`。舊 `generate_programs.cjs` 不可再作本週重建入口。

```powershell
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs --answers
node IOT_Introduction/scripts/package_answer_programs.cjs 4
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 本週只允許發布 Main 和必要的維護來源，Ans 與新程式只由教師雲端提供。本輪沒有 commit、push 或上傳。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
本輪內容、接線銜接與發布範圍見[重建紀錄](../../lab_notes/2026-09-30-cumulative-rebuild.md)。
