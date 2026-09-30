# Week1～7 累積實作教材重建

日期：2026-09-30。教師授權分週 agent 處理，統一驗證後 commit、push 及更新雲端。

## 內容與界線

Week1 尚無元件，先採購及電腦設定；Week2 完成第一次上傳與一顆按鈕；Week3 加光敏與 OLED；Week4 加 DHT；Week5 加 RGB；Week6 全班舵機；Week7 整合已學功能。
OLED 自 Week3 起為主要畫面。Main 只列作品、預期結果、驗證及少量問答；Ans 先安全接線、程式開檔、成功畫面及排錯，後放短原理、反例與直接答案。完整程式另放同名 Arduino 資料夾。

同步 Week8 實作考通知、Week9 出國、Week10 第一次報告與 Week16 一般實作課。取消兩次筆試，保留三次報告的原有要求；正式實作考規則及原筆試比重如何重分仍待教師核定。本輪不命製正式考題。

## 維護與變更

- Week1 及通知週維護各週 Markdown；Week2 維護 `week2_redesign`，Week3～7 維護 `weekN_redesign/weekN_main.md`。
- Ans 與新程式的維護來源在私有 `weekN_answers`。Week4～7 使用共用 PDF renderer，分週程式輸出為可直接開啟的獨立 `.ino`，不把所有題目答案藏在 false/true 開關裡。
- 設定確認旗標只處理未核對硬體，不能代替接線與供電確認。Week4 未確認 DHT 時 OLED 顯示原因；Week6 未確認舵機時可先做不驅動舵機的預覽。
- Week3 的 d3 已供原按鈕接地，Week4 用 e3→f3 延長 GND，依序提供 DHT g3、RGB h3、STOP i3、舵機與外接電源共同負極 j3。DHT VCC 使用 d6。這是教材接線安排，不是新增物理量測。
- Week4～7 移除舊固定電阻量測、倒數、紅綠燈遊戲及重複抄表的共同必做要求。原檔與先前版本保留作歷史追查，不作現行學生入口。
- Week1 採購規格、數量及價格未改。沒有增加零件或新繳交包。

## 驗證狀態

17 份 PDF 共 93 頁已渲染並逐頁檢查。Week2～7 Main／Ans 頁數依序為 3／11、3／11、2／5、2／5、3／5、2／3；Week1 與 Week8／9／10／16 為 32、1、2、2、1 頁。
來源、PDF、程式設定、接腳、畫面與題號對照已核對。全課 18 週、150 份文件結構及本機連結檢查通過；Week1 入口另核對 1200／420px 寬度的 38 張圖片與 40 個連結。
Week1 Hello 原始／修改版、Week2 三支程式、Week3 三支程式的兩種 OLED 控制器設定，以及 Week4～7 五支程式均完成 Arduino 編譯。Week4～7 另直接包含實際程式，用假硬體介面執行 24 組設定、377 個情境、3,206 個斷言，零失敗。主機測試不模擬電氣條件、實際程式庫內部或最差停止時間。
Week3 的 24 個原生 C++ 主機案例在兩次執行間均曾通過；最後一次為 22／24，另兩個執行檔遭 Windows App Control 阻擋，不宣稱單次全數通過。沒有更改電腦的安全設定。Week2 的額外按鈕檢查是轉寫邏輯模擬，不冒充原生 C++ 或硬體測試。
詳細命令、雜湊、渲染圖與測試輸出放在本機 `_outputs/cumulative_rebuild_20260930`；Week1／通知初次檢查在 `_outputs/week1_schedule_20260930`，分週紀錄在私有 answers 目錄。

本輪 Arduino 編譯使用 ESP32 core 3.3.12；講義仍指定既有課堂 3.3.11，不宣稱已在 3.3.11 重編。沒有安裝測試整套學生電腦、上傳韌體、碰 Port 或驅動實物。
仍待實物確認：各組板型與按鈕接點、DHT 功能腳序與電壓、RGB 電流、舵機外接電源帶載能力與安全行程。軟體停止只停止脈衝，不等同硬體斷電。

## 發布範圍與狀態

GitHub 保持 Public，已經由 GitHub API 回讀確認。此次更新本輪重建的全部 Main，Ans PDF 和 root `program` 只公開 Week3；先前 root `program/week1` 從最新 Git 索引移除，本機保留。不改寫 Git 歷史、不擴大本輪答案公開範圍。

雲端已更新 17 份 Main／Ans PDF 和 12 支現行程式，全部下載回讀比對 SHA-256 相符。新程式放在 `codex / 課堂教材 / IoT / IOT_Introduction / program / weekN / 程式同名資料夾`，使用 `.ino`，不新增 ZIP。既有 12 份 PDF 原地更新，新增 Week1／8／9／10／16 五份，沒有變更分享權限。
教師隨後明確要求移除舊 Week3 程式：root `program/week3` 的九支舊程式刪除；雲端九支舊檔先下載本機備份後刪除，雲端 Week3 目錄回讀只剩三個新版資料夾。私人歷史來源不作教材入口，沒有改寫 Git 既有歷史。

目前狀態：教材、程式與雲端核對完成；準備提交並推送本次 Git 變更。發布清單與雲端回讀證據在本機 `_outputs/cumulative_rebuild_20260930/cloud_published.json`、`cloud_programs.json`、`removed_cloud_legacy.json`。
