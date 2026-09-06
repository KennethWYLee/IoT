// Fill in only the GPIO value published in the verified course hardware profile.
// Keep -1 when no verified profile is available.
const int PIN_TEST_OUTPUT = -1;
const unsigned long PHASE_DURATION_MS = 10000;

bool outputHigh = false;
unsigned long phaseStartedMs = 0;
unsigned long cycleNumber = 1;

bool profileReady() {
  return PIN_TEST_OUTPUT >= 0;
}

void reportPhase() {
  Serial.printf(
    "cycle=%lu phase=%s expected_voltage=%s measure_now=true\n",
    cycleNumber,
    outputHigh ? "HIGH" : "LOW",
    outputHigh ? "near_3.3V" : "near_0V"
  );
}

void setup() {
  Serial.begin(115200);
  delay(500);

  if (!profileReady()) {
    Serial.println("week=3 status=blocked reason=gpio_profile_missing");
    return;
  }

  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  digitalWrite(PIN_TEST_OUTPUT, LOW);
  outputHigh = false;
  phaseStartedMs = millis();

  Serial.printf(
    "week=3 pin_test_output=%d startup=LOW phase_duration_ms=%lu\n",
    PIN_TEST_OUTPUT,
    PHASE_DURATION_MS
  );
  reportPhase();
}

void loop() {
  if (!profileReady()) return;

  unsigned long now = millis();
  if (now - phaseStartedMs < PHASE_DURATION_MS) return;

  phaseStartedMs = now;
  outputHigh = !outputHigh;
  digitalWrite(PIN_TEST_OUTPUT, outputHigh ? HIGH : LOW);
  if (!outputHigh) cycleNumber++;
  reportPhase();
}
