# Week 03：感測器與輸入品質

日期：2026-09-23

## 準備器材

ESP32-S3；DHT11、HC-SR501、KY-018、HC-SR04 任選兩種；OLED、麵包板、
杜邦線及萬用電表。

## 教材內容

- 數位、類比與時序型輸入。
- 取樣頻率、有效範圍、校正、雜訊、去抖及無效值。
- DHT11 讀取失敗、PIR 暖機、光敏門檻及超音波 timeout。

## 課堂實作

每組測試兩種輸入，在正常、邊界與異常條件下重複量測，定義有效範圍與
更新頻率，再把數值及狀態顯示在 Serial 或 OLED。

## 完成檢核

- [ ] 兩種輸入都有接線表與重複讀值。
- [ ] 正常、邊界及異常測試完成。
- [ ] 程式會拒絕或標記無效值。
- [ ] Lab Notebook 記錄一次誤判與修正。

參考：[感測品質測試](../../docs/course_materials/student_worksheets.md)｜[感測驗證程式](../../docs/course_materials/starter_code_snippets.md)
