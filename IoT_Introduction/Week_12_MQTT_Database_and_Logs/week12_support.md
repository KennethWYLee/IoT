# Week 12支援資料

本檔提供版本紀錄、topic與payload工作表、多裝置矩陣、broker／bridge故障表及延伸
實作。核心流程見[Week 12主教材](week12_main.md)。

## 一、課前軟體與版本紀錄

| 項目 | 取得方式 | 實際版本／路徑 | 開始條件 |
|---|---|---|---|
| Eclipse Mosquitto | `mosquitto.exe -h`首行 |  | broker、pub、sub三個程式存在 |
| Python | `python --version` |  | Week 11環境可用 |
| paho-mqtt | `python -m pip show paho-mqtt` |  | course backend環境已安裝 |
| PubSubClient | Arduino Library Manager |  | 課程驗證版本2.8.0 |
| ArduinoJson | Arduino Library Manager |  | Week 11相同版本 |
| ESP32 board package | Boards Manager |  | Week 11相同版本 |
| Backend tests | `python -m pytest -q` |  | host test結果已記錄 |

安裝路徑不同不代表錯誤；教材命令中的路徑必須換成自己的實際路徑。不要在同一次
故障排除中同時升級broker、Arduino library與board package。

## 二、Topic與Payload唯一規格表

| 用途 | Topic | Publisher | Subscriber | 必要JSON欄位 | Retained |
|---|---|---|---|---|---|
| Presence | `course/<id>/presence` | ESP32／broker Last Will | bridge、monitor | device_id、event_type、value、state、valid、reason；Will的uptime可為空 | 是 |
| Telemetry | `course/<id>/telemetry` | ESP32 | bridge、monitor | device_id、event_type、value、unit、valid、reason、uptime_ms | 否 |
| Event | `course/<id>/events` | ESP32 | bridge、monitor | device_id、event_type、value、unit、state、valid、reason、uptime_ms | 否 |
| Command | `course/<id>/commands` | bridge | 目標ESP32 | device_id、command_id、command、parameters | **否** |
| Ack／result | `course/<id>/acks` | ESP32 | bridge、monitor | device_id、Backend產生的UUID command_id、result、message | 否 |

### 自己的Topic展開表

```text
DEVICE_ID：________________________________
Telemetry：course/________________/telemetry
Events：   course/________________/events
Presence： course/________________/presence
Commands： course/________________/commands
Acks：     course/________________/acks
```

禁止的ID例子及原因：

| 例子 | 問題 |
|---|---|
| `王小明` | 含個資 |
| `team 3` | 含空白，容易在命令與topic中不一致 |
| `team3/device1` | `/`會改變topic階層 |
| `team+` | `+`是subscription wildcard |
| `#3` | `#`是多層wildcard |

## 三、訊息觀察表

### Presence

| 裝置 | 訂閱開始時間 | 連線方式 | value | reason | retained立即收到 | 結論 |
|---|---|---|---|---|---|---|
| A |  | 正常上線 | online |  |  |  |
| A |  | 拔USB | offline |  |  |  |
| B |  | 正常上線 | online |  |  |  |

### Telemetry取樣

| device_id | topic | raw value | unit | valid | reason | uptime_ms | Backend event id |
|---|---|---:|---|---|---|---:|---:|
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

若topic中的ID與payload不同、event type含不支援字元，或ack的command ID不是Backend
產生的UUID，bridge應拒絕。不要手動改database讓錯誤資料看似成功。

### Command與Ack

| command_id | device | command | publish topic | accepted | terminal result | physical result | duplicate result |
|---|---|---|---|---|---|---|---|
|  |  | start |  |  |  |  |  |
|  |  | stop |  |  |  |  |  |
|  |  | unknown |  |  |  |  |  |

## 四、多裝置隔離矩陣

