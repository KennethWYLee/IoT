#include <Arduino.h>
#include <DHT.h>

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
  for (const auto& line : lines) if (line[0]) Serial.println(line);
  Serial.println("");
}
void setup() {
  Serial.begin(115200);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  lastReading = stableButton = digitalRead(PIN_BUTTON); changedAt = millis();

  if (DHT_WIRING_CONFIRMED) dht.begin();
  lastFrame = millis(); startSession();
}
void loop() {
  accountTime(millis()); readEnvironment();
  const bool pressed = buttonPressed();
  if (pressed && recording && alarmOpen && !acknowledged) {
    acknowledged = true; firstFrame = true;
  }

  const uint32_t now = millis();
  if (firstFrame || uint32_t(now - lastFrame) >= 1000) {
    firstFrame = false; lastFrame = now;
    showReading();
  }
}
