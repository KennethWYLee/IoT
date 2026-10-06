#include <Arduino.h>

// Same GPIO5-to-button-to-GND wiring as week2_button_state.
const int BUTTON_PIN = 5;
const uint32_t DEBOUNCE_MS = 40;
uint32_t count = 0;
int lastReading = HIGH;
int displayedReading = HIGH;
uint32_t changedAt = 0;
bool readyForPress = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  delay(500);
  count = 0;
  lastReading = digitalRead(BUTTON_PIN);
  changedAt = millis();
  readyForPress = false;
  displayedReading = lastReading;
  Serial.print(displayedReading == LOW ? "pressed count=" : "released count=");
  Serial.println(count);
}

void loop() {
  const uint32_t now = millis();
  const int reading = digitalRead(BUTTON_PIN);
  if (reading != lastReading) {
    lastReading = reading;
    changedAt = now;
  }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return;

  // Require a stable release, including after startup, before another press.
  if (reading == HIGH) {
    readyForPress = true;
  } else if (readyForPress) {
    readyForPress = false;
    count++;
  }
  if (reading != displayedReading) {
    displayedReading = reading;
    Serial.print(reading == LOW ? "pressed count=" : "released count=");
    Serial.println(count);
  }
}
