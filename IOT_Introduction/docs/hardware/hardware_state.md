# Hardware State

這份文件讓兩台電腦與不同 Codex task 知道實體器材最後被怎麼使用。每次
實驗前先讀，實驗後更新。不要記 Wi-Fi 密碼、token 或學生個資。

## 最新交接：2026-09-07

2026-09-08軟體補充：Week 4／7正式程式新增HW-508受限波形選項；Week 5～7新增
`OLED_CONTROLLER=1315`相容性選項，原有效準位／SSD1306預設與所有核准閘門保留。
這是程式與教材修正，沒有新增實機通過紀錄；舵機及供電負載由教師晚間處理。
檢查結果與尚未實測項目見[2026-09-08修正紀錄](../lab_notes/2026-09-08-materials-compatibility-fixes.md)。

**先讀[BOARD-T01組裝與實測紀錄](../lab_notes/2026-09-07-week7-bringup.md)。**
下列為目前狀態，後方舊表保留各日期歷史，不能把Week 2／3孔位直接套到今天的作品。

| 部分 | 目前狀態 | 證據與限制 |
|---|---|---|
| BOARD-T01、KY、兩鍵 | partially verified | GPIO4目前是KY；5為Start、6為Finish。使用者確認兩鍵按放1→0→1、光線數字會變；目前遮光較小，與舊方向不同，校正未完成 |
| OLED | basic-pass，限目前個體 | GND b3、VDD b6、SDA8、SCK9；0x3C與SSD1315建構子有畫面回報；不證明晶片身分、拉高電壓或全班profile |
| RGB-T01 | basic-pass，限三色觀察 | R15／G16／B17、−e3；使用者回報三色正確、HIGH有效，未量各色電流或光學干擾 |
| BUZZER-T01 | partially verified | GPIO18經1 kΩ串聯至HW-508+、−c22、中間不接；2000 Hz／200 ms命令後有聲回報，未量電流、真實聲長、Reset瞬態或確認內部型式 |
| POWER-4AA-T01、降壓板 | partially verified，僅空載 | 實際四顆1.5 V、電池6.6 V；既有V591降壓板OUT4.85 V、電表4.76 V。後續已核准課程採同類供電架構並按組共用，取代原1.2 V鎳氫規劃；仍未核准舵機負載 |
| SERVO-T01 | unverified | 只提出GPIO7與獨立第23／24列的斷電候選接法，尚未收到接線完成；未通電、未定位、未測停止 |

目前測試來源已保存於[BOARD-T01診斷程式](../../examples/board_t01_diagnostics/README.md)。
已要求電池OFF、USB拔除，尚未收到最終斷電完成回覆；明天先確認實物與接點，接續舵機。
正式Week 4～7完整程式仍為GPIO=-1／gate=false，分項有反應不等於正式遊戲已相容或已完成。
OLED與HW-508已提供程式設定選項；KY目前校正及正式遊戲實機整合仍待確認，不改學生採購規格、數量與預算。

## 狀態代碼

- `unverified`：只有購買／外觀資訊，尚未完成基本實機測試。
- `partially verified`：已有部分外觀或量測證據，不代表整批與全部情境通過。
- `basic-pass`：已確認上電、上傳或單一功能。
- `scenario-pass`：已在指定接線、電源、library 與程式版本完成情境測試。
- `fault`：有可重現故障或疑似損壞，停止使用並隔離。
- `retired`：不再使用。

## 開發板歷史基準（目前接線以上方最新交接為準）

