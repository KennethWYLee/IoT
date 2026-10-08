# IoT 教材發布紀錄

日期：2026-10-08。教師授權 commit、push、更新教師雲端，並將 GitHub repository 改為 private。

## GitHub

- 教材修訂 commit `ed6729ca2c841f191fd9d8265dc4ee92e808dfe4` 已推送至 `KennethWYLee/IoT` 的 `main`。
- GitHub API 主分支與本機一致；584 個追蹤檔案的 Git blob 雜湊全部相符。
- repository 已改為 private，登入後讀回 `private=true`、`visibility=private`；未登入的 API 查詢回應 404。
- 沒有擴張 Ans 或程式提交範圍。原有 program/week2、week3、week4 及 Week5 的 Q1/Q2 保留；其他週新韌體與私有 Ans 維護來源仍未加入 Git。
- 使用既有提交作者身分的單次 Git 設定，沒有更動全域或 repository 的作者設定。

## 教師雲端

- PDF 位於 `codex/課堂教材/IoT`；程式位於其 `IOT_Introduction/program`，依週次與 sketch 資料夾保存。
- 27 份 PDF、兩份教材維護說明、program 根目錄 README，以及 139 個每週程式與支援檔，合計 169 檔，均下載原始內容並與本機 SHA-256 比對相符。
- 19 份既有教材檔案及 44 個既有程式/支援檔需要覆寫；另補 6 個缺檔及一個 Week14 HTTP sketch 資料夾。未變內容沒有重傳。
- 既有檔案沿用原 ID；每檔核對資料夾位置與權限。沒有修改 Drive 分享權限、刪除檔案或移動封存資料。
- Week4 原版與 `_withClaude` 修訂版分開保留；私有 PROJECT、實際憑證、執行資料庫及核對暫存檔沒有上傳。

## 範圍與限制

本輪完整修訂範圍仍是 Week6、7、11、12、14、15、2、3、1；不將全課連結檢查說成全部十八週完整重寫。Week4、5 保留先前的修訂。

本次只做發布與原始檔比對，沒有重新編譯、操作硬體、進行 LAN/手機或學生首次操作測試。修訂與測試範圍見 `2026-10-07-sequential-week-revisions.md`。主要下一步仍是只依新 Week3 Ans、從空麵包板完成 Q1 的實物核對。

詳細本機證據：工作區 `_outputs/publication_20261008` 的 GitHub、Drive 及原始內容雜湊紀錄。沒有把 GitHub 密碼/token 或 Drive 下載簽名網址寫入核對檔案。
