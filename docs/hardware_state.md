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
| BOARD-T01 | YD-ESP32-S3 Type-A V1.5；ESP32-S3-WROOM-1 N16R8 | basic-pass | Windows／2026-08-27 | 正反面絲印、向下44腳；`USB`接頭列舉為COM7；`COM`接頭列舉為CH343 COM8（VID 1A86、PID 55D3）；Arduino-ESP32 3.3.11完成compile、115200-baud Upload、hash驗證、RTS自動重設及UART Serial；runtime回報ESP32-S3 revision 2、240 MHz、Flash 16777216 bytes、PSRAM 8388608 bytes | 只以`COM`接頭USB供電；尚未接GPIO | 採購頁稱DevKitC-1但實物PCB為YD版型；GPIO profile尚未驗證 | 在板上貼`BOARD-T01`，驗證GPIO4／GPIO5候選profile |
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
| INPUT-SWITCH | 外形符合6×6 mm四腳輕觸按鈕 | 10顆散裝實物；來源待核對 | unverified | [俯視](images/hardware/actual/tact-switch-6x6mm-4pin-actual-top.jpg)／[側視](images/hardware/actual/tact-switch-6x6mm-4pin-actual-side.jpg)；可見金屬上蓋、中央按鍵與成對接腳 | 補拍底面四腳排列；斷電以萬用電表確認同側常通、未按跨側開路及按下跨側導通，再決定麵包板方向 |
| RESISTOR-KIT | 常用電阻包 | 3包；存放學校 | unverified | 購買畫面；尚無實物照片 | 到校後拍包裝阻值標示，使用前以萬用電表抽測 |
| KY018-T01 | KY-018相容光敏電阻模組 | 已取得1個實物；其餘待盤點 | unverified | [元件面](images/hardware/actual/ky018-photoresistor-module-actual-component-side.jpg)與[焊接面](images/hardware/actual/ky018-photoresistor-module-actual-solder-side.jpg)；可見光敏電阻、三針排針、`S`與`-` | 補拍排針絲印近照，確認`S`／`+`／`-`順序後再決定接線；尚未通電 |
| DHT11-T01 | 購買頁稱YS-31的DHT11三線模組 | 已取得1個實物；其餘待盤點 | unverified | [元件面與三線](images/hardware/actual/dht11-3pin-module-actual-component-side-with-cable.jpg)／[焊接面與三線](images/hardware/actual/dht11-3pin-module-actual-solder-side-with-cable.jpg) | 斷電取下連接線後補拍三針絲印；線色不能直接當作VCC／DATA／GND證據 |
| RGB-T01 | `HW-479`四針RGB LED模組；購買頁稱KY-016 | 已取得1個實物；其餘待盤點 | unverified | [元件面](images/hardware/actual/hw479-rgb-led-module-actual-component-side.jpg)／[焊接面](images/hardware/actual/hw479-rgb-led-module-actual-solder-side.jpg)；可見`HW-479`及`B`／`G`／`R`／`-`絲印 | 尚未通電；先以實物與量測確認共用腳及控制邏輯，不直接套用KY-016假設 |
| BUZZER-T01 | `HW-508`蜂鳴器模組；購買頁稱KY-012有源蜂鳴器 | 已取得1個實物；其餘待盤點 | unverified | [目前元件面](images/hardware/actual/hw508-buzzer-module-actual-component-side.jpg)可辨識`HW-508`，但焦點不足 | 補拍垂直元件面、焊接面、三針絲印及蜂鳴器標籤；未確認有源／無源與工作電壓前不通電 |
| SERVO-T01 | Tower Pro Micro Servo 9g SG90 | 已取得至少1個實物；總數待盤點 | unverified | [標籤、三線插頭與舵盤](images/hardware/actual/sg90-tower-pro-9g-servo-actual-label-connector-accessories.jpg) | 尚未通電；確認外部電源、共地、線序、安全角度及購買選項的180度行程 |
| POWER-4AA-T01 | 4AA有蓋電池盒；購買頁稱帶開關 | 已取得至少1個實物；總數待盤點 | unverified | [盒蓋與紅黑裸線](images/hardware/actual/4aa-battery-holder-actual-cover-and-leads.jpg)；照片未顯示開關 | 不裝電池；補拍開關側、盒內四槽、紅黑線末端與極性，再決定安全轉接端子 |

## 已驗證組合

每一列必須能對應一份 `docs/lab_notes/` 紀錄與 Git commit。

| 組合 ID | Board／modules | 電源與邏輯準位 | Firmware／commit | Tool／library versions | 驗證結果 | Lab note |
|---|---|---|---|---|---|---|
| BASE-T01-20260827 | BOARD-T01；無外接模組 | 筆電USB經板背`COM`接頭；GPIO未接線 | working tree；Week 2 board-check | Arduino IDE 2.3.10；CLI 1.5.1；Arduino-ESP32 3.3.11 | compile、Upload、hash、RTS reset、UART Serial、16 MB Flash及8 MB PSRAM通過 | [2026-08-27 BOARD-T01 basic validation](lab_notes/2026-08-27-board-t01-basic-validation.md) |

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
