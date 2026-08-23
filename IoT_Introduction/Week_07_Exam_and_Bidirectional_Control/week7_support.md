# Week 7支援資料

當週任務與筆試範圍見[Week 7主教材](week7_main.md)。

## 雙向控制準備

自備ESP32-S3、安全輸出、手機、Backend環境與Week 6已驗證的連線。
每筆命令必須有唯一 `command_id`，不能只以畫面顯示「已送出」當作完成。

## 命令追蹤表

| command_id | 送出時間 | ESP32收到 | 執行／拒絕 | result／ack | 手機最終狀態 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

驗收至少包含一次成功與一次拒絕或timeout，log要能用
`command_id`串起手機、Backend與ESP32的記錄。

參考：[筆試與驗收規準](../../docs/course_materials/rubrics_and_checklists.md)｜[命令格式](../../docs/course_materials/student_worksheets.md)
