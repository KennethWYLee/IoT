# Week 11：Database、Historical API、Structured Log與Analysis

日期：2026-11-18

本章使用Week 6與Week 10已能產生的真實事件與命令，學習如何把「現在看到的狀態」
變成「之後仍可查詢、比較與重建的證據」。學生會讀取SQLite schema、依裝置／事件／
時間查詢歷史資料、計算有效與無效事件及命令結果，最後以structured log重建一次失敗。

## 一、Unit Overview

### 教學目標

完成本單元後，學生應能：

1. 區分暫時的介面狀態（transient interface state）、已儲存的歷史紀錄（historical record）、裝置時間（device time）、伺服器時間（server time）與程式運作紀錄（process log）。
2. 判讀課程SQLite資料庫結構（SQLite schema），包括鍵（key）、欄位（column）、資料型別（data type）、允許空值的欄位（nullable field）、索引（index），以及事件（event）與命令（command）的關係。
3. 透過具有輸入驗證的應用程式介面（API），依裝置、事件類型、狀態與時間範圍查詢歷史事件及命令。
4. 計算並解釋事件、無效資料（invalid data）、裝置與命令狀態的數量，不將缺值（missing）或遭拒資料（rejected data）當成成功量測。
5. 使用結構化紀錄（structured log）及穩定的事件或命令識別碼（identifier），重建一次成功流程與一次失敗流程。
6. 收集足以重現故障的操作證據，同時保護認證資料（credential）與個人資料（personal information）。

### 教學內容

本單元發展課程物聯網系統（IoT system）的持久化儲存（persistence）與可觀測性（observability）。學生會檢視已驗證的裝置事件（device event）及命令生命週期（command lifecycle）如何存入SQLite資料庫（SQLite database），比較直接檢查資料庫與歷史查詢介面（historical API）的結果，並在統計數量時保留有效性與失敗狀態的意思。結構化紀錄（structured log）將請求（request）、驗證決策（validation decision）、資料庫紀錄（database record）及命令結果（command result）串成可重建的順序。本單元也區分伺服器記錄時間（server-recorded time）與裝置運行時間（device uptime），並運用資料最小化（data minimization）原則，避免為了診斷而收集機密或不必要的個人資料。

## 二、即時畫面、Database與Log不是同一件事

```text
手機目前畫面：使用者現在看到什麼
Historical API：Backend允許查詢哪些已保存資料
SQLite Database：資料以哪些table、column與row保存
Structured log：程式在何時做了什麼判斷與處理
```

**Database（資料庫）**保存結構化row（列）。關閉瀏覽器或重新啟動Backend後，已提交的
SQLite資料仍存在。**log（日誌）**按執行順序記錄程式行為，用來理解請求為何成功、
被拒絕或失敗；log不一定等於正式歷史資料，也不能取代database schema。

本週範例使用**SQLite**：database存在單一檔案`runtime/iot_course.db`，適合本機課堂
原型。這不代表所有正式IoT系統都應使用SQLite；多人寫入、備援、遠端部署與大量資料
需要另外評估。

## 三、開始狀態與資料責任

### 必要環境

- Week 10的ESP32、KY-018、START、STOP及RGB可正常產生真實資料。
- `examples/course_backend`的Python`.venv`已安裝requirements。
- Backend可啟動，手機可看到Events與Commands。
- 若使用MQTT路徑，broker與`mqtt_bridge.py`也要啟動；若只重現Week 6 HTTP路徑，
  可不啟動broker。

### Database與log不得保存

- Wi-Fi密碼、broker密碼、operator key、API token。
- 姓名、學號、電話、電子郵件等本實驗不需要的個資。
- 完整HTTP authorization header或完整request body中的秘密。
- 無限制的高頻感測值；本週KY-018仍維持合理取樣間隔。

`device_id`使用課程代號，不含個資。錯誤log只記「權限不足」，不能把學生輸入的key
印出來作為除錯方式。

## 四、啟動可觀察的Backend

PowerShell進入`examples/course_backend`。先確認資料檔路徑：

```powershell
Get-Location
Test-Path .\runtime\iot_course.db
```

第一次使用時database不存在是正常的，Backend啟動會建立。設定臨時operator key，並把
畫面輸出同時保存成log：

