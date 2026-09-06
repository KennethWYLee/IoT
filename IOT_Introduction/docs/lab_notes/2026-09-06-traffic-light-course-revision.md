# 紅綠燈遮光挑戰：課程修訂與驗證紀錄

讀者：維護者。本次課綱調整、Week 1及Week 3～7教材已完成目前環境可執行的驗證；
不是全課實機發布完成宣告。下列階段紀錄保留工作當時的狀態，最終結果以「最終回歸」為準。

## 任務與保護範圍

- 教師核准新18週安排、Week 1材料與Week 3～7教材、程式及圖解，完成後commit及push。
- Week 2教材、程式、圖片與生成來源不修改。
- 完整備課版含參考解答；不是無答案學生版。現場腳位、安全供電與模組profile未核准不得跳過。
- `AGENTS.md`、`CLAUDE.md`、`PROJECT.md`及`ESP_Drone/`留本機不發布。
- 每主要階段前後讀取帳號用量；剩餘≤5%立即保存進度並停止新增工作，等待教師明確要求繼續。不自行兌換reset。

## 課綱／材料階段

已修訂課綱、校曆、教師課卡、材料用途及Week 1。Week 9出國維持原位；
Report 1移Week 8、Exam 1移Week 10；網路移Week 11；MQTT與Database在Week 12；
Report 2在Week 13、手機Week 14、安全Week 15、Exam 2 Week 16、期末展示合併Week 17。
配分與個人問答不取消；尚須跨檔完整回歸與導覽同步。
新完整設計以`traffic_light_challenge_design.md`為依據。
階段末用量剩餘26%；進入實作前25%。

## Week 3：本地分類延伸

保留既有V/I/R、電表、3V3／5Vin、GPIO、KY原理、實測案例與1 kΩ／10 kΩ分壓。
新增第十二之一節：沿用原20筆基準，計算不重疊區間的中點及方向、印室內光／遮光，
以兩組各5筆獨立新資料驗證，已有可追溯的獨立紀錄可引用。不重做全部量測。
教學對照：

| 能力 | 講解／範例 | 操作／練習 | 結果與回饋 |
|---|---|---|---|
| raw到字串 | 12A.1／資料流程圖 | 610、611預測 | 解釋門檻不是HIGH規格 |
| 建立相對門檻 | 12A.2～4／兩組區間圖 | 自己的min/max、重疊反例 | 中點可追溯，重疊則拒絕 |
| 程式與來源 | 12A.5～7／完整第三支sketch | profile、四值、Upload、逐欄log | blocked原因、安全檢查與quality分開 |
| 界限與證據 | 12A.8～9／題目與參考答 | 邊界跳動、換位置、新資料比較 | 吻合率只限本次樣本，不是永久準確率 |

實際執行：

- `build_week3_classifier.cjs`及`--check`：三張新SVG／PNG與三個新cell同步。
- `verify_week3_notebook.cjs --render`：23 cells、3支公開程式一致，15張PNG／JPEG附件解碼；
  原有分壓節點／計算斷言保留。Edge本機1200／420 px無整頁溢出，SVG文字在畫布內。
- 已實際檢視三張分類PNG：資料流程、分離區間與重疊區間；無生成式實物補繪。
- Arduino CLI以ESP32 core 3.3.11、`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`
  編譯新增classifier：程式290203 bytes，所選程式區上限1310720 bytes；靜態RAM22412 bytes。
  這不是16 MB Flash整體22%或執行時全部RAM用量。
- `verify_week4_host.py`新增Week 3真實sketch的stub輸入測試，連原KY及DHT共55個斷言通過；
  檢查公開預設不碰GPIO、中點610、邊界、端點、空隙、超觀察範圍、500 ms及中文輸出。
  Host替代I/O不是實體ADC測試，舊Week 4測試不能代替後續新整合程式。
- `git diff --check`未報空白錯誤；Git有既有LF／CRLF轉換提醒。

未進行Upload、target、physical、初學者完整試讀或GitHub即時render。
新分類需要指定profile及真實兩組範圍；未將教師舊log冒充新分類驗證。
階段末用量剩餘25%。整體尚未commit／push，須待後續範圍完成並全套檢查。

## Week 4：雙感測器與穩定遮光蜂鳴提示

主維護來源仍為`week4_main.source.md`，原DHT完整程式及說明保留。
KY基準流程改為Week 3銜接，不再要求全班重做兩組基準與兩組驗證；
原`week04_ky018_quality`範例仍保留供歷史與測試使用，不列本週必要sketch。
新增`week04_dual_sensor_alarm`、四張概念圖及實物HW-508辨認照片引用。
原16張圖的builder仍保留舊圖來源，不把舊圖當新整合證據。

