#include <DHT.h>
#include <math.h>

// Do not set a GPIO or enable this gate until the exact module is approved.
const int PIN_DHT = -1;
const bool MODULE_PROFILE_CONFIRMED = false;
const char* DEVICE_ID = "CHANGE_ME";
const unsigned long READ_INTERVAL_MS = 2500;
// Classroom warning policy, NOT the DHT11 measurement/operating specification.
const float ROOM_MIN_C = 10.0f;
const float ROOM_MAX_C = 40.0f;
const float JUMP_C = 5.0f;
const float JUMP_RH_POINTS = 10.0f;

DHT dht(PIN_DHT, DHT11);
bool injectFailure = false;
bool havePrevious = false;
float previousC = 0.0f;
float previousRh = 0.0f;
unsigned long previousMs = 0;
unsigned long lastReadMs = 0;
unsigned long sampleNumber = 0;

bool profileReady() {
  return PIN_DHT >= 0 && MODULE_PROFILE_CONFIRMED;
}

void reportReading(float temperatureC, float humidityPct, unsigned long now, bool injected) {
  const char* quality = "usable";
  const char* reason = "basic_checks_passed";
  bool valid = true;
  // Missing is not zero. Never substitute the previous value for this row.
  if (!isfinite(temperatureC) || !isfinite(humidityPct)) {
    valid = false; quality = "invalid";
    reason = injected ? "injected_read_failed" : "read_failed";
  } else if (humidityPct < 0.0f || humidityPct > 100.0f) {
    valid = false; quality = "invalid"; reason = "rh_out_of_bounds";
  } else if (temperatureC < ROOM_MIN_C || temperatureC > ROOM_MAX_C) {
    quality = "suspect"; reason = "outside_classroom_policy";
  } else if (havePrevious && now - previousMs <= 2 * READ_INTERVAL_MS &&
             (fabsf(temperatureC - previousC) > JUMP_C ||
              fabsf(humidityPct - previousRh) > JUMP_RH_POINTS)) {
    quality = "suspect"; reason = "abrupt_change";
  }
  Serial.printf("device=%s sensor=dht11 source=%s sample=%lu uptime_ms=%lu "
                "temperature_c=%.1f humidity_pct=%.1f valid=%s quality=%s reason=%s\n",
                DEVICE_ID, injected ? "injected" : "hardware", sampleNumber, now,
                temperatureC, humidityPct, valid ? "true" : "false", quality, reason);
  // Only adjacent real finite/basic-range records enter the jump comparison.
  havePrevious = valid && !injected;
  if (havePrevious) {
    previousC = temperatureC; previousRh = humidityPct; previousMs = now;
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  if (!profileReady()) {
    Serial.println("week=4 sensor=dht11 status=blocked reason=module_or_gpio_profile_missing");
    return;  // No dht.begin(), pinMode(), or sensor transaction before approval.
  }
  dht.begin();
  lastReadMs = millis();  // Give the powered sensor an initial 2.5-second wait.
  Serial.printf("week=4 sensor=dht11 status=ready device=%s pin_dht=%d interval_ms=%lu\n",
                DEVICE_ID, PIN_DHT, READ_INTERVAL_MS);
  Serial.println("commands=f:inject_missing r:resume_hardware");
}

void loop() {
  if (!profileReady()) return;
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'f' || command == 'r') {
      injectFailure = command == 'f';
      havePrevious = false;
      lastReadMs = millis();  // Mode change also waits before the next sample.
      Serial.printf("event=mode source=%s next_read_after_ms=%lu\n",
                    injectFailure ? "injected" : "hardware", READ_INTERVAL_MS);
    } else if (command != '\r' && command != '\n' && command != ' ') {
      Serial.println("event=command status=rejected reason=unknown_command");
    }
  }
  unsigned long now = millis();
  if (now - lastReadMs < READ_INTERVAL_MS) return;
  lastReadMs = now;
  sampleNumber++;
  float temperatureC = NAN, humidityPct = NAN;
  if (!injectFailure) {
    humidityPct = dht.readHumidity();
    temperatureC = dht.readTemperature();  // Same cached frame, not another 2.5 s cycle.
  }
  reportReading(temperatureC, humidityPct, now, injectFailure);
}
