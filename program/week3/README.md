# Week3 程式

[Main](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)

## 目前上課開這三支

| 順序 | 開啟檔案 | 成功結果 |
|---|---|---|
| 1 | [oled_fixed_text.ino](oled_fixed_text/oled_fixed_text.ino) | OLED 出現固定文字，先確認螢幕接通 |
| 2 | [oled_light.ino](oled_light/oled_light.ino) | OLED 顯示光線原始讀值，遮光時觀察變化 |
| 3 | [oled_light_snapshot.ino](oled_light_snapshot/oled_light_snapshot.ino) | 顯示目前、保存值及次數；按一下保存、長按不連加 |

每支 `.ino` 保留同名資料夾。依 Ans 核對實物後才將 `PROFILE_CONFIRMED` 設為 `true`；預設 false 不會啟動硬體，Serial Monitor 115200 會顯示原因。

課堂 GPIO：光敏 4、按鈕 5、OLED SDA 8、OLED **SCK 9**。SCK 是這片 OLED 的時脈腳印字，程式變數名稱使用 SCL。

安裝 U8g2。`OLED_CONTROLLER` 預設 1306；若本組已確認使用 1315，三支保持相同設定。程式自動檢查單一 0x3C／0x3D 回應；位址不能用來判斷控制器型號。

本輪未操作實物。編譯與桌面測試通過不等於供電、接腳或控制器已在本組設備確認。
