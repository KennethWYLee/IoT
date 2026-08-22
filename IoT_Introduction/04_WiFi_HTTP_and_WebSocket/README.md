# 04：Wi-Fi、HTTP 與 WebSocket

## 對應週次

Week 6 裝置開始連網，Week 7 完成手機到裝置的雙向控制。

## 教材內容

- Wi-Fi、IP、port、HTTP request／response 與 JSON event。
- WebSocket 長連線及即時推送，和 HTTP 的使用時機差異。
- 裝置事件：device_id、event_type、value、unit、timestamp。
- 裝置命令：command_id、action、parameters、result／ack／timeout。
- Wi-Fi 密碼與 token 不可提交到 Git。

## 實作路線

1. 先啟動 Backend，再由 ESP32 以 HTTP POST 傳送真實事件。
2. Backend 記錄 request／error log，並以 WebSocket 更新手機。
3. 手機送命令，Backend 記錄並派送給 ESP32。
4. ESP32 執行或拒絕，回傳可對應 command_id 的結果。

## 故障測試

- 錯誤 IP、Wi-Fi 斷線、Backend 關閉、錯誤 JSON、裝置 timeout。
- 依序檢查 Serial、網路、Server log、WebSocket 與畫面，不混在一起猜。

## 完成檢核

- [ ] 真實硬體事件能在手機即時出現。
- [ ] 一項手機命令有 success、failure 或 timeout 結果。
- [ ] log 可串起 request、command 與 result。

參考：[HTTP／WebSocket 程式片段](../../docs/course_materials/starter_code_snippets.md)｜[事件與命令格式](../../docs/course_materials/student_worksheets.md)
