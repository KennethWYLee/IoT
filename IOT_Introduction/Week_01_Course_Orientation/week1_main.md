# Week 1: Course Overview and Getting Started with Arduino and ESP32

Date: September 9, 2026<br>
Course: Internet of Things

Week 1 introduces purchasing and prepares the computer to compile an ESP32 program.
Students have no hardware this week. Install Arduino IDE and the ESP32 package,
then open, save, modify and compile Hello. First upload and hardware operation
begin in Week 2. The objectives below are semester-end abilities, not first-lesson requirements.

### 本週先想清楚的問題

先看下方作品示意，回答：使用者做什麼、作品應有什麼反應、你會觀察什麼來確認它真的發生？這是課堂討論，不另外繳交。了解課程安排後，依[第一次操作](#week-2-preclass-setup)完成軟體設定。

________________________________________________________________

________________________________________________________________

實作週的 Main 提供作品要求、預期結果、驗證方式與作答空間；完整教學與解答另列 Ans。Week 1 的安裝與設定步驟直接保留在本講義。Week 8 改為一次實作考，第一次報告移至 Week 10，Week 16 為一般實作課；兩次筆試取消。

**本週做到：** 安裝 Arduino IDE 與 ESP32 套件、選對板型，開啟並儲存 Hello，改一行文字後重新編譯成功。全班不接板、不找 Port、不裝裝置驅動、不上傳、不看實機 Serial 輸出。編譯成功不表示程式已在板上執行。

先看作品用途及採購清單，再直接做[第 7 節安裝與編譯](#week-2-preclass-setup)。全學期要求、零件照片與歷史購物圖片供查閱，不必第一堂逐頁理解。

[課程大綱](#course-schedule)｜[配分](#assessment)｜[中文採購清單](#purchase-table)｜[零件照片](#equipment-photos)｜[參考預算](#purchase-budget)｜[每組電表](#group-measurement-tool)｜[Arduino 與 ESP32 第一次操作](#week-2-preclass-setup)｜[進入 Week 2 前](#w1-readiness)｜[蝦皮購買圖片](#shopee-purchase-images)

## 1. Week 1 Overview

### 先看會做出的互動，再認識零件

想像一個放在桌上的光線顯示器：遮住光敏模組，OLED 上的目前值改變；按一下按鈕，保存當時的值。移開遮擋後，目前值繼續改變，保存值要等下次按下才更新。

| 操作 | OLED 上要觀察的結果 |
|---|---|
| 改變照到光敏模組的光線 | 目前值改變；不預設數字一定變大或變小 |
| 按一下按鈕，再改變光線 | 保存值保留按下時的數字，目前值繼續更新 |

*這是作品行為示意，不是接線圖，也不是已完成實機驗證的成品。Week 1 沒有硬體，不組裝或通電。*

先找三件事：哪個零件接收動作、程式要保存什麼、哪個零件讓人看見結果。
Week 2 從一顆按鈕開始，Week 3 加入光敏與 OLED，之後每週保留成果再增加一部分；Week 7 用已學材料整合練習。
了解用途後，再依[中文採購清單](#purchase-table)準備每組一套；課程與評量如下。

### 教學目標

完成本課程後，學生應能：

1. 整合 ESP32-S3、實體輸入與輸出、網路、後端（Backend）、資料庫（Database）及手機介面，建立全端物聯網系統（Full-stack IoT System）。
2. 依供電、接地與訊號規格安全接線，並在故障時停止設備。
3. 使用 HTTP、WebSocket 與 MQTT 等通訊方式傳送資料與命令，保存及查詢紀錄。
4. 以量測、測試與紀錄解釋系統行為，排查問題並提供可重建的文件。

### 教學內容

課程從按鈕與 ESP32-S3 開始，逐週加入光敏與 OLED、DHT 溫濕度、RGB 狀態燈及舵機紙指針。保留已成功的接線與操作，再練習讓讀值、顯示與實體反應配合；不要求每週全部拆掉重接。

接著將裝置連上網路，建立後端、資料庫與手機介面，學習資料紀錄、遠端控制及故障處理。期末完成具有明確用途、測試證據與重建文件的作品；題目由學生自行決定。

<a id="first-iot-example"></a>
<a id="architecture-extension"></a>

### A First IoT Example: From Local Interaction to a Connected Device

This optional example shows what a network adds later in the semester.
Week 1 does not require installing or building these network services.

Consider a desk indicator: press a button to request help, a light changes color,
and a phone shows which desk needs assistance. A user can acknowledge the request
from the phone. This is a design example, not a tested device.

按鈕、開發板與燈是硬體（Hardware），程式是控制它們行為的軟體（Software）。
按鈕提供輸入（Input），ESP32-S3 處理後，以燈光作為輸出（Output）。

The local interaction can be described without any network:

```text
Person presses the button
  → ESP32-S3 program reads the press and changes the desk state to "help requested"
  → Program commands the indicator light to change color
  → Person checks whether the light actually changed
```

物聯網（Internet of Things, IoT）把實體互動連上網路；下列部分讓手機能顯示及回應求助訊息：

| Part | Meaning in this example | What a person could check |
|---|---|---|
| Network | Carries messages between the ESP32-S3 and the backend | Did the help-request message arrive? |
| Backend | A program running on a computer that receives events, checks commands, and prepares responses | Was a request accepted or rejected, and why? |
| Database | Organized, persistent storage for events and results | Can an earlier request still be retrieved after the backend restarts? |
| Log | A record of what a program did or encountered, used to trace a problem | Was an event received, or did an operation fail? |
| Mobile interface, or frontend | The page the user sees and operates on a phone | Does it show a request, an old reading, or a connection problem? |

```text
Button press → ESP32-S3 → network → backend → save record and update phone
Phone response → backend → network → ESP32-S3 → change light
```

These arrows show information flow, not electrical wiring. A sent message does not
prove that the light changed; later labs compare messages, records and actual behavior.
Identify this example's input, output and phone action before proposing your own topic.

## 2. Course Information

| Item | Information |
|---|---|
| Class | Four-Year Bachelor's Program in Information Management, Year 2, Class B |
| Instructor | Wen-Yi Lee |
| Class Time | Wednesdays, Periods 5-7, 13:30-16:15 |
| Weekly Hours | 3 hours |
| Prerequisite Knowledge | Basic programming experience in any language; no prior electronics or robotics experience is required |
| Primary Development Board | ESP32-S3 N16R8, pre-soldered downward-facing 44-pin headers; exact PCB must match the approved wiring profile |
| Material Language | The course outline retains English explanations; procurement, preparation and practical instructions use Traditional Chinese with necessary English terms |
| Textbooks and Services | No required textbook purchase and no required paid cloud service |

Administrative fields such as credits, course code, required or elective status, and
the official language of instruction are subject to the final university registration
system announcement.

<a id="course-schedule"></a>

## 3. Eighteen-Week Course Schedule

| Week | Date | Core Content | Main Outcome |
|---:|---|---|---|
| 1 | 09-09 | Purchasing, Arduino IDE and ESP32 setup | No hardware: open, save, modify and compile Hello |
| 2 | 09-16 | First upload and one-button counting | First USB/Serial operation; one press adds one, holding does not keep adding |
| 3 | 09-23 | Light readings and button snapshots on OLED | Test light sensing and OLED separately, then show current and saved values |
| 4 | 09-30 | Add temperature and humidity | Retain the light display and button; show readings, units and read failures |
| 5 | 10-07 | RGB environmental status | Retain the display and saved values; match OLED status text to the actual light color |
| 6 | 10-14 | Add an SG90 paper pointer | Verify external power, safe travel, position commands, stopping and power-off |
| 7 | 10-21 | Integration with taught materials | Combine practiced input, display and output behavior; no new parts or game rules |
| 8 | 10-28 | One practical exam | Use only materials and operations already taught and practiced; rules and weight pending |
| 9 | 11-04 | Instructor abroad: optional reading | No required attendance, new submissions or assessment |
| 10 | 11-11 | Project Report 1: topic and technical feasibility | Same 12–15 minute group report: hardware segment, data flow, risk and questions |
| 11 | 11-18 | Wi-Fi, HTTP, JSON, WebSocket and backend | Trace device events and mobile commands/results with low-power outputs |
| 12 | 11-25 | MQTT, database and structured logs | Topics, presence, commands/acks, persistence and minimal history queries |
| 13 | 12-02 | Project Report 2: progress, feedback and revision | Implementation evidence, problems and a revision plan; further improvement remains possible |
| 14 | 12-09 | Mobile frontend, responsive web/PWA and permissions | Live/history/control/offline/error and permission flows |
| 15 | 12-16 | Automation, safety, fault recovery and reconstruction | One automation, three fault tests and clean-environment reconstruction |
| 16 | 12-23 | Practical class: improve the final project | Revise wiring, programs and integration; verify the changes, with no second exam |
| 17 | 12-30 | Project Report 3: final demonstration and individual questions | All groups present this week; one grade per group, with individual questions |
| 18 | 01-06 | University final examination week: reserved | No regular materials, new content or assessment |

<a id="assessment"></a>
<a id="assessment-details"></a>

## 4. Assessment

| Assessment | Weight | Primary Evidence |
|---|---:|---|
| Coursework | Pending instructor confirmation | Weekly laboratory work, questions and answers, Lab Notebook, documentation, safety, collaboration, and verified AI use |
| Practical Exam (Week 8) | Pending instructor confirmation | Observable work using only materials and operations already taught and practiced |
| Project Report 1 (Week 10) | 15% | Topic, hardware segment, software purpose, architecture, materials, risks, and acceptance criteria |
| Project Report 2 (Week 13) | 15% | Current implementation evidence, progress status, identified problems, risk analysis, and a revision plan |
| Project Report 3 (Week 17) | 25% | Complete physical interaction, frontend and backend, data, reliability, testing, documentation, and individual understanding |

Both written exams are cancelled. The practical-exam and coursework weights have
not been approved; the old two 15% exam weights must not be treated as new weights.
The practical exam's duration, individual or group arrangement, permitted materials,
programs and AI use, scoring criteria, equipment-failure handling and accommodations
are all pending instructor confirmation. See the [Week 8 notice](../Week_08_Project_Report_1/week8_main.md).

The three reports develop one project: feasibility, progress and revision, then the final
demonstration. Each group receives one final-report grade. Week 13 and Week 17 remain unchanged.
Hardware price, mechanical complexity and speed do not earn extra credit.

<a id="final-project"></a>

## 5. Minimum Final Project Requirements

These are semester-end requirements. In Week 1, use them to understand the direction
of the course; do not attempt to build all layers or buy optional parts immediately.
The final project must include all of the following:

- A physical artifact that operates safely and addresses a clearly described use case.
- An ESP32-S3 or another controller approved by the instructor.
- At least one physical input and one physical output; an exception must be approved
  during the first project report in Week 10.
- Wi-Fi and device communication through HTTP or MQTT.
- A student-developed backend that can be restarted from documented instructions.
- A database, historical queries, and structured logs.
- A mobile-friendly interface showing real-time data, history, controls or settings,
  and error or offline states.
- Real-time updates through WebSocket; every control action must leave a command,
  result or acknowledgement, or timeout record.
- At least one automated response, state machine, or schedule.
- At least three tests, including one involving disconnection, invalid input, an
  abnormal sensor value, or a stopped service.
- Source code, a wiring diagram, a data-flow diagram, data formats, a bill of materials,
  reconstruction instructions, AI-use and verification records, and known limitations.

A ready-made dashboard or IoT platform may be used as a supporting tool, but it cannot
replace the student-developed device program, backend, database, or mobile interface.

<a id="materials"></a>

<a id="purchase-table"></a>

<a id="一學生材料採購總表"></a>

## 6. 材料準備

適用學期：115學年度第1學期<br>
公布週次：Week 1（2026-09-09）<br>
準備方式：下表依首次使用週次排序，可一次購齊或分批準備，自行安排到貨時間，
於首次使用前備妥。Week 1 不帶元件；USB資料線與組內電表從Week 2開始使用，OLED 提前至 Week 3，之後沿用已取得的零件，不增加採購項目或數量。

每組1～3人，共同準備並保管一套基本零件、舵機供電組與萬用電表。各成員輪流操作，並各自保存學習紀錄。

### 每組必備零件

已有符合規格的零件可沿用，只補缺項，不限定購買整套材料包。

| 品項 | 必須符合的規格 | 每組數量 | 每組參考金額 | 首次使用與Week 2～7共同任務 |
|---|---|---:|---:|---|
| ESP32-S3開發板（development board） | YD-ESP32-S3 Type-A V1.5、N16R8、已焊向下44腳排針；不同板型先確認相容性 | 1片 | NT$390 | Week 2～7：上傳程式、讀取輸入與控制輸出 |
| 麵包板（breadboard） | 400孔免焊麵包板，約8.5×5.5 cm | 1片 | NT$22 | Week 2～7：免焊接線與量測 |
| 杜邦線（jumper wire） | 20 cm，公對公／公對母／母對母，各一排40條 | 各1排 | NT$75 | Week 2～7：連接板卡、零件與測點；Week 3 起依 OLED 接法取用 |
| 四腳輕觸按鈕（pushbutton） | 6×6 mm、常開瞬時型 | 2顆 | NT$4 | Week 2～7：先用一顆計數，後續沿用於保存或已教的控制 |
| 指定阻值電阻（resistor） | 220 Ω、330 Ω、1 kΩ與10 kΩ；保留原阻值標示 | 4種，各至少1顆 | NT$60（以整包估算） | Week 3 起保留備用；獨立分壓與阻值量測為補充，不先阻擋主要作品 |
| 光敏電阻模組（photoresistor module） | KY-018 | 1個 | NT$10 | Week 3～7：讀取光線、保存數字並沿用於環境作品 |
| 有機發光顯示器（OLED） | 0.96吋、SSD1306控制器、128×64像素、四針I²C介面；模組須支援3.3 V供電與3.3 V邏輯，排針已焊 | 1個 | NT$65（歷史單價） | Week 3～7：顯示目前值、保存值、狀態及錯誤；Week 3 前備妥 |
| 溫濕度模組（temperature and humidity module） | YS-31 DHT11三針模組，排針已焊；不買裸感測器 | 1個 | NT$25 | Week 4～7：加入溫濕度顯示及保存，標示讀取失敗 |
| 蜂鳴器模組（buzzer） | KY-012有源型（Active Buzzer），三針、附模組板 | 1個 | NT$14 | Week 4、7 舊例保留作進階選用；不列入共同作品或實作考必備操作 |
| 三色發光模組（RGB LED） | KY-016／HW-479類，單顆RGB、四針、附限流電阻；不是WS2812B燈條 | 1個 | NT$9 | Week 5～7：新增環境狀態燈，核對 OLED 文字與實際燈色 |
| 小型舵機（servo） | SG90位置型，附舵盤與螺絲；不是360度連續旋轉型 | 1個 | NT$35 | Week 6～7：新增紙指針，指定位置並練習安全停止 |

電阻可單買或跨組合買分裝，每組備齊四種阻值各至少一顆。NT$60是整包歷史價格，
不是四顆的報價；不要求購買包內其他阻值。

OLED依上表規格選購，不以外觀相似的SH1106或SPI版本替代；腳位與通訊檢查提前至Week 3，之後持續沿用。這是使用週次調整，不要求多買一個。

蜂鳴器新購前，請提供商品供電與腳位資料供教師確認；不要直接接到GPIO。已有模組可先保留。
教師已有的HW-508及使用SSD1315設定顯示的OLED，不因此要求重買。蜂鳴器舊例只供進階選用；
OLED 在 Week 3 起依相符實物選驅動。這些只適用核對後的實物，並非所有同名模組都已通過驗證。

三種杜邦線依實驗需要取用，其餘保存。採購表不是接線表，上電須依當週操作步驟。

### 舵機供電組：每組一套，可共同購買

Week 6首次使用，Week 7沿用。組內輪流操作，一次只供一顆SG90，
換接前關閉電池盒並拔除USB；每位學生仍須完成操作與紀錄。

| 品項 | 選購規格 | 每組數量 | 參考金額 |
|---|---|---:|---:|
| 電池盒（Battery Holder） | 四顆AA串聯、帶開關及導線 | 1個 | NT$15 |
| 可調降壓模組（Buck Converter） | LM2596S類、已組裝、具輸入／輸出螺絲端子與可切換IN／OUT的電壓顯示；不是裸晶片 | 1片 | NT$45（歷史單價，實際規格與售價須核對） |
| AA電池（AA Battery） | 每顆標稱1.5 V，四顆同類型、同規格及新舊狀態；不混用1.2 V電池 | 4顆 | 自備，另計 |
| 電源連接材料（Power Connector and Wiring） | 能牢固連接電池盒、降壓模組與舵機，接點絕緣；合適既有線材可沿用 | 1套 | 自備，另計 |

電池先接降壓模組輸入，舵機由調整後的輸出供電，不把電池盒直接接舵機。
降壓模組的啟動電流、壓降與發熱仍須在Week 6核對；商品標示的電流不是整套供電已通過的證明。

<!-- hardware-gallery:start -->
<a id="equipment-photos"></a>

### 採購零件外觀

對照照片辨認零件，所需規格與數量以採購表為準。

照片標示來源與角度，只供外觀辨識，不是接線圖或已驗證證明；商品圖的價格與數量不代表學生需求。Week 1 尚未領到元件，先辨認採購項目並完成電腦軟體設定；Week 2 才開始接板操作。

[ESP32-S3 開發板](#equipment-esp32s3) · [400 孔麵包板](#equipment-breadboard400) · [杜邦線](#equipment-jumperwire) · [四腳輕觸按鈕](#equipment-pushbutton) · [萬用電表](#equipment-a830l) · [固定電阻](#equipment-resistor) · [KY-018 光敏電阻模組](#equipment-ky018) · [DHT11 溫濕度模組](#equipment-dht11) · [HW-508 蜂鳴器模組](#equipment-buzzer_hw508) · [HW-479 三色發光二極體模組](#equipment-rgb_hw479) · [有機發光二極體顯示模組](#equipment-oled) · [SG90 舵機](#equipment-sg90) · [四槽 AA 帶開關電池盒](#equipment-batteryholder4aa) · [帶數字顯示的降壓模組](#equipment-buckconverter)

<a id="equipment-esp32s3"></a>

#### ESP32-S3 開發板（Development Board）

主控制板，負責執行程式及連接零件。照片為YD-ESP32-S3 Type-A V1.5；不可直接套用不同板型的接線圖。

| 實物後製展示圖：正面：模組、按鈕與 USB 接頭 | 實物後製展示圖：背面：板身與排針 |
| --- | --- |
| ![ESP32-S3 開發板（Development Board）；實物後製展示圖；正面：模組、按鈕與 USB 接頭](../docs/images/hardware/actual/ESP32S3_1.png) | ![ESP32-S3 開發板（Development Board）；實物後製展示圖；背面：板身與排針](../docs/images/hardware/actual/ESP32S3_2.png) |

其他留存角度：[麵包板對孔紀錄；不是建議的實驗安裝方式，右側接線空間不足](../docs/images/hardware/actual/ESP32S3_3.jpg)。

<a id="equipment-breadboard400"></a>

#### 400 孔麵包板（Breadboard）

免焊連接零件；以中央溝槽、字母與列號辨認插孔位置。

| 實物照片：俯視：中央溝槽、五孔組與側邊電源軌 |
| --- |
| ![400 孔麵包板（Breadboard）；實物照片；俯視：中央溝槽、五孔組與側邊電源軌](../docs/images/hardware/actual/Breadboard400_1.jpg) |

<a id="equipment-jumperwire"></a>

#### 杜邦線（Jumper Wire）

用來連接零件。金屬針是公頭（Male），插孔是母頭（Female）；三種接頭都要準備。

| 實物照片：成排導線與接頭全貌 | 蝦皮商品參考：公對公：兩端皆為金屬針 |
| --- | --- |
| ![杜邦線（Jumper Wire）；實物照片；成排導線與接頭全貌](../docs/images/hardware/actual/JumperWire_1.jpg) | ![杜邦線（Jumper Wire）；蝦皮商品參考；公對公：兩端皆為金屬針](../docs/images/hardware/product-cards/JumperWire_MM_1.png) |

| 蝦皮商品參考：公對母：金屬針與插孔各一端 | 蝦皮商品參考：母對母：兩端皆為插孔 |
| --- | --- |
| ![杜邦線（Jumper Wire）；蝦皮商品參考；公對母：金屬針與插孔各一端](../docs/images/hardware/product-cards/JumperWire_MF_1.png) | ![杜邦線（Jumper Wire）；蝦皮商品參考；母對母：兩端皆為插孔](../docs/images/hardware/product-cards/JumperWire_FF_1.png) |

<a id="equipment-pushbutton"></a>

#### 四腳輕觸按鈕（Tactile Pushbutton）

黑色頂部是按壓位置，四支金屬腳用來接線；Week 2 開始用它輸入按下／放開，之後用於保存資料與停止操作。

| 實物照片：俯視：按鍵與金屬上蓋 | 實物照片：側面：四支接腳 |
| --- | --- |
| ![四腳輕觸按鈕（Tactile Pushbutton）；實物照片；俯視：按鍵與金屬上蓋](../docs/images/hardware/actual/Pushbutton_1.jpg) | ![四腳輕觸按鈕（Tactile Pushbutton）；實物照片；側面：四支接腳](../docs/images/hardware/actual/Pushbutton_2.jpg) |

其他留存角度：[歷史接線紀錄：同一組常通接點的量測，不是按下才導通的接法答案](../docs/images/hardware/actual/Pushbutton_3.jpg)。

<a id="equipment-a830l"></a>

#### 萬用電表（Digital Multimeter）

量測電阻與電壓、檢查通斷。照片是A830L示範表，操作以自己的電表刻度與插孔為準。

| 實物照片：正面：顯示器、旋鈕與表筆插孔 |
| --- |
| ![萬用電表（Digital Multimeter）；實物照片；正面：顯示器、旋鈕與表筆插孔](../docs/images/hardware/actual/A830L_1.jpg) |

<a id="equipment-resistor"></a>

#### 固定電阻（Resistor）

限制電流或組成分壓電路；以色環與原包裝辨認阻值，本課需要的四種阻值見採購表。

| 實物照片：不同阻值與手寫分類標示 |
| --- |
| ![固定電阻（Resistor）；實物照片；不同阻值與手寫分類標示](../docs/images/hardware/actual/Resistor_1.png) |

<a id="equipment-ky018"></a>

#### KY-018 光敏電阻模組（Photoresistor Module）

頂端圓片感受光線變化，用於遮光辨識。

| 實物照片：正面近照：感光元件、S 與 − 絲印 | 實物照片：另一元件面角度 |
| --- | --- |
| ![KY-018 光敏電阻模組（Photoresistor Module）；實物照片；正面近照：感光元件、S 與 − 絲印](../docs/images/hardware/actual/KY018_1.jpg) | ![KY-018 光敏電阻模組（Photoresistor Module）；實物照片；另一元件面角度](../docs/images/hardware/actual/KY018_2.jpg) |

| 實物照片：焊接面 |
| --- |
| ![KY-018 光敏電阻模組（Photoresistor Module）；實物照片；焊接面](../docs/images/hardware/actual/KY018_3.jpg) |

<a id="equipment-dht11"></a>

#### DHT11 溫濕度模組（Temperature and Humidity Module）

藍色有孔外殼內是溫濕度感測器；照片為YS-31三針模組。

| 實物照片：感測器面與連接線 | 實物照片：焊接面與排針連接 |
| --- | --- |
| ![DHT11 溫濕度模組（Temperature and Humidity Module）；實物照片；感測器面與連接線](../docs/images/hardware/actual/DHT11_1.jpg) | ![DHT11 溫濕度模組（Temperature and Humidity Module）；實物照片；焊接面與排針連接](../docs/images/hardware/actual/DHT11_2.jpg) |

<a id="equipment-buzzer_hw508"></a>

#### HW-508 蜂鳴器模組（Buzzer Module）

圓形發聲元件，用於短聲提示。商品名KY-012，照片板號HW-508；腳位與驅動規格仍待核對，不直接接GPIO。

| 實物照片：元件面：圓形蜂鳴器與三支排針 | 實物照片：焊接面 |
| --- | --- |
| ![HW-508 蜂鳴器模組（Buzzer Module）；實物照片；元件面：圓形蜂鳴器與三支排針](../docs/images/hardware/actual/Buzzer_HW508_1.jpg) | ![HW-508 蜂鳴器模組（Buzzer Module）；實物照片；焊接面](../docs/images/hardware/actual/Buzzer_HW508_2.jpg) |

其他留存角度：[較早的元件面照片，文字不清](../docs/images/hardware/actual/Buzzer_HW508_3.jpg)。

<a id="equipment-rgb_hw479"></a>

#### HW-479 三色發光二極體模組（RGB LED Module）

單顆LED呈現紅、綠、藍色，用於狀態提示；四針模組，不是八顆燈條。

| 實物照片：正面：單顆 LED 與 B／G／R／− 標示 | 實物照片：焊接面 |
| --- | --- |
| ![HW-479 三色發光二極體模組（RGB LED Module）；實物照片；正面：單顆 LED 與 B／G／R／− 標示](../docs/images/hardware/actual/RGB_HW479_1.jpg) | ![HW-479 三色發光二極體模組（RGB LED Module）；實物照片；焊接面](../docs/images/hardware/actual/RGB_HW479_2.jpg) |

其他留存角度：[較早的元件面照片](../docs/images/hardware/actual/RGB_HW479_3.jpg)；[失焦補充照；不供腳位或焊點判讀](../docs/images/hardware/actual/RGB_HW479_4.jpg)。

<a id="equipment-oled"></a>

#### 有機發光二極體顯示模組（OLED Display）

Week 3 起作為裝置主要畫面，顯示光線、保存資料，之後加入溫濕度與狀態。下列有到貨正背照片與歷史商品圖；選購規格見採購表，實物照片不代替規格。

| 實物照片：正面：螢幕與四個功能標示 | 實物照片：背面：板號與垂直於電路板的排針 |
| --- | --- |
| ![有機發光二極體顯示模組（OLED Display）；實物照片；正面：螢幕與四個功能標示](../docs/images/hardware/actual/OLED_1.jpg) | ![有機發光二極體顯示模組（OLED Display）；實物照片；背面：板號與垂直於電路板的排針](../docs/images/hardware/actual/OLED_2.jpg) |

| 蝦皮商品參考：OLED 在倒數第三列；其他商品與數量不是學生採購要求 |
| --- |
| ![有機發光二極體顯示模組（OLED Display）；蝦皮商品參考；OLED 在倒數第三列；其他商品與數量不是學生採購要求](../docs/images/hardware/orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) |

<a id="equipment-sg90"></a>

#### SG90 舵機（Servo Motor）

帶三線接頭的小型舵機，附白色舵盤，用來帶動指針；不可由GPIO或3V3供電。

| 實物照片：拆袋全貌：標籤、三線插頭與附件 | 實物照片：包裝內的標籤、插頭與舵盤 |
| --- | --- |
| ![SG90 舵機（Servo Motor）；實物照片；拆袋全貌：標籤、三線插頭與附件](../docs/images/hardware/actual/SG90_1.jpg) | ![SG90 舵機（Servo Motor）；實物照片；包裝內的標籤、插頭與舵盤](../docs/images/hardware/actual/SG90_2.jpg) |

| 實物照片：另一包裝角度 |
| --- |
| ![SG90 舵機（Servo Motor）；實物照片；另一包裝角度](../docs/images/hardware/actual/SG90_3.jpg) |

<a id="equipment-batteryholder4aa"></a>

#### 四槽 AA 帶開關電池盒（Battery Holder）

四槽AA串聯電池盒，帶開關與導線；四顆1.5 V電池經降壓模組供舵機，可按組共用。

| 實物照片：外殼、ON／OFF 開關與紅黑裸線 | 實物照片：另一盒蓋與導線角度 |
| --- | --- |
| ![四槽 AA 帶開關電池盒（Battery Holder）；實物照片；外殼、ON／OFF 開關與紅黑裸線](../docs/images/hardware/actual/BatteryHolder4AA_1.jpg) | ![四槽 AA 帶開關電池盒（Battery Holder）；實物照片；另一盒蓋與導線角度](../docs/images/hardware/actual/BatteryHolder4AA_2.jpg) |

<a id="equipment-buckconverter"></a>

#### 帶數字顯示的降壓模組（Buck Converter）

將電池電壓調低後供舵機；辨認VIN輸入與VOUT輸出。Week 6～7使用，可按組共用，先量測再接負載。

| 實物照片：電池接 VIN、輸出未接負載；IN 指示燈亮、顯示 6.47 | 實物照片：元件面、螺絲端子與數字顯示 |
| --- | --- |
| ![帶數字顯示的降壓模組（Buck Converter）；實物照片；電池接 VIN、輸出未接負載；IN 指示燈亮、顯示 6.47](../docs/images/hardware/actual/BuckConverter_3.jpg) | ![帶數字顯示的降壓模組（Buck Converter）；實物照片；元件面、螺絲端子與數字顯示](../docs/images/hardware/actual/BuckConverter_1.jpg) |

| 實物照片：焊接面 |
| --- |
| ![帶數字顯示的降壓模組（Buck Converter）；實物照片；焊接面](../docs/images/hardware/actual/BuckConverter_2.jpg) |

<!-- hardware-gallery:end -->

<a id="purchase-budget"></a>

### 參考預算：零件、電表與其他用品分開算

**每組基本零件NT$709＋供電組已計價部分NT$60＋電表NT$159＝每組參考小計NT$928。**

全組共用一套，不按人數重複購買。供電組已計價部分為電池盒15＋降壓模組45＝60，不含電池與連接材料。

表中金額已包含各項數量，沿用[2026年採購紀錄](../docs/hardware/purchased_inventory.md)，不是目前報價。
NT$928未含筆電與充電器、USB資料線、收納、AA電池、連接材料及運費；
這些項目依實際需補買的用品計算，不能當成0元。

<a id="group-measurement-tool"></a>

### 每組必備的量測工具

本課每組1～3人，每組自行準備一台數位萬用電表。1人組可以向其他組共用，
但兩組必須分別完成量測、記錄與結果判讀，不能共用同一份證據。

| 品項 | 最低要求 | 每組數量 | 單價參考 | 首次使用 | 後續使用 |
|---|---|---:|---:|---:|---|
| 數位萬用電表（digital multimeter） | 具通斷蜂鳴、電阻、低壓直流電壓、`COM`與`VΩ`或`VΩmA`插孔；表筆完整 | 1台 | A830L既有成交參考NT$159 | Week 2 | Week 3～7接線、供電與故障排查 |

以每組新買上述一套零件、供電組及電表，平均分攤為例：

| 組別人數 | 每組參考小計 | 每人平均分攤 |
|---|---:|---:|
| 1人 | NT$928 | NT$928 |
| 2人 | NT$928 | NT$464 |
| 3人 | NT$928 | 約NT$309.33 |

例如三人組：928÷3≈309.33；電池、連接材料及其他用品與運費另計，實際分帳尾差由組內協調。
沿用或跨組共用合格電表者，依實際新增支出計算。

### 其他自備用品

| 品項 | 最低要求 | 準備數量 | 首次使用 | Week 2～7用途 |
|---|---|---:|---:|---|
| 筆電（laptop）與充電器 | 可安裝Arduino IDE 2並連接USB裝置 | 每人1套 | Week 1 | Week 2～7編譯、上傳、序列監控與保存個人紀錄 |
| USB資料線（USB data cable） | 接頭符合開發板且可傳輸資料；只有充電功能不合格 | 每組1條 | Week 2 | Week 2～7開發板USB供電、上傳與序列通訊 |
| 收納盒或密封袋（storage container） | 標示組別與保管人 | 每組1個 | Week 2 | 每次實作斷電後分類、清點與保存零件 |

紙／布、指針、刻度及固定用材料自行處理，不列入上方電子零件採購與估價。

電源接點須牢固且絕緣，不可用裸線碰觸、鬆散纏繞或只靠膠帶壓住接點；工具依連接方法準備。

電池與連接材料已列在上方供電組，不重複購買；一般一次性電池不得充電，本方案不要求鎳氫充電器。

供電分工是「筆電USB供ESP32，電池盒經降壓模組供SG90，兩者共地（common ground）」。
不能把SG90接到GPIO或3V3取電，也不能把本課YD板未橋接的`5Vin`當成USB的5 V輸出。
Week 6先辨認IN／OUT並量測、調整輸出，再確認舵機負載電壓、接線與安全停止。空載調整完成不代表可以直接帶負載。

<a id="before-week2"></a>

<a id="week-2-preclass-setup"></a>

## 7. Arduino 與 ESP32 第一次操作

**要做出的結果：** 重新開啟自己儲存的 Hello 程式，按 Verify 後，Output 顯示編譯完成及程式大小；修改文字後再編譯一次。本週只有電腦，不需要任何元件，也不連裝置 Wi-Fi。

先認識兩樣東西：**Arduino IDE 是電腦上用來寫程式、檢查程式及上傳的軟體；ESP32-S3 開發板是實際執行程式的硬體。** 使用 Arduino IDE 不代表要另買 Arduino UNO 板。

以下以 Windows 10／11 64-bit、Arduino IDE 2，以及課堂預定使用的 **YD-ESP32-S3 Type-A V1.5、N16R8** 為例。不同板卡先請教師核對，不直接套用設定。Mac／Linux 的安裝方式見[Arduino 官方安裝說明](https://support.arduino.cc/hc/en-us/articles/360019833020-Download-and-install-Arduino-IDE)。

**本週沒有硬體是正常安排。** 不要求找 Port、安裝尚未出現裝置的驅動、Upload 或實機 Serial 輸出。第一次上傳與文字觀察在 Week 2 帶做，不是本週完成條件。

[安裝軟體](#w1-install)｜[板卡設定](#w1-settings)｜[開啟與儲存 Hello](#w1-hello)｜[編譯結果](#w1-compile)｜[修改與重編譯](#w1-edit)｜[排錯](#w1-troubleshoot)｜[進入 Week 2 前](#w1-readiness)

<a id="w1-install"></a>

### 7.1 安裝 Arduino IDE 2

本週不接開發板。已有 Arduino IDE 2 的同學開啟它後，接著做 7.2。

1. 開啟[Arduino 官方下載頁](https://www.arduino.cc/en/software/)，選 Arduino IDE 2 的 Windows 64-bit 安裝檔，不選網頁版 Cloud Editor。
2. 在電腦的「下載」資料夾開啟 `.exe`。閱讀並接受授權後，依畫面完成安裝。
3. 完成時選 Run Arduino IDE，或從開始選單開啟 Arduino IDE。第一次開啟若仍在下載工具，等它完成。

**完成時看到：** 可以輸入程式的編輯區。此時只是軟體已開啟，還沒安裝 ESP32 支援。

學校電腦若沒有安裝權限，請教師或管理人員協助，不繞過限制。這次操作不需要 Arduino 雲端帳號或付費方案。

### 7.2 加入 ESP32 開發板套件

**開發板套件是一組工具，讓 IDE 知道怎麼把程式轉成 ESP32 能執行的內容，並傳進板子。** 它和 Arduino IDE 分開安裝。

1. 點 **File → Preferences（檔案 → 偏好設定）**。
2. 找到 **Additional boards manager URLs**，貼上下列網址。已有其他網址時，開啟右側清單按鈕，另加一行，不刪掉原設定。按 OK 儲存。

```text
https://espressif.github.io/arduino-esp32/package_esp32_index.json
```

3. 點 **Tools → Board → Boards Manager（工具 → 開發板 → 開發板管理員）**，搜尋 `esp32`。
4. 找作者為 **Espressif Systems** 的 `esp32`，版本選 **3.3.11**，按 INSTALL。這是本課既有程式使用的版本，不要求追最新版。
5. 等該項顯示 **3.3.11 installed**，再關閉並重新開啟 Arduino IDE。

![Espressif 官方 Boards Manager 畫面，下面一項為 esp32 by Espressif Systems](../docs/teaching_drafts/week2_redesign/reference_images/esp-install.webp)

*圖片為[Espressif 官方操作示例](https://developer.espressif.com/blog/2025/10/arduino-get-started/)，其中是舊版 3.3.1；本課選 3.3.11。不要選上面的 Arduino ESP32 Boards，也不要照圖中其他板型設定。*

**完成時確認：** Boards Manager 顯示 Espressif 的 esp32 已安裝，不是只有下載進度。若安裝失敗，依[排錯表](#w1-troubleshoot)處理。安裝來源依據：[Espressif 安裝說明](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html)。

<a id="w1-settings"></a>

### 7.3 選板型與設定

**Board（板型）指定程式要給哪種板子。** 沒有接板也能選 Board 及編譯。Port（連接埠）是實際連到裝置的位置，本週不選；沒有 Port 選單不是本週的安裝失敗。

點 **Tools → Board → esp32 → ESP32S3 Dev Module**。名稱中必須有 **S3**，不是 ESP32 Dev Module。接著在 Tools 選單逐項核對：

| 在 Tools 找這個名稱 | 本課 YD-ESP32-S3 Type-A V1.5／N16R8 的設定 |
|---|---|
| Upload Speed | 115200 |
| USB Mode | Hardware CDC and JTAG |
| USB CDC On Boot | Disabled |
| Upload Mode | UART0 / Hardware CDC |
| Flash Mode | QIO 80MHz |
| Flash Size | 16MB (128Mb) |
| Partition Scheme | 16M Flash (3MB APP/9.9MB FATFS) |
| PSRAM | OPI PSRAM |
| Erase All Flash Before Sketch Upload | Disabled |

每選完一項，重新開啟 Tools 選下一項；其餘保留預設。找不到項目時，先核對板型和套件版本，不挑名字相近的選項。

照表設定，不要求背誦 Flash／PSRAM 原理或選單縮寫。表中上傳與 USB 選項只是先保存課堂設定，不表示本週要連板或上傳。Week 2 會核對實物與接頭後才開始操作。

選單意義見[Espressif Tools 說明](https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html)；Board 與 Port 的差別見[Arduino 選板說明](https://support.arduino.cc/hc/en-us/articles/4406856349970-Select-board-and-port-in-Arduino-IDE)。


<a id="w1-hello"></a>

### 7.4 開啟 Hello，儲存自己的工作副本

**Sketch 是 Arduino IDE 裡的一份程式。** 主要程式檔的副檔名為 `.ino`。本週使用教師提供的 `hello_first/hello_first.ino`，保留同名資料夾與檔案，不從 PDF 拼湊完整程式。

1. 從教師當次提供的本機或課程雲端位置取得 Hello 資料夾；若收到壓縮檔，先解壓縮。不假設程式已放在公開 GitHub。
2. 在 IDE 選 **File → Open（檔案 → 開啟）**，找到資料夾裡的 `hello_first.ino`。開啟後應能找到 `setup()`、`loop()` 及含有 `"Hello"` 的一行。
3. 選 **File → Save As（另存新檔）**，在自己的課程工作資料夾保存副本，名稱保留 `hello_first`。不要覆蓋教師範例或自己的舊作業。
4. 按 **Ctrl+S**。關閉這份草稿，再用 **File → Open** 從剛才保存的位置重新開啟。

**完成時確認：** 能指出自己的資料夾與 `hello_first.ino`，重新開啟後仍看得到程式。找不到教師提供的檔案時，先向教師取得檔案；不是另裝程式庫或任找其他 Hello 範例。

<a id="w1-compile"></a>

### 7.5 按 Verify，讀編譯結果

**先預測：** 沒有接開發板，Verify 能否完成？完成後，能否聲稱已看見板子送出的 Hello？

1. 確認目前開啟自己的 Hello，Board 仍是 **ESP32S3 Dev Module**，設定與 7.3 相同。
2. 按左上方勾勾 **Verify（驗證／編譯）**，或選 **Sketch → Verify/Compile**。本週不按右箭頭 Upload。
3. 等編譯結束，查看下方 **Output**。成功時會顯示編譯完成及程式使用的儲存空間／記憶體大小；不能只看工具列沒有紅色就認定成功。
4. 若看到 `Compilation error` 或 `exit status 1`，保留完整 Output，依 7.7 排錯後再編譯。

![Arduino IDE 工具列示例：本週只按左側勾勾 Verify，不按右箭頭 Upload](../docs/teaching_drafts/week2_redesign/reference_images/arduino-upload.png)

*圖片來源：[Arduino 操作說明](https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-uploading-a-sketch/)。只辨認勾勾位置；圖中的 UNO 不是本課板型，右箭頭不是本週操作。*

**如何判讀自己剛才看到的結果：** 若 Output 顯示完成與使用大小，表示電腦能替選定板型編譯這份程式。這是編譯結果，不是實機輸出；本週不應在 Serial Monitor 看到 Hello。不同套件版本的大小可能不同，不以單一示例數字當答案。

<a id="w1-edit"></a>

### 7.6 改一行文字，儲存並重新編譯

1. 找到 `Serial.println("Hello");`，只把雙引號內的 `Hello` 改為 `My ESP32`。保留雙引號、括號與分號。
2. **先預測：** 改動文字後，Verify 是否仍能完成？Output 是否會因此每秒新增一行 `My ESP32`？
3. 按 **Ctrl+S**，再按 Verify；等結束後重新讀 Output，不沿用前一次成功的判斷。
4. 關閉再開啟自己的檔案，確認 `My ESP32` 仍在，再編譯一次。這同時確認存檔位置、修改有保存，以及重新開啟後仍能編譯。

**如何判讀：** 新一次完成訊息表示修改後的程式通過編譯。Output 是編譯訊息，不會以程式的每秒間隔顯示 `My ESP32`。本週沒有板子，因此不聲稱文字已在板上執行。成功與否以你自己的 Output 為準；這裡沒有預先填入實測結果。

`setup()` 裡的內容預定在程式啟動時執行一次，`loop()` 裡的內容預定反覆執行。Hello 裡的 `Serial.println(...)` 準備傳送文字，`delay(1000)` 是等待約 1000 毫秒。Week 2 上傳後再觀察實際文字與間隔；本週先會找到並修改這一行，不要求先學完按鈕計數器。

<a id="w1-troubleshoot"></a>

### 7.7 卡住時，先找是哪一步

| 你看到的情況 | 先做這件事 |
|---|---|
| ESP32 套件下載失敗 | 保留 Boards Manager 的完整錯誤，確認網路與 7.2 的穩定版網址，再重試；不要改裝名字相近的套件 |
| 找不到 ESP32S3 Dev Module | 核對作者 Espressif Systems、課堂版本 3.3.11 及 installed 狀態，重開 IDE；已裝其他版本先請教師確認 |
| 沒有 Port，或顯示沒有連線裝置 | 本週沒有開發板是正常情況；手動選 Board 即可，不安裝尚未出現裝置的驅動 |
| 找不到自己的 Hello | 在 File → Open 找自己保存的資料夾，不在 ZIP 預覽中操作；若來源檔尚未取得，請教師提供 |
| Verify 失敗 | 看 Output 第一個具體錯誤；核對雙引號、括號、大括號及分號，不只看最後一行 exit status 1 |
| 修改後重新開啟卻還是 Hello | 核對目前開啟的檔案位置，確認 Ctrl+S 已完成，再開自己的副本 |
| 編譯成功但沒有 My ESP32 文字 | 本週只編譯，不會執行板上程式；不要為此嘗試 Upload 或開 Serial Monitor |

需要協助時，展示目前畫面，說明停在「安裝、開檔、儲存或編譯」哪一步，並保留完整錯誤。這不是另交一份截圖作業。

<a id="w1-readiness"></a>

### 7.8 進入 Week 2 前，我能做什麼？

以下在課堂直接操作確認，不增加繳交表單或配分。每位同學操作自己的電腦，不需要借板完成本週檢查。

- 能開啟 Arduino IDE，找到已安裝的 ESP32 套件與 ESP32S3 Dev Module。
- 能從自己的資料夾重新開啟 `hello_first.ino`，指出修改後的文字。
- 能按 Verify，指出當次 Output 的完成訊息與使用大小；若失敗，能指出第一個具體錯誤。
- 能說明本週完成的是編譯，尚未上傳或觀察板上的執行結果。
- 知道 Week 2 要帶筆電與充電器、USB 資料線，以及原清單的開發板、麵包板、兩顆按鈕、杜邦線；確認本組電表已備妥。

**Week 2 從這裡接續：** 先核對實物與 USB 接頭、選 Port，必要時處理裝置驅動，完成第一次上傳及 Serial 文字觀察。成功後再辨認本次需要的麵包板孔與按鈕接點，做到一顆按鈕按一下加一次、按住不連加，再解釋上拉電阻。不把這些尚未操作的內容當作 Week 1 已完成。

元件未到手不算本週操作失敗；若 Week 2 的器材仍無法備妥，先告知教師安排。OLED 須於 Week 3 前備妥，Week 4 加 DHT、Week 5 加 RGB、Week 6 加舵機與原供電組，Week 7 沿用整合。以上沿用原清單，沒有增加採購數量。

第一次取得閱讀教材，可到[課程 GitHub 首頁](https://github.com/KennethWYLee/IoT)選 **Code → Download ZIP**。解壓縮到新資料夾，不覆蓋自己的程式。下週閱讀[Week 2 Main](../Week_02_ESP32_Hardware_Basics/week2_main.pdf)；Ans 與程式依教師當次提供的位置取得，不假設都在公開 GitHub。本週不用安裝 Python 或 Jupyter。

<a id="shopee-purchase-images"></a>

## 8. 老師的蝦皮購買圖片（歷史參考）

以下是老師提供的環島科技、樂意創客購物截圖。規格與數量以[中文採購清單](#purchase-table)為準，
不要照抄截圖中的整筆訂單；額外車輛器材供老師自製無人車等個人用途。
價格是歷史紀錄，不是目前報價；商品圖片不是接線圖。

[圖 1：電表、按鈕與公對母線](#shopee-order-1)｜[圖 2：OLED 與母對母線](#shopee-order-2)｜[圖 3：ESP32 與感測模組](#shopee-order-3)｜[圖 4：光敏、SG90 與麵包板](#shopee-order-4)｜[圖 5：電阻包](#shopee-order-5)

閱讀 PDF 時可放大頁面查看圖片中的小字；原圖以課程提供的檔案為準。

<a id="shopee-order-1"></a>

### 圖 1：環島科技——電表、按鈕與公對母杜邦線

重點：A830L 電表、四腳按鈕與公對母杜邦線。最上方是支架，不含 OLED 螢幕；按鈕列為購物車紀錄。

![老師提供的環島科技購物截圖 1：電表、按鈕、公對母杜邦線，並含個人用途的支架、馬達與電源零件](../docs/images/hardware/orders/shopee-aroundtw-01-prototyping-motors-power.png)

<a id="shopee-order-2"></a>

### 圖 2：環島科技——OLED 顯示器與母對母杜邦線

倒數第三列是「4 針、0.96 吋」OLED 螢幕，不是支架；同圖另有母對母杜邦線。

![老師提供的環島科技購物截圖 2：倒數第三列為四針 0.96 吋 OLED，另有母對母杜邦線及其他器材](../docs/images/hardware/orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png)

<a id="shopee-order-3"></a>

### 圖 3：環島科技——ESP32、感測與發光模組

重點：ESP32-S3、DHT11、單顆 RGB、蜂鳴器、公對公杜邦線與四槽 AA 電池盒；八顆燈條不是本課 RGB 模組。

![老師提供的環島科技購物截圖 3：ESP32-S3、DHT11、RGB、蜂鳴器、公對公杜邦線與四槽 AA 電池盒](../docs/images/hardware/orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png)

<a id="shopee-order-4"></a>

### 圖 4：環島科技——光敏模組、SG90 與麵包板

重點：KY-018、SG90 與 400 孔麵包板；上方電池盒是與圖 3 重疊的同一列。

![老師提供的環島科技購物截圖 4：KY-018 光敏模組、SG90 舵機、400 孔麵包板及重疊的電池盒列](../docs/images/hardware/orders/shopee-aroundtw-04-photoresistor-servo-breadboard.png)

<a id="shopee-order-5"></a>

### 圖 5：樂意創客——常用電阻包與收納盒

電阻包包含本課需要的四種阻值，可依採購表單買或分裝；收納盒不限定圖中款式。

![老師提供的樂意創客購物截圖 5：常用電阻包與收納盒，包內多種阻值不等於全部必買](../docs/images/hardware/orders/shopee-loyi-maker-05-resistors-storage.png)
