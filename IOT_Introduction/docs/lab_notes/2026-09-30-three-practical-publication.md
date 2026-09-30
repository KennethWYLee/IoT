# 三件作品版本的發布與核對

## 授權與範圍

教師在本機修訂完成後明確要求 commit、push，確認雲端與 GitHub 是目前要使用的版本。
本次發布 Week2～7 的三件實作作品與一題觀念；內容與先前本機驗證見 [修訂紀錄](2026-09-30-three-practical-works.md)。
不改考試配分，不操作硬體，不提交其他工作留下的範例程式或 Windows 安全設定紀錄。

使用一個 Public GitHub repository；所有現行 Main 開放。
目前只有 Week3 Ans PDF 與 program/week3 已獲准開放；其他週由教師在上課途中指定開放。
一般 commit、push 或更新雲端不是其他週答案的開放授權。
`.gitignore` 保留其他週 Ans／程式及所有答案維護來源，指定開放時才提交該週 PDF 與 program 複本。
忽略規則不會刪除曾經提交的 Git 歷史；本次沒有改寫歷史或清除舊範例。

## 雲端結果

PDF 位於 [codex／課堂教材／IoT](https://drive.google.com/drive/folders/1Cp_mL9PXGe8LBNbtSN4btu1WdQkp9pta)。
更新 Week2～7 的 12 份 Main／Ans，保留原檔案 ID 與分享設定。
連同未修改週次，共 25 份現行 PDF 下載回讀後 SHA256 與本機完全相同。
Week13、17、18 原有文字入口維持不變，沒有為了發布新增 PDF。

程式位於 [IoT／IOT_Introduction／program](https://drive.google.com/drive/folders/1C-W4qDARTYn5Bq2fCDitJrpt5KTEvuO3)。
Week1～7 共 26 支目前使用的 `.ino` 按週次與同名 Arduino 資料夾存放；全部下載回讀核對 SHA256。
其中 Week2～7 有 25 支，包括 18 件作品、Week4 三支額外顯示版本與四支準備工具，不是新增 25 題作業。
Week4 的三件作品均有 OLED／Serial Monitor 兩版；Week3 增加可暫停遮光計數器。
教師完整雲端副本不表示已提供學生存取；本次沒有更改分享權限。

四個被取代的作品程式資料夾與三個舊 ZIP 移到 [封存資料夾](https://drive.google.com/drive/folders/1EDvAhPQmdUx3D10K-sLLFF6NHcNebOaW)。
這是保留 ID 的可恢復移動，不是刪除；目前 program 入口不再混列舊 ZIP 或被取代程式。

## 檢查與限制

全課程結構與連結檢查通過：18 週、154 個 Markdown／notebook（含本紀錄）；入門導覽 40 個本機連結通過。
Week2～7 六個程式套件來源／複本檢查通過。Week2～7 的 12 份 PDF 共 83 頁已在內容修訂時逐頁渲染檢查。
本次只發布已驗證版本，沒有重新修改題目、程式邏輯或 PDF。
GitHub API 確認 `KennethWYLee/IoT` 的 `private=false`、`visibility=public`、預設分支 `main`。
提交前核對公開檔案清單與忽略規則，推送後再核對遠端 SHA、Main／Week3 Ans 的 PDF 雜湊及公開程式複本。
完整雲端回讀證據保存在本機 `_outputs/three_projects_publication_20260930/`，不包含公開檔案之外的自動開放。

編譯、主機模擬與硬體實測不是同一種證據；本次未上傳韌體、操作序列埠或驅動舵機。
課前仍優先用實物確認 Week4 Q1 的空板接線、DHT 讀值及顯示／失敗提示，完成標準沿用修訂紀錄。

## GitHub 完成證據

教材提交 [`df23cb3`](https://github.com/KennethWYLee/IoT/commit/df23cb33d0fb37c7e809cb596ad24a6c00499bba) 已成功推到 `origin/main`。
`git ls-remote`、重新 fetch 的 `origin/main` 與 GitHub commit API 均回傳相同完整 SHA。
遠端 15 份現行 Main PDF 與 Week3 Ans PDF 的 SHA256 全部符合本機版本；四支 Week3 公開程式符合維護來源（Git 文字換行正規化後）。
公開現行 `program` 只有 Week3；其他週 Ans PDF、答案維護來源與程式沒有因本次發布新增到公開清單。
各週原有文字入口、公開導覽、雲端 25 份 PDF、26 支程式及封存位置核對完成。
Git 初次提交因本機沒有姓名／信箱設定而未成立；改用 repository 既有提交者的單次命令設定後成功，沒有修改全域設定。
無關的 Week4 範例修改、根目錄 examples 與 Windows 主機檢查紀錄保留原狀，不提交。
