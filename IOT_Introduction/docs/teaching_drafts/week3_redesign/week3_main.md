<!-- page: exercise | 考卷 · Q1～Q2 -->
## Week 3 考卷：光線與紀錄
> 作品可現場操作或用手機展示，完成後回答題末問題。可查資料或使用 AI。

### 作品：在電腦顯示光線讀值
用課堂 ESP32-S3 與光敏模組，讓電腦持續顯示光線讀值。

**特色：**在 Serial Monitor（電腦上的文字視窗）觀察光線變化。ESP32 把光敏訊號電壓轉成整數，這個數字叫原始讀值 **raw**；本題顯示範圍為 0～4095。

<aside class="safety">改線前拔 USB 與其他電源；先確認接線與供電相容，不將 5 V 接入 ESP32 訊號腳。不確定接法時保持斷電，不通電試錯。</aside>

**預期結果：**Serial Monitor 持續出現 0～4095 的整數，可讀到沒遮光與遮光時的數值；變化方向與數字以本組實測為準。

**驗證方法：**固定感測器、燈與接線的位置，觀察「沒遮光」與「用不透光紙遮住」時的數字，各記連續三筆 raw。

### Q1．你的作品在兩種光線下各讀到多少？

| 當時的情況 | 第 1 筆 raw | 第 2 筆 raw | 第 3 筆 raw |
|---|---|---|---|
| 沒遮光 | ______ | ______ | ______ |
| 遮光 | ______ | ______ | ______ |

### Q2．raw=800 可以寫成 0.8 V 嗎？
請說明原始讀值 800 代表什麼，以及你的判斷理由。
<div class="write-space" style="height:30mm"></div>

<!-- page: exercisemeter | 考卷 · Q3 -->
## 畫電流，判讀電壓
> 以下為理想電路的紙上計算，不要求重新接線。

### Q3．中間接點相對 GND 是多少 V？
供電 3.3 V，上方 1 kΩ、下方 10 kΩ，忽略電表對電路的影響。請在圖上加上**傳統電流方向**，並畫出經電源返回的完整路徑。

{{diagram:worksheetdivider}}

計算式與中間電壓：
<div class="write-space" style="height:15mm"></div>

表筆線的插頭插進電表，金屬筆尖碰電路。用 A830L 量上圖電壓時：

| 問題 | 你的答案 |
|---|---|
| 黑色表筆的線插進哪個孔？ | __________________________ |
| 紅色表筆的線插進哪個孔？ | __________________________ |
| 旋鈕選哪種量測、哪個範圍？ | __________________________ |
| 黑色筆尖碰圖中的哪裡？ | __________________________ |
| 紅色筆尖碰圖中的哪裡？ | __________________________ |

圖中的上方是靠近 3.3 V 的電阻，下方是靠近 GND 的電阻。GND 作為 0 V 比較位置；1 kΩ = 1000 Ω。

<!-- page: worksheetsafety | 考卷 · Q4 -->
## 量電壓前，先判斷接法
> 只在紙上回答，不把錯誤接法接到實物。

### Q4．同學準備把紅筆插在 10A
同學拿 A830L 電表，黑筆插 COM、紅筆插 10A，旋鈕選直流 20 V。他準備把黑筆碰 ESP32 的 GND、紅筆碰 3V3，再插 USB 供電。3V3 是約 3.3 V 的電源腳，GND 是 0 V 比較位置。

### 需要阻止的操作與原因
旋鈕已選直流電壓，為什麼仍有危險？畫出或寫出可能連通的電流路徑，說明危險的原因。
<div class="write-space" style="height:85mm"></div>

<!-- page: worksheetflow | 考卷 · Q5 -->
## 從光線到紀錄，中間經過什麼？
ESP32-S3 連著光敏模組和一顆按鈕。模組由 3V3 與 GND 供電，S 訊號接 GPIO4；按鈕接 GPIO5 與 GND，GPIO5 使用晶片內的上拉電阻讀取按鈕。

每次新的按下，程式讀取一次 GPIO4，在 Serial Monitor（Arduino 的文字視窗）顯示第幾筆、raw，以及程式自動記下的「讀到這筆時，距離開機多久」。按住不放不重複記錄，放開再按才增加下一筆。

本題板子用 COM USB 接電腦；板上的 CH343 負責將 ESP32 的 UART 串列資料轉成 USB 資料。

### Q5-1．畫出資訊流
依上述條件，從光線改變開始，畫到電腦出現一筆資料。另畫按鈕的資訊在哪裡加入。標出接腳、電壓轉成 raw 的位置及資料到電腦的路徑；每支箭頭註明傳遞什麼。

<div class="write-space" style="height:55mm"></div>