| ID | 品項 | 狀態 | 最近電腦／日期 | 已驗證 | GPIO／供電設定 | 已知問題 | 下一步 |
|---|---|---|---|---|---|---|---|
| BOARD-T01 | YD-ESP32-S3 Type-A V1.5；ESP32-S3-WROOM-1 N16R8 | basic-pass | Windows／2026-08-30 | 正反面絲印、向下44腳；`USB`接頭列舉為COM7；`COM`接頭列舉為CH343 COM8（VID 1A86、PID 55D3）；Arduino-ESP32 3.3.11完成compile、115200-baud Upload、hash驗證、RTS自動重設及UART Serial；runtime回報ESP32-S3 revision 2、240 MHz、Flash 16777216 bytes、PSRAM 8388608 bytes；在400孔麵包板實際對孔為左排`B3～B24`、右排`J3～J24`；板外候選接線使用棕色GND→`a22`、紅色GPIO4→`a27`、橘色GPIO5→`a20`及`b22 → a29`分接，斷電量測按鈕放開不蜂鳴、按住蜂鳴、放開恢復不蜂鳴，且TPO `b20`對TPG `c22`不蜂鳴；GPIO4／GPIO5候選韌體完成IDE Verify、302752-byte Upload、hash驗證與RTS自動Reset；五次按鈕操作皆得到GPIO4按下LOW／放開HIGH事件；Week 3板外測試點斷電隔離檢查未出現持續蜂鳴，USB供電時P3V3穩定接觸實測約3.2 V；`5Vin`對GND初測約0.5 V、重測約-0.6 V，實物照片確認`IN-OUT`焊盤未橋接，與exact-board資料所述USB VBus不會送至開路`5Vin`相符；GPIO5在同一正向量測下實測HIGH約3.3 V、LOW 0 V，Reset後Serial重新顯示`startup=LOW`及`phase=LOW` | `COM`接頭USB基本驗證已完成；GPIO4輸入事件通過；BOARD-T01的GPIO5已通過穩態LOW／HIGH輸出電壓；P3V3約3.2 V作基本功能證據；`5Vin`只作外部5 V輸入，不是USB 5 V輸出 | 採購頁稱DevKitC-1但實物PCB為YD版型；GPIO5穩態結果只適用BOARD-T01，不代表BOARD-T02／T03或整批板卡已通過；萬用電表無法證明Reset瞬間沒有短脈衝；單片400孔麵包板直接安裝只留下左側A欄，右側沒有可接線欄，且USB端遮擋第27／29列按鈕，因此不採直接安裝；不得焊接或橋接`IN-OUT`作學生實驗 | 對BOARD-T02／T03重複GPIO profile檢查；Reset瞬間與故障安全狀態留到後續狀態機／安全單元；見[Week 2候選profile測試紀錄](../lab_notes/2026-08-29-board-t01-gpio4-gpio5-candidate-test.md)及[Week 3引導實測紀錄](../lab_notes/2026-08-30-week3-guided-walkthrough.md) |
| BOARD-T02 | 採購頁稱ESP32-S3-DevKitC-1 N16R8；實物PCB待核對 | unverified |  |  |  | 不得假設與BOARD-T01同版 | 核對正反面絲印、設定、Upload與Serial |
| BOARD-T03 | 採購頁稱ESP32-S3-DevKitC-1 N16R8；實物PCB待核對 | unverified |  |  |  | 不得假設與BOARD-T01同版 | 核對正反面絲印、設定、Upload與Serial |

## 教師材料箱

| ID | 主要內容 | 狀態 | 保管位置／使用狀態 | 缺件或問題 | 最近盤點 |
|---|---|---|---|---|---|
| KIT-T01 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T02 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T03 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |

## 散裝模組與材料歷史基準（截至2026-09-06）

