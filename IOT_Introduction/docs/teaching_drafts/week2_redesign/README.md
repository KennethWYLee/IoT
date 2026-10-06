# Week2 Main、Ans、program

## 現行本機版本

2026-10-06 依實作優先要求修正：Main 4 頁，私人 Ans 12 頁。一顆按鈕、GPIO5；GPIO4 留給後續光敏。不新增第二顆按鈕、長按連加、0～20 上下限或外部電阻實驗。

教師後續更正：每週從空麵包板、全部斷電開始；同堂各步驟可保留接線。下課先拔 USB 與全部電源，再拆除所有導線及元件；下週依程式與接線紀錄重新組裝，不保留實物接線。

- 學生 Main：[正式 Main PDF](../../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)；本目錄 `Week2_main_layout_sample.pdf` 是相同副本。
- Main 維護來源：`exam_pages.cjs`，Q1 單鍵計數器、Q2 ON／OFF 文字開關、Q3 可暫停單鍵碼表；Q4 用「按住並按 RST → 放開 → 再按」檢查目前狀態與重啟後的次數。前三題要求不變，Q4 不重做 Q1 的一般計數測試。首次上傳留在 Ans 準備；Main 沒有程式檔名、答案程式或實作接線步驟。
- 列印版型：`print.css`；入口與渲染：`build_sample.cjs`。保留既有 A4、字體、配色及頁尾。
- 私人 Ans 的 `current_lesson.cjs` 先接線、開程式、核對畫面，再簡短說明。Q4 重用 Q1 的 `week2_button_count`，同步顯示 pressed／released 與 count，最後一頁才說明上拉。五支 .ino 只在私人 `week2_answers/programs`，沒有公開 Week2 Ans 或程式。
- 舊教學來源與程式未當成新的主線；完整舊版已另保存於私人 `week2_answers/supplemental/pre_cumulative_20260930`，不構成共同必做。

## 重建

從 IoT repository 根目錄執行，沿用已配置的 Node、Playwright、Edge、Python pypdf、Poppler：

```powershell
node IOT_Introduction/scripts/package_answer_programs.cjs 2
node IOT_Introduction/docs/teaching_drafts/week2_redesign/build_sample.cjs
node IOT_Introduction/docs/teaching_drafts/week2_redesign/build_sample.cjs --answers
node IOT_Introduction/docs/teaching_drafts/week2_answers/test_source_simulation.cjs
python IOT_Introduction/docs/teaching_drafts/week2_redesign/verify_sample.py
node IOT_Introduction/scripts/package_answer_programs.cjs 2 --check
```

公開來源可獨立重建 Main，不需要私人答案目錄。Ans 與完整驗證需要本機私人來源。`checks/published_main.json` 是沿用檔名的本機輸出雜湊紀錄，不表示這次已發布。

## 驗證界線

Main、Ans 已重建、逐頁檢查；五支現行程式使用 Arduino-ESP32 3.3.12 目標編譯。另以替代 I/O 執行由來源轉換的 JavaScript 控制流程，測試按下、放開、彈跳、計時與起始行為；另以原生 C++ 替身執行三個作品，確認長按、彈跳、重啟與計時溢位；這仍不是硬體實測。

GPIO5 選擇依 BOARD-T01 2026-09-07 按放紀錄與板卡廠商腳位表，麵包板及四腳方向依既有接點紀錄。須核對每組實際板型、按鈕組別、資料線及新版實際按放；沒有上電、Upload 或新實機結果。

本次更正未改共享準則、課程計畫、根索引或 Git 排除規則；沒有 stage、commit、push 或上傳。正式週目錄的 Main 已更新，Ans 仍留在私人目錄，沒有新增公開入口。

最新修訂與驗證：[本輪紀錄](../../lab_notes/2026-10-06-practical-first-weeks.md)。[2026-09-30 紀錄](../week2_answers/20260930_three_artifacts.md)保留作沿革，不代表本輪已發布。
