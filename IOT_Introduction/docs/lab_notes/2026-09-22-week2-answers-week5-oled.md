# Week 2 解答與 Week 5 OLED 分離

教師決定：OLED 移到 Week 5，Week 2 補充改名 week2Ans。日期：2026-09-22。

## 目前入口

- Week 2 主教材仍為 35 頁，只將第 34 頁的解答指引改成 week2Ans.pdf；其餘教學不變。
- 本機 `Week_02_ESP32_Hardware_Basics/week2Ans.pdf`：8 頁，觀察題、人數登記原理、開檔及完整程式、驗證；沒有 OLED 內容。
- 本機 `docs/teaching_drafts/week5_oled_supplement/week5_OLED.pdf`：22 頁，OLED 接線、掃描、Hello、按鈕人數顯示、剩餘名額練習及完整程式。
- Week 5 main 本來已有 OLED 接線、文字及倒數器，沒有重複插入 22 頁。移入的講義列為 Week 5 逐步操作補充，不增加強制進度或評分。

## 維護與公開範圍

原 week2_oled_supplement 來源搬到 week5_oled_supplement；room_counter、room_host_test.cpp、room_answer.cjs 與較早五人題封存分到 week2_answers。兩套主動閱讀入口已重新產生 PDF，不直接切割或修補 PDF。舊 30 頁合併 PDF 及相同副本移到 `_outputs/week2-split-before-20260922/` 保存，不再出現在 Week 2 正式目錄。

新來源目錄、week2Ans 與 Week 5 OLED 補充仍由 .gitignore 保護；不因搬週或更名而自動公開。主機測試腳本及教材結構檢查更新至新路徑。同步 README、索引、修訂準則與主教材解答名稱。沒有 commit、push 或 Drive 上傳；此前已發布的版本仍在 GitHub／Drive，與本次本機檔名指引不同。

## 檢查

- 三份 PDF 建置通過：Week 2 main 35 頁、week2Ans 8 頁、Week 5 OLED 22 頁。
- verify_sample.py 與兩份 verify_pdf.py 通過：完整程式一致、引用頁碼、圖片及文字邊界、未混入 OLED 的 Week 2 解答。
- Poppler 渲染兩份拆分文件全部頁面，檢視頁面縮圖與主教材第 34 頁；未見裁切、缺圖或重疊。
- 人數登記 9 組主機測試通過；OLED 基本程式與剩餘名額版本各 7 組主機測試通過。
- .ino 邏輯未改；沒有目標板重新編譯、接線、上電、上傳韌體或硬體實測。
- 教材索引、本機連結檢查與 Git 空白檢查使用既有工具，確保新路徑可達且私有教材未成為待提交檔案。

## SHA-256

- Week 2 main：`a84bd0a8bea98128cfcbe815bcad36a2e3a47989115e4387113a3a483333594f`
- week2Ans：`fbc69e99ee14a5b1105f1c379faa5abfde1752ddf2de1c23d10b0e65ca118829`
- Week 5 OLED：`9dac308258b87978427fa9fb796410cf4454f0ae63a079ad5d5d279b6832810a`
