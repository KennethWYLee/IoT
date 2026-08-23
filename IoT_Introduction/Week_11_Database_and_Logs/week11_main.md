# Week 11：Database 與 structured log

日期：2026-11-18

## 教材內容

- 即時狀態、歷史事件、命令及錯誤紀錄的差異。
- timestamp、device_id、event_type、value、command_id、result 等欄位。
- 歷史查詢 API、structured log、操作統計與錯誤統計。
- log 不記錄密碼、token 或不必要個資。

## 課堂實作

1. 將真實裝置事件寫入 Database。
2. 建立依裝置、時間或事件類型查詢的歷史 API。
3. 統計至少一種操作與一種錯誤。
4. 製造一次失敗並用 log 還原原因。

## 完成檢核

- [ ] 資料表及欄位用途文件完成。
- [ ] 歷史 API 回傳真實資料。
- [ ] 一次失敗可由 structured log 解釋。

參考：[Database 與 log 設計](../../docs/course_materials/student_worksheets.md)｜[範例 Backend](../../examples/course_backend/README.md)
