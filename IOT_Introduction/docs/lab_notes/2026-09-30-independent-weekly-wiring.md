# 每週獨立接線與 Week4 顯示方式修訂

日期：2026-09-30。這是前次發布後的本機修訂，尚未 commit、push 或更新雲端。前次發布內容與證據仍記在 `2026-09-30-cumulative-rebuild.md`，不以本次本機檔案冒充遠端已更新。

## 教師決定

- 每週從空麵包板與分開的元件開始，做完斷電拆除。沿用的是已學操作、同一批零件和已安裝軟體，不是上一週留下的電路。
- 同一堂課內，已測通的階段可以保留；改線先斷電。每份 Ans 必須列出當週完整接線，不依賴翻找前週講義。
- 只有 Week4 開放 OLED 或 Serial Monitor 等效擇一。光敏、DHT、按鈕保存、目前與保存值、失敗顯示要求不變。其他週仍依原核定方式顯示，不加買器材。

## 修改範圍

Week1 原本已是無硬體的採購及軟體設定，學生 PDF 未改。Week2～7 Main／Ans 補正獨立接線與斷電收納，維持既定元件與題目順序。Week2、Week3 已同步現行週目錄的 PDF，Week3 另重建學生 notebook 及更新公開程式的 README；現行三支 Week3 程式沒有改動。

Week4～7 的私有 Ans 共用完整起始接線來源 `week4_answers/weekly_setup.cjs`，輸出到各週 PDF，不要求學生跨週找接法。內容包含電源列、按鈕接點、OLED／光敏／DHT、需要時的 RGB、開檔與 IDE 設定；Week6～7 另保留當週完整舵機、外接電源及 STOP 接法。Week5 先獨立測 RGB，再接其餘模組。每份 PDF 的 manifest 會記錄這個共用來源的雜湊。

Week4 新增獨立 `environment_snapshot_serial.ino`，不依賴 OLED、Wire 或 U8g2。OLED 原程式不更改既有感測與保存邏輯。兩版分開開檔，不用一個尚未說明的開關讓缺螢幕者卡在初始化。完整程式仍放私有同名 Arduino 資料夾，不塞回 PDF。

## 驗證

12 份 Main／Ans 共 67 頁：Week2 3／11、Week3 3／11、Week4 2／7、Week5 2／8、Week6 3／8、Week7 2／7。已建置、渲染並目視檢查；來源／PDF 雜湊、頁碼、版面、圖片、開檔引用和 Week2～7 程式封裝一致性均通過。Week1／Week3 入口檢查的 40 個頁內連結與 GitHub 公開範圍檢查通過；全課 18 週、151 份 Markdown／notebook 與本機連結檢查通過。

新增 Serial 程式的預設 DHT 確認旗標 false、測試副本 true 均完成 ESP32-S3 編譯。原生 C++ 主機測試直接包含實際 sketch，使用假的 Arduino／DHT 介面，合計 25 案例、129 斷言、零失敗。包含按鈕彈跳、長按、啟動時按住、失敗清空、復原、保存值不隨目前值改變、每秒輸出、立即保存輸出及計時器回繞。未確認 DHT 時每個輸出區塊重複提示 CHECK DHT WIRING，晚開 Serial 視窗也能看到原因。

最後來源 SHA-256 為 `cf532e35cb5dfc9f9021f19b2e7430e5dc975f632feb1f26a5a2d076948c95a1`。Arduino CLI 1.5.1、ESP32 core 3.3.12、DHT 1.4.7、Adafruit Unified Sensor 1.1.15；沒有在講義既定的 core 3.3.11 重編，不混稱相同版本。主機假介面不模擬電氣條件、實際程式庫內部或 USB 裝置。

既有 Week4～7 五支程式僅更正「每週從零」與「本週量測」的註解，逐檔和修改前快照比對，執行邏輯不變。不把先前編譯結果當成本次新 Serial 程式的驗證。

本次沒有實際上傳韌體、連接 Port、通電或驅動實物。板型、模組供電及腳序、RGB 電流、舵機電源與安全行程仍須依實物核對。軟體停止不等於斷開供電。

本機詳細證據分別放在 `_outputs/weekly_independent_20260930`、`_outputs/cumulative_rebuild_20260930` 及各週私有修訂紀錄；Serial 編譯與測試另在 `week4_answers/checks/serial_20260930`。其中前次雲端回讀檔案保持原樣。保留原有未提交的 `examples/` 和舊 `week04_dual_sensor_alarm.ino` 工作。

## 發布狀態與下一步

本次未執行 Git 或雲端發布。GitHub 仍只准公開全部 Main、Week3 Ans 和 Week3 program；其他 Ans／program 不增加公開範圍。這項修訂完成後，優先用同一套課堂實物驗證 Week4 的 Serial 版能讀值、按一下保存、長按不重複；未實測前不宣稱可直接在所有學生設備使用。
