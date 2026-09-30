# Week3 程式

搭配 [Week3 Main](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.pdf)
與 [Week3 Ans](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)。
Ans 所寫的 `programs/程式名/程式名.ino`，在 GitHub 對應本頁下列同名程式。
本頁說明目前檔案的設定狀態，不必從 PDF 拼接完整程式。

| 用途 | 開啟檔案 | 執行前核對 |
|---|---|---|
| GPIO 電壓量測 | [week03_gpio_voltage_cycle.ino](week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino) | `PIN_TEST_OUTPUT` 尚為 -1；依 Ans 核對輸出腳與量測接法，先拆除其他外接線 |
| 光敏原始讀值 | [week03_ky018_raw.ino](week03_ky018_raw/week03_ky018_raw.ino) | 設定 `PIN_LIGHT` 與自己的 `DEVICE_ID` |
| 室內光／遮光判斷 | [week03_light_classifier.ino](week03_light_classifier/week03_light_classifier.ino) | 設定接腳，填入自己測量的兩組讀值範圍 |
| 按一下記一筆 | [button_light_capture.ino](button_light_capture/button_light_capture.ino) | 接腳尚未填寫、`PROFILE_CONFIRMED` 為 false；先核對接線 |
| A：按一次取三筆 | [three_light_samples.ino](three_light_samples/three_light_samples.ino) | 接腳尚未填寫、確認旗標為 false；正式間隔為 200 毫秒 |
| B：可以暫停的遮光計數器 | [shade_counter.ino](shade_counter/shade_counter.ino) | 設定接腳與確認旗標，填入自己的光敏測量範圍 |
| OLED 通訊位址檢查 | [week05_i2c_check.ino](week05_i2c_check/week05_i2c_check.ino) | 已設 SDA=8、SCL=9，確認旗標為 true；核對自己的硬體再使用 |
| C：桌面光線觀測器 | [light_observer.ino](light_observer/light_observer.ino) | 設定接腳、位址、控制器及確認旗標；初始設定不會啟動 OLED |
| D：按一下留下光線快照 | [light_snapshot.ino](light_snapshot/light_snapshot.ino) | 已設光敏=4、按鈕=5、SDA=8、SCL=9，確認旗標為 true；核對自己的硬體再使用 |

## 先確認設定

使用課堂 ESP32-S3 與既有 Arduino 設定，Serial Monitor 速度為 **115200**。
需要 OLED 的 C、D 程式另依 Ans 安裝 U8g2。預設 `OLED_CONTROLLER` 是 1306，
若自己的控制器不同，依核對結果選擇，不憑 I2C 位址推定型號。

**D 的目前版本會在啟動時檢查 0x3C／0x3D，找到單一回應後使用該位址；
初始 `OLED_ADDRESS = -1` 在這支程式中代表尚未偵測，不是要手動填寫。**
這與 C 的 `light_observer` 不同，C 仍需自行填入已核對的位址。
偵測到回應也不代表供電、OLED 控制器或每條接線都正確。

`week05_i2c_check` 沿用既有檔名與訊息中的 `week=5`，本週用它檢查 OLED，並非開錯檔案。
沒有新回應時先查看 Serial Monitor 的訊息，不直接將所有 false 改成 true。

**換程式或改線前拔除電源。**GPIO 電壓量測程式會將接腳設為輸出，不能沿用
按鈕接 GND 的線路直接執行。OLED 與光敏模組須核對供電、訊號電壓及實物標字；
保留原程式設定不代表適用所有板卡。

此次公開保留本機維護程式的內容，沒有新增實機測試，也沒有代為上傳韌體。
