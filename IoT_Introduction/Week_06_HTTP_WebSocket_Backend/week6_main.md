# Week 6：Wi-Fi、HTTP、JSON、WebSocket、Backend與手機雙向控制

日期：2026-10-14

本章把前四週完成的實體按鈕與RGB輸出接到第一個完整網路系統。按下ESP32的
START或STOP後，事件會送到筆電Backend、寫入SQLite，並由WebSocket即時更新
手機畫面；手機送出的`start`、`stop`或`reset`命令則由ESP32接收、判斷、執行，
最後回報結果。實體STOP仍在ESP32本機直接處理，不依賴網路才能生效。

## 一、Unit Overview

### Teaching Objectives

By the end of this unit, students will be able to:

1. Trace an IoT event and command across an ESP32, HTTP API, backend, database,
   WebSocket connection, and mobile browser.
2. Connect an ESP32 to a trusted Wi-Fi network and distinguish a device address,
   server address, port, path, and HTTP status code.
3. Construct and validate JSON events containing a device identity, event type,
   state, validity, reason, and device uptime.
4. Run the course backend, verify it independently, and connect a phone and an
   ESP32 without committing network secrets to Git.
5. Track one remote command from `requested` through `accepted` to a terminal
   result, while preserving a network-independent physical stop.
6. Isolate faults by testing the hardware, Wi-Fi, HTTP, backend, database, and
   browser layers separately.

### Teaching Content

This unit introduces the networked path of a full-stack IoT system. Students will
connect a previously verified physical input and output to a local backend using
Wi-Fi, HTTP, and JSON. The backend validates and stores device events, exposes a
command interface, and uses WebSocket to keep a mobile browser synchronized without
continuous page refreshes. The activity emphasizes observable message flow, stable
device identity, command acknowledgement, local safety behavior, protection of
credentials, and layer-by-layer troubleshooting rather than treating networking as
a single successful or failed connection.

### 可觀察的完整資料流

```text
START／STOP按鈕
      ↓
ESP32事件 → HTTP POST → FastAPI Backend → SQLite
                                      ↓
手機畫面 ← WebSocket即時推送 ←─────────┘

手機命令 → HTTP POST → Backend → ESP32定期HTTP查詢
                                      ↓
手機畫面 ← WebSocket ← 結果POST ← ESP32判斷與安全輸出
```

本週的**Backend（後端）**是在筆電上執行、負責接收資料、驗證請求、保存資料與
管理命令的程式。手機不是直接控制ESP32；所有事件與命令都經過Backend，才能留下
可追蹤紀錄。

## 二、器材、軟體與開始狀態

每位學生使用下列已購材料：

- ESP32-S3-DevKitC-1、USB資料線、400孔麵包板及杜邦線。
- 兩顆四腳按鈕，分別作為START與實體STOP。
- KY-016 RGB LED模組，作為可安全觀察的實體輸出。
- 筆電、手機，以及兩者都能加入的可信任區域網路。

本週不接SG90、蜂鳴器與4AA電池盒。先以USB及低功率RGB完成網路控制，可把網路
錯誤與致動器供電問題分開。第5週實機profile尚未完成者可以先用`DRY_RUN=true`
完成Backend與網路路徑，但不能把它記錄成實體硬體測試通過。

上課開始前須符合：

