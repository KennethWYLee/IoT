#include <Arduino.h>
#include <DHT.h>

// Assemble this week's verified 3.3 V DHT11 module with all power disconnected.
const int PIN_DHT = 10;
const bool DHT_WIRING_CONFIRMED = false;
DHT dht(PIN_DHT, DHT11);
uint32_t lastDht = 0, lastFrame = 0;
bool dhtValid = false, firstFrame = true;
float temperature = NAN, humidity = NAN;
const int PIN_LIGHT = 4;
int raw = 0;
void readEnvironment() {
  raw = analogRead(PIN_LIGHT);
  const uint32_t now = millis();
  if (!DHT_WIRING_CONFIRMED || uint32_t(now - lastDht) < 2500) return;
  lastDht = now;
  temperature = dht.readTemperature(); humidity = dht.readHumidity();
  dhtValid = isfinite(temperature) && isfinite(humidity) && humidity >= 0 && humidity <= 100;
  if (!dhtValid) { temperature = NAN; humidity = NAN; }
}

char lines[6][32]{};
void buildLines() {
  for (auto& line : lines) line[0] = 0;
  snprintf(lines[0], sizeof(lines[0]), "RAW:%d", raw);
  if (dhtValid) {
    snprintf(lines[1], sizeof(lines[1]), "T:%.1f C", temperature);
    snprintf(lines[2], sizeof(lines[2]), "RH:%.1f %%", humidity);
  } else {
    snprintf(lines[1], sizeof(lines[1]), "T:-- C");
    snprintf(lines[2], sizeof(lines[2]), "RH:-- %%");
    snprintf(lines[3], sizeof(lines[3]), "WAIT DHT");
  }
  if (!DHT_WIRING_CONFIRMED) snprintf(lines[3], sizeof(lines[3]), "CHECK DHT WIRING");
}
void showReading() {
  buildLines();
  for (const auto& line : lines) if (line[0]) Serial.println(line);
  Serial.println("");
}
void setup() {
  Serial.begin(115200);
  analogReadResolution(12); analogSetPinAttenuation(PIN_LIGHT, ADC_11db);


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
