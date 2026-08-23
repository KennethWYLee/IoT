# Week 10：MQTT 與多裝置

日期：2026-11-11

## 準備環境

一組至少一塊 ESP32-S3、MQTT broker、筆電測試 client、感測器與一項
安全輸出。兩組可交換訂閱以模擬多裝置。

## 教材內容

- Broker、publish、subscribe、topic、payload、retained message。
- Presence、telemetry、command、ack 與 device_id。
- Topic 命名、權限邊界及避免不同裝置互相誤控。

## 課堂實作

完成裝置 online／offline、telemetry、帶 command_id 的命令及 ack，並測試
錯誤 topic、重複命令與裝置離線。

## 完成檢核

- [ ] Topic 與 JSON payload 文件完成。
- [ ] Presence、telemetry、command、ack 可示範。
- [ ] 不同 device_id 不會互相誤控。

參考：[MQTT Topic 表](../../docs/course_materials/student_worksheets.md)｜[MQTT 程式](../../docs/course_materials/starter_code_snippets.md)
