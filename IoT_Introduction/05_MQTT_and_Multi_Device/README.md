# 05：MQTT 與多裝置

## 對應週次

Week 10。

## 教材內容

- Broker、client、publish、subscribe、topic 與 payload。
- QoS、retained message、Last Will 的基本用途。
- Presence、telemetry、command、ack 與 device_id。
- 多裝置命名規則、權限邊界與防止誤控。

## 建議 Topic

```text
devices/{device_id}/status
devices/{device_id}/telemetry
devices/{device_id}/command
devices/{device_id}/ack
```

## 實作

裝置上線發布 online，定期送 telemetry，接收帶 command_id 的命令並回傳
ack；測試錯誤 topic、重複命令、裝置離線及兩個 device_id 同時存在。

## 完成檢核

- [ ] Topic 與 JSON payload 文件完成。
- [ ] online／offline、telemetry、command、ack 可示範。
- [ ] 不同裝置不會互相誤控。
- [ ] 重複命令有冪等或拒絕策略。

參考：[MQTT Topic 表](../../docs/course_materials/student_worksheets.md)｜[MQTT 程式片段](../../docs/course_materials/starter_code_snippets.md)
