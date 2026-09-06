# Week 15支援資料

本檔提供automation policy、門檻觀察、priority、fault、recovery及clean reconstruction表。
核心實作見[Week 15主教材](week15_main.md)。

## 一、Automation Policy表

| Policy element | 定義 | 可觀察輸入 | State前置條件 | 動作／輸出 | Log／event | 驗收方式 |
|---|---|---|---|---|---|---|
| Dark enter |  |  | IDLE＋auto on | ACTIVE |  |  |
| Light exit |  |  | ACTIVE | IDLE |  |  |
| Invalid sensor |  |  | 任何 | ERROR |  |  |
| Active timeout |  |  | ACTIVE | ERROR |  |  |
| Network timeout |  |  | ACTIVE | ERROR |  |  |
| Physical STOP |  |  | 任何 | ERROR |  |  |
| Remote stop |  |  | 任何 | ERROR |  |  |
| Reset |  | fault已排除 | IDLE＋auto off |  |  |  |

## 二、Profile與Hysteresis紀錄

```text
Week 3 profile commit／紀錄：
PIN_LIGHT：
LIGHT_VALID_MIN：
LIGHT_VALID_MAX：
DARK_WHEN_RAW_LESS：true／false
DARK_ENTER_RAW：
LIGHT_EXIT_RAW：
Enter／exit關係檢查：
REQUIRED_CONSECUTIVE_SAMPLES：
AUTOMATION_SAMPLE_MS：
MAX_ACTIVE_MS：
NETWORK_GRACE_MS：
```

### 門檻附近觀察

| Sample | Raw | Valid | Enter條件 | Exit條件 | dark count | light count | State | 是否符合預測 |
|---:|---:|---|---|---|---:|---:|---|---|
| 1 |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |  |  |

完成條件：在enter與exit之間的小幅變化不造成state chatter；連續sample尚未達指定數時不
提早轉換。

## 三、Priority與Conflict Matrix

| 同時條件 | 較高優先 | 預期最終state | 輸出 | 低優先動作是否執行 | 實際證據 |
|---|---|---|---|---|---|
| Physical STOP＋dark enter | STOP | ERROR | Safe | 否 |  |
| Sensor invalid＋remote start | invalid sensor | ERROR | Safe | 否 |  |
| Active timeout＋light exit | timeout | ERROR | Safe | 否 |  |
| Auto mode＋manual start | auto ownership | 不變／reject | 不變 | 否 |  |
| ERROR＋auto_on | ERROR latch | ERROR | Safe | 否 |  |
| Remote stop＋telemetry | stop | ERROR | Safe | telemetry可後送 |  |
| Network offline＋physical STOP | STOP | ERROR | Safe | 不等待network |  |

若測試結果與priority table不同，先修程式順序或state guard，不修改表格迎合程式錯誤。

## 四、Baseline Test紀錄

| 階段 | 開始state | 操作／input | 預期 | 實際state／RGB | Event／command ID | Pass |
|---:|---|---|---|---|---|---|
| 1 | boot | 有效sample | IDLE、auto off |  |  |  |
| 2 | IDLE | auto_on | armed、仍IDLE |  |  |  |
| 3 | IDLE | dark sample 1／2 | 不轉換 |  |  |  |
| 4 | IDLE | dark sample 3 | ACTIVE |  |  |  |
| 5 | ACTIVE | hysteresis區間 | 維持ACTIVE |  |  |  |
| 6 | ACTIVE | light sample 1／2 | 不轉換 |  |  |  |
| 7 | ACTIVE | light sample 3 | IDLE |  |  |  |
| 8 | ACTIVE | 超過max duration | ERROR＋auto off |  |  |  |
| 9 | ERROR | fault清除＋reset | IDLE＋auto off |  |  |  |

## 五、Fault Injection與Recovery表

| Fault | Baseline | 唯一變因 | 預期安全state | 實體結果 | Mobile | Structured log | Database | Recovery | Baseline再驗證 |
|---|---|---|---|---|---|---|---|---|---|
| Physical STOP |  |  | ERROR |  |  |  |  |  |  |
| Sensor invalid（程式注入） |  | `test_sensor_fault` | ERROR |  |  |  |  | 清除測試旗標、取得新有效sample、reset |  |
| Sensor invalid（核准實體測試，如有） |  |  | ERROR |  |  |  |  |  |  |
| Broker unavailable |  |  | ERROR after grace |  |  |  |  |  |  |
| Backend unavailable |  |  | 依policy |  |  |  |  |  |  |
| Active timeout |  |  | ERROR |  |  |  |  |  |  |
| Malformed command |  |  | state unchanged |  |  |  |  |  |  |
| Duplicate command |  |  | no repeated action |  |  |  |  |  |  |

### Recovery必須回答

1. Fault是否仍存在？用什麼證據判定？
2. 哪個輸出已進safe state？是實體測試還是只看log？
3. Reset前需要人工檢查什麼？
4. Reset會回到哪個state？Auto mode是否保持關閉？
5. 舊command會不會重播？
6. Recovery後哪一個baseline test重新通過？

## 六、高功率／機械輸出專題附加檢查

共同RGB實驗是低功率可視輸出。專題若使用SG90、馬達、泵、電磁閥或其他負載，另外填：

