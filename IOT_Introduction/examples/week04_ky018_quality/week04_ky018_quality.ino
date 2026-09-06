// Course example: two local light conditions, not a lux meter.
// Use only the ADC GPIO published for the verified course hardware profile.
const int PIN_LIGHT = -1;
const char* DEVICE_ID = "CHANGE_ME";
const unsigned long SAMPLE_INTERVAL_MS = 500;
const int SAMPLE_COUNT = 10;

int indoor[SAMPLE_COUNT];
int shade[SAMPLE_COUNT];
bool indoorReady = false;
bool shadeReady = false;
bool calibrated = false;
int threshold = -1;
bool shadeHigher = true;
int observedMin = 0;
int observedMax = 4095;
char mode = '0';  // 'i': indoor baseline; 's': shade baseline; 'v': new validation.
int indexInRun = 0;
unsigned long runNumber = 0;
unsigned long sampleNumber = 0;
unsigned long lastSampleMs = 0;

bool profileReady() { return PIN_LIGHT >= 0; }
bool rawUsable(int raw) { return raw > 0 && raw < 4095; }

int minimumOf(const int* values) {
  int result = values[0];
  for (int i = 1; i < SAMPLE_COUNT; i++) if (values[i] < result) result = values[i];
  return result;
}

int maximumOf(const int* values) {
  int result = values[0];
  for (int i = 1; i < SAMPLE_COUNT; i++) if (values[i] > result) result = values[i];
  return result;
}

void summarize(const char* label, const int* values) {
  long total = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) total += values[i];
  int lo = minimumOf(values), hi = maximumOf(values);
  Serial.printf("event=summary condition=%s n=%d min=%d max=%d mean=%.1f span=%d\n",
                label, SAMPLE_COUNT, lo, hi, total / float(SAMPLE_COUNT), hi - lo);
}

void updateCalibration() {
  calibrated = false;  // Never silently keep an old threshold after a new baseline.
  threshold = -1;
  if (!indoorReady || !shadeReady) {
    Serial.println("event=calibration status=blocked reason=baseline_missing");
    return;
  }
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    if (!rawUsable(indoor[i]) || !rawUsable(shade[i])) {
      Serial.println("event=calibration status=blocked reason=adc_endpoint_or_range");
      return;
    }
  }
  int iMin = minimumOf(indoor), iMax = maximumOf(indoor);
  int sMin = minimumOf(shade), sMax = maximumOf(shade);
  if (iMax < sMin) {
    shadeHigher = true;
    threshold = (iMax + sMin) / 2;
  } else if (sMax < iMin) {
    shadeHigher = false;
    threshold = (sMax + iMin) / 2;
  } else {
    Serial.println("event=calibration status=blocked reason=overlap");
    return;
  }
  observedMin = iMin < sMin ? iMin : sMin;
  observedMax = iMax > sMax ? iMax : sMax;
  calibrated = true;
  Serial.printf("event=calibration status=ready threshold=%d shade_higher=%s scope=local_only\n",
                threshold, shadeHigher ? "true" : "false");
}

const char* classify(int raw) {
  if (!rawUsable(raw) || !calibrated) return "UNDECIDED";
  bool lowSide = raw <= threshold;
  return (shadeHigher ? !lowSide : lowSide) ? "SHADE" : "INDOOR";
}

void startRun(char command) {
  if (mode != '0') {
    Serial.println("event=command status=rejected reason=run_busy");
    return;
  }
  if (command == 'i') { indoorReady = false; calibrated = false; threshold = -1; }
  if (command == 's') { shadeReady = false; calibrated = false; threshold = -1; }
  mode = command;
  indexInRun = 0;
  runNumber++;
  lastSampleMs = millis();  // First sample is not before the next interval.
  Serial.printf("event=run_started run=%lu mode=%c n=%d\n", runNumber, mode, SAMPLE_COUNT);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  if (!profileReady()) {
    Serial.println("week=4 sensor=ky018 status=blocked reason=gpio_profile_missing");
    return;
  }
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  Serial.printf("week=4 sensor=ky018 status=ready device=%s pin_light=%d adc_bits=12 interval_ms=%lu\n",
                DEVICE_ID, PIN_LIGHT, SAMPLE_INTERVAL_MS);
  Serial.println("commands=i:indoor_baseline s:shade_baseline v:new_validation");
}

void loop() {
  if (!profileReady()) return;
  // One character per loop; CR/LF are ignored, not new measurement requests.
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'i' || command == 's' || command == 'v') startRun(command);
    else if (command != '\r' && command != '\n' && command != ' ')
      Serial.println("event=command status=rejected reason=unknown_command");
  }
  if (mode == '0') return;
  unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_INTERVAL_MS) return;
  lastSampleMs = now;
  int raw = analogRead(PIN_LIGHT);
  sampleNumber++;
  if (mode == 'i') indoor[indexInRun] = raw;
  if (mode == 's') shade[indexInRun] = raw;
  const char* quality = "baseline_only";
  const char* reason = "not_classified";
  if (!rawUsable(raw)) { quality = "suspect"; reason = "adc_endpoint_or_range"; }
  else if (mode == 'v') {
    if (!calibrated) { quality = "insufficient"; reason = "not_calibrated"; }
    else if (raw < observedMin || raw > observedMax) {
      quality = "suspect"; reason = "outside_observed_span";
    } else { quality = "relative_only"; reason = "local_threshold"; }
  }
  Serial.printf("device=%s sensor=ky018 source=hardware run=%lu mode=%c sample=%lu index=%d "
                "uptime_ms=%lu light_raw=%d class=%s quality=%s reason=%s\n",
                DEVICE_ID, runNumber, mode, sampleNumber, indexInRun + 1, now, raw,
                mode == 'v' ? classify(raw) : "UNDECIDED", quality, reason);
  indexInRun++;
  if (indexInRun == SAMPLE_COUNT) {
    if (mode == 'i') { indoorReady = true; summarize("indoor", indoor); }
    if (mode == 's') { shadeReady = true; summarize("shade", shade); }
    if (mode != 'v') updateCalibration();
    Serial.printf("event=run_finished run=%lu mode=%c\n", runNumber, mode);
    mode = '0';
  }
}
