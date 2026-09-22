# 2026-09-22 Week3 Main／Ans 整理

## 範圍與版本

- 工作 repository：IoT；分支 main。起點 a68b98f，本機已有 Week2／Week5 分離及導覽的未提交修改，保留不覆寫。
- 依教師本次完整 prompt，沿用 Week2 操作後解釋原理的方式，修改 Week3 自己的電表／光敏／ADC 主題。
- Main 維護來源：docs/teaching_drafts/week3_redesign/week3_main.md、build.cjs、button_light_capture.ino。
- Main PDF 54 頁；Ans PDF 10 頁。Ans Markdown、完整程式及測試位於本機 week3_answers，.gitignore 排除整個目錄。
- 原 Week_03_Electrical_Measurement_and_ADC notebook／PDF 保留；導覽改連本次重設稿。未重建舊版 notebook 或替換舊目錄。
- Week2、Week5、其他週教材、課綱、評分、報告及採購決策未在本輪修改。

## 實際修改

1. 四份基本程式由同一份 .ino 嵌入對應操作段落；按鈕程式依完整函式分頁。檔案準備表保留完整路徑。
2. PDF 基本程式連結改為本冊頁面跳轉，不連到仍可能是前一輪內容的 GitHub 程式。
3. 移除歷史量測比較、延後解釋的教學旁白；明確區分預期結果與實測欄。
4. 換分類程式時補上斷電、拆板外接線、空板上傳與恢復接線。
5. 單筆取樣只做按壓辨識及一次 ADC 記錄；不再含批次、筆數常數及後續排程。保留去抖／放開再按，並在 Main 教，不假設 Week2 已教過。
6. 補按鈕＋KY 的接點圖、資訊流、兩條電流回路與單次按壓原理。
7. 觀念題及三筆取樣完整解答分離到 Ans；Main 明列延伸需求及輸出格式，不提供排程演算法。
8. 同步 README、導覽、建置器及 Week3 主機測試；Week4／5 的測試分支未改。

## 檢查證據

- Main／Ans 建置：HTML 幾何檢查通過，圖片載入、主文字區高度及左右界線均通過。
- 所有 54 + 10 頁以 Poppler 輸出 PNG；逐頁聯絡表已查看，另放大接線、電流、練習與程式頁。未見裁切、重疊、缺圖或缺字。
- verify.py：來源與 PDF SHA-256、嵌入完整程式逐字一致、頁面順序、A4 頁型、佔位符、答案分離與分壓算式檢查通過。頁碼對應保存在 build_manifest.json。另確認 PDF 四個程式命名目的地分別跳到 p12、24、30、43；分類連結跨行產生兩個 annotation，但指向相同頁面。
- 主機單筆範例：預設停用 6 項、啟用假 I/O 12 項 assertion 通過。
- 本機答案主機測試：預設停用 3、正常取樣 25、同腳位停用 3、錯誤筆數停用 3、觀念題分類 9 項 assertion 通過。涵蓋彈跳、開機壓住、長按、忙碌不排隊、提早放開、時間延遲及計時回繞；不是實際硬體。
- 五支程式以 Arduino-ESP32 3.3.11、ESP32-S3、16 MB Flash、OPI PSRAM 編譯通過。依講義完整選單設定的第二輪也全部通過：PartitionScheme=app3M_fat9M_16MB、CDCOnBoot=default、USBMode=hwcdc、UploadMode=default、FlashMode=qio、UploadSpeed=115200。這些命令只有 compile，沒有指定序列埠或 Upload。
- verify_course_materials.py：128 份文件與本機連結通過；verify_intro_navigation.cjs：35 個既有明確導覽連結通過。此全課檢查仍含保留的舊 Week3 notebook，本次新版內容檢查以 week3_redesign/verify.py 為準。
- git diff --check 通過；只有既有 CRLF 轉換提示。git check-ignore 確認答案 PDF、來源程式及測試被排除。

## 官方文件與限制

ADC 原始值、12-bit、S3 衰減範圍及 GPIO 介面重新核對 Espressif 官方文件：
- https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html
- https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html

板型、接點與 KY 接法依既有課堂實物／量測紀錄。沒有從商品名稱推定所有模組方向相同。未新增教師口頭確認或全班板卡通過紀錄。

尚待：指定實物的 GPIO4 ADC、KY 腳序／分壓方向與電壓、按鈕方向與實際去抖效果；實際 Serial 操作與學生跟做。模擬時鐘及 ADC 假數值不證明 USB 時序、真實感測精度或每批器材都適用。

## Git 與發布

本次沒有 stage、commit、push、雲端上傳、韌體上傳、開啟 Serial 裝置或操作硬體。Ans 與其程式不放入公開資料夾或 GitHub。既有公開歷史版本未刪除、未改寫 Git 歷史；不把本次分離宣稱為撤回所有歷史解答。

下一步先閱讀 Main p39–52，確認單筆範例與延伸題的難度分工；完成標準是教師能從接線、預期結果及原理清楚辨認兩者差異。實物檢查項目仍須課前確認。
