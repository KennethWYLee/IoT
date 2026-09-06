# Week 16支援資料

第二次個人筆試的範圍見[Week 16主教材](week16_main.md)。

## 應試準備

本週不攜帶或操作ESP32-S3、感測器、致動器與外部電源。考前依正式公告確認
考場、座位、可攜物品與應試規定。

## 複習主線

```text
sensor signal
  -> ESP32 event
  -> Wi-Fi / HTTP or MQTT
  -> Backend validation
  -> Database / structured log
  -> WebSocket
  -> phone state

phone command
  -> HTTP POST / Backend authorization
  -> HTTP polling or MQTT command delivery
  -> ESP32 validation and physical action
  -> HTTP result or MQTT acknowledgement
  -> Backend / Database
  -> WebSocket
  -> phone result
```

學生應能根據資料流圖、JSON、topic、程式片段、log或錯誤畫面，判斷每一層的
責任、成功證據與第一個檢查位置。正式試題與答案不放在公開repository中。

參考：[第二次筆試藍圖](../../docs/course_materials/rubrics_and_checklists.md)
