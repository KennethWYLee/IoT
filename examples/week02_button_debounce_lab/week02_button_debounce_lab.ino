// 由教師公布的同批板卡target-test profile填入；未公布時保持-1。
const int PIN_BUTTON = -1;
const int PIN_TEST_OUTPUT = -1;
const char *GROUP_ID = "CHANGE_ME";

const unsigned long DEBOUNCE_MS = 30;

bool experimentReady = false;
bool lastRawPressed = false;
bool stablePressed = false;
unsigned long changedAtMs = 0;
unsigned long rawEdgeCount = 0;
unsigned long acceptedPressCount = 0;
unsigned long acceptedReleaseCount = 0;

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

  // 先把輸出暫存值設為LOW，再啟用OUTPUT，降低啟動時意外HIGH的風險。
  digitalWrite(PIN_TEST_OUTPUT, LOW);
  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  pinMode(PIN_BUTTON, INPUT_PULLUP);

  lastRawPressed = digitalRead(PIN_BUTTON) == LOW;
  stablePressed = false;
  changedAtMs = millis();

  if (lastRawPressed) {
    Serial.println("week=2 status=blocked reason=release_button_then_reset");
    return;
  }

  experimentReady = true;
  Serial.printf(
    "boot: week02 group=%s debounce-diagnostic debounce_ms=%lu\n",
    GROUP_ID,
    DEBOUNCE_MS
  );
  Serial.println("state: raw_pressed=false stable_pressed=false test_output=LOW");
}

void loop() {
  if (!experimentReady) return;

  const bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  const unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
    rawEdgeCount++;

    Serial.printf(
      "group=%s event=raw_changed raw_pressed=%s raw_edge=%lu time_ms=%lu\n",
      GROUP_ID,
      rawPressed ? "true" : "false",
      rawEdgeCount,
      now
    );
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);

    if (stablePressed) {
      acceptedPressCount++;
    } else {
      acceptedReleaseCount++;
    }

    Serial.printf(
      "group=%s event=stable_changed pressed=%s input=%s "
      "test_output=%s accepted_press=%lu accepted_release=%lu "
      "stable_for_ms=%lu debounce_ms=%lu time_ms=%lu\n",
      GROUP_ID,
      stablePressed ? "true" : "false",
      stablePressed ? "LOW" : "HIGH",
      stablePressed ? "HIGH" : "LOW",
      acceptedPressCount,
      acceptedReleaseCount,
      now - changedAtMs,
      DEBOUNCE_MS,
      now
    );
  }
}
