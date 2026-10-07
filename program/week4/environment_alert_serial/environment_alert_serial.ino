#include <Arduino.h>
#include <DHT.h>

// Assemble this week's verified 3.3 V DHT11 module with all power disconnected.
const int PIN_DHT = 10;
const bool DHT_WIRING_CONFIRMED = false;
DHT dht(PIN_DHT, DHT11);
uint32_t lastDht = 0, lastFrame = 0;
bool dhtValid = false, firstFrame = true;
float temperature = NAN, humidity = NAN;

void readEnvironment() {

  const uint32_t now = millis();
  if (!DHT_WIRING_CONFIRMED || uint32_t(now - lastDht) < 2500) return;
  lastDht = now;
  temperature = dht.readTemperature(); humidity = dht.readHumidity();
  dhtValid = isfinite(temperature) && isfinite(humidity) && humidity >= 0 && humidity <= 100;
  if (!dhtValid) { temperature = NAN; humidity = NAN; }
}
// Teaching thresholds, not health or equipment safety limits.
const float TEMP_LIMIT_C = 28.0f, RH_LIMIT_PERCENT = 65.0f;
bool limitsValid() {
  return isfinite(TEMP_LIMIT_C) && isfinite(RH_LIMIT_PERCENT) &&
         RH_LIMIT_PERCENT >= 0 && RH_LIMIT_PERCENT <= 100;
}

char lines[6][32]{};
void buildLines() {
  for (auto& line : lines) line[0] = 0;
  if (dhtValid) snprintf(lines[0], sizeof(lines[0]), "T:%.1fC RH:%.1f%%", temperature, humidity);
  else snprintf(lines[0], sizeof(lines[0]), "T:--C RH:--%%");
  snprintf(lines[1], sizeof(lines[1]), "LIMIT T:%.1fC", TEMP_LIMIT_C);
  snprintf(lines[2], sizeof(lines[2]), "LIMIT RH:%.1f%%", RH_LIMIT_PERCENT);
  if (!DHT_WIRING_CONFIRMED) snprintf(lines[3], sizeof(lines[3]), "CHECK DHT WIRING");
  else if (!limitsValid()) snprintf(lines[3], sizeof(lines[3]), "CHECK LIMITS");
  else if (!dhtValid) snprintf(lines[3], sizeof(lines[3]), "WAIT DHT");
  else {
    const bool hot = temperature > TEMP_LIMIT_C, humid = humidity > RH_LIMIT_PERCENT;
    snprintf(lines[3], sizeof(lines[3]), "TEMP:%s", hot ? "HIGH" : "NORMAL");
    snprintf(lines[4], sizeof(lines[4]), "RH:%s", humid ? "HIGH" : "NORMAL");
    snprintf(lines[5], sizeof(lines[5]), "%s", hot || humid ? "ALERT" : "NORMAL");
  }
}
void showReading() {
  buildLines();
  for (const auto& line : lines) if (line[0]) Serial.println(line);
  Serial.println("");
}
void setup() {
  Serial.begin(115200);



  if (DHT_WIRING_CONFIRMED) dht.begin();
  lastFrame = lastDht = millis();
}
void loop() {

  readEnvironment();
  const bool captured = false;
  const uint32_t now = millis();
  if (firstFrame || captured || uint32_t(now - lastFrame) >= 1000) {
    firstFrame = false; lastFrame = now; showReading();

  }
}
