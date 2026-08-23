# Week 5支援資料

本檔提供Week 5實驗所需的profile、接線、測試與Lab Note表格。完整操作順序、
安全規則、程式與完成條件見[Week 5主教材](week5_main.md)。

> 驗證狀態：實體整合只能使用Week 2～5已完成target test的數值。尚未取得
> START／STOP GPIO、light profile、舵機角度、pulse width、電池負載電壓或安全停止值時，
> 對應欄位保持「未驗證」，只完成`DRY_RUN=true`。

## 一、進入條件檢核

| 檢核項目 | 證據位置或數值 | 結果 |
|---|---|---|
| Week 2 ESP32-S3 Upload、Serial、START按鈕及GND已驗證 |  | ☐通過 ☐未通過 |
| 第二顆STOP按鈕、獨立GPIO與GND接法已完成本週target test |  | ☐通過 ☐未通過 |
| Week 3 KY-018 profile已完成target test |  | ☐通過 ☐未通過 |
| DARK、NORMAL、BRIGHT資料可分離 |  | ☐是 ☐否 |
| Week 4 RGB與蜂鳴器profile已完成target test |  | ☐通過 ☐未通過 |
| Week 4 SG90與外部供電profile已完成target test |  | ☐通過 ☐未通過 |
| 電池盒安全轉接端子無裸銅 |  | ☐是 ☐否 |
| SG90未連接機構，且不發熱、不抖動 |  | ☐是 ☐否 |
| 進入實體模式的核對日期 |  |  |

任一必要項目未通過時，在下表記錄原因，保持電池盒OFF，不以網路搜尋到的GPIO、
角度或電壓數值代替實板驗證。

## 二、Week 5整合profile

### 2.1 裝置與低功率I/O

| 欄位 | 已驗證值 | 來源證據 |
|---|---:|---|
| `DEVICE_ID`（不得使用姓名或學號） |  |  |
| `PIN_START` |  | Week 2／本週整合 |
| `PIN_STOP` |  | 本週target test |
| START與STOP按下時level |  | INPUT_PULLUP接法 |
| START與STOP使用不同GPIO |  | ☐是 ☐否 |
| `PIN_LIGHT` |  | Week 3 |
| `PIN_RGB_R` |  | Week 4 |
| `PIN_RGB_G` |  | Week 4 |
| `PIN_RGB_B` |  | Week 4 |
| `RGB_ON_LEVEL` |  | Week 4 |
| `PIN_BUZZER` |  | Week 4 |
| `BUZZER_ON_LEVEL` |  | Week 4 |
| `BUZZ_DURATION_MS` |  | Week 4 |

### 2.2 KY-018感測profile

`LIGHT_DIRECTION=1`表示raw通常由DARK往BRIGHT增加；`-1`表示raw通常由DARK
往BRIGHT減少。門檻順序必須與direction一致。

| 欄位 | 已驗證值 | 來源證據 |
|---|---:|---|
| `LIGHT_DIRECTION` |  | Week 3 |
| `LIGHT_THRESHOLD_DARK_NORMAL` |  | Week 3 |
| `LIGHT_THRESHOLD_NORMAL_BRIGHT` |  | Week 3 |
| `LIGHT_VALID_MIN` |  | Week 3 |
| `LIGHT_VALID_MAX` |  | Week 3 |
| `LIGHT_PROFILES_SEPARATED` |  | Week 3 |
| `TARGET_LIGHT_STATE`（1=DARK，2=BRIGHT） |  | 本週決定 |
| 門檻順序與direction一致 |  | ☐是 ☐否 |

### 2.3 SG90、電池與安全profile

| 欄位 | 已驗證值 | 來源證據 |
|---|---:|---|
| ESP32Servo版本 |  | Week 4 |
| `PIN_SERVO` |  | Week 4 |
| `SERVO_MIN_US` |  | Week 4 |
| `SERVO_MAX_US` |  | Week 4 |
| `SAFE_MIN_ANGLE` |  | Week 4 |
| `SAFE_HOME_ANGLE` |  | Week 4 |
| `SAFE_TARGET_ANGLE` |  | Week 4 |
| `SAFE_MAX_ANGLE` |  | Week 4 |
| `SERVO_HOLD_MS` |  | Week 4 |
| `SERVO_SEQUENCE_TIMEOUT_MS` |  | Week 4 |
| AA電池種類與顆數 |  | Week 4 |
| 電池盒空載電壓 |  | Week 4 |
| 舵機動作時最低負載電壓 |  | Week 4 |
| Week 4安全停止值 |  | Week 4 |

## 三、狀態與轉移表

先填表，再核對程式中的`enterState()`與`updateStateMachine()`。每一列都必須寫出
所有輸出，不使用「同上」或「保持上一狀態」。

| 狀態 | 進入事件 | RGB | 蜂鳴器 | 舵機 | 離開條件 | 最大停留時間 |
|---|---|---|---|---|---|---|
| IDLE |  |  |  |  |  |  |
| READY |  |  |  |  |  |  |
| ACTIVE |  |  |  |  |  |  |
| RESULT |  |  |  |  |  |  |
| ERROR |  |  |  |  |  |  |

