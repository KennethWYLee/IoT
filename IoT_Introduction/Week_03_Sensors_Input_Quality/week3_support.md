# Week 3支援資料

操作順序與驗收條件見[Week 3主教材](week3_main.md)。

## 課前準備

- ESP32-S3、KY-018、DHT11、麵包板、杜邦線與USB資料線。
- Arduino IDE可完成Upload與Serial Monitor讀取。
- 不上電拍攝模組正反面，核對腳位絲印後才接線。

## 證據紀錄

| 測試 | 應保留的證據 |
|---|---|
| KY-018明暗測試 | 接線照、重複讀值、取樣間隔與光線條件 |
| DHT11正常測試 | 溫度、濕度、單位、時間與有效狀態 |
| 故障與恢復 | 失敗前後Serial log、檢查步驟與恢復結果 |

讀值異常時先檢查供電、GND、訊號腳與程式腳位是否一致，
再檢查取樣間隔與library回傳值；不用刪除異常讀值的方式伪裝正常。

參考：[學生實驗表](../../docs/course_materials/student_worksheets.md)｜[感測程式片段](../../docs/course_materials/starter_code_snippets.md)