```powershell
.\.venv\Scripts\Activate.ps1
$env:IOT_OPERATOR_KEY="replace-with-your-temporary-classroom-key"
python -m uvicorn app:app --host 0.0.0.0 --port 8000 2>&1 |
  Tee-Object -FilePath .\runtime\week11_backend.log
```

**structured log（結構化日誌）**是一行一個具有固定欄位的JSON object，例如：

```json
{"timestamp":"2026-11-18T02:10:00+00:00","action":"event_created","event_id":21,"device_id":"team03-device01","event_type":"light_sample","valid":true,"reason":"within_profile"}
```

固定欄位使程式能篩選`action`、`device_id`或`command_id`；自然語句「剛才好像有收到」
無法提供同等查詢能力。Uvicorn本身的啟動與access log可能不是JSON，因此本週log檔是
「包含structured records的程序log」，不能假稱整個檔案都是純JSONL。

## 五、建立一組已知資料

分析前先建立可說明來源的小型dataset（資料集），不要直接對一堆舊資料猜測。

1. 手機或Backend頁面Device ID填成自己的ESP32 ID。
2. 讓KY-018在一般光線下至少送出五筆有效`light_sample`。
3. 以遮光或照明方式安全改變環境，再送五筆；不拆帶電signal線製造變化。
4. 按START一次、STOP一次、reset一次。
5. 送一筆ERROR狀態中的`start`，取得`rejected`。
6. 記錄開始與結束時間、device ID，以及預期事件數。資料來源表放在
   [Week 11支援資料](../../../IoT_Introduction/Week_12_MQTT_Database_and_Logs/week12_support.md#db-二已知資料集紀錄表)。

若本週實機暫時無法運作，可以使用Week 10已保存的真實資料練習query，但必須標示資料
產生日期與來源；host test資料不得偽裝成physical target data。

## 六、讀取SQLite Schema

**schema（綱要）**定義table、column、資料型態與限制。**table（資料表）**保存同類資料；
**row**是一筆資料；**column（欄位）**表示每筆資料的某個屬性。

保持Backend執行，另開PowerShell進入相同資料夾：

```powershell
.\.venv\Scripts\Activate.ps1
python inspect_db.py schema
```

`inspect_db.py`以read-only mode開啟database，不修改row。輸出應包含`events`與
`commands`兩個table。

### 6.1 Events table

| Column | 意義 | 為何存在 |
|---|---|---|
| `id` | Backend產生的整數primary key | 唯一辨認一筆事件 |
| `device_id` | 來源裝置 | 依裝置查詢 |
| `event_type` | 事件種類 | 區分light、button、presence等 |
| `value_json` | JSON編碼後的值 | 可保存數字、文字或null |
| `unit` | 值的單位 | 避免`321`失去意義 |
| `state` | 當時裝置狀態 | 解釋事件背景 |
| `valid` | 感測資料是否有效 | 無效值仍可保存供診斷 |
| `reason` | 有效／無效判斷原因 | 使判斷可追蹤 |
| `uptime_ms` | 裝置開機後毫秒 | 觀察裝置內相對順序 |
| `device_timestamp` | 裝置提供且含timezone offset的ISO 8601時間，可為null | 只有裝置真的校時才使用 |
| `recorded_at` | Backend收到時的UTC時間 | 歷史範圍查詢基準 |

**primary key（主鍵）**是table中唯一辨認row的欄位。`id`不是感測值，也不是裝置ID。
**nullable**表示欄位可為空；例如未做可靠校時時，`device_timestamp`保持null比填入假日期
更正確。已校時的裝置也必須附`Z`或`+08:00`等timezone offset；沒有offset時Backend回422。
建立event時，client送出的JSON欄位名是`timestamp`；Backend驗證後，在API response與
SQLite中使用`device_timestamp`保存它。這個欄位名稱轉換不能和Backend產生的
`recorded_at`混為同一時間來源。

### 6.2 Commands table

`command_id`是命令primary key；`device_id`是目標；`command`與`parameters_json`描述
要求；`status`從requested變成accepted，再到done／error／timeout／rejected；
`requested_at`與`completed_at`保存生命週期。accepted尚未完成，因此`completed_at`
可以是null。

### 6.3 Index

**index（索引）**是database為常用查詢建立的搜尋結構。本範例對device/time、
event type/time及command device/status建立index。index加速查詢，但會占空間並增加寫入
成本；不因「可能有用」就替每個column建立index。

## 七、直接檢視Database Row

讀取最近十筆事件：

```powershell
python inspect_db.py events --limit 10
```

只看自己的裝置與KY-018：

```powershell
python inspect_db.py events --device <your-device-id> --type light_sample --limit 20
```

讀命令及只看被拒絕的命令：

```powershell
python inspect_db.py commands --device <your-device-id> --limit 20
python inspect_db.py commands --device <your-device-id> --status rejected --limit 20
```

完成條件：從一筆row指出「誰、發生什麼、值與單位、是否有效、原因、裝置相對時間、
Backend接收時間」。如果欄位為null，要說明是允許缺少、尚未完成，還是資料來源未提供。

## 八、使用Historical API

直接讀database適合開發者檢查；手機與其他程式應透過Backend API取得經限制與驗證的資料，
不共用database檔案。

### 8.1 依裝置與事件種類查詢

```powershell
$base = "http://127.0.0.1:8000"
$device = "<your-device-id>"
Invoke-RestMethod "$base/api/events?device_id=$device&event_type=light_sample&limit=20" |
  ConvertTo-Json -Depth 6
```

正常回傳JSON array；沒有符合資料時回空array`[]`，不是伺服器錯誤。
`since`與`until`必須是含timezone的ISO 8601時間，而且`since`不可晚於`until`；
格式錯誤、缺少timezone或範圍顛倒時Backend回422，不把錯誤filter當成空資料。

### 8.2 依UTC時間範圍查詢

**UTC**是跨裝置交換時間常用的共同基準。`recorded_at`由Backend產生並含timezone offset。
查詢最近十分鐘：

```powershell
$since = (Get-Date).ToUniversalTime().AddMinutes(-10).ToString("o")
$encodedSince = [uri]::EscapeDataString($since)
Invoke-RestMethod "$base/api/events?device_id=$device&since=$encodedSince&limit=200" |
  ConvertTo-Json -Depth 6
```

`uptime_ms`不能直接轉成今天幾點；ESP32重新開機後它會從小值重新開始。若看到uptime突然
變小但`recorded_at`繼續增加，可推測裝置曾restart，但必須再用boot log或presence佐證。

### 8.3 查詢命令生命週期

```powershell
Invoke-RestMethod "$base/api/commands?device_id=$device&limit=20" |
  ConvertTo-Json -Depth 6
```

選一個`command_id`，把requested、accepted與terminal result的log對齊。Database只保留
目前status，因此完整中間過程要由structured log補充；這正是database與log分工。

## 九、統計與解讀

### 9.1 API統計

```powershell
Invoke-RestMethod "$base/api/stats?device_id=$device" | ConvertTo-Json -Depth 6
```

輸出包含event count、invalid event count、event types、command count與command statuses。
也可直接執行read-only summary：

```powershell
python inspect_db.py summary
```

### 9.2 不能混淆的三種「無效」

1. `valid=false`：格式正確、已保存，但裝置判定感測值不可信。
2. HTTP `422`：request欄位不符合API，Backend拒絕，沒有新增event row。
3. 沒有資料：裝置未送、網路中斷、filter不符或時間範圍錯誤，不能自動推論為0。

### 9.3 核心分析

從自己的已知dataset回答並附query：

- 兩種光線條件各有多少筆有效sample？
- invalid比例是多少？分母與分子各是什麼？
- 哪些command到達done，哪些rejected？
- 是否有requested或accepted後沒有terminal status？若有，它代表哪一段待查？
- `recorded_at`順序與`uptime_ms`順序是否一致？若不一致，需要哪項證據才能解釋？

只報百分比不算完成；必須寫出query條件、筆數、資料時間範圍與解讀限制。

## 十、以Structured Log重建一次失敗

### 10.1 製造可控制的422

使用不會被ESP32或bridge持續寫入的專用device ID，先記錄該ID目前event count，再送一筆
`uptime_ms=-1`的無效request：

```powershell
$validationDevice = "host-validation-test"
$before = Invoke-RestMethod "$base/api/stats?device_id=$validationDevice"
$before.event_count

$validationEvent = @{
  device_id = $validationDevice
  event_type = "light_sample"
  value = 123
  unit = "adc_raw"
  valid = $true
  reason = "intentional_validation_test"
  uptime_ms = -1
}
$badBody = $validationEvent | ConvertTo-Json

try {
  Invoke-RestMethod -Method Post -Uri "$base/api/events" `
    -ContentType application/json -Body $badBody
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

預期status為422，Backend log出現`request_validation_failed`、path與欄位錯誤，但不印
Wi-Fi或operator秘密。再次查event count，必須沒有因這筆request增加：

```powershell
$afterReject = Invoke-RestMethod "$base/api/stats?device_id=$validationDevice"
$afterReject.event_count
```

接著只修正違反規則的欄位，再送出同一筆資料：

```powershell
$validationEvent.uptime_ms = 1234
$correctBody = $validationEvent | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "$base/api/events" `
  -ContentType application/json -Body $correctBody
$created

$afterCreate = Invoke-RestMethod "$base/api/stats?device_id=$validationDevice"
$afterCreate.event_count
```

`afterReject.event_count`應等於`before.event_count`；`afterCreate.event_count`應只增加1。
若不同，先確認三次stats使用相同device ID，且沒有其他程序使用這個專用ID，不刪除row
去配合預期值。

### 10.2 重建順序

依序記錄：

1. client在何時、對哪個path送出request；
2. HTTP status；
3. structured log的action與欄位錯誤；
4. database count前後差異；
5. 根因：`uptime_ms`違反非負整數規則；
6. 修正後同一資料改成合理非負值，再送一次取得201；
7. 新event ID與recorded time。

這是一個**可重現、可定位、可修正、可驗證復原**的故障描述。只寫「JSON錯了」不足。

## 十一、Schema Migration的基本判斷

**migration（資料庫遷移）**是在保留既有資料的前提下調整schema。本範例`init_db()`先
`CREATE TABLE IF NOT EXISTS`，再以`ensure_column()`檢查舊database是否缺少新column；
重複啟動不應重複新增相同column，這稱為idempotent（重複執行仍得到相同結構結果）。

本週不直接修改正式database schema。完成下列read-only觀察：

1. 執行`python inspect_db.py schema`保存第一次輸出。
2. 正常停止並重新啟動Backend。
3. 再執行schema，確認column沒有重複、既有event row仍可查詢。
4. 記錄「重新啟動驗證」；不能把它誤稱成完整migration test，因為沒有建立舊版fixture。

## 十二、練習

### 練習1：設計一個可驗證的filter

選一個device與event type，先預測筆數，再用API與`inspect_db.py`各查一次。若結果不同，
比較limit、排序、時間範圍及資料解碼，不手動改row。

### 練習2：找出未完成命令

查status為requested或accepted的命令，選一筆從Backend log往前後追蹤。若沒有未完成命令，
停止ESP32後建立一筆測試命令，觀察requested，再重新上線完成或明確標為測試未執行。

### 練習3：資料最小化

檢查自己的event、command與log欄位，列出「完成故障重建真正需要」與「不需要且不應保存」
的資料各三項，說明理由。

## 十三、繳交內容與完成條件

繳交：database檔路徑與備份策略說明（不提交runtime database）、events／commands schema、
已知資料集來源、三種historical query、stats結果與解讀、一次成功command trace、一次422
完整重建、重新啟動後schema與資料仍存在的證據，以及秘密／個資檢查。

- [ ] Events與commands的key、column、nullable欄位與時間來源可正確解釋。
- [ ] 真實ESP32資料可由API依device、event type及時間範圍查詢。
- [ ] API與read-only database查詢在相同條件下可對照。
- [ ] 統計保留valid、status與時間範圍，不把缺資料當0。
- [ ] 一筆command可由ID連結request、log、database status及實體結果。
- [ ] 422 request未入庫，修正後201入庫，count前後證據完整。
- [ ] Database重新啟動後schema未重複、既有row仍存在。
- [ ] Database與log不含password、key、token或不必要個資。
- [ ] Host query與physical data來源分別標示，未做的測試不宣稱通過。

結束時以`Ctrl+C`正常停止bridge與Backend，不在Backend執行時搬移database。`runtime`
資料不提交Git；只提交遮蔽秘密的schema、query、統計及重建紀錄。詳細表格與延伸題見
[Week 11支援資料](../../../IoT_Introduction/Week_12_MQTT_Database_and_Logs/week12_support.md)。