| 能力 | 教學／圖解／練習 | 完成判讀 |
|---|---|---|
| 正確解讀電表 | 4.1A三種表筆情境、200與2M、教師口頭回報界限 | 分開／相碰／跨電阻不混淆，不把1當1 Ω |
| 穩定遮光事件 | 5～6候選／穩定／armed時間圖、L1預測 | 開機遮住不計數、持續遮住不重複、解除後才重新準備 |
| DHT與KY分別取樣 | 8～12既有DHT深度、12A雙路徑與排程圖 | 母對母DATA；不同sample、time、age及valid，不假造同時性 |
| 蜂鳴安全與證據 | 12A.2核准表、完整程式、mute及短鳴 | GPIO只連已核准控制介面，命令不等於實際聲音／停止 |
| 獨立失敗與恢復 | f／k／r注入、A～D預期答案與Discussion結論 | DHT失敗不掩蓋KY；KY無效清狀態，恢復先解除，不填舊值 |

實際檢查：17 cells、16張附件byte-match、2支完整程式來源一致、12個本機連結／錨點；
Edge本機1200／420 px及16張SVG文字邊界通過。逐張檢視四張新PNG，修正雙感測器圖中的
ADC箭頭方向後重新生成。新增程式編譯摘要319848 bytes／1310720、靜態RAM23008 bytes。
Host目前共77項斷言，涵蓋新整合的公開gate不碰硬體、候選時間、持續不重複、
120 ms軟體關閉邊界、靜音不補播、DHT獨立注入、KY故障清armed、兩者恢復與超範圍拒絕。
修正Windows編譯器輸出解碼問題後重跑，輸出可讀且通過。
文件總檢查曾指出Week 1的舊禁語，已改為持續改善的正式描述，需於最終回歸重跑。
本階段末用量剩餘25%。未進行DHT／蜂鳴器供電、接線、Upload、聲音或實體停止驗證。

## Week 5階段完成（目前環境）

新增`week5_main.source.md`、`week5_main.ipynb`、兩支完整sketch、五組SVG／PNG與
對應生成／檢查程式。主教材12 cells、6張圖片（含實物RGB照片），問題、完整答案、
毫秒例子、單模組操作、倒數、顯示故障、RGB光學干擾與收尾集中同一本。
舊Week 5單機稿尚留原處，將在目錄同步階段封存，不用其舊三光線規則覆蓋新教材。

| 學習目標 | 教學／操作對照 | 預期結果與回饋 |
|---|---|---|
| RGB功能與回路 | 2、7.1實物、支路圖、o/r/g/b/o | 命令與目視分開；錯色先斷電追線 |
| OLED通訊與顯示 | 3、4、7.2掃描及固定畫面 | ACK不推定型號，控制器／拉高電壓未核准不啟動 |
| 倒數時間 | 5、6、7.3與9.1～3 | 時間差而非刷新次數；到期不為負數，畫面取整不控制期限 |
| 狀態與可見資訊 | 7.3～4及9.4～5 | s不能延長、故障需c檢查再z，不自動續局 |
| 輸出干擾輸入 | 8、9.6 | 未遮光固定其他條件，比RGB關／紅／綠，不重做全部ADC |

已執行：兩支sketch以ESP32 core3.3.11編譯；I2C掃描305411 bytes、timer337788 bytes，
應用分割區上限1310720；靜態RAM23500／25320 bytes，上限327680；U8g2 2.36.15。
主機以實際ino加stub執行45項斷言，含公開預設不操作硬體、到期邊界、取整、
重複Start拒絕、凍結、中止、注入與真實stub ACK失敗、回繞及慢I2C後重查期限。
生成一致性、連結、表格、fence、附件byte-match及Edge1200／420 px通過。
逐張檢視五張新圖，修正光學隔板與文字重疊、RGB共同回路標示後重新生成與檢查。
本階段末／下階段前用量剩餘24%。未進行OLED、RGB、光學干擾或輸入反應的實機驗證。

## Week 6階段完成（目前環境）

新增單本主教材、維護MD、一支完整sketch與七張SVG／PNG，另引用兩張實物照片。
學習對照：第2～3節供電／共地／電表，4節count映射與脈波，5～7節接線／程式／受限指針，
8節STOP／timeout／clear／reset，9節六題單一Discussion與答案，10節排錯及完成證據。
未核准的GPIO、電源、端子、脈寬與初始供電順序均阻擋；特別保留無電時signal回灌的相容性待驗。

