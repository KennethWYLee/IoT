#include <Arduino.h>

// Fill only after checking the actual board and the powered-off wiring.
const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
const int PIN_BUTTON = -1;
const int SAMPLES_PER_PRESS = 1;
const uint32_t SAMPLE_GAP_MS = 200;
const uint32_t DEBOUNCE_MS = 40;

bool ready = false, armed = false, collecting = false;
int lastButton = HIGH, sampleIndex = 0;
uint32_t changedAt = 0, lastSampleAt = 0, batch = 0;

bool pressed(uint32_t now) {
  const int level = digitalRead(PIN_BUTTON);
  if (level != lastButton) {
    lastButton = level;
    changedAt = now;
  }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return false;
  if (level == HIGH) { armed = true; return false; }
  if (!armed) return false;
  armed = false;
  return true;
}

void capture(uint32_t now) {
  const int raw = analogRead(PIN_LIGHT);
  ++sampleIndex;
  Serial.printf("event=sample batch=%lu index=%d raw=%d "
                "endpoint=%d uptime_ms=%lu\n",
                (unsigned long)batch, sampleIndex, raw,
                raw == 0 || raw == 4095, (unsigned long)now);
  lastSampleAt = now;
  if (sampleIndex >= SAMPLES_PER_PRESS) collecting = false;
}

void setup() {
  Serial.begin(115200);
  if (!PROFILE_CONFIRMED || PIN_LIGHT < 0 || PIN_BUTTON < 0 ||
      PIN_LIGHT == PIN_BUTTON || SAMPLES_PER_PRESS < 1 ||
      SAMPLES_PER_PRESS > 10) {
    Serial.println("event=blocked reason=check_configuration");
    return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  changedAt = millis();
  ready = true;
  Serial.println("event=ready release_button_first");
}

void loop() {
  if (!ready) return;
  const uint32_t now = millis();
  if (pressed(now)) {
    if (collecting) {
      Serial.println("event=ignored reason=batch_busy");
    } else {
      ++batch;
      sampleIndex = 0;
      collecting = true;
      capture(now);
    }
  }
  if (collecting && uint32_t(now - lastSampleAt) >= SAMPLE_GAP_MS)
    capture(now);
}
