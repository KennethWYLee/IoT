# Week 1–3閱讀順序與入門銜接修訂紀錄

日期：2026-09-05。對象：教材維護者；不是學生操作或實機驗證紀錄。

## 任務與範圍

依教師「開始修正，Week 1也同步修正」的要求，改善既有Week 1–3教材的概念入口、
第一次使用前的說明、程式呈現順序與長文件定位。不以150分鐘或篇幅限制刪減解釋。
本次未改課程週次、配分、採購數量、硬體接法、GPIO授權或共同實驗範圍。
Week 1仍是英文課綱main與繁體中文support；Week 2/3保留含參考答案的完整備課版。

開始時Git工作樹只有未追蹤的`ESP_Drone/`，未讀取、修改或納入本任務。
修訂前基準為`063c5c3`；本次未commit或push。

## 教學缺口與修正對照

| 週次／教學點 | 原有閱讀障礙 | 修訂位置與做法 | 可檢查的理解或證據 |
|---|---|---|---|
| W1：實體與軟體的角色 | 期末架構名詞先出現，尚無完整具體案例 | main第1節加入假設的桌面狀態指示器、角色表、本機互動與雙向訊息流程 | 先指出輸入、控制器、輸出、儲存事件及手機動作，再填自己的構想卡 |
| W1：命令與結果 | 可能把送出命令當成實體成功 | 同一案例區分event、command、result、timeout、裝置回報與實體觀察；support只保留進一步判讀 | 能指出沒有結果時仍有哪些未知，不由timeout斷言未動作 |
| W1：本週與期末 | 課程目標容易被讀成第一週就要做到 | main開頭及第5節區分課程完成能力與Week 1理解任務；第11節標出課後準備 | 本週不接線、不上傳；安裝在課後、Week 2前進行 |
| W1：資料版本與採購 | commit、push、Upload及賣場板名容易混淆 | main第8節說明三種目的地；support補ZIP快照、保留舊資料、模組與PCB差異 | 知道存檔／GitHub／板上執行不是同一狀態，收貨不靠N16R8猜供電或腳位 |
| W2：V、I、R | 最基本計算排在完成檢核後 | 將1 kΩ、3.0 V逐步例子移到第7節三個量的解釋之後；第13節只留上拉、短路與發熱深入推理 | 先確認同一電阻的已知與未知，能解釋0.003 A與3 mA；不新增電流量測 |
| W3：GPIO程式 | 完整程式先於實驗標題、目的與解釋 | 第9節目的、預測、逐段解釋移到程式格前；上傳與量測步驟接在程式後 | 分清命令文字與電表證據、正負號與兩端位置 |
| W3：光敏與ADC接續 | 第10節標題仍像首次辨認；ADC程式也先於目的 | 第10節改為分壓及S對GND電壓；第12節目的與取樣解釋移到程式前 | 分清先電表觀察S、再讓ADC記錄S；raw不是V或已校正明暗 |
| W1–3：章節定位 | 長文件不易返回操作位置 | 明確錨點、章節連結與可點擊流程表；接線階段連到接線前置，不直接跳至上傳 | 本機預覽逐一點擊確認目的地；仍依實驗順序完成 |

Week 1未加入任何硬體實作或隱藏題解。Week 2仍只做斷電通斷、GPIO命令觀察及
按鈕去抖Discussion；Week 3仍只有室內光與遮光兩種條件，不因增加說明要求重做
相同實驗。Week 3第13.7節1 kΩ／10 kΩ實作與既有答案均保留。

## 修改的維護來源

- `IoT_Introduction/Week_01_Course_Orientation/week1_main.md`
- `IoT_Introduction/Week_01_Course_Orientation/week1_support.md`
- `IoT_Introduction/Week_02_ESP32_Hardware_Basics/week2_main.ipynb`
- `IoT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb`
- `scripts/verify_intro_navigation.cjs`：新增四份文件的錨點與閱讀順序檢查、Week 1本機渲染。
- `scripts/verify_week2_notebook.cjs`、`scripts/verify_week3_notebook.cjs`：配合新位置加入回歸斷言。
- `scripts/build_week2_figures.cjs`：章節尋找允許標題前有錨點；沒有更動畫圖函式或產生新圖。
- `scripts/README.md`：新增導航檢查的執行與限制說明。

