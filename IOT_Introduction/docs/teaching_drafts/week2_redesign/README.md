# Week 2 Main、Ans、program

## 現行版本

2026-09-30：Main 6 頁；Ans 44 頁，前 6 頁依原卷位置填答，第 7 頁起按 Q1～Q5 逐題教學。沿用 Week3 的分工，不套用光敏題目；保留按鈕、上拉電阻與兩種計數器的課程內容。

- 學生入口：[正式 Main PDF](../../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)。
- Main 維護來源：`exam_pages.cjs`。先介紹題目關係，再列作品、預期結果、驗證與作答。
- Ans：本機 `../week2_answers/week2Ans.pdf`；正式週目錄另有相同內容副本，不加入 Git。
- Ans 前段填答與教學排序：`../week2_answers/assemble_answers.cjs`；題目直接由 Main 產生，避免兩份原卷漂移。
- 教學來源：`build_sample.cjs`、`beginner_setup.cjs`、`ohms_law_pages.cjs`、`counter_project.cjs`，以及私有 `room_answer.cjs`。
- 四份完整程式在本週 Ans 的 `programs`，每份 .ino 在同名子資料夾；先讀 `START_HERE.md`。PDF 只保留開檔位置、必要片段與解說。
- `Week2_main_layout_sample.pdf` 是正式 Main 的同步副本，不獨立修改。
- 雲端已更新 Main、Ans 與 `program/IoT_week2_program.zip`，三檔均下載回讀核對 SHA-256。GitHub 不新增 Ans 或答案程式。

[共同修訂準則](revision_guidelines.md)；[本輪修訂與發布檢查](../../lab_notes/2026-09-30-week245-main-ans-program-publication.md)。

## 重建與檢查

從 IoT repository 根目錄執行；使用既有 Node、Playwright、Edge 與 Python PDF 相依套件。

```powershell
node IOT_Introduction/scripts/package_answer_programs.cjs 2
node IOT_Introduction/docs/teaching_drafts/week2_redesign/build_sample.cjs
node IOT_Introduction/docs/teaching_drafts/week2_redesign/build_sample.cjs --answers
python IOT_Introduction/docs/teaching_drafts/week2_redesign/verify_sample.py
node IOT_Introduction/scripts/package_answer_programs.cjs 2 --check
```

只有公開 repository 時可重建 Main；Ans 及其檢查需教師保留的私有來源。公開 `checks/published_main.json` 記錄 Main 與輸入來源雜湊。原 notebook 已封存，不得用舊匯出器覆蓋 Main。

本輪完成原卷題序、填答區裁切、算式、程式引用及逐頁渲染檢查。沒有變更 .ino 行為，也沒有重新進行 Arduino 目標編譯、MSVC 主機測試或實機操作。舊成功紀錄只代表當時版本。

## 使用限制

接線示範限定已核對的 YD-ESP32-S3 Type-A V1.5／N16R8／CH343 與四腳按鈕。GPIO4／5 為輸入；不把按鈕支路直接接 3V3 或 5V。改線前斷電，短路反例只在紙上討論。

優先完成本組接線與短按、長按、上下限的實物核對，再用 Main 驗收。照片、編譯或紙上計算不能代替實物結果。

較早頁碼、Arduino 編譯與主機測試紀錄見 [Week2_redesign_review.md](Week2_redesign_review.md)及各日期 lab_notes；不作本輪新測試證據。
