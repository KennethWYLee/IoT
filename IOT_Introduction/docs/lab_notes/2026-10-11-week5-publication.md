# Week5 發布紀錄

日期：2026-10-11。教師授權 commit、push、更新教師雲端；GitHub 放 Main、Ans 與 Q1／Q2 程式，雲端放教材及四題完整程式。

## GitHub 提交範圍

- Week5 Main 7 頁、Ans 13 頁，正式週目錄與維護輸出的 PDF 一致。
- `program/week5` 只保留 Q1 `desk_status/desk_status.ino`、Q2 `focus_countdown/focus_countdown.ino`，以及 README、manifest；Q2 程式內容原已是最新版。
- 同步 Week5 Main 維護來源、題目索引、課程計畫中的 Week5 描述與修訂紀錄。沒有變更課程日曆日期、配分或其他週題目。
- Q3／Q4 程式、私有 Ans 維護來源、生成器、測試、封存與執行資料不加入 Git。保留原有其他週未提交修改。
- repository 維持 private；本次不變更 GitHub 或 Drive 存取權限。「納入 GitHub」不代表任何人都能開啟。

## 教師雲端

- Main／Ans 沿用 `codex/課堂教材/IoT` 中原檔案；程式沿用 `IOT_Introduction/program/week5` 的四個同名 Arduino 資料夾。
- 兩份 PDF、四支 `.ino`、START_HERE、README、manifest 共 9 檔，已逐一下載原始內容，SHA-256 與本機相符。
- 更新 7 個有變動的檔案；Q2、Q4 程式未變，仍重新下載核對。沒有新增重複檔案、刪除舊資料或上傳 ZIP。
- 原檔案 ID、名稱、資料夾與 owner-only 分享權限均未改變。

## 檢查與限制

發布前重新核對 PDF、程式來源、配套檔與 Q1／Q2 匯出的雜湊；改稿的 14 組主機測試／472 個斷言、10 組 ESP32-S3 編譯及 20 頁目視檢查仍對應同一版本。全課 18 週、175 份文件的結構與本機連結檢查通過。詳見[修訂紀錄](2026-10-11-week5-single-button.md)。本次沒有重新編譯、呼叫其他模型、操作硬體或上傳韌體。

發布證據另存本機被忽略的 `IoT/_outputs/week5_publication_20261011`。Git 提交編號以本檔的 Git 歷史為準；推送後另核對遠端 main、GitHub 檔案雜湊與程式釋出範圍，不把 commit 當成 push 成功。

下一步仍是只依新版 Ans、從空麵包板實做 Q1：確認 RGB 電氣條件、OLED 控制器、短按換色及長按關閉，再依序做 Q2～Q4。軟體與排版檢查不能替代實物驗證。
