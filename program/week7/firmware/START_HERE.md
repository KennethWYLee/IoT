# 開始使用 Week7 Arduino 與 App

## 檔案與環境

Arduino IDE 開 `bin_app/bin_app.ino`，保留同資料夾的 `controller.hpp`、`app_page.h`。安裝 ESP32Servo、U8g2 與 ESP32 核心；不把 GitHub 的 HTML 檔案預覽另存成 `.ino`。

課堂板型：ESP32S3 Dev Module，16MB Flash、OPI PSRAM；USB與COM設定依 [Ans](../../../IOT_Introduction/Week_07_Traffic_Light_Challenge/week7Ans.pdf)。光敏 GPIO4、舵機訊號7、OLED SDA8／SCL9，不接外接按鈕或RGB。OLED_CONTROLLER 由教師依實物確認1306或1315，位址不能用來判型號。

## 第一次先看預覽，再啟用

1. 舵機電池 OFF，上傳完整程式；USB供 ESP32／OLED，Serial 115200。
2. 看本次 Serial 的本組 Wi-Fi 名稱、課堂密碼及完整 http 網址。手機只連本組，即使無網際網路也保留連線；同組一支手機、一個分頁。
3. App設定區：未遮光記錄 → 遮光記錄 → 移開等清空0.5秒；兩值差至少100。
4. 若教師設定未確認，保持電池 OFF。教師依 Ans 空載測試本顆舵機、核對電源與行程，設定 `SAFE_REST_US`、`SAFE_ACTIVE_US`，完成後才設 `SERVO_SETUP_CONFIRMED=true`。保持 OFF 重新驗證上傳，再 RST、重連、刷新與校正。App不能解除此設定鎖。
5. 先不裝紙蓋。App準備舵機，看到 POWER ON／CHECK，手離開行程才人工開電、確認舵盤返回位置，再點開始。
6. 按 Ans 測自動5秒、持續遮光不返回、保持、關閉、秒數與今天指定時間；App「開蓋／關蓋」先看舵盤轉出／返回。最後才全部斷電裝紙蓋，重新核對帶載兩端並重測。

返回／轉出設定單位是微秒，不是角度，兩端數值的大小方向不預設。教師曾用的數字不等於別顆舵機或紙蓋的安全端點。

## 手機 App 怎樣串聯

`app_page.h` 包含完整網頁。GET `/` 由 ESP32 傳給手機；手機約每700ms GET `/api/state`，取得光敏、模式、倒數、已送命令與處理結果。只有使用者操作才 POST `/api/cmd`；HTTP202只代表排入處理，不是舵機已到位。

POST 使用 form-urlencoded。一般要求含 `cmd`、`boot`、`run`、`id`、`exp`、`client`；`open_for` 加 `secs`，`close_at` 加 `phone_now_ms`、`target_ms`、`utc_offset_min`。STOP使用正確的 `boot`、`id`。App已處理這些欄位，不必由學生逐次手填。

`client` 是控制分頁識別，不是登入憑證。第一筆一般要求排入後，原頁控制至RST；新頁只讀，仍可停止。原頁離線重連不補送。重新整理或手機回收頁面後，須先電池OFF、USB供電按RST、重連、刷新與重新校正。

手機顯示的是裝置狀態與命令，不是實際角度。ESP32控制迴圈檢查光敏、模式與期限後才輸出；網路任務只收要求、讀狀態。OLED由ESP32更新，不是手機直接寫畫面。

## 保持、時間與停止

保持開蓋會轉出並保持，不是凍結目前角度。手動／定時完成後維持手動關閉，須點恢復自動才再接受光敏觸發。所有關閉命令前須新鮮且連續清空0.5秒；位置命令至少間隔1秒。

計時接受1～60整數秒；今日時間只接受手機當地今天、未來且在本輪剩餘時間內的一次關閉。不是每天排程，也沒有RTC／NTP校時保證。接受後手機離線或改時間不改既有裝置倒數。

180秒從準備起算，不能由App延長。STOP／TIMEOUT只停止舵機訊號，不發收尾關蓋，不切電，也不保證維持位置。卡住、異音、持續晃動或發熱直接人工OFF；完整收納另拔USB。Serial送 `x` 也只是停止控制，不是斷電。

這是桌上教學模型，不是防夾產品或公開網路服務。手機舊資料不能當現在，網頁變灰也不能取代裝置檢查。修改App外觀時保留校正、期限、停止、過期與要求結果處理。