### Q5-2．只斷開 S 訊號線
在紙上把光敏模組 S 到 GPIO4 的線畫斷，其他供電、接線與程式不變。Monitor 仍出現數字，能否當成光線資料？能否保證變成 0？請解釋原因。

<div class="write-space" style="height:32mm"></div>

<!-- page: buildexercise | 動手練習 -->
## A．按一次，自動取三筆
**作品：**用光敏模組與一顆按鈕做光線取樣器。按一下，就在電腦留下三次量測的數字，不必連按三下。

**特色：**第一筆立即讀取，第二、三筆各與前一筆相隔至少 0.2 秒，由程式自動計時。每筆都重新量測當時的光線。

<aside class="safety">改線前拔除 USB 與其他電源，換程式前先拆外接線。確認接線、供電及腳位用途後再接回；不要把電源腳或輸出 HIGH 的 GPIO 直接接 GND。</aside>

RST 是板上的重新啟動按鈕。

### 預期結果
| 操作 | Serial Monitor 應出現的結果 |
|---|---|
| 按一下 | 自動取得三筆，每筆都重新讀感測器 |
| 持續按住 | 三筆完成後停止，不增加第四筆 |
| 還沒讀完就放開 | 仍把這次的三筆讀完 |
| 三筆完成後，放開再按 | 再自動取得三筆，和上次分開顯示 |
| 還沒讀完就再次按下 | 顯示「仍在讀取，這次按下不接受」的意思，不延後補做 |
| 按 RST | 中止正在做的讀取；放開再按，重新從第一次開始 |

每筆顯示：這是第幾次啟動的讀取、這次的第幾筆、光敏數值，以及程式自動記下的讀取時間。欄位可用中文；時間用來核對程式，不用手動計時或抄在紙上。

每筆時間是讀取當下距離開機多久。

<!-- page: batchrecord | 練習 A · 預期結果與作答 -->
## A．怎樣確認作品完成？
**驗證方法：**為了讓手動操作來得及，本頁用兩筆相隔約一秒的測試設定。每次開始前先放開按鈕，再按 RST；換程式時依前頁安全提醒操作。

### 預期結果：取樣途中仍能處理操作
| 操作 | 作品應有的結果 |
|---|---|
| 看到第一筆後，改變光線 | 後兩筆分別重新量測，反映當時的光線 |
| 重新開始；看到第一筆就放開約半秒，再按一下 | 顯示仍在讀取的提示；原來三筆完成後，不延後補做另一次 |

完成後把正式設定恢復為 0.2 秒，展示兩次按下共六筆。慢速操作只檢查讀取與按鈕行為；正式間隔看程式自動顯示的時間。長按、提早放開及重新啟動依作品規則展示。

### A．你的程式如何完成三次取樣？
指出自己的程式中每次重新量測的敘述，說明第一筆與後兩筆各在什麼時候執行，以及如何避免複製第一筆。可用關鍵程式片段加文字回答。
<div class="write-space" style="height:50mm"></div>

<!-- page: projectbutton | 延伸作品 1 · 光敏＋按鈕 -->
## B．可以暫停的遮光計數器
**作品：**用光敏模組與一顆按鈕做遮光計數器。每次由未遮住變成遮住，計數一次；Serial Monitor 顯示啟動／暫停狀態與次數。

<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 222" role="img" aria-label="Serial Monitor 預期內容示意"><text x="16" y="24" font-size="19">按鈕啟動後，遮住一次</text><text x="348" y="24" font-size="19">暫停後再遮住，不增加</text><rect x="8" y="40" width="302" height="165" rx="4" fill="#f1f4f5" stroke="#477b80"/><rect x="340" y="40" width="302" height="165" rx="4" fill="#f1f4f5" stroke="#477b80"/><text x="24" y="73" font-size="20" font-family="Consolas,monospace" fill="#263b40">mode=RUNNING</text><text x="24" y="105" font-size="20" font-family="Consolas,monospace" fill="#263b40">count=1</text><text x="356" y="73" font-size="20" font-family="Consolas,monospace" fill="#263b40">mode=PAUSED</text><text x="356" y="105" font-size="20" font-family="Consolas,monospace" fill="#263b40">count=1</text></svg><figcaption>Serial Monitor 預期內容示意；不是實測截圖，文字位置與字型可自行設計。</figcaption></figure>

| 使用者看到的資訊 | 意義 |
|---|---|
| RUNNING／PAUSED | 正在計數／暫停計數 |
| count | 這次開機後，計數期間完成的遮光次數 |
| 一次遮光 | 從未遮住變成遮住；持續遮住不算新的一次 |

