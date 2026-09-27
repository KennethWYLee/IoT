# 2026-09-27 全學期 Main／Ans 整理

## 範圍與決定

依教師「根據 week3 作法，逐週次，修正所有週次」，檢查 18 週現行入口。
採用 2026-09-24 Week3 已確認的分工，不套用 Week3 的感測器題材。

- Main 是整份題目卷。實作依「作品、特色與預期結果、可行的驗證、最後作答」安排，保留手寫空間。
- 不在 Main 後半段附教學；完整原教學、接線、基本程式、延伸答案與原理都放 Ans。
- 題目避免重抄規格、測量位置或同一結果。要求學生用自己的觀察、程式或理由回答。
- Main 給足產品行為及紙上推理條件，不要求依未給定的「本課規則」猜答案；不把 GPIO、函式庫與設定表當作作品說明。
- 原理先解釋正常情況，再比較只改一處的反例。安全警告不後移；電流路徑與資訊流分開。
- 保留週次、零件、授課順序與正式評分。報告與正式筆試不改成可用 AI 提早離開的考試。
- 本次沒有新增正式筆試題或答案，也沒有 commit、push、雲端更新或硬體操作。

## 逐週結果

| 週次 | 現行結果 | 本次處理 |
|---|---|---|
| 1 | 課程與採購 Markdown | 在原作品示意前放簡短討論；交代 Main／Ans，安裝引用改為教師提供的 Week2 Ans。行政與採購不變。 |
| 2 | Main 5 頁；Ans 47 頁 | 題目與教學分離；保留電表、單／雙按鈕、上拉電路、電阻反例及人數計數練習。 |
| 3 | Main 12 頁；Ans 95 頁 | 沿用已確認版本；重新檢查來源、全文程式、頁內引用與邊界，未重寫。 |
| 4 | Main 11 頁；Ans 72 頁 | 沿用已確認版本；重新檢查來源、全文程式、頁內引用與邊界，未重寫。 |
| 5 | Main 7 頁；Ans 69 頁 | RGB、OLED、倒數、可調／暫停作品；紙上時間推理與實物觀察分開。 |
| 6 | Main 5 頁；Ans 62 頁 | 計數指針、供電、共地與停止；角度計算是紙上示例，不當成實機安全角度。 |
| 7 | Main 7 頁；Ans 70 頁 | 原紅綠燈遊戲規則與整合、同時事件順序、停止及每局摘要；精確事件用程式／模擬驗證。 |
| 8 | 第一次報告 Markdown | 原成果要求整理為 Q1～Q5；12～15 分鐘、15%、硬體片段及課前環境要求不變。 |
| 9 | 選讀 Markdown | 原本不收新成果；保持不變，不加考卷。 |
| 10 | 第一次筆試說明 Markdown | 保留 15%、Week2～7 範圍及既有規定；不產生公開正式考題或答案。 |
| 11 | Main 5 頁；Ans 42 頁 | 事件、手機命令、重複 START、回報、WebSocket 與故障；完整 HTTP 教學與程式移入 Ans。 |
| 12 | Main 5 頁；Ans 49 頁 | 多裝置、MQTT、失聯、歷史資料、命令追蹤與驗證失敗；原教學與程式移入 Ans。 |
| 13 | 第二次報告 Markdown | 原進度與修正要求整理為 Q1～Q4；保留 15%，不凍結功能；開發週次誤字修正為 Week14～15。 |
| 14 | Main 4 頁；Ans 34 頁 | 手機介面、最後更新、離線、權限、START 確認與 PWA；原教學與完整前端參考檔在 Ans。 |
| 15 | Main 4 頁；Ans 49 頁 | 自動反應、停止、連續取樣修改與重建；保留故障與硬體限制，原教學及程式在 Ans。 |
| 16 | 第二次筆試說明 Markdown | 保留 15%、Week11、12、14、15 範圍及既有規定；不產生公開正式考題或答案。 |
| 17 | 期末報告 Markdown | 原展示與個人問答整理為 Q1～Q4；25%、共同截止、每組一次與截止後只修故障不變。 |
| 18 | 空白保留 Markdown | 維持空白。 |

