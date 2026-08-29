# IoT 設備圖片目錄

本目錄保存已購設備與待購必要零件的圖片狀態。正式教學與接線以使用者實物照片、
板上絲印、資料表及實測為準，不以外觀相似的網路圖片判定腳位或電壓。

- `actual/`：教師持有設備的實物照片；白底圖亦由實物照片後製而成。
- `orders/`：已完成訂單或購物紀錄截圖。
- `products/`：個別商品頁參考圖。
- `product-cards/`：由訂單截圖裁切整理的商品辨識卡。
- `guides/`：拍攝或辨識指引，不是實物照片與接線依據。

- [學生用單品辨識卡](item_gallery.md)：已後製完成的獨立商品卡。
- [學生用訂單設備圖鑑](order_gallery.md)：五張原始訂單參考圖與品項對照。
- [蝦皮商品圖與實物照片補拍清單](reshoot_checklist.md)：26項已購設備及後來找到的散裝按鈕之圖片狀態與補拍規則。
- [第一批補拍零件外形示意圖](guides/week02-05-hardware-reshoot-reference.png)：編號06至13的外形辨識參考；不是腳位或接線依據。
- [Week 2學生器材辨識](../../../IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb#二本週學生器材辨識)：Week 2 的器材規格與數量。

## 狀態

- `商品參考圖`：可確認購買選項，但不能取代收到後的正反面實物照。
- `待拍`：尚未取得實物照片。
- `已拍`：已保存可辨識正面、背面與接腳標示的照片。
- `已驗證`：除了照片，亦已有對應的 `hardware_state.md` 與 lab note。

## 設備與圖片狀態

| 品項 | 規格／數量 | 建議檔名 | 圖片 | 狀態 |
|---|---|---|---|---|
| ESP32-S3 開發板 | 採購頁稱DevKitC-1 N16R8；第一片實物為YD-ESP32-S3 Type-A V1.5、ESP32-S3-WROOM-1 N16R8、向下44腳 | `actual/yd-esp32-s3-type-a-v1-5-n16r8-actual-*` | [商品頁截圖](products/shopee-esp32-s3-dev-board-n16r8-product-page.png)／[實物正面白底圖](actual/yd-esp32-s3-type-a-v1-5-n16r8-actual-front-white-background.png)／[實物背面白底圖](actual/yd-esp32-s3-type-a-v1-5-n16r8-actual-back-white-background.png)／[主要元件辨識修正版](guides/yd-esp32-s3-front-annotated-components-v2.png)／[400孔麵包板B3-J24對孔實照](actual/yd-esp32-s3-on-400-breadboard-b3-j24-fit-check.jpg) | 第一片實物已拍；元件圖已核對`RX`、`TX`、`PWR`三個指示燈的位置；400孔麵包板實測為左排B3～B24、右排J3～J24，直接安裝沒有右側接線欄且遮擋按鈕，正式實驗改用板外公對母杜邦線；實機GPIO待驗；其餘兩片待逐片核對 |
| LM2596S 降壓模組 | 可調式 ×3 | `actual/lm2596s-buck-module-actual-*` | [訂單圖1](orders/shopee-aroundtw-01-prototyping-motors-power.png) | 商品參考圖；補拍優先 |
| L298N 馬達驅動板 | 雙通道 ×2 | `actual/l298n-motor-driver-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖；補拍優先 |
| 4AA 帶開關電池盒 | 4顆AA ×2；實物照片尚未顯示開關 | `actual/4aa-battery-holder-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png)／[實物盒蓋與紅黑裸線](actual/4aa-battery-holder-actual-cover-and-leads.jpg) | 盒蓋與線端已拍；須補開關側、盒內與線端近照；未通電 |
| HC-SR04 | 超音波距離模組 ×3 | `actual/hc-sr04-module-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖；補拍優先 |
| HC-SR501 PIR | 人體紅外線感應 ×3 | `actual/hc-sr501-pir-module-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png) | 商品參考圖；補拍優先 |
| YS-31 DHT11 | 購買頁名稱；實物為DHT11三線模組 ×3 | `actual/dht11-3pin-module-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png)／[實物元件面與連接線](actual/dht11-3pin-module-actual-component-side-with-cable.jpg)／[實物焊接面與連接線](actual/dht11-3pin-module-actual-solder-side-with-cable.jpg) | 外形已辨識；PCB型號與三針絲印需補拍，線色尚不能作腳位證據 |
| KY-018 | 光敏模組 ×3 | `actual/ky018-photoresistor-module-actual-*` | [訂單圖4](orders/shopee-aroundtw-04-photoresistor-servo-breadboard.png)／[實物元件面](actual/ky018-photoresistor-module-actual-component-side.jpg)／[實物焊接面](actual/ky018-photoresistor-module-actual-solder-side.jpg) | 實物已辨識；排針旁`S`與`-`可見，中間電源絲印仍需近照確認；未進行接線或實機測試 |
| 6×6 輕觸開關 | 外形符合四腳常開瞬時按鈕；已有10顆散裝實物 | `actual/tact-switch-6x6mm-4pin-actual-*` | [購物車參考圖](orders/shopee-aroundtw-01-prototyping-motors-power.png)／[實物俯視](actual/tact-switch-6x6mm-4pin-actual-top.jpg)／[實物側視](actual/tact-switch-6x6mm-4pin-actual-side.jpg)／[麵包板通斷實測接法](actual/tact-switch-6x6mm-4pin-breadboard-continuity-actual.jpg) | 外形、數量與其中一顆的導通關係已確認；目前方向下第27列為一組、第29列為另一組，未按不跨組導通、按住跨組導通、放開恢復不導通；購買來源及5 mm高度待確認 |
| OLED 顯示模組 | 0.96 吋、4 針 I2C ×5 | `actual/oled-096-i2c-module-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖；補拍優先 |
| OLED 螢幕支架 | 0.96 吋 ×2 | `actual/oled-096-bracket-actual-*` | [訂單圖1](orders/shopee-aroundtw-01-prototyping-motors-power.png) | 商品參考圖；補拍建議 |
| KY-016 RGB LED | 購買頁名稱；實物PCB為`HW-479`四針RGB模組 ×3 | `actual/hw479-rgb-led-module-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png)／[實物元件面](actual/hw479-rgb-led-module-actual-component-side.jpg)／[實物焊接面](actual/hw479-rgb-led-module-actual-solder-side.jpg)／[補充失焦焊接面](actual/hw479-rgb-led-module-actual-solder-side-view-02-soft-focus.jpg) | `HW-479`與`B`／`G`／`R`／`-`可辨識；補充失焦照只作實物紀錄；未通電、共用腳與控制邏輯待驗 |
| 8 位 WS2812B | 可定址 RGB LED ×2 | `actual/ws2812b-8led-module-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png) | 商品參考圖過暗；補拍優先 |
| KY-012 | 購買頁稱有源蜂鳴器；實物PCB為`HW-508` ×3 | `actual/hw508-buzzer-module-actual-*` | [訂單圖3](orders/shopee-aroundtw-03-esp32-sensors-lighting-power.png)／[目前實物元件面](actual/hw508-buzzer-module-actual-component-side.jpg) | `HW-508`可辨識，但照片失焦；有源／無源、腳位與工作電壓仍待確認 |
| SG90 舵機 | Tower Pro Micro Servo 9g SG90；購買選項為180度 ×6 | `actual/sg90-tower-pro-9g-servo-actual-*` | [訂單圖4](orders/shopee-aroundtw-04-photoresistor-servo-breadboard.png)／[實物標籤、插頭與附件](actual/sg90-tower-pro-9g-servo-actual-label-connector-accessories.jpg)／[實物包裝補充視角](actual/sg90-tower-pro-9g-servo-actual-packaging-view-02.jpg) | 外觀與標籤可用；180度行程、線序與供電尚未實機驗證 |
| MG90S 舵機 | 金屬齒輪 ×4 | `actual/mg90s-servo-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖；補拍建議 |
| TT 馬達 | 雙軸、1:120 ×4 | `actual/tt-motor-1to120-actual-*` | [訂單圖1](orders/shopee-aroundtw-01-prototyping-motors-power.png) | 商品參考圖；補拍建議 |
| TT 馬達輪胎 | 橡膠輪 ×4 | `actual/tt-motor-wheel-actual-*` | [訂單圖1](orders/shopee-aroundtw-01-prototyping-motors-power.png) | 商品參考圖；低優先 |
| 15 mm 萬向球 | 金屬 ×2 | `actual/ball-caster-15mm-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖不完整；補拍建議 |
| 杜邦線 | 公對母、20 cm、40P ×6 排 | `actual/jumper-wires-assorted-actual.jpg` | [商品辨識卡](product-cards/shopee-jumper-wire-20cm-male-to-female-product-card.png)／[三種實物合照](actual/jumper-wires-assorted-actual.jpg) | 實物合照已拍；個別接頭近照待補 |
| 杜邦線 | 母對母、20 cm、40P ×6 排 | `actual/jumper-wires-assorted-actual.jpg` | [商品辨識卡](product-cards/shopee-jumper-wire-20cm-female-to-female-product-card.png)／[三種實物合照](actual/jumper-wires-assorted-actual.jpg) | 實物合照已拍；個別接頭近照待補 |
| 杜邦線 | 公對公、20 cm、40P ×6 排 | `actual/jumper-wires-assorted-actual.jpg` | [商品辨識卡](product-cards/shopee-jumper-wire-20cm-male-to-male-product-card.png)／[三種實物合照](actual/jumper-wires-assorted-actual.jpg) | 實物合照已拍；已用兩條完成麵包板通斷測試 |
| 400 孔麵包板 | 8.5 × 5.5 cm ×4 | `actual/breadboard-400-tie-point-actual-top.jpg` | [商品辨識卡](product-cards/shopee-breadboard-400-product-card.png)／[實物俯視圖](actual/breadboard-400-tie-point-actual-top.jpg) | 實物已拍；左側五孔組、中央溝槽、列間、左側紅軌及紅藍軌已完成通斷測試 |
| 常用電阻包 | 220Ω 至 100KΩ ×3 | `actual/resistor-kit-actual-*` | [訂單圖5](orders/shopee-loyi-maker-05-resistors-storage.png) | 已購、存放學校；到校後補拍包裝阻值標示與實物 |
| A830L 萬用電表 | 含電池 ×1 | `actual/a830l-multimeter-actual-*` | [訂單圖1](orders/shopee-aroundtw-01-prototyping-motors-power.png) | 商品參考圖；補拍建議 |
| 無格透明收納盒 | ×4 | `actual/storage-box-clear-actual-*` | [訂單圖2](orders/shopee-aroundtw-02-drivers-servos-sensors-displays.png) | 商品參考圖；低優先 |
| 手提雙層零件盒 | ×3 | `actual/storage-box-double-layer-actual-*` | [訂單圖5](orders/shopee-loyi-maker-05-resistors-storage.png) | 商品參考圖；低優先 |

## 實物拍攝方式

1. 將同一類零件放在白紙上，旁邊放寫有品項名稱的紙條。
2. 先拍一張全貌，再拍正面、背面及接腳絲印；一張照片可同時包含多項。
3. 板卡型模組避免反光，確保型號、VCC、GND 與訊號腳可以放大辨識。
4. 舵機、馬達與電池盒另拍插頭、線色及標籤。
5. 不需通電；照片不可包含 Wi-Fi 密碼、序號、地址或其他個資。

收到照片後，依 `品項-front`、`品項-back`、`品項-pins` 命名，更新上表，
再於實機驗證後將狀態提升為 `已驗證`。

生成式背景移除可能改變模糊文字或細小元件，後製圖不得取代未後製原圖作為
規格、腳位、焊接品質或故障證據。若原圖含人物或個資而不適合提交repository，
原圖可留在受控本機，repository只保存白底展示圖及明確限制說明。
