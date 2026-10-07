# Week4 全題程式發布

教師於 2026-10-07 將公開範圍更正為 Q1～Q4 全部程式。本次取代同日較早的 Q1／Q2-only 發布限制，不改教材功能、腳位或個人 GPIO1 工作檔。

- GitHub `program/week4`：四題各 OLED／Serial 一支，共八支 `.ino`；另有 START_HERE、目前雙警報 HTML、四支 JavaScript、README 與來源雜湊 manifest。
- `_withClaude` Ans 更新下載位置，原 unsuffixed Main／Ans 保留。Ans 重新產生十二頁，檢查來源／PDF 雜湊、缺字、圖文邊界，Poppler 逐頁渲染並目視檢查。
- Q4 桌面測試通過獨立光線／溫度統計、確認、失敗、端點、保存後回傳及新紀錄；Edge 網頁測試使用假的 Serial 與磁碟 I/O。兩種顯示版各通過 34 個原生程式檢查，產生 CSV 後再由獨立 JavaScript 分析核對。
- 本次沒有改程式邏輯、重新操作硬體或新增實測，沒有重跑八支程式的全部目標編譯；既有编譯紀錄不能當成新硬體驗證。
- GitHub commit `82ffe1e667814c7bdd00019164567a28674a6450` 已推送，分支 API 與本機一致，專案仍 Public。
- 教師雲端既有 Week4 資料夾更新八支程式、操作說明、manifest 及新版 Ans，新增原本缺少的雙警報工具三檔。這十六檔逐一下載，以 SHA-256 核對本機一致；檔案分享權限保持 owner-only。
- 原單警報 HTML 暫留教師雲端供追溯；当前 START_HERE 明確要求 dual_alarm_analysis.html，不把舊工具當現行程式入口。
- 未提交、未改動其他個人工作檔、lab note 或無關 examples。

下一步是 Week5 四件作品的重建與學生閱讀檢查，不擴大其他週程式的公開範圍。
