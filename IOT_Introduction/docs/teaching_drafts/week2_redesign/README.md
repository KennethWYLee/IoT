# Week 2 正式主教材維護來源

2026-09-27 現行版：Main 為 5 頁題目，Ans 為 47 頁完整教學及答案。`exam_pages.cjs` 維護 Main；`build_sample.cjs` 保留原教學，配合本機 `week2_answers/exam_answers.cjs`、`room_answer.cjs` 產生 Ans。舊頁次表為沿革；原教學第 1～37 頁現位於 Ans，電壓說明沒有刪除。此段優先於下方較早的分工描述。

重建依序執行 `node build_sample.cjs`、`node build_sample.cjs --answers`，再執行 `python verify_sample.py`，同時核對兩份輸出。`week2_answers/build_answers.cjs` 現為同一產生器的入口，不再產生舊的九頁解答。Ans 及其私有維護來源不加入 Git。見[全學期修訂紀錄](../../lab_notes/2026-09-27-semester-exam-answers.md)。

2026-09-22 本輪：Main 保留基本程式與原理，延伸題答案另放本機 week2Ans。
新增兩張「只改一處」反例對照圖，相關接線只作圖上推演；不新增實物實測。
目前頁次以 PDF 頁尾與產生器清單為準，下方舊頁碼保留沿革意義。
[本輪修改、驗證與限制](../../lab_notes/2026-09-22-weekly-main-answers.md)。本輪尚未提交或上傳。



2026-09-22 最新批註：`counter_practice` 只讀兩鍵、加減並印出數字，完整程式一頁。基礎教學聚焦資訊流、電流與加減原理；長按、RST、雙鍵、loop、計時與上下限移到練習。主教材 35 頁，第 21–22 頁以中文標出電壓比較位置，第 23 頁新增電阻換成導線的放開／按下對照圖，第 33–34 頁整合「活動入場人數登記」題目、預期結果與觀察問題；week2Ans.pdf 第 1 頁為觀察題解答，第 2–8 頁為 20 人登記解答；OLED 內容移到 Week 5。[最新修正紀錄](../../lab_notes/2026-09-22-voltage-exercise-clarity.md)。[前次基礎範例修正](../../lab_notes/2026-09-22-counter-minimal-basics.md)。[本輪修正與驗證](../../lab_notes/2026-09-22-counter-room-progression.md)。先前命名與註解修訂見[歷史紀錄](../../lab_notes/2026-09-22-counter-practice-comments.md)。

後續發布授權：本次只提交主教材、必要來源與維護紀錄；補充 PDF／補充程式及私有 QA 留本機。[發布範圍與檢查](../../lab_notes/2026-09-21-main-publication.md)。下文「尚未提交」為修訂完成當時的紀錄，實際提交以 Git 歷史為準。

2026-09-21 已以 layout sample 取代正式 Week 2。後續頁次以本頁表格及 2026-09-22 最新紀錄為準。舊正式 notebook／PDF 已[封存](../../archive/week2_before_layout_promotion/README.md)。本次尚未 commit、push 或上傳雲端。

[正式替換、答案分離與本輪驗證紀錄](../../lab_notes/2026-09-21-week2-formal-replacement.md)。以下較早編譯數據只代表當時版本；本輪未重新做目標板編譯或實機操作。

第 20–22 頁依教師提問整理為三頁：電壓／電流區分、放開時用 V = I × R 解釋、按下時用同一電路計算。訊息傳送現為第 24 頁；移除學生版的 TPO 和舊教材比較。計數器先確認加減、長按與歸零的預期結果，再做房間人數延伸練習；取消中途改上限為 3 的測試與實際結果空格。詳見[本次修正與檢查](../../lab_notes/2026-09-21-week2-input-pullup.md)。先前檢查紀錄與雜湊保留歷史意義，不作為本次 PDF 的驗證結果。

## 先開這些

- [2026-09-21 教材修正準則](revision_guidelines.md)（後續修訂先讀；整理今天決定與延續要求）
- [正式主教材 PDF](../../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)
- 本機解答：`Week_02_ESP32_Hardware_Basics/week2Ans.pdf`，8 頁；OLED 已移到 `week5_oled_supplement/week5_OLED.pdf`，不再放在 Week 2。兩份均未發布。
- `Week2_main_layout_sample.pdf` 留作舊批註入口的相同內容副本，由 builder 同步，不再獨立編修。
- [第一次 Hello 程式](hello_first/hello_first.ino)
- [單按鈕程式](button_follow_along/button_follow_along.ino)
- [雙按鈕計數器程式 counter_practice.ino](counter_practice/counter_practice.ino)
- 20 人房間參考解答：本機 `week2_answers/room_counter/room_counter.ino`，不隨主教材發布。
- [設計決定、沿革與檢查紀錄](Week2_redesign_review.md)

教師決定採同步帶做，先得到可觀察的結果，再解釋原理。不能假設學生已安裝 IDE、上傳過 Serial 範例或知道 GPIO 如何接線。

2026-09-21 批註更新：學生講義直接呈現情境、任務、操作與原理，不加入「這一頁先不改程式」「下一頁再解釋」「現在不用理解」等教學安排敘述。保留斷電、接線、上傳順序、預期結果及必要查找頁碼。

