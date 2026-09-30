# Week7：環境作品整合

現行 Main 是作品需求、預期行為、驗證與少量問答。維護來源為本目錄 `week7_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week7_answers`。

```powershell
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs --answers
node IOT_Introduction/scripts/package_answer_programs.cjs 7
python IOT_Introduction/scripts/verify_cumulative_lesson.py 7 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 7 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 本週只發布 Main 和必要的維護來源，Ans 與新程式只由教師雲端提供。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
本輪內容、接線銜接與發布範圍見[重建紀錄](../../lab_notes/2026-09-30-cumulative-rebuild.md)。
