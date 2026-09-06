# IoT Introduction：18週課程教材

課程名稱：IoT玩具與互動硬體設計。每週三13:30–16:15，2026-09-09至2027-01-06。

每週只開一份主教材，不必另外找support。Week 2～7使用Notebook，其他週使用Markdown；
必要說明、準備事項、表格、操作與延伸均在當週同一份文件。
Week 2～7為完整備課版（含參考解答）。Week 18只保留空白檔案。

Week 1只介紹課程與[正式材料清單](Week_01_Course_Orientation/week1_main.md#purchase-table)，不操作硬體。

## 18 週導覽

| 週次 | 日期 | 主題 | 主教材（唯一入口） |
|---:|---|---|---|
| 1 | 2026-09-09 | 課程大綱、配分與中文採購清單 | [開啟 Week 1](Week_01_Course_Orientation/week1_main.md) |
| 2 | 2026-09-16 | ESP32-S3、開發環境與按鈕去抖 | [開啟 Week 2](Week_02_ESP32_Hardware_Basics/week2_main.ipynb) |
| 3 | 2026-09-23 | 電氣量測、ADC與室內／遮光分類 | [開啟 Week 3](Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb) |
| 4 | 2026-09-30 | 電阻量程、DHT11、雙感測器與蜂鳴提示 | [開啟 Week 4](Week_04_Sensors_and_Data_Quality/week4_main.ipynb) |
| 5 | 2026-10-07 | RGB、OLED與非阻塞倒數 | [開啟 Week 5](Week_05_RGB_OLED_Countdown/week5_main.ipynb) |
| 6 | 2026-10-14 | SG90計數指針、供電與安全 | [開啟 Week 6](Week_06_Servo_Pointer/week6_main.ipynb) |
| 7 | 2026-10-21 | 紅綠燈遮光挑戰：完整本機遊戲 | [開啟 Week 7](Week_07_Traffic_Light_Challenge/week7_main.ipynb) |
| 8 | 2026-10-28 | 第一次專題報告：題目與可行性 | [開啟 Week 8](Week_08_Project_Report_1/week8_main.md) |
| 9 | 2026-11-04 | 教師出國／選讀，不收新成果 | [開啟 Week 9](Week_09_Self_Study/week9_main.md) |
| 10 | 2026-11-11 | 第一次個人筆試：Week 2～7 | [開啟 Week 10](Week_10_Individual_Written_Exam/week10_main.md) |
| 11 | 2026-11-18 | Wi-Fi、HTTP、JSON、Backend與WebSocket | [開啟 Week 11](Week_11_HTTP_WebSocket_Backend/week11_main.md) |
| 12 | 2026-11-25 | MQTT多裝置、資料庫、歷史與log | [開啟 Week 12](Week_12_MQTT_Database_and_Logs/week12_main.md) |
| 13 | 2026-12-02 | 第二次專題報告：進度與修正 | [開啟 Week 13](Week_13_Project_Report_2/week13_main.md) |
| 14 | 2026-12-09 | 手機前台、權限與PWA條件 | [開啟 Week 14](Week_14_Mobile_PWA/week14_main.md) |
| 15 | 2026-12-16 | 自動反應、安全、故障復原與重建 | [開啟 Week 15](Week_15_Automation_and_Safety/week15_main.md) |
| 16 | 2026-12-23 | 第二次個人筆試：Week 11、12、14、15 | [開啟 Week 16](Week_16_Integrated_Framework_Exam/week16_main.md) |
| 17 | 2026-12-30 | 第三次專題報告：期末展示與個人問答 | [開啟 Week 17](Week_17_Project_Report_3/week17_main.md) |
| 18 | 2027-01-06 | 校定期末考週，保留空白 | [空白保留檔](Week_18_Reserved/week18_main.md) |

## 新版銜接與驗證範圍

Week 3把同一批室內光／遮光資料轉為分類文字；Week 4用雙感測器與穩定遮光短鳴；Week 5加入RGB與OLED倒數；Week 6用短輕紙指針表示0～6；Week 7整合Start、綠燈加分、紅燈扣分、Finish、倒數與失敗提示。遊戲分數不是學期成績。

第8週提案、第10週第一次筆試；第9週出國不變。網路自第11週開始，第12週以同一批MQTT資料查詢SQLite與log。期末展示集中第17週，每組一次且保留每位組員問答。

文件、編譯與host檢查不能代替指定硬體驗證。新GPIO、DHT11、RGB、蜂鳴器、OLED、SG90與4AA供電須依核准profile逐項確認；詳見[本輪驗證紀錄](docs/lab_notes/2026-09-06-traffic-light-course-revision.md)及[硬體狀態](docs/hardware/hardware_state.md)。

## 教師與維護資料（不是另一套必讀講義）

- [正式18週計畫](../18_week_plan.md)
- [紅綠燈遮光挑戰完整設計](../traffic_light_challenge_design.md)
- [教師課卡與材料任務](../teacher_18_week_materials.md#required-hardware-activities)
- [Arduino及Backend範例](examples/README.md)
- [評分規準](docs/course_materials/rubrics_and_checklists.md)與[紀錄模板](docs/course_materials/student_worksheets.md)
- [設備圖片](docs/images/hardware/README.md)
- [歷史教材封存](docs/archive/README.md)：不是現行必讀或實機通過證據。