| ID | 品項 | 數量／位置 | 狀態 | 已有證據 | 下一步 |
|---|---|---|---|---|---|
| INPUT-SWITCH | 外形符合6×6 mm四腳常開瞬時按鈕 | 10顆散裝實物；來源待核對 | partially verified | [俯視](../images/hardware/actual/Pushbutton_1.jpg)／[側視](../images/hardware/actual/Pushbutton_2.jpg)／[麵包板實測接法](../images/hardware/actual/Pushbutton_3.jpg)；2026-08-29以A830L抽測其中一顆：目前方向下第27列兩腳為固定同組，第29列為另一組；跨組未按不蜂鳴、按住蜂鳴、放開恢復不蜂鳴；接入BOARD-T01候選板外線路後，以TPG `c22`與按鈕列`b27`重測仍為放開不蜂鳴、按住蜂鳴、再放開不蜂鳴，見[量測紀錄](../lab_notes/2026-08-29-a830l-button-continuity-validation.md) | 其餘9顆尚未逐顆抽測，不能由一顆結果推定全部通過；正式上課前抽測同批按鈕的一致性；BOARD-T01既有GPIO4按鈕事件見上表；其他按鈕與新版Start／Finish線路仍待逐項確認 |
| RESISTOR-KIT | 常用電阻包 | 採購紀錄3包；至少1批實物已拍照，其餘位置未重新盤點 | partially verified | [實物與手寫阻值標示](../images/hardware/actual/Resistor_1.png)：可見220、330、1k、10k、4k7、100k等標示；教師在本對話回報量220 Ω時20k檔顯示0.22、200檔顯示1，表筆相碰最後為0。照片證明有這批實物，文字回報不是電表精度驗證，也未證明每顆阻值 | 330 Ω與其餘電阻待逐顆選用時確認；保留未完成的Week 3固定分壓實機待驗，不要求重做已完成觀察。2026-09-06只整理既有照片與回報，未新增實體量測；公開範例與計算不等於所有器材已買齊或實測通過 |
| KY018-T01 | KY-018相容光敏電阻模組 | 已取得1個實物；其餘待盤點 | basic-pass | [元件面](../images/hardware/actual/KY018_2.jpg)、[焊接面](../images/hardware/actual/KY018_3.jpg)與[排針近照](../images/hardware/actual/KY018_1.jpg)；可辨認獨立`S`、`-`及中央`A／S1／R1`，中央文字不當作排針功能；斷電量測支持固定電阻接於中間排針與S、光敏電阻接於S與−的模型。2026-09-05先以b6供電、b3共地且S未接GPIO，在A830L直流20V、紅表筆碰S／黑表筆碰GND的引導下，手持回報室內光0.62 V、遮光1.75 V、恢復室內光0.55 V；basic-pass僅指這片模組此接法的基本電壓反應。其後使用者確認供電改c6、−改c3，仍與BOARD-T01的a6 3V3及a3 GND同列；S黃線→a15／c15→藍線。候選ADC程式已回報Upload資料校驗成功；其後取得9筆原始Serial輸出，sample4194～4202、間隔500 ms，前6筆raw 248～293、後3筆678～683，該段光線是否改變仍待確認；後續明確標記遮光的5筆sample4527～4531為raw 1419～1450；一般室內光5筆sample4598～4602為275～287，兩組短樣本範圍不重疊，支持本接法遮光raw較大的初步反應，Serial介面回報COM8／115200 baud，詳見[電阻、分壓與ADC候選進度](../lab_notes/2026-09-05-ky018-resistance-and-voltage-divider.md) | 讀值為使用者文字回報，非代理直接量測；20k／200k差異未釐清，不要求作為ADC前置重測；已有兩種光線各5筆raw的基本反應回報；已取得本輪一般光及主動補測陰暗處的電表／raw先後對照；未驗證供電穩定性、同步量測、ADC精度或lux校正。最新回報韌體為GPIO4 ADC候選程式，不再是GPIO5循環程式；依斷USB後接c15藍線到GPIO4的引導，使用者回覆next並在上電／Serial引導後貼出raw；已有程式輸出證據；本輪電壓回報見下，無新接線照片或開場文字。已有遮光與一般光各5筆；最新另收到sample5068～5077連續10筆，raw 2159～2195、間隔500 ms，使用者其後明確確認為一般燈下、沒有遮光，作為目前這輪基準；與較早275～287一般光的差異原因未明，兩輪資料分開保存。使用者明確要求pass、不再重收遮光；保留各輪資料與限制，不把略過當成驗證通過。使用者依斷USB、PWR熄滅、電表OFF的引導回報e15公對公量測延長線已接好；無新照片或通斷量測。其後依直流20 V、紅碰e15 S／黑碰e3 GND的一般光量測引導回報0.52（依上下文記約+0.52 V）；無新電表畫面。其後依保持同條件的引導取得sample376～380新5筆raw 691～701，間隔500 ms，作為0.52 V之後的同條件觀察，不是同步校正；計數變小與前述斷USB重啟相容，不能跨兩次開機混算時間。在斷電完成回覆之前，使用者主動補測「把光敏放到陰暗處」：電表1.14（依既有直流20 V與S對GND操作上下文記約+1.14 V），接著回報sample601～605的5筆raw 1007～1020、間隔500 ms；保留原始情境標籤「移到陰暗處」，不改寫為固定位置遮光。本輪0.52 V／raw 691～701與陰暗處1.14 V／raw 1007～1020皆為先後文字回報，支持電壓與raw變大的方向比較，不構成同步量測、精度或lux校正；移動造成的光照幾何與接觸變化未獨立排除。下一步放下表筆、關閉Serial、拔USB確認PWR熄滅並將電表OFF後進行Discussion；尚未收到斷電完成回覆。改線前仍須拔USB、確認PWR熄滅。先前拒絕重收遮光的決定仍保留，這次主動補測不代表同意反覆補足取樣，也未湊成各條件同輪10筆的完整驗證。不要把GPIO4數位輸入通過或Upload成功當成ADC profile已公布 |
| DHT11-T01 | 購買頁稱YS-31的DHT11三線模組 | 已取得1個實物；其餘待盤點 | unverified | [元件面與三線](../images/hardware/actual/DHT11_1.jpg)／[焊接面與三線](../images/hardware/actual/DHT11_2.jpg) | 斷電取下連接線後補拍三針絲印；線色不能直接當作VCC／DATA／GND證據 |
| RGB-T01 | `HW-479`四針RGB LED模組；購買頁稱KY-016 | 已取得1個實物；其餘待盤點 | unverified | [2026-09-06元件面](../images/hardware/actual/RGB_HW479_1.jpg)可見單顆LED、`HW-479`、`B／G／R／−`及三顆板上電阻；[原焊接面](../images/hardware/actual/RGB_HW479_2.jpg)保留 | 共用腳、各色電阻值、控制準位、3.3 V下各色電流與實際燈色仍待確認；不能用照片代替實測，不與WS2812B-8混用 |
| BUZZER-T01 | `HW-508`蜂鳴器模組；購買頁稱KY-012有源蜂鳴器 | 已取得1個實物；其餘待盤點 | unverified | 已補[2026-09-06元件面](../images/hardware/actual/Buzzer_HW508_1.jpg)與[焊接面](../images/hardware/actual/Buzzer_HW508_2.jpg)；可辨識HW-508、三針及兩側−／+，中間腳功能不明 | 接續核對模組電路／規格及斷電導通關係，再決定可行驅動；照片不證明有源型式、額定電壓、內建驅動或GPIO可承受的電流，不提供猜測接法 |
| SERVO-T01 | 標籤為Tower Pro Micro Servo 9g SG90 | 已取得至少1個實物；總數待盤點 | unverified | 已補[拆袋標籤、三線母接頭與舵盤螺絲](../images/hardware/actual/SG90_1.jpg)；可見深色、紅色及黃色線 | 計畫以POWER-4AA-T01與四顆1.2 V鎳氫電池作外部供電；尚未量測或操作。仍須確認線序、實際供電、共地、安全角度與停止；不強制滿180度 |
| POWER-4AA-T01 | 四槽AA電池盒、帶開關、紅黑裸線 | 已取得至少1個實物；總數待盤點 | unverified | [新照片](../images/hardware/actual/BatteryHolder4AA_1.jpg)可見ON／OFF開關與裸線；四槽來自使用者文字確認，不是假稱照片拍到內部；使用者打算使用每顆1.2 V電池 | 課程採AA鎳氫方案，四顆串聯標稱4.8 V；未證明電池／相容充電器已備妥，未量空載、滿電或負載電壓。接舵機前確認極性、牢固絕緣連接及共地，不限定某款轉接板，不接ESP32的3V3／GPIO／未橋接5Vin |
| DISPLAY-OLED | 已購0.96吋、4針I2C OLED（訂單規格） | 已購5個；目前位置及可用數量未重新盤點 | unverified | [已購清單](purchased_inventory.md)記錄5個、歷史單價NT$65，另有2個不含螢幕的支架；[訂單圖2](../images/hardware/orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png)與教師本次確認支持已購狀態。「新增共同用途」不是重新購買要求，不能再寫成沒有已購紀錄 | 先用已購實物核對控制器、解析度、位址、腳序、供電／SDA／SCL上拉與3.3 V邏輯相容性，再做接線與顯示測試；未測試不等於未購買，ACK不能證明控制器型號 |

