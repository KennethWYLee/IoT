# Week4 Main、Ans 與 Q1／Q2 程式發布

日期：2026-10-07。教師明確要求 commit、push Week4 Main／Ans，並確認只公開 Q1、Q2 的 OLED／Serial 程式；另要求將提供的實測截圖加入 Main。

## 發布範圍

- Main 6 頁：Q4 為光線、溫度兩組警報，新增一頁教師的電腦端成果截圖。數字只代表當時結果，不是學生指定答案，也不代替 OLED 回傳核對。
- Ans 11 頁：保留＋／－軌完整接線、兩種顯示版本、四件作品操作與短原理；說清楚 GPIO1 設定與 OLED／Serial 結果核對位置，並標示程式公開範圍。
- `program/week4` 只含 `environment_display_oled`、`environment_display_serial`、`environment_alert_oled`、`environment_alert_serial` 四個同名 Arduino 資料夾及 README、manifest。
- Q3／Q4 程式、CSV 電腦工具、答案維護來源、私有測試與教師工作設定不在此次 Git 發布中。未要求更新 Drive，也未變更任何分享權限。

## 來源與證據

Main、Ans 均由維護 Markdown 重新產生；正式週目錄的 PDF 逐位元組與對應建置檔核對。截圖原 PNG 的 SHA-256 是 `a02eba2d96009704345b8be24640890187330db22672517289eff3af74d1aa50`，原樣保存於 `docs/images/screenshots/week4_dual_alarm_pc_20261007.png`；沒有修改、重繪或用假資料代替圖片。

教師回報 OLED 顯示文字。截圖顯示工具紀錄中、73 筆、兩組統計及 DHT 失敗 0 筆；另張事件表有 62.1 秒按鈕確認。尚未核對本次 OLED PC:LIVE、裝置與電腦兩組統計一致、光線開始／恢復、第二份 CSV 或磁碟 CSV 原始內容，不能寫成 Q4 已完整實機通過。

公開程式由原維護來源匯出，不採教師改成 GPIO1／true 的 Q1 工作複本。預設 DHT GPIO10、確認旗標 false，README 及 Ans 說明實物核對後的設定。這次不改 Q1／Q2 程式行為、不開硬體埠、不替教師上傳韌體。

## 檢查與同步

- PDF 建置檢查邊界、圖片、引用與輸入／輸出雜湊；Poppler 渲染並目視檢查新增截圖、Q1 設定、程式下載說明及 Q4 顯示說明。沒有增加 Ans 頁數或完整程式碼。
- 公開 exporter 逐支與維護來源比較並記錄 SHA-256；Week4 只統一 LF 與移除行尾空白，不修改程式邏輯或工作複本，manifest 記錄正規化方式。Week2、Week3 既有九支程式保持一致。Week4 exporter、`.gitignore` 與課程驗證均採四支 Q1／Q2 的明確清單，不以整個 Week4 當作開放。
- 四支公開程式在既有 ESP32-S3 N16R8 環境執行 compile-only；Adafruit DHT 1.4.7、Unified Sensor 1.1.15、U8g2 2.36.19、Arduino-ESP32 3.3.12。編譯不是實物測試。
- 完整課程文件結構／連結與提交前空白檢查；核對 Git 分支、remote、既有作者與 unrelated work。教師工作檔、既有例子與 Windows note 不修改、不提交。
- 推送後用 Git remote 與 GitHub API 核對 main；讀回發布的 PDF／圖片／程式，核對內容並確認 repository 仍為 Public。此結果與 commit ID 記入本機 PROJECT；不把「嘗試上傳」當作已完成。

獨立的 Q4 編譯、假 I/O 與瀏覽器測試是[先前本機修訂證據](2026-10-07-week4-dual-alarms.md)，此次只修改 PDF 說明及發布規則，未重新變更或操作 Q4 程式。
