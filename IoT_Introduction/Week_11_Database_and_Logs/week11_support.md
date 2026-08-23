# Week 11支援資料

實作要求見[Week 11主教材](week11_main.md)。

## 欄位設計表

| 欄位 | 型態 | 來源 | 用途 | 可否為空 |
|---|---|---|---|---|
| timestamp |  |  | 時間範圍查詢 |  |
| device_id |  |  | 區分裝置 |  |
| event_type |  |  | 區分事件 |  |
| value／unit |  |  | 保存感測值 |  |
| command_id |  |  | 串接命令與結果 |  |
| result／error |  |  | 記錄執行結果 |  |

## 驗收證據

保留schema、migration或建表步驟、真實事件入庫紀錄、歷史API response、
一組操作統計、一組錯誤統計，以及一次依structured log完成的故障追蹤。
不將密碼、token或不必要的個人資料寫入Database與log。

參考：[資料庫工作表](../../docs/course_materials/student_worksheets.md)｜[範例Backend](../../examples/course_backend/README.md)
