# 2026-09-14 Week 1～7漸進實作修訂

本紀錄供教師與維護者使用，不是新增學生必讀講義或實機通過紀錄。

- 起始版本：`859d8c01a05b88e3e179eab430b4509a8069bf2f`，main工作樹乾淨。
- 使用者核准：依先看到成果、逐項接入、再深入理解的方向修改Week 1～7。
- 維持：18週主題、日期、評量、每組材料數量與NT$928已計價參考小計、單本入口、完整備課版解答。
- 不做：新採購、全班GPIO核准、實機上傳、舵機帶負載試驗。完成本機修訂後，使用者另行授權commit與push。
- 參考[Arduino入門播放清單](https://www.youtube.com/playlist?list=PL_i0cTCK_y-jt4XMh5_gaPrDcbbzyXmGR)的公開標題、描述及可取得章節資訊；未逐部完整觀看影音或取得完整字幕。不把本次教學建議宣稱為整套影片的完整摘要，也不移植Arduino板的5 V接線。

## 教學對照與保留範圍

以下對照本次改動涉及的學習能力；未列出的既有目標、練習、Discussion與完成條件保留。
順序調整不減少安全前提，不把計算、比較與故障排查全部刪掉。

| 週／能力 | 講解與例子 | 學生操作 | 預期結果及完成條件 | 回饋方式 |
|---|---|---|---|---|
| 1：區分輸入、規則、輸出 | 先呈現共同遊戲功能圖，再讀課程目標與網路例子 | 沿圖指出接收動作與回饋的零件；不接電 | 能說明各零件用途，再查每組採購表 | 比對現有功能圖；不新增表單或評量 |
| 2：Serial是程式留下的紀錄 | Upload與第一行輸出；容量推導移到附錄 | 上傳、讀uptime、改版本再上傳 | 有新版本開場與遞增時間；不把Verify當成上傳 | 原有Serial檢核與排錯 |
| 2：原始快照不等於事件 | 同一支button_input的OBSERVE_RAW_ONLY模式 | true觀察放開／按住／放開，false重傳後做既有五次測試 | 原始模式多行LOW，接受模式一次變化一筆；測試輸出在原始模式維持LOW | 同一接線兩種log對照；100 ms快照不能證明沒有彈跳 |
| 2：電學推理 | 保留1 kΩ／3 V、10 kΩ與上拉完整計算，移到操作後附錄 | 解釋已看到的HIGH／LOW與回路 | 計算有量與單位，區分命令及實測 | 原有完整解答及去抖0／10／30／100 ms比較 |
| 3：S電壓與分壓 | 先辨認電路與供電，再量S；完整三例計算接在觀察後 | 同一位置一般光、遮光、回復，記測點與V | 以自己的三筆紀錄說明方向，再用模型解釋 | 原有量測案例保留性質；不要求與例子同值 |
| 3：ADC與分類 | 先raw反應，容量百分比解析移附錄；分類仍用既有來源 | 原有兩組各10筆與獨立分類驗證，符合條件的紀錄不重收 | raw、標籤與品質可區分；1 kΩ／10 kΩ交換分壓仍必做 | 原有Discussion、實作與解答不刪除 |
| 4：電阻、DHT與品質 | 220／330 Ω後先DHT三線、單位、缺值，再KY事件 | 原有量程比較、DHT真實／注入／恢復 | 各保留真實或示例標示，無缺值冒充0 | 原有七題連續Discussion |
| 4：雙來源獨立取樣 | LESSON_STAGE=1，KY只有基本raw範圍檢查 | 只接兩個核准感測器，看sample、age | 至少各兩筆新採樣；KY UNKNOWN且事件0；不操作蜂鳴器 | 找出重印快照與新採樣的差異 |
| 4：事件與聲音分開 | stage2套用原基準，stage3才加入聲音 | 解除、遮住、保持、解除；再加已核准蜂鳴器 | stage2事件一次且disabled；stage3一事件一短聲、q/u不補播 | GPIO/PWM零操作host測試與實物觀察分列 |
| 5：三色、固定畫面、倒數 | 沿用原LESSON_STAGE=1／2／3，不複製多支程式 | RGB處直接測o/r/g/b/o；固定OLED處測4/3；最後整合s/x/z | 先三色正確，再固定畫面，最後時間差倒數 | 原有各階段排錯、時間與光學干擾練習 |
| 6：命令與實際位置 | 控制脈波先解釋；七格映射移到裝指針時 | 核准供電後先無指針小動作、停止，再裝短指針與OLED | 無負載動作與停止有實物證據後才增負載；數字不冒充角度量測 | 原STOP／timeout／上電順序與供電紀錄保留 |
| 7：一局規則與整合 | 同一完整遊戲分Start時間、單次事件、紅扣分與Finish觀察 | 先低功率一局覆蓋多個目的，再加入已核准機械／聲音 | 規則不改；已有log可覆蓋的項目不重測，原三局及邊界矩陣保留 | reason、count、實物輸出相互核對；不要求手做毫秒級同輪事件 |

## 教師先備與學生當堂檢查

教師先完成同批板卡／模組的腳位、供電、邏輯準位、電流、初始化及停止驗證，再公布profile。
學生核對自己的實物是否相同、逐線追蹤、依本週方法量測並保存結果。
遇不同版本或缺少核准項目，保持斷電回報，不要求初學者自己猜額定值或任意把旗標改true。
局部已驗證的部分可繼續學習：例如DHT與KY已核准、蜂鳴器未核准時，完成雙來源階段而不接聲音模組。
這不等於宣告目前DHT或任何全班profile已核准；狀態仍查[硬體紀錄](../hardware/hardware_state.md)。

## 維護來源、程式與圖解

- Week 1直接維護MD；Week 2／3原有內容直接維護Notebook並同步canonical程式。
- Week 4～7修改`docs/course_materials/weekN_main.source.md`後以原builder生成Notebook。
- 圖片保留原始照片及生成圖，不增加猜測接線圖。Week 2記憶體與上拉圖、Week 3記憶體及分壓比較圖、Week 6七格映射圖隨相關概念移位。
- 圖的角色依序是作品功能、當前操作／接線、現象背後原理；功能圖不能當作已組裝實機照。
- Week 2按鈕模式與Week 4三階段由同一完整程式選擇；預設GPIO和核准閘門仍阻擋。
- GPIO輸入模式參考[Espressif GPIO API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html)；既有聲音API核對[Espressif LEDC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html)。實際編譯版本另記，不把latest文件當作確切模組額定值。

## 驗證記錄

本輪實際執行的結果如下。所有log、測試fixture與本機預覽留在忽略的`_outputs/`，
未把測試用GPIO或人工感測資料寫回學生profile。

| 層次 | 執行內容與結果 |
|---|---|
| 文件與連結 | `verify_course_materials.py`：91份Markdown／Notebook結構與本機連結通過；Week 2～7各自Notebook verifier通過，程式副本與來源一致 |
| 採購與導覽 | `verify_intro_navigation.cjs --render`：65條明確導覽連結、Week 1的29個錨點點擊、37張圖片；11類基本材料709元＋供電60元＋電表159元＝每組928元及合購計算通過 |
| 圖片與生成 | Week 2／3圖解、Week 3分類器、Week 4材料、Week 5～7材料builder的`--check`通過；11週器材圖集與44筆圖片來源雜湊通過，其中40張實物照片均已登錄；原照片內容未改 |
| 本機呈現 | Week 1～7均以Edge無頭瀏覽器檢查桌面與420px窄版；圖片解碼、頁面寬度、圖中SVG文字邊界通過。Week 2桌面1280px，其餘1200px；寬表及程式可水平捲動 |
| 人工視覺檢閱 | 已檢視Week 1功能圖、Week 2原始按鈕步驟、Week 3電表測點表、Week 4雙讀值步驟、Week 5三色步驟與OLED功能圖、Week 6無指針步驟及七格映射圖、Week 7分段觀察表。這是本機預覽，不宣稱已檢驗即時GitHub呈現 |
| 邏輯模型 | Week 2 JS去抖模型的0／10／30／100 ms、持續按住、漏採短脈波、邊界及32位元回繞通過；Week 3分壓計算與麵包板節點模型通過。不是電子電路模擬或實機證據 |
| Host test | 最終`verify_week4_host.py`預設96項、`--tone`102項斷言通過，涵蓋新增Week 2模式及Week 4雙感測階段；Week 5為45項、Week 6為40項、Week 7預設92項／tone 99項，兩種OLED建構子配置均通過 |
| Arduino編譯 | Week 2的serial_basics、button_input、button_debounce_lab、board_check四份通過；`verify_hardware_profiles.py`另外17個ESP32-S3配置全部通過，含Week 4～7公開阻擋版、測試啟用版、Week 4階段1／2及Week 2原始觀察模式，共21次成功編譯 |
| 差異檢閱 | 已檢閱教材、canonical程式、測試及設計文件差異，`git diff --check`通過；Week 8～18及正式課綱、配分未修改。PROJECT／AGENTS／CLAUDE仍由Git忽略 |
| Target／實機 | 未Upload、未開序列埠、未驅動舵機；未進行target test、實體量測或電路模擬 |

編譯使用`esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`、ESP32 core 3.3.11、
U8g2 2.36.15、ESP32Servo 3.2.1、DHT sensor library 1.4.7、Adafruit Unified Sensor 1.1.15。
詳細命令見[腳本說明](../../scripts/README.md)。

發現並修正的檢查問題：器材圖集verifier原先把Windows的CRLF與LF視為內容不一致；
現在僅在文字比較正規化換行，圖片位元組與雜湊仍嚴格核對，修正後重跑通過。
操作順序回歸檢查已更新為本次核准順序，保留既有接線、計算、答案與安全閘門斷言。

## 實機待確認

未進行target test或實機測試。新按鈕原始模式、雙感測器三階段、RGB／OLED整合、SG90受限動作、
帶負載供電、實際聲長、STOP／timeout最長延遲與全作品光學干擾均須以指定實物另驗。
既有「有聲音」「三色正確」「OLED顯示」及空載電壓紀錄維持原限制，不升級為完整遊戲通過。