`PROJECT.md`及教材設計框架已有本次適用的無時間上限、先概念後操作及答案授權，
本次沒有新增課程決策，故不重寫它們。兩份notebook的cell數、ID、metadata、code
cells及所有附件內容與修訂前相同；只修改markdown source。既有照片沒有後製，
沒有以生成內容取代原始實物證據。

## 來源與查核

完整讀取AGENTS.md、PROJECT.md、教材設計框架、正式英文課綱、18週計畫及當週教材，
並依本次內容查閱既有程式、硬體辨識／驗證紀錄及圖片建置、驗證方式。
基本電學計算沿用已附Fluke／Espressif官方來源的既有例子，不新增器件規格。
Week 1新增的版本管理與ZIP說明另核對：

- [Git commit官方文件](https://git-scm.com/docs/git-commit)
- [Git push官方文件](https://git-scm.com/docs/git-push)
- [GitHub原始碼封存下載](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)

## 實際執行的驗證

環境：Windows、bundled Node.js／Python、`sharp`、`marked`、`playwright`、本機Microsoft Edge。
以bundled Node套件目錄設定`NODE_PATH`。本機HTML與截圖輸出至Git忽略的`_outputs/`。

| 檢查 | 實際結果 |
|---|---|
| `verify_course_materials.py` | 18週結構、81份Markdown／notebook（含本紀錄）及本機連結通過；Week 18兩檔仍空白 |
| `verify_intro_navigation.cjs` | 66個本次涵蓋的明確導航連結、唯一錨點、Week 1英文及選定閱讀順序通過 |
| `verify_intro_navigation.cjs --render` | Week 1 main的10次及support的9次頁內連結點擊通過；6張support圖片載入；1200／420px無整頁水平溢出 |
| `verify_week2_notebook.cjs --render` | 3支公開程式副本、14個附件、單位計算及去抖JS模型通過；1280／420px預覽與SVG文字邊界通過 |
| `verify_week3_notebook.cjs --render` | 2支公開程式副本、12個附件、接點模型、分壓計算及答案涵蓋通過；1200／420px預覽與SVG文字邊界通過 |
| 兩份figure builder的`--check` | 各8張SVG／PNG與notebook附件保持同步；照片原始位元組未變 |
| 本機notebook頁內連結逐一點擊 | Week 2共21次、Week 3共25次，目的錨點皆存在且location hash符合 |
| 相對`HEAD`的結構比較 | 兩份notebook所有cell ID／metadata／附件位元組及完整code cell未變；Week 1評量表逐字相同 |
| 人工預覽與差異檢閱 | 檢視Week 1案例與手機版準備說明、Week 2移動後計算例子、Week 3 GPIO／ADC導入截圖；檢閱實際文字差異 |
| `git diff --check` | 通過；只有Git的LF轉CRLF提示，沒有空白格式錯誤 |

## 未執行及限制

- 本次沒有改動Arduino程式，未重新編譯全課程；程式副本與既有examples逐字核對通過。
- 未Upload、未開啟COM連線、未做target／physical test，不把既有使用者實測當成本次測試。
- 去抖執行的是JavaScript規則模型，分壓計算是理想電阻模型，不是硬體量測。
- Week 3新增兩顆散裝電阻實作仍保留先前的實機待驗狀態，沒有補造讀值。
- 本機Edge渲染與附件核對不等於GitHub實際發布驗證；本次沒有push。
- 未請獨立初學者從頭試讀與操作，不能據文件檢查宣稱所有新生已能獨立完成。

結論：本次核准的閱讀順序、概念入口與導航修正，在上述文件與本機預覽範圍內完成。
後續教學若出現新的理解障礙，應補在第一次需要該概念的位置，不增加重複實驗或
把尚未驗證的硬體現象寫成已通過。