現行閱讀入口以[課程索引](../../README.md)為準。Week3～7 舊正式目錄的 Notebook／PDF 是歷史版本，不用舊匯出器覆蓋目前重設稿。

## 維護來源

| 範圍 | 題目來源 | 完整教學與答案（本機，不加入 Git） |
|---|---|---|
| Week2 | `docs/teaching_drafts/week2_redesign/exam_pages.cjs` | 原課堂頁仍由 `build_sample.cjs` 的 `lessonPages` 維護；另讀 `week2_answers/exam_answers.cjs` 與 `room_answer.cjs` |
| Week3～7 | `docs/teaching_drafts/weekN_redesign/weekN_main.md` | `docs/teaching_drafts/weekN_answers/weekNAns.md`，沿用各週 `build.cjs --answers` |
| Week11、12、14、15 | 各週目錄 `weekN_main.md` | `docs/teaching_drafts/weekN_answers/lesson.md` 保存原完整教學，由 `weekNAns.md` include，再接逐題答案 |
| Week1、8、13、17 | 各週目錄 `weekN_main.md` | 原本就是課程／報告文件；沒有另造標準專題答案 |

Week5～7 的分離前來源副本保存在各本機 `weekN_answers/before_exam_split/`。
網路週的分離前 Ans 保存為 `answers_before_split.md`，原 Main 全文在 `lesson.md`，只調整相對引用及現行教材名稱。
`export_network_sketches.py` 與 `verify_markdown_arduino.py` 的程式擷取位置改讀完整教學來源；canonical `.ino` 邏輯未修改。

保留 Week2 正式 PDF 與 layout sample 的同內容副本；Week2 Ans 亦有正式週目錄副本。
教材索引、每週 README、修訂準則、通用設計框架及目前入口的檢查腳本已同步。資料庫舊稿的兩個失效支援連結改回其同目錄原支援稿，封存內容不變；封存 README 更新現行入口。

## 代表性修改

| 原本安排 | 現行安排 |
|---|---|
| Main 一面帶做、一面出題；學生先看見實作方法 | Main 只列應完成的作品及可驗證結果；Ans 保留完整帶做與原理 |
| 跨週引用舊 Main 的教學或舊頁碼 | Ans 引用對應完整教學；Week1 明說安裝畫面在教師提供的 Week2 Ans |
| 倒數／事件要求混合手動按壓與精確毫秒 | 實物看可見結果；精確時間序列用題目給定條件、程式紀錄或電腦模擬 |
| 網路週直接提供連線參數與操作步驟 | 先問作品的事件與命令如何到達、失敗後呈現什麼，再由 Ans 說明設定與操作 |
| 各報告散列重複要求 | 依展示、證據、未解決問題與下一步合併問答，既有配分及成果不變 |

## 檢查證據

已完成：

