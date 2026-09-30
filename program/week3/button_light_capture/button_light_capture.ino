#include <Arduino.h>

// 未確認實物與斷電接線前，保持停用。
const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
const int PIN_BUTTON = -1;
const uint32_t DEBOUNCE_MS = 40;

bool ready = false, armed = false;
int lastButton = HIGH;
uint32_t changedAt = 0, sampleNumber = 0;

// 讀值穩定 40 ms 才接受；放開後，下一次按下才再回傳 true。
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

void setup() {
  Serial.begin(115200);
  if (!PROFILE_CONFIRMED || PIN_LIGHT < 0 ||
      PIN_BUTTON < 0 || PIN_LIGHT == PIN_BUTTON) {
    Serial.println("event=blocked reason=check_configuration");
    return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP); // 放開 HIGH，按下 LOW。
  analogReadResolution(12);         // ADC 原始值：0～4095。
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  changedAt = millis();
  ready = true;
  Serial.println("event=ready release_button_first");
}

void loop() {
  if (!ready) return;
  const uint32_t now = millis();
  if (!pressed(now)) return; // 沒有新的有效按壓，就不取樣。

  const int raw = analogRead(PIN_LIGHT); // 按下時才讀一次光敏訊號。
  ++sampleNumber;
  Serial.printf("event=sample sample=%lu raw=%d "
                "endpoint=%d uptime_ms=%lu\n",
                (unsigned long)sampleNumber, raw,
                raw == 0 || raw == 4095, (unsigned long)now);
}