1. Week 5的START、STOP、RGB GPIO與RGB ON level已有實機紀錄。
2. Arduino IDE能對本人的ESP32-S3完成Upload及Serial Monitor觀察。
3. 已依[Week 5支援資料的Week 6課前軟體準備](../Week_05_Standalone_Interaction/week5_support.md#十三week-6課前軟體準備)
   確認Git與Python命令可顯示版本；版本記錄於
   [Week 6支援資料](week6_support.md#一課前環境與器材確認)。
4. 本機repository已同步，且`examples/course_backend`存在。

## 三、安全與網路責任

1. 接線、換線與通斷量測前先拔USB；本週不在帶電狀態移動杜邦線。
2. GPIO只作訊號，不直接供應高電流負載。發熱、異味、重複重開機或異常聲音時
   立即拔除USB。
3. 實體STOP必須由ESP32本機直接讀取。Backend停止、Wi-Fi中斷或手機離線時，
   按下STOP仍須使RGB進入安全狀態。
4. 僅使用教師允許的可信任LAN（Local Area Network，區域網路）。不要設定路由器
   port forwarding，也不要把本週服務公開到Internet。
5. Wi-Fi密碼與operator key不得寫入`.ino`、Markdown、截圖或Git。教材中的值都是
   placeholder（待替換範例），不可當成真實密碼。
6. 手機顯示「命令已送出」只代表Backend收到請求，不代表硬體已動作；必須看到
   相同`command_id`的最終`done`、`error`、`timeout`或`rejected`。

本週範例使用同步HTTP request，單次timeout上限為1.2至1.5秒；request進行期間，`loop()`
無法重新讀取按鈕。因此「本機STOP」代表不需要Backend回應才能改變本機RGB，不代表它是
機械或高功率負載可用的緊急停止。若專題有舵機、馬達或其他危險動作，必須另設不受網路
request阻塞的停止與斷電路徑，並實測最壞停止時間。

## 四、先辨認網路地址，不先接ESP32

### 4.1 IP、port與URL

**IP address（IP位址）**用來辨認LAN中的一台裝置。筆電可能顯示多個位址；本週要找
與手機、ESP32位於同一個Wi-Fi網路的IPv4，例如`192.168.x.x`或`10.x.x.x`。

**port（連接埠）**用來辨認同一台電腦上的特定服務。本週Backend使用`8000`。
以下URL（Uniform Resource Locator，資源位址）可拆成：

```text
http://192.168.1.23:8000/api/events
│      │              │    └─ path：Backend中的資源路徑
│      │              └────── port：8000
│      └───────────────────── host：筆電IP
└──────────────────────────── protocol：HTTP
```

`127.0.0.1`與`localhost`都代表「目前這台電腦自己」。手機上的`127.0.0.1`
代表手機，不是筆電，因此手機與ESP32都必須使用筆電的LAN IPv4。

### 4.2 取得筆電LAN IPv4

1. 筆電先連入本週使用的Wi-Fi。
2. 開啟PowerShell，輸入：

```powershell
ipconfig
```

3. 找到目前正在使用的Wireless LAN adapter；不要抄未連線adapter、Bluetooth、
   VPN或Virtual Machine介面。
4. 記錄`IPv4 Address`，再填入支援資料的網路身分表。
5. 若無法判斷，暫時關閉VPN後重新執行`ipconfig`，但不要任意停用學校管理的安全軟體。

完成條件：能指出「Backend主機IP」與「ESP32取得的IP」是兩個不同位址，並能說明
手機為何不能使用`127.0.0.1`連筆電。

## 五、啟動並單獨驗證Backend

### 5.1 建立隔離的Python環境

1. 開啟repository資料夾。
2. 進入`examples/course_backend`。
3. 在資料夾空白處按右鍵選擇**Open in Terminal**；若選單不同，也可先開PowerShell
   再以`cd`進入該資料夾。
4. 逐行執行：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

**virtual environment（虛擬環境）**是專屬於此範例的Python套件空間，資料夾名稱為
`.venv`。它避免本課套件和其他專案互相影響；`.venv`不提交Git。

正常結果：命令列前方可能出現`(.venv)`，安裝最後沒有紅色`ERROR`。若PowerShell
阻擋啟用，不要更改整台電腦的安全原則；改執行：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 5.2 設定operator key並啟動服務

**operator key（操作權限金鑰）**是Backend用來判斷某個瀏覽器是否能建立控制命令的
臨時字串。本週只把它設定在目前PowerShell process（程序）的環境變數，不寫入檔案。
本週手機LAN網址使用HTTP，傳輸本身沒有TLS加密，因此這個臨時key不能當作正式系統的
帳號安全。只在教師核准的隔離課堂網路與低功率輸出中使用，下課停止Backend後立即作廢；
不得沿用到公開網路或真實設備。

```powershell
$env:IOT_OPERATOR_KEY="replace-with-your-temporary-classroom-key"
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

若未啟用`.venv`，第二行改為：

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000
```

正常結果包含`Uvicorn running on http://0.0.0.0:8000`。`0.0.0.0`表示服務接受
本機各網路介面的連線，它不是手機要輸入的目的位址。

Windows Firewall若詢問是否允許Python接收連線，只勾選本週可信任的private network；
不勾public network。完成本週後以`Ctrl+C`停止Backend。

### 5.3 先用筆電製造一筆host test事件

另開一個PowerShell視窗，在不連ESP32的狀態執行：

```powershell
$eventBody = @{
  device_id = "host-test"
  event_type = "button_pressed"
  value = 1
  unit = "pressed"
  state = "active"
  valid = $true
  reason = "host_test"
  uptime_ms = 1234
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/events `
  -ContentType application/json -Body $eventBody
```

**HTTP request（HTTP請求）**是client送給server的動作。本例使用`POST`，表示送出
一筆新事件。**HTTP response（HTTP回應）**是server處理後傳回的狀態與資料。
正常應看到事件`id`與`recorded_at`，Backend終端機也應出現JSON格式log。

開啟`http://127.0.0.1:8000`，確認Events表中出現`host-test`。這一步只證明：

- Python程式可啟動；
- HTTP API可接收正確資料；
- SQLite可保存事件；
- 筆電瀏覽器可讀取資料。

它不證明ESP32、手機或Wi-Fi路徑。若失敗，先依
[Week 6分層故障表](week6_support.md#四分層故障排查表)修正，不能先改ESP32程式。

## 六、理解JSON事件與命令狀態

**JSON（JavaScript Object Notation）**以欄位名稱和值表示結構化資料。它不是任意句子；
欄位拼字、型別與括號都必須符合介面約定。一筆裝置事件如下：

```json
{
  "device_id": "team03-device01",
  "event_type": "start_pressed",
  "value": 1,
  "unit": "pressed",
  "state": "active",
  "valid": true,
  "reason": "physical_input",
  "uptime_ms": 18420
}
```

- `device_id`：穩定辨認一片裝置，不使用人名或學號。
- `event_type`：發生什麼事件，使用一致的小寫名稱。
- `value`與`unit`：數值及意義；按鈕的`1 pressed`不同於感測器的原始值。
- `state`：事件發生後的裝置狀態。
- `valid`與`reason`：資料是否可信，以及判斷原因。
- `uptime_ms`：ESP32從本次開機後經過的毫秒數，不是假裝成網路校時日期。

手機命令依序經過：

```text
requested → accepted → done
                     ↘ error／timeout／rejected
```

`accepted`只代表ESP32收到命令；`done`才代表命令已完成。本週Backend為每筆命令產生
唯一的`command_id`，之後的回報必須使用同一個ID。

## 七、建立ESP32網路程式

### 7.1 建立不提交Git的`secrets.h`

在Arduino sketch中新增分頁，命名為`secrets.h`，填入實際Wi-Fi與筆電IP：

```cpp
#pragma once

const char WIFI_SSID[] = "replace-with-wifi-name";
const char WIFI_PASSWORD[] = "replace-with-wifi-password";
const char API_BASE_URL[] = "http://192.168.1.23:8000";
```

最後一行只能換成筆電的LAN IPv4，不加結尾`/`。先確認sketch所在資料夾不在Git追蹤
範圍；若要保存程式到repository，只提交`secrets.example.h`，不要提交`secrets.h`。

### 7.2 貼上完整主程式

以下程式預設`DRY_RUN=true`及所有GPIO為`-1`，因此不會驅動硬體。先完成編譯與網路
測試，再依Week 5實測profile逐項填值；不得從其他同學或網路照片猜GPIO。

```cpp
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "secrets.h"

const char DEVICE_ID[] = "replace-with-team-device-id";

// 只可抄入本人Week 5已驗證的profile。
const bool DRY_RUN = true;
const int PIN_START = -1;
const int PIN_STOP = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;  // 經實測後填HIGH或LOW

enum class DeviceState { IDLE, ACTIVE, ERROR_STATE };
DeviceState state = DeviceState::IDLE;

bool startLastRaw = false;
bool stopLastRaw = false;
bool startStablePressed = false;
bool stopStablePressed = false;
unsigned long startChangedAt = 0;
unsigned long stopChangedAt = 0;
unsigned long lastPollAt = 0;
unsigned long lastWifiAttemptAt = 0;

struct ProcessedCommand {
  String id;
  String result;
  String message;
};
const int PROCESSED_COMMAND_CAPACITY = 8;
ProcessedCommand processedCommands[PROCESSED_COMMAND_CAPACITY];
int nextProcessedCommand = 0;

const unsigned long DEBOUNCE_MS = 35;
const unsigned long COMMAND_POLL_MS = 750;
const unsigned long WIFI_RETRY_MS = 10000;

const char *stateName() {
  switch (state) {
    case DeviceState::IDLE: return "idle";
    case DeviceState::ACTIVE: return "active";
    case DeviceState::ERROR_STATE: return "error";
  }
  return "unknown";
}

bool identifierReady(const char *value) {
  size_t length = strlen(value);
  if (length == 0 || length > 80 || String(value).startsWith("replace-")) return false;
  for (size_t index = 0; index < length; index++) {
    char character = value[index];
    bool allowed = isAlphaNumeric(character) || character == '.' ||
                   character == '_' || character == '-';
    if (!allowed) return false;
  }
  return isAlphaNumeric(value[0]);
}

bool allPinsUnique(const int *pins, size_t count) {
  for (size_t left = 0; left < count; left++)
    for (size_t right = left + 1; right < count; right++)
      if (pins[left] == pins[right]) return false;
  return true;
}

bool profileReady() {
  const int pins[] = {PIN_START, PIN_STOP, PIN_RGB_R, PIN_RGB_G, PIN_RGB_B};
  bool pinsReady = PIN_START >= 0 && PIN_STOP >= 0 &&
                   PIN_RGB_R >= 0 && PIN_RGB_G >= 0 && PIN_RGB_B >= 0;
  bool levelReady = RGB_ON_LEVEL == HIGH || RGB_ON_LEVEL == LOW;
  return pinsReady && allPinsUnique(pins, 5) && levelReady;
}

int rgbOffLevel() {
  return RGB_ON_LEVEL == HIGH ? LOW : HIGH;
}

void setRgb(bool red, bool green, bool blue) {
  if (DRY_RUN || !profileReady()) return;
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : rgbOffLevel());
}

void applySafeOutput() {
  if (state == DeviceState::IDLE) setRgb(false, false, true);
  if (state == DeviceState::ACTIVE) setRgb(false, true, false);
  if (state == DeviceState::ERROR_STATE) setRgb(true, false, false);
}

void enterState(DeviceState next, const char *reason) {
  state = next;
  applySafeOutput();
  Serial.printf("state=%s reason=%s\n", stateName(), reason);
}

bool wifiReady() {
  return WiFi.status() == WL_CONNECTED;
}

void requestWifiConnection() {
  if (wifiReady()) return;
  unsigned long now = millis();
  if (now - lastWifiAttemptAt < WIFI_RETRY_MS && lastWifiAttemptAt != 0) return;
  lastWifiAttemptAt = now;
  Serial.printf("wifi=connecting ssid=%s\n", WIFI_SSID);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

int postJson(const String &path, const String &body) {
  if (!wifiReady()) return -1000;
  WiFiClient networkClient;
  HTTPClient http;
  String url = String(API_BASE_URL) + path;
  if (!http.begin(networkClient, url)) return -1001;
  http.setTimeout(1500);
  http.addHeader("Content-Type", "application/json");
  int statusCode = http.POST(body);
  String response = http.getString();
  Serial.printf("http=POST path=%s status=%d response=%s\n",
                path.c_str(), statusCode, response.c_str());
  http.end();
  return statusCode;
}

bool postEvent(const char *eventType, int value, const char *unit,
               bool valid, const char *reason) {
  JsonDocument document;
  document["device_id"] = DEVICE_ID;
  document["event_type"] = eventType;
  document["value"] = value;
  document["unit"] = unit;
  document["state"] = stateName();
  document["valid"] = valid;
  document["reason"] = reason;
  document["uptime_ms"] = millis();
  String body;
  serializeJson(document, body);
  int code = postJson("/api/events", body);
  return code == 201;
}

bool postCommandResult(const String &commandId, const char *result,
                       const char *message) {
  JsonDocument document;
  document["result"] = result;
  document["message"] = message;
  String body;
  serializeJson(document, body);
  String path = "/api/commands/" + commandId + "/result";
  int code = postJson(path, body);
  return code == 200;
}

bool pressedEvent(int pin, bool &lastRawPressed, bool &stablePressed,
                  unsigned long &changedAt) {
  bool rawPressed = digitalRead(pin) == LOW;  // INPUT_PULLUP：按下時為LOW
  unsigned long now = millis();
  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAt = now;
  }
  if (now - changedAt >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    return stablePressed;
  }
  return false;
}

int findProcessedCommand(const String &commandId) {
  for (int index = 0; index < PROCESSED_COMMAND_CAPACITY; index++) {
    if (processedCommands[index].id == commandId) return index;
  }
  return -1;
}

void rememberTerminalResult(const String &commandId, const char *result,
                            const char *message) {
  processedCommands[nextProcessedCommand] = {commandId, result, message};
  nextProcessedCommand = (nextProcessedCommand + 1) % PROCESSED_COMMAND_CAPACITY;
}

void finishCommand(const String &commandId, const char *result,
                   const char *message) {
  rememberTerminalResult(commandId, result, message);
  postCommandResult(commandId, result, message);
}

void executeCommand(const String &commandId, const String &command) {
  int previousIndex = findProcessedCommand(commandId);
  if (previousIndex >= 0) {
    postCommandResult(commandId,
                      processedCommands[previousIndex].result.c_str(),
                      processedCommands[previousIndex].message.c_str());
    return;
  }
  postCommandResult(commandId, "accepted", "received by device");

  if (command == "stop") {
    enterState(DeviceState::ERROR_STATE, "remote_stop");
    postEvent("remote_stop", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "safe output applied");
    return;
  }

  if (command == "start") {
    if (state == DeviceState::ERROR_STATE) {
      finishCommand(commandId, "rejected", "reset required after error");
      return;
    }
    enterState(DeviceState::ACTIVE, "remote_start");
    postEvent("remote_start", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "active output applied");
    return;
  }

  if (command == "reset") {
    if (!DRY_RUN && stopStablePressed) {
      finishCommand(commandId, "rejected", "release physical stop before reset");
      return;
    }
    enterState(DeviceState::IDLE, "remote_reset");
    postEvent("remote_reset", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "idle output applied");
    return;
  }

  finishCommand(commandId, "rejected", "unknown command");
}

void pollCommand() {
  if (!wifiReady()) return;
  unsigned long now = millis();
  if (now - lastPollAt < COMMAND_POLL_MS) return;
  lastPollAt = now;

  WiFiClient networkClient;
  HTTPClient http;
  String path = "/api/devices/" + String(DEVICE_ID) + "/commands/next";
  String url = String(API_BASE_URL) + path;
  if (!http.begin(networkClient, url)) return;
  http.setTimeout(1200);
  int statusCode = http.GET();

  if (statusCode == 204) {
    http.end();
    return;
  }
  if (statusCode != 200) {
    Serial.printf("http=GET path=%s status=%d\n", path.c_str(), statusCode);
    http.end();
    return;
  }

  String response = http.getString();
  http.end();
  JsonDocument document;
  DeserializationError error = deserializeJson(document, response);
  if (error) {
    Serial.printf("command=parse_error detail=%s\n", error.c_str());
    return;
  }
  String commandId = document["command_id"] | "";
  String command = document["command"] | "";
  if (commandId.length() == 0 || command.length() == 0) {
    Serial.println("command=invalid reason=missing_field");
    return;
  }
  executeCommand(commandId, command);
}

void readPhysicalInputs() {
  if (DRY_RUN || !profileReady()) return;
  bool stopPressedEvent =
    pressedEvent(PIN_STOP, stopLastRaw, stopStablePressed, stopChangedAt);
  bool startPressedEvent =
    pressedEvent(PIN_START, startLastRaw, startStablePressed, startChangedAt);
  // STOP是持續條件；按住時即使收到remote reset，也必須維持ERROR。
  if (stopStablePressed) {
    if (stopPressedEvent || state != DeviceState::ERROR_STATE) {
      enterState(DeviceState::ERROR_STATE, "physical_stop");
      postEvent("stop_pressed", 1, "pressed", true, "physical_input");
    }
    return;
  }
  if (startPressedEvent) {
    if (state == DeviceState::ERROR_STATE) {
      postEvent("start_rejected", 1, "pressed", false, "reset_required");
    } else {
      enterState(DeviceState::ACTIVE, "physical_start");
      postEvent("start_pressed", 1, "pressed", true, "physical_input");
    }
  }
}

void readSerialTestCommand() {
  if (!Serial.available()) return;
  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command == "test-event") {
    postEvent("serial_test", 1, "test", true, "manual_host_path_test");
  } else if (command == "status") {
    Serial.printf("device=%s state=%s wifi=%s ip=%s mode=%s\n",
                  DEVICE_ID, stateName(), wifiReady() ? "connected" : "offline",
                  WiFi.localIP().toString().c_str(), DRY_RUN ? "dry_run" : "hardware");
  } else {
    Serial.printf("serial=unknown value=%s\n", command.c_str());
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(50);
  delay(500);

  if (!identifierReady(DEVICE_ID)) {
    Serial.println("fatal=device_id_missing_or_invalid");
    return;
  }
  if (!DRY_RUN && !profileReady()) {
    Serial.println("fatal=hardware_profile_incomplete");
    return;
  }
  if (!DRY_RUN) {
    pinMode(PIN_START, INPUT_PULLUP);
    pinMode(PIN_STOP, INPUT_PULLUP);
    pinMode(PIN_RGB_R, OUTPUT);
    pinMode(PIN_RGB_G, OUTPUT);
    pinMode(PIN_RGB_B, OUTPUT);
    applySafeOutput();
  }

  WiFi.mode(WIFI_STA);
  requestWifiConnection();
  Serial.printf("week=6 device=%s mode=%s state=%s\n",
                DEVICE_ID, DRY_RUN ? "dry_run" : "hardware", stateName());
}

void loop() {
  readPhysicalInputs();       // 每次loop先讀本機輸入；Backend成功不是STOP前置條件
  requestWifiConnection();
  pollCommand();
  readSerialTestCommand();

  static wl_status_t previousStatus = WL_NO_SHIELD;
  wl_status_t currentStatus = WiFi.status();
  if (currentStatus != previousStatus) {
    previousStatus = currentStatus;
    Serial.printf("wifi_status=%d ip=%s\n", currentStatus,
                  WiFi.localIP().toString().c_str());
  }
  delay(5);
}
```

### 7.3 編譯、Upload與第一個網路事件

1. 在Arduino IDE確認Week 2使用過的相同Board、Port與USB mode設定。
2. 保持`DRY_RUN=true`，確認`DEVICE_ID`不含姓名、學號、空格或斜線。
3. 按**Verify**。編譯成功只證明語法、library及board package可以建立binary。
4. 按**Upload**，開啟**Tools → Serial Monitor**，baud rate選`115200`。
5. 正常先看到`mode=dry_run`，連線後`ip=`不再是`0.0.0.0`。
6. 在Serial Monitor輸入`status`，確認`wifi=connected`且API位址屬同一LAN。
7. 輸入`test-event`。正常應看到HTTP status`201`；手機或筆電Events表新增
   `serial_test`。

常見HTTP status code（狀態碼）：

- `201`：Backend建立了新事件。
- `200`：查詢或結果更新成功。
- `204`：目前沒有等待中的命令；這是正常狀態，不是錯誤。
- `403`：建立命令時缺少正確operator key。
- `409`：命令已經是terminal status，逾時後到達的結果不得覆寫原紀錄。
- `422`：JSON欄位或型別不符合Backend規格。
- 負數：ESP32端未取得HTTP回應，先查Wi-Fi、IP與Backend是否執行。

完成條件：保留Serial的`201`與瀏覽器中同一筆`serial_test`。此時仍記作
`host test + target upload + network dry run`，不能記作實體輸入測試。

## 八、由手機驗證WebSocket

**WebSocket**是瀏覽器與Backend維持的一條雙向連線。HTTP查詢通常是一次request配
一次response；WebSocket連上後，Backend可在事件發生時主動推送更新，不需不停刷新頁面。

1. 手機與筆電連到同一個可信任Wi-Fi；先暫停手機行動數據，避免手機繞到其他網路。
2. 手機瀏覽器輸入`http://<筆電LAN IPv4>:8000`。
3. 頁面頂端應由`connecting`變成`connected`。
4. ESP32 Serial Monitor再輸入`test-event`。
5. 不重新整理手機頁面，確認Events立即新增資料。
6. 關閉Backend，觀察頁面變成disconnected或offline；重新啟動後等待自動重連。

這個步驟驗證的是`ESP32 → HTTP → Backend → WebSocket → 手機`。FastAPI的WebSocket
介面原理可參考[FastAPI官方WebSocket文件](https://fastapi.tiangolo.com/advanced/websockets/)。

## 九、啟用實體START、STOP與RGB

只有Week 5 profile與本週接線檢查完成時才進行：

1. 拔除USB。
2. 依Week 5接線表重建START、STOP、KY-016 RGB與共地；不接SG90、蜂鳴器、
   電池盒或其他負載。
3. 從ESP32沿線檢查到模組，再從模組反向檢查回ESP32。確認沒有5V進入GPIO。
4. 把程式的四組GPIO、`RGB_ON_LEVEL`改成自己的實測profile，再把
   `DRY_RUN=false`。
5. Verify成功後才Upload。接回USB時手指不要壓住任何按鈕。
6. 開機正常為IDLE，RGB顯示profile定義的藍色；若顏色相反，立即拔USB並回查
   ON level，不要以交換隨機GPIO掩蓋問題。
7. 按START一次：Serial應顯示`state=active`、RGB變綠、HTTP status為`201`，
   手機收到`start_pressed`。
8. 按STOP一次：不論Backend是否可連，下一次本機輸入處理後RGB必須變紅並進入ERROR；
   量測按下到變色的最長時間。網路可用時手機另收到`stop_pressed`。

若STOP只在Backend開啟時才有效，表示安全邏輯放錯位置，本階段不算完成。

## 十、手機命令與command_id追蹤

1. Backend啟動時使用的operator key填入手機頁面；key只留在目前頁面的記憶體，
   不要截圖或貼到通訊軟體。
2. Device ID填成程式中的`DEVICE_ID`，逐字相同。
3. 裝置先保持IDLE，按手機`start`。
4. 在Commands區找到新產生的`command_id`，記錄它。
5. ESP32下一次poll取得命令後先回`accepted`，執行安全輸出後再回`done`。
6. 確認RGB變綠，手機上同一個`command_id`最後為`done`。
7. 按手機`stop`，確認RGB變紅、狀態為ERROR、結果為`done`。
8. 在ERROR狀態再送`start`，裝置應回`rejected`及`reset required after error`，
   RGB不得變綠。
9. 送`reset`回IDLE後，才可再次`start`。

這段流程至少留下三筆不同結果：成功`done`、安全拒絕`rejected`、以及下一節故障
測試中的未完成或連線錯誤。完整命令紀錄表放在
[Week 6支援資料](week6_support.md#三命令追蹤與資料流紀錄)。

程式會在RAM保存最近8個`command_id`及其terminal result。同一次開機收到重複ID時，
只重送原結果，不再執行實體動作；但ESP32重新開機後RAM紀錄會消失，因此這不是跨重啟的
exactly-once保證。具有機械或高功率輸出的專題還要讓命令本身可安全重做，或將已完成ID
保存到耐久儲存，並以實體停止與最大動作時間限制最壞結果。

## 十一、四項故障注入

每次只改一個變因；每次開始前先記錄目前可正常工作的baseline。

### 故障A：錯誤Device ID

手機Device ID故意改成不存在的`unknown-device`並送`start`。Backend會建立命令，
但本人的ESP32不會取得。記錄該命令停在哪個狀態，再把Device ID改回正確值。

### 故障B：錯誤筆電IP

先拔USB，將`API_BASE_URL`最後一段改成LAN中不存在的位址，Upload後輸入
`test-event`。應看不到`201`。完成觀察後立刻還原正確IP再Upload，不在帶電狀態改線。

### 故障C：Backend停止

保持ESP32通電，在筆電Backend視窗按`Ctrl+C`。按實體STOP：RGB仍須由本機進入紅色；
記錄實測反應時間。事件無法送達是網路層故障，不得阻止本機安全輸出。重新啟動
Backend後，先按住STOP並送reset；命令必須rejected且RGB保持紅色。放開STOP、確認
故障條件已排除後再送新的reset，裝置才可回IDLE。

### 故障D：錯誤命令

用Backend的`/docs`頁或PowerShell建立一筆`blink-forever`命令。ESP32應回
`rejected`與`unknown command`，不能因未知輸入進入ACTIVE。

完成每項故障後都要恢復baseline並重新驗證一筆正常事件。症狀、第一個安全檢查與
復原方式記錄於支援資料，不使用「網路壞了」作為結論。

## 十二、練習

### 練習1：事件欄位的可觀察差異

將`serial_test`的`reason`改成另一個明確值，先預測手機哪一欄會改變，再Verify、
Upload與執行。不得同時改`event_type`、`state`與`unit`。

完成條件：提供修改前後兩筆JSON，能指出唯一改變的欄位及Backend仍接受的原因。

### 練習2：命令拒絕規則

保留ERROR狀態下拒絕`start`的規則，再新增一個明確且安全的拒絕條件，例如
`DEVICE_ID`未替換時拒絕所有遠端命令。先寫出狀態與預期結果，再修改程式。

完成條件：一筆命令以同一`command_id`呈現`accepted → rejected`，且RGB沒有進入綠色。

### 練習3：WebSocket與重新整理比較

用手機同時開兩個頁籤。讓頁籤A保持前景、頁籤B重新整理，送出一筆實體事件，比較：

- WebSocket即時到達的事件；
- 重新整理後由`GET /api/events`讀回的歷史事件。

完成條件：能用自己的實驗紀錄說明「即時推送」與「歷史查詢」不是同一件事。

## 十三、實驗紀錄與完成條件

繳交內容：

1. 網路身分表，遮蔽Wi-Fi密碼與operator key。
2. Backend host test的PowerShell結果與Events畫面。
3. Arduino Verify結果、Upload結果及Serial中ESP32 IP；三者分開標示。
4. START、STOP、RGB接線照片及Week 5 profile來源。
5. 實體START事件與WebSocket手機畫面。
6. 同一`command_id`從`requested`、`accepted`到`done`的證據。
7. 一次`rejected`與四項故障注入紀錄。
8. 說明實體STOP在Backend停止時仍有效的證據。

本週完成檢核：

- [ ] 筆電host test通過，事件寫入SQLite並顯示於網頁。
- [ ] ESP32使用唯一且不含個資的`DEVICE_ID`連入正確LAN。
- [ ] 真實START或STOP事件以HTTP status`201`進入Backend。
- [ ] 手機不刷新頁面即可透過WebSocket看到事件。
- [ ] 手機命令能以相同`command_id`追蹤至最終結果。
- [ ] ERROR狀態拒絕不安全的`start`，未知命令不執行。
- [ ] Backend或Wi-Fi失效時，實體STOP仍能在本機進入安全輸出。
- [ ] repository、截圖與實驗紀錄中沒有真實密碼或operator key。
- [ ] 已分別標示host test、compile、upload、network test與physical target test；
      未做的層次不得標示通過。

結束前先把RGB恢復IDLE，再於Backend終端機按`Ctrl+C`。拔除USB後拆線，ESP32、
按鈕、RGB與杜邦線分別收好。完整故障表、紀錄表與延伸挑戰見
[Week 6支援資料](week6_support.md)。
