# Week 2 教材與Discussion完善紀錄

本檔是教材維護紀錄，不是新的學生入口或實機測試報告。
日期：2026-09-05。依教師要求，先commit／push既有Week 3，再用相同或更高的
說明標準補強Week 2，完成後再commit／push。

## 範圍與版本

- 起點：`6a3a7f5`，已將前一階段Week 3圖說與完整答案推送到origin/main。
- 本次主教材：[week2_main.ipynb](../../Week_02_ESP32_Hardware_Basics/week2_main.ipynb)。
  當週仍只有此一本notebook；完整解答依教師明確授權放在第10.7～10.10節，
  開頭標示「完整備課版（含參考答案）」，不是無答案學生版。
- 不把Week 3的電壓、散裝電阻、光敏或ADC實作移回Week 2，不另加Discussion主題。
- 未修改其他週教材，未接管未追蹤的`ESP_Drone/`。最後提交編號以Git歷史為準。

## 講解、例子、練習與回饋對照

| 編號／提問 | 說明與完整例子 | 操作或判讀 | 預期回答／證據 |
|---|---|---|---|
| W2-01：PCB、模組與CH343各是什麼？ | 第四節實拍、階層圖、board-check欄位逐列說明 | 指認實物、查自己的模組／板型；既有board-check只判讀不必重做 | 不把generic Board當PCB；不把running當所有硬體通過 |
| W2-02：軟體怎麼裝，COM8與板背COM是一樣嗎？ | 第四、五節官方套件索引、Boards Manager、Port拔插比較；程式方向圖 | 安裝／核對版本，辨認COM USB，找新出現Port | 板背接口、Windows Port、電表COM分開；記錄設定與來源 |
| W2-03：Verify、Upload、Monitor、RST各做什麼？ | 第五、六節電腦→板子→Monitor圖；version=1改2的預測 | 只Verify的紙上預測，再Upload驗證version=2 | 第10.10節：RST不傳送新版；保存Output與新版本log |
| W2-04：9% Flash、6% RAM、R8 PSRAM差在哪？ | 第六節兩種分母圖；302598／3145728、22136／327680逐步算 | 用自己的摘要指出分子、分母與限制 | 第10.10節；不當作全Flash、PSRAM比例或runtime峰值 |
| W2-05：電表藍黑、200、61、198與蜂鳴代表什麼？ | 第七節功能／量程／單位圖、接觸不穩例子 | 先學表筆孔、斷電通斷，再用於麵包板與按鈕 | 不由裸數字猜Ω；無蜂鳴不代表完整安全證明 |
| W2-06：杜邦線要撕嗎？同列、跨槽、按鈕內部怎麼連？ | 第八節保留實拍與逐孔操作；新增節點圖 | 空板同列／跨槽，再量按鈕同組與跨組 | 空板條件與插入按鈕後分開；未按響不必然按鈕壞 |
| W2-07：GND、3V3、GPIO、上拉及閉合迴路怎麼串？ | 第四節地面／平台／電梯類比，上拉放開／按下對照圖 | 紙上追蹤兩狀態；實際只做profile按鈕線路 | 第10.10節；true=按下，不是HIGH；USB不代表每GPIO都3.3 V |
| W2-08：為何b22接a29？a29換b29可以嗎？ | 第八節唯一接線表與節點圖；板子留在麵包板外 | 對照候選4／5與教師profile，斷電查TPO／TPG及按鈕 | a29/b29同節點，a28不同；兩條地線不是兩個電源 |
| W2-09：程式變數、input LOW／output HIGH與時間差？ | 第六、九節逐段程式說明；104914到105096相差182 ms | 五次按下／放開，追蹤輸入判定、stable及輸出命令 | 第10.10節；Serial不是電表，也不是精確手指接觸計時 |
| W2-10：按鈕去抖是術語嗎？怎麼產生？ | 第10.1～10.3節官方來源、機械反彈類比、raw/stable與決策圖 | 先讀示範1000／1003／1008／1038，再做紙上追蹤 | 去抖處理彈跳，不改造機械接點；官方接線不直接搬到ESP32 |
| W2-11：從哪個時間算30 ms？ | 第10.4題與10.7答案、時間軸 | 填5000～5020事件表，解釋5049／5050／5051 | 最早5050、5個raw邊緣、1次接受；輪詢較晚可延後 |
| W2-12：raw_edge是不是按的次數？ | 第10.5診斷程式、10.8六行模擬log與逐行解釋 | 單次觀察後Reset，再5慢＋5快，保存完整log | raw與accepted分開；沒有反彈也如實記錄；SIM不是實測 |
| W2-13：0／10／30／100 ms怎麼比較？ | 第10.6題與10.9條件預測、同一輸入比較圖／表 | 每輪只改時間，沿用30 ms資料，分段記錄與逐次核對 | 總數10不能排除多算漏算抵銷；短按／短放開可被過濾；沒有唯一最佳值 |