第 32 頁後續批註：不再使用「原版／新版」比較。需要辨認程式時，直接寫功能或檔名；房間練習的情境與預期結果不夾帶 99 上限比較。學生頁尾只保留課題與頁碼，草稿狀態與測試限制留在維護記錄。功能、程式及安全限制沒有變動。

| 頁 | 內容 |
|---|---|
| 1–5 | 電表、麵包板、按鈕、板上腳位辨認 |
| 6–14 | 從安裝 Arduino IDE 到 Hello、Hi 與資訊流 |
| 15–19 | 上傳單按鈕程式、斷電接線、觀察文字 |
| 20–22 | 三頁圖解：上拉、電壓／電流及 V = I × R |
| 23 | 電阻換成導線：放開時電壓與按下時短路；禁止實作 |
| 24 | GPIO 讀值如何成為電腦上的文字 |
| 25–29 | 基礎雙按鈕接線、操作與數字加減 |
| 30 | counter_practice 完整程式，只印數字 |
| 31–32 | 資訊流與電流，count 與 Serial 的作用 |
| 33 | 活動入場人數登記：0～20、長按、雙鍵與重啟規則 |
| 34 | 預期結果、負數與 loop 等觀察問題 |
| 35 | 參考資料 |
| week2Ans 1 | 觀察問題解答 |
| week2Ans 2–8 | 入場登記實作步驟、原理、完整程式與驗證 |

## 使用前的限制

- 圖示接法僅對應 YD-ESP32-S3 Type-A V1.5／N16R8／CH343，以及已核對方向的四腳按鈕。先看課程的[實體硬體狀態](../../hardware/hardware_state.md)，不能把目前其他作品的接線直接當成空板。
- 計數器 GPIO4／GPIO5 都是 INPUT_PULLUP，不可同時設定為輸出。基礎範例不設自訂上下限、不去抖、不偵測一次按壓，也不處理雙鍵衝突；讀到 LOW 即加減並顯示，delay(200) 只讓輸出容易看。進階規則由練習提出。
- 編譯與主機假輸入測試通過，**新雙按鈕接線尚未實機驗證**。沒有上傳韌體、移動實體接線或替學生做測試。
- 正式 `week2_main.pdf` 現在由本資料夾產生；舊 notebook 已封存為原始 JSON 快照，不再作閱讀或匯出入口。私有 QA 不動。原 `_outputs/week2_redesign/` 留作歷史工作副本。
- 官方操作截圖有其他版本、板型與平台，旁邊已標示差異。以本課設定表為準，不能照圖片中的 UNO、9600 或其他版本操作。

## 重新產生與檢查

維護 `build_sample.cjs`、`beginner_setup.cjs`、`ohms_law_pages.cjs`、`counter_project.cjs` 與三份主教材 `.ino`；不要直接改 PDF。本機 `../week2_answers/room_answer.cjs` 與 `room_counter/room_counter.ino` 只供 week2Ans 使用，主教材不載入房間題解答。程式由 `.ino` 自動嵌入，避免不同步。答案雖不在主教材，仍隨 week2Ans 提供，不是保密考卷。

需要 Node.js、Playwright、Microsoft Edge；Python 需要 PyMuPDF、Pillow。可使用已配置的相依套件，或在本資料夾安裝 `npm install --no-save --package-lock=false playwright`。沒有自動安裝或更新另一台電腦的環境。

在本資料夾執行：

```powershell
node build_sample.cjs
python verify_sample.py
pdftoppm -scale-to 1100 -png Week2_main_layout_sample.pdf tmp/from_zero
python make_review_sheets.py
```

PDF、完整原始碼及已完成的檢查證據可納入 Git；HTML、`tmp/`、編譯產物與圖片檢查縮圖不提交。`original_hashes.json` 不改，現在核對封存的原正式 main；`checks/published_main.json` 記錄目前正式 PDF 與維護來源的雜湊。通用 notebook 匯出器不再產生 Week 2，不得用封存 notebook 覆蓋正式 PDF。

`run_counter_host_test.ps1` 需要 Windows、Visual Studio 2022 Community C++ 工具與 Windows SDK；其他安裝位置需調整工具路徑。它直接編譯並執行同一份 `.ino`，只替換硬體 I/O 與時間；不是實機測試。

本機 week2Ans 練習解答測試：`./run_counter_host_test.ps1 -TestName exercise_host_test`。九組主機測試核對短按、長按、0～20 上下限、雙鍵暫停、彈跳、時間回繞與重啟；[結果](checks/exercise_host_results.txt)不代替實機證據。解答在同一 Arduino 設定編譯成功：283879 bytes，全域變數 22452 bytes。

Arduino 編譯使用 esp32 core 3.3.11 與以下 FQBN：

```text
esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi,PartitionScheme=app3M_fat9M_16MB,CDCOnBoot=default,USBMode=hwcdc,UploadMode=default,FlashMode=qio,UploadSpeed=115200
```

計數器編譯：283819 bytes；全域變數 22452 bytes。[主機測試](checks/counter_host_results.txt)共 11 組通過；[版面檢查](checks/layout_check.json)與[PDF 檢查](checks/verification.json)對應隨附 PDF。來源網址、圖片雜湊與取得時間在 [圖片來源紀錄](reference_images/sources.json)。Arduino 官方圖依 CC BY-SA 4.0 標示，Espressif 官方圖保留其原權利與來源，未聲稱原創。

目前優先請教師確認第 6–14 頁能否從零跟做；接著才實機確認計數器的接線與長按、上下限行為。
