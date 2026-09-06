# Week 8支援資料

第一次專題報告要求見[Week 8主教材](week8_main.md)。

## 報告資料包

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

## 報告回饋與決議

| 決議 | 負責人 | 期限 | 驗收方法 |
|---|---|---|---|
|  |  |  |  |

未通過電壓、電流或驅動驗證的特殊零件，第一次報告前不先購買。

## Week 12課前軟體通知

Week 12每組至少要有一台能執行MQTT broker的Windows筆電。Week 8報告後、
Week 12上課前，依[Eclipse Mosquitto官方下載頁](https://mosquitto.org/download/)
安裝Windows x64版本，並確認安裝資料夾中有`mosquitto.exe`、
`mosquitto_pub.exe`及`mosquitto_sub.exe`。本階段不要建立正式密碼或開放路由器
port；帳密、LAN限制與測試設定會在Week 12 main一起完成。

Arduino IDE的Library Manager須能搜尋到`PubSubClient`。若筆電沒有安裝權限、
安全軟體阻擋，或同組無可用Windows筆電，應在Week 8結束前告知教師以安排
等價環境；這項環境回報不是新的Week 9評量成果。

參考：[第一次報告準備單](../../docs/course_materials/student_worksheets.md)｜[專題報告評分表](../../docs/course_materials/rubrics_and_checklists.md)
