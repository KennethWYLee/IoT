# 2026-09-21 其他週教材套用 Week 2 修正準則

## 範圍與版本

教師要求依照當天 Week 2 討論的方式修正其他週。依據為 [Week 2 修正準則](../../teaching_drafts/week2_redesign/revision_guidelines.md)。本輪從本機工作目錄接續，HEAD 為 `0b1dcbe`；保留進入本輪前尚未提交的 Week 2、QA、OLED 補充及其他檔案，不以遠端覆蓋本機。

修正實作教材 Week 3–7、11、12、14、15，保留課程主題、週次、評分、報告、採購及既有圖片。本輪沒有修改 Week 2，也沒有替換 Week 3–7 正式週目錄內的舊 notebook／PDF。閱讀入口如下，不要把兩個出口視為同一版本。

| 週次 | 本輪維護來源與閱讀 PDF | 頁數 | 主要修正 |
|---|---|---:|---|
| 3 | [來源](../../teaching_drafts/week3_redesign/week3_main.md)／[PDF](../../teaching_drafts/week3_redesign/week3_main.pdf) | 55 | 直接說明 GPIO5 量測位置，不引入 TPO 或舊教材比較；三筆取樣題依情境、預期結果、實作解答分頁 |
| 4 | [來源](../../teaching_drafts/week4_redesign/week4_main.md)／[PDF](../../teaching_drafts/week4_redesign/week4_main.pdf) | 59 | 區分按鍵嘗試、無效資料與有效收錄；列出 DHT 尚無資料及恢復後的預期紀錄，保留實物限制 |
| 5 | [來源](../../teaching_drafts/week5_redesign/week5_main.md)／[PDF](../../teaching_drafts/week5_redesign/week5_main.pdf) | 57 | 五秒一格的完整操作序列、循環上限、開始、中止與重啟結果；解答在結果頁後 |
| 6 | [來源](../../teaching_drafts/week6_redesign/week6_main.md)／[PDF](../../teaching_drafts/week6_redesign/week6_main.pdf) | 50 | 開頭改列操作條件與可觀察結果；每次加減兩格、上下界及奇數起點的預期結果；不解除供電限制 |
| 7 | [來源](../../teaching_drafts/week7_redesign/week7_main.md)／[PDF](../../teaching_drafts/week7_redesign/week7_main.pdf) | 49 | 每色 1.5 秒改造題的事件、分數與失敗結果；操作位置與重啟指示更直接 |
| 11 | [來源](../../../Week_11_HTTP_WebSocket_Backend/week11_main.md)／[PDF](../../../Week_11_HTTP_WebSocket_Backend/week11_main.pdf) | 30 | 改 reason 的操作、事件與畫面預期結果；修正無效 DEVICE_ID 無法測試命令拒絕的範例；拒絕時燈號維持原狀 |
| 12 | [來源](../../../Week_12_MQTT_Database_and_Logs/week12_main.md)／[PDF](../../../Week_12_MQTT_Database_and_Logs/week12_main.pdf) | 42 | Broker 主機測試結果與排錯；四個 topic、三個訂閱條件的預期收取表與後續參考操作 |
| 14 | [來源](../../../Week_14_Mobile_PWA/week14_main.md)／[PDF](../../../Week_14_Mobile_PWA/week14_main.pdf) | 21 | 手機 start 確認視窗的取消、確認、stop 結果；說明程式插入位置並附可驗證片段 |
| 15 | [來源](../../../Week_15_Automation_and_Safety/week15_main.md)／[PDF](../../../Week_15_Automation_and_Safety/week15_main.pdf) | 27 | 用明示假資料比較連續三／四筆的狀態；保留 STOP 優先；常數與事件 reason 一起修改 |

九份共 390 頁，包含既有程式附錄。頁數增加主要來自把改造題的預期結果獨立呈現，不是增加新的作業或功能。

## 套用方式

- 移除「這頁先不做」「做完才解釋」「下一頁再談」等節奏旁白，以及沒有操作用途的版本比較。
- 保留必要的斷電、供電、接線、軟體設定、完整檔案位置及回復步驟；不把安全條件誤刪為旁白。
- 保留「先觀察操作，再解釋原理」；改造練習使用「情境與規則 → 具體預期結果 → 參考做法」。
- 預期表直接列出操作後的數字、狀態或訊息。實際量測欄仍供學生記錄，不以預期值冒充實測。
- 本輪修改維護中的 Markdown 與必要 builder，再產生 PDF；沒有直接編輯 PDF。
- Week 3–7 頁首與頁尾不再放重設稿或教學節奏文字；程式附錄仍保留完整來源位置。

## 驗證結果

