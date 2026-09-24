# IoT Introduction：18週課程教材

2026-09-24 最新版：Week3 Main 為 12 頁純考卷，實作題先列作品、特色與預期結果，再提供操作驗證及最後作答；刪除器材規格頁，接線與設定細節留在 95 頁 Ans。Q1 記錄遮光／未遮光各三筆，Q2 問 raw 與電壓；基本教學及全部解答仍在 Ans。未加入分工、教師勾選或提早離開流程。教材提交 9a9a7ad 已推送 GitHub，Main／Ans PDF 已更新至原雲端檔案；Ans 不納入 Git。見[本次調整及發布紀錄](docs/lab_notes/2026-09-24-week3-opening-worksheet.md)。

2026-09-23：Week3 保留授課內容，新增「光敏＋按鈕」、「光敏＋OLED」、「光敏＋按鈕＋OLED」三個自主作品題，提供成品示意與預期結果，不提供做法或答案。OLED 僅在延伸題提前使用，Week5 正式教學不變；本機 Week3 Main 為 62 頁。見[題目與檢查紀錄](docs/lab_notes/2026-09-23-week3-extension-projects.md)。

課程名稱：IoT玩具與互動硬體設計。每週三13:30–16:15，2026-09-09至2027-01-06。

2026-09-22：本輪依 Week2 的做法整理實作週。Main 保留完整基本操作、程式與原理；
延伸練習答案獨立在本機 Ans。Week2–7、11、12、14、15 各補兩個「只改一處」的反例圖，
區分電流、訊號、軟體紀錄與實物結果。危險接法僅圖上推演，不實作。

Week2 使用正式目錄 PDF；Week3–7 使用下表重設稿 PDF，不再把舊 Notebook 當成閱讀入口。
Week11、12、14、15 使用每週 Markdown 與同名 PDF。原週目錄的 Week3–7 Notebook／PDF
保留歷史內容，不用舊匯出器覆蓋本輪稿件。報告、筆試、配分與週次安排沒有修改。

答案暫留本機 `docs/teaching_drafts/weekN_answers/`；Week2 另有正式目錄同內容副本。
OLED 維持 Week5。私有 QA、答案、執行資料均不發布。本輪尚未 commit、push 或上傳。
詳見[本輪修改與驗證紀錄](docs/lab_notes/2026-09-22-weekly-main-answers.md)。

