# Week2 Main、Ans、program

## 現行本機版本

2026-09-30 依課程規劃第四節重建：Main 3 頁，私人 Ans 11 頁。一顆按鈕、GPIO5；GPIO4 留給後續光敏。不新增第二顆按鈕、長按連加、0～20 上下限或外部電阻實驗。

- 學生 Main：[正式 Main PDF](../../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)；本目錄 `Week2_main_layout_sample.pdf` 是相同副本。
- Main 維護來源：`exam_pages.cjs`，含首次上傳成果、單鍵計數成果、驗證與 Q1～Q4。沒有程式檔名、答案程式或實作接線步驟。
- 列印版型：`print.css`；入口與渲染：`build_sample.cjs`。保留既有 A4、字體、配色及頁尾。
- 私人 Ans 的 `current_lesson.cjs` 先教操作，末段同號回答；新 .ino 只在私人 `week2_answers/programs`。
- 舊教學來源與程式未當成新的主線；完整舊版已另保存於私人 `week2_answers/supplemental/pre_cumulative_20260930`，不構成共同必做。

## 重建

從 IoT repository 根目錄執行，沿用已配置的 Node、Playwright、Edge、Python pypdf、Poppler：

```powershell
node IOT_Introduction/scripts/package_answer_programs.cjs 2
node IOT_Introduction/docs/teaching_drafts/week2_redesign/build_sample.cjs
node IOT_Introduction/docs/teaching_drafts/week2_answers/build_answers.cjs
node IOT_Introduction/docs/teaching_drafts/week2_answers/test_source_simulation.cjs
python IOT_Introduction/docs/teaching_drafts/week2_redesign/verify_sample.py
node IOT_Introduction/scripts/package_answer_programs.cjs 2 --check
```

公開來源可獨立重建 Main，不需要私人答案目錄。Ans 與完整驗證需要本機私人來源。`checks/published_main.json` 是沿用檔名的本機輸出雜湊紀錄，不表示這次已發布。

## 驗證界線

Main、Ans 已重建、逐頁檢查；三支新程式使用 Arduino-ESP32 3.3.12 目標編譯。另以替代 I/O 執行由來源轉換的 JavaScript 控制流程，測試按下、放開、彈跳、計時與起始行為；這不是原生 C++ 主機執行，也不是硬體實測。

GPIO5 選擇依 BOARD-T01 2026-09-07 按放紀錄與板卡廠商腳位表，麵包板及四腳方向依既有接點紀錄。須核對每組實際板型、按鈕組別、資料線及新版實際按放；沒有上電、Upload 或新實機結果。

未改共享準則、課程計畫、根索引、其他週或 Git 排除規則；未 stage、commit、push 或上傳。正式週目錄舊 Ans 副本不在本分工修改範圍，新 Ans 在私人目錄。

詳細證據與變更清單：[本輪紀錄](../week2_answers/2026-09-30-cumulative-rebuild.md)。
