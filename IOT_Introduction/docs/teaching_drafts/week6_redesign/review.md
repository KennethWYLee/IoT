# Week 6 重設及檢查紀錄

日期：2026-09-17。目標課程：IoT；讀者：初學學生與同步帶做的教師。
本輪工作是教材及範例編寫，不是實體操作或發布。

## 來源與範圍

- 現行 `docs/course/1151_calendar_aligned_course_plan.md`：Week 6 是 SG90 紙指針，Week 11 才開始網路通訊。
- 既有 `docs/course_materials/week6_main.source.md`、`examples/week06_servo_pointer/week06_servo_pointer.ino`。
- `docs/hardware/hardware_state.md`：SG90 未實機驗證；四顆 1.5 V AA 與降壓板只有空載紀錄。
- `docs/teaching_drafts/week2_redesign/README.md` 與 Week 5 的來源／builder／verifier：同步操作、做完講原理、累積零件、練習下一頁接解答。
- 本 repo 及 IOT_Introduction 下未找到 PROJECT.md；沒有自行建立新的課程事實檔或課程 AGENTS。
- 查核 ESP32Servo、TowerPro SG90、TI LM2596 官方頁。網站最新版不自動取代本課固定 library 版本。

上一輪對話摘要沿用早期「Week 6 通訊」安排，已向教師更正；沒有改動現行 18 週計畫。

## 本輪修改

1. 新增 week6_redesign：來源 Markdown、46 頁 PDF、固定 A4 builder、hash manifest、verifier、程式及主機測試。
2. 前 33 頁將操作、觀察、原理解釋分頁；附錄 13 頁嵌入三份完整 .ino，不手抄第二套程式。
3. 加入無 GPIO 的數字預覽，先用 Serial 確認 0～6 與示例角度的關係；明確不是舵機測試。
4. 保留既有受限紙指針程式；延伸版本只增加 Serial +／− 換算，不移除 STOP、profile、間隔、逾時、OLED 故障與復原限制。
5. 綜合 Week 2 按鈕作 STOP、Week 5 OLED 作顯示；沒有假稱新增兩顆實體加減按鈕。
6. 第 25／26 頁概念題與解答；第 30／31 頁每次兩格改造題與解答。是形成性共讀練習，不是隱藏答案的考卷。
7. 更新 teaching_drafts/README.md 入口，不替換正式 notebook／PDF、不更動 QA、其他週次或原有範例。

未加入新的採購、評分、強制交件、車輛或雲端要求。建議教學約 145 分鐘，另留休息；延伸可依進度後移，不刪安全步驟。

## 已完成檢查

### PDF 與內容

- 46 頁均渲染；聯絡表檢視全部頁面，另放大成果圖、供電接線與改造解答。
- 第 14 頁再以 Poppler pdftoppm 獨立渲染核對。供電 GND 支線不與 signal 交叉，成果圖不以 OLED 指向舵機的箭頭暗示 OLED 控制機構。
- 固定 A4、無區塊 overflow、無缺圖、無未替換標記、無替代字元、程式附錄逐字回比原始 .ino。
- 全部頁面內容與頁尾最小間距 157.96875 CSS px；圖形示意及來源限制均保留。
- 兩組練習後均立即接解答，題目頁沒有解答程式。
- 獨立算式檢查：60 + 4×10 = 100；1000+30000=31000；兩格步進得到 2,4,6,6,4,2,0,0；從3開始 +,+,- 得5,6,4。
- hash manifest 涵蓋 Markdown、builder、三份 .ino、使用的實物照片與 PDF；文字採 LF 正規化，支援跨電腦 CRLF。

### 主機測試（替代 I/O，不是物理測試）

- 既有正式 Week 6：40 項斷言通過。
- 新增測試：步進 1／2 × OLED 1306／1315，共四組；每組 53 項新斷言及 40 項既有回歸斷言通過，合計 372 項。
- 涵蓋預覽無 GPIO 操作、0～6 映射、非法字元、缺 profile 不啟用、未準備時拒絕、上下限、奇數起點截限、999／1000 ms、實體 STOP 持續按住、故障後不續動、重新啟用歸零、30 秒逾時。
- 回歸另涵蓋 OLED ACK 失敗、attach 失敗、時間計數回繞、顯示阻塞後再檢查逾時。
- 測試使用同一份實際 sketch，只在忽略的 tmp 中代入假 GPIO、參數與輸入；並非獨立硬體證據。

### ESP32-S3 目標編譯

FQBN：`esp32:esp32:esp32s3:CDCOnBoot=default`；Arduino-ESP32 3.3.11。
ESP32Servo 3.2.1、U8g2 2.36.15 由 `_outputs/profile_compile/arduino_user/libraries` 明確選取。
沒有安裝／升級全域 library；全域原有 ESP32Servo 3.2.0 不用作此輪基準。

| 程式 | Flash bytes | 全域 RAM bytes | 結果 |
|---|---:|---:|---|
| count_preview | 273813 | 21600 | 編譯通過 |
| 既有 week06_servo_pointer | 352061 | 25400 | 編譯通過 |
| serial_pointer_counter | 352245 | 25400 | 編譯通過 |

編譯使用公開預設保護設定。步進兩格及 OLED1315 的行為測試在主機完成，沒有另外宣稱所有設定組合均已目標編譯。
沒有 Upload、沒有控制實體序列埠、沒有上電或移動致動器。

## 尚未完成與主要下一步

**優先確認指定 SG90 的課前設定及相容上電方式。** 預期產物是可追溯的實物設定表與安全接線／量測紀錄。
完成標準包含：確切版本、功能腳序、邏輯相容性、允許電壓及帶載能力、接頭與線材、脈寬及安全小範圍、啟動及停止反應。

現有 a 流程會先在外部 OFF 時輸出 signal，尚未證明指定舵機不會回灌。若不相容，應修改電氣介面或啟動策略後重測；不可把改 true、編譯成功或空載4.76V視為完成。

另外待教師審閱學生理解程度與實際上課時間。全班能否照接還取決於每組器材是否符合已確認設定。
沒有這些證據時，僅可使用預覽、斷電辨識及非實物題目，不宣稱已可直接帶做完整舵機課。

## Git 與發布

工作起點 main，已追蹤檔案無既有變更；有無關的未追蹤 examples/，保持不動。
本輪只修改 teaching_drafts 入口與新增 week6_redesign。未 stage、commit、push，未傳 Drive。
HTML、渲染圖、主機執行檔、編譯產物保持忽略；原始／生成 hash 見 build_manifest.json。