## 2026-09-06補充辨識的選配器材

以下只記錄收到照片的器材，不變更原庫存數量，也不加入Week 2～7共同採購。
來源、原圖及判讀限制見[本次辨識紀錄](../lab_notes/2026-09-06-procurement-and-hardware-identification.md)。

| 器材 | 狀態 | 可見證據與限制 |
|---|---|---|
| WS2812B-8燈條 | unverified | 八顆LED，背面WS2812B-8、VCC／GND／IN／OUT；不是HW-479，未確認供電與3.3 V訊號相容性 |
| 被動紅外線動作感測器（PIR） | unverified | 白色半球透鏡、兩個調整器與跳線；外形近HC-SR501，但照片未證明確切型號及腳位 |
| 帶數字顯示的降壓模組 | unverified | 可見VIN／VOUT正負端、電感與數字顯示；不是OLED，照片不足以確認晶片型號或整板電壓／電流額定值 |
| TT減速直流馬達 | unverified | 黃色減速箱與金屬馬達；不是SG90舵機，照片未確認減速比或工作電壓 |

## 已驗證組合

2026-09-06新增／修訂的Week 3分類及Week 4～7整合，只有文件、編譯、主機替代I/O與本機瀏覽器檢查；
詳見[本輪教材驗證](../lab_notes/2026-09-06-traffic-light-course-revision.md)。**未新增實機通過組合**。
KY分類沿用可追溯的同輪基準，不混用先前不同位置／開機的短樣本湊成校正；新分類與穩定事件仍待實測。
DHT11、RGB、HW-508、OLED、SG90與負載供電／連接均須確認指定實物profile。
OLED選購規格及AA鎳氫電池方案已更新於Week 1；本次只有文件與照片確認，不新增實機結果。
公開程式GPIO保留-1、人工核准閘門false；軟體注入及主機測試不等於拔線、上電、真實聲音或實體停止。
新的Start／Finish配置、光學干擾、實體指針與停止最長延遲尚未驗證；保留既有Week 2／3實測紀錄及其限制。

