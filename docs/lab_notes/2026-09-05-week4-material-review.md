# Week 4教材設計與驗證紀錄

讀者：教材維護者。任務只限Week 4及直接相關設計、材料週次與導覽。
本次不commit、不push。Week 2／Week 3及其來源、程式、圖片列為唯讀保護範圍。

## 權威與衝突處理

- 現行Week 4為感測、取樣、相對校正與資料品質；教師明確將設計文件中的
  220 Ω／330 Ω量程任務從Week 3移到Week 4。Week 3的1 kΩ／10 kΩ分壓不動。
- 舊致動器Week 4兩份Markdown原樣封存於`../legacy_week4_actuators/`，供Week 5後續重整。
- 教師本次核准完整備課版含參考答案；不得稱為無答案學生版。
- DHT11實物腳位、電氣相容性及課程GPIO未核准，保留上電閘門，不猜接法。

## 內部Teaching Point對照

每列的「練習／回饋」均須在同一本Notebook呈現題目、預期答案、原因與限制。

| ID／目標 | 講解與例子 | 操作／練習 | 結果與回饋／完成條件 | 來源及驗證層級 |
|---|---|---|---|---|
| W4-R1 辨認220／330 Ω | §3四／五環、標稱與容差例子 | 找自己兩顆，換算Ω／kΩ | 標示與測值分欄；不符先斷電查標籤與接觸 | Vishay色碼；文件、計算；實物待驗 |
| W4-R2 選量程、讀超量程 | §4模擬LCD與隔離電阻節點圖 | 兩顆各測適用量程；比較更小／更大量程 | 完整顯示、量程與單位；超量程不當1 Ω | Fluke原則、A830L實拍；量程提示待驗 |
| W4-K1 控制取樣條件 | §5兩條件、時間與波動 | 室內／遮光各10筆，條件與原始log | 可重算min／max／mean／span；缺筆或移動需註明 | Espressif ADC、本課設計；文件、host、compile |
| W4-K2 建立相對門檻 | §6分離／重疊區間及方向例子 | 先算，再以兩條件程式建基準 | 門檻只在不重疊時成立；端點樣本阻擋校正 | ADC文件＋明示演算法推導；host |
| W4-K3 用新資料驗證 | §7收集與v測試、程式解釋 | 固定門檻，各收10筆獨立驗證 | 原始證據、正確／不符／無法判斷數，不用訓練資料自證 | 本課設計；host、compile；target待驗 |
| W4-D1 辨認DHT及腳位閘門 | §8原始照片、功能與實物表 | 確認PCB、VCC／DATA／GND、供電、上拉、GPIO | 未核准即停在閱讀／編譯，不猜腳序 | 實拍、hardware_state、原廠及library；實物待驗 |
| W4-D2 解釋三線與母對母 | §9功能接線及共同GND圖 | DATA母對母直連；供電公對母、測點公對公 | 起終點可追、上電前檢查、照片；不從母頭塞表筆 | 原廠DHT通訊及本課節點設計；模型；實機待驗 |
| W4-D3 讀單位與時間 | §10溫度／RH、library／完整程式、Upload | 真實模式10筆，解釋同值與間隔 | °C、%RH、時間、valid／quality／reason完整 | Adafruit 1.4.7、1.1.15與RH定義；compile、host |
| W4-Q1 區分數字／有效／可疑 | §11資料檢查流程 | 比較NaN、超範圍、突變、同值 | 保留無效記錄，不補0、不把警示當確診 | 明示本課政策；host |
| W4-Q2 注入失敗與恢復 | §12 f／r軟體注入和重新讀取 | real→injected→real各有證據 | source分開；首次恢復無跨失敗期跳變比較 | library錯誤語意＋本課注入；host，實機待驗 |
| W4-DISC 證據支持結論 | §13單一主題七題 | 觀察、預測、變因、比較、除錯、結論 | 題後有推理／常見錯誤／不能下的結論 | 本週共同操作；文件、計算 |

評量連結：本週個人實驗證據支援平常成績，感測品質與安全能力銜接現行Week 8硬體筆試
及Week 7可行性報告。不新增配分、考題或額外採購；參考答案僅限本週公開練習。

## 實際驗證紀錄

驗證日期：2026-09-05。下列項目均已實際執行，並閱讀輸出；沒有接上板卡、開啟COM埠或Upload。
本紀錄只涵蓋這次Week 4工作，不把既有Week 2／3實測當成本週實測。

### 環境與重建

- Windows PowerShell；Node.js 24.19.0、Python 3.12.14。
- Arduino CLI 1.5.1；Arduino-ESP32 3.3.11。
- FQBN：`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`。
- Adafruit DHT sensor library 1.4.7、Adafruit Unified Sensor 1.1.15。
- host測試使用MSVC C++17與stub I/O；沒有執行DHT library的真實脈衝通訊。
- Notebook schema使用nbformat 5.10.4。原runtime未安裝此套件，於忽略目錄
  `_outputs/week4_validation_deps/`隔離安裝後完成驗證，沒有改動課程或全域Python依賴。

