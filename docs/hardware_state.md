# Hardware State

這份文件讓兩台電腦與不同 Codex task 知道實體器材最後被怎麼使用。每次
實驗前先讀，實驗後更新。不要記 Wi-Fi 密碼、token 或學生個資。

## 狀態代碼

- `unverified`：只有購買／外觀資訊，尚未完成基本實機測試。
- `basic-pass`：已確認上電、上傳或單一功能。
- `scenario-pass`：已在指定接線、電源、library 與程式版本完成情境測試。
- `fault`：有可重現故障或疑似損壞，停止使用並隔離。
- `retired`：不再使用。

## 開發板

| ID | 品項 | 狀態 | 最近電腦／日期 | 已驗證 | GPIO／供電設定 | 已知問題 | 下一步 |
|---|---|---|---|---|---|---|---|
| BOARD-T01 | YD-ESP32-S3 Type-A V1.5；ESP32-S3-WROOM-1 N16R8 | basic-pass | Windows／2026-08-30 | 正反面絲印、向下44腳；`USB`接頭列舉為COM7；`COM`接頭列舉為CH343 COM8（VID 1A86、PID 55D3）；Arduino-ESP32 3.3.11完成compile、115200-baud Upload、hash驗證、RTS自動重設及UART Serial；runtime回報ESP32-S3 revision 2、240 MHz、Flash 16777216 bytes、PSRAM 8388608 bytes；在400孔麵包板實際對孔為左排`B3～B24`、右排`J3～J24`；板外候選接線使用棕色GND→`a22`、紅色GPIO4→`a27`、橘色GPIO5→`a20`及`b22 → a29`分接，斷電量測按鈕放開不蜂鳴、按住蜂鳴、放開恢復不蜂鳴，且TPO `b20`對TPG `c22`不蜂鳴；GPIO4／GPIO5候選韌體完成IDE Verify、302752-byte Upload、hash驗證與RTS自動Reset；五次按鈕操作皆得到GPIO4按下LOW／放開HIGH事件；Week 3板外測試點斷電隔離檢查未出現持續蜂鳴，USB供電時P3V3穩定接觸實測約3.2 V；`5Vin`對GND初測約0.5 V、重測約-0.6 V，實物照片確認`IN-OUT`焊盤未橋接，與exact-board資料所述USB VBus不會送至開路`5Vin`相符；GPIO5在同一正向量測下實測HIGH約3.3 V、LOW 0 V，Reset後Serial重新顯示`startup=LOW`及`phase=LOW` | `COM`接頭USB基本驗證已完成；GPIO4輸入事件通過；BOARD-T01的GPIO5已通過穩態LOW／HIGH輸出電壓；P3V3約3.2 V作基本功能證據；`5Vin`只作外部5 V輸入，不是USB 5 V輸出 | 採購頁稱DevKitC-1但實物PCB為YD版型；GPIO5穩態結果只適用BOARD-T01，不代表BOARD-T02／T03或整批板卡已通過；萬用電表無法證明Reset瞬間沒有短脈衝；單片400孔麵包板直接安裝只留下左側A欄，右側沒有可接線欄，且USB端遮擋第27／29列按鈕，因此不採直接安裝；不得焊接或橋接`IN-OUT`作學生實驗 | 對BOARD-T02／T03重複GPIO profile檢查；Reset瞬間與故障安全狀態留到後續狀態機／安全單元；見[Week 2候選profile測試紀錄](lab_notes/2026-08-29-board-t01-gpio4-gpio5-candidate-test.md)及[Week 3引導實測紀錄](lab_notes/2026-08-30-week3-guided-walkthrough.md) |
| BOARD-T02 | 採購頁稱ESP32-S3-DevKitC-1 N16R8；實物PCB待核對 | unverified |  |  |  | 不得假設與BOARD-T01同版 | 核對正反面絲印、設定、Upload與Serial |
| BOARD-T03 | 採購頁稱ESP32-S3-DevKitC-1 N16R8；實物PCB待核對 | unverified |  |  |  | 不得假設與BOARD-T01同版 | 核對正反面絲印、設定、Upload與Serial |

## 教師材料箱

| ID | 主要內容 | 狀態 | 保管位置／使用狀態 | 缺件或問題 | 最近盤點 |
|---|---|---|---|---|---|
| KIT-T01 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T02 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T03 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |

## 散裝模組與材料