### 3.1 預測轉移

| 測試 | 起始狀態 | 輸入或條件 | 預測終點 | 預測reason |
|---:|---|---|---|---|
| 1 | IDLE | `start` |  |  |
| 2 | ACTIVE | `trigger`（DRY RUN） |  |  |
| 3 | ACTIVE | 等待超過timeout |  |  |
| 4 | ACTIVE | `stop` |  |  |
| 5 | 任意狀態 | `fault` |  |  |
| 6 | ERROR且fault仍存在 | `reset` |  |  |
| 7 | ERROR | `clear`後`reset` |  |  |
| 8 | 不允許的狀態 | `trigger` |  |  |
| 9 | ERROR且尚未`clear` | `reset` |  |  |
| 10 | ERROR且實體STOP仍按住 | `clear`或`reset` |  |  |

## 四、DRY RUN測試紀錄

| 測試 | 實際狀態順序 | 實際reason | Serial仍可回應 | 結果 |
|---:|---|---|---|---|
| 正常流程 |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| ACTIVE timeout |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| `stop` |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| `fault` |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| fault未清除直接reset |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| timeout後未clear直接reset |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| `clear`後`reset` |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |
| 不合法命令 |  |  | ☐是 ☐否 | ☐通過 ☐失敗 |

DRY RUN log檔名：`____________________________`

## 五、完整接線表

學生依自己的已驗證profile填寫，不從其他組複製GPIO。`來源端`與`目的端`都要寫
實體板上的標示。先填表、再斷電接線，最後正向與反向各核對一次。

| 功能 | 來源端 | 目的端 | 導線顏色 | profile來源 | 正向核對 | 反向核對 |
|---|---|---|---|---|---|---|
| START訊號 |  |  |  | Week 2／本週 | ☐ | ☐ |
| START GND |  |  |  | Week 2／本週 | ☐ | ☐ |
| STOP訊號 |  |  |  | 本週target test | ☐ | ☐ |
| STOP GND |  |  |  | 本週target test | ☐ | ☐ |
| KY-018 signal |  |  |  | Week 3 | ☐ | ☐ |
| KY-018 3V3 |  |  |  | Week 3 | ☐ | ☐ |
| KY-018 GND |  |  |  | Week 3 | ☐ | ☐ |
| RGB R |  |  |  | Week 4 | ☐ | ☐ |
| RGB G |  |  |  | Week 4 | ☐ | ☐ |
| RGB B |  |  |  | Week 4 | ☐ | ☐ |
| RGB電源／GND |  |  |  | Week 4 | ☐ | ☐ |
| 蜂鳴器signal |  |  |  | Week 4 | ☐ | ☐ |
| 蜂鳴器電源／GND |  |  |  | Week 4 | ☐ | ☐ |
| SG90 signal |  |  |  | Week 4 | ☐ | ☐ |
| SG90 V+ | 電池正極安全端子 |  |  | Week 4 | ☐ | ☐ |
| SG90 GND | 電池負極／共地節點 |  |  | Week 4 | ☐ | ☐ |
| ESP32 GND |  | 電池負極／共地節點 |  | Week 4 | ☐ | ☐ |

電池正極不得接ESP32的3V3、5V、VBUS或其他電源腳；上表若出現這種路徑，不能
上電。完整上電前俯視照片：`____________________________`

## 六、實體模式上電前檢核

- [ ] `DRY_RUN=false`，所有`-1`均由已驗證profile填入。
- [ ] START與STOP按鈕都有清楚標籤、使用不同GPIO並各自接到GND。
- [ ] 程式Verify成功，且未出現`config_missing`。
- [ ] USB拔除；電池盒OFF並取出至少一顆電池後才接線。
- [ ] SG90未連接機構，轉動範圍內沒有障礙物。
- [ ] 電池正極只到SG90 V+，沒有進入ESP32電源腳。
- [ ] 電池負極、SG90 GND與ESP32 GND共地。
- [ ] 所有低功率模組電源、GND及signal符合來源profile。
- [ ] 安全轉接端子沒有裸銅、鬆脫或反接。
- [ ] 空載電壓符合Week 4 profile。
- [ ] 已知道抖動、發熱、異味、重啟或低電壓時要先關電池盒。

## 七、三次正常流程

| 次數 | 開始uptime | 命中時raw | 命中uptime | 舵機完成uptime | 回IDLE uptime | 最低負載電壓 | 結果 |
|---:|---:|---:|---:|---:|---:|---:|---|
| 1 |  |  |  |  |  |  | ☐通過 ☐失敗 |
| 2 |  |  |  |  |  |  | ☐通過 ☐失敗 |
| 3 |  |  |  |  |  |  | ☐通過 ☐失敗 |

