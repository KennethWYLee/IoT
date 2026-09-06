# 手機 App 與無線遙控架構

最後查核日期：2026-09-04

狀態：第一版設計決策；尚未完成 App、韌體或實機延遲測試

## 第一版決策

第一版採 **Android 優先、保留 iOS 相容性**的手機 App。無人機上的 ESP32-S3 建立受密碼保護的 Wi-Fi AP，手機連線後使用 **UDP 單播**傳送飛行控制封包。App 建議用 Flutter 製作，以便共用虛擬搖桿、狀態顯示與封包邏輯；需要處理 Wi-Fi 綁定與權限的部分再使用 Android／iOS 原生程式碼。Flutter 官方支援以單一程式碼庫整合 Android 與 iOS 平台功能，Dart 的 [`RawDatagramSocket`](https://api.dart.dev/dart-io/RawDatagramSocket-class.html)則直接提供 UDP socket；平台整合方式見 [Flutter 官方文件](https://docs.flutter.dev/platform-integration)。

BLE 暫不作第一版主要飛行鏈路，只保留作初次配對、未解鎖時的參數設定或 Wi-Fi 故障救援。飛行中只能有一個 `control owner`；若 Wi-Fi 已取得控制權，BLE 寫入不得改變油門、姿態目標或 ARM 狀態。

這個選擇已有可參考的官方實例：Espressif 的 [ESP-Drone](https://github.com/espressif/esp-drone) 讓手機連到無人機 Wi-Fi 後控制飛行，官方[操作說明](https://github.com/espressif/esp-drone/blob/master/docs/en/rst/gettingstarted.rst)也展示 Mode 2 搖桿、deadzone、最大傾角與推力設定。不過該專案自 2022 年底起只提供有限維護，而且採 GPL-3.0 授權；可以研究架構，但若複製其程式碼，必須另外處理授權義務。

## 為什麼第一版選 Wi-Fi

| 比較項目 | Wi-Fi AP + UDP 單播 | BLE GATT |
|---|---|---|
| 手機操作 | 手機須切換到無人機 Wi-Fi，飛行時可能沒有網際網路 | 不必離開原 Wi-Fi，但要處理掃描、配對及 GATT 狀態 |
| 控制資料 | 適合固定頻率、小封包、只保留最新狀態 | 可用 characteristic write／notification 傳送，但行動系統排程與 connection interval 會增加第一版量測變數 |
| 回傳資料 | 姿態、電池及連線統計可走同一個 UDP 通道 | 適合少量狀態通知，資料格式仍要自行定義 |
| 開發風險 | 網路切換、行動數據繞路與本地網路權限 | BLE 權限、配對、重連與 GATT queue |
| 第一版用途 | **主要控制鏈路** | **配對／校正／救援候選** |

ESP32-S3 可用自訂 GATT service 與 characteristic 交換 BLE 資料，實作時可參考 Espressif 的 [NimBLE GATT data exchange 指南](https://docs.espressif.com/projects/esp-idf/en/release-v5.2/esp32s3/api-guides/ble/get-started/ble-data-exchange.html)。BLE 不是不能飛，而是第一版應只驗證一條控制鏈路，避免兩套重連與失聯邏輯同時影響安全判斷。

## 系統邊界

```text
手機 Flutter App
  ├─ Mode 2 虛擬雙搖桿、ARM／DISARM、連線與電池狀態
  ├─ UDP control：50 Hz 候選值，只傳最新搖桿狀態
  └─ UDP telemetry：10–20 Hz 候選值，接收姿態與連線統計
                    │
             WPA2／WPA3 Wi-Fi AP
                    │
機上 ESP32-S3
  ├─ 通訊工作：驗證 session、序號、封包時效與控制權
  ├─ 飛控工作：IMU、姿態估測、PID、motor mixing
  └─ 安全工作：ARM 條件、timeout、傾倒／感測失效與 DISARM
```

50 Hz 與 10–20 Hz 只是桌面測試的起始值，不是已驗證的飛行參數。控制封包採 UDP 是因為舊搖桿狀態不值得排隊重送；收到新封包時就取代舊封包。HTTP 或 WebSocket 後續可用於未解鎖時的參數頁、log 下載與韌體資訊，不放在第一版搖桿的即時路徑上。

## 控制封包草案

第一版先使用固定長度二進位封包；欄位與大小要在 App 與韌體共用同一份版本定義。

| 欄位 | 用途 |
|---|---|
| `magic`、`version`、`type`、`length` | 拒絕錯誤協定或長度 |
| `session_id` | 每次連線握手建立新 session，重連後不接受舊封包 |
| `sequence` | 只接受本 session 中較新的封包，拒絕重複與亂序 |
| `sender_mono_ms` | 協助 App 記錄發送時間；機上仍以自己的單調時鐘判斷最後收包時間 |
| `roll`、`pitch`、`yaw` | 正規化整數，候選範圍 `-1000..1000` |
| `throttle` | 正規化整數，候選範圍 `0..1000` |
| `flags` | ARM 請求、模式與 App 狀態；ARM 請求不等於馬達立即啟動 |
| `integrity` | 第一版至少使用 CRC 偵測格式／傳輸錯誤；應用層認證另列實作與威脅測試 |

接收端 queue 深度固定為 1，永遠只保留最新有效控制狀態。舊封包不重送；遙測回傳目前收到的 `sequence`、本機收包時間、RSSI、電池電壓、ARM 狀態與 failsafe 原因，App 再計算往返時間、遺失率和最大間隔。手機與 ESP32 的系統時間未同步，因此不可直接比較兩端的 wall-clock 時間來決定封包是否過期。

Wi-Fi AP 使用每台裝置不同的密碼，不把真實 SSID、密碼或配對 token 提交 Git。ESP32-S3 SoftAP 的安全能力與設定應依 [Espressif Wi-Fi Security 指南](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/api-guides/wifi-security.html)實作。第一版可用機身 QR code 提供 SSID、隨機密碼、固定本地 IP、裝置 ID 與協定版本，避免依賴廣播探索。

## ARM 與失聯保護

手機是操作介面，不是最終安全裁決者。下列條件都由機上 ESP32-S3 執行：

1. App 只能提出 ARM 請求。機上須同時確認油門最低、IMU 有效、機身未超出容許傾角、電池未低於門檻、目前無 failsafe，才可進入 ARMED。
2. ARM 使用長按或滑動確認，DISARM 必須隨時可見；但手機按鈕在斷線時不可靠，所以機上 timeout 才是必要保護。
3. 搖桿觸控放開後，roll、pitch、yaw 回中；油門保留在畫面位置。只要 App 進背景、螢幕鎖定、觸控與傳送迴圈停止或網路改變，就停止有效 heartbeat，讓機上 timeout 接管。
4. 短暫封包遺失時不排隊補送命令。連線超時後，機上依測試結果進入受限的降油門或立即 DISARM。沒有高度感測器的第一版不能宣稱能自動安全降落。
5. IMU 過期、姿態超限、傾倒、brownout 或程式 watchdog 等嚴重故障，要有獨立於手機連線的停止路徑。
6. ARMED 狀態禁止寫入 PID、校正值、最大角度、Wi-Fi 設定及韌體更新。

timeout 的警告與切斷時間目前刻意不填固定數值。它們要由封包最大到達間隔、馬達反應、測試高度與機體動態的證據決定，並經螺旋槳拆除、固定架與低高度防護測試逐層驗證。

## App 第一版畫面

### 1. 連線與配對

- 顯示手機目前連到的 SSID、裝置 ID、App／韌體協定版本與雙向 handshake 狀態。
- 只有收到近期機上 ACK 才顯示「可控制」，不能只因 UDP socket 建立就顯示綠燈。
- 明確顯示權限遭拒、Wi-Fi 被切換、封包過期、版本不相容與另一個控制端已取得 control ownership。

### 2. 飛行畫面

- 橫向鎖定的 Mode 2 雙搖桿：左側 throttle／yaw，右側 pitch／roll。
- 顯示 ARM 狀態、電池電壓、控制封包 age、RSSI、RTT、封包遺失率、飛行模式與 failsafe 原因。
- ARM 採兩階段確認；DISARM 保持可見。相機影像不列第一版功能。

### 3. 設定與校正

- 只有 DISARMED 才可開始 IMU 校正、馬達順序測試、搖桿 deadband／靈敏度、最大傾角與 PID 讀寫。
- 每次變更都回讀實際套用值，並記錄送出、成功或失敗原因。

### 4. 測試紀錄

- 將時間、裝置 ID、session、發送序號、ACK、RTT、封包遺失、電池與 failsafe 原因存成結構化資料。
- 可匯出 JSON 或 CSV，讓桌面測試與後續實機測試使用同一組欄位。

## Android 與 iOS 權限

- Android 的本地網路保護正在分版本導入。Android 16 可選擇測試，Android 17 且 target SDK 37 以上時，本地 TCP／UDP 預計需要執行期 `ACCESS_LOCAL_NETWORK` 權限。實作時應依實際 target SDK 檢查 [Android Local Network Permission 文件](https://developer.android.com/privacy-and-security/local-network-permission)，並測試使用者拒絕或撤銷權限後的 socket 錯誤。
- iOS 14 起，第一次存取本地網路時會詢問使用者，App 要提供 `NSLocalNetworkUsageDescription`。本設計使用固定 IP 的 UDP 單播，不依賴 multicast discovery；詳細條件依 Apple 的 [Local Network Privacy 技術說明](https://developer.apple.com/documentation/Technotes/tn3179-understanding-local-network-privacy)確認。

## 開發與驗收順序

1. **Link test App**：先不接馬達。App 以候選 50 Hz 發送遞增序號，ESP32 回傳 ACK 與 RSSI，連續記錄至少 10 分鐘。
2. **故障注入**：依序測試 App 強制關閉、進背景、鎖定螢幕、關閉 Wi-Fi、切換行動數據、距離增加、封包亂序／重複與 ESP32 重新開機。
3. **Props-off control test**：拆除全部螺旋槳，加入虛擬 motor output 與狀態機；確認重連不會沿用舊 session，且 ARMED 時不能改參數。
4. **單馬達固定測試**：在防護架內量測供電壓降、馬達雜訊是否造成 Wi-Fi／IMU reset，以及 timeout 後輸出波形。
5. **四馬達固定測試**：先做低輸出、馬達順序與方向，再測最壞 2.4 GHz 干擾下的控制封包最大間隔。
6. **受保護低高度測試**：只有前述證據通過後，才在槳罩、清空環境與可立即斷電的條件下進行；不直接自由飛行。

第一版通訊層至少要通過以下條件：

- App 重連或 ESP32 重開機後，舊 session、舊 ARM 請求與舊序號都不能生效。
- 重複、亂序或格式錯誤的封包不能進入飛控控制值。
- App 進背景或被系統終止後，機上能依 timeout 進入可觀察的 failsafe。
- 控制 queue 不累積舊搖桿命令；每次控制迴圈只讀最新完整封包。
- 雙向 ACK 未建立或已過期時，App 不顯示「可控制」。
- 所有失敗都留下結構化原因；不能只記錄「斷線」。

目前只完成文件設計與官方資料查核，尚未建立 Flutter 專案、寫入 ESP32 韌體、執行 host test 或進行指定板卡實機測試。
