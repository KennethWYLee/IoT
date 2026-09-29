# 2026-09-29：Ans 精簡後的 GitHub 與雲端發布

## 授權與分工

教師在每週程式另放資料夾後要求 commit、push 及更新雲端。本輪沿用已確認的分工：GitHub 提供學生 Main 與公開維護資料，Ans 不加入 Git；雲端更新各週 Main／Ans PDF。教師前一則「程式也先不用上傳」仍有效，本輪不傳每週 `programs` 或其他課堂程式檔。

## 雲端結果

- Week2～7、11、12、14、15 的 10 份 Ans 已原地更新。Week3 Ans 現為 86 頁，前 13 頁依 Main 的考卷順序與格式直接填答，其後詳解；完整程式另留本機。
- 10 份 Main 與現有雲端內容相同，不重複上傳、不另建副本。
- 20 份 Main／Ans 均重新讀取 metadata、下載原始 PDF，逐份核對 SHA-256 與檔案大小，全部與本機一致。
- 全部檔案的 ID、名稱、資料夾與未分享狀態保持不變。沒有上傳 ZIP、程式、密碼或其他工作檔。
- 逐檔結果見[雲端核對清單](2026-09-29-program-files-cloud-publication.json)；[雲端資料夾](https://drive.google.com/drive/folders/1Cp_mL9PXGe8LBNbtSN4btu1WdQkp9pta)及原連結均沿用。

## GitHub 範圍與檢查

- 提交前 fetch 後，`HEAD` 與 `origin/main` 均為 `2bb30c7`，沒有遠端待合併提交。`gh repo view` 確認 `KennethWYLee/IoT` 為 PUBLIC，未改變可見度。
- 本輪提交 Ans 分工所需的公開維護工具、檢查、教學修訂準則、入口與操作紀錄。維護工具不包含課堂完整程式或私有答案；本機來源仍由既有 Git 忽略規則排除。
- 明列提交檔案，不使用全工作樹 stage。原有 Week4 `.ino` 狀態及根目錄未追蹤 `examples/` 不加入；不修改它們、不重寫歷史或強制推送。
- 發布前重新核對 100 個本機程式／附檔與來源一致、引用存在及 Git 忽略。全課程結構與連結檢查通過，Ans 的渲染與版面檢查沿用[同版本修訂紀錄](2026-09-29-weekly-program-folders.md)，本輪未編修 PDF。
- Main PDF 未改，沒有新增韌體執行、服務啟動或硬體測試。

## 目前限制

雲端 Ans 會指向對應程式檔案，但程式依教師要求暫留本機，尚未隨 PDF 提供。GitHub 也不含這些新程式資料夾；發布 PDF 不代表程式已發布。前一輪「僅本機」紀錄保留當時狀態，本紀錄是後續授權的 PDF 發布結果。
