# Week 12支援資料

實作要求見[Week 12主教材](week12_main.md)。

## 手機核心流程表

| 步驟 | 使用者動作 | 畫面回饋 | 後端／裝置證據 |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

## 介面狀態檢查

- [ ] loading時不誤顯示舊資料為當前狀態。
- [ ] empty能區分「尚無資料」與「讀取失敗」。
- [ ] pending命令有 `command_id`，並會進入success、failure或timeout。
- [ ] offline時危險操作不被當作已執行。
- [ ] 手機不需縮放即可完成核心流程。

參考：[手機流程表](../../docs/course_materials/student_worksheets.md)｜[範例頁面](../../examples/course_backend/static/index.html)