| ID | 品項 | 數量／位置 | 狀態 | 已有證據 | 下一步 |
|---|---|---|---|---|---|
| INPUT-SWITCH | 外形符合6×6 mm四腳常開瞬時按鈕 | 10顆散裝實物；來源待核對 | partially verified | [俯視](images/hardware/actual/tact-switch-6x6mm-4pin-actual-top.jpg)／[側視](images/hardware/actual/tact-switch-6x6mm-4pin-actual-side.jpg)／[麵包板實測接法](images/hardware/actual/tact-switch-6x6mm-4pin-breadboard-continuity-actual.jpg)；2026-08-29以A830L抽測其中一顆：目前方向下第27列兩腳為固定同組，第29列為另一組；跨組未按不蜂鳴、按住蜂鳴、放開恢復不蜂鳴；接入BOARD-T01候選板外線路後，以TPG `c22`與按鈕列`b27`重測仍為放開不蜂鳴、按住蜂鳴、再放開不蜂鳴，見[量測紀錄](lab_notes/2026-08-29-a830l-button-continuity-validation.md) | 其餘9顆尚未逐顆抽測，不能由一顆結果推定全部通過；正式上課前抽測同批按鈕的一致性；候選GPIO尚未上電驗證 |
| RESISTOR-KIT | 常用電阻包 | 3包；存放學校 | unverified | 購買畫面；尚無實物照片 | 到校後拍包裝阻值標示，使用前以萬用電表抽測；2026-09-05依教師要求新增Week 3學生1kΩ／10kΩ固定分壓與上下位置交換練習，文件結構、連結、理想麵包板接點模型、分壓計算及表格呈現檢查通過，未進行實機驗證。須核對實物阻值、麵包板20／25／30列接法、3V3供電及兩種接法的電壓；不把採購要求或計算值寫成已買齊或實測通過 |
| KY018-T01 | KY-018相容光敏電阻模組 | 已取得1個實物；其餘待盤點 | basic-pass | [元件面](images/hardware/actual/ky018-photoresistor-module-actual-component-side.jpg)、[焊接面](images/hardware/actual/ky018-photoresistor-module-actual-solder-side.jpg)與[排針近照](images/hardware/actual/ky018-photoresistor-module-actual-pin-labels.jpg)；可辨認獨立`S`、`-`及中央`A／S1／R1`，中央文字不當作排針功能；斷電量測支持固定電阻接於中間排針與S、光敏電阻接於S與−的模型。2026-09-05先以b6供電、b3共地且S未接GPIO，在A830L直流20V、紅表筆碰S／黑表筆碰GND的引導下，手持回報室內光0.62 V、遮光1.75 V、恢復室內光0.55 V；basic-pass僅指這片模組此接法的基本電壓反應。其後使用者確認供電改c6、−改c3，仍與BOARD-T01的a6 3V3及a3 GND同列；S黃線→a15／c15→藍線。候選ADC程式已回報Upload資料校驗成功；其後取得9筆原始Serial輸出，sample4194～4202、間隔500 ms，前6筆raw 248～293、後3筆678～683，該段光線是否改變仍待確認；後續明確標記遮光的5筆sample4527～4531為raw 1419～1450；一般室內光5筆sample4598～4602為275～287，兩組短樣本範圍不重疊，支持本接法遮光raw較大的初步反應，Serial介面回報COM8／115200 baud，詳見[電阻、分壓與ADC候選進度](lab_notes/2026-09-05-ky018-resistance-and-voltage-divider.md) | 讀值為使用者文字回報，非代理直接量測；20k／200k差異未釐清，不要求作為ADC前置重測；已有兩種光線各5筆raw的基本反應回報；已取得本輪一般光及主動補測陰暗處的電表／raw先後對照；未驗證供電穩定性、同步量測、ADC精度或lux校正。最新回報韌體為GPIO4 ADC候選程式，不再是GPIO5循環程式；依斷USB後接c15藍線到GPIO4的引導，使用者回覆next並在上電／Serial引導後貼出raw；已有程式輸出證據；本輪電壓回報見下，無新接線照片或開場文字。已有遮光與一般光各5筆；最新另收到sample5068～5077連續10筆，raw 2159～2195、間隔500 ms，使用者其後明確確認為一般燈下、沒有遮光，作為目前這輪基準；與較早275～287一般光的差異原因未明，兩輪資料分開保存。使用者明確要求pass、不再重收遮光；保留各輪資料與限制，不把略過當成驗證通過。使用者依斷USB、PWR熄滅、電表OFF的引導回報e15公對公量測延長線已接好；無新照片或通斷量測。其後依直流20 V、紅碰e15 S／黑碰e3 GND的一般光量測引導回報0.52（依上下文記約+0.52 V）；無新電表畫面。其後依保持同條件的引導取得sample376～380新5筆raw 691～701，間隔500 ms，作為0.52 V之後的同條件觀察，不是同步校正；計數變小與前述斷USB重啟相容，不能跨兩次開機混算時間。在斷電完成回覆之前，使用者主動補測「把光敏放到陰暗處」：電表1.14（依既有直流20 V與S對GND操作上下文記約+1.14 V），接著回報sample601～605的5筆raw 1007～1020、間隔500 ms；保留原始情境標籤「移到陰暗處」，不改寫為固定位置遮光。本輪0.52 V／raw 691～701與陰暗處1.14 V／raw 1007～1020皆為先後文字回報，支持電壓與raw變大的方向比較，不構成同步量測、精度或lux校正；移動造成的光照幾何與接觸變化未獨立排除。下一步放下表筆、關閉Serial、拔USB確認PWR熄滅並將電表OFF後進行Discussion；尚未收到斷電完成回覆。改線前仍須拔USB、確認PWR熄滅。先前拒絕重收遮光的決定仍保留，這次主動補測不代表同意反覆補足取樣，也未湊成各條件同輪10筆的完整驗證。不要把GPIO4數位輸入通過或Upload成功當成ADC profile已公布 |
| DHT11-T01 | 購買頁稱YS-31的DHT11三線模組 | 已取得1個實物；其餘待盤點 | unverified | [元件面與三線](images/hardware/actual/dht11-3pin-module-actual-component-side-with-cable.jpg)／[焊接面與三線](images/hardware/actual/dht11-3pin-module-actual-solder-side-with-cable.jpg) | 斷電取下連接線後補拍三針絲印；線色不能直接當作VCC／DATA／GND證據 |
| RGB-T01 | `HW-479`四針RGB LED模組；購買頁稱KY-016 | 已取得1個實物；其餘待盤點 | unverified | [元件面](images/hardware/actual/hw479-rgb-led-module-actual-component-side.jpg)／[焊接面](images/hardware/actual/hw479-rgb-led-module-actual-solder-side.jpg)；可見`HW-479`及`B`／`G`／`R`／`-`絲印 | 尚未通電；先以實物與量測確認共用腳及控制邏輯，不直接套用KY-016假設 |
| BUZZER-T01 | `HW-508`蜂鳴器模組；購買頁稱KY-012有源蜂鳴器 | 已取得1個實物；其餘待盤點 | unverified | [目前元件面](images/hardware/actual/hw508-buzzer-module-actual-component-side.jpg)可辨識`HW-508`，但焦點不足 | 補拍垂直元件面、焊接面、三針絲印及蜂鳴器標籤；未確認有源／無源與工作電壓前不通電 |
| SERVO-T01 | Tower Pro Micro Servo 9g SG90 | 已取得至少1個實物；總數待盤點 | unverified | [標籤、三線插頭與舵盤](images/hardware/actual/sg90-tower-pro-9g-servo-actual-label-connector-accessories.jpg) | 尚未通電；確認外部電源、共地、線序、安全角度及購買選項的180度行程 |
| POWER-4AA-T01 | 4AA有蓋電池盒；購買頁稱帶開關 | 已取得至少1個實物；總數待盤點 | unverified | [盒蓋與紅黑裸線](images/hardware/actual/4aa-battery-holder-actual-cover-and-leads.jpg)；照片未顯示開關 | 不裝電池；補拍開關側、盒內四槽、紅黑線末端與極性，再決定安全轉接端子 |

