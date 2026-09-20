# 實作教材逐頁檢查與修正

日期：2026-09-20。完成本機來源修正、十份 PDF 重建及 415 頁閱讀與版面檢查；未發布、未做本次硬體實測，也未由學生試讀。

詳細位置見 [逐頁紀錄](pages.md)，對應版本見 [PDF 與逐頁文字 SHA-256](review_manifest.json)。不是以自動檢查代替逐頁閱讀，也不代表保證學生能完成。

## 範圍與版本

- 本次開始時 `main`、`origin/main` 及遠端查詢結果均為 `39757bc1971276f3bc7a360a281935f4d5d39180`。只查詢狀態及遠端；沒有 fetch、pull、reset、stage、commit 或 push。
- 已讀適用指引、課程索引、採購與實測紀錄、教材來源及建置方式。本機未找到 `PROJECT.md`，未自行補造課程決策。
- Week 2–7 使用 [目前逐步實作版本](../../teaching_drafts/README.md)，來源在 `docs/teaching_drafts/`；沒有用較舊的正式 notebook 覆蓋它們。Week 11、12、14、15 使用各週 Markdown 與網路教材產生器。
- 其他週檢查是否包含獨立實作教學；Week 9 的選讀整理不作為新增必修操作。報告、筆試、評分、週次與採購決策均未修改。
- 原有未追蹤的根目錄 `examples/` 保留，其中 `examples/course_backend/runtime/iot_course.db` 未作測試資料庫。後端測試使用暫存資料庫。
- 本次只有 Week 15 韌體新增觀察訊息；其餘韌體邏輯未改。沒有上傳韌體、開啟序列埠、連接實體 broker、發送控制命令或操作硬體。

## 各週結果

| 週 | 最終頁數 | 主要處理 | 檢查結果 |
|---|---:|---|---|
| 2 | 34 | 計數器另存名稱、USB／接線恢復順序、重新啟動及第四次按壓預期值 | 來源／版面檢查、計數器與練習主機測試通過 |
| 3 | 54 | 保留既有操作與延伸例；修正完整程式的 PDF 連結 | 來源、接線節點、分類器與延伸邏輯檢查通過 |
| 4 | 58 | 裸板上傳前明列拆除全部四條板端線；保留 DHT 腳序未確認限制 | 來源、練習解答及主機感測器測試通過；實物限制仍在 |
| 5 | 56 | 補列按鈕加 OLED 計時器的完整檔案；修正連結 | 題目與下一頁解答、45 項主機斷言及 OLED 兩種設定通過 |
| 6 | 49 | 保留操作先行、供電與訊號圖；修正完整程式連結 | 兩階段及兩種 OLED 設定測試通過；未核准舵機通電 |
| 7 | 48 | 保留低功率先行與延伸例；修正完整程式連結 | 三種時間設定及兩種 OLED 設定主機測試通過 |
| 11 | 29 | 補 START／STOP／RGB 的完整孔位接線、裝置篩選、reset 順序、API 測試步驟及錯誤 IP 範例 | API 測試、接線模型、Arduino 編譯及來源／PDF 檢查通過 |
| 12 | 41 | 補 A–E 視窗用途與啟停恢復、PowerShell JSON 傳送、KY 接線、資料庫路徑及故障測試恢復 | 匯出一致性、Arduino 編譯、API／資料庫測試及 PDF 檢查通過 |
| 14 | 20 | 補瀏覽器工具位置及離線測試；區分頁面快取與即時資料 | 桌面／手機尺寸及離線頁面模擬通過；未安裝到實際手機 |
| 15 | 26 | 補門檻算例、500 ms 取樣 log、取樣前計數判讀及兩種逾時計時的差異 | 匯出一致性、Arduino 編譯、來源／PDF 檢查通過；未測實際停止延遲 |

每頁結果及頁碼列在 `pages.md`。未列修正的頁面保留原文、圖片與教學順序；沒有為了增加篇幅新增設備或作業。

## 版面與來源

- 十份 PDF 共 415 頁，依來源與 PDF 閱讀順序逐頁核對操作承接、圖文、完整程式與練習。每頁渲染後以多頁預覽檢視；另外用 Poppler 放大複查 16 頁的接線、算例與終端機指令。
- 自動檢查包含文字界限、替代缺字字元、連結與來源指紋；人工檢查未見裁切、重疊或漏圖。自動字元檢查不能單獨證明字型與圖片正確。
- 網路教材產生器新增重複錨點及未解析粗體檢查；避免短指令與短清單不必要拆頁，將不可見錨點併入標題，修正標題孤立。
- 長程式附錄允許分頁，但有完整 `.ino` 檔；沒有用縮小字體強塞一頁。既有練習的下一頁解答安排保留。
- 選讀圖片頁的低文字密度是刻意安排；不是漏印。表格中的窄欄換行仍保留既有欄位，不修改報告要求。
- W3–7 PDF 的程式連結改為可攜的 GitHub 連結，建置時確認本機目標存在且未越出 repository。**本次尚未 push，遠端連結不是本次未發布內容的版本證據；檢查本次新增內容請使用完整本機 IoT 資料夾，尤其 Week 15 新增的 log 程式。**

## 程式與模擬證據

