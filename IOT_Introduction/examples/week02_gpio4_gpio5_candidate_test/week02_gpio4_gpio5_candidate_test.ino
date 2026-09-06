// BOARD-T01 candidate profile test.
// These pin numbers become a student profile only after the physical tests pass.
const int PIN_BUTTON = 4;
const int PIN_TEST_OUTPUT = 5;

bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;

void setup() {
  Serial.begin(115200);
  delay(500);

  // Load LOW into the output latch before enabling output mode. This keeps
  // the test point at the safer LOW state during normal startup.
  digitalWrite(PIN_TEST_OUTPUT, LOW);
  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  lastRawPressed = digitalRead(PIN_BUTTON) == LOW;
  changedAtMs = millis();

  Serial.println("=== Week 2 GPIO4/GPIO5 candidate test ===");
  Serial.printf("pin_button=%d mode=INPUT_PULLUP\n", PIN_BUTTON);
  Serial.printf("pin_test_output=%d startup=LOW\n", PIN_TEST_OUTPUT);
  Serial.println("status=ready expected_released_input=HIGH output=LOW");
}

void loop() {
  const bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  const unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);

    Serial.printf(
      "event=button_changed pressed=%s input=%s output=%s time_ms=%lu\n",
      stablePressed ? "true" : "false",
      stablePressed ? "LOW" : "HIGH",
      stablePressed ? "HIGH" : "LOW",
      now
    );
  }
}
