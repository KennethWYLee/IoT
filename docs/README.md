# 課程文件

閱讀教材請先到[18週教材入口](../IoT_Introduction/README.md)。本目錄提供課程規劃、
備課與驗證資料；每類資訊保留指定來源，不再於首頁重複整份內容。

## 課程規劃

- [18週進度、評量與作品要求](course/18_week_plan.md)：課程進度的主要依據。
- [中文課綱](course/1151_course_syllabus_draft.md)／[英文課綱](course/1151_course_syllabus_english.md)：課綱版本。
- [校曆對齊](course/1151_calendar_aligned_course_plan.md)：上課日與特殊行程。
- [材料與課堂執行](course/18_week_materials_arrival_runbook.md)：課前準備與課堂檢核。
- [Type B教學設計](course/typeb_course_redesign.md)：課堂活動的設計依據。

## 備課與程式

- [教材設計與維護來源](course_materials/README.md)：設計框架、教師課卡、評量與任務模板。
- [可執行範例](../examples/README.md)：Arduino程式與後端，不與教材來源混放。
- [生成與驗證工具](../scripts/README.md)：重新產生教材、圖片及檢查一致性。

## 硬體與證據

- [學生正式材料清單](../IoT_Introduction/Week_01_Course_Orientation/week1_support.md#一學生材料採購總表)：品項、數量與準備要求的唯一清單。
- [採購原則](hardware/purchase_list.md)：共同材料、分組電表及選配原則。
- [教師庫存](hardware/purchased_inventory.md)：教師設備，不代表學生可借用數量。
- [目前硬體狀態](hardware/hardware_state.md)：指定板卡、接法、實測進度與下一步。
- [實作紀錄](lab_notes/README.md)：每次測試與教材審查的證據，不取代目前狀態。
- [設備圖片](images/hardware/README.md)：實體照片、商品辨識與待確認事項。

## 舊稿

[舊稿區](archive/README.md)保存入門QA與舊Week 4致動器教材，供追溯及後續重整。
舊稿不代表現行週次或已完成驗證，也不是新的必讀教材。

## 同步與本機文件

本機的`AGENTS.md`、`CLAUDE.md`及`PROJECT.md`不進入Git追蹤；公開文件不以它們作為
可點擊依賴。課程規劃、教材與實測紀錄仍保存於本目錄及各自的正式入口。
換電腦時如需本機維護規則，另行複製，不能假設`git clone`會帶入這三份文件。
產生的HTML預覽、編譯輸出及快取放在`_outputs/`，不列入教材也不提交。
