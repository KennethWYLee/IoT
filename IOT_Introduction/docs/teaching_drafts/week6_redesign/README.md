# Week6：三種舵機紙指針

現行 Main 有 Q1 按鈕七格紙指針、Q2 光線狀態紙指針、Q3 溫度狀態紙指針；Q4 沿用 Q1 短實作核對 REASON:STOP／REASON:TIMEOUT。只增停止原因顯示，保留停止鎖定、預覽、安全啟用與手動斷外接電源；不故意製造接線故障。每週從空麵包板開始，OLED 為主要畫面，本週不用 RGB。維護來源為本目錄 `week6_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week6_answers`。本次改寫尚未發布，舊發布紀錄不代表現稿已同步。

```powershell
node -e "require('./IOT_Introduction/docs/teaching_drafts/week6_answers/generate_artifacts.cjs').generate(6)"
node IOT_Introduction/scripts/package_answer_programs.cjs 6
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs --answers
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 本週只發布 Main 和必要的維護來源，Ans 與新程式只由教師雲端提供。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
本輪內容與驗證見[實作優先修訂紀錄](../../lab_notes/2026-10-06-practical-first-weeks.md)及[私有程式與版面檢查](../week5_answers/checks/practical_20261006/README.md)。[2026-09-30 重建紀錄](../../lab_notes/2026-09-30-cumulative-rebuild.md)保留為歷史參考。本次未發布，也未操作硬體。

2026-10-07 現稿見[逐週修訂紀錄](../../lab_notes/2026-10-07-sequential-week-revisions.md)；七組桌面測試 131 項檢查、六組板型編譯通過，尚無硬體實測。Ans 不再列印完整程式。