Week 1只介紹課程與[正式材料清單](Week_01_Course_Orientation/week1_main.md#purchase-table)，不操作硬體。

Week 1 的[零件照片](Week_01_Course_Orientation/week1_main.md#equipment-photos)依品項展示外觀與不同角度。
Week 2～7、11～12、14～15的主教材開頭亦有當週器材圖集。離線閱讀請下載完整 repository，
保留共用圖片資料夾；不必另外開一份器材講義。

## 18 週導覽

| 週次 | 日期 | 主題 | 主教材（唯一入口） |
|---:|---|---|---|
| 1 | 2026-09-09 | 課程大綱、配分與中文採購清單 | [開啟 Week 1](Week_01_Course_Orientation/week1_main.md) |
| 2 | 2026-09-16 | ESP32-S3、開發環境與按鈕去抖 | [主教材 PDF](Week_02_ESP32_Hardware_Basics/week2_main.pdf) |
| 3 | 2026-09-23 | 電氣量測、ADC與室內／遮光分類 | [主教材 PDF](docs/teaching_drafts/week3_redesign/week3_main.pdf) |
| 4 | 2026-09-30 | 電阻量程、DHT11、雙感測器與蜂鳴提示 | [主教材 PDF](docs/teaching_drafts/week4_redesign/week4_main.pdf) |
| 5 | 2026-10-07 | RGB、OLED與非阻塞倒數 | [主教材 PDF](docs/teaching_drafts/week5_redesign/week5_main.pdf) |
| 6 | 2026-10-14 | SG90計數指針、供電與安全 | [主教材 PDF](docs/teaching_drafts/week6_redesign/week6_main.pdf) |
| 7 | 2026-10-21 | 紅綠燈遮光挑戰：完整本機遊戲 | [主教材 PDF](docs/teaching_drafts/week7_redesign/week7_main.pdf) |
| 8 | 2026-10-28 | 第一次專題報告：題目與可行性 | [開啟 Week 8](Week_08_Project_Report_1/week8_main.md) |
| 9 | 2026-11-04 | 教師出國／選讀，不收新成果 | [開啟 Week 9](Week_09_Self_Study/week9_main.md) |
| 10 | 2026-11-11 | 第一次個人筆試：Week 2～7 | [開啟 Week 10](Week_10_Individual_Written_Exam/week10_main.md) |
| 11 | 2026-11-18 | Wi-Fi、HTTP、JSON、Backend與WebSocket | [Markdown](Week_11_HTTP_WebSocket_Backend/week11_main.md)／[PDF](Week_11_HTTP_WebSocket_Backend/week11_main.pdf) |
| 12 | 2026-11-25 | MQTT多裝置、資料庫、歷史與log | [Markdown](Week_12_MQTT_Database_and_Logs/week12_main.md)／[PDF](Week_12_MQTT_Database_and_Logs/week12_main.pdf) |
| 13 | 2026-12-02 | 第二次專題報告：進度與修正 | [開啟 Week 13](Week_13_Project_Report_2/week13_main.md) |
| 14 | 2026-12-09 | 手機前台、權限與PWA條件 | [Markdown](Week_14_Mobile_PWA/week14_main.md)／[PDF](Week_14_Mobile_PWA/week14_main.pdf) |
| 15 | 2026-12-16 | 自動反應、安全、故障復原與重建 | [Markdown](Week_15_Automation_and_Safety/week15_main.md)／[PDF](Week_15_Automation_and_Safety/week15_main.pdf) |
| 16 | 2026-12-23 | 第二次個人筆試：Week 11、12、14、15 | [開啟 Week 16](Week_16_Integrated_Framework_Exam/week16_main.md) |
| 17 | 2026-12-30 | 第三次專題報告：期末展示與個人問答 | [開啟 Week 17](Week_17_Project_Report_3/week17_main.md) |
| 18 | 2027-01-06 | 校定期末考週，保留空白 | [空白保留檔](Week_18_Reserved/week18_main.md) |

## 新版銜接與驗證範圍

Week 3把同一批室內光／遮光資料轉為分類文字；Week 4用雙感測器與穩定遮光短鳴；Week 5加入RGB與OLED倒數；Week 6用短輕紙指針表示0～6；Week 7整合Start、綠燈加分、紅燈扣分、Finish、倒數與失敗提示。遊戲分數不是學期成績。

第8週提案、第10週第一次筆試；第9週出國不變。網路自第11週開始，第12週以同一批MQTT資料查詢SQLite與log。期末展示集中第17週，每組一次且保留每位組員問答。

文件、編譯與host檢查不能代替指定硬體驗證。新GPIO、DHT11、RGB、蜂鳴器、OLED、SG90與4AA供電須依核准profile逐項確認；詳見[本輪驗證紀錄](docs/lab_notes/2026-09-06-traffic-light-course-revision.md)及[硬體狀態](docs/hardware/hardware_state.md)。

## 教師與維護資料（不是另一套必讀講義）

- [正式18週計畫](docs/course/18_week_plan.md)
- [紅綠燈遮光挑戰完整設計](docs/course_materials/traffic_light_challenge_design.md)
- [教師課卡與材料任務](docs/course_materials/teacher_18_week_materials.md#required-hardware-activities)
- [Arduino及Backend範例](examples/README.md)
- [評分規準](docs/course_materials/rubrics_and_checklists.md)與[紀錄模板](docs/course_materials/student_worksheets.md)
- [設備圖片](docs/images/hardware/README.md)
- [歷史教材封存](docs/archive/README.md)：不是現行必讀或實機通過證據。
