# 2026-09-08 教材設定與檢查工具修正

## 範圍與版本

- 教師本次決定：舵機晚間自行處理，其餘已提出的教材及軟體問題交由Codex修正。
- 儲存庫：`IoT`，分支`main`，開始時HEAD為`4eed516d5f1e6e3c7eff1e18c009ec3757c28d8b`。
- 本次修改Week 1說明、Week 4～7維護來源及對應notebook、四支正式Arduino範例與檢查工具。
- 沒有更改18週進度、評分、採購數量／價格、舵機供電方案或歷史實測證據。
- 沒有操作序列埠、Upload、接線、通電或移動舵機；所有實機狀態維持原紀錄。
- 軟體修正完成時尚未commit或push；教師後續已授權提交、推送並將GitHub儲存庫公開。提交與公開結果以Git紀錄及GitHub狀態為準。
- 原本未追蹤的`examples/course_backend/runtime/iot_course.db`保留未動，不納入此次提交。提交前檢查追蹤檔案、歷史敏感檔名及常見憑證格式，未發現實際憑證；此檢查不等同完整資安稽核。

## 修正內容

| 問題 | 修正 | 未被此修正證明的事 |
|---|---|---|
| 正式蜂鳴器範例只有有效準位開／關，與HW-508診斷不同 | Week 4／7新增`BUZZER_USE_TONE`；受限模式固定2000 Hz，需填串聯1 kΩ確認。保留原開／關模式 | 不鑑定內部有源／無源種類，不確認實物電流、聲長或Reset瞬態 |
| OLED正式範例只有SSD1306建構子 | Week 5～7新增`OLED_CONTROLLER`，預設1306、另可選1315 | 0x3C不證明晶片型號；1315僅為教師這顆的相容性配置，非全班共同已驗證配置 |
| Week 1檢查沿用每人一套、舊電池規則 | 按11類基本零件、分列供電組、電表及每組1～3人分攤檢查 | 歷史金額不是現價，未計價用品並非免費；舵機負載仍待確認 |
| Week 3把CRLF／LF當成程式不同 | 比對前統一換行，仍檢查實際文字相等 | 沒有改Week 3程式或降低GPIO預設阻擋 |
| 主機測試寫死另一台電腦的Visual Studio路徑 | 使用`vswhere`尋找已裝的C++工具 | 不自動安裝系統編譯器 |

蜂鳴器仍使用原有120 ms（Week 4）／200 ms（Week 7）軟體截止時間。
迴圈保持處理輸入；音調期間不啟動DHT或OLED同步傳輸。
LEDC初始化失敗時停止啟動；發聲或停止API失敗後鎖住再次發聲，需斷電檢查並重新啟動。
Week 7發聲啟動失敗改記ABORTED，不把無法執行的失敗提示當成正常整合。
停止API失敗時會嘗試解除PWM並輸出LOW，這仍是軟體處理，不是物理停止證據。

所有公開GPIO仍為−1、核准旗標仍為false，Week 5／7維持階段0。
測試用腳位只存在於主機測試產生的檔案，不可作實物接線表。

## 檢查結果

本機：Windows、Python 3.12、MSVC 2022 Community。Arduino編譯使用既有ESP32 core 3.3.11，
另外在忽略目錄`_outputs/profile_compile/arduino_user`安裝U8g2 2.36.15、ESP32Servo 3.2.1、
DHT 1.4.7與Adafruit Unified Sensor 1.1.15；未替換Arduino IDE原本的library安裝。
更新了Arduino library索引以取得指定版本，未更新已安裝的board core。

| 檢查 | 結果 |
|---|---|
| Week 1採購與導覽 | PASS；709＋60＋159＝928，每組三人分攤約309.33；未計價用品另列 |
| Week 2／3 notebook檢查 | PASS；Week 3三支程式換行正規化後相同 |
| Week 4～7重建後`--check` | PASS；由維護來源生成，程式與圖片一致 |
| Week 4主機邏輯 | 開／關79項、波形85項通過，包含既有KY／DHT測試 |
| Week 5／6主機邏輯 | 兩種OLED設定分別通過45／40項；顯示均為替身I/O |
| Week 7主機邏輯 | 兩種OLED設定下，開／關各92項、波形各99項通過 |
| ESP32-S3實際編譯 | PASS，14／14：4個未啟用公開版，10個測試設定版；FQBN為`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi` |
| 本機Edge畫面 | Week 1、4～7於1200／420 px檢查通過，圖片載入與SVG文字邊界通過；另目視設定段落 |
| 全課結構與本機連結 | PASS，89個Markdown／notebook檔；`git diff --check`通過 |

主機測試只檢查程式在替代I/O下的行為，不模擬聲學、電流或舵機與LEDC的實際資源互動。
MSVC仍有既有固定條件相關C4127警告；沒有將這些警告稱為零警告通過。
`verify_hardware_profiles.py`留存每個主機測試log、各次編譯log、版本與結果JSON於忽略目錄。
第一輪編譯因各設定重編整套library而中止；改用共用build目錄、只在sketch定義OLED選項後重跑。
該中止操作只停止本次檢查程式及其子行程，沒有停止Arduino IDE、操作裝置或刪除原始資料。
重現指令及依賴見[檢查工具說明](../../scripts/README.md#buzzer-and-oled-configuration-checks)。

## 仍待實物確認

優先下一步仍是教師晚間的Week 6舵機與負載供電測試，未因本次程式修正改成已通過。
完成條件依Week 6原核准表：指定實物與接線、負載供電、受限動作、停止與重啟證據齊備。
其他實物待辦仍包括目前接法的KY校正、HW-508正式短聲、OLED完整畫面、RGB光學干擾，
以及Week 7整合後的停止反應。編譯完成不解除這些要求，也不要求為已有單項回報重買零件。

## 依據

- [BOARD-T01 2026-09-07實測與限制](2026-09-07-week7-bringup.md)：聲音與OLED相容性來自教師回報，沒有改寫為儀器量測。
- [Espressif LEDC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html)：核對腳位式`ledcAttach`、`ledcWriteTone`、`ledcWrite`及失敗回傳；並對照本機3.3.11 core來源。
- [U8g2建構子設定](https://github.com/olikraus/u8g2/wiki/u8g2setupcpp)：實際編譯以安裝的2.36.15類別為準，文件不鑑定教師OLED晶片。
