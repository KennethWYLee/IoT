# Week 2 重新設計樣稿

更新：2026-09-16。這是教師正在審閱的 **32 頁樣稿**，不是已核准取代正式主教材的版本。

## 先開這些

- [完整樣稿 PDF](Week2_main_layout_sample.pdf)
- [第一次 Hello 程式](hello_first/hello_first.ino)
- [單按鈕程式](button_follow_along/button_follow_along.ino)
- [雙按鈕計數器程式](counter_two_buttons/counter_two_buttons.ino)
- [設計決定、沿革與檢查紀錄](Week2_redesign_review.md)

教師決定採同步帶做，先得到可觀察的結果，再解釋原理。不能假設學生已安裝 IDE、上傳過 Serial 範例或知道 GPIO 如何接線。

| 頁 | 內容 |
|---|---|
| 1–5 | 電表、麵包板、按鈕、板上腳位辨認 |
| 6–14 | 從安裝 Arduino IDE 到 Hello、Hi 與資訊流 |
| 15–21 | 上傳單按鈕程式、斷電接線、觀察文字，再講上拉與資訊流 |
| 22–30 | 雙按鈕加減計數器、完整接線、電流圖、規則測試與程式 |
| 31–32 | 故障排查、官方來源與圖片出處 |

## 使用前的限制

- 圖示接法僅對應 YD-ESP32-S3 Type-A V1.5／N16R8／CH343，以及已核對方向的四腳按鈕。先看課程的[實體硬體狀態](../../hardware/hardware_state.md)，不能把目前其他作品的接線直接當成空板。
- 計數器 GPIO4／GPIO5 都是 INPUT_PULLUP；GPIO5 不能同時當 TPO 輸出。範例採 0～99、長按一次、兩鍵均放開後才接受下次、Reset 歸零。
- 編譯與主機假輸入測試通過，**新雙按鈕接線尚未實機驗證**。沒有上傳韌體、移動實體接線或替學生做測試。
- 正式 `week2_main.ipynb`／PDF 及私有 QA 沒有被這份樣稿覆蓋；本次不發布 QA。原 `_outputs/week2_redesign/` 留作歷史工作副本，後續維護本資料夾。
- 官方操作截圖有其他版本、板型與平台，旁邊已標示差異。以本課設定表為準，不能照圖片中的 UNO、9600 或其他版本操作。

## 重新產生與檢查

維護 `build_sample.cjs`、`beginner_setup.cjs`、`counter_project.cjs` 與三份 `.ino`；不要直接改 PDF。程式自動嵌入講義，避免不同步。

需要 Node.js、Playwright、Microsoft Edge；Python 需要 PyMuPDF、Pillow。可使用已配置的相依套件，或在本資料夾安裝 `npm install --no-save --package-lock=false playwright`。沒有自動安裝或更新另一台電腦的環境。

在本資料夾執行：

```powershell
node build_sample.cjs
python verify_sample.py
pdftoppm -scale-to 1100 -png Week2_main_layout_sample.pdf tmp/from_zero
python make_review_sheets.py
```

PDF、完整原始碼及已完成的檢查證據受 Git 追蹤；HTML、`tmp/`、編譯產物與圖片檢查縮圖不提交。`original_hashes.json` 是本次原 main 基準；原 main 未來經核准更新後，需要重新確認基準，不可盲目更新雜湊來消除失敗。

`run_counter_host_test.ps1` 需要 Windows、Visual Studio 2022 Community C++ 工具與 Windows SDK；其他安裝位置需調整工具路徑。它直接編譯並執行同一份 `.ino`，只替換硬體 I/O 與時間；不是實機測試。

Arduino 編譯使用 esp32 core 3.3.11 與以下 FQBN：

```text
esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi,PartitionScheme=app3M_fat9M_16MB,CDCOnBoot=default,USBMode=hwcdc,UploadMode=default,FlashMode=qio,UploadSpeed=115200
```

計數器編譯：283819 bytes；全域變數 22452 bytes。[主機測試](checks/counter_host_results.txt)共 11 組通過；[版面檢查](checks/layout_check.json)與[PDF 檢查](checks/verification.json)對應隨附 PDF。來源網址、圖片雜湊與取得時間在 [圖片來源紀錄](reference_images/sources.json)。Arduino 官方圖依 CC BY-SA 4.0 標示，Espressif 官方圖保留其原權利與來源，未聲稱原創。

目前優先請教師確認第 6–14 頁能否從零跟做；接著才實機確認計數器的接線與長按、上下限行為。
