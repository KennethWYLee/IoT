# Week5：三件 RGB 提示作品

現行 Main 為 Q1～Q3 三件作品，加 Q4 短實作驗證：Q1 桌上狀態燈、Q2 光線狀態燈、Q3 溫濕度提醒燈；Q4 沿用 Q2 比較 RGB 方向與隔板。固定外部照明、程式及分界，只改朝向／隔板；沒有明顯影響也成立。三色接線檢查不是作品題。

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

GitHub 本週只發布 Main 和必要的維護來源，Ans 與新程式只由教師雲端提供。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
本輪內容與驗證見[實作優先修訂紀錄](../../lab_notes/2026-10-06-practical-first-weeks.md)及[私有程式與版面檢查](../week5_answers/checks/practical_20261006/README.md)。[2026-09-30 重建紀錄](../../lab_notes/2026-09-30-cumulative-rebuild.md)保留為歷史參考。本次未發布，也未操作硬體。
