#include <Arduino.h>

// 未確認實物與斷電接線前，保持停用。
const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
const int PIN_BUTTON = -1;
const int SAMPLES_PER_PRESS = 3;
const uint32_t SAMPLE_GAP_MS = 200;
const uint32_t DEBOUNCE_MS = 40;

bool ready = false, armed = false, collecting = false;
int lastButton = HIGH, sampleIndex = 0;
uint32_t changedAt = 0, lastSampleAt = 0, batch = 0;

// 與單筆範例相同：40 ms 穩定後接受按壓，放開才重新準備。
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

// 每次都讀取當下的感測值，不複製第一筆。
void capture(uint32_t now) {
  const int raw = analogRead(PIN_LIGHT);
  ++sampleIndex;
  Serial.printf("event=sample batch=%lu index=%d raw=%d "
                "endpoint=%d uptime_ms=%lu\n",
                (unsigned long)batch, sampleIndex, raw,
                raw == 0 || raw == 4095, (unsigned long)now);
  lastSampleAt = now; // 以本筆時間開始等下一個間隔。
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
  if (pressed(now)) { // 持續讀按鈕，不用 delay(200) 停住整段程式。
    if (collecting) {
      // 忙碌時只回報，不累積等待中的工作。
      Serial.println("event=ignored reason=batch_busy");
    } else {
      ++batch;
      sampleIndex = 0;
      collecting = true;
      capture(now);
    }
  }
  // 延遲執行時只取一筆新資料，不補印未實際量到的讀值。
  if (collecting && uint32_t(now - lastSampleAt) >= SAMPLE_GAP_MS)
    capture(now);
}
