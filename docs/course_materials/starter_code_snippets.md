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

以下預設腳位為`-1`，因此原樣可以編譯但不會啟用硬體。教師完成同批板卡
target test並公布profile後，才把兩個值改成profile內容；兩腳必須不同。

```cpp
const int PIN_BUTTON = -1;
const int PIN_LED = -1;

bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;

void setup() {
  Serial.begin(115200);
  if (PIN_BUTTON < 0 || PIN_LED < 0 || PIN_BUTTON == PIN_LED) {
    Serial.println("profile=blocked reason=replace_and_verify_pins");
    return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);
}

void loop() {
  if (PIN_BUTTON < 0 || PIN_LED < 0 || PIN_BUTTON == PIN_LED) return;

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

void updateState(bool startPressed, bool taskCompleted, bool sensorValid,
                 bool stopPressed, bool resetRequested) {
  unsigned long elapsed = millis() - stateStartedMs;

  if (stopPressed || !sensorValid) {
    if (state != DeviceState::ERROR_STATE) {
      enterState(DeviceState::ERROR_STATE);
    }
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
      if (!startPressed) enterState(DeviceState::IDLE);
      break;
    case DeviceState::ERROR_STATE:
      if (resetRequested && sensorValid && !stopPressed) {
        enterState(DeviceState::IDLE);
      }
      break;
  }
}
```

`ERROR_STATE`是鎖定狀態：放開START不會自動清除錯誤。必須先排除故障、
確認STOP未按下，再提出明確reset要求。

## 5. 舵機安全骨架

需安裝與 Arduino-ESP32 相容的 servo library。舵機使用適當外部電源並與
ESP32 共地；不得由 GPIO 供電。先無負載測試角度限制。

```cpp
#include <ESP32Servo.h>

const int PIN_SERVO = -1;
const int SAFE_ANGLE = 20;
const int MAX_ANGLE = 120;
const bool DRY_RUN = true;
Servo actuator;

void moveSafelyTo(int requestedAngle) {
  int limited = constrain(requestedAngle, SAFE_ANGLE, MAX_ANGLE);
  if (DRY_RUN || PIN_SERVO < 0) {
    Serial.printf("event=actuator_dry_run requested=%d applied=%d\n",
                  requestedAngle, limited);
    return;
  }
  actuator.write(limited);
  Serial.printf("event=actuator_move requested=%d applied=%d\n",
                requestedAngle, limited);
}

void setup() {
  Serial.begin(115200);
  if (PIN_SERVO < 0) {
    Serial.println("profile=blocked reason=replace_and_verify_servo_pin");
    return;
  }
  if (DRY_RUN) {
    Serial.println("actuator=dry_run reason=verify_power_ground_and_range_first");
    return;
  }
  actuator.attach(PIN_SERVO);
  moveSafelyTo(SAFE_ANGLE);
}

void loop() {}
```

先在`DRY_RUN=true`確認請求角度會被限制；完成外部供電、共地、空載角度及
停止測試後，才可改為`false`。這段不取代Week 4完整的持續STOP與timeout流程。

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

這個函式只適合不含致動器的最小連線測試，因為等待期間會阻塞其他工作。
軟硬整合版本必須採用Week 6的非阻塞重連流程，並在每次網路處理前先讀取
實體STOP與更新安全狀態。

## 7. HTTP POST 事件

```cpp
#include <HTTPClient.h>

bool postEvent(const String& json) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("http=skipped reason=wifi_disconnected");
    return false;
  }

  WiFiClient client;
  HTTPClient http;
  String url = String(API_BASE_URL) + "/api/events";
  if (!http.begin(client, url)) {
    Serial.println("http=failed reason=begin_failed");
    return false;
  }
  http.setConnectTimeout(1500);
  http.setTimeout(1500);
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

## 8. WebSocket 的課程責任邊界

本課程Week 10的WebSocket連線位於**手機瀏覽器與Backend之間**，由Backend把
新事件與命令結果推送到畫面。ESP32使用有timeout的HTTP上傳事件及輪詢命令，
不需要額外安裝`arduinoWebSockets`。完整、已驗證的ESP32與Backend流程以
Week 10正式教材為準；不要把網頁收到的任意文字直接映射為致動器動作。

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
  String payload = String("{\"device_id\":\"") + DEVICE_ID +
                   "\",\"command_id\":\"" + commandId +
                   "\",\"result\":\"" + result + "\"}";
  mqtt.publish(topic("acks").c_str(), payload.c_str(), false);
}
```

`commandId`必須原樣回傳Backend產生的UUID，不能由裝置自行改寫或改成流水號。

## 10. 安全停止與網路獨立性

```cpp
unsigned long lastValidCommandMs = 0;
const unsigned long COMMAND_TIMEOUT_MS = 3000;
bool actuatorActive = false;

void stopAllActuators() {
  // Set every physical output to the verified safe state.
  actuatorActive = false;
}

void enforceSafety(bool physicalStopPressed) {
  if (physicalStopPressed) {
    stopAllActuators();
    return;
  }
  if (actuatorActive && millis() - lastValidCommandMs > COMMAND_TIMEOUT_MS) {
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