審查包含25個cell的正文、英文概述、完整程式、表格、照片圖說、練習、答案與完成
檢核。答案與原始觀察分開，不把參考數字填進學生空表。

## 主要修正

1. 補齊初學者缺少的操作原因、預期畫面及反例，不只新增名詞定義。
2. 將電表完整說明移到首次使用前；空麵包板導通與插入按鈕後的跨槽導通分開。
3. 刪除後段重複的電表／麵包板整套實驗及重複接線總表，保留唯一完整版本。
4. 基礎按鈕程式新增啟動時放開檢查，不在按鈕已按住時仍印出released；
   未公布GPIO profile仍用`-1`且阻止啟動。不修改候選板卡的實測紀錄。
5. 三個notebook程式cell與examples原始檔一致；新增Serial與基礎按鈕可重用來源。
6. 按鈕去抖的答案逐題說明raw、stable、重新計時、計數與選擇限制；附同一輸入
   的模擬結果，避免把不同真人操作的差異全歸因於去抖數字。
7. 記錄從boot到最後放開至少1秒，保留最後raw與最後stable不同列的情況；
   所有失敗、缺失與未觀察到的現象不靠理想答案補寫。
8. 區分官方5V下拉／按下HIGH／切換LED／`>50`與本課3.3V上拉／按下LOW／
   跟隨輸出／`>=30`；不是照搬官方接線或宣稱每個細節相同。

## 圖片與維護來源

保留原有五張實拍或既有實拍標註附件，不重新生成它們的零件或文字。
新增八張原創概念圖，SVG／PNG與notebook PNG附件由
[build_week2_figures.cjs](../../scripts/build_week2_figures.cjs)產生：

- [程式編譯、Upload與Serial方向](../images/wiring/week2-program-journey.png)
- [Flash、RAM百分比的分母](../images/wiring/week2-memory-budget.png)
- [內部上拉、按鈕與GND路徑](../images/wiring/week2-pullup-loop.png)
- [麵包板節點與四條線的工作](../images/wiring/week2-breadboard-nodes.png)
- [通斷、200Ω及其他200量程](../images/wiring/week2-meter-reading.png)
- [去抖判斷流程](../images/wiring/week2-debounce-decision.png)
- [最後一次改變到5050 ms的時間軸](../images/wiring/week2-debounce-timeline.png)
- [相同raw在四種等待時間下的結果](../images/wiring/week2-debounce-comparison.png)

圖為功能、節點或時間邏輯示意，不是示波器波形、額外實拍或精確PCB內部構造。
舊外部SVG附件從notebook移除，避免與新的接線圖並列混淆；沒有刪除repository
中的歷史圖件。十三張現用圖片均內嵌，無需依賴GitHub相對圖片路徑轉換。

## 官方來源查核

- [Espressif安裝說明](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html)：
  穩定版package索引、Preferences與Boards Manager流程。
