# ESP32-S3 Starter Code Snippets

這份程式碼是課堂用起手式，不是唯一正解。每組必須依自己的接線修改 `PIN_...`，並先用 Serial Monitor 確認狀態，再接馬達或外部電源。

## 1. Serial Hello

```cpp
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("ESP32-S3 is alive");
}

void loop() {
  Serial.println("tick");
  delay(1000);
}
```

## 2. Wi-Fi Scan

```cpp
#include <WiFi.h>

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  Serial.println("Scanning Wi-Fi...");
}

void loop() {
  int n = WiFi.scanNetworks();
  Serial.printf("Found %d networks\n", n);

  for (int i = 0; i < n; i++) {
    Serial.printf("%2d: %s (%d dBm)\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i));
  }

  Serial.println("---");
  delay(5000);
}
```

## 3. Button Controls LED

使用 `INPUT_PULLUP` 時，按鈕按下通常會讀到 `LOW`。

```cpp
const int PIN_BUTTON = 4;
const int PIN_LED = 5;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  bool pressed = digitalRead(PIN_BUTTON) == LOW;
  digitalWrite(PIN_LED, pressed ? HIGH : LOW);

  Serial.printf("button=%s\n", pressed ? "pressed" : "released");
  delay(100);
}
```

## 4. Active Buzzer Warning

有源蜂鳴器通常只要 HIGH/LOW 就會叫；無源蜂鳴器才需要頻率控制。

```cpp
const int PIN_BUZZER = 6;

void setup() {
  pinMode(PIN_BUZZER, OUTPUT);
}

void loop() {
  digitalWrite(PIN_BUZZER, HIGH);
  delay(200);
  digitalWrite(PIN_BUZZER, LOW);
  delay(800);
}
```

## 5. RGB LED Module State

KY-016 類 RGB 模組常見腳位是 R/G/B/GND。若顏色相反或不亮，先檢查共陰/共陽與腳位順序。

```cpp
const int PIN_R = 7;
const int PIN_G = 8;
const int PIN_B = 9;

void setRgb(bool r, bool g, bool b) {
  digitalWrite(PIN_R, r ? HIGH : LOW);
  digitalWrite(PIN_G, g ? HIGH : LOW);
  digitalWrite(PIN_B, b ? HIGH : LOW);
}

void setup() {
  pinMode(PIN_R, OUTPUT);
  pinMode(PIN_G, OUTPUT);
  pinMode(PIN_B, OUTPUT);
}

void loop() {
  setRgb(false, true, false);  // safe: green
  delay(1000);
  setRgb(true, true, false);   // warning: yellow
  delay(1000);
  setRgb(true, false, false);  // violation: red
  delay(1000);
}
```

## 6. SG90 Servo Gate

需要安裝 `ESP32Servo` library。伺服馬達電源不足時會抖動，必要時使用外部 5V，並與 ESP32-S3 共地。

```cpp
#include <ESP32Servo.h>

const int PIN_SERVO = 10;
Servo gate;

void setup() {
  Serial.begin(115200);
  gate.attach(PIN_SERVO);
}

void loop() {
  Serial.println("gate open");
  gate.write(90);
  delay(2000);

  Serial.println("gate close");
  gate.write(0);
  delay(2000);
}
```

## 7. HC-SR04 Distance

重要：HC-SR04 的 Echo 常是 5V，ESP32-S3 GPIO 是 3.3V。Echo 腳請使用分壓或 3.3V 相容模組。

```cpp
const int PIN_TRIG = 11;
const int PIN_ECHO = 12;  // Echo must be level-shifted to 3.3V.

float readDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) return -1;
  return duration * 0.0343 / 2.0;
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
}

void loop() {
  float cm = readDistanceCm();
  Serial.printf("distance=%.1f cm\n", cm);
  delay(300);
}
```

## 8. UCI 4WD + L298N Basic Motor Control

先架空四個輪子逐一確認方向，不要一開始就放到地上跑。左前與左後馬達並聯為左輪組，右前與右後馬達並聯為右輪組；先確認單顆馬達的極性，再接到同一 channel。

`turnLeft()` 是左側停止、右側前進的單側樞軸。`spinLeft()` 與 `spinRight()` 讓左右輪反向，是 UCI 4WD 的原地旋轉。若要校正速度，移除 L298N 的 ENA/ENB jumper，再把 ENA/ENB 接到可 PWM 的 GPIO。

