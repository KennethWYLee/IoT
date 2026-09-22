# 2026-09-22：Main 提交與 Main／Ans PDF 雲端更新

## 教師授權及範圍

教師本次要求 commit and push：各週 Main 放 GitHub，各週 Main 及 Ans PDF 上傳既有課堂教材雲端資料夾。
此決定取代上一輪「暫不發布」的限制；不代表授權把 Ans 來源或 PDF 加入公開 Git repository。

本次涵蓋 Week2、3、4、5、6、7、11、12、14、15 的 10 份 Main 與 10 份 Ans。
其他週維持既有安排；未另製作報告週、筆試週的答案文件。

## Git 提交範圍

- Main PDF、維護來源、基本範例及必要的產生器／檢查器。
- 課程導覽、修訂準則、驗證紀錄與答案忽略規則。
- Ans PDF、答案程式、私有測試、帳密、執行資料不加入 Git。
- 根目錄既有未追蹤的 examples/ 不在本次提交範圍。
- 開始時 fetch origin 成功，HEAD 與 origin/main 均為 a68b98f119b93c07f1ad338114a46a3d2daac4eb；沒有覆蓋本機或改寫遠端歷史。

## Google Drive 結果

20 份 PDF 已上傳至教師指定的既有資料夾；10 份 Main 原檔更新、保留 file ID 與原連結，
10 份 Ans 新增。檔名沿用 IoT_ 前綴，形式為 IoT_weekN_main.pdf 與 IoT_weekNAns.pdf。
未刪除其他課程檔案，也沒有改動分享權限。

每份檔案均經 connector 完成上傳後，再讀 metadata 核對名稱、application/pdf、父資料夾及位元組數。
本機 PDF SHA-256 與前一輪驗證版本相同；metadata 工具未回傳雲端 checksum，
因此不把檔案大小一致說成遠端位元組雜湊一致。
Drive 檔案識別與回讀證據保存在本機忽略路徑
`_outputs/2026-09-22-main-ans-drive-publication.json`，不把答案下載連結寫進公開教材。

## 教材驗證

本次只發布已驗證 PDF，未修改教材內容或重新排版，也沒有操作實體硬體。
驗證與版本清單見 [本輪教材紀錄](2026-09-22-weekly-main-answers.md) 及
[逐頁檢查](2026-09-22-weekly-main-answers/page_checks.md)。
前面的階段紀錄保留當時的頁數與未發布狀態；本次發布以本紀錄及上述逐頁版本清單為準。
