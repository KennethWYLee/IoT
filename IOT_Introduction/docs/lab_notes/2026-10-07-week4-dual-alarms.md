# Week4 Q4：光線與溫度分開統計

日期：2026-10-07。本次為教師工作台實作引導與 Q4 本機修訂，不是發布或實機通過。

## 決定與範圍

- 教師保留已接好的光敏與 DHT，增加 OLED、一顆按鈕；光線、溫度分別判斷並各有次數、累計時間及最長時間。濕度繼續顯示、保存，不新增濕度警報。
- 參考設定 RAW > 3000、T > 28°C；等於正常。3000 是對教師 RAW 1668／4095 回報的暫用練習分界，不是照度，也不是全班已校正值。先用實物核對方向與分界。
- 一顆按鈕確認目前仍開啟且尚未確認的警報，不取消條件、不清零。DHT 失敗只暫停溫度計時，光線依自己的讀值繼續；恢復後仍超標，不新增同一項警報。
- 教師要求線少、使用＋／－軌。本板放板外，3V3 → ＋、GND → －；模組共用同一段軌，訊號直接到 GPIO。OLED 版 14 條線、Serial 版 10 條，不含 USB；較早 13 條短列接法不是選定接法。不新增電阻、蜂鳴器、供電或按鈕。
- Q1～Q3 程式維護來源不變；其他週、評分、題數與週次未改。Week4 共用 Ans 起始接線改成電源軌，Main 仍只列作品、結果與驗證。

## 來源與檔案

- Q4：`week4_answers/dual_alarm_analysis.cjs`，由既有 `generate_three_projects.cjs` 產生 OLED／Serial 兩版。Q3 仍用 `alarm_recorder.cjs`。
- 工具入口：`dual_alarm_analysis.html`；依賴 `alarm_report.js`、`dual_alarm_report.js`、`analysis_client.js`、`dual_analysis_ui.js`。舊 `alarm_analysis.html` 留供歷史測試，不搭配新 Q4。
- 新 CSV 是一筆同時含兩項狀態的十七欄紀錄；電腦回傳兩組 count／total／max。每列關檔保存成功後才分析回傳；會核對本次 ID、來源時間、欄位、事件與累計的一致性。
- OLED 與 Serial 每三秒切換讀值、統計兩頁；L 是光線，T 是溫度。無分析、過期或關閉時，統計顯示 --，不把舊值當現在值。
- Main、Ans 分別仍為 5、11 頁，從維護 Markdown 建置；教材目錄的兩份 PDF 複本也在本機更新。沒有向 GitHub 或 Drive 傳送。
- 教師工作檔：`_outputs/week4-bringup-20261007/environment_analysis_oled_gpio1/environment_analysis_oled_gpio1.ino`，DHT GPIO1、旗標 true、OLED 1315 相容設定。課程來源預設仍為 GPIO10、旗標 false。
- 原 `programs/environment_display_serial` 的 GPIO1／true 是教師手改工作設定，保留原內容。標準打包先保護而停止，未覆蓋；專用 `checks/dual_20261007/generate_package.cjs` 更新 Q4、工具及未修改複本，manifest 另記錄保留的工作檔及來源雜湊。通用「所有複本與來源完全相等」檢查不適用此保留版本，專用檢查明確驗證兩個設定差異與其餘所有檔案，不宣稱全部與來源逐位元組相同。

## 已完成的檢查

