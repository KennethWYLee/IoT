# Week2 程式

[Main](../../IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_02_ESP32_Hardware_Basics/week2Ans.pdf)

## 開檔順序

每支 `.ino` 保留同名資料夾，以 Arduino IDE 開啟。每次只上傳一支程式，不把不同檔案合併。

| 順序 | 開啟檔案 | 成功結果 |
|---|---|---|
| 準備 | [week2_hello_serial.ino](week2_hello_serial/week2_hello_serial.ino) | Serial Monitor 每秒顯示 Hello |
| 接線檢查 | [week2_button_state.ino](week2_button_state/week2_button_state.ino) | 放開顯示 released，按下顯示 pressed |
| Q1／Q4 | [week2_button_count.ino](week2_button_count/week2_button_count.ino) | 按一次加 1；放開保留次數，按住不連加；RST 清零 |
| Q2 | [week2_button_toggle.ino](week2_button_toggle/week2_button_toggle.ino) | 從 OFF 開始，每次按下切換 ON／OFF |
| Q3 | [week2_stopwatch.ino](week2_stopwatch/week2_stopwatch.ino) | 按一下開始、再按暫停、再按繼續；暫停時間不累加，RST 清零 |

## 接線與設定

從空麵包板開始，先完成只接 USB 的 Hello 測試，再拔除 USB 與全部電源，依 Ans 接按鈕。課堂板型使用 GPIO5 → 按鈕 → GND，程式啟用內部上拉；先核對按鈕兩組接點，不依外形猜方向。3V3、5Vin 不接這個按鈕支路。

USB 使用板背 COM 接頭，選實際新增的 Port；Serial Monitor 設為 115200。完整 Arduino／ESP32 設定、接線圖與排錯見 Ans。

三件作品都等讀值穩定 40 ms，先放開才接受下一次按下。開機就按住不會計次；放開再按即可。40 ms 是教學設定，不代表已量到每顆按鈕的彈跳時間。

本次只發布已核對的程式，沒有上傳韌體或實測硬體。下課先拔除 USB 與全部電源，再拆線收納；不保留電路到下週。