**特色：**按一下按鈕切換啟動／暫停；按住不放只切換一次。暫停保留次數，但暫停期間的動作不補算。按 RST 後回到 PAUSED、count=0，不要求斷電保存。

**判斷依據：**接線與位置相同時，可沿用 Q1 的未遮光／遮光資料；兩種情況必須能區分。條件改變才重新量測，不直接套用別組的分界。

<aside class="safety">改線前拔除 USB；供電、訊號電壓與 GPIO 仍須符合已確認的器材規格。不要把電源腳或輸出 HIGH 的 GPIO 直接接 GND。</aside>

<!-- page: projectbuttonresults | 延伸作品 1 · 預期結果與作答 -->
## B．怎樣確認作品完成？
**驗證方法：**從未遮住、按鈕放開的狀態按 RST，依序做下表操作，展示狀態與次數。

遮住或移開至少一秒，避開分界附近的光線。除第 8 步外，按鈕按一下就放開。

| 順序與操作 | 畫面應顯示的狀態與遮光次數 |
|---|---|
| 1. 啟動後不操作 | PAUSED／0 |
| 2. 按一下按鈕 | RUNNING／0 |
| 3. 遮住並保持三秒 | RUNNING／1，不持續增加 |
| 4. 移開，再遮住 | RUNNING／2 |
| 5. 保持遮住，按一下暫停 | PAUSED／2 |
| 6. 暫停時移開、遮住兩次 | PAUSED／2 |
| 7. 遮住時恢復，再移開、遮住 | RUNNING／2 → RUNNING／3 |
| 8. 仍在 RUNNING，按住按鈕兩秒 | 只切換成 PAUSED／3，不反覆切換 |
| 9. 放開按鈕，再按 RST | PAUSED／0 |

模式或次數改變時，Monitor 留下紀錄。開機已遮住不加次數；按鈕按住開機，放開再按才接受。模式切換不算遮光，暫停中的動作不補算。

### B．你的程式如何判斷現在被遮住？
寫出自己的判斷規則，包含比較方向與分界數字，並引用本組實測作為依據；條件相同可用 Q1。可用程式或文字回答。
<div class="write-space" style="height:25mm"></div>

<!-- page: projectoled | 延伸作品 2 · 光敏＋OLED -->
## C．桌面光線觀測器
**作品：**用光敏模組與 OLED 做光線觀測器。不用按按鈕，就能看到目前讀值，以及這次開機後量到的最大、最小值。

<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 222" role="img" aria-label="OLED 預期畫面示意"><text x="16" y="24" font-size="19">剛開始，第一筆 raw=480</text><text x="348" y="24" font-size="19">之後量到 980，再回到 510</text><rect x="8" y="40" width="302" height="165" rx="4" fill="#18363c" stroke="#477b80"/><rect x="340" y="40" width="302" height="165" rx="4" fill="#18363c" stroke="#477b80"/><text x="24" y="73" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">RAW 480</text><text x="24" y="105" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">MIN 480</text><text x="24" y="137" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">MAX 480</text><text x="356" y="73" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">RAW 510</text><text x="356" y="105" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">MIN 480</text><text x="356" y="137" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">MAX 980</text></svg><figcaption>OLED 預期畫面示意；不是實測截圖，文字位置與字型可自行設計。</figcaption></figure>

| 畫面資訊 | 需要呈現的內容 |
|---|---|
| RAW | 最近一筆光敏原始讀值，不是伏特或照度 |
| MIN | 這次開機後，已取得資料中的最小值 |
| MAX | 這次開機後，已取得資料中的最大值 |

**特色：**畫面至少每秒更新一次。MIN、MAX 包含最新一筆資料；光線回復時，兩者不跟著回到目前值。按 RST 後重新開始統計，不要求斷電保存。

480、980、510 只是示例，假設中間沒有其他更大或更小的讀值。自己的作品顯示自己的量測結果，不要把示例數字寫死。

<aside class="safety">改線前斷電；確認 OLED 的供電與訊號電壓相容，不把模組接到 GPIO 當電源。不確定接法時保持斷電，不提高電壓試錯。</aside>

<!-- page: projectoledresults | 延伸作品 2 · 預期結果與作答 -->
## C．怎樣確認作品完成？
**驗證方法：**改變光線，觀察目前值與最大、最小值；再按 RST，確認重新開始記錄。以自己的讀值核對下表。

| 操作或條件 | 預期畫面與紀錄 |
|---|---|
| 剛啟動，尚無第一筆資料 | 可顯示 WAIT；不能把未取得的資料當成量測值 |
| 取得第一筆資料 | RAW、MIN、MAX 都等於這一筆 |
| 維持相同光線 | RAW 可小幅變動；範圍包含所有已取得的值 |
| raw 高於目前 MAX | MAX 更新；MIN 保留 |
| raw 低於目前 MIN | MIN 更新；MAX 保留 |
| raw 回到已記錄範圍中間 | RAW 改變；MIN、MAX 保留 |
| 按 RST | 舊範圍清除；以重啟後第一筆重新開始 |

