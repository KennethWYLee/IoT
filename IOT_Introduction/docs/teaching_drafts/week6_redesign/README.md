# Week6：三種舵機紙指針

現行 Main 有 Q1 按鈕七格紙指針、Q2 光線狀態紙指針、Q3 溫度狀態紙指針，以及 Q4 訊號／供電／共地觀念題。預覽與停止是三件作品的共同安全要求，不各算一題。每週從零接線，OLED 為主要畫面，本週不用 RGB。維護來源為本目錄 `week6_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week6_answers`。本次改寫尚未發布，舊發布紀錄不代表現稿已同步。

```powershell
node IOT_Introduction/docs/teaching_drafts/week6_answers/generate_artifacts.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 6
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs --answers
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 6 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

GitHub 本週只發布 Main 和必要的維護來源，Ans 與新程式只由教師雲端提供。舊 review 記錄及程式只供歷史追查，不代表目前共同必做內容。
本輪內容、接線銜接與發布範圍見[重建紀錄](../../lab_notes/2026-09-30-cumulative-rebuild.md)。
