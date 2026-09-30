// Relative light classification: calibration ranges come from the student's log.
// No pin is approved by compiling this program. Keep -1 until a profile is published.
#include <Arduino.h>

const int PIN_LIGHT = -1;
const char *DEVICE_ID = "CHANGE_ME";
const int INDOOR_MIN = -1;
const int INDOOR_MAX = -1;
const int SHADE_MIN = -1;
const int SHADE_MAX = -1;
const unsigned long SAMPLE_INTERVAL_MS = 500;
bool ready = false;
bool shadeHigher = true;
int threshold = -1;
unsigned long lastSampleMs = 0;
unsigned long sample = 0;

bool configureCalibration() {
  // End-point values are excluded by this classroom policy, not proof of a fault.
  if (INDOOR_MIN <= 0 || SHADE_MIN <= 0 || INDOOR_MAX >= 4095 ||
      SHADE_MAX >= 4095 || INDOOR_MIN > INDOOR_MAX || SHADE_MIN > SHADE_MAX)
    return false;
  if (INDOOR_MAX < SHADE_MIN) {
    shadeHigher = true;
    threshold = (INDOOR_MAX + SHADE_MIN) / 2;
  } else if (SHADE_MAX < INDOOR_MIN) {
    shadeHigher = false;
    threshold = (SHADE_MAX + INDOOR_MIN) / 2;
  } else return false; // Overlap or touching ranges cannot be separated here.
  return true;
}

const char *classifyLight(int raw) {
  if (!ready || raw <= 0 || raw >= 4095) return "UNDECIDED";
  const bool lowSide = raw <= threshold;
  return (shadeHigher ? !lowSide : lowSide) ? "SHADE" : "INDOOR";
}

const char *chineseLabel(const char *state) {
  if (strcmp(state, "SHADE") == 0) return "遮光";
  if (strcmp(state, "INDOOR") == 0) return "室內光";
  return "未判定";
}

const char *qualityReason(int raw) {
  if (raw <= 0 || raw >= 4095) return "adc_endpoint";
  const int observedMin = min(INDOOR_MIN, SHADE_MIN);
  const int observedMax = max(INDOOR_MAX, SHADE_MAX);
  if (raw < observedMin || raw > observedMax) return "outside_observed_span";
  const bool inIndoor = raw >= INDOOR_MIN && raw <= INDOOR_MAX;
  const bool inShade = raw >= SHADE_MIN && raw <= SHADE_MAX;
  if (!inIndoor && !inShade) return "between_baselines";
  return "within_baseline_range";
}

void setup() {
  Serial.begin(115200);
  delay(500); // Only startup; sampling below does not block for half a second.
  if (PIN_LIGHT < 0) {
    Serial.println("week=3 status=blocked reason=gpio_profile_missing");
    return;
  }
  if (!configureCalibration()) {
    Serial.println("week=3 status=blocked reason=calibration_missing_or_overlap");
    return;
  }
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  ready = true;
  lastSampleMs = millis();
  Serial.printf("week=3 status=ready device=%s threshold=%d shade_higher=%s interval_ms=%lu scope=local_only\n",
                DEVICE_ID, threshold, shadeHigher ? "true" : "false", SAMPLE_INTERVAL_MS);
}

void loop() {
  if (!ready) return;
  const unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_INTERVAL_MS) return;
  lastSampleMs = now; // Late iterations take one current sample, not fake catch-up samples.
  const int raw = analogRead(PIN_LIGHT);
  const char *state = classifyLight(raw);
  const char *reason = qualityReason(raw);
  const bool plausible = raw > 0 && raw < 4095;
  Serial.printf("device=%s sensor=ky018 source=hardware sample=%lu uptime_ms=%lu light_raw=%d threshold=%d class=%s label=%s valid=%s quality=%s reason=%s\n",
                DEVICE_ID, ++sample, now, raw, threshold, state, chineseLabel(state),
                plausible ? "true" : "false",
                strcmp(reason, "within_baseline_range") == 0 ? "relative_only" : "suspect", reason);
}