## 已驗證組合

Week 4新增的220 Ω／330 Ω量程比較、KY兩條件校正與DHT11品質流程，
目前只有[文件／編譯／host驗證紀錄](lab_notes/2026-09-05-week4-material-review.md)，
**未新增實機通過組合**。RESISTOR-KIT需核對實物色環與電表提示；KY需新基準與獨立驗證；
DHT11-T01需確認三腳功能、3.3 V供電、DATA上拉／邏輯電壓、GPIO及Upload／真實讀值。
母對母接法只在上述profile核准後執行；公開程式保持GPIO=-1與DHT人工核准閘門false。
軟體f注入不等於拔線測試，r取消不等於真實恢復成功。本次不修改既有Week 2／3實驗紀錄。

每一列必須能對應一份 `docs/lab_notes/` 紀錄與 Git commit。

| 組合 ID | Board／modules | 電源與邏輯準位 | Firmware／commit | Tool／library versions | 驗證結果 | Lab note |
|---|---|---|---|---|---|---|
| BASE-T01-20260827 | BOARD-T01；無外接模組 | 筆電USB經板背`COM`接頭；GPIO未接線 | working tree；Week 2 board-check | Arduino IDE 2.3.10；CLI 1.5.1；Arduino-ESP32 3.3.11 | compile、Upload、hash、RTS reset、UART Serial、16 MB Flash及8 MB PSRAM通過 | [2026-08-27 BOARD-T01 basic validation](lab_notes/2026-08-27-board-t01-basic-validation.md) |
| GPIO5-T01-20260830 | BOARD-T01；GPIO5只接A830L高阻抗電壓量測 | 筆電USB經板背`COM`接頭；GND→PGND、GPIO5→TPO | working tree；Week 3 GPIO voltage cycle | Arduino IDE 2.3.10；Arduino-ESP32 3.3.11；A830L DC 20 V | compile、Upload、hash及RTS reset通過；Serial命令與穩態實測對應：HIGH約3.3 V、LOW 0 V；Reset後Serial回到`startup=LOW`；未量Reset瞬間 | [2026-08-30 Week 3 guided walkthrough](lab_notes/2026-08-30-week3-guided-walkthrough.md) |

## 故障與隔離

| 日期 | Hardware ID | 現象 | 已做測試 | 是否停止使用 | 後續處理 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 每次實驗結束

1. 斷電並將致動器回到安全位置。
2. 記錄板卡、模組、GPIO、電源、library、程式 commit 與測試結果。
3. 更新保管位置、使用狀態、缺件、故障與下一步。
4. 在 `docs/lab_notes/` 建立日期紀錄。
5. 確認 secrets 與本機 IP 未進 Git，再 commit、push。