```cpp
const int L_IN1 = 13;
const int L_IN2 = 14;
const int R_IN1 = 15;
const int R_IN2 = 16;

void leftMotor(int dir) {
  digitalWrite(L_IN1, dir > 0 ? HIGH : LOW);
  digitalWrite(L_IN2, dir < 0 ? HIGH : LOW);
}

void rightMotor(int dir) {
  digitalWrite(R_IN1, dir > 0 ? HIGH : LOW);
  digitalWrite(R_IN2, dir < 0 ? HIGH : LOW);
}

void stopCar() {
  leftMotor(0);
  rightMotor(0);
}

void forward() {
  leftMotor(1);
  rightMotor(1);
}

void backward() {
  leftMotor(-1);
  rightMotor(-1);
}

void turnLeft() {
  leftMotor(0);
  rightMotor(1);
}

void turnRight() {
  leftMotor(1);
  rightMotor(0);
}

void spinLeft() {
  leftMotor(-1);
  rightMotor(1);
}

void spinRight() {
  leftMotor(1);
  rightMotor(-1);
}

void setup() {
  pinMode(L_IN1, OUTPUT);
  pinMode(L_IN2, OUTPUT);
  pinMode(R_IN1, OUTPUT);
  pinMode(R_IN2, OUTPUT);
  stopCar();
}

void loop() {
  forward();
  delay(1000);
  stopCar();
  delay(500);

  backward();
  delay(1000);
  stopCar();
  delay(500);

  turnLeft();
  delay(600);
  stopCar();
  delay(500);

  turnRight();
  delay(600);
  stopCar();
  delay(500);

  spinLeft();
  delay(400);
  stopCar();
  delay(1000);
}
```

### 8.1 左右輪 PWM 校正

若車子向左偏，通常不是把路線時間全部重寫，而是微調左右輪 PWM。以下範例假設 ENA 接左輪組、ENB 接右輪組；不同 Arduino-ESP32 core 若不支援 `analogWrite()`，依安裝版本改用對應的 LEDC API。

```cpp
const int L_EN = 17;
const int R_EN = 18;

int leftTrim = 0;
int rightTrim = -12;

void setDrivePwm(int leftBase, int rightBase) {
  analogWrite(L_EN, constrain(leftBase + leftTrim, 0, 255));
  analogWrite(R_EN, constrain(rightBase + rightTrim, 0, 255));
}
```

## 9. Parking Event JSON Without Extra Library

```cpp
String makeEventJson(String eventType, String zone, int count, String result) {
  unsigned long t = millis();
  String json = "{";
  json += "\"event_type\":\"" + eventType + "\",";
  json += "\"time_ms\":" + String(t) + ",";
  json += "\"zone\":\"" + zone + "\",";
  json += "\"count\":" + String(count) + ",";
  json += "\"result\":\"" + result + "\"";
  json += "}";
  return json;
}

void setup() {
  Serial.begin(115200);
}

void loop() {
  Serial.println(makeEventJson("collision", "left_wall", 1, "running"));
  delay(2000);
}
```

## 10. Simple HTTP Status API

學校網路若需要帳密登入，ESP32-S3 可能不容易直接登入校園 Wi-Fi。課堂測試可先用手機熱點或小路由器；雲端版本再改成可連外的網路環境。

```cpp
#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

WebServer server(80);

int collisionCount = 0;
String state = "idle";

void handleStatus() {
  String json = "{";
  json += "\"state\":\"" + state + "\",";
  json += "\"collision_count\":" + String(collisionCount) + ",";
  json += "\"uptime_ms\":" + String(millis());
  json += "}";

  server.send(200, "application/json", json);
}

void handleCollision() {
  collisionCount++;
  state = "violation";
  handleStatus();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  server.on("/status", handleStatus);
  server.on("/collision", handleCollision);
  server.begin();
}

void loop() {
  server.handleClient();
}
```

## 11. Minimal State Machine for UCI 4WD Docking

```cpp
enum DockingState {
  APPROACH,
  ALIGN,
  REVERSE,
  PARKED,
  LEAVE,
  DONE,
  ERROR
};

DockingState state = APPROACH;
unsigned long stateStart = 0;

void setState(DockingState next) {
  state = next;
  stateStart = millis();
  Serial.printf("state=%d\n", state);
}

bool elapsed(unsigned long ms) {
  return millis() - stateStart >= ms;
}

void setup() {
  Serial.begin(115200);
  setState(APPROACH);
}

void loop() {
  switch (state) {
    case APPROACH:
      // forward();
      if (elapsed(1000)) setState(ALIGN);
      break;

    case ALIGN:
      // turnRight();
      if (elapsed(600)) setState(REVERSE);
      break;

    case REVERSE:
      // backward();
      if (elapsed(1200)) setState(PARKED);
      break;

    case PARKED:
      // stopCar();
      if (elapsed(3000)) setState(LEAVE);
      break;

    case LEAVE:
      // forward();
      if (elapsed(1000)) setState(DONE);
      break;

    case DONE:
      // stopCar();
      break;

    case ERROR:
      // stopCar();
      break;
  }
}
```
