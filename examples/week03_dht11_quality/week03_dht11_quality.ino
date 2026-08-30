#include <DHT.h>

// 由教師公布的DHT11 target-test profile填入；未公布時保持-1。
const int PIN_DHT = -1;
const int DHT_TYPE = DHT11;
const unsigned long READ_INTERVAL_MS = 2500;
const char* DEVICE_ID = "student01";

DHT dht(PIN_DHT, DHT_TYPE);
unsigned long lastReadMs = 0;

bool pinProfileReady() {
  return PIN_DHT >= 0;
}

void reportReading(float temperatureC, float humidityPct) {
  if (isnan(temperatureC) || isnan(humidityPct)) {
    Serial.printf("device=%s uptime_ms=%lu sensor=dht11 "
                  "temperature_c=nan humidity_pct=nan "
                  "valid=false reason=read_failed\n", DEVICE_ID, millis());
    return;
  }

  Serial.printf("device=%s uptime_ms=%lu sensor=dht11 "
                "temperature_c=%.1f humidity_pct=%.1f "
                "valid=true reason=none\n",
                DEVICE_ID, millis(), temperatureC, humidityPct);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!pinProfileReady()) {
    Serial.println("week=3 sensor=dht11 status=blocked reason=gpio_profile_missing");
    return;
  }
  dht.begin();
  Serial.printf("week=3 sensor=dht11 status=ready interval_ms=%lu\n",
                READ_INTERVAL_MS);
}

void loop() {
  if (!pinProfileReady()) return;
  unsigned long now = millis();
  if (now - lastReadMs < READ_INTERVAL_MS) return;
  lastReadMs = now;
  float humidityPct = dht.readHumidity();
  float temperatureC = dht.readTemperature();
  reportReading(temperatureC, humidityPct);
}
