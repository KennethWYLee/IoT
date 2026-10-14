# Week7：紙箱包裹監測

2026-10-12教師批准四題：Q1包裹環境看板、Q2包裹開啟紀錄器、Q3開箱提示旗、Q4異常保留與人工確認。每組用可開合小紙箱；箱蓋手動，舵機只帶輕紙旗。每週從空麵包板開始，按用途使用已學元件，不強求溫濕度變化，不新增電子零件、網路或評分。

Main維護來源為本目錄`week7_main.md`；Ans、獨立程式與產生器在私有`week7_answers`。舊版已保留於`archives/week7_before_20261012`。2026-10-14 教師授權提前更新 Week6、7：GitHub 發布 Main 與四題動畫，教師雲端更新完整教材、程式與動畫；Week7 Ans/code 仍由教師在課堂提供。

```powershell
node IOT_Introduction/docs/teaching_drafts/week7_answers/generate_week7.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 7
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs --answers
node IOT_Introduction/docs/teaching_drafts/week7_answers/checks/20261012/run.cjs --target
node IOT_Introduction/docs/teaching_drafts/week7_answers/checks/20261012/trace_animations.cjs
python IOT_Introduction/docs/teaching_drafts/week7_answers/create_animations.py
python IOT_Introduction/scripts/verify_cumulative_lesson.py 7 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 7 --answers --render
```

建置需marked/playwright/Microsoft Edge，PDF與GIF驗證需pypdf/Poppler/Pillow。各頁區塊邊界、來源雜湊與圖片檢查後仍需目視檢查。動畫左固定完整步驟、右顯示目前紙箱、操作、燈、紙旗與OLED；依真正程式的假I/O重播，但不是實物錄影。

本週採兩筆開關箱光線、最小差距100、分界附近不切換、連續0.5秒才確認新狀態。RAW端點不能單獨診斷接線；模型不能保證偵測鬆線或防竊。保留外接供電、STOP、30秒、至少1秒命令間隔與人工關電，不用程式預覽冒充實物完成。