- [Arduino官方Debounce原始碼](https://github.com/arduino/arduino-examples/blob/main/examples/02.Digital/Debounce/Debounce.ino)：
  完整閱讀接線註解、變數、兩層條件、50 ms、LED切換；官方例程標示public domain。
- [Espressif GPIO API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html)：
  INPUT_PULLUP、內部上拉與讀取；45 kΩ只作近似計算，非本顆晶片實測。
- [Espressif Tools Menu](https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html)：
  Board、Flash、PSRAM與分割設定的區別。
- [Fluke通斷量測說明](https://www.fluke.com/en-us/learn/blog/digital-multimeters/how-to-test-for-continuity)：
  斷電與導通檢查的通用原則，不能據此指定A830L蜂鳴門檻或證明安全等級。

exact board、候選GPIO、5Vin的IN-OUT限制與既有實測，仍以
[hardware_state.md](../hardware/hardware_state.md)及其指定來源／紀錄為準。

## 150分鐘工作量估算

這是維護端備課估算，不是全班試教實測，也不放進主教材作逐分鐘課表。
詳細解答供核對或課後接續閱讀，不要求課堂逐字朗讀全冊。

| 共同活動 | 估算分鐘 |
|---|---:|
| 板卡、GPIO、供電、上拉與安全概念 | 30 |
| IDE與Serial版本流程 | 25 |
| 電表、空板、按鈕及斷電查線 | 35 |
| GPIO按鈕程式、五次操作與log判讀 | 20 |
| 單一去抖Discussion：預測、觀察與比較 | 30 |
| 證據整理、斷電收納 | 10 |
| 合計 | 150 |

前提是下載網路可用、指定軟體版本與profile已備妥。第一次安裝、單人雙手操作或
接觸不穩可能超出估算；沒有理由為湊時間省略解釋或安全檢查。需以試教實際耗時
再評估課堂節奏，不另加未明示的必做進度。

## 實際驗證範圍

- 文件與三個程式cell逐項對照；不把程式命令當作電壓或實體動作證據。
- `verify_course_materials.py`：通過79份Markdown／notebook的適用結構、連結、表格、錨點及code fence檢查。
- `build_week2_figures.cjs --check`：八組圖的來源／SVG／PNG／附件一致。
- `verify_week2_notebook.cjs`：三支程式一致、`-1`保護、十三張附件、教學順序、
  計算與節點關係，並檢查JavaScript去抖模型。
- 模型檢查：0／10／30／100 ms各次接受時間，長按不重複，短放開被合併，
  輪詢間未看見的短脈衝，`>=`門檻遇到新raw的先後順序，以及32位無號回繞。
  模型不是Arduino執行，也不能證明實體按鈕的反彈時間。
- `verify_week2_notebook.cjs --render`：本機Edge預覽，十三張圖片解碼；
  1280與420 px沒有整頁橫向溢出，寬表格／程式可內部捲動；SVG文字邊界檢查。
  八張圖及答案預覽人工看圖，修正時間標籤相撞、電線交叉與板內功能範圍標示。
- `nbformat 5.10.4`：notebook 4.5 schema驗證通過。原環境未提供nbformat，
  依賴僅安裝在Git忽略的`_outputs/week2_nbformat_deps/`，未修改全域Python環境。
- 與起點commit逐一比較，五張原有JPEG附件bytes不變；`git diff --check`通過，
  並檢閱實際文字、程式與新增圖件差異。

### Arduino編譯

Windows，Arduino CLI 1.5.1，Espressif Arduino core 3.3.11。
FQBN：`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`。

| Sketch | 編譯結果 | 程式bytes／本次上限 | 靜態RAM bytes／本次上限 |
|---|---|---|---|
| week02_serial_basics | 通過 | 278,843／1,310,720 | 22,068／327,680 |
| week02_button_input | 通過 | 304,448／1,310,720 | 22,592／327,680 |
| week02_button_debounce_lab | 通過 | 304,664／1,310,720 | 22,600／327,680 |
| week02_board_check | 通過 | 279,475／1,310,720 | 22,076／327,680 |

已讀取實際編譯摘要與成功狀態。公開GPIO值仍為`-1`；編譯器可能消除未到達分支，
編譯通過不等於GPIO已在目標板運作。此環境分割區與教材歷史案例不同，沒有為了
百分比相同更改partition，也不覆寫使用者既有的容量摘要。

## 尚未驗證與已知限制

- 本次沒有Upload、開啟COM8、執行Arduino韌體、target test或新增實機操作。
- 啟動放開防護與四種去抖值的實體反應仍待指定板卡、按鈕與實際接線驗證。
  GPIO4／5候選紀錄不等於全班profile已核准，不代教師解鎖公開例程。
- A830L確切版本的完整原廠手冊未取得；不指定未知蜂鳴閾值，不由藍黑顏色
  或單一數字推定功能，不宣稱不蜂鳴就是沒有所有短路或漏接。
- 本機HTML載入成功不等於GitHub線上notebook渲染已驗證；本次維持PNG／JPEG
  標準附件，讓圖片與notebook一起保存。
- 使用者核准答案與教材同冊；未另產生無答案學生版或加入考試解答、批改註記。
- 既有跨課文件的165／150分鐘及舊評量週次遺留衝突，已記於
  [Week 3審查紀錄](2026-09-05-week3-material-review.md)，本次未擴張重寫其他週。

本週在本次文件、圖件、模型與編譯的可驗證範圍內補強完成；不代表未做的實機
驗證通過，也不代表全課文件已不存在其他遺留問題。

## 2026-09-07：閱讀順序與文字整理

本輪起點為`180e875`，依教師核准的五項建議，只整理Week 2與其驗證腳本。
前文是2026-09-05的歷史紀錄；其中150分鐘估算不作現行教材刪減基準。
本輪仍是同一本完整備課版，不新增採購、必做實驗或其他週的修改。

| 原閱讀障礙 | 本輪處理 | 保留的學習與回饋 |
|---|---|---|
| 總覽密集列出中英名詞 | 縮短五項目標與教學內容 | 辨認、上傳、量測、按鈕與去抖五項能力仍由既有步驟與檢核對應 |
| 還沒完成USB操作就進入CPU／PSRAM細節 | board-check欄位表移至第十三節，新增章內連結 | 原數字、解釋、限制與完整程式連結保留，不增加查詢實驗 |
| 電表段落混入歷史對話 | 改為「只有數字，為什麼不能判讀？」正式假設例子 | 檔位、測點、完整畫面、小數點與單位缺一不可；跳動先安全查接觸 |
| 接線表與勾選清單順序不同 | 統一為GND→a22、輸入→a27、輸出→a20、b22→a29 | 四條線、接頭、座標、共地原因與斷電檢查未變 |
| 示範板已有證據與全班profile混在一起 | 第九節區分BOARD-T01 GPIO4事件、GPIO5穩態電壓與其他板待核對 | 依既有hardware_state；公開程式保持-1，沒有發布全班GPIO答案 |

維護來源：文字直接維護於`week2_main.ipynb`；程式與圖件本輪不改。
`verify_week2_notebook.cjs`新增段落位置、四條線順序及驗證範圍的回歸檢查，
並增加修改區塊的預覽截圖。電表歷史紀錄原檔未改，教學假設不冒充新實測。

本輪實際檢查：

- 與起點逐cell比對：三個程式cell、器材、安全章節、Discussion題目與完整解答不變；
  所有圖片附件bytes及23處圖片引用不變，其他週教材無差異。
- `verify_week2_notebook.cjs --render`：程式副本、預留GPIO保護、23張圖解碼、
  去抖JavaScript模型、1280／420 px頁面寬度與SVG文字邊界通過。
  人工檢視總覽、電表例子、接線表與勾選清單、GPIO證據表及補充參數表。
  搬動後的「下節」與圖示位置指引已改為明確章內連結並重跑預覽。
- `verify_intro_navigation.cjs`：61個明確章內導覽連結、唯一錨點與先備順序通過。
- `verify_course_materials.py`：86份Markdown／notebook的結構與本機連結通過。
- `build_week2_figures.cjs --check`：八組SVG／PNG／附件一致；
  `hardware_galleries.cjs --check`：11週圖集與41個原圖來源雜湊通過。
- `verify_week2_notebook.cjs --compile`：四支原有Arduino範例重新編譯通過，
  FQBN與前述相同，程式／RAM bytes與前次表格相同；未改韌體或Upload。
- `git diff --check`通過，檢閱文字及驗證腳本差異。

限制：本輪沒有新增實機、Serial工作階段、初學者試讀或GitHub線上渲染驗證；
本機預覽與模型不能替代上述證據。教師仍須核對學生板卡的適用profile。