已執行40項真實sketch的host stub斷言：公開預設不碰硬體、映射0／3／4／6、
放開穩定再arm、指令間隔、30秒不被新命令延長、持續STOP阻擋c/z/a、
clear/reset不自動attach、故障與ACK失敗、attach失敗、時間回繞、慢OLED後重新檢查期限。
指定ESP32S3編譯357303 bytes／1310720；靜態RAM25884／327680 bytes；ESP32Servo3.2.1。
Notebook9 cells、1支程式、9張來源一致附件，Edge1200／420px及7張SVG邊界通過；
逐張檢視7張PNG，修正共同參考地箭頭後再生成。文稿補充上電順序相容性；最終全套再回歸。
階段末／Week 7前用量剩餘24%。未進行接線、Upload、實體位置、聲音、負載供電及停止延遲驗證。

## Week 7階段完成（目前環境）

新增單本主教材、維護MD、完整遊戲sketch與八組SVG／PNG。教學對照涵蓋規則、
遮光完整事件、雙門檻與穩定時間、同輪優先序、分階段整合、資料欄位、程式與十題Discussion。
低功率階段與含舵機／蜂鳴器階段分開；未核准profile阻擋硬體初始化。

已執行90項實際sketch的host stub斷言，包含按鈕去抖、計分0～6邊界、
持續遮光不重計、跨燈色、同輪第六次與Finish、期限優先、雙按鈕中止、
短暫／持續無效資料、故障注入與恢復、arm期限、I2C故障、時間回繞、
顯示後資料過期、同輪注入取消先前事件及多局重新開始。
編譯353544 bytes／1310720；靜態RAM25944／327680 bytes。
Notebook9 cells、1支來源一致完整程式與8張附件；Edge1200／420 px及SVG文字邊界通過；
八張PNG均已目視檢查。最後小幅程式／文字修正將隨全套回歸重跑呈現檢查。
未進行實際接線、Upload、遊戲操作、光學干擾、供電、舵機位置或停止時間驗證。
階段末剩餘24%；目錄整合階段開始再次查詢剩餘23%。

## 目錄與跨週整合完成（進入最終回歸）

已依新課綱搬移實際週次目錄與main/support檔名；舊單機稿、合併前資料庫稿與原Week 16
期末展示稿保存在IOT_Introduction/docs/archive，不直接刪除內容。Week 12合併MQTT及資料庫完整步驟，
Week 17保留所有組展示及個人問答；未知班級組數與單週容納量仍待教師確認。
同步課綱、校曆、材料表、導覽、課卡、框架、rubrics、worksheet與本機PROJECT；Week 18空白。
Week 1新增遊戲功能預覽圖（不是接線或已驗證成品），OLED及供電選型保持待核准。
補存教師已提供的電阻實物照片，修正庫存位置與已知證據，不把文字回報視為儀表精度驗證。

遷移後文件檢查：18週結構、88份Markdown/notebook與本機連結通過。
同時發現並澄清舊網路教材兩個限制：RAM最近8筆去重不是開機期間永久保證；
Automation同時有10秒動作期限與30秒MQTT離線期限，前者先觸發不能算後者測試通過，
Backend停止也不等於broker斷線。本輪不重新設計後段網路協定。
目錄階段末用量剩餘23%，下一階段先再次查詢。

## 最終回歸（目前環境可驗證範圍內完成）

- 結構與本機連結：18週、88份Markdown/notebook通過；Week 18兩檔皆0行。
- 來源重建：Week 4、5、6、7重新生成並通過`--check`；Week 3原圖工具原先只接受20 cells，
  已修正為辨認20個原cells及3個分類extension cells，原圖與分類兩個`--check`均通過。
  這是工具對新增內容的相容性修正，沒有回寫或刪除原Week 3教學。
- 主機邏輯：77（含Week 3／4）+45（Week 5）+40（Week 6）+90（Week 7）=252項斷言通過。
  執行的是維護sketch搭配明示stub，不是使用實體GPIO、ADC、I2C或舵機。
- 後端／資料庫／MQTT bridge：既有`IOT_Introduction/examples/course_backend/.venv`中執行pytest，26 passed。
  預設bundled Python沒有pytest，未當作通過；找到既有環境後才成功執行。
  有143則FastAPI對Python相依API的DeprecationWarning，不是測試失敗，本輪未升級套件。
