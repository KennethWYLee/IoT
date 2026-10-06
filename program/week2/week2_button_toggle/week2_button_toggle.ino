#include <Arduino.h>

const int BUTTON_PIN = 5;
const uint32_t DEBOUNCE_MS = 40;
int lastReading = HIGH;
uint32_t changedAt = 0;
bool readyForPress = false;

bool pressed(uint32_t now) {
  const int reading = digitalRead(BUTTON_PIN);
  if (reading != lastReading) { lastReading = reading; changedAt = now; }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return false;
  if (reading == HIGH) { readyForPress = true; return false; }
  if (!readyForPress) return false;
  readyForPress = false;
  return true;
}

bool isOn = false;
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  delay(500);
  lastReading = digitalRead(BUTTON_PIN);
  changedAt = millis();
  readyForPress = false;
  isOn = false;
  Serial.println("OFF");
}
void loop() {
  if (!pressed(millis())) return;
  isOn = !isOn;
  Serial.println(isOn ? "ON" : "OFF");
}

