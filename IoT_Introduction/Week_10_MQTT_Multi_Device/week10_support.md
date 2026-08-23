# Week 10支援資料

本檔提供版本紀錄、topic與payload工作表、多裝置矩陣、broker／bridge故障表及延伸
實作。核心流程見[Week 10主教材](week10_main.md)。

## 一、課前軟體與版本紀錄

| 項目 | 取得方式 | 實際版本／路徑 | 開始條件 |
|---|---|---|---|
| Eclipse Mosquitto | `mosquitto.exe -h`首行 |  | broker、pub、sub三個程式存在 |
| Python | `python --version` |  | Week 6環境可用 |
| paho-mqtt | `python -m pip show paho-mqtt` |  | course backend環境已安裝 |
| PubSubClient | Arduino Library Manager |  | 課程驗證版本2.8.0 |
| ArduinoJson | Arduino Library Manager |  | Week 6相同版本 |
| ESP32 board package | Boards Manager |  | Week 6相同版本 |
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
- Week 3-5 profile來源：
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

沿用Week 3 DHT11 profile，發布`temperature_sample`與`humidity_sample`。保留最小取樣
間隔、無效值與reason；不可為了MQTT畫面更新而過度取樣。

### 延伸B：群組監看而非群組控制

建立`course/+/telemetry`監看頁，允許同時看所有裝置；commands仍必須精確指定裝置，
不可使用wildcard控制。

### 延伸C：比較HTTP與MQTT

用同一筆KY-018事件比較Week 6 HTTP POST與Week 10 MQTT publish的sender、receiver、
routing、response／ack、offline行為。結論須由實驗證據支持，不只列名詞。

### 延伸D：Presence時間過期

在前台除了online/offline，再顯示Backend最後收到presence的時間。設計「多久未更新視為
stale」的規則，並區分stale與broker明確發布offline。

## 十一、參考資料

- [Eclipse Mosquitto官方下載](https://mosquitto.org/download/)
- [PubSubClient官方repository與限制](https://github.com/knolleary/pubsubclient)
- [課程MQTT bridge](../../examples/course_backend/mqtt_bridge.py)
- [課程Backend執行說明](../../examples/course_backend/README.md)
- [Week 6主教材](../Week_06_HTTP_WebSocket_Backend/week6_main.md)
