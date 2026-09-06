# Week 2／Week 3：零基礎閱讀與量測判讀修訂

日期：2026-09-05。這是教材維護與驗證紀錄，不是新實機量測紀錄。

## 任務範圍與版本界線

依使用者要求，先修正V／I／R、電表數字與圖解，再檢查兩週從第一次接觸到實驗
完成的說明順序。沿用PROJECT.md已核准的單一main notebook與完整備課版（含答案）。
不改週次、採購、分組、評量或正式GPIO發布狀態，不新增電流檔、短路或第三種光線實驗。
本次未commit、未push；使用者既有未追蹤目錄ESP_Drone/未修改。

## 修改檔案與生成關係

- Week 2：`IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb`。
- Week 3：`IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb`。
- `IOT_Introduction/scripts/build_week2_figures.cjs`重製原有電表讀值圖；`build_week3_figures.cjs`新增
  單電阻／並聯電壓表圖與LCD量程判讀圖，調整照片附件隨正文位置移動。
- `IOT_Introduction/docs/images/wiring/`內對應SVG／PNG，以及notebook內同內容PNG附件。
- `IOT_Introduction/docs/images/hardware/actual/a830l-multimeter-actual-front.jpg`從原有Week 3附件
  無損抽出，用於兩週；與原附件逐位元組相同，沒有生成、去背或補繪實物細節。
- 兩個notebook驗證腳本與`IOT_Introduction/scripts/README.md`同步更新。
- `2026-08-29-a830l-button-continuity-validation.md`訂正編輯時擅加的歷史讀值單位，
  保留原始回報與尚未確認的範圍，沒有改造實測資料。

## 逐項教學檢查與處理

| 區塊 | 初學者容易卡住之處 | 本次處理與驗收依據 |
|---|---|---|
| W2安全／profile | 腳位表尚未定義就要求照profile接線 | 第三節先解釋用途表及-1安全閘門；不發布候選GPIO |
| W2板卡、IDE、Serial與記憶體 | PCB、模組、晶片、COM、Compile與Upload混為一談 | 保留現有元件圖、資料方向圖、分母與版本解釋；逐段對照完整程式與log |
| W2上拉、GND與閉合路徑 | 尚未學單位就先算45 kΩ支路電流 | 前段先講路徑與輸入判斷；45 kΩ與功率推導移至同一notebook第十三節補充 |
| W2電表實物與數字 | 不知道看哪一端旋鈕、200是什麼、單獨1與0.x怎麼讀 | 補原始A830L實拍、位置說明、五欄完整句；重畫示意LCD，保留蜂鳴與Ω差別 |
| W2按鈕與麵包板 | 先看錯誤／比較照片就直接照做；重複要求安裝接線 | 在圖片前標明同組測點及未壓入對孔；安裝只做一次，接線集中於步驟7 |
| W2斷電檢查 | 表筆接c22等句子容易被理解為把粗表筆插孔 | 指定e22與e27暫時延長端，再斷電改至e20；結束取下暫時線、保留主接線 |
| W2去抖Discussion | raw、stable、等待起點、時間單位與log如何保存 | 保留單主題三練習、時間軸與解答；補每輪純文字存檔、核對首尾與不補造缺失事件 |
| W3 V／I／R | 只背公式，不能把已知數字放進正確位置 | 先定義三個問題與單位，用同一顆1 kΩ兩端3.0 V求3 mA；先單電阻再串聯分壓 |
| W3電表與主電路 | 以為所有電流必須先進電表，或V檔直接量到A | 新圖分開主要電阻路徑與並聯電表路徑；標記量測電壓與計算電流、模型限制 |
| W3電表量程 | 把0.6 Ω、0.6 kΩ、0.60 V當同一個數字 | 新增五欄案例與示意LCD；600 Ω換算、左側單獨1及有效1.00分開 |
| W3 KY-018三組電阻 | 第六節要找S／M／−，實拍卻在第十節 | 原始正面／焊接面照片及A／S1／R1說明移到6.2；未確認腳位不准供電 |
| W2→W3銜接 | 沿用第22列GND或留下舊按鈕；量完才提延長線 | 明列拆舊線、空板起始狀態、22→3與20→12座標轉換；供電前先準備e3／e6／e12 |
| W3 GPIO→S→ADC | 舊輸出測點或舊程式可能與S混用 | 明列拆a12與e12；保留先量S、預備ADC母頭留空、更換程式後斷電接ADC的順序 |
| W3分壓、ADC、Discussion與固定電阻練習 | 把電壓當raw、raw當lux、模型答案當實測 | 保留共同零點圖、完整分壓推導、1k／10k交換圖與答案；核對來源、欄位、孔位與計算 |
| 收尾、照片與資料 | 理論資料、歷史回報與現在實測失去界線 | 完成條件加入完整讀值判讀；歷史不明數字不補Ω；新增圖明示模型，原照片不修改 |

