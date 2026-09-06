# Course Examples

本目錄保存學生教材與教師實機驗證會使用的可執行範例。週次教材以
`weekN_main.ipynb`作為學生入口；Arduino sketch、Backend及其他可執行原始檔集中放在
此處，避免repository根目錄出現`sketch_aug27a`之類無法辨認用途的預設名稱，並讓
notebook中的程式能與已驗證來源交叉核對。

## Arduino sketch命名規則

- 每個sketch使用`weekNN_topic`資料夾。
- 主要`.ino`檔必須與資料夾同名，才能由Arduino IDE正常開啟與編譯。
- `NN`固定使用兩位數，例如`week02`、`week03`。
- `topic`使用簡短、可辨識的英文小寫名稱與底線。
- 學生教材以相對連結指向本目錄，不在週次資料夾複製第二份程式。

目前範例（所有新增硬體程式預設GPIO未填、核准閘門未啟用；編譯不等於實機通過）：

| 週次 | 目的 | 開啟檔案 |
|---|---|---|
| Week 2 | 驗證ESP32-S3晶片、CPU、Flash、PSRAM、Upload、RESET及Serial | [`week02_board_check/week02_board_check.ino`](week02_board_check/week02_board_check.ino) |
| Week 2 | 組別、版本與uptime；分辨Verify、Upload、Reset及Serial Monitor的作用 | [`week02_serial_basics/week02_serial_basics.ino`](week02_serial_basics/week02_serial_basics.ino) |
| Week 2 | 公開按鈕範例；INPUT_PULLUP、穩定狀態變化與輸出命令，未公布profile前保持-1 | [`week02_button_input/week02_button_input.ino`](week02_button_input/week02_button_input.ino) |
| Week 2教師實機驗證 | 在BOARD-T01驗證候選GPIO4按鈕輸入與GPIO5安全預設、HIGH／LOW輸出；通過前不得當作全班固定profile | [`week02_gpio4_gpio5_candidate_test/week02_gpio4_gpio5_candidate_test.ino`](week02_gpio4_gpio5_candidate_test/week02_gpio4_gpio5_candidate_test.ino) |
| Week 2 | 同時記錄按鈕raw變化與去抖後stable事件，比較0／10／30／100 ms去抖設定 | [`week02_button_debounce_lab/week02_button_debounce_lab.ino`](week02_button_debounce_lab/week02_button_debounce_lab.ino) |
| Week 3 | 每10秒自動切換測試輸出的LOW／HIGH，供單人量測GPIO電壓並觀察Reset後啟動命令 | [`week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino`](week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino) |
| Week 3 | KY-018原始ADC；比較室內光與遮光，學生版PIN_LIGHT保持-1直到profile公布 | [`week03_ky018_raw/week03_ky018_raw.ino`](week03_ky018_raw/week03_ky018_raw.ino) |
| Week 3教師候選驗證 | BOARD-T01的GPIO4 ADC紀錄；不是已公布的全班profile | [`week03_gpio4_adc_candidate_test/week03_gpio4_adc_candidate_test.ino`](week03_gpio4_adc_candidate_test/week03_gpio4_adc_candidate_test.ino) |
| 歷史Week 4品質範例（保留供追溯） | 室內／遮光各10筆基準、非重疊門檻與獨立驗證；公開PIN_LIGHT維持-1 | [`week04_ky018_quality/week04_ky018_quality.ino`](week04_ky018_quality/week04_ky018_quality.ino) |
| Week 4 | DHT11真實讀取、有限值／範圍／突變檢查、f明示缺值注入與r恢復硬體呼叫；實物profile與GPIO未核准即阻擋 | [`week04_dht11_quality/week04_dht11_quality.ino`](week04_dht11_quality/week04_dht11_quality.ino) |
| Week 4重整來源（保留舊檔名） | 舊版KY-018三種光線profile與門檻範例；不是目前Week 3必做內容，需依Week 4正式範圍重整後使用 | [`week03_ky018_calibration/week03_ky018_calibration.ino`](week03_ky018_calibration/week03_ky018_calibration.ino) |
| Week 4重整來源（保留舊檔名） | DHT11受控間隔與read_failed；不列入Week 3 | [`week03_dht11_quality/week03_dht11_quality.ino`](week03_dht11_quality/week03_dht11_quality.ino) |
| Week 4重整來源（保留舊檔名） | KY-018與DHT11的valid／reason整合；不列入Week 3 | [`week03_combined_sensors/week03_combined_sensors.ino`](week03_combined_sensors/week03_combined_sensors.ino) |
| Week 3 | 沿用兩組資料建立相對門檻，輸出室內／遮光與quality | [week03_light_classifier](week03_light_classifier/week03_light_classifier.ino) |
| Week 4 | KY與DHT獨立排程、穩定遮光一次短鳴、故障與恢復 | [week04_dual_sensor_alarm](week04_dual_sensor_alarm/week04_dual_sensor_alarm.ino) |
| Week 5 | 指定安全匯流排的I2C位址回應檢查，不以ACK猜型號 | [week05_i2c_check](week05_i2c_check/week05_i2c_check.ino) |
| Week 5 | RGB、OLED及非阻塞倒數；分階段啟用 | [week05_rgb_oled_timer](week05_rgb_oled_timer/week05_rgb_oled_timer.ino) |
| Week 6 | SG90受限0～6計數指針、STOP、timeout及解除準備 | [week06_servo_pointer](week06_servo_pointer/week06_servo_pointer.ino) |
| Week 7 | 分階段紅綠燈遮光遊戲、同輪優先序、Finish與故障鎖定 | [week07_traffic_light_challenge](week07_traffic_light_challenge/week07_traffic_light_challenge.ino) |

Arduino IDE若建立`sketch_日期`預設名稱，應先使用**File → Save As**改為符合本規則
的名稱，再納入Git。

現行Week 4使用`week04_dht11_quality`及`week04_dual_sensor_alarm`兩支範例，完整步驟與答案集中在
[week4_main.ipynb](../Week_04_Sensors_and_Data_Quality/week4_main.ipynb)。
上述三支保留舊Week 3檔名的感測範例是歷史重整來源，不是本週操作指令。
編譯及host不能證明指定DHT11的供電、腳序、Upload或真實讀值已通過。
