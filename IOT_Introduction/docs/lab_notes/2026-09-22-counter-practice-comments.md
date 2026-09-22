# Week 2 計數器命名與註解

日期：2026-09-22。教師要求名稱採 `counter_practice`，重要程式補上註解。

## 修改

- 將 `counter_two_buttons/counter_two_buttons.ino` 改為 `counter_practice/counter_practice.ino`，同步來源產生器、測試引用、編譯清單與教材連結。
- 註解說明腳位、上拉讀值、40 毫秒穩定判斷、放開後才能再計數、長按一次、上下限與 Serial 訊息。
- 第 25 頁使用相同檔名；第 31–32 頁標示完整程式（1／2）、（2／2），明確要求放在同一份 `.ino`。
- 重建正式 `week2_main.pdf` 與相同內容的 layout sample 副本。頁數仍為 36，房間題及本機補充教材未修改。

## 驗證

- 與修改前 Git HEAD 的程式比較，去除註解與空白後完全相同。
- `run_counter_host_test.ps1`：11 組主機假輸入測試通過，包括防彈跳、長按、同按、上下限、時間溢位與重新啟動。
- `verify_sample.py`：36 頁內容、程式與來源一致性、頁碼、檔案雜湊及封存保留檢查通過。
- 產生器的 36 頁溢出與圖片載入檢查通過；另以 Poppler 渲染並目視檢查受影響的第 25、31、32 頁，未見文字裁切、重疊或缺字。
- `verify_course_materials.py` 與 `verify_intro_navigation.cjs` 通過。
- PDF SHA-256：`99ee70f074fc00fccd31d15c62acc3947f7645baf79f4acb005e22f4f43e6c13`。

未重新進行 ESP32 目標編譯、上傳韌體、接線或硬體實測；主機測試不代表實機驗證。未 commit、push 或更新 Google Drive；既有雲端 PDF 仍是本次修改之前的版本。
