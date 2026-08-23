# Week 2支援資料

本檔放置上課前確認表、已購設備辨識索引、延伸實作、故障排查與回報格式。
實際操作步驟請依[Week 2主教材](week2_main.md)進行。

## 一、本週必帶與器材確認

### 個人必帶

- [ ] 已安裝Arduino IDE 2與Espressif `esp32` package的筆電。
- [ ] 筆電充電器。
- [ ] 可開啟最新版GitHub課程教材。
- [ ] 一條已確認可傳輸資料的USB線。

### 每個工作位的實驗依賴

| 品項 | 最低數量 | 本週用途 | 取得方式 |
|---|---:|---|---|
| ESP32-S3-DevKitC-1 N16R8，排針向下44腳 | 1 | Upload、GPIO4輸入、GPIO5輸出 | 學生自備 |
| 可傳資料的USB線 | 1 | 供電、Upload、Serial | 學生自備 |
| 400孔麵包板 | 1 | 按鈕與安全測試點 | 學生自備 |
| 四腳輕觸按鈕 | 1 | 數位輸入 | 學生自備 |
| 公對公杜邦線 | 至少4條 | GPIO4、GPIO5、GND及測試點 | 學生自備 |
| 萬用電表 | 輪流共用 | 通斷、LOW／HIGH電壓 | 課堂提供 |

本週不使用LED、蜂鳴器、舵機、馬達、電池盒、外部電源或感測模組。
上電前請把這些物品移出工作區。

### 上電前最後確認

- [ ] 開發板金屬屏蔽罩與板身絲印已拍照。
- [ ] USB線已確認可傳輸資料。
- [ ] 麵包板、按鈕與杜邦線無明顯損壞。
- [ ] 萬用電表的表筆、電池與DCV／電阻功能已確認。
- [ ] 桌上沒有外部電池、馬達或高電流負載。

## 二、已購設備辨識索引

本表是教師已購庫存的辨識索引，不是學生固定配發清單。
商品圖只供辨識，接線前必須核對實物絲印、電壓與可靠的pinout。

| 分類 | 設備與數量 |
|---|---|
| 控制與原型 | ESP32-S3 N16R8×3、400孔麵包板×4、三種杜邦線各6排、電阻包×3、按鈕×10、萬用電表×1 |
| 感測 | DHT11、HC-SR501、KY-018、HC-SR04各3 |
| 顯示與提示 | 0.96吋I2C OLED×5、OLED支架×2、KY-016×3、KY-012×3、8位WS2812×2 |
| 動作與驅動 | SG90×6、MG90S×4、TT 1:120馬達×4、輪胎×4、L298N×2、15 mm萬向球×2 |
| 電源 | 4AA帶開關電池盒×2、LM2596S降壓模組×3 |

下圖是本課ESP32-S3的商品辨識圖，只用來確認外觀與型號；接腳仍以實物
絲印與官方pinout為準。

![本課使用的ESP32-S3 DevKitC-1 N16R8](../../docs/images/hardware/esp32-s3-devkitc-1-n16r8-product-page.png)

圖片辨識請查看[學生用訂單設備圖鑑](../../docs/images/hardware/order_gallery.md)
與[設備圖片目錄](../../docs/images/hardware/README.md)。

## 三、缺料或故障回報格式

不要只寫「不能用」。回報時提供：

1. 姓名、作業系統版本與Arduino IDE版本。
2. 開發板模組絲印、板卡正反面照片。
3. 已經完成到主教材的哪一步。
4. 完整錯誤訊息、Port畫面或Serial Monitor截圖。
5. 接線俯視圖，需清楚看到ESP32腳位絲印。
6. 已嘗試的方法與結果。

編譯失敗、上傳失敗、Serial無輸出、按鈕讀值錯誤與電壓量測錯誤是
不同問題，必須先指出失敗發生在哪一階段。

## 四、相關資料

