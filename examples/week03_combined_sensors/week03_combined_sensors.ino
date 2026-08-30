#include <DHT.h>

// 由教師公布的target-test profile填入；未公布時保持-1。
const int PIN_LIGHT = -1;
const int PIN_DHT = -1;
const int DHT_TYPE = DHT11;
const unsigned long READ_INTERVAL_MS = 2500;
const char* DEVICE_ID = "student01";

// 1代表raw隨光線增加；-1代表raw隨光線降低；0代表尚未填寫。
const int LIGHT_DIRECTION = 0;
const int LIGHT_THRESHOLD_DARK_NORMAL = -1;
const int LIGHT_THRESHOLD_NORMAL_BRIGHT = -1;
const bool LIGHT_PROFILES_SEPARATED = false;

DHT dht(PIN_DHT, DHT_TYPE);
unsigned long lastReadMs = 0;

bool pinProfileReady() {
  return PIN_LIGHT >= 0 && PIN_DHT >= 0 && PIN_LIGHT != PIN_DHT;
}

bool lightConfigured() {
  bool directionReady = LIGHT_DIRECTION == 1 || LIGHT_DIRECTION == -1;
  bool thresholdsReady = LIGHT_THRESHOLD_DARK_NORMAL >= 0 &&
                         LIGHT_THRESHOLD_DARK_NORMAL <= 4095 &&
                         LIGHT_THRESHOLD_NORMAL_BRIGHT >= 0 &&
                         LIGHT_THRESHOLD_NORMAL_BRIGHT <= 4095;
  bool thresholdOrder =
      (LIGHT_DIRECTION == 1 &&
       LIGHT_THRESHOLD_DARK_NORMAL < LIGHT_THRESHOLD_NORMAL_BRIGHT) ||
      (LIGHT_DIRECTION == -1 &&
       LIGHT_THRESHOLD_DARK_NORMAL > LIGHT_THRESHOLD_NORMAL_BRIGHT);
  return directionReady && thresholdsReady && thresholdOrder;
}

const char* classifyLight(int raw) {
  if (LIGHT_DIRECTION == 1) {
    if (raw <= LIGHT_THRESHOLD_DARK_NORMAL) return "DARK";
    if (raw >= LIGHT_THRESHOLD_NORMAL_BRIGHT) return "BRIGHT";
  } else {
    if (raw >= LIGHT_THRESHOLD_DARK_NORMAL) return "DARK";
    if (raw <= LIGHT_THRESHOLD_NORMAL_BRIGHT) return "BRIGHT";
  }
  return "NORMAL";
}

void reportCombined() {
  int lightRaw = analogRead(PIN_LIGHT);
  float humidityPct = dht.readHumidity();
  float temperatureC = dht.readTemperature();

  const char* lightState = "UNKNOWN";
  bool valid = true;
  const char* reason = "none";

  if (!lightConfigured()) {
    valid = false;
    reason = "light_not_calibrated";
  } else if (!LIGHT_PROFILES_SEPARATED) {
    valid = false;
    reason = "light_profiles_overlap";
  } else {
    lightState = classifyLight(lightRaw);
    if (isnan(temperatureC) || isnan(humidityPct)) {
      valid = false;
      reason = "dht_read_failed";
    }
  }

  Serial.printf("device=%s uptime_ms=%lu light_raw=%d "
                "light_state=%s temperature_c=%.1f humidity_pct=%.1f "
                "valid=%s reason=%s\n",
                DEVICE_ID, millis(), lightRaw, lightState,
                temperatureC, humidityPct,
                valid ? "true" : "false", reason);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!pinProfileReady()) {
    Serial.println("week=3 mode=combined status=blocked reason=gpio_profile_missing");
    return;
  }
  analogReadResolution(12);
  dht.begin();
  Serial.println("week=3 mode=combined status=ready");
}

void loop() {
  if (!pinProfileReady()) return;
  unsigned long now = millis();
  if (now - lastReadMs < READ_INTERVAL_MS) return;
  lastReadMs = now;
  reportCombined();
}