| 測試 | Topic target | Payload ID | A應反應 | B應反應 | A實際 | B實際 | 結論 |
|---|---|---|---|---|---|---|---|
| 正確控制A | A | A | 執行並ack | 不變 |  |  |  |
| 正確控制B | B | B | 不變 | 執行並ack |  |  |  |
| Topic／payload不一致 | A | B | 拒絕 | 不變 |  |  |  |
| 不存在裝置 | C | C | 不變 | 不變 |  |  |  |
| 相同command ID重送A | A | A | 不重做動作 | 不變 |  |  |  |

「A、B都收到subscriber畫面的資料」不代表兩片都執行命令。實體反應、Serial log與ack
三項都要觀察。

## 五、Broker與Bridge程序地圖

建議在各PowerShell標題前人工加上A～E標籤，避免把命令輸入錯誤視窗：

| 視窗 | 程序 | 保持執行時的正常輸出 | 停止方式 |
|---|---|---|---|
| A | Mosquitto broker | connection、subscribe、publish log | `Ctrl+C` |
| B | `mosquitto_sub` monitor | topic與payload | `Ctrl+C` |
| C | 手動`mosquitto_pub` | 成功時通常立即結束 | 不需常駐 |
| D | FastAPI Backend | request與structured log | `Ctrl+C` |
| E | `mqtt_bridge.py` | connected、forwarded、command published | `Ctrl+C` |

若E停止但A仍收到資料，表示ESP32到broker正常，故障在bridge以後；若A完全沒有ESP32
connection，先查Wi-Fi／broker，不查database。

## 六、故障排查表

| 症狀 | 層次 | 第一個檢查 | 正常基準 | 安全復原 |
|---|---|---|---|---|
| Broker啟動後立即關閉 | broker config | 讀第一個error行 | 顯示listener 1883 | 修正路徑／port，不改ESP32 |
| `Address already in use` | broker process | 查是否已有broker視窗 | 只有一個listener | 停止重複程序，不殺未知服務 |
| `not authorised` | authentication | 核對username與密碼檔 | client connected | 重新輸入密碼，不截圖 |
| ESP32 MQTT state負值 | MQTT connection | 記錄state數字與broker log | connected=true | 核對host、port、帳密 |
| ESP32有Wi-Fi但broker無連線 | network/broker | 比對MQTT_HOST與筆電LAN IP | broker看到client ID | 查private firewall |
| Presence online但無telemetry | device/profile | 拔USB後核對DRY_RUN與KY-018 | 每2秒一筆 | 不先改broker |
| Bridge rejected | validation | 讀error與原topic | topic/payload ID一致 | 修正publisher，不繞過驗證 |
| Broker有資料，Backend沒有 | bridge/API | 看E是否connected | mqtt_forwarded | 啟動Backend再bridge |
| 命令停requested | relay | 看bridge command published | topic為目標ID | 查E與broker |
| 有command topic但裝置不動 | subscriber/validation | 看ESP32 reject reason | 訂閱自己的topic | 核對payload欄位 |
| 兩片都執行 | topic isolation | 查訂閱topic | 僅自己的commands | 移除wildcard command訂閱 |
| 重連後執行舊命令 | retained command | 檢查command是否retain | command retain=false | 清除retained舊值並修publisher |
| 拔USB沒有offline | Last Will | 等待keepalive後看broker | retained offline | 核對connect的will topic |
| Broker離線後STOP無反應或過慢 | local safety | 拔USB | STOP不依賴MQTT；延遲在實測上限內 | 移除無限重連，設定socket timeout；高功率另設獨立停止 |

清除意外retained command時，必須指定**確切topic**發布零長度retained payload；先讓所有
裝置斷電並由教師確認topic，避免誤清除整個課程tree。學生不得對`course/#`做批次刪除。

## 七、故障注入紀錄

| 故障 | 唯一變因 | 預測 | Broker觀察 | ESP32觀察 | Backend觀察 | 復原證據 |
|---|---|---|---|---|---|---|
| Malformed JSON |  |  |  |  |  |  |
| Wrong payload ID |  |  |  |  |  |  |
| Unknown command |  |  |  |  |  |  |
| Broker停止 |  |  |  |  |  |  |
| Bridge停止 |  |  |  |  |  |  |

