# 實作教材發布紀錄

## 授權與範圍

2026-10-06，教師在完成全學期實作順序修訂後要求 commit、push 與雲端更新，並進一步批准 GitHub 公開 Week1～4 Main／Ans，但本次不加入程式。此決定取代較早的 Week3-only 解答規則。

GitHub 使用既有 Public repository `KennethWYLee/IoT`、`main` 分支。所有現行 Main 保留開放；Week1 的安裝教學直接在 Main，沒有獨立 Ans。新增 Week2、Week4 Ans PDF，更新 Week3 Ans PDF。答案維護來源、測試與其他週 Ans 仍忽略。本次不新增或更新 `program`；既有 Week3 程式保留在上次發布版本，最新程式以教師雲端為準。不改評分、週次、硬體設定或分享權限。

## 教材與驗證

本輪內容、271 頁 PDF 渲染及編譯／替代 I/O 證據見[修訂紀錄](2026-10-06-practical-first-weeks.md)。本次發布不重建 PDF；公開 Week2、Week4 Ans 為已核對 PDF 的原週目錄分發複本，保留維護來源與排版。公開邊界檢查分別允許 Week2～4 Ans PDF 和既有 Week3 程式，不把 PDF 授權擴張為程式授權。

## 雲端同步

PDF 原地更新至 `codex/課堂教材/IoT`，保留 25 個檔案 ID。25 份 PDF 已回讀核對 SHA-256，與本機相同；更新前後父目錄與分享權限相同。

完整教師程式已同步至 `IoT/IOT_Introduction/program`，按 Week1～7、Week11、Week12、Week14、Week15 分類。共 132 個檔案，包括 34 支 `.ino`、每週 README／manifest、開檔說明及既有電腦端工具；逐檔回讀 SHA-256 與本機相同，父目錄及權限核對通過。不使用 ZIP，不上傳實際憑證、資料庫或執行紀錄。現行程式目錄清單沒有未列入的檔案。

Week4 舊 `environment_compare_oled`、`environment_compare_serial` 已原 ID 移至同一教師目錄下的 `program_archive_20261006`，移出現行 program，保留原權限，可復原。沒有刪除檔案。

## Git 狀態

起點為 `79ab859`，fetch 後本機與 `origin/main` 沒有分歧。教材提交 `6a882ad1462d41c823317ff2828ea8e870cb4d48` 已推送 `origin/main`；`ls-remote`、fetch 與 GitHub commit API 均確認相同版本，repository 仍為 Public。

十八份現行公開 PDF（十五份 Main、Week2～4 三份 Ans）在 Git 遠端物件中逐檔核對 SHA-256，與本機及雲端一致；GitHub API 的完整 tree 另核對相同 blob ID。Week1 Main 與 Week2 Main 也以 GitHub 官方 API 的原始檔下載核對；大型檔較慢，未把全部 PDF 都宣稱為直接下載回讀。API tree 的 638 個項目沒有其他週 Ans 或答案維護目錄。`program` 與發布起點完全相同，本次沒有程式新增或更新。

全課十八週、157 份 Markdown／Notebook 與本機連結檢查、十週程式來源／複本／引用／忽略規則檢查，以及 staged paths 和 `git diff --cached --check` 通過。提交檢查曾發現原週目錄 Week2 Ans 的舊複本，已換成核對過的十二頁新版後才提交。Week4 公開複本也是十二頁。

原有 `week04_dual_sensor_alarm.ino`、Windows 測試筆記與根目錄 `examples/` 未提交；前兩份原有檔案的 SHA-256 未改。本機 `program/week3` 的本輪修訂也依新指示留在工作目錄，不撤銷或推送。此紀錄在教材推送核對後補記；不重寫原提交歷史。

完整機器清單與回讀資料留在忽略的 `_outputs/practical_publication_20261006/`。紀錄不包含下載權杖、實際憑證或學生資料。

## 限制與下一步

未操作、上傳韌體或實測硬體。軟體檢查不能代替 DHT 腳序、OLED、RGB 電流與舵機帶載安全的實物確認。仍先完成 Week4 Q1 的實物接線與讀值，再測 Q4 兩份不同檔名的真實 CSV、裝置統計回傳與斷線提示。課堂版本與本機編譯版本的差異見修訂紀錄。
