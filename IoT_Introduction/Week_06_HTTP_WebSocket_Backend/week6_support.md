# Week 6支援資料

實作流程見[Week 6主教材](week6_main.md)。

## 課前確認

- 已安裝課程指定的Python版本與Backend依賴。
- 筆電與手機可連入同一區域網路。
- ESP32可產生真實按鈕或感測事件。
- ESP32已有Week 4驗證過的安全輸出、停止方式與timeout。
- Wi-Fi密碼、token與金鑰不寫入Git追蹤檔案。

## 事件證據模板

| 階段 | 要記錄的內容 |
|---|---|
| ESP32 | device_id、event_type、value、timestamp |
| HTTP | URL、method、status code與response |
| Backend | 收到時間、驗證結果與request log |
| WebSocket／手機 | 接收時間、畫面狀態與截圖 |
| Command | command_id、命令、參數、送出時間與目標裝置 |
| Result | command_id、accepted／done／error／timeout、原因與完成時間 |

故障測試要分別輸入錯誤命令、更改錯誤IP、關閉Backend與中斷Wi-Fi，每次只改一個變因。

## 命令追蹤表

| command_id | 送出時間 | ESP32收到 | 執行／拒絕 | result／ack | 手機最終狀態 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

驗收至少包含一次成功與一次拒絕或timeout。手機顯示「已送出」不代表硬體已執行，
必須以相同`command_id`串起手機、Backend與ESP32的紀錄。

參考：[範例Backend](../../examples/course_backend/README.md)｜[程式片段](../../docs/course_materials/starter_code_snippets.md)