- [Week 1正式採購總表](../Week_01_Course_Orientation/week1_support.md#一學生材料採購總表)
- [Week 2課前環境準備](../Week_01_Course_Orientation/week1_support.md#三week-2課前環境準備)
- [程式片段](../../docs/course_materials/starter_code_snippets.md)
- [安全檢核](../../docs/course_materials/rubrics_and_checklists.md)

## 五、延伸實作

完成主教材的必要練習後，可選擇下列題目繼續修改、預測、測試與記錄。

### 延伸實作1：切換模式

每次按下按鈕，GPIO5在HIGH與LOW之間切換；放開按鈕不改變模式。

預期log：

```text
event=mode_changed mode=ON gpio5=HIGH
event=mode_changed mode=OFF gpio5=LOW
```

提示：建立`bool outputOn`，只在新的按下事件發生時反轉它。

### 延伸實作2：長按與短按

放開按鈕時，計算這次按住多久。小於門檻輸出`short_press`，達到門檻輸出
`long_press`。

```text
event=short_press duration_ms=326
event=long_press duration_ms=1842
```

提示：按下時保存`pressedAtMs`，放開時以目前`millis()`相減。不得使用
阻塞式的長時間`delay()`。

### 延伸實作3：閒置提醒

一段時間都沒有按鈕事件時，輸出一次idle訊息；再次操作後重新計時。

```text
status=idle idle_ms=10000
```

提示：保存`lastActivityMs`。為避免每次loop都重複印出idle，再增加一個
`idleReported`狀態。

### 延伸實作4：三段狀態循環

每次按下依序切換：

```text
NORMAL -> WARNING -> ALARM -> NORMAL
```

每個狀態要有不同的GPIO5行為或Serial文字，並能在Reset後回到NORMAL。

提示：可以使用整數0、1、2，也可以使用`enum`建立有名稱的有限狀態。

### 延伸實作5：比較不同去抖時間

將`DEBOUNCE_MS`分別設成`0`、`10`、`30`、`100`，每種設定實際按十次，
比較程式記錄到幾次按下事件。

| 去抖設定 | 實際按下 | 程式計數 | 使用感覺／問題 |
|---:|---:|---:|---|
| 0 ms | 10 |  |  |
| 10 ms | 10 |  |  |
| 30 ms | 10 |  |  |
| 100 ms | 10 |  |  |

結果說明須以重複計數或反應延遲為依據，不得只填寫哪個設定「最好」。

### 延伸實作6：反應時間遊戲

Reset後等待一段隨機時間，Serial顯示`GO`才可按按鈕。記錄從`GO`到
按下的反應時間；提早按下則顯示`too_early`。

```text
game=ready
game=go
game=result reaction_ms=418
```

提示：需要WAIT、GO、RESULT等狀態，並使用`random()`與`millis()`；不可
使用長時間`delay()`，否則無法偵測提早按下。

### 延伸實作7：加入事件序號

替每一筆按鈕事件加入從1開始的`seq`，讓閱讀log的人能判斷是否漏掉或
重複一筆事件：

```text
group=03 seq=1 event=button_changed pressed=true gpio5=HIGH time_ms=12345
group=03 seq=2 event=button_changed pressed=false gpio5=LOW time_ms=13021
```

提示：建立`unsigned long eventSeq = 0;`，只在穩定狀態真正改變時先加1，
再把`eventSeq`放進同一行`Serial.printf()`。按下與放開都算一筆事件。

### 延伸實作8：找出系統無法偵測的故障

先斷電，拔掉GPIO4訊號線，再重新上電。觀察程式會把它看成什麼狀態，
回答：只有`INPUT_PULLUP`時，程式能否分辨「真的沒按」與「訊號線脫落」？

提出一種未來可改善的硬體或軟體方法。本題不要求立刻加購或重新接線。

### 延伸實作9：交換操作與隱藏錯誤

由另一位組員操作上傳及測試。接著在斷電狀態下，由教師或其他組製造一個
安全的小錯誤，例如換錯GPIO4訊號線的位置。依序使用接線表、通斷、Serial
及電壓證據找出問題；一次只能改一個變因。

### 延伸實作紀錄

| 選擇的延伸實作 | 修改內容 | 預期結果 | 實際結果 | 修正 |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |

## 六、故障排查表

| 現象 | 優先檢查 | 禁止或不建議的動作 |
|---|---|---|
| 沒有Port | 資料線、USB接頭、裝置管理員 | 安裝來源不明的driver |
| Compile失敗 | 第一個錯誤、括號、分號、board package | 重插所有接線 |
| Upload失敗 | Board、Port、線材、是否被其他程式占用 | 直接更換整塊板 |
| Upload完成但無Serial | baud rate、port、RESET、`Serial.begin` | 同時改多個設定 |
| 按鈕永遠未按 | GPIO4、GND、按鈕方向、`INPUT_PULLUP` | 帶電改線 |
| 按鈕永遠按下 | GPIO4是否持續短接GND | 將5V接入測試 |
| GPIO5電壓不變 | 程式版本、Serial事件、表筆位置與檔位 | 切到電流檔 |
| 板子發熱或異味 | 立即拔USB，通知教師 | 再次上電測試 |

故障排除時一次只改一個變因，並保存修改前後的log，以判定有效的修正動作。