## 八、秘密與提交前檢查

- [ ] `secrets.h`未被Git追蹤。
- [ ] Mosquitto password file與設定檔不在repository。
- [ ] PowerShell截圖沒有`-P`後方密碼。
- [ ] MQTT password與operator key沒有出現在Serial Monitor。
- [ ] Broker只開private LAN，沒有router port forwarding。
- [ ] DEVICE_ID不含個資。
- [ ] Git diff中沒有真實SSID、host公網位址或密碼。

## 九、Lab Notebook模板

```text
日期／組別／commit：

Host tests：
- Mosquitto local pub/sub：
- Authenticated LAN pub/sub：
- Backend pytest：
- MQTT bridge connected：

Target：
- Board package／libraries：
- DEVICE_ID：
- Week 3、5、7 profile來源：
- Compile：
- Upload：
- Physical telemetry／input／output：

Multi-device：
- A：
- B：
- 正確路由：
- 錯誤路由拒絕：

Presence：
- retained online：
- Last Will offline：
- reconnect：

Command trace：
- command_id：
- requested／accepted／terminal：
- duplicate behavior：

故障與復原：
```

## 十、延伸實作

### 延伸A：DHT11與不同event type

沿用Week 4 DHT11 profile，發布`temperature_sample`與`humidity_sample`。保留最小取樣
間隔、無效值與reason；不可為了MQTT畫面更新而過度取樣。

### 延伸B：群組監看而非群組控制

建立`course/+/telemetry`監看頁，允許同時看所有裝置；commands仍必須精確指定裝置，
不可使用wildcard控制。

### 延伸C：比較HTTP與MQTT

用同一筆KY-018事件比較Week 11 HTTP POST與Week 12 MQTT publish的sender、receiver、
routing、response／ack、offline行為。結論須由實驗證據支持，不只列名詞。

### 延伸D：Presence時間過期

在前台除了online/offline，再顯示Backend最後收到presence的時間。設計「多久未更新視為
stale」的規則，並區分stale與broker明確發布offline。

## 十一、參考資料

