# Week 06：HTTP、WebSocket、第一個 Backend與手機雙向控制

日期：2026-10-14

## 準備器材與環境

ESP32-S3、按鈕或感測器、USB 線、筆電、同一區域網路、Python 範例
Backend 與手機瀏覽器。

## 教材內容

- Wi-Fi、IP、HTTP request／response、JSON event 與 WebSocket 即時推送。
- device_id、event_type、value、timestamp、command_id、result及request／error log。
- Wi-Fi 密碼不可提交到 Git。

## 課堂實作

1. 啟動範例 Backend 並以瀏覽器驗證 API。
2. ESP32 以 HTTP POST 傳送真實事件。
3. Backend 留下 log，再以 WebSocket 更新手機畫面。
4. 手機送出帶有`command_id`的安全命令，Backend轉送至ESP32。
5. ESP32依目前狀態執行或拒絕命令，回傳accepted、done、error或timeout。
6. 測試錯誤 IP、錯誤命令、Backend 關閉與 Wi-Fi 中斷。

## 完成檢核

- [ ] 真實硬體事件進入 Backend。
- [ ] 手機能即時看到事件。
- [ ] 一筆手機命令可由`command_id`追蹤至ESP32執行、拒絕或timeout結果。
- [ ] log 可分辨成功與失敗發生在哪一層。

參考：[範例 Backend](../../examples/course_backend/README.md)｜[HTTP／WebSocket 程式](../../docs/course_materials/starter_code_snippets.md)
