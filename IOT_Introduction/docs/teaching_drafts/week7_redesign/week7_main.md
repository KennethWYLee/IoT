<!-- page: start | 今天的作品 -->
## 把前幾週組成一個遊戲

> 綠燈遮光加一次，紅燈遮光扣一次。30 秒內累積到 6，還要按結束才過關。

{{diagram:game}}

先用按鈕、光敏、RGB 與 OLED 玩完一局，再加入已確認的紙指針與失敗短聲。今天不新增零件，也不接網路。

### 做完要能說明三件事

- 為什麼遮住不放，不會一直加分？
- 螢幕、燈色、指針與紀錄，是否使用同一份結果？
- 玩家失敗和裝置故障，為什麼要分開？

<aside>燈色決定加減分；OLED 顯示目前結果；Serial 保存這一局的事件與原因。三者要能對上同一次操作。</aside>


<!-- page: files | 先把程式準備在電腦裡 -->
## 不用從 PDF 一頁一頁抄程式

1. 已有教師提供的完整 IoT 資料夾，就直接使用同版本資料夾，不重新下載另一版。
2. 沒有資料夾時，開啟 [課程 GitHub](https://github.com/KennethWYLee/IoT)，按 **Code → Download ZIP**。下載完成後在檔案總管右鍵 ZIP，選「全部解壓縮」。
3. 打開解壓縮後的資料夾，再開 **IOT_Introduction**。不要直接在 ZIP 預覽視窗操作。
4. 依下表找到當段程式；在 Arduino IDE 選「檔案 → 開啟」，選該資料夾中的同名 **.ino**。瀏覽器裡看到程式文字，不等於已在 IDE 開啟。
5. 修改前選「檔案 → 另存新檔」，存進自己的練習資料夾。按 **Ctrl+F** 搜尋講義指定的設定名稱，改等號右邊的值，保留分號，再按 **Ctrl+S**。

### 本週依序開這些檔案

以下從 IOT_Introduction 資料夾開始找；每次只開當段要用的檔案。

- `examples/week07_traffic_light_challenge/week07_traffic_light_challenge.ino`

換另一支程式時，原來修改的設定**不會自動帶過去**。依該段設定表逐項填寫；不把短片段當成完整程式。

<aside>若下載內容和講義列出的檔名不一致，先取得相符的課程資料夾，不猜替代檔。開啟檔案時，ESP32 的 USB 與外部電源保持拔除。</aside>


<!-- page: rules | 先用手勢演一次 -->
## 還沒接線，也能先懂規則

一位同學說燈色，一位同學用手表示遮光，第三位記錄分數。不插電，先演下面四步。

| 起始 count＝0 | 動作 | 結果 |
|---|---|---|
| 綠燈 | 從未遮變成遮住 | 變 1 |
| 綠燈 | 持續遮住 | 還是 1 |
| 任一燈色 | 移開遮光物 | 還是 1，準備下一次 |
| 紅燈 | 再次遮住 | 回 0 |

最低 0、最高 6。到 6 不會自動贏：必須在 30 秒期限前按 **Finish 結束鍵**。當下不到 6，或到期還沒結束，都失敗。

先問自己：六次手勢是不是一定等於六次有效得分？不是，紅燈會扣分，遮住不放也不會重複算。

兩鍵同時按住或 Serial 送 `x` 是中止，不是玩家輸。裝置異常先停止處理，不要求玩家繼續玩。


<!-- page: route | 器材與操作條件 -->
## 先完成不含舵機的一局

| 操作 | 需要的器材或條件 | 預期結果 |
|---|---|---|
| 一局遊戲 | 按鈕、KY、RGB、OLED 已確認接法 | 開始、遮光計分、結束 |
| 中止與復原 | 本局紀錄、Serial 命令 | 留下中止原因，復原後回待機 |
| 指針與短聲 | 舵機供電及蜂鳴器介面另外確認 | 勝負規則不變，各輸出一致 |
| 改變切色間隔 | 只接低功率元件，保持同一布局 | 只比較時間參數，不混入機械變因 |

### 先準備什麼？

Week 2 雙按鈕、Week 3 同配置光線基準、Week 5 RGB／OLED 的設定。完整版本另外需要 Week 4 的蜂鳴器及 Week 6 的舵機供電驗證。

<aside class="safety">前週講義完成，不代表實物已驗證。SG90 及帶載電源未通過時，舵機與蜂鳴器先不接，只完成低功率版本。低功率模組本身也必須符合已確認的接法。</aside>


<!-- page: roles | 先分配每個零件的工作 -->
## 同一條 GPIO 不兼兩份工作

| 功能 | T01 既有配置，限相符器材 | 完整程式欄位 |
|---|---|---|
| 讀光線 | KY S：GPIO4 | `PIN_LIGHT = 4` |
| 開始／結束 | GPIO5／6 | `PIN_START = 5`、`PIN_FINISH = 6` |
| RGB 紅／綠／藍 | GPIO15／16／17 | `PIN_RGB_R = 15`、`PIN_RGB_G = 16`、`PIN_RGB_B = 17` |
| OLED 資料／時脈 | GPIO8／9 | `PIN_SDA = 8`、`PIN_SCL = 9` |
| 指針、聲音（最後才接） | 初次不接 | `PIN_SERVO`、`PIN_BUZZER` 先保留 −1 |

低功率版使用 **8 個不同的訊號 GPIO**；完整版本再加 2 個。3V3、GND 不是這裡的訊號 GPIO 數量。

Week 2 的 GPIO4 曾接按鈕，後來已用來讀 KY；Week 6 的 STOP 按鈕也不能原封不動當本週兩鍵接線。**功能改了，程式與線也要一起核對。**

本週不接 DHT11。表內是已記錄功能觀察，不是所有同名模組的安全保證；教師課前仍須確認本批 RGB 限流、OLED 邏輯相容性。器材不同就用對應表，不能只因想消除 blocked 而套值。


<!-- page: settings | 填設定，不重做整套辨識 -->
## 先選不含舵機的版本

開啟第 {{page:gamecode}} 頁的 `week07_traffic_light_challenge.ino`，先看檔案頂端。

| 設定 | 本次要填什麼 |
|---|---|
| LESSON_STAGE | **1**：只用已確認的低功率元件 |
| LOW_POWER_PROFILE_CONFIRMED | 所用接法、模組、電流及GPIO均確認後才 true |
| 光敏、兩鍵、RGB、OLED 腳位 | 逐項填上一頁八個完整欄名，不把 GPIO 與麵包板列號混用 |
| RGB_ON_LEVEL | Week 5 已確認的 HIGH 或 LOW |
| `INDOOR_MIN`、`INDOOR_MAX` | 本次未遮光最小與最大 raw，不能用示例代替 |
| `SHADE_MIN`、`SHADE_MAX` | 同輪遮光最小與最大 raw |
| `OLED_ADDRESS_7BIT`、`OLED_CONTROLLER` | T01 為 0x3C、1315；後者搜尋 `#define OLED_CONTROLLER` 修改 |
| `DEVICE_ID` | 例如 `"group01"`，保留雙引號 |

舵機與蜂鳴器相關欄位保持 `false`／`-1`，實物也不接。公開原始碼預設 `LESSON_STAGE=0`，會阻擋操作；不是下載後就能直接動。

若只看到 `profile_missing`，先找缺少或衝突的欄位，不把所有 false 改成 true。軟體檢查不能替代電氣確認。


<!-- page: prepareupload | 先上傳，再接線 -->
## 現在只接開發板的 USB

1. 先關外部電源、取出至少一顆電池、拔 USB。收起舵機與蜂鳴器，移除開發板上所有杜邦線。
2. 依檔案頁開啟 `week07_traffic_light_challenge.ino`，依前頁填本次設定。未有可用光線基準時，先回 Week 3 的 raw 範例取得同輪基準，不亂填數字。
3. 程式庫管理員安裝 **U8g2 2.36.15、ESP32Servo 3.2.1**，即使 Stage 1 也需要兩者。沿用 Arduino-ESP32 3.3.11。
4. **重新插入板背 COM 的 USB**。選 Week 2 已成功的板型與這次 Port，按 Verify，再按 Upload。
5. 上傳完成，關閉 Monitor、拔 USB，PWR 熄滅後才照接下來的四頁接線。不要先接完再全拆上傳。

先在自己的紀錄留下八個 GPIO、OLED 配置與四個光線範圍。後面若換到另一支程式或另一批器材，這些值不會自動轉移。


<!-- page: rails | 斷電後先整理兩條供電線 -->
## 3V3 和 GND 分在不同孔組

USB 拔除，外部電池 OFF 並取出至少一顆。先收起舵機及蜂鳴器，板子放麵包板旁，避免擋住孔。

{{diagram:rails}}

| 接線 | 目的 |
|---|---|
| ESP32 3V3 → a6 | 提供低功率模組電源 |
| ESP32 GND → a3 | 提供共同參考與返回路徑 |
| OLED VDD → b6、GND → b3 | 沿用 Week 5 相容模組 |
| KY 中間供電腳 → c6、− → c3 | 沿用已核對的 KY 版本 |

同側 a～e 的同一列相通；第 3 與第 6 列不相通，a15 與 f15 也不是同一組。先用斷電通斷檔核對自己的板。

這是本頁的接線示例，不和既有作品不同版本的孔號混用。沒有蜂鳴只代表該次通斷觀察，不能證明極性或電流能力全部正確。


<!-- page: buttons | 接第一個輸入 -->
## 兩顆按鈕，兩條輸入線

{{diagram:buttons}}

| 線 | 來源 → 目的 |
|---|---|
| 開始訊號 | GPIO5 → a27 |
| 結束訊號 | GPIO6 → a21 |
| 第一條回地線 | a29 → d3，與 a3 的板 GND 同組 |
| 第二條回地線 | b29 → a23，讓結束鍵也回到 GND |

開始鍵四腳插 **e27、f27、e29、f29**；結束鍵插 **e21、f21、e23、f23**，沿用 Week 2 跨溝槽方向。斷電量 b27 對 c29、b21 對 b23，應各為放開不通、按下才通。本頁用麵包板分接地線，不另買或猜一個「共地端子」。

程式用 `INPUT_PULLUP`，所以放開 HIGH、按住 LOW。按下的電流路徑是內部 3.3 V → 上拉電阻 → 輸入節點 → 按鈕 → GND，不是電源正極直接短接地。

兩鍵同時按住是軟體中止；不是具有電源隔離的急停。


<!-- page: light | 接第二個輸入 -->
## 光敏的位置也是設定的一部分

{{photo:KY018_2.jpg|52|課程既有 KY 實物照片。使用已核對的 S、供電與 − 功能，不憑三針外觀猜腳位。}}

1. 保持斷電，KY 的 S → a15，再由 c15 → 設定表的 ADC GPIO。
2. 確認供電與地已按上一頁接好，e15 可保留作量測點。
3. 固定光敏的位置、方向與遮光物。不要把 RGB 或紙指針放在感光面旁。
4. 沿用**同一接法、同一場景**的「未遮／遮住」兩組 min、max。

若移了位置，或資料來自不同接法，就先回 Week 3 重新取得對應基準，不把不同日期的數字湊成一組。

T01 後來曾觀察到「遮光較小」，和早期方向不同。本程式支援兩種方向，但不能直接套早期門檻。raw 也不是 lux。


<!-- page: rgb | 接第一個輸出 -->
## RGB 告訴玩家現在能不能遮

{{photo:RGB_HW479_3.jpg|52|課程既有 HW-479 接點照片；依 Week 5 已確認的共同端、限流與有效準位使用。}}

| RGB 功能 | 接法 |
|---|---|
| R | 核准的 PIN_RGB_R |
| G | 核准的 PIN_RGB_G |
| B | 核准的 PIN_RGB_B |
| 共用腳 | 相符 HW-479 的 − → **e3**；a3 板 GND、b3 OLED、c3 KY、d3 按鈕已各佔一孔 |

本遊戲只亮紅或綠，B 仍由程式設定為關。三路各自需要限流；不可拿 WS2812 燈條當作同一模組。

先前個別三色有反應，可以引用該次紀錄；整合後仍需確認 OLED 說綠時，真正亮的是綠。若不一致，先中止，不把玩家依錯燈操作算成玩家失誤。


<!-- page: oled | 接第二個輸出 -->
## OLED 不只顯示分數

{{diagram:screen}}

1. 斷電時把 SDA → 已確認的 PIN_SDA。
2. SCK／SCL → 已確認的 PIN_SCL，不與 SDA 對調。
3. 核對前面已接的 VDD／GND，不接外部舵機電源正極。
4. 程式沿用 Week 5 的位址與控制器設定；0x3C 不代表一定是哪一款晶片。

畫面依序讓你看：**狀態、剩餘秒數與 count、目前規則、輸出版本**。

看到 `STAGE1: NO SERVO/BEEP`，意思是本版本刻意不控制舵機與蜂鳴器。它沒有聲音並不是接壞了。

<aside>圖為版面示意。實際程式的兩個控制器選項是 1306／1315；只能套用先前已確認的 128×64 I2C 配置。</aside>


<!-- page: upload | 上傳與第一個畫面 -->
## 先看到 IDLE，再開始玩

1. 本週程式已先上傳；現在不需要再拆線重傳。外部電池保持分離，舵機與蜂鳴器未接。
2. 逐條核對剛接好的線：電源正負分列，八個訊號 GPIO 不重複，每孔一個接頭。
3. 接 COM 的 USB，開 Serial Monitor，選 **115200**。光敏保持未遮，兩鍵都放開。

預期 OLED 為 IDLE、TIME 30 s、0/6，RGB 關。Serial snapshot 應有 INDOOR、settled=true，表示目前分類穩定。

`IDLE` 就是待機；`RUNNING` 才是這一局正在進行。上傳完成只是程式寫入，不代表遊戲接線通過。

沒有畫面或仍 blocked，先查設定與錯誤紀錄，不開始接舵機。

**重新開局：**每局結束後，兩鍵放開、手移開光敏，在 Monitor 上方輸入框打 `z`，按 Enter。看到 IDLE、count=0 才按 Start。若是 ABORTED，先排除 reason 指出的原因，送 c，再送 z。


<!-- page: firstgame | 第一局只看開始與時間 -->
## 按開始，再把手放開

先預測：按下 Start 後，是分數先加一，還是倒數先開始？

1. 保持未遮，Finish 已放開；按一下 Start，再放開。
2. 看 OLED：應從 IDLE 變 RUNNING，倒數開始，count 仍 0。
3. 看實物：第一段應綠燈。
4. 看 Serial：應出現 `event_type=start`、`reason=start_accepted`，並有新 `game_id`。

```text
預期欄位（示例，不是實測）
event_type=start state=RUNNING value=0
reason=start_accepted phase=GREEN
```

遊戲進行中再按 Start，不會延長時間或歸零。若開始被拒絕，先看 Finish 是否仍按著、是否未遮且穩定，不一直按到它開始。

低功率版本不需要 `a`。`a` 是完整版本準備舵機的命令，不是開始遊戲的指令。


<!-- page: hold | 第二局只練一次加分 -->
## 綠燈遮住一秒，應加幾次？

上一局到期後，兩鍵放開、手移開、送 z。看到 IDLE 才按 Start，開新的一局；第一段綠燈持續三秒。

1. 先未遮穩定，再遮住約一秒。
2. 看 count：應只加 1，不是每筆讀值都加。
3. 移開遮光物，等未遮穩定；這個動作不加分。
4. 下一個綠燈段，再遮住，才可能再加 1。

{{diagram:edge}}

另開一局，在紅燈做一次新的遮光，應扣 1，但最低 0。若一直遮住，從紅變綠也不自動補加分。到期後兩鍵放開、手移開，用 z 回待機。

手勢太短可能沒被確認；接近換色時，以程式**確認新事件的時刻**判燈色，不是你認為手剛開始移動的時刻。


<!-- page: finish | 第三局只練結束 -->
## 不到 6，也可以按 Finish

送 z 回 IDLE、按 Start。保持未遮光，隨即按 Finish，預期 count=0、結果 FAILED。

| 操作／狀況 | 預期結果 |
|---|---|
| 期限前 Finish，當下不足 6 | FAILED，時間與 count 凍結 |
| 期限前 Finish，當下是 6 | SUCCESS，時間與 count 凍結 |
| 到 30 秒還沒有效 Finish | FAILED，即使 count 是 6 |

結果出現後 RGB 關，低功率版沒有失敗聲。繼續遮光不會修改已結算 count。

### 再玩一局

兩鍵放開、感測資料穩定可用，在 Serial 輸入 **z**。先回 IDLE、count=0，再保持未遮，重新按 Start。

z 不是重新開始：它只讓程式回待機。下次被接受的 Start 才增加 game_id。

用剛才有遮光的第二局找 start、cover、result，保留相同 game_id；第三局沒遮光就沒有 cover，不把不同局拼成同一局。


<!-- page: gamecode | 完整基本程式 -->
{{program:week07_traffic_light_challenge}}

<!-- page: clock | 計時原理 -->
## 螢幕變慢，時間也不應變慢

{{diagram:clock}}

```text
經過時間 = 現在 millis() - 開始時 millis()
剩餘時間 = 30000 - 經過時間（最低 0）
```

`millis()` 是這次開機後的毫秒數。1000 ms＝1 秒，不是日期或臺灣時間；重啟後不能和前一次直接相減。

紅綠燈也看經過時間：0～2999 ms 綠，3000～5999 ms 紅，6000～8999 ms 綠，以此交替。

OLED 約每 200 ms 更新，剩餘 1～1000 ms 都顯示 1 秒。畫面可能是上一幀，**不能用畫面仍有 1 秒推翻程式已到期的判定**。

程式不以 delay 等每一秒，但顯示與 Serial 函式仍可能耗時。這不是所有操作都零延遲。


<!-- page: events | 為什麼一秒遮光不算很多次 -->
## 讀值、分類、事件、count

{{diagram:flow}}

| 名稱 | 你可以怎麼理解 |
|---|---|
| raw | 這次 ADC 讀到的數字，不是得分 |
| INDOOR／SHADE | 已確認的未遮／遮光分類 |
| 新遮光事件 | 從已穩定未遮，變成已穩定遮光 |
| count | 事件配上燈色後得到的有效次數 |

每 50 ms 嘗試取樣，1 秒約有 20 個取樣間隔；不表示人做了 20 次動作。

`armed=true` 是「已準備接受下一次遮光」。遮光計入後改 false，必須穩定未遮才重新準備。開機就一直遮住，不會先白得一次。

不要用 log 行數計分；snapshot 只是狀態快照，不是每一行都代表一次手勢。


<!-- page: thresholds | 分類門檻 -->
## 中間的數字，先不要急著分類

假設同配置基準是未遮 300～320、遮光 900～920。這組是算式示例，不是全班設定。

```text
間隙 = 900 - 320 = 580
下門檻 = 320 + 580 / 3 的整數部分 = 513
上門檻 = 320 + 2 × 580 / 3 的整數部分 = 706
```

{{diagram:thresholds}}

同一候選分類要持續 **150 ms** 才確認。假設每 50 ms 正好取樣一次：0、50、100、150 ms 四筆，才跨滿 150 ms。

中間區會中斷尚未完成的確認，不把幾段零散的遮光時間累加。先前分類可能還顯示在畫面／log，但 `settled=false` 時不能拿它當新事件。

若你的遮光數字較小，程式反轉兩端標籤。0／4095 在本遊戲視為不可用，不等於元件一定壞；合理 raw 也不保證線沒鬆。


<!-- page: flowcase2 | 只改一處，想想結果 -->
## 端點也算成功，分數會誤增嗎？
> 資訊處理示意；僅作圖上推演，保持現有實物接線不動。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 275" role="img" aria-label="端點也算成功，分數會誤增嗎？" style="width:100%;max-height:78mm"><style>text{font-family:'Microsoft JhengHei',sans-serif;fill:#263b40}</style><text x="10" y="28" font-size="19">正常的連接／處理</text><rect x="9" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="79" y="71" font-size="16" text-anchor="middle">raw=0</text><line x1="149" y1="66" x2="172" y2="66" stroke="#246e73" stroke-width="2" /><path d="M167,62 L172,66 L167,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="172" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="242" y="71" font-size="16" text-anchor="middle">有效性檢查</text><line x1="312" y1="66" x2="335" y2="66" stroke="#246e73" stroke-width="2" /><path d="M330,62 L335,66 L330,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="335" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="405" y="71" font-size="16" text-anchor="middle">不接受動作</text><line x1="475" y1="66" x2="498" y2="66" stroke="#246e73" stroke-width="2" /><path d="M493,62 L498,66 L493,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="498" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="568" y="71" font-size="16" text-anchor="middle">計數不變</text><text x="10" y="155" font-size="19">只改標記的地方</text><rect x="9" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="79" y="198" font-size="16" text-anchor="middle">raw=0</text><line x1="149" y1="193" x2="172" y2="193" stroke="#a65136" stroke-width="2" stroke-dasharray="3 4"/><rect x="172" y="170" width="140" height="46" rx="3" fill="#fff1de" stroke="#a65136" stroke-dasharray="5 4"/><text x="242" y="198" font-size="16" text-anchor="middle">略過檢查</text><line x1="312" y1="193" x2="335" y2="193" stroke="#a65136" stroke-width="2" stroke-dasharray="3 4"/><rect x="335" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="405" y="198" font-size="16" text-anchor="middle">按門檻分類</text><line x1="475" y1="193" x2="498" y2="193" stroke="#246e73" stroke-width="2" /><path d="M493,189 L498,193 L493,197" fill="none" stroke="#246e73" stroke-width="2"/><rect x="498" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="568" y="198" font-size="16" text-anchor="middle">可能改分數</text><text x="10" y="261" font-size="16">箭頭表示資訊處理順序，不是供電或電流路徑。</text></svg>

**想一想：** 只拿掉 raw 有效性檢查，留下大小門檻。0 若被分到可計分那一類，分數增加能證明玩家完成動作嗎？

**原理提示：** 不能。端點可能來自故障或錯接；先分類再加分會把不可信輸入當成玩家操作。

只有標記處改變，其餘供電、程式與環境條件沿用正常情境。不可把未知結果直接寫成 0、LOW 或「一定停止」。
<!-- page: priority | 兩件事同時發生時 -->
## 先處理什麼，要寫成規則

{{diagram:priority}}

在同一輪處理中，**先計新遮光，再判 Finish**；但中止或到期優先。

| 假設沒有裝置故障 | 同輪事件 | 結果 |
|---|---|---|
| 經過 12000 ms，原 count=5 | 新遮光＋Finish | 綠，加成 6，成功 |
| 經過 15000 ms，原 count=6 | 新遮光＋Finish | 紅，扣成 5，失敗 |
| 經過 30000 ms，count=6 | Finish | 到期優先，失敗 |

「同輪」是程式一次處理的資料，不是保證兩個硬體訊號在同一微秒到達。這類邊界用程式測試，不要求學生用手精準做出。

完整版本中，同輪第六次加分後立即結算，可能已停止舵機脈波而指針尚未到 6；結果與實際位置仍要分開。


<!-- page: states | 用狀態整理允許的操作 -->
## 待機、進行、結束不能混在一起

{{diagram:states}}

| 畫面文字 | 此時能做什麼 |
|---|---|
| IDLE 待機 | 條件符合才接受新的 Start |
| RUNNING 進行中 | 遮光計分、Finish 結算，Start 不重開 |
| SUCCESS／FAILED | 保存結果；符合條件後 z 回待機 |
| ABORTED 中止 | 排除原因，c 確認，再 z 回待機 |

這叫**狀態機**：把此刻允許的操作寫清楚，避免每個按鈕各自修改同一局。

結果結算後再送 x，只停止輸出，不改寫已完成的 SUCCESS／FAILED。尚未結算時中止，才把這局記成 ABORTED。

按鍵放開不會自動復原。兩鍵一直按住時，也不能用 c、z 或 a 繞過中止條件。


<!-- page: flowcase1 | 只改一處，想想結果 -->
## 送出 x，不是整台斷電
> 兩種情況都保留 USB 供電；只比較送出 x 前後的程式狀態。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 275" role="img" aria-label="送出 x，不是整台斷電" style="width:100%;max-height:78mm"><style>text{font-family:'Microsoft JhengHei',sans-serif;fill:#263b40}</style><text x="10" y="28" font-size="19">正常的連接／處理</text><rect x="9" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="79" y="71" font-size="16" text-anchor="middle">沒有 x 命令</text><line x1="149" y1="66" x2="172" y2="66" stroke="#246e73" stroke-width="2" /><path d="M167,62 L172,66 L167,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="172" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="242" y="71" font-size="16" text-anchor="middle">RUNNING</text><line x1="312" y1="66" x2="335" y2="66" stroke="#246e73" stroke-width="2" /><path d="M330,62 L335,66 L330,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="335" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="405" y="71" font-size="16" text-anchor="middle">更新輸出</text><line x1="475" y1="66" x2="498" y2="66" stroke="#246e73" stroke-width="2" /><path d="M493,62 L498,66 L493,70" fill="none" stroke="#246e73" stroke-width="2"/><rect x="498" y="43" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="568" y="71" font-size="16" text-anchor="middle">RGB／OLED</text><text x="10" y="155" font-size="19">只改標記的地方</text><rect x="9" y="170" width="140" height="46" rx="3" fill="#fff1de" stroke="#a65136" /><text x="79" y="198" font-size="16" text-anchor="middle">送出 x 命令</text><line x1="149" y1="193" x2="172" y2="193" stroke="#246e73" stroke-width="2" /><path d="M167,189 L172,193 L167,197" fill="none" stroke="#246e73" stroke-width="2"/><rect x="172" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="242" y="198" font-size="16" text-anchor="middle">ABORTED</text><line x1="312" y1="193" x2="335" y2="193" stroke="#246e73" stroke-width="2" /><path d="M330,189 L335,193 L330,197" fill="none" stroke="#246e73" stroke-width="2"/><rect x="335" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="405" y="198" font-size="16" text-anchor="middle">更新輸出</text><line x1="475" y1="193" x2="498" y2="193" stroke="#246e73" stroke-width="2" /><path d="M493,189 L498,193 L493,197" fill="none" stroke="#246e73" stroke-width="2"/><rect x="498" y="170" width="140" height="46" rx="3" fill="#edf5f4" stroke="#477b80" /><text x="568" y="198" font-size="16" text-anchor="middle">RGB／OLED</text><text x="10" y="261" font-size="16">箭頭表示資訊處理順序，不是供電或電流路徑。</text></svg>

**想一想：** 只在 Monitor 送出 x，USB 不拔。為什麼 OLED 還能顯示結束結果？PWR 一定會熄滅嗎？

**原理提示：** x 改變遊戲狀態，不切斷 USB 供電；處理器仍能更新顯示與紀錄。

只有標記處改變，其餘供電、程式與環境條件沿用正常情境。不可把未知結果直接寫成 0、LOW 或「一定停止」。

<!-- page: logs | 看紀錄，不只拍成品 -->
## 找到同一局的三種紀錄

先找 `start`、`cover`、`result`，不要一開始就讀完每個欄位。

```text
event_type=cover phase=RED
count_before=5 count_after=4
reason=red_penalty
```

以上是拆行示例；真正程式會在同一行印出更多欄位。

| 欄位 | 用來回答什麼 |
|---|---|
| device_id、boot_id、game_id | 哪個裝置、哪次開機、哪一局？ |
| event_type、reason | 發生什麼，為什麼？ |
| count_before／after | 這次事件到底有沒有改分？ |
| uptime_ms、remaining_ms | 開機後何時、這局還剩多少？ |
| light_raw、settled、armed | 當時感測分類可否支持這個事件？ |

`valid=true` 只是本程式的樣本新鮮與分類條件，不是感測精度保證。`position_measured=false` 表示沒有讀回真實角度。

boot_id 是隨機識別值，不是絕對不重複的保證。本週 log 尚在 Serial，沒有自動存進資料庫；保存時標註裝置及測試日期。


<!-- page: faults | 做一次能恢復的故障示範 -->
## 用命令代替帶電拔線

先在低功率版新開一局，保持所有線固定。下列是**軟體故障注入**，不是所有硬體故障的模型。

1. Serial 送 `f`：之後以 −1 代替光線 raw。
2. 先看到 fault_injection；不是一送 f 就宣告玩家輸。
3. 持續約 2 秒無法穩定分類後，應 ABORTED，原因 light_unavailable；不發玩家失敗聲。
4. 送 `r` 停止注入，未遮並等新樣本穩定。r 不會自己復原遊戲。
5. 兩鍵放開，依序 `c`、`z`：回 IDLE，還沒開始新局。

另做一次「兩鍵同時按住」或 `x` 的人工中止；它不需要等 2 秒。

<aside class="safety">完整版本中止後先把舵機外部 OFF；要改線再拔 USB。不用短接電源、拔 GND 或卡住軸來製造故障。</aside>

樣本超過 200 ms 未更新也會中止。慢 I2C、資料無法分類、鬆線可能不同原因；先看 reason，不全部歸咎玩家。


<!-- page: exercise | 概念練習 -->
## 遮光、換色與結束會得到什麼結果？

下列均假設沒有其他裝置故障；每個遮光事件已穩定確認，紅綠各 3 秒。

1. 五次綠燈新遮光，再一次紅燈新遮光，目前 count 是多少？此時 Finish 能成功嗎？
2. 紅燈新遮光後一直遮到綠燈，會自動加回一分嗎？
3. count 已是 6，但在經過 30000 ms 那輪才 Finish，結果是什麼？
4. raw 在 0 ms 是900、50 ms是900、100 ms是600、150 ms是900、200 ms是900。使用前面513／706門檻，到200 ms有新遮光事件嗎？
5. 看到 ABORTED，是否等於玩家只拿到0分？應先找哪個欄位？

### 回答時指出依據

不要只寫「有問題」或「失敗」。請寫出 count、時間條件、哪個樣本打斷確認，或哪個原因尚待排查。


<!-- page: extra | 最後再加機械與聲音 -->
## 同一個遊戲，不改勝負規則

{{diagram:outputs}}

先外部 OFF、取出至少一顆電池、拔 USB。僅在 Week 6 舵機供電、啟動與小行程，以及 Week 4 蜂鳴器介面已驗證時進行。

| 額外接線 | 來源 → 目的 |
|---|---|
| 舵機正極 | 降壓 VOUT+ → 安全端子 → 舵機 V+ |
| 舵機回流 | 舵機 GND → 負極端子 → VOUT− |
| 共地及訊號 | d29 → 外部負極端子；它經 a29→d3 回板 GND；專用 GPIO → signal |
| HW-508 控制線 | GPIO18 → a10；1 kΩ 接 c10→c12；+ 腳 → e12 |
| HW-508 回地 | − 腳 → c29；中間腳不接。c29 與 a29 同組回地 |

舵機工作電流不走 GPIO、3V3 或麵包板低功率列。外部正極不接 ESP32 5Vin／USB VBUS。端子與線材須固定、絕緣並符合負載需求。

HW-508 限同型且課前已確認介面。c29、d29 是這次新增地線孔；b29 已接到 a23，不能把兩線塞進同孔。舵機轉接線與絕緣端子仍需 Week 6 已確認配件，不能用麵包板代替其工作電流回路。


<!-- page: stage2fields | 完整版需要哪些設定 -->
## 先保留已成功的低功率設定

將低功率版另存一份備份，再修改工作副本。八個 GPIO、光線四個範圍、OLED 與 RGB 設定不變。下列是完整名稱，按 Ctrl+F 找到原來的設定行修改。

| 本週欄位 | 從哪裡取得 |
|---|---|
| `LESSON_STAGE` | 完整版為 2；缺少以下任何條件則維持 1 |
| `PIN_SERVO` | Week 6 已確認的 signal GPIO，與八個低功率腳及蜂鳴器不同 |
| `SERVO_HZ` | Week 6 實物設定表 |
| `SERVO_MIN_US`、`SERVO_MAX_US` | Week 6 已確認脈寬上下限 |
| `SAFE_MIN_ANGLE`、`SAFE_MAX_ANGLE` | Week 6 已確認機構範圍 |
| `ZERO_ANGLE`、`SIX_ANGLE` | Week 6 已確認的第 0／6 格命令 |
| `SERVO_AND_POWER_PROFILE_CONFIRMED` | 上述舵機、供電、接頭與啟動條件皆完成才 true |
| `PIN_BUZZER` | 相符 T01 接法為 18；本週名稱**不是** PIN_BUZZER_CONTROL |
| `BUZZER_USE_TONE`、`BUZZER_SERIES_OHMS` | HW-508 受限波形為 true、1000，且實物確有 1 kΩ |
| `BUZZER_HZ`、`BUZZER_ON_LEVEL` | 波形模式保留 2000；ON_LEVEL 不使用，可維持 −1 |
| `BUZZER_PROFILE_CONFIRMED` | 相符接法、電流與停止條件確認後才 true |

這些值不會從 Week 6 自動匯入。目前舵機資料仍未齊全，不填示例角度代替；先保留低功率版作品。已填表不等於硬體已測試。


<!-- page: stage2 | 完整版本的啟動 -->
## a 是準備指針，不是開始計時

改程式時先斷兩種電源、移除外接線，再上傳：`LESSON_STAGE=2`，填舵機／供電／蜂鳴器的已確認設定。然後斷電恢復接線。

1. 接 USB、舵機外部仍 OFF，兩鍵放開且未遮穩定。
2. 只有已確認「工作電源 OFF 時接收 signal 不會異常回灌」的配置，才送 `a` 準備第0格。
3. 按既有已驗證順序外部 ON；觀察無異常，才按 Start。
4. a 後超過 **20秒** 未開始會中止。不是可以一直保持指針等人。
5. 新局跟前面一樣玩；綠加一、紅扣一，OLED與指針命令用同一 count。
6. 結果停止指針脈波；每局先外部 OFF，再做 z／下一次 a。

若這個上電順序尚未確認，**停在低功率版**。程式的準備紀錄不是量到電池真的 OFF，不能當作電氣驗證。

FAILED 會要求一次200 ms短聲；SUCCESS與ABORTED不發失敗聲。實際聲長、停止延遲與 PWM 資源相容性仍需整合實測。


<!-- page: layout | 加了輸出，也可能干擾輸入 -->
## 燈光和指針不要替玩家遮光

{{diagram:layout}}

1. 固定 KY、桌燈和遮光物位置，不靠移動感測器玩遊戲。
2. 手完全離開感測區，觀察切紅／綠時 raw 是否明顯改變，是否錯判事件。
3. 確認指針的掃動、導線和同學手臂不遮住感光面。
4. 若整合後才誤判，先中止，改布局，再重新取得同配置基準。

比較前後時，只改元件相對位置，保留供電、程式與光源條件，並記錄變更。不用調門檻掩蓋未確認的接線問題。

紙指針最後停在哪，不一定等於已凍結的結果；停止脈波可能失去保持力，結算前也可能還沒到位。

看 OLED／log 的規則結果，另記實際位置。不要為了讓照片漂亮，在帶電時強扳指針。


<!-- page: slower | 延伸作品：改變切換節奏 -->
## 同樣30秒，每色改成5秒

**若剛做完整版本，先恢復低功率版：**送 x，外部 OFF、取出電池、拔 USB，拆除舵機與蜂鳴器接線。在程式改回 `LESSON_STAGE=1`；保留八個低功率 GPIO 與基準，不把全體設定重設。依裸板上傳流程，先以上次 `COLOR_MS=3000` 完成一局確認，再做下面比較。原本就在 Stage 1 的組別不用重做這一步。

舵機與蜂鳴器維持分離。以下才是「只改紅綠切換時間，其餘不變」。

在完整程式找到這一行：

```cpp
const uint32_t GAME_MS=30000, COLOR_MS=3000,
               SAMPLE_MS=50, STABLE_MS=150;
```

原始檔可能排在同一行；只把 `COLOR_MS=3000` 改成 `COLOR_MS=5000`。編譯、依原流程斷電移線後上傳，再斷電恢復接線。

{{diagram:tempo}}

遊戲長度仍30秒、目標仍6、穩定時間仍150 ms、感測基準與布局不變。兩種設定都各有15秒綠燈、15秒紅燈，但分成的段數不同。

先預測：經過4秒時，3秒切色與5秒切色各是哪一色？不能只憑「切換較慢」就宣稱一定比較容易成功。


<!-- page: comparison | 用同一組事件比較 -->
## 差的是切換時間，不是手勢資料

以下是在主機以假 I/O 餵給既有計分程式的**事件測試**。時間是遊戲開始後、已確認新遮光的時刻；不是未經濾波的原始手勢，也不是實機成績。

| 新事件時刻 ms | 3秒切色 count | 5秒切色 count |
|---:|---:|---:|
| 1000 | 1 | 1 |
| 2000 | 2 | 2 |
| 4000 | 1 | 3 |
| 7000 | 2 | 2 |
| 10000 | 1 | 3 |
| 13000 | 2 | 4 |

兩種間隔均從0開始，14000 ms按 Finish，結果都是FAILED。4分比2分高，但仍未達6；不能只報「5秒切色成功」。

程式、目標、事件時刻與Finish相同，只改COLOR_MS。此測試能核對計分邏輯，不能證明真實玩家在任一節奏下都比較好。

實物若由人重新玩兩局，手勢時間也會不同，請如實記下，不把差異全歸因於切換時間。



<!-- page: buildexercise | 動手練習 -->
## 每局結束，說清楚分數怎麼來
> 沿用低功率遊戲，紅綠各 3 秒；不接舵機與蜂鳴器。

先將比較用的 COLOR_MS 恢復 3000。保留 30 秒、目標 6、感測基準、勝負與中止規則，新增每局統計：

| 欄位 | 記什麼 |
|---|---|
| green_events | RUNNING 時確認的綠燈新遮光次數 |
| red_events | RUNNING 時確認的紅燈新遮光次數 |
| changed_events | 這次事件確實改變 count 的次數 |
| unchanged_events | 因為上限或下限，count 沒變的次數 |

接受 Start 才清零；拒絕開始、snapshot 或放開手都不算事件。每個 RUNNING 遮光事件應恰好屬於一個燈色，以及「有變／沒變」其中一種。

一局結束只印一次 `event_type=round_summary`，包含 game_id、結果、最終 count 與四個統計。FAILED 與 ABORTED 要分開保留；尚未開始就中止，不印假的一局。

<!-- page: buildresults | 預期結果 -->
## 分數沒變，也可能發生了事件
> 假設每次都是已確認的新遮光事件，無其他故障；從 count=0 開始。

| 順序 | 操作 | count | green／red | changed／unchanged |
|---|---|---:|---|---|
| 1 | 紅燈遮光一次 | 0 | 0／1 | 0／1 |
| 2 | 綠燈遮光六次 | 6 | 6／1 | 6／1 |
| 3 | 綠燈再遮光一次 | 6 | 7／1 | 6／2 |
| 4 | 紅燈遮光一次 | 5 | 7／2 | 7／2 |
| 5 | 期限前按 Finish | 5，FAILED | 7／2 | 7／2 |

```text
event_type=round_summary game_id=1 result=FAILED count=5
green_events=7 red_events=2 changed_events=7 unchanged_events=2
```

分行只是方便閱讀，程式印同一行。最後九次事件滿足：

```text
green_events + red_events = changed_events + unchanged_events
```

結算後再遮光、按鍵或送 x，不再增加統計、不重印摘要。新局接受 Start 才重新計算。精確事件組合用紙上判讀或主機測試；實物依真實時刻記錄。

<!-- page: buildtest | 測試情境 -->
## 正常結束與中止都要有去向
| 測試 | 預期 |
|---|---|
| 未開始就送 x | ABORTED，但沒有 round_summary |
| 新局開始、沒遮光就 Finish | 四個統計全 0，FAILED 摘要一次 |
| 進行中送 x | ABORTED 摘要一次，不當成玩家 FAILED |
| 結束後持續讀畫面 | 不重印摘要 |
| 清除原因、回待機、接受新 Start | 新 game_id，四個統計從 0 開始 |

原程式已有 start、cover、result 紀錄，可用來對照自己的統計。不要數所有 log 行，也不要用「綠次數減紅次數」代替最終分數，因為分數受 0～6 限制。

這個練習只增加紀錄，不改得分、停止或實體輸出的條件。

<!-- page: troubleshooting | 排錯不要同時改很多東西 -->
## 先找是哪一段不一致

| 你看到什麼 | 先看哪裡 | 先不要做什麼 |
|---|---|---|
| blocked | 設定缺值、重複GPIO、兩組光線範圍是否重疊 | 全部改true |
| Start被拒絕 | Finish放開、未遮穩定、完整版prepared | 一直重啟 |
| 一直遮住只加一次 | 正常規則；移開等穩定再遮 | 把每筆raw都計分 |
| OLED綠、實物紅 | GPIO、準位、燈色對應 | 繼續評玩家對錯 |
| ABORTED | reason、新樣本、分類、I2C | 當作玩家0分 |
| 指針沒動 | 先外部OFF，再查命令與供電 | 強扳／升壓 |

蜂鳴器初始化、發聲或停止API故障可能阻擋啟動或鎖住後續操作，不能用 c／z 清掉硬體原因。先斷電檢查，必要時重新啟動。

程式不會抓到所有鬆線、假合理數值或畫面錯誤。每次只改一項，保留改前及改後紀錄，不為了通過就刪除中止條件。


<!-- page: finishrecord | 收尾與下週報告 -->
## 留下一個能解釋的完整作品

| 證據 | 內容 |
|---|---|
| 接線與設定 | 這次板卡、模組、GPIO、基準與遊戲參數 |
| 一局紀錄 | start、cover、result，保留裝置／開機／局次 |
| 正常與邊界 | 成功、提早失敗、到期；測試或實物分清 |
| 中止與復原 | x／兩鍵、f→r→c→z，指出原因 |
| 尚未完成 | 哪個元件或條件沒驗證，不冒充完成 |

不是每個項目都要另開一局；同一段完整紀錄可支持多項觀察，但不能把沒做過的項目打勾。

下週第一次專題報告，可以借用今天的分工：**輸入是什麼 → 程式怎麼判斷 → 輸出什麼 → 如何記錄與停止**。這裡不增加新評分或交件規定，正式要求依報告指引。

正常收尾先中止；完整版外部 OFF，再拔 USB，電表 OFF。斷電後才改線或收納。低功率版也要先拔 USB再拆線。


<!-- page: sources | 來源與適用界限 -->
## 哪些是資料，哪些是本課規則？

- [Arduino-ESP32 ADC 官方文件](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)：raw、解析度及ADC API；raw不是lux。
- [Arduino Blink Without Delay](https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/)：以時間差管理工作，不用delay等整段時間。
- [U8g2 專案](https://github.com/olikraus/u8g2)：OLED函式與控制器配置。
- [ESP32Servo 專案](https://github.com/madhephaestus/ESP32Servo)：控制命令不等於真實位置量測。

30秒、目標6、紅綠3秒、穩定150 ms、故障等待2秒，都是本課遊戲與程式選擇，不是感測器原廠規格。

照片沿用課程實物影像；圖是功能與資訊示意，不保證插針外觀順序。接線及供電限制依既有硬體交接記錄，不把未驗證舵機改寫為已通過。

程式事件測試不能代替實體聲長、負載、停止或整合硬體測試。紀錄中的預期結果與實物觀察須分開保存。

完整基本程式在第 {{page:gamecode}} 頁。各段使用同一支程式，不把分頁各自另存成不同草稿。