三次測試是否都從IDLE開始並回到IDLE：☐是 ☐否
三次測試之間是否曾修改門檻、GPIO或供電：☐否 ☐是，請寫入故障紀錄

## 八、故障、restart與恢復

| 測試 | 預期安全輸出 | 實際state／reason | 舵機已detach | 恢復方法 | 結果 |
|---|---|---|---|---|---|
| Serial `fault` |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |
| ACTIVE timeout |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |
| Serial `stop` |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |
| 實體STOP（ACTIVE） |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |
| 實體STOP（RESULT，如能安全完成） |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗／不適用 |
| 電池OFF後按RESET |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |
| 故障清除後正常流程 |  |  | ☐是 ☐否 |  | ☐通過 ☐失敗 |

若自然出現低電壓、抖動、發熱、異味或重啟，立即停止，不為了重現證據而再次
供電。KY-018拔線不一定形成可辨識的固定raw值，所以不能當作唯一故障注入方法。

## 九、單一規則修改比較

修改項目：`____________________________`
修改前預測：`________________________________________________________`

| 版本 | 測試次數 | 正常完成次數 | 誤觸發或timeout | 反應時間摘要 | ERROR測試 | 觀察 |
|---|---:|---:|---:|---|---|---|
| 修改前 | 3 |  |  |  |  |  |
| 修改後 | 3 |  |  |  |  |  |

除上述單一規則外，GPIO、library、電池、供電、門檻與接線是否保持相同：☐是 ☐否

## 十、後續網路單元事件欄位

| 欄位 | 型別 | 意義 | 範例 |
|---|---|---|---|
| `device_id` | string | 不含個資的裝置代碼 |  |
| `event_type` | string | 發生的事件 |  |
| `state` | string | 記錄當下狀態 |  |
| `value` | integer | 事件主要數值 |  |
| `unit` | string | value的單位 |  |
| `valid` | boolean | 資料或動作是否有效 |  |
| `reason` | string | 正常或失敗原因 |  |
| `uptime_ms` | unsigned long | 開機後毫秒數 |  |

| event_type | 範例state | value／unit | valid | reason |
|---|---|---|---|---|
| `state_changed` |  |  |  |  |
| `sensor_sample` |  |  |  |  |
| `actuator_applied` |  |  |  |  |
| `actuator_return` |  |  |  |  |
| `actuator_done` |  |  |  |  |
| `fault_cleared` |  |  |  |  |
| `command_rejected` |  |  |  |  |
| `status` |  |  |  |  |

## 十一、故障紀錄

| 時間／uptime | 現象 | state／reason | 第一個安全動作 | 測量或log證據 | 根因 | 單一修正 | 重測結果 |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

## 十二、Lab Note

### 12.1 版本與profile來源

- sketch檔名：
- Arduino IDE版本：
- ESP32 board package版本：
- ESP32Servo版本：
- Week 3 profile證據位置：
- Week 4 profile證據位置：
- 程式版本或commit：

### 12.2 證據索引

- DRY RUN log：
- 完整接線照片：
- 萬用電表照片：
- 三次正常流程log：
- fault／timeout／Serial stop／實體STOP／restart log：
- 修改前後程式差異：

### 12.3 結論與限制

1. 三次正常流程是否可重複，證據是什麼？
2. 哪一個錯誤會進入ERROR？哪一行log能證明舵機已停止控制？
3. 為什麼ERROR不應在原因未清除時自動回IDLE？
4. 為什麼KY-018拔線不能當作唯一感測故障測試？
5. 哪些profile或實體條件仍未驗證？因此不能做出什麼結論？

## 十三、Week 6課前軟體準備

Week 6會在筆電執行Backend。下課後開啟PowerShell，逐一執行：

```powershell
git --version
python --version
```

兩行都必須顯示版本號。若`python`找不到，再執行：

```powershell
py --version
```

若`py`可用，Week 6凡是`python -m ...`都可改成`py -m ...`。若Git或Python均
無法顯示版本，從[Git for Windows官方下載頁](https://git-scm.com/downloads/win)
與[Python官方Windows下載頁](https://www.python.org/downloads/windows/)安裝；
安裝Python時勾選將Python加入PATH。安裝後關閉原PowerShell、開新視窗並重做
版本檢查，不只以安裝畫面作為成功證據。

課前確認repository中存在：

```text
examples/course_backend/app.py
examples/course_backend/requirements.txt
IoT_Introduction/Week_06_HTTP_WebSocket_Backend/week6_main.md
```

只需完成版本檢查與檔案確認；虛擬環境、套件及Backend會依Week 6 main建立。
若失敗，保留作業系統版本、完整命令、完整錯誤及已嘗試方法，不提交密碼或token。

## 相關資料

- [Week 5主教材](week5_main.md)
- [Week 3支援資料](../Week_03_Sensors_Input_Quality/week3_support.md)
- [Week 4支援資料](../Week_04_Actuators_and_Power/week4_support.md)
- [硬體教材藍圖](../../docs/hardware_course_material_plan.md)
