# Week 5支援資料

操作順序與驗收條件見[Week 5主教材](week5_main.md)。

## 課前準備

攜帶Week 2～4已驗證的ESP32-S3、按鈕、KY-018、KY-016、KY-012、
SG90、4AA電池盒、麵包板與杜邦線。不在這週同時更換腳位、供電與library。

## 狀態表模板

| 狀態 | 進入條件 | 輸出行為 | 離開條件 | 最大停留時間 |
|---|---|---|---|---|
| IDLE |  |  |  |  |
| READY |  |  |  |  |
| ACTIVE |  |  |  |  |
| RESULT |  |  |  |  |
| ERROR |  |  |  |  |

## 驗收證據

- [ ] 三次正常流程的狀態、結果與經過時間。
- [ ] 一次感測異常或timeout，並證明致動輸出已停止。
- [ ] 斷網後仍可完成整個單機互動。
- [ ] 整理Week 6將傳送的事件欄位。

參考：[單機狀態表](../../docs/course_materials/student_worksheets.md)｜[狀態機範例](../../docs/course_materials/starter_code_snippets.md)