- Week 1～7本機Edge預覽皆通過：Week 1連結可點、7張support圖；Week 2十四圖、Week 3十五圖、
  Week 4十六圖、Week 5六圖、Week 6九圖、Week 7八圖均解碼。手機420px及桌面1200px
  （Week 2桌面1280px）沒有整頁水平溢出；寬表與code保留捲動，不宣稱全部內容無需捲動。
  本輪各新增PNG已逐張檢視，最終另抽看Week 7 Discussion與Week 1窄版畫面。
- Node語法檢查：scripts下CJS、實際`static/sw.js`及`index.html`內1個script區塊通過；
  manifest JSON解析通過。曾指定不存在的app.js，未列作成功，已改查實際檔案。
  受影響Python檢查腳本及Backend／bridge／DB工具的py_compile通過。
- 20條主要官方技術連結：19條一般HTTP 200；Arduino舵機支援頁一般請求403，改由web查核可讀取官方內容。
  HTTP狀態不代替技術內容查證，也不保證所有校園網路均可開啟。
- 六份日期表完全相符、18個日期均為相隔7天的星期三，五個報告／筆試位置正確。
  Week 2的25個教材／程式／圖解／工具檔與原HEAD一致；六份封存稿除了連結目標外文字完整保留。
  本機三份agent/context檔仍未追蹤，個人專題與生成輸出保持忽略。
- `git diff --check`通過；差異中的移除路徑均對應搬移或封存，不是丟棄舊教材。
- `verify_markdown_arduino.py`完整執行結束，21支完整／組合sketch全部編譯成功。
  包含Week 2～7、Week 11／12、保留的歷史範例、共用起始範例及組合後的Week 15程式。
  最後一支Week 15為878266／1310720 bytes程式區、46532／327680 bytes靜態RAM。
  編譯環境為Arduino ESP32 core 3.3.11，FQBN `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`；
  DHT 1.4.7、Adafruit Unified Sensor 1.1.15、ESP32Servo 3.2.1、U8g2 2.36.15、
  ArduinoJson 7.4.3、PubSubClient 2.8。這是編譯，不是Upload或實體模組驗證。

最終回歸結束再次查詢帳號用量，剩餘22%，未觸及≤5%的停止門檻。
本次範圍在已執行的文件、呈現、編譯與host檢查中沒有已知阻擋性錯誤。
依教師要求進入commit／push交付；是否已推送及commit識別碼以Git紀錄與交付回報為準。

## 交付檔案分組

- `IOT_Introduction/Week_01_Course_Orientation/`：新課程方向、材料及遊戲功能預覽。
- `IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/`至`Week_07_Traffic_Light_Challenge/`：
  五本主教材，依序為光線分類、雙感測器與蜂鳴提示、RGB／OLED倒數、舵機指針、完整遊戲。
- `IOT_Introduction/docs/course/`、`IOT_Introduction/docs/course_materials/`及`IOT_Introduction/docs/hardware/`：課綱、課卡、設計標準、
  遊戲規則權威文件、Notebook維護來源、材料用途及驗證限制。
- `IOT_Introduction/examples/week03_light_classifier/`至本次新增的`IOT_Introduction/examples/week07_traffic_light_challenge/`：
  六支新增完整程式；既有Week 2程式未變動。
- `IOT_Introduction/docs/images/wiring/`：27組新SVG／PNG概念圖；`IOT_Introduction/docs/images/hardware/actual/`補存教師原始電阻照片。
- `IOT_Introduction/scripts/`：生成一致性、Notebook呈現、Arduino編譯及實際sketch的host stub檢查。
- Week 8～17目錄、README導覽與`IOT_Introduction/docs/archive/`：依核准課綱搬移、合併及封存；不取消個人問答。

Week 2共25個受保護教材／程式／圖片／工具檔比對無變動；本機agent/context檔、
`ESP_Drone/`與`_outputs/`不納入本次公開提交。未刪除教師原始照片或丟棄封存教材。

## 尚待實機與教學確認（不冒充軟體檢查通過）

1. OLED確切控制器／解析度／位址／腳序／供電與上拉相容性、採購價格及新版總額。
2. DHT11、HW-479、HW-508、SG90及所有新接線的核准profile；4AA化學種類、端子、
   極性、空載與負載電壓、電流及signal回灌／初始化順序。
3. 真實Upload、感測值、蜂鳴聲長、指針位置、STOP／中止最長反應時間、供電與光學／機械干擾。
4. 初學者逐步試讀與一局規則的可操作性、公平性；班級組數與Week 17單週展示容量。
5. GitHub即時Notebook顯示尚未操作；本機render與圖片附件一致不等於已在GitHub目視驗證。
