# Week3 程式

[Main](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.pdf) · [Ans 接線與操作](../../IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)

## 三個作品與一支準備程式

每週電路獨立。開始時使用空麵包板，開發板、OLED、光敏及按鈕均未接線；不需保留 Week2 電路。依 Ans 從零接出電源與 OLED，再依本頁順序加光敏、最後加按鈕。保留已接線只適用於同一堂課的下一步，不跨週沿用。

| 順序 | 開啟檔案 | 成功結果 |
|---|---|---|
| 準備 | [oled_fixed_text.ino](oled_fixed_text/oled_fixed_text.ino) | OLED 出現固定文字，先確認螢幕接通 |
| Q1 | [oled_light.ino](oled_light/oled_light.ino) | OLED 顯示光線原始讀值，遮光時觀察變化 |
| Q2 | [oled_light_snapshot.ino](oled_light_snapshot/oled_light_snapshot.ino) | 顯示目前、保存值及次數；按一下保存、長按不連加 |
| Q3 | [oled_shade_counter.ino](oled_shade_counter/oled_shade_counter.ino) | 計算遮光次數，按鈕暫停／恢復；恢復時已遮住不補算 |

Q3 先保留 `LIGHT_LIMIT=-1` 上傳看 RAW，再用本組沒遮光／遮光範圍設定分界。遮光數字較大設 `SHADE_IS_HIGH=true`，較小設 `false`；範圍重疊先排查。固定文字是接線準備，不算第四件作品。

每支 `.ino` 保留同名資料夾。依 Ans 核對實物後才將 `PROFILE_CONFIRMED` 設為 `true`；預設 false 不會啟動硬體，Serial Monitor 115200 會顯示原因。

課堂 GPIO：光敏 4、按鈕 5、OLED SDA 8、OLED **SCK 9**。SCK 是這片 OLED 的時脈腳印字，程式變數名稱使用 SCL。

安裝 U8g2。`OLED_CONTROLLER` 預設 1306；若本組已確認使用 1315，各支保持相同設定。程式自動檢查單一 0x3C／0x3D 回應；位址不能用來判斷控制器型號。

本輪未操作實物。編譯與桌面測試通過不等於供電、接腳或控制器已在本組設備確認。

## 下課收拾

保留自己的程式副本與設定記錄。先拔除 USB 與其他電源，確認電源燈熄滅，再拆下全部連接線與元件，讓麵包板恢復空板。下週重新接線；不帶電拆線，也不為下週預留電路。
