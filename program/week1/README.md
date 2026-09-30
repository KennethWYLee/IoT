# Week1：第一次上傳 Hello

開啟 [hello_first.ino](hello_first/hello_first.ino)，依
[Week1 第一次操作教學](../../IOT_Introduction/Week_01_Course_Orientation/week1_main.md#week-2-preclass-setup)
安裝 Arduino IDE 與 ESP32 套件、核對板型及選單設定，再編譯與上傳。

只接核對過的開發板 USB，不接按鈕、杜邦線或外部模組。材料尚未到貨時，
可以先編譯；編譯成功不等於上傳成功。

上傳完成後，Serial Monitor 選 **115200**，應每隔約一秒新增一行 `Hello`。
再依講義修改文字與等待時間，重新上傳後觀察結果。
下載時保留 `hello_first/hello_first.ino` 同名資料夾。

本程式沿用 Week2 的首次上傳範例，沒有操作 GPIO，也沒有 Wi-Fi 或雲端通訊。
