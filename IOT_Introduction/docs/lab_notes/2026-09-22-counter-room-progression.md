# Week 2 基礎計數器與 20 人延伸練習

## 教師決定

2026-09-22：基礎 `counter_practice` 不設定上限，重點是操作與原理；作品完成後說明資訊流、電流與相關原理，再進入難度較高的房間題。後續明確改為 20 人上限。房間題解答只留在本機 Week2 補充，不發布。

本次基礎計數器不設自訂上下限，可出現負數，保留單次按壓只計一次、去抖與兩鍵放開才能再操作。教材提醒 int 的儲存範圍有限，沒有宣稱可儲存無限大數字。

## 現行內容

- 主教材 39 頁。第 24–29 頁為操作與測試，第 30–31 頁為完整程式，第 32–34 頁依序說明資訊流、電流及按壓與時間，第 35–37 頁為延伸題，第 38–39 頁為排查及來源。
- 房間題 0～20 人；確認單鍵後立即計一次，800 ms 後第二次，之後每 300 ms 計一次。雙鍵重疊停止，兩鍵都穩定放開才恢復。上下限不越界，同一次長按的越界訊息只回報一次。
- 第一次長按計數設為 t=0，count=20 在 t=6200 ms，第一次上限拒絕在 t=6500 ms。這是理想輪詢的預期時序，不是實測精度。
- 補充共 29 頁；第 23–29 頁為 room_counter 的開檔、上傳、原理、四頁完整程式與驗證。OLED 顯示練習保留 0～5、長按一次，已明確區分。
- 舊五人題 .ino 與主機測試移到被 Git 忽略的 `week2_oled_supplement/archive_five_person/`，未刪除原始內容；新解答與測試也在本機補充資料夾。公開編譯清單不依賴私有解答。
- 主教材維護來源及頁碼連結、驗證器、README、修正準則同步更新。未改其他週內容、成績、設備或採購。

## 驗證

- `run_counter_host_test.ps1`：11 組通過，含負數、超過 99、長按一次、去抖、重疊按壓、1000 次加減與 millis 溢位。
- `run_counter_host_test.ps1 -TestName exercise_host_test`：9 組通過，執行本機補充的 room_host_test.cpp；核對 40/800/300 ms 邊界、20 人上限、下限、訊息次數、雙鍵中止、穩定放開、按鍵方向切換、開機按住與 millis 溢位。
- 兩支 sketch 通過 Arduino-ESP32 3.3.11 的 ESP32-S3 編譯。使用現有隔離設定 `_outputs/profile_compile/arduino-cli.yaml`，FQBN 為 `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi,PartitionScheme=app3M_fat9M_16MB,CDCOnBoot=default,USBMode=hwcdc,UploadMode=default,FlashMode=qio,UploadSpeed=115200`。
- counter_practice：程式 283779 bytes、全域變數 22452 bytes。room_counter：程式 284175 bytes、全域變數 22460 bytes。
- 兩份產生器均通過每頁溢出及圖片載入檢查。verify_sample.py 通過 39 頁內容、來源一致性、未變頁面保留及解答分離檢查；verify_pdf.py 通過 29 頁及完整程式一致性檢查。
- 兩份 PDF 全頁經 Poppler 渲染；本輪目視檢查主教材第 24–39 頁，以及補充受影響的第 12、21–29 頁，未見裁切、缺字、重疊。未變頁面以內容比較與自動邊界檢查保留，不冒稱重新逐頁閱讀所有原教材。
- 主教材 SHA-256：`f30c432aa0ed3401ecfcade6effb0420cf2830f34decf6f15ebcb5b51c8beed5`。
- 補充 SHA-256：`8928874b2ca657626182a64c37b3ff5aeb3c9e664af136886a9fa2a8a7320d34`。
- Git 忽略檢查確認補充 PDF、room_counter、room_answer.cjs 均不會自動納入 Git。
- 課程結構與本機連結檢查（124 份 Markdown/notebook）、35 個導覽連結及 `git diff --check` 通過。

程式行為以本機測試及編譯為證，沒有上傳韌體、接線、硬體實測或學生試讀。實際按鈕彈跳與操作手感仍待教師確認。未 commit、push 或更新 Google Drive；既有雲端副本仍是本輪之前版本。未動本機其他作品與資料庫。

原理參照教材既有 Arduino Debounce、State Change Detection、millis 及 Espressif GPIO 文件。此次可直接讀取 Espressif GPIO 正文；Arduino 網頁擷取僅回傳外框，未據此宣稱重新完整查核其網頁內容。時間與訊息規則為本題明訂要求，已另由軟體測試核對。
