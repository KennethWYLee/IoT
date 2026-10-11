# Week5 Q1、Q2 程式

[Main](../../IOT_Introduction/Week_05_RGB_OLED_Countdown/week5_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_05_RGB_OLED_Countdown/week5Ans.pdf)

| 題目 | 完整檔案 | 結果 |
|---|---|---|
| Q1 單按鈕變色燈 | [desk_status.ino](desk_status/desk_status.ino) | 短按開啟／換色，長按關閉；OLED 顯示選色與亮滅 |
| Q2 OLED 倒數提醒燈 | [focus_countdown.ino](focus_countdown/focus_countdown.ino) | 30 秒倒數，綠／藍／紅提醒；按下取消回等待 |

按鈕提供操作，ESP32 執行程式並保存狀態，OLED 顯示文字，RGB 提供遠看可辨認的燈色。兩題都不需要感測器。

下載 `.ino` 的 **Download raw file**，保留與檔案同名的資料夾；Arduino IDE 用 File → Open 開啟，不另存 GitHub 預覽網頁。

從空麵包板按 Ans 完整接線。參考板為 YD-ESP32-S3 Type-A V1.5／N16R8：按鈕 GPIO5 與 GND；OLED SDA GPIO8、本片 SCK GPIO9、VDD 3V3、GND 共地；RGB R/G/B 分別 GPIO15/16/17、− 接 GND。用同段＋／－軌分配 3.3 V 與 GND。改線前拔 USB 及全部電源。

RGB 必須由教師確認共地、板上限流、HIGH 點亮及電流適用，才依指定設定將 `RGB_WIRING_CONFIRMED` 改 true；旗標不是安全測試。未確認時燈停用，OLED 顯示 CHECK RGB WIRING。`OLED_CONTROLLER` 依實物確認選 1306 或 1315，不能以 I2C 位址猜型號。

安裝 U8g2（olikraus），USB 資料線接板背 COM；板型及其餘 Tools 設定查 Ans 附錄。每次換檔重新核對確認設定及控制器，不會自動沿用前一題的修改。

Q1 開機關閉、選紅；短按不到 1 秒，放開後才開啟或換色。開啟時紅→綠→藍→紅；長按達 1 秒關閉並保留選色，放開不會重新開燈。再次短按以先前選色開啟。SELECT 是選色，LED 是實際亮滅。

Q2 的 `DURATION_SECONDS=30`、`WARNING_SECONDS=10`；剩 30～11 秒綠、10～1 秒藍、0 秒紅。倒數中或結束後按一下取消，回 READY／30 秒／關燈，不是暫停或直接重開。按住只接受一次，必須放開再按；本題不分長短按、不手動選色。

Q3、Q4 程式僅由教師提供，本資料夾不含未公開答案。完整操作與排錯見 Ans；編譯和主機測試不代表實物已測。下課全部斷電，再拆線收納。