| 項目 | 專題設計 | 實測證據 | 未完成時的限制 |
|---|---|---|---|
| External power voltage／current |  |  |  |
| Common ground |  |  |  |
| Driver／isolation |  |  |  |
| Startup current／voltage drop |  |  |  |
| Driver disable／detach |  |  |  |
| Maximum action duration |  |  |  |
| Physical emergency stop |  |  |  |
| Jam／stuck detection |  |  |  |
| Power removal recovery |  |  |  |

GPIO不得直接供應高電流負載。「畫面顯示STOP」不是實體driver已停止的證據。

## 七、Clean Reconstruction Checklist

### 原作者交付前

- [ ] 提供exact commit hash，且必要commit已push到可取得remote。
- [ ] `git status --short`已檢查，不依賴untracked必要檔。
- [ ] Backend dependency固定於`requirements.txt`。
- [ ] Board package與Arduino libraries版本已記錄。
- [ ] `.env.example`及device secrets example只有placeholder。
- [ ] `.gitignore`排除`.venv`、runtime、cache及秘密。
- [ ] README寫明setup、host test、run、stop、API、限制。
- [ ] Hardware profile、接線與安全停止有紀錄。

### 重建者不得取得

- 原開發者`.venv`或全域Python site-packages。
- 原`runtime/iot_course.db`。
- 原`secrets.h`、broker password file或operator key。
- 原開發者未寫入文件的口頭步驟。
- 原開發者已開啟的Backend／broker程序。

### 重建步驟紀錄

| Step | Command／document section | Expected | Actual | Pass／blocked | First missing fact | Fix commit | Retest |
|---:|---|---|---|---|---|---|---|
| 1 | clone exact commit | clean status |  |  |  |  |  |
| 2 | create venv | local environment |  |  |  |  |  |
| 3 | install requirements | no error |  |  |  |  |  |
| 4 | pytest | all pass |  |  |  |  |  |
| 5 | start Backend | new DB schema |  |  |  |  |  |
| 6 | host POST／query | 201／history |  |  |  |  |  |
| 7 | mobile localhost | page／WS |  |  |  |  |  |
| 8 | install Arduino deps | exact versions |  |  |  |  |  |
| 9 | device dry-run compile | build success |  |  |  |  |  |
| 10 | target profile | documented／pending |  |  |  |  |  |

## 八、Reconstruction Failure分類

| 分類 | 例子 | 修正位置 | 不可採用的繞過方式 |
|---|---|---|---|
| Missing dependency | import error | requirements／version docs | 複製原`.venv` |
| Missing secret name | 不知env var | `.env.example`／README | 提交真實key |
| Missing command | 不知run path | README | 原作者代為啟動 |
| Missing schema step | DB table不存在 | app init／README | 複製原database |
| Missing frontend asset | 404 manifest/sw | tracked files／routes | 使用原瀏覽器cache |
| Missing hardware profile | GPIO不明 | Lab Note／profile | 猜網路pinout |
| Environment mismatch | version API不同 | version record | 靜默升降版 |
| Undocumented external state | broker已預先執行 | runbook | 使用原程序 |

## 九、Secret Scan與資料清理

- [ ] `git diff`與staged diff沒有SSID、password、key、token。
- [ ] Screenshot、terminal transcript與log沒有command header秘密。
- [ ] `.env.example`及`.h` example全部是placeholder。
- [ ] Device ID不含個資。
- [ ] Runtime database與broker password file不在Git。
- [ ] Reconstruction使用全新臨時credential。
- [ ] 若秘密曾進Git，已立即停止分享、撤銷／更換，並依repository管理流程處理。

## 十、Lab Notebook模板

```text
日期／組別／baseline commit：

Automation policy：
- trigger／release：
- validity：
- action／max duration：
- safe state：
- priority：
- recovery：

Hardware profile evidence：
- sensor：
- RGB／output：
- physical STOP：

Baseline：
- compile：
- upload：
- physical sequence：
- Backend／DB／mobile：

Faults：
1.
2.
3.

Reconstruction：
- rebuilder：
- exact commit：
- host pass：
- device compile：
- first missing fact：
- fix／retest：

Unverified layers：
```

## 十一、延伸實作

### 延伸A：Cooldown

完成一次ACTIVE後加入短cooldown，期間拒絕重新start並顯示剩餘條件。Physical STOP不受
cooldown限制。

### 延伸B：Manual override lease

手動override必須有到期時間，超時回safe state。記錄owner、start、expiry與terminal
reason；不得建立永久隱藏override。

### 延伸C：Boot safety

在network、sensor與profile尚未ready時強制safe output，逐一測試開機按住START、broker
離線、sensor缺失及brownout後restart。

### 延伸D：Automated reconstruction test

建立host-only script依序建立venv、安裝、pytest、啟動Backend及API smoke test。Script不得
寫入真實secret，也不能聲稱涵蓋target hardware。

## 十二、Repository參考

- [Course Backend README](../../examples/course_backend/README.md)
- [Backend environment example](../../examples/course_backend/.env.example)
- [Device secrets example](../../examples/device_secrets.example.h)
- [Backend host tests](../../examples/course_backend/tests/test_api.py)
- [Week 12 MQTT主教材](../Week_12_MQTT_Database_and_Logs/week12_main.md)
- [Week 14 Mobile主教材](../Week_14_Mobile_PWA/week14_main.md)
