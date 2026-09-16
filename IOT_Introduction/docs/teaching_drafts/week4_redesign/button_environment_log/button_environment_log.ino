#include <Arduino.h>
#include <DHT.h>
#include <math.h>

const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
const int PIN_BUTTON = -1;
const int PIN_DHT = -1;
const bool REQUIRE_VALID_DHT = false;
const uint32_t DHT_INTERVAL_MS = 2500;
const uint32_t DEBOUNCE_MS = 40;
DHT dht(PIN_DHT, DHT11);

bool ready = false, armed = false, haveDht = false, dhtValid = false;
int lastButton = HIGH;
float temperature = NAN, humidity = NAN;
uint32_t changedAt = 0, dhtScheduledAt = 0, dhtFinishedAt = 0;
uint32_t attempt = 0, recordCount = 0;

bool pressed(uint32_t now) {
  const int level = digitalRead(PIN_BUTTON);
  if (level != lastButton) { lastButton = level; changedAt = now; }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return false;
  if (level == HIGH) { armed = true; return false; }
  if (!armed) return false;
  armed = false;
  return true;
}

void saveRecord(uint32_t now) {
  ++attempt;
  if (REQUIRE_VALID_DHT && (!haveDht || !dhtValid)) {
    Serial.printf("event=skipped attempt=%lu reason=dht_unavailable\n",
                  (unsigned long)attempt);
    return;
  }
  ++recordCount;
  const int raw = analogRead(PIN_LIGHT);
  Serial.printf("event=record attempt=%lu record=%lu raw=%d "
                "endpoint=%d temperature_c=%.1f humidity_pct=%.1f "
                "dht_valid=%d light_uptime_ms=%lu ",
                (unsigned long)attempt, (unsigned long)recordCount,
                raw, raw == 0 || raw == 4095, temperature, humidity,
                dhtValid, (unsigned long)now);
  if (haveDht)
    Serial.printf("dht_read_finished_ms=%lu dht_age_ms=%lu\n",
                  (unsigned long)dhtFinishedAt,
                  (unsigned long)uint32_t(now - dhtFinishedAt));
  else Serial.println("dht_age_ms=NA reason=not_read_yet");
}

void setup() {
  Serial.begin(115200);
  if (!PROFILE_CONFIRMED || PIN_LIGHT < 0 || PIN_BUTTON < 0 ||
      PIN_DHT < 0 || PIN_LIGHT == PIN_BUTTON || PIN_LIGHT == PIN_DHT ||
      PIN_BUTTON == PIN_DHT) {
    Serial.println("event=blocked reason=check_configuration");
    return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  dht.begin();
  changedAt = dhtScheduledAt = millis();
  ready = true;
  Serial.println("event=ready release_button_first");
}

void loop() {
  if (!ready) return;
  uint32_t now = millis();
  if (uint32_t(now - dhtScheduledAt) >= DHT_INTERVAL_MS) {
    dhtScheduledAt = now;
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();
    dhtFinishedAt = millis();
    haveDht = true;
    dhtValid = isfinite(temperature) && isfinite(humidity) &&
               temperature >= 0 && temperature <= 50 &&
               humidity >= 0 && humidity <= 100;
    Serial.printf("event=dht_attempt valid=%d finished_ms=%lu\n",
                  dhtValid, (unsigned long)dhtFinishedAt);
  }
  now = millis();
  if (pressed(now)) saveRecord(now);
}