## 實際驗證

以下層次分開記錄；腳本只檢查明列斷言，不等於證明每位學生都能獨立操作。

### 文件、圖像與模型

- 兩個build腳本重建後，以`--check`核對SVG／PNG／附件一致，通過。
- `node IOT_Introduction/scripts/verify_week2_notebook.cjs --render`：14個PNG／JPEG附件可解碼，
  無遺失／孤立附件；三份公開程式與examples一致，-1閘門及空outputs保留。
- `node IOT_Introduction/scripts/verify_week3_notebook.cjs --render`：12個PNG／JPEG附件可解碼，
  無遺失／孤立附件；兩份公開程式與examples一致，照片移位與原始位元組比對通過。
- 電表單位、歐姆定律、分壓比例、breadboard理想節點、取樣時間與資料範圍斷言通過。
- 去抖JavaScript模型涵蓋0／10／30／100 ms、短按、放開間隙、持續狀態、門檻、
  輪詢遺漏及32-bit回繞；通過。這不是Arduino韌體執行或實體彈跳波形驗證。
- Edge本機HTML預覽：Week 2檢查1280／420 px，Week 3檢查1200／420 px；
  無頁面橫向溢出，寬表格與程式碼可獨立捲動。SVG文字未超出viewBox。
- 人工檢視新的單電阻圖、LCD圖、重製W2電表圖、原始電表照片及關鍵上拉／節點圖，
  檢查文字、連線、顏色、實拍與示意界線；亦檢閱章內HTML預覽。
- `python IOT_Introduction/scripts/verify_course_materials.py`檢查各週結構及本機連結，通過。
- 檢閱本次實際Git差異；`git diff --check`在交付前重新執行。

### 編譯

環境：Windows、Arduino CLI 1.5.1、Espressif Arduino core 3.3.11；
FQBN：`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`。

`node IOT_Introduction/scripts/verify_week2_notebook.cjs --compile`與兩個Week 3獨立CLI compile均成功：

| Sketch | Program bytes | 靜態RAM bytes |
|---|---:|---:|
| week02_serial_basics | 278843 | 22068 |
| week02_button_input | 304448 | 22592 |
| week02_button_debounce_lab | 304664 | 22600 |
| week02_board_check | 279475 | 22076 |
| week03_gpio_voltage_cycle | 278523 | 22068 |
| week03_ky018_raw | 278539 | 22068 |

本次摘要Program Maximum為1310720 bytes、RAM Maximum為327680 bytes。
這些是本次編譯配置下的結果，不覆寫教材用於教學判讀的歷史摘要，不宣稱Flash
整顆容量只有這麼大。未變更sketch邏輯；所有候選／公開GPIO發布條件維持原狀。

## 尚未驗證與教學判斷

- 未Upload、未開啟Serial／COM、未操作實體電路；沒有新增target或physical test。
- 單人延長端固定的便利性、實物型號差異、正式GPIO profile及1k／10k實作仍須依
  教師實測與核准；程式可編譯、圖片可讀不能取代它們。
- A830L精確蜂鳴門檻、精度與同版本完整說明書仍未補齊；沒有捏造校正或容許誤差。
- 沒有重新開啟GitHub測試遠端notebook renderer；本次是離線附件與本機HTML檢查。
- 尚未進行新的一輪零基礎學生試讀／試做，不能宣稱所有學生可在150分鐘獨立完成。
  150分鐘是一般週設計基準，並非本次已量得的完成時間；完整備課版也包含深入補充
  與參考答案，不要求在課堂第一次閱讀時逐段推導所有補充內容。
- 在本次文件、圖像與編譯範圍內，已修正找到的操作順序、單位、照片用途與狀態銜接
  缺口。下一次試教宜觀察學生能否先說出檔位／測點／單位，再解釋讀值；若仍需口頭
  提示，記錄卡住的原句繼續修訂，不靠增加實驗次數代替理解。
