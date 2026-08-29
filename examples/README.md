# Course Examples

本目錄保存學生教材與教師實機驗證會使用的可執行範例。週次教材資料夾仍只放
`weekN_main.md`與`weekN_support.md`；Arduino sketch、Backend及其他可執行檔集中
放在此處，避免repository根目錄出現`sketch_aug27a`之類無法辨認用途的預設名稱。

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

Arduino IDE若建立`sketch_日期`預設名稱，應先使用**File → Save As**改為符合本規則
的名稱，再納入Git。
