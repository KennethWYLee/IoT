// 由教師公布的同批板卡target-test profile填入；未公布時保持-1。
const int PIN_BUTTON = -1;
const int PIN_TEST_OUTPUT = -1;
const char *GROUP_ID = "CHANGE_ME";

bool experimentReady = false;
bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;

bool profileReady() {
  return PIN_BUTTON >= 0 && PIN_TEST_OUTPUT >= 0 &&
         PIN_BUTTON != PIN_TEST_OUTPUT;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  if (!profileReady()) {
    Serial.println("week=2 status=blocked reason=gpio_profile_missing");
    return;
  }

  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  digitalWrite(PIN_TEST_OUTPUT, LOW);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  lastRawPressed = digitalRead(PIN_BUTTON) == LOW;
  changedAtMs = millis();
  if (lastRawPressed) {
    Serial.println("week=2 status=blocked reason=release_button_then_reset");
    return;
  }
  experimentReady = true;

  Serial.printf("boot: week02 group=%s button-test version=1\n", GROUP_ID);
  Serial.println("state: released input=HIGH test_output=LOW");
}

void loop() {
  if (!experimentReady) return;
  bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);

    Serial.printf(
      "group=%s event=button_changed pressed=%s input=%s test_output=%s time_ms=%lu\n",
      GROUP_ID,
      stablePressed ? "true" : "false",
      stablePressed ? "LOW" : "HIGH",
      stablePressed ? "HIGH" : "LOW",
      now
    );
  }
}
