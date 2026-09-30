#include <Arduino.h>

// Confirm the actual board, wiring and fresh light measurements first.
const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1, PIN_BUTTON = -1;
const int INDOOR_MIN = -1, INDOOR_MAX = -1;
const int SHADE_MIN = -1, SHADE_MAX = -1;
const uint32_t DEBOUNCE_MS = 40, READ_MS = 50;
bool ready = false, running = false, armed = false;
bool known = false, wasShaded = false, shadeHigher = true;
int lastButton = HIGH, threshold = 0;
uint32_t changedAt = 0, lastRead = 0, count = 0;

bool pressed(uint32_t now) {
  const int level = digitalRead(PIN_BUTTON);
  if (level != lastButton) { lastButton = level; changedAt = now; }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return false;
  if (level == HIGH) { armed = true; return false; }
  if (!armed) return false;
  armed = false;
  return true;
}

void report() {
  Serial.printf("mode=%s count=%lu\n", running ? "RUNNING" : "PAUSED",
                (unsigned long)count);
}

void setup() {
  Serial.begin(115200);
  if (!PROFILE_CONFIRMED || PIN_LIGHT < 0 || PIN_BUTTON < 0 ||
      PIN_LIGHT == PIN_BUTTON || INDOOR_MIN <= 0 || SHADE_MIN <= 0 ||
      INDOOR_MAX >= 4095 || SHADE_MAX >= 4095 ||
      INDOOR_MIN > INDOOR_MAX || SHADE_MIN > SHADE_MAX) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  if (INDOOR_MAX < SHADE_MIN) {
    threshold = (INDOOR_MAX + SHADE_MIN) / 2;
  } else if (SHADE_MAX < INDOOR_MIN) {
    shadeHigher = false;
    threshold = (SHADE_MAX + INDOOR_MIN) / 2;
  } else {
    Serial.println("event=blocked reason=overlapping_ranges"); return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  changedAt = lastRead = millis();
  ready = true;
  report();
}

void loop() {
  if (!ready) return;
  const uint32_t now = millis();
  if (pressed(now)) {
    running = !running;
    known = false; // Use the next reading as a starting state, not a new event.
    report();
  }
  if (uint32_t(now - lastRead) < READ_MS) return;
  lastRead = now;
  const int raw = analogRead(PIN_LIGHT);
  if (raw == 0 || raw == 4095) {
    if (known) Serial.println("event=unclassified reason=adc_endpoint");
    known = false;
    return;
  }
  const bool shaded = shadeHigher ? raw > threshold : raw <= threshold;
  // Count a transition, not every loop that sees a shaded sensor.
  if (running && known && !wasShaded && shaded) { ++count; report(); }
  wasShaded = shaded; // Follow the actual state even while paused.
  known = true;
}
