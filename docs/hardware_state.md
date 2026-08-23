# Hardware State

這份文件讓兩台電腦與不同 Codex task 知道實體器材最後被怎麼使用。每次
實驗前先讀，實驗後更新。不要記 Wi-Fi 密碼、token 或學生個資。

## 狀態代碼

- `unverified`：只有購買／外觀資訊，尚未完成基本實機測試。
- `basic-pass`：已確認上電、上傳或單一功能。
- `scenario-pass`：已在指定接線、電源、library 與程式版本完成情境測試。
- `fault`：有可重現故障或疑似損壞，停止借用。
- `retired`：不再使用。

## 開發板

| ID | 品項 | 狀態 | 最近電腦／日期 | 已驗證 | GPIO／供電設定 | 已知問題 | 下一步 |
|---|---|---|---|---|---|---|---|
| BOARD-T01 | ESP32-S3-DevKitC-1 N16R8 | unverified |  |  |  |  | 執行完整 Week 2 target test 並建立 lab note |
| BOARD-T02 | ESP32-S3-DevKitC-1 N16R8 | unverified |  |  |  |  | 核對模組絲印、設定、Upload 與 Serial |
| BOARD-T03 | ESP32-S3-DevKitC-1 N16R8 | unverified |  |  |  |  | 核對模組絲印、設定、Upload 與 Serial |

## 教師材料箱

| ID | 主要內容 | 狀態 | 借用者／位置 | 缺件或問題 | 最近盤點 |
|---|---|---|---|---|---|
| KIT-T01 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T02 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |
| KIT-T03 | ESP32、感測、RGB、蜂鳴器、線材、麵包板 | unverified |  |  |  |

## 已驗證組合

每一列必須能對應一份 `docs/lab_notes/` 紀錄與 Git commit。

| 組合 ID | Board／modules | 電源與邏輯準位 | Firmware／commit | Tool／library versions | 驗證結果 | Lab note |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## 故障與隔離

| 日期 | Hardware ID | 現象 | 已做測試 | 是否停止借用 | 後續處理 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 每次實驗結束

1. 斷電並將致動器回到安全位置。
2. 記錄板卡、模組、GPIO、電源、library、程式 commit 與測試結果。
3. 更新借用位置、缺件、故障與下一步。
4. 在 `docs/lab_notes/` 建立日期紀錄。
5. 確認 secrets 與本機 IP 未進 Git，再 commit、push。
