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

bool running = false;
uint64_t elapsedMs = 0;
uint32_t previousTime = 0, lastPrint = 0;

void showTime() {
  Serial.printf("%s elapsed_ms=%llu\n", running ? "RUN" : "STOP",
                (unsigned long long)elapsedMs);
}
void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  delay(500);
  lastReading = digitalRead(BUTTON_PIN);
  changedAt = previousTime = lastPrint = millis();
  readyForPress = false;
  running = false;
  elapsedMs = 0;
  showTime();
}
void loop() {
  const uint32_t now = millis();
  // Accumulate only the interval spent running, including across millis wrap.
  if (running) elapsedMs += uint32_t(now - previousTime);
  previousTime = now;
  const bool change = pressed(now);
  if (change) running = !running;
  if (change || uint32_t(now - lastPrint) >= 200) {
    lastPrint = now;
    showTime();
  }
}

