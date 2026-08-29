# IoT Introduction：18 週課程教材

課程名稱：**IoT 玩具與互動硬體設計**<br>
上課時間：每週三 13:30-16:15<br>
課程期間：2026-09-09 至 2027-01-06

本資料夾依 18 週實際授課順序整理。學生教材正逐週轉換成單一入口
`main.ipynb`：核心說明、操作、程式、練習與支援附錄在同一本notebook中。
Week 2已完成轉換；其他週次在逐週檢查前暫時保留原有main／support雙檔。

> Week 1 做課程介紹、配分、作品與[正式學生材料清單](Week_01_Course_Orientation/week1_support.md#一學生材料採購總表)
> 說明，不操作硬體。硬體從Week 2開始。

## 18 週導覽

| 週次 | 日期 | 主題 | 主教材 | 支援資料 |
|---:|---|---|---|---|
| 1 | 2026-09-09 | 課程介紹、配分與作品 | [main](Week_01_Course_Orientation/week1_main.md) | [support](Week_01_Course_Orientation/week1_support.md) |
| 2 | 2026-09-16 | ESP32-S3、開發環境與安全接線 | [main.ipynb](Week_02_ESP32_Hardware_Basics/main.ipynb) | 已整合於notebook附錄 |
| 3 | 2026-09-23 | 感測器與輸入品質 | [main](Week_03_Sensors_Input_Quality/week3_main.md) | [support](Week_03_Sensors_Input_Quality/week3_support.md) |
| 4 | 2026-09-30 | 致動器、機構與供電 | [main](Week_04_Actuators_and_Power/week4_main.md) | [support](Week_04_Actuators_and_Power/week4_support.md) |
| 5 | 2026-10-07 | 單機互動作品 | [main](Week_05_Standalone_Interaction/week5_main.md) | [support](Week_05_Standalone_Interaction/week5_support.md) |
| 6 | 2026-10-14 | HTTP、WebSocket、Backend與手機雙向控制 | [main](Week_06_HTTP_WebSocket_Backend/week6_main.md) | [support](Week_06_HTTP_WebSocket_Backend/week6_support.md) |
| 7 | 2026-10-21 | 第一次個人筆試：硬體接線、電氣概念與安全 | [main](Week_07_Individual_Written_Exam/week7_main.md) | [support](Week_07_Individual_Written_Exam/week7_support.md) |
| 8 | 2026-10-28 | 第一次專題報告：題目與技術可行性 | [main](Week_08_Project_Report_1/week8_main.md) | [support](Week_08_Project_Report_1/week8_support.md) |
| 9 | 2026-11-04 | 教師出國／選讀自學 | [main](Week_09_Self_Study/week9_main.md) | [support](Week_09_Self_Study/week9_support.md) |
| 10 | 2026-11-11 | MQTT 與多裝置 | [main](Week_10_MQTT_Multi_Device/week10_main.md) | [support](Week_10_MQTT_Multi_Device/week10_support.md) |
| 11 | 2026-11-18 | Database 與 structured log | [main](Week_11_Database_and_Logs/week11_main.md) | [support](Week_11_Database_and_Logs/week11_support.md) |
| 12 | 2026-11-25 | 第二次專題報告：進度檢查、回饋與修正計畫 | [main](Week_12_Project_Report_2/week12_main.md) | [support](Week_12_Project_Report_2/week12_support.md) |
| 13 | 2026-12-02 | 手機前台與 PWA | [main](Week_13_Mobile_PWA/week13_main.md) | [support](Week_13_Mobile_PWA/week13_support.md) |
| 14 | 2026-12-09 | 自動反應、安全、故障復原與重建 | [main](Week_14_Automation_and_Safety/week14_main.md) | [support](Week_14_Automation_and_Safety/week14_support.md) |
| 15 | 2026-12-16 | 第二次個人筆試：網路通訊與軟硬整合架構 | [main](Week_15_Integrated_Framework_Exam/week15_main.md) | [support](Week_15_Integrated_Framework_Exam/week15_support.md) |
| 16 | 2026-12-23 | 第三次專題報告：期末展示與個人問答 | [main](Week_16_Project_Report_3/week16_main.md) | [support](Week_16_Project_Report_3/week16_support.md) |
| 17 | 2026-12-30 | 第三次專題報告：期末展示與個人問答 | [main](Week_17_Project_Report_3/week17_main.md) | [support](Week_17_Project_Report_3/week17_support.md) |
| 18 | 2027-01-06 | 校定期末考週：保留空白 | [main](Week_18_Reserved/week18_main.md) | [support](Week_18_Reserved/week18_support.md) |

完整規則與評量以[正式 18 週課程規劃](../docs/18_week_plan.md)為準。

## 共用教材

- [學生任務單與 Lab Notebook](../docs/course_materials/student_worksheets.md)
- [ESP32-S3 程式片段](../docs/course_materials/starter_code_snippets.md)
- [評分規準與安全檢核](../docs/course_materials/rubrics_and_checklists.md)
- [教師用 18 週課卡](../docs/course_materials/teacher_18_week_materials.md)
- [範例 Backend](../examples/course_backend/README.md)
- [設備圖片目錄](../docs/images/hardware/README.md)

每位學生的共同必備器材，以 Week 1 support 的正式學生材料清單為準。教師
現有器材只作課前實機驗證與示範，不提供學生借用或故障替換；第 8 週之後
只有選擇特殊專題功能的小組，才依通過安全審查的 BOM 自行增加選配材料。