主要重建／檢查入口如下；Node模組由本機bundled runtime的`NODE_PATH`解析。

```powershell
node scripts/build_week4_materials.cjs
node scripts/build_week4_materials.cjs --check
node scripts/verify_week4_notebook.cjs --render
python scripts/verify_week4_host.py
node scripts/verify_week2_notebook.cjs
node scripts/verify_week3_notebook.cjs
python -m py_compile scripts/verify_week4_host.py scripts/verify_course_materials.py scripts/verify_markdown_arduino.py
node --check scripts/build_week4_materials.cjs
node --check scripts/verify_week4_notebook.cjs
git diff --check
```

| 層級／檢查 | 實際結果 | 證據範圍與限制 |
|---|---|---|
| 維護來源重建及`--check` | PASS：18 cells、2支程式、12組SVG／PNG、16個圖片附件逐位元一致 | 只生成Week 4；不是任意平台的字型／渲染保證 |
| Notebook格式 | PASS：nbformat 5.10.4 schema；程式cell的execution_count=null、outputs=[] | C++由IDE執行，不宣稱Notebook kernel執行硬體 |
| Notebook內容／連結 | PASS：16圖附件與原檔一致、10個本地連結／錨點、程式來源相同、未核准GPIO閘門保留 | 七題Discussion、示例計算、節點模型檢查；不代替逐句人工審閱 |
| 課程文件檢查 | PASS：77份Markdown／Notebook、本地連結、18週結構；Week 18兩檔為空 | 呼叫既有verify_course_materials檢查邏輯，範圍是Git追蹤課程文件加本次新文件；排除使用者原有未追蹤ESP_Drone，不宣稱掃描其內容 |
| 語法 | PASS：上述3個Python檔與2個JavaScript檔 | 語法通過不代表實機通過 |
| ESP32-S3編譯 | PASS：兩支原始`.ino`，以及從Notebook擷取的兩支完整程式 | 使用既有verify_markdown_arduino的擷取及compile函式；未執行其他週全套Arduino編譯 |
| host邏輯 | PASS：46 assertions | 直接執行新sketch邏輯，ADC／Serial／DHT為stub；開啟測試用GPIO只存在忽略目錄fixture，不是公布的GPIO profile |
| 瀏覽器預覽 | PASS：Edge 1200／420 px，16圖均解碼、整頁無水平溢出；12張SVG文字未超出畫布 | 是本地Notebook風格HTML預覽，不是GitHub線上實際發布／渲染測試；寬表與程式區可個別橫向捲動 |
| 圖文人工檢視 | 已逐張檢視12張PNG、4張原始照片，以及量程／KY／DHT接線／library／Discussion／手機6張預覽 | 確認中文字、節點、紅黑表筆、條件方向、原始照片與示意圖標記；不由示意圖認定模組腳序 |
| 回歸／唯讀保護 | PASS：既有Week 2及Week 3專用檢查；99個受保護檔案SHA256與任務起點一致 | 包含兩週主教材、相關來源／程式、既有圖片及移位後的舊Week 4兩份原稿 |
| Git差異 | PASS：`git diff --check`及實際差異審閱 | Git提示LF／CRLF轉換不屬於內容錯誤；未commit、未push |

編譯輸出的數字逐項核對如下：

| Notebook程式 | 程式空間 | 全域變數 | 說明 |
|---|---:|---:|---|
| KY-018品質 | 278539 bytes／1310720 bytes（21%） | 22068 bytes／327680 bytes（6%） | 編譯配置中的程式分區與靜態RAM統計，不是16 MB Flash或8 MB PSRAM的整體使用率 |
| DHT11品質 | 280083 bytes／1310720 bytes（21%） | 22420 bytes／327680 bytes（6%） | 同上；未測執行時堆疊、heap或感測讀取 |

host涵蓋公開預設阻擋、500 ms／2500 ms等待、十筆停止、忙碌命令拒絕、兩種校正方向、
門檻等號／整數除法、接觸／重疊區間阻擋、端點、重建基準清除舊門檻、獨立驗證不重訓、
32位毫秒回繞、NaN／無限值、RH邊界、教室政策先後、突變邊界、同值、
f不呼叫感測器、r不保證成功，以及stub真實呼叫路徑重新得到有效值。
最後一項不是實體DHT11恢復證據；沒有simulation、target或physical通過宣稱。

### 來源查核與適用界限

- 完整閱讀現行AGENTS、PROJECT與教材框架；Week 2／3全部cell內容只作深度參考。
  對照本週與相鄰週課卡、正式進度、材料安排、舊Week 4兩稿及實際存在的導覽。
