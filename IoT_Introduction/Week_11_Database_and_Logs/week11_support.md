# Week 11支援資料

本檔提供資料來源、schema、query、統計、command reconstruction與故障紀錄表。核心操作
見[Week 11主教材](week11_main.md)。

## 一、資料與時間來源表

| 欄位 | 產生者 | 時鐘／來源 | 可否為null | 正確用途 | 不可做的推論 |
|---|---|---|---|---|---|
| event `id` | Backend／SQLite | 自增整數 | 否 | 唯一辨認row | 不代表裝置時間 |
| `device_id` | ESP32／command client | profile常數 | 否 | 區分裝置 | 不含個資 |
| `uptime_ms` | ESP32 | 開機後單調時間 | 是 | 裝置內相對順序 | 不等於日期時間 |
| `device_timestamp` | ESP32 | 只有可靠校時才填，且含timezone offset | 是 | 裝置觀察時間 | 未校時不可假填；無offset會被拒絕 |
| `recorded_at` | Backend | Server UTC | 否 | 歷史query基準 | 不等於感測瞬間 |
| `requested_at` | Backend | Server UTC | 否 | 命令建立時間 | 不代表裝置收到 |
| `completed_at` | Backend | Server UTC | 是 | terminal result時間 | accepted時可為null |

## 二、已知資料集紀錄表

| 項目 | 開始時間UTC | 結束時間UTC | Device ID | 預期筆數 | 實際筆數 | 資料來源／證據 |
|---|---|---|---|---:|---:|---|
| 一般光線sample |  |  |  | 5 |  |  |
| 改變光線sample |  |  |  | 5 |  |  |
| START event |  |  |  | 1 |  |  |
| STOP event |  |  |  | 1 |  |  |
| reset command |  |  |  | 1 |  |  |
| rejected start |  |  |  | 1 |  |  |

實際筆數不同時先檢查取樣週期、開始／結束邊界、重送與filter，不直接刪除「多出來」的row。

## 三、Schema閱讀表

### Events

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

### Commands

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

## 四、Historical Query紀錄

| Query目的 | API path及parameters | 預測筆數 | 回傳筆數 | 第一筆／最後一筆時間 | 結論 |
|---|---|---:|---:|---|---|
| 本裝置最近事件 |  |  |  |  |  |
| 本裝置light sample |  |  |  |  |  |
| 最近十分鐘 |  |  |  |  |  |
| rejected commands |  |  |  |  |  |
| 無符合資料 |  | 0 |  |  |  |

API預設有`limit`與排序。比較API和direct database時，必須讓device、type、status、time
range與limit一致。

## 五、統計工作表

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

### 三種「沒有成功資料」比較

| 情況 | HTTP status | 是否新增event row | 應如何呈現 |
|---|---:|---|---|
| 格式正確且valid=true | 201 | 是 | 有效sample |
| 格式正確但valid=false | 201 | 是 | 保存但標示無效及reason |
| 欄位驗證失敗 | 422 | 否 | request error，不是假sample |
| Query無符合資料 | 200 | 否 | 空array，不是value=0 |
| 裝置未送達 | 無event request | 否 | missing／offline，原因待查 |

## 六、Command Reconstruction表

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

## 七、422故障重建表

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

## 八、故障排查表

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
| Command停requested | 查device routing | command flow | 有accepted／terminal | 回Week 6／10追蹤 |
| Log找不到command ID | 確認本次log檔與程序 | observability | 同一執行期間 | 不拼湊不同run |
| Log出現秘密 | 立即停止分享 | data protection | 只記denied原因 | 清除／重設秘密並修log |

## 九、Database備份與復原原則

本週不提交`runtime/iot_course.db`，也不直接編輯正式row。需要snapshot時：

1. 先以`Ctrl+C`正常停止Backend與bridge。
2. 確認程序停止後，將database**複製**成有日期的snapshot，不搬移原檔。
3. Snapshot放在不提交Git的位置，記錄來源commit與時間。
4. 復原演練使用snapshot副本，不覆寫唯一原檔。
5. 若資料含其他同學裝置ID，分享前先取得授權並最小化資料。

## 十、Lab Notebook模板

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

## 十一、延伸實作

### 延伸A：歷史折線資料

只使用`valid=true`的`light_sample`，依`recorded_at`排序輸出`time`與`value`array。保留
unit與filter條件；不把無效值靜默轉成0。

### 延伸B：Command completion rate

定義terminal status集合及分母，計算done比例。另列requested／accepted未完成筆數，說明
短時間內觀察與長時間stuck command的差異。

### 延伸C：Restart推測

找出同device中`uptime_ms`突然變小的位置，再以presence、boot event或Serial log佐證。
沒有第二項證據時只寫「可能restart」，不能寫成確定事實。

### 延伸D：Schema migration fixture

在正式database之外建立最小舊版fixture，執行`init_db()`後比較schema與原row。這才可記為
migration host test；不得以重新啟動最新版database取代。

## 十二、Repository參考

- [Backend API與schema](../../examples/course_backend/app.py)
- [Read-only database inspector](../../examples/course_backend/inspect_db.py)
- [Backend執行與驗證](../../examples/course_backend/README.md)
- [Backend host tests](../../examples/course_backend/tests/test_api.py)
- [Week 10 MQTT主教材](../Week_10_MQTT_Multi_Device/week10_main.md)
