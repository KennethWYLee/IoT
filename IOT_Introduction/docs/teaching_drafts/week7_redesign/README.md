# Week7：感應開蓋與開箱警示

2026-10-20 依教師已確認的兩個主題重建：Q1 免接觸垃圾桶模型、Q2 包裹開箱警示。每組從空麵包板開始，用同一套電路更換光敏位置、紙件與程式。先不裝紙件測舵機，再做兩件作品；不用 DHT 或蜂鳴器。

Main 維護來源為本目錄 `week7_main.md`；Ans、程式與產生器在私有 `week7_answers`。教師已授權發布本輪 Main、Ans 與兩件作品動畫；Week7 程式仍不公開。發布範圍與檢查見[本輪紀錄](../../lab_notes/2026-10-20-week7-two-works-publication.md)。

新程式是 `sensor_bin` 與 `parcel_watch`；不得以舊四題的 `parcel_display/counter/flag/alert` 代替。舊來源保留，前一包程式另存 `week7_answers/programs_four_works_20261020/`；本輪改版前文件備份在 `_outputs/week7_rebuild_20261020/before/`。

```powershell
node IOT_Introduction/docs/teaching_drafts/week7_answers/generate_week7.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 7
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs --answers
node IOT_Introduction/docs/teaching_drafts/week7_answers/two_works/build.cjs
node IOT_Introduction/docs/teaching_drafts/week7_answers/two_works/check_firmware.cjs --target
node IOT_Introduction/docs/teaching_drafts/week7_answers/two_works/check_revision.cjs
python IOT_Introduction/docs/teaching_drafts/week7_answers/two_works/check_pdf.py
node IOT_Introduction/scripts/package_answer_programs.cjs 7 --check
```

建置需 marked/playwright/Microsoft Edge，PDF 驗證需 pypdf/pdfplumber/Poppler/Pillow；透過已安裝 runtime 設定 NODE_PATH。`WEEK7_REVIEW_DIR` 可指定本輪版面證據目錄。頁面邊界、來源雜湊與圖片檢查後仍需目視檢查。

動畫左列完整步驟、右顯示目前作品及預期 OLED，每題拆成兩輪，中間 OFF/RST/重新設定。動畫是另外寫的行為模擬，不是直接重播 INO 或實物錄影；程式另以實際 INO 的假 I/O 測試和 ESP32-S3 編譯檢查。`simulationOnly=true`、`firmwareMatched=false`、`physicalTested=false` 保留。

本週採兩筆光線、最小差距 100、分界附近不採新判斷、連續 0.5 秒才確認狀態。Q1 未確認 CLEAR 即取消關蓋倒數，重新確認後完整算 3 秒；Q2 保留上次已確認狀態以辨識新事件，WAIT 時不接受確認。保留外接供電、STOP、準備起算 30 秒、至少 1 秒命令間隔與人工關電。兩個作品的紙件行程、供電與實物操作尚待教師核對。
