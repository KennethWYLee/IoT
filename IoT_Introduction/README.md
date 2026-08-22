# IoT Introduction：主題式教材入口

課程名稱：**IoT 玩具與互動硬體設計**<br>
上課時間：每週三 13:30-16:15<br>
課程期間：2026-09-09 至 2027-01-06

本資料夾依「主題」而不是週次整理。學生可在同一個主題內連續查閱概念、
器材、程式、實作與檢核；未來即使調整授課週次，也不必搬動教材。

## 主題教材

| 編號 | 主題 | 內容 |
|---:|---|---|
| 00 | [課程與評量](00_Course_and_Assessment/README.md) | 課程定位、配分、規則與重要評量 |
| 01 | [ESP32 與安全接線](01_ESP32_and_Safe_Wiring/README.md) | 開發環境、GPIO、量測、安全與設備索引 |
| 02 | [感測器與資料品質](02_Sensors_and_Data_Quality/README.md) | DHT11、PIR、光敏、超音波、校正與異常值 |
| 03 | [致動器、供電與狀態機](03_Actuators_Power_and_State_Machines/README.md) | LED、蜂鳴器、舵機、馬達、外部供電與單機互動 |
| 04 | [Wi-Fi、HTTP 與 WebSocket](04_WiFi_HTTP_and_WebSocket/README.md) | 事件上傳、即時更新、手機命令與 ack |
| 05 | [MQTT 與多裝置](05_MQTT_and_Multi_Device/README.md) | Broker、Topic、Presence、Command 與 Ack |
| 06 | [Backend、Database 與 Logs](06_Backend_Database_and_Logs/README.md) | API、歷史資料、structured log 與分析 |
| 07 | [手機 Web 與 PWA](07_Mobile_Web_and_PWA/README.md) | Responsive UI、即時／歷史／操作與離線狀態 |
| 08 | [作品設計與進度檢查](08_Project_Design_and_Checkpoints/README.md) | 構想、可行性訪談、BOM、兩次檢查 |
| 09 | [測試、部署與展示](09_Testing_Deployment_and_Demo/README.md) | 故障注入、重建、版本凍結與期末展示 |
| 10 | [IoT 與機器人進階](10_Advanced_IoT_and_Robotics/README.md) | 雲端、進階 MQTT、Flutter、ROS 2、Gazebo、Nav2 |

## 18 週到主題教材對照

| 週次 | 日期 | 課堂進度 | 使用主題 |
|---:|---|---|---|
| 1 | 09-09 | 課程介紹、配分、作品與安全責任；不操作硬體 | 00、08 |
| 2 | 09-16 | ESP32-S3、Arduino IDE、上傳、Serial、安全接線 | 01 |
| 3 | 09-23 | 感測器、有效範圍、校正、去抖與雜訊 | 02 |
| 4 | 09-30 | 致動器、PWM、外部供電、共地與安全停止 | 03 |
| 5 | 10-07 | 單機互動、狀態機、reset 與 fail-safe | 03 |
| 6 | 10-14 | Wi-Fi、HTTP、JSON、WebSocket、第一個 Backend | 04、06 |
| 7 | 10-21 | 個人筆試、雙向控制、題目工作坊 | 00、04、08 |
| 8 | 10-28 | 題目與技術可行性訪談 | 08 |
| 9 | 11-04 | 教師出國；不收新成果，選讀與整理回饋 | 08 |
| 10 | 11-11 | MQTT、多裝置、Topic、Presence、Command／Ack | 05 |
| 11 | 11-18 | Database、歷史 API、structured log 與分析 | 06 |
| 12 | 11-25 | Responsive Web／PWA、手機使用流程與權限 | 07 |
| 13 | 12-02 | 期末作品進度檢查一：真實資料端到端 | 08 |
| 14 | 12-09 | 自動反應、安全狀態與復原 | 03、09 |
| 15 | 12-16 | 期末作品進度檢查二：非開發者操作 | 08、09 |
| 16 | 12-23 | 故障注入、重新部署、彩排與版本凍結 | 09 |
| 17 | 12-30 | 期末作品展示與個人問答 | 09 |
| 18 | 01-06 | 進階自學，不新增評量 | 10 |

完整日期與評量仍以[正式 18 週課程規劃](../docs/18_week_plan.md)為準。

## 共用文件

- [學生任務單與 Lab Notebook](../docs/course_materials/student_worksheets.md)
- [ESP32-S3 程式片段](../docs/course_materials/starter_code_snippets.md)
- [評分規準與安全檢核](../docs/course_materials/rubrics_and_checklists.md)
- [教師用 18 週課卡](../docs/course_materials/teacher_18_week_materials.md)
- [可執行的範例 Backend](../examples/course_backend/README.md)

器材數量以教師示範與小組輪用為原則，不代表每位學生都必須購買一套。