| 檢查 | 結果與範圍 |
|---|---|
| 五份硬體 builder／verify.py | 通過來源 hash、完整程式嵌入、A4、文字邊界、占位字串及題目／結果／解答頁序檢查 |
| 四份網路 PDF exporter／verify_network_pdfs.py | 通過來源、圖片、輸出一致性及 120 頁的文字邊界、字形替代符、連結檢查 |
| 全頁渲染 | 九份共 390 頁均已渲染；不等同逐頁學生實作 |
| 人工視覺檢查 | 檢視新增練習／結果／答案頁、修改後開頭與操作頁的接觸表，以及網路教材新增結果／答案頁；不是逐頁完整內容審讀 |
| 最終 Poppler 抽查 | 另以 Poppler 120 dpi 重繪最新 Week 3 p40、Week 7 p34、Week 15 p19；文字、表格、程式與頁尾無可見裁切或重疊 |
| 稀疏頁警示 | Week 12 p5、Week 14 p6、Week 15 p6 都是原有硬體照片頁；已目視確認圖片正常，不是漏字或空白頁 |
| Week 3–5 integration_checks/run.py | 10 組主機測試、159 個斷言通過，含三週基本版、改造版與設定未確認的阻擋條件 |
| Week 6 test_host.py | 四組計數步進／OLED 設定，每組 53 個預覽與計數檢查、40 個原始程式檢查通過 |
| Week 7 test_events.py | 三種切換時間、兩種 OLED 設定，共六組、每組 48 個斷言通過 |
| verify_examples.cjs | 檢查頁序、文字與頁尾；把教材片段插入現有手機表單處理器，以替代 DOM／fetch 驗證取消 start、確認 start、stop 與未授權條件；另獨立計算 Week 15 狀態表 |
| MQTT topic 表 | 使用 Paho MQTT 的 topic_matches_sub 核對四個 topic × 三個條件，通過；沒有連線到 broker |
| export_network_sketches.py --check | 六份 .ino／secrets 範本與 Markdown 來源一致；本輪未修改正式韌體或重跑目標板編譯 |
| git diff --check | 通過；Git 的 LF／CRLF 提示為換行設定提醒，沒有空白錯誤 |

Week 2 PDF 的 SHA256 在本輪前後一致：`56c21d331297421a72e35093608284af8048e7fb4338f7640783cfce5e791dc0`。

## 重跑方式

在 IoT repository 根目錄執行；Node 須能載入既有 PDF builder 使用的 Playwright 套件，Python 須有 PyMuPDF 等既有檢查依賴。

```powershell
foreach ($week in 3..7) {
    node "IOT_Introduction/docs/teaching_drafts/week${week}_redesign/build.cjs"
    if ($LASTEXITCODE -ne 0) { throw "Week $week build failed" }
    python -X utf8 "IOT_Introduction/docs/teaching_drafts/week${week}_redesign/verify.py"
    if ($LASTEXITCODE -ne 0) { throw "Week $week verification failed" }
}
node IOT_Introduction/scripts/export_network_pdfs.cjs
python -X utf8 IOT_Introduction/scripts/verify_network_pdfs.py
python -X utf8 IOT_Introduction/scripts/export_network_sketches.py --check
python -X utf8 IOT_Introduction/docs/teaching_drafts/integration_checks/run.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week6_redesign/test_host.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week7_redesign/test_events.py
node IOT_Introduction/docs/lab_notes/2026-09-21-other-weeks-revision/verify_examples.cjs
```

每個命令應單獨確認 exit code；PDF 與版面檢查結果由既有 build_manifest、tmp/verification.json 與 `_outputs/network_pdfs/review/checks.json` 提供，暫存圖不發布。

## 限制與下一步

本輪沒有上傳韌體、操作實體裝置、傳送控制命令或新增網路連線實測，也沒有聲稱學生已能獨立完成。主機替代 I/O 與獨立計算不能證明接線、感測數值、供電、手機連線或實際停止成功。

原有硬體缺口仍以 [hardware_state.md](../../hardware/hardware_state.md) 及各週 review 為準：DHT11 三針識別與 3.3 V 相容性未確認，SG90 外部供電、牢固接頭、負載、安全角度與停止尚未完成驗證。OLED／蜂鳴器的局部成功紀錄不等於全班模組均已通過。

主要下一步保持原先優先序：確認 Week 4 的指定 DHT11 實物腳位與電壓資料，留下可對應實物的紀錄，再依核准流程完成感測驗證；在此之前不解除教材內的阻擋設定。Week 6 舵機限制另外保留，不靠此次文案修改解決。

本輪只保存在本機，未 commit、push、同步 GitHub 或上傳雲端；也未捨棄任何先前修改。
