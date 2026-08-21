# Internet of Things — Project Context

> 本檔記錄此課程的專屬事實與硬體脈絡，不取代工作區根目錄的
> `AGENTS.md`／`CLAUDE.md`。

- 最後盤點日期：2026-08-05
- 課程狀態：115-1 課程與 Type B 教材規劃中
- Repository：本資料夾為獨立 Git repository
- 文件可見性：課程內部；硬體與採購文件發布前需確認

## 課程專屬規則

- 115-1 工作須同時核對 18 週計畫、calendar-aligned plan、Type B
  redesign 與 materials-arrival runbook；衝突必須明示，不得自行選版。
- ESP32-S3 DevKit 與 UCI K-4 4WD 的描述在 exact model、revision、
  pinout、peripherals 及供電限制確認前均視為 provisional。
- `_outputs/` 是衍生輸出；canonical firmware、wiring diagram 或教材
  位置未確認前，不得把輸出提升為權威來源。
- Approved BOM、設備數量、分組、到貨狀態與替代料件確認前，不得
  定稿硬體依賴的 labs 或對學生承諾設備能力。
- 課程紀錄必須分開標示 compile、simulation、target、HIL 與 physical
  test，學生硬體活動必須包含安全啟動、停止、故障與復原程序。

## 課程定位

- 課程名稱：Internet of Things
- 教師以智慧停車與 UCI K-4 4WD 作為整合參考案例；學生不必造車。
- 第 7 週進行個人概念筆試；第 8 週每組只進行一次題目與技術可行性
  訪談，展示一個可運作片段，不要求完整期中成品。
- 第 9 週教師出國，不要求到校、不收新評量成果。
- 共同技術主線為 ESP32-S3、Wi-Fi、HTTP／MQTT、學生自建後端、
  資料庫、structured log、WebSocket 與手機前台；期末必須包含
  即時狀態、歷史查詢、雙向控制、自動化與故障處理。
- README 提及 ESP32-S3 DevKit 與 UCI K-4 4WD；實機操作前仍需
  依確切板卡 revision、pinout 與供電規格重新核對。

## 權威文件與材料

- 課程入口：`README.md`
- 18 週進度：`docs/18_week_plan.md`
- 115-1 日曆對齊計畫：`docs/1151_calendar_aligned_course_plan.md`
- 115-1 課程大綱填寫草案：`docs/1151_course_syllabus_draft.md`
- 115-1 課程大綱英文版：`docs/1151_course_syllabus_english.md`
- Type B 設計：`docs/typeb_course_redesign.md`
- 材料到貨與課程運作：`docs/18_week_materials_arrival_runbook.md`
- 課程教材：`docs/course_materials/`
- 採購資訊：`docs/purchase_list.md`
- 已購器材庫存：`docs/purchased_inventory.md`
- 同步工具：`scripts/`

## 技術、硬體與驗證

- 確切 MCU、board revision、toolchain、firmware、周邊、電壓、
  電流、腳位與通訊參數，以 vendor 文件及實際設備為準。
- `_outputs/` 預設是衍生輸出，不是權威來源。
- 編譯、模擬、target test、HIL 與實機測試必須分別記錄。
- 學生使用硬體前需確認安全啟動、停止、故障與復原流程。

## 待確認事項

- [ ] 確認正式班級、設備數量、分組方式與學生先備能力。
- [ ] 確認科目代碼、學分數、必修／選修、授課語言及 115-1 核心能力欄位。
- [ ] 建立已核准硬體 BOM、精確版本與替代料件表。
- [ ] 教師參考車尚未購買：2 個碼盤測速模組、4 個 104 陶瓷電容、
  1 個 1000 uF／16V 電解電容及 1 片 5 x 7 cm 洞洞板；現有 3 個
  HC-SR04 可先供一台參考車使用。
- [x] `docs/18_week_plan.md`、calendar-aligned plan、中文與英文課綱及
  Type B redesign 已同步為 Full-stack IoT 版本。
- [ ] `docs/18_week_materials_arrival_runbook.md` 與 `docs/course_materials/`
  仍是舊的學生 UCI 4WD 版本，目前僅作教師智慧停車參考案例，需另案
  重寫為現行 Full-stack IoT 課堂教材。
- [ ] 確認 firmware／wiring diagram／課程文件的權威位置。
- [ ] 依現行課表建立第 7 週筆試藍圖、第 8 週訪談表、第 13／15 週
  進度檢核表與第 17 週 Full-stack IoT rubric。
