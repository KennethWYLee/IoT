# Week 2 正式主教材維護來源

後續發布授權：本次只提交主教材、必要來源與維護紀錄；補充 PDF／補充程式及私有 QA 留本機。[發布範圍與檢查](../../lab_notes/2026-09-21-main-publication.md)。下文「尚未提交」為修訂完成當時的紀錄，實際提交以 Git 歷史為準。

更新：2026-09-21。教師已要求以 layout sample 取代正式 Week 2。現行主教材共 **36 頁**；雙按鈕計數器完整程式在第 31–32 頁，接著第 33–34 頁才是房間題情境與預期結果。「上限改成五，滿了再印 FULL」解答保留在 **Week2 補充第 23 頁**。舊正式 notebook／PDF 已[封存](../../archive/week2_before_layout_promotion/README.md)。本次尚未 commit、push 或上傳雲端。

[正式替換、答案分離與本輪驗證紀錄](../../lab_notes/2026-09-21-week2-formal-replacement.md)。以下較早編譯數據只代表當時版本；本輪未重新做目標板編譯或實機操作。

第 20–22 頁依教師提問整理為三頁：電壓／電流區分、放開時用 V = I × R 解釋、按下時用同一電路計算。訊息傳送移至第 23 頁；移除學生版的 TPO 和舊教材比較。計數器先確認加減、長按與歸零的預期結果，再做五人上限練習；取消中途改上限為 3 的測試與實際結果空格。詳見[本次修正與檢查](../../lab_notes/2026-09-21-week2-input-pullup.md)。先前檢查紀錄與雜湊保留歷史意義，不作為本次 PDF 的驗證結果。

## 先開這些

- [2026-09-21 教材修正準則](revision_guidelines.md)（後續修訂先讀；整理今天決定與延續要求）
- [正式主教材 PDF](../../../Week_02_ESP32_Hardware_Basics/week2_main.pdf)
- 補充 PDF：OLED 與房間題解答只留本機，依教師要求本次不發布。
- `Week2_main_layout_sample.pdf` 留作舊批註入口的相同內容副本，由 builder 同步，不再獨立編修。
- [第一次 Hello 程式](hello_first/hello_first.ino)
- [單按鈕程式](button_follow_along/button_follow_along.ino)
- [雙按鈕計數器程式](counter_two_buttons/counter_two_buttons.ino)
- [五人人數計數器參考解答](counter_exercise_solution/counter_exercise_solution.ino)（先讀第 33–34 頁的題目與預期結果再看）
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
| 23 | GPIO 讀值如何成為電腦上的文字 |
| 24–30 | 雙按鈕加減計數器、完整接線、電流圖與依序操作的預期結果 |
| 31–32 | 雙按鈕計數器的完整程式與說明，加減範圍 0～99；講完此作品後才進入房間題 |
| 33 | 練習情境：最多五人的小房間、角色、任務與規則，不講程式改法 |
| 34 | 練習預期結果：九個連續步驟，每一次加鍵的完整訊息 |
| 35–36 | 故障排查、官方來源與圖片出處 |
| 補充 23 | 房間題解答：另存 room_counter、改兩處、上傳、回主教材第 34 頁核對 |

## 使用前的限制

- 圖示接法僅對應 YD-ESP32-S3 Type-A V1.5／N16R8／CH343，以及已核對方向的四腳按鈕。先看課程的[實體硬體狀態](../../hardware/hardware_state.md)，不能把目前其他作品的接線直接當成空板。
- 計數器 GPIO4／GPIO5 都是 INPUT_PULLUP，不可同時設定為輸出。範例採 0～99、長按一次、兩鍵均放開後才接受下次、Reset 歸零。
- 編譯與主機假輸入測試通過，**新雙按鈕接線尚未實機驗證**。沒有上傳韌體、移動實體接線或替學生做測試。
- 正式 `week2_main.pdf` 現在由本資料夾產生；舊 notebook 已封存為原始 JSON 快照，不再作閱讀或匯出入口。私有 QA 不動。原 `_outputs/week2_redesign/` 留作歷史工作副本。
- 官方操作截圖有其他版本、板型與平台，旁邊已標示差異。以本課設定表為準，不能照圖片中的 UNO、9600 或其他版本操作。

## 重新產生與檢查

維護 `build_sample.cjs`、`beginner_setup.cjs`、`ohms_law_pages.cjs`、`counter_project.cjs` 與四份 `.ino`；不要直接改 PDF。`room_answer.cjs` 只供補充教材使用，主教材不載入房間題解答。程式由 `.ino` 自動嵌入，避免不同步。答案雖不在主教材，仍隨補充提供，不是保密考卷。

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

新增練習解答測試：`./run_counter_host_test.ps1 -TestName exercise_host_test`。五組測試核對題目完整操作、FULL 出現位置、長按、兩鍵重疊與彈跳；[結果](checks/exercise_host_results.txt)不代替實機證據。解答在同一 Arduino 設定編譯成功：283879 bytes，全域變數 22452 bytes。

Arduino 編譯使用 esp32 core 3.3.11 與以下 FQBN：

```text
esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi,PartitionScheme=app3M_fat9M_16MB,CDCOnBoot=default,USBMode=hwcdc,UploadMode=default,FlashMode=qio,UploadSpeed=115200
```

計數器編譯：283819 bytes；全域變數 22452 bytes。[主機測試](checks/counter_host_results.txt)共 11 組通過；[版面檢查](checks/layout_check.json)與[PDF 檢查](checks/verification.json)對應隨附 PDF。來源網址、圖片雜湊與取得時間在 [圖片來源紀錄](reference_images/sources.json)。Arduino 官方圖依 CC BY-SA 4.0 標示，Espressif 官方圖保留其原權利與來源，未聲稱原創。

目前優先請教師確認第 6–14 頁能否從零跟做；接著才實機確認計數器的接線與長按、上下限行為。