1. 八個更新實作週的 16 份最終 PDF 共 464 頁，全部由 Poppler 渲染；逐頁縮圖檢查版面、圖片、程式區塊及分頁。文字邊界、替代字元與非空頁自動檢查通過。網路 Main 另外逐張題目頁量測高度，修正答案框被擠到下一頁的問題。
2. Week2 Main 5／Ans 47：來源及 PDF 雜湊、全文程式、電壓說明回歸、鏡像一致、Main／Ans 分離通過。
3. Week3～7 Main／Ans：來源與 builder 雜湊、嵌入完整 canonical 程式、圖片、重複錨點、頁內引用與文字邊界通過。Week3、4 沒有重建或改動。
4. 四個網路 Main 與四個 Ans 的 manifest check 通過；所有引用來源、included lesson、圖片及 exporter 與產物一致。網路程式擷取 check 通過，三份 `.ino` 與三份 `secrets.example.h` 沒有變更。
5. Week5、6、7 以 canonical 程式及模擬 I/O 在電腦編譯執行，分別通過 45、40、92 項斷言，共 177 項。編譯器有既有常數條件警告，沒有編譯或測試失敗。
6. 後端 `pytest -q`：26 passed。手機介面的桌面／手機尺寸、viewer、localhost worker、快取畫面與離線 API 檢查通過；該測試不送控制命令。
7. 另寫與 Arduino 程式分開的算式及狀態模型，核對上拉支路示例、倒數剩餘毫秒、指針映射與截限、連續暗／亮取樣及 MQTT topic filter 題目。模型共用題目假設，不代表獨立實機證據。
8. Week1 修改段落及 Week8、13、17 全文以瀏覽器渲染並目視檢查。Week1 採購計算、35 個明確導覽引用檢查通過。
9. Ans 來源與 PDF 均為 Git 忽略項目；`git ls-files '*Ans*' '*_answers/*'` 無結果。`git diff --check` 無 whitespace error，僅 Windows 換行提示。原先的 Week4 `.ino` 換行差異及 repo 根目錄 `examples/` 未動。
10. 現行課程結構、136 份 Git 範圍內 Markdown／Notebook 的本機連結、表格與錨點檢查通過；Week18 仍空白。檢查器改按現行題目卷要求驗證，不再以 Main 至少 180 行或固定教學標題判定是否完整。

本機渲染索引：`_outputs/semester_review/index.json`，含逐份 PDF SHA-256、逐頁文字檢查與 PNG 位置。
電腦測試輸出：`_outputs/week5_host/`、`week6_host/`、`week7_host/`；獨立題目核對：`_outputs/check_exam_calculations.py`。
這些暫存資料不發布，不包含學生資料或硬體實測結果。

## 技術來源與限制

技術對照使用 [Espressif GPIO](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html)、
[ADC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)、
[MQTT 3.1.1 規格](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)及
[MDN Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)。
電阻數值與角度映射的題目示例不改成板卡／舵機的實測規格。

- 本次沒有重新編譯 ESP32 目標、上傳韌體、接線或操作裝置。電腦模擬、文件與瀏覽器檢查不能代替實機。
- DHT11、完整蜂鳴器停止與電流、RGB 電流、SG90 帶負載供電及動作範圍仍依[硬體狀態](../hardware/hardware_state.md)逐項確認。未核准的 profile 保持停用。
- 本機 Ans 的跨檔案教學連結用本機 PDF 路徑；搬到另一台電腦或雲端後須另驗證。PDF 內保留完整內容，不依跨檔案連結才能讀到本週答案。
- Git 不會同步忽略的 Ans。日後發布 Main 前須另保存教師用來源與 PDF；不要用 `git add -f` 把私有答案混入學生入口。
- 未更改評分、正式筆試規則或課程時程。是否讓學生提早離開由教師現場判斷，本輪沒有加入行政流程。

## 重建與後續

在 repo 根目錄使用既有 Node（marked、Playwright）與 Python 環境。Week2 由 `build_sample.cjs`／`build_sample.cjs --answers`；Week3～7 由各週 `build.cjs`／`build.cjs --answers`；網路週由 `scripts/export_network_pdfs.cjs`／`--answers N` 重建。

重建後執行 `verify_sample.py`、`scripts/verify_redesign.py N [--answers]`、`export_network_pdfs.cjs [--answers N] --check`、`scripts/export_network_sketches.py --check` 與 `scripts/verify_course_materials.py`，再檢查最新渲染。

下一步優先確認尚未通過的硬體條件，才進行有關裝置實作；教材文字審閱可從 Week5 Main 開始，確認只讀題目是否能理解作品、完成條件與要回答的內容。未取得另次授權前不提交、推送或更新雲端。
