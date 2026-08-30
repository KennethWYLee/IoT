// Fill in only the ADC GPIO published in the verified course hardware profile.
// Keep -1 when no verified profile is available.
const int PIN_LIGHT = -1;
const unsigned long SAMPLE_INTERVAL_MS = 500;
const char* DEVICE_ID = "CHANGE_ME";

unsigned long lastSampleMs = 0;
unsigned long sampleNumber = 0;

bool profileReady() {
  return PIN_LIGHT >= 0;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  if (!profileReady()) {
    Serial.println("week=3 sensor=ky018 status=blocked reason=gpio_profile_missing");
    return;
  }

  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  Serial.printf(
    "week=3 sensor=ky018 status=ready device=%s pin_light=%d "
    "adc_bits=12 interval_ms=%lu\n",
    DEVICE_ID,
    PIN_LIGHT,
    SAMPLE_INTERVAL_MS
  );
}

void loop() {
  if (!profileReady()) return;

  unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_INTERVAL_MS) return;
  lastSampleMs = now;
  sampleNumber++;

  int lightRaw = analogRead(PIN_LIGHT);
  Serial.printf(
    "device=%s sample=%lu uptime_ms=%lu light_raw=%d\n",
    DEVICE_ID,
    sampleNumber,
    now,
    lightRaw
  );
}