Serial Monitor 至少每秒留下一筆相同資料組的 raw、min、max；現場或手機展示 OLED 與 Monitor 的同一次更新。

範圍包含所有取得的讀值，須符合 MIN ≤ RAW ≤ MAX。

### C．你的程式如何保留最小值與最大值？
寫出自己更新 MIN、MAX 的關鍵程式，說明第一筆與後續讀值各如何處理。
<div class="write-space" style="height:40mm"></div>

<!-- page: projectcapture | 延伸作品 3 · 光敏＋按鈕＋OLED -->
## D．按一下，留下光線快照
**作品：**用光敏模組、按鈕與 OLED 做可保存光線讀值的顯示器。畫面持續顯示目前讀值；按一下按鈕，另外保留按下時的讀值，供之後比較。

<figure><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 222" role="img" aria-label="OLED 預期畫面示意"><text x="16" y="24" font-size="19">尚未按過按鈕</text><text x="348" y="24" font-size="19">保存 480 後，光線變為 980</text><rect x="8" y="40" width="302" height="165" rx="4" fill="#18363c" stroke="#477b80"/><rect x="340" y="40" width="302" height="165" rx="4" fill="#18363c" stroke="#477b80"/><text x="24" y="73" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">RAW 480</text><text x="24" y="105" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">LAST ---</text><text x="24" y="137" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">SAVED 0</text><text x="356" y="73" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">RAW 980</text><text x="356" y="105" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">LAST 480</text><text x="356" y="137" font-size="20" font-family="Consolas,monospace" style="fill:#f0ffff">SAVED 1</text></svg><figcaption>OLED 預期畫面示意；不是實測截圖，文字位置與字型可自行設計。</figcaption></figure>

| 畫面資訊 | 需要呈現的內容 |
|---|---|
| RAW | 持續更新的目前讀值，至少每秒更新一次 |
| LAST | 最近保存的讀值；尚未保存時顯示 --- |
| SAVED | 這次開機後的保存次數，從 0 開始 |

**特色：**每次新的按下保存一筆，LAST 更新、SAVED 加一；按住不放只保存一次。保存後改變光線，RAW 繼續變，LAST 保持不變，直到下一次按下。

每次保存都在 Serial Monitor 留下一筆序號與讀值。只保留最近一筆即可，不要求全部歷史、資料庫或網路。RST／重新上電後，LAST 回到 ---、SAVED 回到 0。

<aside class="safety">OLED 規格須先確認；光敏、按鈕及 OLED 訊號不得誤用同一 GPIO。改線前斷電，不把 OLED 或其他負載接到 GPIO 當作供電。</aside>

<!-- page: projectcaptureresults | 延伸作品 3 · 預期結果與作答 -->
## D．怎樣確認作品完成？
**驗證方法：**按鈕先放開，再按 RST，依下表改變光線並操作按鈕。表中數值為示例，展示時使用自己的讀值。

| 順序與操作 | OLED 預期結果 |
|---|---|
| 1. 啟動，raw 為 480 | RAW 480；LAST ---；SAVED 0 |
| 2. 按一下，此次取得 480 | RAW 持續更新；LAST 480；SAVED 1 |
| 3. 不再按鈕，改變光線至 980 | RAW 980；LAST 480；SAVED 1 |
| 4. 放開再按，此次取得 980 | LAST 980；SAVED 2 |
| 5. 繼續按住三秒，光線改至 510 | RAW 510；LAST 980；SAVED 2 |
| 6. 放開再按，此次取得 510 | LAST 510；SAVED 3 |
| 7. 放開按鈕，再按 RST | RAW 顯示新讀值；LAST ---；SAVED 0 |

第 2、4、6 步各新增一筆保存紀錄；其餘步驟不新增保存事件。第 7 步清除本次進度，但電腦上已印出的舊文字不會因此消失。

OLED 的 LAST 必須與最新一筆保存紀錄相同，SAVED 必須與序號相同；LAST 與即時 RAW 不必相同。按鈕按住開機時，放開後再按才保存第一筆。

**成品條件：**OLED 文字清楚、不重疊或超出畫面；排版可自行設計。

### D．你的程式如何分開更新目前值與保存值？
指出自己用哪些變數保存 RAW 與 LAST，並說明各在什麼情況下更新。可用關鍵程式片段加文字回答。
<div class="write-space" style="height:35mm"></div>
