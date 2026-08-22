# ESP32-S3 Starter Code Snippets

這些片段用來說明程式結構，不是特定板卡的固定接線答案。使用前須從
Espressif 的 exact DevKitC-1 文件、實際板卡標示與模組資料核對 GPIO、
電壓、電流與供電。將 Wi-Fi 密碼放在未提交 Git 的本機設定檔。

## 1. Serial 與非阻塞時間

```cpp
unsigned long lastReportMs = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("boot: ready");
}

void loop() {
  unsigned long now = millis();
  if (now - lastReportMs >= 1000) {
    lastReportMs = now;
    Serial.printf("status: uptime_ms=%lu\n", now);
  }
}
```

## 2. 按鈕去抖與 LED 狀態

請把 `VERIFIED_...` 改成已核對且適合的 GPIO；原樣不能編譯是刻意的，
避免學生把範例腳位當成板卡規格。

```cpp
const int PIN_BUTTON = VERIFIED_INPUT_GPIO;
const int PIN_LED = VERIFIED_OUTPUT_GPIO;

bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
}

void loop() {
  bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_LED, stablePressed ? HIGH : LOW);
    Serial.printf("event=button_changed pressed=%s\n",
                  stablePressed ? "true" : "false");
  }
}
```

## 3. 感測值驗證

以下用函式骨架提醒學生區分 raw value、有效性與作品狀態。感測器讀取
函式須依實際 library 替換。

```cpp
struct Reading {
  float value;
  bool valid;
};

Reading validateTemperature(float raw) {
  bool valid = !isnan(raw) && raw >= -20.0 && raw <= 80.0;
  return {raw, valid};
}

void reportReading(float raw) {
  Reading r = validateTemperature(raw);
  if (!r.valid) {
    Serial.println("event=sensor_error reason=invalid_range");
    return;
  }
  Serial.printf("event=reading value=%.1f\n", r.value);
}
```

## 4. 單機互動狀態機

```cpp
enum class DeviceState { IDLE, ACTIVE, SUCCESS, ERROR_STATE };

DeviceState state = DeviceState::IDLE;
unsigned long stateStartedMs = 0;
const unsigned long ACTIVE_TIMEOUT_MS = 5000;

void enterState(DeviceState next) {
  state = next;
  stateStartedMs = millis();
  // Set every actuator explicitly here. ERROR_STATE must be physically safe.
}

void updateState(bool startPressed, bool taskCompleted, bool sensorValid) {
  unsigned long elapsed = millis() - stateStartedMs;

  if (!sensorValid) {
    enterState(DeviceState::ERROR_STATE);
    return;
  }

  switch (state) {
    case DeviceState::IDLE:
      if (startPressed) enterState(DeviceState::ACTIVE);
      break;
    case DeviceState::ACTIVE:
      if (taskCompleted) enterState(DeviceState::SUCCESS);
      else if (elapsed >= ACTIVE_TIMEOUT_MS) enterState(DeviceState::ERROR_STATE);
      break;
    case DeviceState::SUCCESS:
    case DeviceState::ERROR_STATE:
      if (!startPressed) enterState(DeviceState::IDLE);
      break;
  }
}
```

## 5. 舵機安全骨架

需安裝與 Arduino-ESP32 相容的 servo library。舵機使用適當外部電源並與
ESP32 共地；不得由 GPIO 供電。先無負載測試角度限制。

```cpp
#include <ESP32Servo.h>

const int PIN_SERVO = VERIFIED_PWM_GPIO;
const int SAFE_ANGLE = 20;
const int MAX_ANGLE = 120;
Servo actuator;

void moveSafelyTo(int requestedAngle) {
  int limited = constrain(requestedAngle, SAFE_ANGLE, MAX_ANGLE);
  actuator.write(limited);
  Serial.printf("event=actuator_move requested=%d applied=%d\n",
                requestedAngle, limited);
}

void setup() {
  Serial.begin(115200);
  actuator.attach(PIN_SERVO);
  moveSafelyTo(SAFE_ANGLE);
}

void loop() {}
```

## 6. Wi-Fi 設定檔

建立不提交 Git 的 `secrets.h`：

```cpp
#pragma once
const char* WIFI_SSID = "replace-locally";
const char* WIFI_PASSWORD = "replace-locally";
const char* API_BASE_URL = "http://replace-locally:8000";
```

主程式：

```cpp
#include <WiFi.h>
#include "secrets.h"

void connectWifi(unsigned long timeoutMs) {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long started = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - started < timeoutMs) {
    delay(250);
    Serial.print('.');
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nwifi=connected ip=%s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nwifi=timeout");
  }
}
```

## 7. HTTP POST 事件

```cpp
#include <HTTPClient.h>

bool postEvent(const String& json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("http=skipped reason=wifi_disconnected");
    return false;
  }

  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/events";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int status = http.POST(json);
  String response = status > 0 ? http.getString() : "";
  http.end();

  Serial.printf("http_status=%d response=%s\n", status, response.c_str());
  return status >= 200 && status < 300;
}
```

範例事件：

```cpp
String eventJson =
  "{\"device_id\":\"team01-device01\","
  "\"event_type\":\"action_completed\","
  "\"value\":1,\"state\":\"idle\"}";
```

## 8. WebSocket 即時命令結構

以下使用常見的 `arduinoWebSockets` library；版本與 API 須在正式教材發布
前鎖定並編譯驗證。收到命令後先驗證裝置 ID、命令、參數與目前狀態，
不要直接把任意文字映射為致動器動作。

```cpp
#include <WebSocketsClient.h>

WebSocketsClient ws;

void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  if (type != WStype_TEXT) return;

  String message(reinterpret_cast<char*>(payload), length);
  Serial.printf("ws_command=%s\n", message.c_str());

  // Parse JSON, validate device_id and allowed command, then update state.
  // Send a result only after the device accepts or completes the action.
  ws.sendTXT("{\"command_id\":\"replace\",\"result\":\"accepted\"}");
}
```

## 9. MQTT Topic 與 acknowledgement

以下使用 `PubSubClient`。Broker 位址、認證、TLS 與 library 版本須依課堂
環境設定；公共 broker 不用於敏感資料或危險控制。

```cpp
#include <PubSubClient.h>

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

const char* DEVICE_ID = "team01-device01";

String topic(const char* suffix) {
  return String("course/") + DEVICE_ID + "/" + suffix;
}

void publishResult(const String& commandId, const char* result) {
  String payload = String("{\"command_id\":\"") + commandId +
                   "\",\"result\":\"" + result + "\"}";
  mqtt.publish(topic("ack").c_str(), payload.c_str(), false);
}
```

## 10. 安全停止與網路獨立性

```cpp
unsigned long lastValidCommandMs = 0;
const unsigned long COMMAND_TIMEOUT_MS = 3000;

void stopAllActuators() {
  // Set every physical output to the verified safe state.
}

void enforceCommandTimeout() {
  if (millis() - lastValidCommandMs > COMMAND_TIMEOUT_MS) {
    stopAllActuators();
  }
}
```

手機、WebSocket 或雲端不能是危險致動器唯一的緊急停止方式。網路失效時，
ESP32 必須自行進入已驗證的安全狀態。

## 11. 可選移動平台

馬達驅動、輪速、距離與 ROS 2 不是共同作業。選擇移動平台的小組須另核對
馬達堵轉電流、驅動板容量、電池、降壓、雜訊、機構固定與實體急停，並先
架空輪或卸載測試。教師的 UCI 4WD 程式應放在獨立案例，不和全班起手式
混在一起。
