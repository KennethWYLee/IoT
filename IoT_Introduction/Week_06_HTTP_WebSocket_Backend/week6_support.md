# Week 6支援資料

實作流程見[Week 6主教材](week6_main.md)。

## 課前確認

- 已安裝課程指定的Python版本與Backend依賴。
- 筆電與手機可連入同一區域網路。
- ESP32可產生真實按鈕或感測事件。
- Wi-Fi密碼、token與金鑰不寫入Git追蹤檔案。

## 事件證據模板

| 階段 | 要記錄的內容 |
|---|---|
| ESP32 | device_id、event_type、value、timestamp |
| HTTP | URL、method、status code與response |
| Backend | 收到時間、驗證結果與request log |
| WebSocket／手機 | 接收時間、畫面狀態與截圖 |

故障測試要分別更改錯誤IP、關閉Backend與中斷Wi-Fi，每次只改一個變因。

參考：[範例Backend](../../examples/course_backend/README.md)｜[程式片段](../../docs/course_materials/starter_code_snippets.md)
