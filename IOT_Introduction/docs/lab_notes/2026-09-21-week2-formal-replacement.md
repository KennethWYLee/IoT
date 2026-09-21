# Week 2 正式替換與房間題解答分離

## 教師決定

2026-09-21：以 `Week2_main_layout_sample` 取代正式 Week 2；房間題解答從「上限改成五，滿了再印 FULL」開始，移到 Week2 補充。課綱、評量、採購、私有 QA 及其他週重設稿內容不動。

同日後續確認：雙按鈕計數器需要完整程式，必須先把該作品講完，再進入房間練習。因此將計數器程式前移至第 31–32 頁，房間題及預期結果後移至第 33–34 頁；不是把雙按鈕計數器的答案移出主教材。

## 現行檔案

- [正式主教材](../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)：36 頁。第 24–30 頁為雙按鈕計數器操作、原理與測試，第 31–32 頁為同一作品完整程式。第 33 頁房間情境、第 34 頁完整預期結果，沒有房間題改法或 FULL 的解答程式；第 35 頁排錯、第 36 頁來源。
- 本機補充（依教師後續要求，本次不發布）：23 頁。OLED 第 1–21 頁原操作與程式保留，第 22 頁更新導覽，第 23 頁為房間題解答；明確寫出主教材的設定、接線及預期結果頁碼，且這題不用 OLED。
- [替換前封存](../archive/week2_before_layout_promotion/README.md)：舊正式 PDF、舊 notebook 原始 JSON 與原 37 頁 layout sample。舊 notebook 使用 `.ipynb.json` 副檔名，避免再被當成現行匯出來源；位元組與原雜湊一致。

`docs/teaching_drafts/week2_redesign/Week2_main_layout_sample.pdf` 與補充來源資料夾內的同名 PDF 都是正式成品的相同內容副本，由各自 builder 一次產生後同步，保留舊批註路徑；不是另外維護的版本。今後閱讀以正式週目錄為入口。

## 來源與工具

主教材仍由 `week2_redesign/build_sample.cjs`、`beginner_setup.cjs`、`ohms_law_pages.cjs`、`counter_project.cjs` 及原 `.ino` 產生。房間題說明獨立為 `room_answer.cjs`，只由補充 builder 載入；程式片段仍直接取自原 `counter_exercise_solution.ino`，沒有改演算法或腳位。

同步修正課程索引、Week 1 安裝入口及舊 Week 3 notebook 的 Week 2 連結。Week 3–7 正式 notebook 的 PDF 透過既有通用匯出器重新產生並更新 manifest；除了 Week 3 的連結目標，沒有修改這五份 notebook 的教學內容，也沒有用它們覆蓋其他週的新重設稿。

通用 notebook 匯出器排除本機已移走、尚未提交刪除的路徑；Week 2 正式 PDF 不再由 notebook 匯出。舊 Week 2 圖件 builder 會清楚停止並指出新入口，舊 verifier 轉交目前 PDF／來源檢查，不默默恢復封存 notebook。Arduino 批次來源列表改指向主教材與房間解答實際使用的 `.ino`，但本輪未執行整門課的目標板編譯。

## 正式替換時的驗證與限制

- 主教材 builder：36 頁圖片均載入、內容未溢出、頁尾有間距；文件標題不再稱 layout sample。
- 補充 builder：23 頁圖片與版面檢查通過，頁首／頁尾更新為補充教材，不再把房間解答標成只有 OLED。
- `verify_sample.py`：核對原正式檔封存雜湊、正式 PDF 與舊批註入口相同、來源 hash、每頁頁碼與文字邊界、主教材無房間解答；並逐頁比較原 37 頁樣稿，除移走答案及更新引用頁碼外，保留頁的文字一致。
- `verify_pdf.py`：確認房間解答位於補充第 23 頁，片段與原 `.ino` 相同，主教材引用頁碼正確；OLED 程式與原來源一致。23 頁全部以 Poppler 渲染。
- 主教材 36 頁全部以 Poppler 渲染；目視核對主教材第 31–33 頁與補充第 23 頁，無可見裁切、重疊或錯誤頁碼。
- `run_counter_host_test.ps1 -TestName exercise_host_test`：五組替代 I/O 軟體測試通過，含完整九步序列、FULL 出現位置、長按、重疊按鍵及模擬彈跳。
- 課程結構與本機連結、入門導覽及 notebook PDF manifest 檢查通過。

本輪是文件替換與重新排版，沒有目標板新編譯、上傳韌體、連接硬體或學生試教。硬體限制與原實測紀錄未更改；軟體測試不代表真實按鈕／OLED 整合已成功。

未 commit、push、上傳 Google Drive 或捨棄先前修改。後續修訂須從這兩份正式 PDF 對應的 builder 開始，不能把房間答案加回主教材。

## 計數器與房間題順序修正

- 修改 `counter_project.cjs` 的頁面順序與第 25 頁完整程式查找頁碼；完整 `.ino`、接線、範例與題目內容不變。
- `room_answer.cjs` 和補充導覽更新為主教材第 33–34 頁，測試指向第 34 頁；解答仍在補充第 23 頁。
- 同步更新 README、修正準則、目前設計狀態、主教材及補充的檢查腳本。
- 重新產生 36 頁主教材與 23 頁補充，維護來源內的批註用 PDF 副本與正式檔一致。
- 兩份 PDF 的頁碼、文字邊界、圖片載入與版面高度檢查通過。主教材 36 頁文字依新順序對照封存審閱版，除已授權的答案分離、順序與查找頁碼外，沒有內容變更；完整計數器程式與 `.ino` 一致。
- Poppler 重新渲染主教材第 25、31–34 頁及補充全部 23 頁；目視檢查主教材上述 5 頁與補充第 22–23 頁，未見裁切或重疊。
- 課程結構與 123 份 Markdown／notebook 的本機連結檢查通過，`git diff --check` 通過。程式未改，因此本次沒有重跑主機行為測試或目標板編譯；沒有硬體操作、學生試教、commit、push 或雲端上傳。

本次輸出 SHA-256：

- 主教材：`b798669f9745086def3e4313221cd980198bc508b83c48862468d7d2aa69cc69`
- 補充：`5b09fc7967919f8e13f36d95dc8ae49759f1ea52766172efd69e141e31916c06`
