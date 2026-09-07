# BOARD-T01分項診斷程式歸檔

這裡是2026-09-07教師指定實物測試的原樣來源，不是全班預設，也不是完整遊戲。
固定GPIO只對應[當日接線與證據](../../docs/lab_notes/2026-09-07-week7-bringup.md)；
移到其他板、模組或接線前須重新核對。正式各週程式的核准閘門未變更。

| 程式 | 適用階段 | 操作與預期 |
|---|---|---|
| [week7_t01_bringup.ino](week7_t01_bringup/week7_t01_bringup.ino) | OLED、KY及兩鍵；RGB、蜂鳴器、舵機未接 | 上電自動檢查3C／3D，僅一個ACK才畫框、經過秒數、raw與按鈕值 |
| [week7_t01_rgb.ino](week7_t01_rgb/week7_t01_rgb.ino) | 前項加HW-479；蜂鳴器、舵機未接 | OLED正常且兩鍵放開時等3秒，紅／綠／藍各2秒後全關；r再測、x或雙鍵停止 |
| [week7_t01_buzzer.ino](week7_t01_buzzer/week7_t01_buzzer.ino) | 前項加HW-508與串聯1 kΩ；RGB保持關；舵機及電池未連入 | READY後b一次2000 Hz／200 ms；每次開機限一次；x或任一鍵中止短聲 |

## 開啟與限制

Arduino IDE以File → Open開對應同名資料夾內的ino。依賴Arduino-ESP32 3.3.11、U8g2 2.36.15。
選ESP32S3 Dev Module、16 MB Flash、OPI PSRAM及實際列舉Port；序列115200 baud。
先Verify。Upload前所有外部電源OFF、負載分離；改線前拔USB。
保存的舊版本只管理當時列出的硬體，**不在整組已接線時任意回燒較早階段**。

蜂鳴版本必須保留1 kΩ，且移除先前d6→a10的3V3供電跳線；不短接電阻增大音量，
不接6.6 V電池。若只是讀舊測試結果，不需要再次Upload或發聲。
DONE是軟體已完成一次命令，不是麥克風驗證；無聲先保存狀態、斷電核對，不任意加壓。

蜂鳴程式短聲期間刻意暫停OLED傳送，檢查按鈕與停止字元；不是完整遊戲的非阻塞迴圈。
本次只保存原樣診斷，不擴張成音樂、長鳴或舵機測試。實物資料及未驗證項目見上方紀錄。

## 編譯

在repository根目錄執行，例如：

```powershell
arduino-cli compile --fqbn "esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi" IOT_Introduction/examples/board_t01_diagnostics/week7_t01_buzzer
```

其他兩支將最後的sketch資料夾改為表中名稱。編譯只檢查軟體，不會Upload、不證明實物電流或供電安全。
