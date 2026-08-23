# Week 10支援資料

實作要求見[Week 10主教材](week10_main.md)。

## Topic與payload設計表

| 用途 | Topic | 發布者 | 訂閱者 | Payload必要欄位 | Retained |
|---|---|---|---|---|---|
| Presence |  |  |  | device_id、status、timestamp |  |
| Telemetry |  |  |  | device_id、value、unit、timestamp |  |
| Command |  |  |  | device_id、command_id、action |  |
| Ack／result |  |  |  | device_id、command_id、result |  |

## 故障與隔離測試

- [ ] 裝置上線、正常送值、接收命令與回覆result。
- [ ] 使用錯誤topic時不應觸發設備。
- [ ] 重複 `command_id`不造成重複危險動作。
- [ ] 裝置離線後，手機與Backend不顯示過時狀態為當前值。
- [ ] 不同 `device_id`的命令不會互相誤控。

參考：[MQTT Topic表](../../docs/course_materials/student_worksheets.md)｜[MQTT程式](../../docs/course_materials/starter_code_snippets.md)
