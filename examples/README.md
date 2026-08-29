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

目前範例：

| 週次 | 目的 | 開啟檔案 |
|---|---|---|
| Week 2 | 驗證ESP32-S3晶片、CPU、Flash、PSRAM、Upload、RESET及Serial | [`week02_board_check/week02_board_check.ino`](week02_board_check/week02_board_check.ino) |
| Week 2教師實機驗證 | 在BOARD-T01驗證候選GPIO4按鈕輸入與GPIO5安全預設、HIGH／LOW輸出；通過前不得當作全班固定profile | [`week02_gpio4_gpio5_candidate_test/week02_gpio4_gpio5_candidate_test.ino`](week02_gpio4_gpio5_candidate_test/week02_gpio4_gpio5_candidate_test.ino) |
| Week 2 | 同時記錄按鈕raw變化與去抖後stable事件，比較0／10／30／100 ms去抖設定 | [`week02_button_debounce_lab/week02_button_debounce_lab.ino`](week02_button_debounce_lab/week02_button_debounce_lab.ino) |
| Week 3 | 每10秒自動切換測試輸出的LOW／HIGH，供單人量測GPIO電壓與Reset後LOW安全狀態 | [`week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino`](week03_gpio_voltage_cycle/week03_gpio_voltage_cycle.ino) |

Arduino IDE若建立`sketch_日期`預設名稱，應先使用**File → Save As**改為符合本規則
的名稱，再納入Git。