- Arduino-ESP32 3.3.12、DHT 1.4.7、Adafruit Unified Sensor 1.1.15、U8g2 2.36.19；FQBN `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`，只編譯、不開硬體埠。
- 教師 GPIO1／1315／已確認版：356340 bytes Flash、26048 bytes 全域 RAM；課程 GPIO10／1306／未確認 OLED 版：355316／26048；未確認 Serial 版：298959／23188。三者目標編譯通過。首次新增自定義型別的 Arduino 自動宣告錯誤已用明確函式宣告修正，成功結果只指修正後版本。
- `run_firmware.cjs`：Serial 與 OLED 各 34 項原生假 I/O 斷言，共 68。驗證分開開始／恢復、單鍵確認、DHT 失敗暫停、ADC 端點、等號、命令溢位／缺欄／錯 ID、停止／逾時及顯示寬度。生成的真實程式輸出（假 I/O）再交給 JS 分析，核對光線 2 次／7500 ms／5000 ms、溫度 1 次／7500 ms／7500 ms。
- `test_dual.cjs`：獨立數值案例與錯誤欄位、邊界、分開確認、報告；真正桌面 Edge 加假序列埠／檔案系統，核對關檔後才回傳八欄命令、兩組 UI、三張非空圖、報告、第二份 CSV 不覆蓋第一份、磁碟失敗停止回傳。桌面 1280×1000、手機 390×844 截圖無橫向溢出。
- 共用 `analysis_client.js` 只增加可選的六個統計回傳欄位介面；舊工具的 24 項瀏覽器案例全部再通過，不開實際序列埠。
- Main／Ans 所有頁建置邊界通過，來源／輸出雜湊、頁數、紙張及 15 個套件檔案由專用 `verify_artifacts.py` 核對，明確保留一份 Q1 工作設定；Poppler 渲染 16 頁，已目視核對修改後接線、設定、Q4 與原理解說頁。一般 Main 驗證另通過。
- Q1～Q3 六支維護程式 SHA-256 與修訂前相同；教師工作檔除了既有兩行設定，與 Q1 維護來源一致。其他原有 dirty sketches／例子／Windows note 沒有修改或提交。

## 實機證據與下一步

只有使用者回報 DHT T 27.7／27.8／26.1°C、RH 62%、光敏 RAW 1668／4095，及先前照片／OLED 個體的相容設定。尚無這次 OLED／按鈕接好、Q4 上傳、實際檔案保存或 PC:LIVE 回報。移開光敏恢復也未回報。

下一步：斷電核對十四條線，教師自行上傳 GPIO1 工作版，先確認 OLED 顯示 RAW、T、RH；完成條件是有效讀值及遮住／移開的反應。再關閉 Monitor，在新版工具開始 CSV，核對一個光線事件的開始、ACK、恢復與三處統計一致。不得以本次編譯／假 I/O 當硬體測過，也不要求加熱來測比較規則。

技術來源：[Espressif ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)、[Adafruit DHT 實作](https://github.com/adafruit/DHT-sensor-library/blob/master/DHT.cpp)，與本機程式庫／實物紀錄。GPIO、供電與模組腳序仍須依當次實物核對。

無 commit、push、雲端更新、分享權限修改或硬體操作。

## 後續工作台回報與發布授權

以上記錄描述本機修訂完成時的狀況，後續由教師自行操作。教師回報 OLED 有文字；Chrome 畫面先顯示已存 9 筆及溫度警報 1 次／17.6 秒。另一張事件表顯示 62.1 秒「按鈕確認」；最後授權加入 Main 的截圖顯示 73 筆、光線 0 次、溫度 9 次／156.3 秒／最長 35.4 秒、DHT 失敗 0 筆。這是教師回報與截圖，不是代理直接操作或 CSV 磁碟內容的獨立讀回。

OLED 版只在 OLED 顯示兩頁，不向工具送相同的文字頁；工具「裝置回傳」空白不能用來判定 OLED 沒有收到統計。OLED PC:LIVE、兩組統計與電腦一致、光線事件、正常恢復及第二份 CSV 不覆蓋仍待教師實物確認。

教師後續明確要求 commit、push Main／Ans，並批准公開 Q1、Q2 的四支程式，Q3、Q4 程式不公開。Main 新增實測畫面，改為 6 頁；Ans 維持 11 頁。此授權不包含 Drive 更新或分享權限變動；[此次發布範圍與檢查](2026-10-07-week4-material-publication.md)另記。
