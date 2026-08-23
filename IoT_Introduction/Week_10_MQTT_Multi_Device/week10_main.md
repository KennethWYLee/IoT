# Week 10：MQTT、多裝置、Topic、Presence與Acknowledgement

日期：2026-11-11

本章把Week 6的單一ESP32／Backend流程改成多裝置的publish／subscribe系統。每片
ESP32以自己的`device_id`組成topic，發布KY-018遙測、事件與online／offline presence，
只訂閱自己的命令。Backend透過MQTT bridge把資料寫入原有SQLite並更新手機畫面，
手機命令也能經broker送到正確裝置，再以相同`command_id`回報結果。

## 一、Unit Overview

### Teaching Objectives

By the end of this unit, students will be able to:

1. Explain and demonstrate the roles of an MQTT broker, publisher, subscriber,
   topic, payload, session, retained message, and Last Will.
2. Design a topic tree that isolates multiple devices while keeping telemetry,
   events, presence, commands, and acknowledgements distinguishable.
3. Publish validated sensor data and presence from an ESP32 and subscribe only to
   commands addressed to that device.
4. Track one command and its acknowledgement with a stable `command_id`, and use the
   documented in-memory cache to prevent duplicate execution during the same boot.
5. Demonstrate online, unexpected offline, reconnect, wrong-device, malformed-payload,
   and broker-unavailable behavior with observable evidence.
6. Connect MQTT messages to the existing backend, database, WebSocket, and mobile
   interface without exposing broker credentials.

### Teaching Content

This unit introduces MQTT as a broker-mediated publish/subscribe protocol for
multi-device IoT communication. Students will build a consistent topic hierarchy,
separate message routing from JSON content, and use presence and acknowledgements to
make device state and command results observable. The laboratory extends the existing
HTTP backend rather than replacing it: an MQTT bridge validates device messages,
stores them through the same API, and relays mobile commands to device-specific topics.
Retained presence, Last Will, reconnection, duplicate command protection, and local
safety behavior are tested as system properties.

## 二、從Week 6架構加入Broker

**MQTT broker（訊息代理伺服器）**接收publisher送來的訊息，再依topic轉給所有符合的
subscriber。publisher不必知道subscriber的IP；兩者只要能連到broker並使用相同topic。

```text
ESP32-A ─publish─┐
ESP32-B ─publish─┼→ MQTT Broker → Backend bridge → FastAPI → SQLite／手機
                 │
手機命令 → FastAPI → Backend bridge ─publish→ course/ESP32-A/commands
                 │
ESP32-A ←subscribe┘
```

**topic（主題）**是broker用來路由訊息的階層名稱；**payload（承載資料）**是topic內實際
傳送的內容，本課使用JSON。topic決定「送到哪一類接收者」，payload說明「這筆訊息的
欄位和值」。本課固定topic tree：

```text
course/<device_id>/telemetry
course/<device_id>/events
course/<device_id>/presence
course/<device_id>/commands
course/<device_id>/acks
```

`<device_id>`不得含`/`、空白、`+`或`#`。`+`與`#`是subscription中的wildcard
（萬用字元），不作為裝置名稱。

## 三、器材、軟體與安全邊界

本週使用ESP32-S3、USB資料線、麵包板、杜邦線、KY-018、START與STOP按鈕、KY-016
RGB、筆電、手機及可信任LAN。沿用Week 3～5已驗證的GPIO、光敏有效範圍與RGB ON
level。本週不接SG90、蜂鳴器與4AA電池盒；broker斷線時實體STOP仍由本機處理，不以
broker成功作為前置條件。

1. Broker只在本週可信任LAN中使用，不設定router port forwarding。
2. 不使用公開測試broker傳送課程裝置資料或命令。
3. Broker使用臨時帳密；Wi-Fi與broker密碼放在`secrets.h`，不得提交Git。
4. 本課LAN範例沒有TLS，不可當成Internet部署。跨Internet還需TLS、裝置身分、
   憑證更新、細部授權、rate limiting與監控。
5. 控制命令不使用retained message，避免新連線裝置執行過期命令。

## 四、安裝並驗證本機Broker

