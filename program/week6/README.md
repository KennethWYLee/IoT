# Week6 舵機基本測試

先完成一次無紙件、無負載試轉，親眼確認舵機轉出、停留、返回，再換回 Q1 或 Q2 的作品程式。完整作品的接線與操作講義：[Ans](../../IOT_Introduction/Week_06_Servo_Pointer/week6Ans.pdf)。

[下載 servo_quick_test.ino](servo_quick_test/servo_quick_test.ino)：開啟檔案後選 **Download raw file**，存入同名 `servo_quick_test` 資料夾，再用 Arduino IDE 開啟。不覆蓋 `cat_feeder`。

## 接線

改線前先關閉並拔除舵機外接電源，再拔 USB。以下只對應本次已核對的黃／紅／棕三線 SG90；不同產品先核對自己的接頭。

| 接線 | 端點 |
|---|---|
| 舵機黃線 S | ESP32 GPIO7，不接正極 |
| 降壓板 VOUT＋ | 麵包板 a10 |
| 舵機紅線＋ | b10，與 a10 同組相通；不接 3.3 V＋軌 |
| 舵機棕線、VOUT－、ESP32 GND | 共用－軌不同孔 |

b10 本身不會有電。外接供電須由教師確認極性、輸出及能力；不裝紙板或負載，舵盤周圍留空。其他模組可以留著，但測試程式不操作它們。

## 操作

1. Arduino IDE 安裝 **ESP32Servo**。選 **ESP32S3 Dev Module**，Tools 的 **USB CDC On Boot = Disabled**、**USB Mode = Hardware CDC and JTAG**、**Upload Mode = UART0 / Hardware CDC**；其餘設定依 Ans。USB 接板背 COM，Port 選自己電腦實際出現的，不固定是 COM8。
2. 電池保持 OFF，上傳測試程式；開 Serial Monitor，設 **115200**。應看到 `READY: servo power ON, then send lowercase t.`；若錯過開機訊息，電池保持 OFF，按板上 RST 再看。
3. 先放穩舵機，再人工電池 ON。開機已準備 **1500 µs** 命令，開電時可能先定位。
4. 傳送小寫 **`t`**。程式送 **1900 µs**，約 2 秒後回到 **1500 µs**，再約 2 秒停止訊號；看完人工關電。
5. 只跑一輪。重測依序：**電池 OFF → RST → 電池 ON → 再送 `t`**。

**測試程式不讀操作鈕或 STOP 鈕；要停止就直接關電池。**只有嗡聲不轉、卡住、持續抖動或發熱時立即 OFF，不靠升壓、加大行程或連續重試解決，依 Ans 排錯。

`COMMANDS SENT` 只表示命令送完，不代表已量到位置。脈寬不是角度，也不是 Q1／Q2 紙件的通用行程設定。這一步沒有驗證負載、落料或遮陽機構。

此測試程式已有 ESP32-S3 編譯檢查；教師回報修正紅線後空載可轉，不等於每組硬體或紙件已通過驗收。

## Cat 教師續作檔案

[cat_feeder.ino](cat_feeder/cat_feeder.ino) 是教師 2026-10-20 實作後保存的版本，供換電腦繼續修改。保留 `OLED_CONTROLLER=1315`、兩個確認旗標 `true` 與 `SAFE_MIN_US=1500,SAFE_MAX_US=2000`；不是保護預覽預設值，也不是其他硬體或紙件可直接套用的設定。未核對供電、接線與行程前，舵機外接電源保持 OFF。

Q2 程式仍不公開。