- 查核Espressif ADC API的raw／解析度／attenuation說明、Tools Menu及VCC-GND板卡來源；
  系列文件不自動證明這片Type-A V1.5或全班GPIO已驗證。
- 閱讀Adafruit DHT 1.4.7原始碼與相依宣告，核對2000 ms快取限制、同輪溫濕度、NaN及失敗路徑；
  ASAIR產品入口與Adafruit裸DHT元件接線文件不當成YS-31三腳載板規格。
- 色環依Vishay色碼；電阻量測隔離原則依Fluke；相對濕度依香港天文台。
  A830L原始照片能辨認旋鈕標記，不能取代確切版本手冊與實際顯示核對。
- 本冊合成數值、class／quality政策、門檻演算法與圖均明示為教學設計／示例，
  沒有捏造學生數據、腳位、原廠精度或供電測試。
- 技術來源連結集中於主教材相關段落及第16節；外部官方頁面已查閱。
  DHT實物文件與profile缺口仍保留，不以購物圖或相似模組補齊。

### 本輪發現並修正

1. 舊Week 4主題與現行進度不一致：兩份原稿原樣移至封存區，新Week 4另建單本入口。
2. 設計文件及Week 1材料攜帶表仍有W3的220／330量程任務：移至W4；
   W3既有KY電表量程、通斷、ADC與1 kΩ／10 kΩ分壓不刪減、不重做。
3. 電阻量測圖與步驟曾把紅黑測點寫反：統一為紅筆e20、黑筆e25；移除不存在的「右側錯接圖」指示。
4. 品質圖補註注入缺值的`injected_read_failed`，避免與真實`read_failed`混淆。
5. RH示例補上kPa／Pa單位換算，說明比值不因單位改寫而改變，且DHT11不是輸出壓力。
6. 舊稿搬移造成Week 5 support的一個參考連結失效：只修復該導覽，未改其教學內容。
7. host runner的Windows命令引號初次失敗：修正後重新編譯並實際跑完46項，沒有將初次失敗記成通過。

### 檔案變更清單

- 主入口：`IoT_Introduction/Week_04_Sensors_and_Data_Quality/week4_main.ipynb`，該目錄只有這一檔。
- 維護正文：`docs/course_materials/week4_main.source.md`。
- 程式：`examples/week04_ky018_quality/week04_ky018_quality.ino`、
  `examples/week04_dht11_quality/week04_dht11_quality.ino`。
- 圖檔：`docs/images/wiring/week4-`開頭的resistor-bands、meter-ranges、resistor-measurement、
  sample-window、threshold-separated、threshold-overlap、ky-path、dht-wiring、analog-digital、
  humidity、quality-flow、recovery，共12組SVG／PNG；4張既有實拍只引用、不修改。
- 建置／驗證：`scripts/build_week4_materials.cjs`、`scripts/verify_week4_notebook.cjs`、
  `scripts/verify_week4_host.py`、`scripts/tests/week4/ArduinoFake.h`、`DHT.h`、`host_checks.cpp`；
  既有`verify_course_materials.py`及`verify_markdown_arduino.py`只更新Week 4入口規則／來源位置。
- 直接相關設計與導覽：PROJECT、18_week_plan、18_week_materials_arrival_runbook、
  teacher_18_week_materials、weekly_lesson_design_framework、hardware_state、
  IoT_Introduction／course_materials／examples／scripts的README、Week 1 support材料週次，
  及Week 5 support的一個封存連結。本紀錄位於docs/lab_notes，不加入週次目錄。
- 舊稿保留：`docs/archive/week4_actuators/week4_main.md`、`week4_support.md`原樣搬移，另加README。
- 使用者起點已有上述部分設計／導覽修改及未追蹤`ESP_Drone/`；保留既有修改，未處理ESP_Drone。

## 目前交付判定

目前文件、圖解、來源同步、計算、編譯、host及本地呈現範圍內，未發現未處理的阻擋性問題。
Week 2／3教材與相關受保護檔案沒有改動，其他週主題、評量及採購數量沒有改變。
本冊可供備課與檢閱，但下列實機條件未完成前不能稱為已完成全班實機發布。
本次停止於Week 4，不自動繼續Week 5，也沒有commit／push。

## 實機待驗

- 220 Ω／330 Ω實物標示、容差；A830L及學生電表量程單位、超量程畫面、單人操作。
- 同批板卡公開ADC profile；KY-018固定室內／遮光的建基準及獨立驗證紀錄。
- DHT11模組實際PCB／腳序、供電範圍、DATA上拉位置與阻值、3.3 V邏輯相容性、GPIO。
- DHT11供電／閒置電位核對、真實Upload及Serial、注入後取消並恢復真實讀取。
- 初學者依本冊完成的可用性試教；文件／host不能替代上述實機證據。