| 檢查 | 本次結果 | 不代表什麼 |
|---|---|---|
| Week 2 計數器及練習主機測試 | 計數器 11 組、練習 5 組通過；包含長按、重啟、抖動與雙鍵 | 不代表按鈕實際彈跳或接觸品質 |
| Week 3–4 主機測試 | 預設與 tone 設定通過；累計 102 項斷言 | ADC、DHT、蜂鳴器輸出為替代輸入輸出 |
| Week 5 主機測試 | 預設與 OLED1315 各 45 項斷言通過 | OLED 匯流排替代物不辨識真實晶片 |
| Week 6 主機測試 | 階段 1／2、OLED1306／1315 組合通過；每組 53 項預覽與 40 項共用程式斷言 | 不代表舵機脈寬、力矩、供電或停止安全 |
| Week 7 事件主機測試 | 3000／5000／1500 ms 與兩種 OLED 組合各 48 項斷言通過 | 不代表實際 GPIO、感測或網路延遲 |
| 後端 pytest | 26 tests passed；使用暫存資料庫與測試金鑰 | 不代表真實 ESP32、LAN 或手機連線 |
| Week 11／12／15 Arduino | 三份完整匯出程式重新編譯通過 | 沒有 upload，也未驗證實物供電或回應時間 |
| 手機頁面檢查 | 1280×800、390×844、快取離線重載通過；0 POST、0 JavaScript errors | 僅本機靜態伺服器及空的模擬 API；非實際手機安裝或即時 WebSocket 測試 |
| 來源／連結 | 十份來源與 PDF 指紋一致；三份程式匯出一致；含新增紀錄的 117 份文件連結及索引 65 項檢查通過 | 舊 notebook 的結構檢查不證明本次教學效果 |

Arduino 編譯結果：Week 11 flash 907974 bytes、RAM 46428 bytes；Week 12 flash 876786、RAM 46500；Week 15 flash 878266、RAM 46532。這些是編譯器報告的程式／靜態記憶體用量，不是執行時峰值。

版本：Windows、Python 3.12.9、pytest 8.4.1、FastAPI 0.116.1、httpx 0.28.1、PyMuPDF 1.27.2.2、Pillow 12.1.1、paho-mqtt 2.1.0、Node.js 24.15、ESP32 Arduino core 3.3.11、ArduinoJson 7.4.3、PubSubClient 2.8。MSVC 的常數條件警告未改變測試通過結果。

## 重做檢查

在 repository 根目錄執行，Python／Node 套件依 [工具維護說明](../../../scripts/README.md) 準備。這些命令不操作硬體：

```powershell
python -m pytest IOT_Introduction/examples/course_backend/tests -q
python IOT_Introduction/scripts/export_network_sketches.py --check
node IOT_Introduction/scripts/export_network_pdfs.cjs --check
python -X utf8 IOT_Introduction/scripts/verify_network_pdfs.py
python -X utf8 IOT_Introduction/scripts/review_lesson_pages.py --render
node IOT_Introduction/scripts/verify_mobile_shell.cjs
python IOT_Introduction/docs/teaching_drafts/integration_checks/verify_walkthrough_steps.py
git diff --check
```

Week 2–7 自己的 builder、verifier 與測試依 [逐週維護索引](../../teaching_drafts/README.md) 執行。渲染圖片與測試暫存輸出在忽略的 `_outputs/`，不需要當成教材發布；`review_manifest.json` 保留本次檢查 PDF 的指紋。重新產生後仍須看圖片，程式不會自行標記「已閱讀」。

## 尚需實物確認

以 [已購清單](../../hardware/purchased_inventory.md) 與 [元件辨識紀錄](../2026-09-06-procurement-and-hardware-identification.md) 為依據，不能用商品照片推定板卡腳序或電壓。

| 位置 | 待確認事項 | 現在保留的限制 |
|---|---|---|
| Week 4 p7、p11、p20 的 DHT11 | YS-31 實物三針腳序、允許供電、DATA 是否在 ESP32 邏輯範圍、有效讀值與失敗恢復 | 未以線色猜測；完整雙感測器實驗尚不能標示為實測通過 |
| Week 3 警示、Week 4／7 整合 | RGB／蜂鳴器實際限流、工作電流、重新啟動及停止行為 | 主機測試不解除實物條件與公開程式限制 |
| Week 5 OLED 接線 | 模組邏輯電位、上拉與帶載供電；實際顯示與重開機 | 0x3C 位址或相容顯示不能當作晶片身分證明 |
| Week 6 p7–16、Week 7 第二階段 | SG90 接頭、供電帶載、脈寬／角度、共地、回灌、開機及 STOP 行為 | 電表空載值與軟體測試不等於核准通電；未改採購及充電電池決策 |
| Week 11–15 的 LAN／手機練習 | 真實 SSID、網路隔離、防火牆、實際手機瀏覽器與 HTTPS 安裝條件；離線恢復 | 模擬手機尺寸與 API 測試不等於實際連線 |
| Week 11／12／15 STOP | 連線、斷線與重新連線時最長停止延遲 | 網路函式可能阻塞；未宣稱固定毫秒保證，不用來直接操作危險或大功率負載 |

**下一個優先事項是確認 Week 4 的 DHT11 實物條件。** 這是最早仍可能阻止完整操作的項目；完成標準是取得可核對的腳序／供電依據，再於另行授權的實物測試中記錄接線、DATA 電位、有效讀值與失敗恢復。舵機與真實網路的限制分別保留，不能由 DHT 測試代替。

本次沒有將尚未完成的實測寫成成功，也沒有新增「教師檢查後才能繼續」的學生流程。以上為教材與測試的待確認事項，不是另加評量或作業。