每一列必須能對應一份 `IOT_Introduction/docs/lab_notes/` 紀錄與 Git commit。

| 組合 ID | Board／modules | 電源與邏輯準位 | Firmware／commit | Tool／library versions | 驗證結果 | Lab note |
|---|---|---|---|---|---|---|
| BASE-T01-20260827 | BOARD-T01；無外接模組 | 筆電USB經板背`COM`接頭；GPIO未接線 | working tree；Week 2 board-check | Arduino IDE 2.3.10；CLI 1.5.1；Arduino-ESP32 3.3.11 | compile、Upload、hash、RTS reset、UART Serial、16 MB Flash及8 MB PSRAM通過 | [2026-08-27 BOARD-T01 basic validation](../lab_notes/2026-08-27-board-t01-basic-validation.md) |
| GPIO5-T01-20260830 | BOARD-T01；GPIO5只接A830L高阻抗電壓量測 | 筆電USB經板背`COM`接頭；GND→PGND、GPIO5→TPO | working tree；Week 3 GPIO voltage cycle | Arduino IDE 2.3.10；Arduino-ESP32 3.3.11；A830L DC 20 V | compile、Upload、hash及RTS reset通過；Serial命令與穩態實測對應：HIGH約3.3 V、LOW 0 V；Reset後Serial回到`startup=LOW`；未量Reset瞬間 | [2026-08-30 Week 3 guided walkthrough](../lab_notes/2026-08-30-week3-guided-walkthrough.md) |

## 故障與隔離

| 日期 | Hardware ID | 現象 | 已做測試 | 是否停止使用 | 後續處理 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 每次實驗結束

1. 斷電並將致動器回到安全位置。
2. 記錄板卡、模組、GPIO、電源、library、程式 commit 與測試結果。
3. 更新保管位置、使用狀態、缺件、故障與下一步。
4. 在 `IOT_Introduction/docs/lab_notes/` 建立日期紀錄。
5. 確認 secrets 與本機 IP 未進 Git，再 commit、push。