- [Eclipse Mosquitto官方下載](https://mosquitto.org/download/)
- [PubSubClient官方repository與限制](https://github.com/knolleary/pubsubclient)
- [課程MQTT bridge](../../examples/course_backend/mqtt_bridge.py)
- [課程Backend執行說明](../../examples/course_backend/README.md)
- [Week 11主教材](../Week_11_HTTP_WebSocket_Backend/week11_main.md)


<a id="database"></a>

## DB 一、資料與時間來源表

| 欄位 | 產生者 | 時鐘／來源 | 可否為null | 正確用途 | 不可做的推論 |
|---|---|---|---|---|---|
| event `id` | Backend／SQLite | 自增整數 | 否 | 唯一辨認row | 不代表裝置時間 |
| `device_id` | ESP32／command client | profile常數 | 否 | 區分裝置 | 不含個資 |
| `uptime_ms` | ESP32 | 開機後單調時間 | 是 | 裝置內相對順序 | 不等於日期時間 |
| `device_timestamp` | ESP32 | 只有可靠校時才填，且含timezone offset | 是 | 裝置觀察時間 | 未校時不可假填；無offset會被拒絕 |
| `recorded_at` | Backend | Server UTC | 否 | 歷史query基準 | 不等於感測瞬間 |
| `requested_at` | Backend | Server UTC | 否 | 命令建立時間 | 不代表裝置收到 |
| `completed_at` | Backend | Server UTC | 是 | terminal result時間 | accepted時可為null |

## DB 二、已知資料集紀錄表

| 項目 | 開始時間UTC | 結束時間UTC | Device ID | 預期筆數 | 實際筆數 | 資料來源／證據 |
|---|---|---|---|---:|---:|---|
| 一般光線sample |  |  |  | 5 |  |  |
| 改變光線sample |  |  |  | 5 |  |  |
| START event |  |  |  | 1 |  |  |
| STOP event |  |  |  | 1 |  |  |
| reset command |  |  |  | 1 |  |  |
| rejected start |  |  |  | 1 |  |  |

實際筆數不同時先檢查取樣週期、開始／結束邊界、重送與filter，不直接刪除「多出來」的row。

## DB 三、Schema閱讀表

### DB Events

| Column | SQLite type | notnull | primary key | 來源 | 一筆實際值 | 解釋 |
|---|---|---:|---:|---|---|---|
| id |  |  |  |  |  |  |
| device_id |  |  |  |  |  |  |
| event_type |  |  |  |  |  |  |
| value_json |  |  |  |  |  |  |
| unit |  |  |  |  |  |  |
| state |  |  |  |  |  |  |
| valid |  |  |  |  |  |  |
| reason |  |  |  |  |  |  |
| uptime_ms |  |  |  |  |  |  |
| device_timestamp |  |  |  |  |  |  |
| recorded_at |  |  |  |  |  |  |

### DB Commands

| Column | SQLite type | notnull | primary key | 來源 | 一筆實際值 | 解釋 |
|---|---|---:|---:|---|---|---|
| command_id |  |  |  |  |  |  |
| device_id |  |  |  |  |  |  |
| command |  |  |  |  |  |  |
| parameters_json |  |  |  |  |  |  |
| status |  |  |  |  |  |  |
| message |  |  |  |  |  |  |
| requested_at |  |  |  |  |  |  |
| completed_at |  |  |  |  |  |  |

## DB 四、Historical Query紀錄

| Query目的 | API path及parameters | 預測筆數 | 回傳筆數 | 第一筆／最後一筆時間 | 結論 |
|---|---|---:|---:|---|---|
| 本裝置最近事件 |  |  |  |  |  |
| 本裝置light sample |  |  |  |  |  |
| 最近十分鐘 |  |  |  |  |  |
| rejected commands |  |  |  |  |  |
| 無符合資料 |  | 0 |  |  |  |

API預設有`limit`與排序。比較API和direct database時，必須讓device、type、status、time
range與limit一致。

## DB 五、統計工作表

```text
分析device：
時間範圍：
query／filter：

全部event數：
valid=true：
valid=false：
valid為null：
invalid比例（分子／分母）：

command總數：
requested：
accepted：
done：
rejected：
error：
timeout：

資料限制：
不能由這組資料回答的問題：
```

### DB 三種「沒有成功資料」比較

| 情況 | HTTP status | 是否新增event row | 應如何呈現 |
|---|---:|---|---|
| 格式正確且valid=true | 201 | 是 | 有效sample |
| 格式正確但valid=false | 201 | 是 | 保存但標示無效及reason |
| 欄位驗證失敗 | 422 | 否 | request error，不是假sample |
| Query無符合資料 | 200 | 否 | 空array，不是value=0 |
| 裝置未送達 | 無event request | 否 | missing／offline，原因待查 |

## DB 六、Command Reconstruction表

| 檢查點 | 時間 | command_id | status／action | device | message／physical evidence |
|---|---|---|---|---|---|
| 手機建立 |  |  | requested |  |  |
| Backend log |  |  | command_created |  |  |
| Device收到 |  |  | accepted |  |  |
| Device決定 |  |  | done／rejected／error |  |  |
| Backend更新 |  |  | command_result |  |  |
| Database row |  |  | terminal status |  |  |
| Mobile WebSocket |  |  | final display |  |  |

若database只有terminal status，accepted的中間狀態應從structured log或ESP32 log取得，不能
自行補一個不存在的database row。

## DB 七、422故障重建表

本表使用主教材指定的`host-validation-test`，避免ESP32持續telemetry改變計數。

| 步驟 | 觀察位置 | 預期 | 實際 | 證據定位 |
|---|---|---|---|---|
| Count before | `/api/stats` | 記錄N |  |  |
| Bad request | client | uptime=-1 |  |  |
| HTTP response | client | 422 |  |  |
| Validation log | Backend | path與欄位規則 |  |  |
| Count after rejection | `/api/stats` | 仍為N |  |  |
| Corrected request | client | non-negative uptime |  |  |
| Correct response | client | 201與event id |  |  |
| Final count | `/api/stats` | N+1 |  |  |

## DB 八、故障排查表

| 症狀 | 第一個檢查 | 最可能層次 | 正常基準 | 下一步 |
|---|---|---|---|---|
| Database不存在 | 看Backend是否至少啟動一次 | initialization | runtime中有db | 啟動Backend，不手建空檔 |
| `database is locked` | 看是否有多個程序使用db | process/database | 一個Backend writer | 正常停止重複程序 |
| Inspect script回error | 讀完整database path | file/path | read-only connect成功 | 核對`IOT_DB_PATH` |
| API有資料，direct query無 | 比較兩者DB path | environment | 指向同一檔案 | 清除錯誤env後重啟 |
| Filter回空array | 移除一個filter重試 | query | 已知資料可查 | 核對ID、type、UTC範圍 |
| Count比預期多 | 查time range與取樣率 | dataset | 已知開始／結束 | 不直接刪row |
| Count比預期少 | 看device／bridge log | transport | 每次POST／forward成功 | 定位缺失層次 |
| `valid`都是null | 查舊資料或sender schema | data quality | 新資料明確true/false | 不把null算false |
| Command停requested | 查device routing | command flow | 有accepted／terminal | 回Week 11／10追蹤 |
| Log找不到command ID | 確認本次log檔與程序 | observability | 同一執行期間 | 不拼湊不同run |
| Log出現秘密 | 立即停止分享 | data protection | 只記denied原因 | 清除／重設秘密並修log |

## DB 九、Database備份與復原原則

本週不提交`runtime/iot_course.db`，也不直接編輯正式row。需要snapshot時：

1. 先以`Ctrl+C`正常停止Backend與bridge。
2. 確認程序停止後，將database**複製**成有日期的snapshot，不搬移原檔。
3. Snapshot放在不提交Git的位置，記錄來源commit與時間。
4. 復原演練使用snapshot副本，不覆寫唯一原檔。
5. 若資料含其他同學裝置ID，分享前先取得授權並最小化資料。

## DB 十、Lab Notebook模板

```text
日期／組別／commit：
Backend資料庫路徑：
Log路徑：

已知資料集：
- 來源硬體：
- device ID：
- UTC範圍：
- 預期／實際筆數：

Schema：
- events key與重要columns：
- commands key與重要columns：
- nullable理由：

Queries：
- by device：
- by type：
- by time：
- command status：

Analysis：
- 計數與範圍：
- invalid定義：
- 限制：

Reconstruction：
- identity：
- sequence：
- root cause：
- correction：
- recovery evidence：

秘密／個資檢查：
```

## DB 十一、延伸實作

### DB 延伸A：歷史折線資料

只使用`valid=true`的`light_sample`，依`recorded_at`排序輸出`time`與`value`array。保留
unit與filter條件；不把無效值靜默轉成0。

### DB 延伸B：Command completion rate

定義terminal status集合及分母，計算done比例。另列requested／accepted未完成筆數，說明
短時間內觀察與長時間stuck command的差異。

### DB 延伸C：Restart推測

找出同device中`uptime_ms`突然變小的位置，再以presence、boot event或Serial log佐證。
沒有第二項證據時只寫「可能restart」，不能寫成確定事實。

### DB 延伸D：Schema migration fixture

在正式database之外建立最小舊版fixture，執行`init_db()`後比較schema與原row。這才可記為
migration host test；不得以重新啟動最新版database取代。

## DB 十二、Repository參考

- [Backend API與schema](../../examples/course_backend/app.py)
- [Read-only database inspector](../../examples/course_backend/inspect_db.py)
- [Backend執行與驗證](../../examples/course_backend/README.md)
- [Backend host tests](../../examples/course_backend/tests/test_api.py)
- [Week 12 MQTT主教材](week12_main.md)
