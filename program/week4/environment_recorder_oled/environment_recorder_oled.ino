#include <Arduino.h>
#include <DHT.h>
#include <Wire.h>
#include <U8g2lib.h>
const int PIN_SDA = 8, PIN_SCL = 9;
#define OLED_CONTROLLER 1306
#if OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
#elif OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE);
#else
#error Select the controller confirmed for this display.
#endif
uint8_t oledAddress = 0;
bool oledReady = false, attemptedOled = false;
uint32_t lastOledTry = 0;
bool acknowledge(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}
bool startDisplay() {
  const bool a = acknowledge(0x3C), b = acknowledge(0x3D);
  if (a == b) return false;
  oledAddress = a ? 0x3C : 0x3D;
  oled.setI2CAddress(oledAddress << 1);
  oled.begin(); oled.setBusClock(100000); oled.setFont(u8g2_font_6x10_tf);
  return acknowledge(oledAddress);
}

// 核對實物三條線及 3.3 V 相容性後，才啟用 DHT。
const int PIN_DHT = 10, PIN_BUTTON = 5;
const bool DHT_WIRING_CONFIRMED = false;
const float TEMP_LIMIT_C = 28.0f, RH_LIMIT_PERCENT = 65.0f;
DHT dht(PIN_DHT, DHT11);
enum State { WAIT, NORMAL, ALERT, UNKNOWN };
State state = WAIT;
bool dhtValid = false, alarmOpen = false, acknowledged = false, recording = true;
float temperature = NAN, humidity = NAN;
uint32_t lastDht = 0, lastFrame = 0, sessionStart = 0, lastAccount = 0;
uint32_t alarmCount = 0, alarmMs = 0;
bool firstFrame = true;
int lastReading = HIGH, stableButton = HIGH;
bool releaseSeen = false;
uint32_t changedAt = 0;

char lines[6][32]{};

bool limitsValid() {
  return isfinite(TEMP_LIMIT_C) && isfinite(RH_LIMIT_PERCENT) &&
         RH_LIMIT_PERCENT >= 0 && RH_LIMIT_PERCENT <= 100;
}
const char* stateName() {
  return state == WAIT ? "WAIT" : state == NORMAL ? "NORMAL" : state == ALERT ? "ALERT" : "UNKNOWN";
}
void accountTime(uint32_t now) {
  // 累計程式維持 ALERT 的時間；UNKNOWN 不累計，不等於物理超標的精確時間。
  if (recording && state == ALERT) alarmMs += uint32_t(now - lastAccount);
  lastAccount = now;
}

void startSession() {
  sessionStart = lastAccount = lastDht = millis();
  alarmCount = alarmMs = 0; alarmOpen = acknowledged = false;
  state = WAIT; dhtValid = false; temperature = humidity = NAN;
  recording = true; firstFrame = true;

}


bool buttonPressed() {
  const uint32_t now = millis();
  const int reading = digitalRead(PIN_BUTTON);
  if (reading != lastReading) { lastReading = reading; changedAt = now; }
  if (uint32_t(now - changedAt) < 40) return false;
  if (reading == HIGH) releaseSeen = true;
  if (reading == stableButton) return false;
  stableButton = reading;
  if (stableButton == LOW && releaseSeen) { releaseSeen = false; return true; }
  return false;
}
void readEnvironment() {
  const uint32_t now = millis();
  if (uint32_t(now - lastDht) < 2500) return;
  lastDht = now;
  temperature = humidity = NAN;
  if (DHT_WIRING_CONFIRMED) {
    temperature = dht.readTemperature(); humidity = dht.readHumidity();
  }
  accountTime(millis());
  dhtValid = isfinite(temperature) && isfinite(humidity) && humidity >= 0 && humidity <= 100;

  if (!dhtValid || !limitsValid()) {
    temperature = humidity = NAN; dhtValid = false; state = UNKNOWN;
  } else if (temperature > TEMP_LIMIT_C || humidity > RH_LIMIT_PERCENT) {
    state = ALERT;
    if (recording && !alarmOpen) {
      alarmOpen = true; acknowledged = false; ++alarmCount;
    }
  } else {
    state = NORMAL;
    if (recording && alarmOpen) { alarmOpen = false; acknowledged = false; }
  }

}
void buildLines() {
  for (auto& line : lines) line[0] = 0;
  if (dhtValid) snprintf(lines[0], sizeof(lines[0]), "T:%.1fC RH:%.1f%%", temperature, humidity);
  else snprintf(lines[0], sizeof(lines[0]), "T:--C RH:--%%");
  snprintf(lines[1], sizeof(lines[1]), "%s ACK:%s", stateName(), acknowledged ? "YES" : "NO");
  snprintf(lines[2], sizeof(lines[2]), "COUNT:%lu", (unsigned long)alarmCount);
  snprintf(lines[3], sizeof(lines[3]), "TIME:%.1fs", alarmMs / 1000.0f);
  if (!DHT_WIRING_CONFIRMED) snprintf(lines[4], sizeof(lines[4]), "CHECK DHT WIRING");
  else if (!limitsValid()) snprintf(lines[4], sizeof(lines[4]), "CHECK LIMITS");
}
void showReading() {
  buildLines();
  oled.clearBuffer();
  for (int i = 0; i < 6; ++i) if (lines[i][0]) oled.drawStr(0, (i + 1) * 10, lines[i]);
  oled.sendBuffer();
}
void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  lastReading = stableButton = digitalRead(PIN_BUTTON); changedAt = millis();
  Wire.begin(PIN_SDA, PIN_SCL); Wire.setClock(100000); Wire.setTimeOut(20);
  if (DHT_WIRING_CONFIRMED) dht.begin();
  lastFrame = millis(); startSession();
}
void loop() {
  accountTime(millis()); readEnvironment();
  const bool pressed = buttonPressed();
  if (pressed && recording && alarmOpen && !acknowledged) {
    acknowledged = true; firstFrame = true;
  }
  // OLED 故障不阻擋 DHT、按鈕及警報累計。
  if (oledReady && !acknowledge(oledAddress)) oledReady = false;
  if (!oledReady && (!attemptedOled || uint32_t(millis() - lastOledTry) >= 2000)) {
    attemptedOled = true; lastOledTry = millis(); oledReady = startDisplay(); firstFrame = true;
    if (!oledReady) Serial.println("# OLED: check power, SCK/SDA and controller");
  }
  const uint32_t now = millis();
  if (firstFrame || uint32_t(now - lastFrame) >= 200) {
    firstFrame = false; lastFrame = now;
    if (oledReady) showReading();
  }
}
