# Week2／Week3 程式發布

## 範圍

2026-10-06，教師在 PDF 發布完成後進一步要求 Week2、Week3 code 都放到 GitHub。本次新增最新 `program/week2`，更新 `program/week3`，保留同名 Arduino 資料夾及 `.ino`，不用 ZIP。

Week2 五支：Hello、按鈕狀態、計數、ON／OFF、碼表。Week3 四支：OLED 固定文字、光線觀測、快照、可暫停遮光計數。Week3 光線觀測包含現行 Q4 的 TEST／LIVE 與 CHECK；README 對應最新 Main／Ans 題號。

以各週私有 `programs.sources.json` 指定的維護來源匯出，公開複本不作新的維護來源。匯出器正規化文字換行為 LF，manifest 記錄內容 SHA-256；未改程式行為或硬體設定。

公開邊界只增加 Week2 程式及更新 Week3；Week2～4 Ans PDF 與全部 Main 保持前次版本。其他週程式、答案維護來源／測試、實際憑證與個人資料仍排除。雲端前次已更新，本次不重傳、不改分享權限，也不操作硬體。

## 核對

發布前核對匯出複本、同名資料夾、manifest、題號、檔案入口、全課連結及 Git 排除範圍。只提交本輪程式與必要的 README、發布規則和紀錄；原有 Week4 範例修改、Windows 測試筆記及根目錄 `examples/` 保留，不提交或撤銷。

程式沿用前次修訂的編譯與替代 I/O 證據，本次不宣稱重編或實測。相關限制見[實作修訂紀錄](2026-10-06-practical-first-weeks.md)。Week3 預設 `PROFILE_CONFIRMED=false`；依 Ans 核對實物後才啟用，不能以公開程式代替接線確認。

Git 起點 `290261f`，內容提交 `04cc2fc66dcf8074bb7460fbbb0563847870e929` 已推送。fetch、遠端分支及 GitHub API 確認版本一致，repository 為 Public。經 GitHub API 下載九支 `.ino`，正規化換行後逐支核對 SHA-256 與維護來源一致。

匯出器與答案程式檢查通過；全課結構／連結檢查涵蓋 18 週、159 份文件。Week1、Week4 程式公開檢查依授權規則拒絕。換行檢查發現 Week2 ON／OFF、碼表來源原有的檔尾空白行；保留原樣，不將此項記為通過。這不改變程式行為，也不代表本次重新編譯或實測。
