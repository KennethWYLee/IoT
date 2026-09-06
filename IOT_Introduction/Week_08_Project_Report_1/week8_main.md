# Week 8：第一次專題報告—題目與技術可行性

日期：2026-10-28

## Unit Overview

### 教學目標

完成本次專題報告後，學生應能：

1. 為物聯網專題（IoT project）定義明確的使用者、使用情境（use context）、核心實體互動（physical interaction）與有實際用途的軟體功能。
2. 展示可重複操作的硬體片段（hardware segment），並將觀察結果連結到接線、程式與測試證據。
3. 解釋規劃中的裝置（device）、後端（backend）、資料庫（database）與行動介面（mobile interface）之間的資料流（data flow），說明各層的角色。
4. 評估材料、供電（power supply）、驅動（driver）、網路、時程與安全風險，訂定可觀察的最低驗收條件（minimum acceptance criteria）。

### 教學內容

本次專題報告從使用者需求（user need）與已測試的硬體片段（hardware segment）建立可行的專題方向。學生會把實體行為連結到規劃中的軟體用途，描述完整系統的資料流（data flow），區分必要與選配材料，並明確呈現技術風險（technical risk）。透過回饋與提問縮小範圍，將提案轉為可測試的驗收條件（acceptance criteria），而非未經驗證的功能清單。

## 本週安排

每組進行一次12–15分鐘報告、硬體片段示範與問答。本週就是期中小組成果，
占學期成績15%，不另收內容重複的
期中整合包。Week 8不要求完整成品；評量重點是已驗證片段能否支持題目、
風險是否誠實，以及後續成果是否有可觀察的驗收方式。

## 每組必帶

1. 報告前完成的題目草案：目標使用者、情境及核心互動。
2. 一個可運作的硬體片段。
3. 軟體要記錄什麼，或如何協助使用者操作。
4. 裝置、Backend、Database 與手機資料流。
5. BOM、供電／驅動風險及最低驗收條件。

題目草案須在預約報告前完成。每組在問答時接受縮題與技術可行性檢查。

## 完成檢核

- [ ] 硬體片段可現場重現。
- [ ] 軟體用途不只是顯示一個數字。
- [ ] 資料流、BOM、風險與驗收條件完整。
- [ ] 報告回饋與決議已寫入Git專案。

參考：[第一次報告準備單](../docs/course_materials/student_worksheets.md)｜[專題報告評分表](../docs/course_materials/rubrics_and_checklists.md)

<a id="practice-and-reference"></a>

## 準備、紀錄表與延伸參考

<a id="support-報告資料包"></a>

### 報告資料包

用下表索引已存在的檔案、commit、圖片、log或現場示範。`狀態`只能填「已驗證」、
「部分驗證」或「尚未驗證」；只有構想或AI產生內容時，不填成已驗證。

| 報告要求 | 證據位置／現場操作 | 狀態 | 目前限制或下一步 |
|---|---|---|---|
| 使用者、情境、核心問題與一次完整操作流程 |  |  |  |
| 可重現硬體片段、接線圖、程式與測試結果 |  |  |  |
| 軟體記錄或協助操作的具體用途 |  |  |  |
| 裝置→Backend→Database→手機資料流 |  |  |  |
| BOM中的已有、待買、選配與替代品 |  |  |  |
| 供電、驅動、網路、時間與安全風險 |  |  |  |

最低驗收條件必須能由其他人觀察或查詢，不使用「介面美觀」、「系統正常」或
「完成所有功能」等無法判定的句子。

| 最低驗收條件 | 測試起始狀態與動作 | 預期可觀察結果 | 證據形式 |
|---:|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4（如需要） |  |  |  |
| 5（如需要） |  |  |  |

<a id="support-報告回饋與決議"></a>

### 報告回饋與決議

| 決議 | 負責人 | 期限 | 驗收方法 |
|---|---|---|---|
|  |  |  |  |

未通過電壓、電流或驅動驗證的特殊零件，第一次報告前不先購買。

<a id="support-week-12課前軟體通知"></a>

### Week 12課前軟體通知

Week 12每組至少要有一台能執行MQTT broker的Windows筆電。Week 8報告後、
Week 12上課前，依[Eclipse Mosquitto官方下載頁](https://mosquitto.org/download/)
安裝Windows x64版本，並確認安裝資料夾中有`mosquitto.exe`、
`mosquitto_pub.exe`及`mosquitto_sub.exe`。本階段不要建立正式密碼或開放路由器
port；帳密、LAN限制與測試設定會在Week 12 main一起完成。

Arduino IDE的Library Manager須能搜尋到`PubSubClient`。若筆電沒有安裝權限、
安全軟體阻擋，或同組無可用Windows筆電，應在Week 8結束前告知教師以安排
等價環境；這項環境回報不是新的Week 9評量成果。

參考：[第一次報告準備單](../docs/course_materials/student_worksheets.md)｜[專題報告評分表](../docs/course_materials/rubrics_and_checklists.md)
