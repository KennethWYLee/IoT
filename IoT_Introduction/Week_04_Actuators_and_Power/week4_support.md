# Week 4支援資料

操作順序與驗收條件見[Week 4主教材](week4_main.md)。

## 課前準備

- ESP32-S3、KY-016、KY-012、SG90、4AA帶開關電池盒、AA電池、麵包板與杜邦線。
- 電池盒安全轉接端子、斜口鉗與剝線鉗。
- 先由教師確認電池、轉接與共地方案；未確認前不裝電池。

## 上電前檢查

- [ ] 訊號、外部電源正極、負極與GND已標示。
- [ ] 舵機供電不由ESP32的3.3V腳承擔。
- [ ] ESP32與外部電源已共地，且無裸線短路風險。
- [ ] 電池盒開關保持OFF，教師檢查後才開啟。

## 證據紀錄

保留接線圖、上電前照片、空載與動作電壓、正常命令、拒絕命令、
timeout及重啟後安全狀態的Serial log。

參考：[致動器測試表](../../docs/course_materials/student_worksheets.md)｜[舵機安全程式](../../docs/course_materials/starter_code_snippets.md)
