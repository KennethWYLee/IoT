# Week 11、12、14、15 自行操作教材修正

日期：2026-09-18。基準提交：`2fea969`。

教師最新決定：報告要求不處理，教材設計優先；目標是學生自己讀講義即可操作，不是補教師授課流程。本輪只改四週實作教材及必要範例／維護工具，未改 Week 8、13、17 報告、兩次筆試、課綱配分或採購。

## 本輪完成

| 教材 | 修正 |
|---|---|
| [Week 11](../../Week_11_HTTP_WebSocket_Backend/week11_main.md) | 先列操作與可觀察結果；提供 ZIP／資料夾定位；先檢查 `app.py` 才安裝；區分後端與測試視窗；先測試後解釋 JSON。修正 `host-test` 與網頁預設 `demo-device` 不同、資料被篩掉卻要求看見的缺口。連 ESP32 後再改成本人 Device ID。 |
| [Week 12](../../Week_12_MQTT_Database_and_Logs/week12_main.md) | 先畫訊息傳遞順序，提早說明五個視窗；補密碼檔、設定檔建立與檔名檢查；既有密碼檔不可再用 `-c` 覆蓋；補認證後明確發布測試及正常輸出。後端與 bridge 直接用 `.venv` Python，不要求放寬 PowerShell 安全原則。資料庫階段先停止既有程序、建立 log 目錄再重啟，避免占用同一連接埠。 |
| [Week 14](../../Week_14_Mobile_PWA/week14_main.md) | 先選 HTTP 或 MQTT 路徑，給精確重啟位置、不重開已啟動後端；先成功修改一行網頁標題，再讀前端程式原理；區分改網頁後重新整理與 WebSocket 事件即時更新。 |
| [Week 15](../../Week_15_Automation_and_Safety/week15_main.md) | 先開可操作的完整程式，七段修改留到成功後閱讀；明列設定不會從 Week 12 自動帶入。補 `/docs` 的 Try it out、key、JSON、Execute 與同一命令 ID 結果查驗。修正重建後端路徑少了 `IOT_Introduction` 的錯誤。 |

Week 11／12 長篇完整程式移到同一份文件的附錄，不移除內容或另創必讀講義。
新增三個完整 Arduino 資料夾與對應 `secrets.example.h`：

- `examples/week11_http_device/`
- `examples/week12_mqtt_device/`
- `examples/week15_automation_device/`

這些是從既有維護來源產生的輸出，不是另維護三套韌體。
`scripts/export_network_sketches.py` 沿用原編譯工具的擷取及 Week 15 組裝函式；
`--check` 比對生成檔與來源。沒有產生真實 `secrets.h`，學生須另存個人程式再填自己的設定。

## 已執行的檢查

- 將 Week 11、12、15 的所有 C++ 區塊與基準提交比較，程式碼相同；本輪改的是操作、閱讀順序與範例取得方式，沒有修改韌體控制邏輯。
- 匯出三個 Arduino 資料夾後，`export_network_sketches.py --check` 通過（六個生成檔）。
- `python -m pytest IOT_Introduction/examples/course_backend/tests -q`：26 passed；使用測試資料庫，不動既有實作紀錄。
- 四份 Markdown 以本機 HTML 預覽渲染：圖片均載入，390 px 視窗無整頁水平溢出；目視檢查新增啟動／命令步驟，沒有重疊。這不是新 PDF 的逐頁檢查。
- 全課程結構與本地連結檢查通過；`git diff --check` 通過。
- Mosquitto `-c` 覆寫既有密碼檔的行為已核對[官方命令說明](https://mosquitto.org/man/mosquitto_passwd-1.html)，教材加入來源。沒有因這項文件核對宣稱 Windows 安裝與認證流程已實測。
- 三份 Arduino 程式均編譯成功（exit 0），使用既有 `verify_markdown_arduino.py` 的組裝與編譯函式，FQBN 為 `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`，使用臨時目錄及假連線設定，結束後清除臨時編譯輸入。Week 11／12／15 程式儲存分別使用 907974／876786／878266 bytes；全域變數分別使用 46428／46500／46532 bytes。沒有 Upload；這不核准學生實物板卡與接線。
- 編譯環境：Arduino-ESP32 3.3.11、ArduinoJson 7.4.3、PubSubClient 2.8；三份程式未使用舵機程式庫。

## 還沒驗證的部分

沒有實際安裝 Windows Mosquitto、開放防火牆、傳送 MQTT 到外部設備、Upload 或控制硬體。
沒有替學生測試個人網路、手機、Wi-Fi 登入、完整重新開機後的整套流程。
PDF 保留維護中 Markdown 的內容；本輪沒有將每個練習重新設計成「題目下一頁解答」。

後續教材工作先沿著 Week 11 的完整操作路徑，用隔離的本機測試環境補正常畫面與錯誤示例，
再以同樣方式處理 Week 12 多程序啟動。完成條件是每個動作都有可對照的結果及下一步，
不是增加術語或表格數量。這是第一輪修正，不是學生獨立完成的最終驗收。

## PDF 匯出與發布

教師後續明確要求「轉 pdf 後 commit and push」。四份同名 PDF 放在各週 Markdown 旁，
README 補上入口，內容仍以 Markdown 為維護來源。

- Week 11：28 頁；Week 12：39 頁；Week 14：18 頁；Week 15：25 頁，共 110 頁。
- `export_network_pdfs.cjs --check` 通過：來源、圖片、匯出工具與 PDF 雜湊相符。
- `verify_network_pdfs.py` 通過：A4 尺寸、文字邊界、替代字元與連結檢查；所有頁面已渲染並檢查聯絡表，另以 Poppler 放大檢查 Week 12 第 9 頁與 Week 15 第 13 頁。
- 修正短指令跨頁；長篇 Arduino 附錄保留連續分頁。Week 12／14 第 5 頁、Week 15 第 6 頁文字較少，已確認是零件照片頁，不是空白或遺失內容。
- 課程目錄檢查規則同步允許這四週的同名 PDF；未放寬其他週的檔案限制。
- PDF 完成後再檢查六個 Arduino 生成檔一致性，並重跑後端測試：26 passed。前一階段的編譯證據仍適用，因本階段未改 C++ 內容；未重跑實體測試。

Git 發布範圍僅包含這批教材、範例、PDF、索引及維護工具；提交識別碼與遠端發布結果以 Git
歷史和本次完成回覆為準。未上傳 Google Drive、未更動 Week 2–7 既有實測紀錄，根目錄未追蹤
`examples/` 保持不動。原課程要求、待確認的硬體條件與實際網路限制仍有效。