課前依[Eclipse Mosquitto官方下載頁](https://mosquitto.org/download/)安裝Windows x64
版本。安裝位置與版本記於[Week 10支援資料](week10_support.md#一課前軟體與版本紀錄)。

### 4.1 只限本機的host test

PowerShell視窗A：

```powershell
& "C:\Program Files\mosquitto\mosquitto.exe" -v
```

保持A開啟。PowerShell視窗B訂閱：

```powershell
& "C:\Program Files\mosquitto\mosquitto_sub.exe" `
  -h 127.0.0.1 -t "course/host-test/events" -v
```

PowerShell視窗C發布：

```powershell
& "C:\Program Files\mosquitto\mosquitto_pub.exe" `
  -h 127.0.0.1 -t "course/host-test/events" `
  -m '{"device_id":"host-test","event_type":"broker_test","value":1}'
```

正常結果：B立即顯示topic與JSON，A顯示publisher與subscriber。這只證明broker host
test，不證明LAN、ESP32或帳密設定。

### 4.2 建立有帳密的LAN設定

在不提交Git的資料夾中建立密碼檔；輸入密碼時PowerShell不顯示字元：

```powershell
& "C:\Program Files\mosquitto\mosquitto_passwd.exe" -c .\course-passwords iotstudent
```

建立`course-mosquitto.conf`，把`password_file`換成剛才檔案的完整實際路徑，路徑
使用正斜線：

```text
listener 1883
allow_anonymous false
password_file C:/replace/with/actual/path/course-passwords
persistence false
log_type all
```

停止先前broker，再啟動LAN設定：

```powershell
& "C:\Program Files\mosquitto\mosquitto.exe" -c .\course-mosquitto.conf -v
```

Windows Firewall只允許private network。以`ipconfig`取得筆電LAN IPv4，再測試帳密：

```powershell
& "C:\Program Files\mosquitto\mosquitto_sub.exe" `
  -h <筆電LAN-IP> -p 1883 -u iotstudent -P '<temporary-password>' `
  -t "course/+/presence" -v
```

不要截圖或提交含`-P`的命令。支援資料只記驗證結果，不抄密碼。

## 五、啟動Backend與MQTT Bridge

Bridge訂閱裝置telemetry、event、presence與ack，驗證JSON及topic中的device ID一致後，
送入Week 6 Backend；它也查詢Backend的`requested`命令，發布到該裝置的commands
topic，而且不retain。

PowerShell視窗D進入`examples/course_backend`：

```powershell
.\.venv\Scripts\Activate.ps1
$env:IOT_OPERATOR_KEY="replace-with-your-temporary-classroom-key"
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

PowerShell視窗E同樣進入該資料夾：

```powershell
.\.venv\Scripts\Activate.ps1
$env:MQTT_HOST="<筆電LAN-IP>"
$env:MQTT_PORT="1883"
$env:MQTT_USERNAME="iotstudent"
$env:MQTT_PASSWORD="<temporary-password>"
$env:IOT_API_BASE_URL="http://127.0.0.1:8000"
python mqtt_bridge.py
```

正常看到`mqtt_connected`。不合法topic、無效JSON或device ID不一致會產生
`mqtt_message_rejected`，不寫入database。

## 六、QoS、Retained Message與Last Will

**QoS（Quality of Service）**表示MQTT傳遞保證。本週PubSubClient發布使用QoS 0，
訂閱可要求QoS 1；bridge發布命令使用QoS 1。QoS 1可能重送，所以仍須以
`command_id`避免重複動作。PubSubClient發布限制與buffer設定見
[官方repository](https://github.com/knolleary/pubsubclient)。

**retained message（保留訊息）**是broker替topic保存的最後一筆資料，新subscriber
一訂閱就會收到。它適合presence，不適合一次性控制命令。

**Last Will（遺囑訊息）**由client連線時預先交給broker。若ESP32未正常告別就斷線，
broker代為發布offline。online與意外offline都retain，監看者才可立即看到最後狀態。
Will payload是在MQTT連線建立時準備，不是在斷線瞬間重新讀取裝置狀態。因此
`value=offline`可作為broker觀察到非正常離線的presence證據，但Will內的`state`
可能仍是連線當時的值，`uptime_ms`也可能為空；判斷故障前最後狀態時須另查最後
一筆event、telemetry或本機log。

## 七、建立ESP32 MQTT程式

Arduino IDE選擇**Tools → Manage Libraries**，搜尋`PubSubClient`，確認作者Nick
O'Leary並安裝課程驗證版本`2.8.0`。保留ArduinoJson。

### 7.1 `secrets.h`

```cpp
#pragma once
const char WIFI_SSID[] = "replace-with-wifi-name";
const char WIFI_PASSWORD[] = "replace-with-wifi-password";
const char MQTT_HOST[] = "192.168.1.23";
const int MQTT_PORT = 1883;
const char MQTT_USERNAME[] = "iotstudent";
const char MQTT_PASSWORD[] = "replace-with-broker-password";
```

`MQTT_HOST`只填筆電LAN IPv4，不加`http://`。本檔不得提交Git。

### 7.2 完整主程式

程式預設`DRY_RUN=true`及profile未填。先編譯，再抄入Week 3～5自己的實測值。

```cpp
#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include "secrets.h"

const char DEVICE_ID[] = "replace-with-team-device-id";
const bool DRY_RUN = true;
const int PIN_START = -1;
const int PIN_STOP = -1;
const int PIN_LIGHT = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;
const int LIGHT_VALID_MIN = -1;
const int LIGHT_VALID_MAX = -1;

enum class DeviceState { IDLE, ACTIVE, ERROR_STATE };
DeviceState state = DeviceState::IDLE;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

String topicTelemetry, topicEvents, topicPresence, topicCommands, topicAcks;
bool startLastRaw = false, stopLastRaw = false;
bool startStablePressed = false, stopStablePressed = false;
unsigned long startChangedAt = 0, stopChangedAt = 0;
unsigned long lastWifiAttemptAt = 0, lastMqttAttemptAt = 0, lastTelemetryAt = 0;
const unsigned long DEBOUNCE_MS = 35;
const unsigned long WIFI_RETRY_MS = 10000;
const unsigned long MQTT_RETRY_MS = 5000;
const unsigned long TELEMETRY_MS = 2000;

struct ProcessedCommand {
  String id;
  String result;
  String message;
};
const int PROCESSED_COMMAND_CAPACITY = 8;
ProcessedCommand processedCommands[PROCESSED_COMMAND_CAPACITY];
int nextProcessedCommand = 0;

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
  const int pins[] = {
    PIN_START, PIN_STOP, PIN_LIGHT, PIN_RGB_R, PIN_RGB_G, PIN_RGB_B
  };
  bool pinsReady = PIN_START >= 0 && PIN_STOP >= 0 && PIN_LIGHT >= 0 &&
                   PIN_RGB_R >= 0 && PIN_RGB_G >= 0 && PIN_RGB_B >= 0;
  bool range = LIGHT_VALID_MIN >= 0 && LIGHT_VALID_MAX <= 4095 &&
               LIGHT_VALID_MAX > LIGHT_VALID_MIN;
  bool level = RGB_ON_LEVEL == HIGH || RGB_ON_LEVEL == LOW;
  return pinsReady && allPinsUnique(pins, 6) && range && level;
}

int rgbOffLevel() { return RGB_ON_LEVEL == HIGH ? LOW : HIGH; }

void setRgb(bool red, bool green, bool blue) {
  if (DRY_RUN || !profileReady()) return;
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : rgbOffLevel());
}

void enterState(DeviceState next, const char *reason) {
  state = next;
  if (state == DeviceState::IDLE) setRgb(false, false, true);
  if (state == DeviceState::ACTIVE) setRgb(false, true, false);
  if (state == DeviceState::ERROR_STATE) setRgb(true, false, false);
  Serial.printf("state=%s reason=%s\n", stateName(), reason);
}

void buildTopics() {
  String root = "course/" + String(DEVICE_ID) + "/";
  topicTelemetry = root + "telemetry";
  topicEvents = root + "events";
  topicPresence = root + "presence";
  topicCommands = root + "commands";
  topicAcks = root + "acks";
}

bool publishJson(const String &topic, JsonDocument &document, bool retained = false) {
  if (!mqttClient.connected()) return false;
  String payload;
  serializeJson(document, payload);
  bool sent = mqttClient.publish(topic.c_str(), payload.c_str(), retained);
  Serial.printf("mqtt=publish topic=%s sent=%s payload=%s\n",
                topic.c_str(), sent ? "true" : "false", payload.c_str());
  return sent;
}

void publishPresence(const char *value) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = "presence";
  doc["value"] = value; doc["unit"] = "status"; doc["state"] = stateName();
  doc["valid"] = true; doc["reason"] = "mqtt_session"; doc["uptime_ms"] = millis();
  publishJson(topicPresence, doc, true);
}

void publishEvent(const char *type, int value, const char *unit,
                  bool valid, const char *reason) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = type;
  doc["value"] = value; doc["unit"] = unit; doc["state"] = stateName();
  doc["valid"] = valid; doc["reason"] = reason; doc["uptime_ms"] = millis();
  publishJson(topicEvents, doc);
}

void publishAck(const String &id, const char *result, const char *message) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["command_id"] = id;
  doc["result"] = result; doc["message"] = message;
  publishJson(topicAcks, doc);
}

int findProcessedCommand(const String &id) {
  for (int index = 0; index < PROCESSED_COMMAND_CAPACITY; index++) {
    if (processedCommands[index].id == id) return index;
  }
  return -1;
}

void finishCommand(const String &id, const char *result, const char *message) {
  processedCommands[nextProcessedCommand] = {id, result, message};
  nextProcessedCommand = (nextProcessedCommand + 1) % PROCESSED_COMMAND_CAPACITY;
  publishAck(id, result, message);
}

void executeCommand(const String &id, const String &command) {
  int previousIndex = findProcessedCommand(id);
  if (previousIndex >= 0) {
    publishAck(id, processedCommands[previousIndex].result.c_str(),
               processedCommands[previousIndex].message.c_str());
    return;
  }
  publishAck(id, "accepted", "received by device");
  if (command == "stop") {
    enterState(DeviceState::ERROR_STATE, "remote_stop");
    finishCommand(id, "done", "safe output applied");
  } else if (command == "start" && state != DeviceState::ERROR_STATE) {
    enterState(DeviceState::ACTIVE, "remote_start");
    finishCommand(id, "done", "active output applied");
  } else if (command == "start") {
    finishCommand(id, "rejected", "reset required after error");
  } else if (command == "reset") {
    if (!DRY_RUN && stopStablePressed) {
      finishCommand(id, "rejected", "release physical stop before reset");
    } else {
      enterState(DeviceState::IDLE, "remote_reset");
      finishCommand(id, "done", "idle output applied");
    }
  } else {
    finishCommand(id, "rejected", "unknown command");
  }
}

void onMqttMessage(char *topic, byte *payload, unsigned int length) {
  if (String(topic) != topicCommands) return;
  if (length == 0 || length >= 768) {
    Serial.printf("mqtt=reject reason=payload_length length=%u\n", length); return;
  }
  char buffer[768];
  memcpy(buffer, payload, length); buffer[length] = '\0';
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, buffer);
  if (error) {
    Serial.printf("mqtt=reject reason=json detail=%s\n", error.c_str()); return;
  }
  String target = doc["device_id"] | "";
  String id = doc["command_id"] | "";
  String command = doc["command"] | "";
  if (target != DEVICE_ID || id.length() == 0 || command.length() == 0) {
    Serial.println("mqtt=reject reason=identity_or_field"); return;
  }
  executeCommand(id, command);
}

void requestWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  unsigned long now = millis();
  if (lastWifiAttemptAt && now - lastWifiAttemptAt < WIFI_RETRY_MS) return;
  lastWifiAttemptAt = now; WiFi.disconnect(); WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("wifi=connecting");
}

void requestMqtt() {
  if (WiFi.status() != WL_CONNECTED || mqttClient.connected()) return;
  unsigned long now = millis();
  if (lastMqttAttemptAt && now - lastMqttAttemptAt < MQTT_RETRY_MS) return;
  lastMqttAttemptAt = now;

  JsonDocument willDoc;
  willDoc["device_id"] = DEVICE_ID; willDoc["event_type"] = "presence";
  willDoc["value"] = "offline"; willDoc["unit"] = "status";
  willDoc["state"] = stateName(); willDoc["valid"] = true;
  willDoc["reason"] = "last_will";
  String willPayload; serializeJson(willDoc, willPayload);

  bool connected = mqttClient.connect(
    DEVICE_ID, MQTT_USERNAME, MQTT_PASSWORD,
    topicPresence.c_str(), 1, true, willPayload.c_str());
  Serial.printf("mqtt=connect connected=%s state=%d\n",
                connected ? "true" : "false", mqttClient.state());
  if (connected) {
    mqttClient.subscribe(topicCommands.c_str(), 1);
    publishPresence("online");
  }
}

bool pressedEvent(int pin, bool &lastRaw, bool &stablePressed,
                  unsigned long &changedAt) {
  bool pressed = digitalRead(pin) == LOW;
  unsigned long now = millis();
  if (pressed != lastRaw) {
    lastRaw = pressed;
    changedAt = now;
  }
  if (now - changedAt >= DEBOUNCE_MS && pressed != stablePressed) {
    stablePressed = pressed;
    return stablePressed;
  }
  return false;
}

void readPhysicalInputs() {
  if (DRY_RUN || !profileReady()) return;
  bool stopPressedEvent =
    pressedEvent(PIN_STOP, stopLastRaw, stopStablePressed, stopChangedAt);
  bool startPressedEvent =
    pressedEvent(PIN_START, startLastRaw, startStablePressed, startChangedAt);
  if (stopStablePressed) {
    if (stopPressedEvent || state != DeviceState::ERROR_STATE) {
      enterState(DeviceState::ERROR_STATE, "physical_stop");
      publishEvent("stop_pressed", 1, "pressed", true, "physical_input");
    }
    return;
  }
  if (startPressedEvent) {
    if (state == DeviceState::ERROR_STATE)
      publishEvent("start_rejected", 1, "pressed", false, "reset_required");
    else {
      enterState(DeviceState::ACTIVE, "physical_start");
      publishEvent("start_pressed", 1, "pressed", true, "physical_input");
    }
  }
}

void publishTelemetryIfDue() {
  if (DRY_RUN || !profileReady() || !mqttClient.connected()) return;
  unsigned long now = millis();
  if (now - lastTelemetryAt < TELEMETRY_MS) return;
  lastTelemetryAt = now;
  int raw = analogRead(PIN_LIGHT);
  bool valid = raw >= LIGHT_VALID_MIN && raw <= LIGHT_VALID_MAX;
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = "light_sample";
  doc["value"] = raw; doc["unit"] = "adc_raw"; doc["state"] = stateName();
  doc["valid"] = valid;
  doc["reason"] = valid ? "within_profile" : "out_of_profile";
  doc["uptime_ms"] = now;
  publishJson(topicTelemetry, doc);
}

void setup() {
  Serial.begin(115200); delay(500); buildTopics();
  if (!identifierReady(DEVICE_ID)) {
    Serial.println("fatal=device_id_missing_or_invalid"); return;
  }
  if (!DRY_RUN && !profileReady()) {
    Serial.println("fatal=hardware_profile_incomplete"); return;
  }
  if (!DRY_RUN) {
    pinMode(PIN_START, INPUT_PULLUP); pinMode(PIN_STOP, INPUT_PULLUP);
    pinMode(PIN_RGB_R, OUTPUT); pinMode(PIN_RGB_G, OUTPUT); pinMode(PIN_RGB_B, OUTPUT);
    enterState(DeviceState::IDLE, "boot");
  }
  WiFi.mode(WIFI_STA);
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
  mqttClient.setBufferSize(768);
  mqttClient.setKeepAlive(20);
  mqttClient.setSocketTimeout(1);
  requestWifi();
  Serial.printf("week=10 device=%s topic=%s mode=%s\n",
                DEVICE_ID, topicCommands.c_str(), DRY_RUN ? "dry_run" : "hardware");
}

void loop() {
  readPhysicalInputs();  // broker離線時也先處理本機STOP
  requestWifi();
  requestMqtt();
  if (mqttClient.connected()) mqttClient.loop();
  publishTelemetryIfDue();
  delay(5);
}
```

## 八、分階段驗證單一裝置

### 階段1：編譯與連線，不驅動GPIO

1. 保持`DRY_RUN=true`、GPIO為`-1`，替換`DEVICE_ID`及`secrets.h`。
2. Verify後Upload，開啟115200 Serial Monitor。
3. 正常依序看到`wifi=connecting`、`mqtt=connect connected=true`及本裝置topic。
4. `mosquitto_sub`訂閱`course/+/presence`，應立即看到retained online。

`mqttClient.state()`為負值時先記錄數字，再查broker、IP、port與帳密；不改硬體profile。

### 階段2：啟用實體profile

1. 拔USB，依Week 3～5接線表接KY-018、START、STOP與RGB。
2. 填入自己的GPIO、RGB ON level與KY-018有效raw範圍，改`DRY_RUN=false`。
3. Verify成功後Upload，再訂閱本裝置全部訊息：

```powershell
& "C:\Program Files\mosquitto\mosquitto_sub.exe" `
  -h <筆電LAN-IP> -u iotstudent -P '<temporary-password>' `
  -t "course/<your-device-id>/#" -v
```

4. 每兩秒應看到`light_sample`；按START／STOP應看到events。關閉broker後按STOP，
   RGB仍須在實測上限內變紅，且不等待broker恢復。

`mqttClient.connect()`本身仍可能阻塞到`setSocketTimeout(1)`設定的約1秒；因此本實驗只能
證明低功率RGB範例的本機STOP不依賴broker，不能把它描述為硬即時緊急停止。量測broker
離線時的最壞STOP延遲並記錄。會移動或輸出高功率的專題必須另外設計不受network library
阻塞的停止路徑或獨立斷電裝置。

### 階段3：由手機送命令

1. 開Week 6 Backend頁面，填正確device ID與operator key。
2. 依序送`reset`、`start`、`stop`。
3. Bridge發布commands；ESP32發布accepted與terminal result到acks。
4. 手機、bridge、broker與ESP32上的`command_id`必須一致。

本程式在RAM保留最近8個terminal command結果，重複ID只重送原結果，不重複動作。
重新開機會清除RAM，因此QoS 1與`command_id`仍不能單獨提供跨重啟exactly-once執行。
會移動或輸出高功率的專題須另採可安全重做的命令、耐久完成紀錄、最大動作時間與
實體停止設計。

## 九、多裝置交叉驗證

與另一位學生配對，裝置ID記作A與B，不可相同。

1. 訂閱`course/+/presence`，確認A、B都online。
2. 訂閱`course/+/telemetry`，確認topic與payload ID各自一致。
3. 手機只對A送`start`；A變綠並ack，B不得改變。
4. 手機只對B送`stop`；B變紅並ack，A不得改變。
5. 拔A的USB，等待broker發布A的Last Will offline；B仍online。
6. A重新接USB後發布online，不能自動執行斷線前舊命令。

若兩片都執行，先查是否誤訂閱`course/+/commands`。裝置只能訂閱自己的commands。

## 十、Retain、重複命令與故障注入

1. A已online後才新開subscriber訂閱A presence；若立即收到online，retained生效。
2. 裝置離線時發布一個**不加`-r`**的命令，重新上線後不得執行。
3. 將相同安全命令payload與`command_id`發布兩次；第二次不得重做狀態轉換。
4. 發布缺右大括號的malformed JSON；Serial顯示JSON reject，RGB不變。
5. Topic填A、payload device ID填B；A拒絕執行。
6. command填`spin_forever`；A回`rejected`。
7. 停止broker；實體STOP仍不依賴broker，程式不得被無限重連`while`卡住。量測最壞
   反應時間，並確認未超過本組事先定義的低功率RGB測試上限。
8. 按住實體STOP不放並送reset；結果必須rejected，RGB保持紅色。放開STOP後才可
   送出新的reset。
9. 只停止bridge；broker仍看得到資料，但Backend與手機不更新。

每次只注入一個錯誤，恢復baseline後再做下一項。

## 十一、練習

### 練習1：Topic filter比較

比較`course/+/telemetry`、`course/<自己的ID>/#`與`course/#`的範圍。先寫預測，
不使用可能接收其他系統資料的`#`單獨訂閱。

### 練習2：Presence原因

比較正常online的`reason=mqtt_session`與拔USB後offline的`reason=last_will`，說明
為何使用同一presence topic與retained設定，仍可辨認來源。

### 練習3：多裝置隔離

把A、B、topic、payload ID與實體反應填入矩陣，至少包含正確與錯誤目標。以紀錄說明
broker依topic路由，裝置又用payload identity做第二次檢查。

## 十二、繳交內容與完成條件

繳交Broker、PubSubClient、ArduinoJson及board package版本；broker host與LAN test；
完整topic tree；telemetry、presence、ack代表JSON；KY-018與按鈕／RGB target test；
一筆跨手機、bridge、broker、ESP32的command ID；A／B隔離、Last Will、重連及舊命令
不重播證據；以及全部故障注入紀錄。秘密必須遮蔽。

- [ ] Broker host test與有帳密LAN連線分別通過。
- [ ] 裝置使用唯一ID，只訂閱自己的commands topic。
- [ ] KY-018 telemetry含value、unit、valid、reason與uptime。
- [ ] Online與Last Will offline可由新subscriber立即讀取。
- [ ] Command不retain，相同command ID不重複執行。
- [ ] A命令不改變B，錯誤payload identity也被拒絕。
- [ ] MQTT資料經bridge進入Backend、SQLite與手機WebSocket。
- [ ] Broker／bridge離線時，本機STOP不依賴服務恢復，且最壞反應時間已有實測值。
- [ ] 密碼只在環境變數或`secrets.h`，未提交Git。
- [ ] Host、compile、upload、network及physical target test分別標示。

結束時先回IDLE再拔USB。於bridge、Backend與broker視窗依序按`Ctrl+C`，清除
PowerShell暫存密碼。完整紀錄表、故障表與延伸挑戰見
[Week 10支援資料](week10_support.md)。
