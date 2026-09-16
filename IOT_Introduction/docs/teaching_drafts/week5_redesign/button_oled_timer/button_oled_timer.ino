#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

const bool PROFILE_CONFIRMED = false;
const int PIN_ADD = -1, PIN_START = -1;
const int PIN_SDA = -1, PIN_SCL = -1;
const int OLED_ADDRESS = -1;
const uint32_t STEP_SECONDS = 10;
const uint32_t MAX_SECONDS = 60;
const uint32_t DEBOUNCE_MS = 40;
#ifndef OLED_CONTROLLER
#define OLED_CONTROLLER 1306
#endif
#if OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(
    U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#elif OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(
    U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#else
#error Use the verified 1306 or 1315 configuration.
#endif

bool ready = false, armed = false, running = false, ioFault = false;
int lastAdd = HIGH, lastStart = HIGH;
uint32_t changedAt = 0, startedAt = 0, lastDraw = 0;
uint32_t durationSeconds = STEP_SECONDS;
uint32_t remainingMs = STEP_SECONDS * 1000;
const char* state = "IDLE";

int buttonEvent(uint32_t now) {
  const int add = digitalRead(PIN_ADD), start = digitalRead(PIN_START);
  if (add != lastAdd || start != lastStart) {
    lastAdd = add; lastStart = start; changedAt = now;
  }
  if (add == LOW && start == LOW) armed = false;
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return 0;
  if (add == HIGH && start == HIGH) { armed = true; return 0; }
  if (!armed) return 0;
  armed = false;
  return add == LOW ? 1 : 2;
}

void report(const char* event) {
  Serial.printf("event=%s state=%s duration_s=%lu remaining_ms=%lu\n",
                event, state, (unsigned long)durationSeconds,
                (unsigned long)remainingMs);
}

void updateTime(uint32_t now) {
  if (!running) return;
  const uint32_t elapsed = now - startedAt;
  const uint32_t total = durationSeconds * 1000;
  remainingMs = elapsed >= total ? 0 : total - elapsed;
  if (remainingMs == 0) { running = false; state = "DONE"; report("expired"); }
}

bool hasAck() {
  Wire.beginTransmission(OLED_ADDRESS);
  return Wire.endTransmission() == 0;
}

void displayFault() {
  running = false; ioFault = true; state = "FAULT";
  report("display_fault");
}

void setup() {
  Serial.begin(115200);
  const int pins[] = {PIN_ADD, PIN_START, PIN_SDA, PIN_SCL};
  if (!PROFILE_CONFIRMED || OLED_ADDRESS < 8 || OLED_ADDRESS > 119 ||
      STEP_SECONDS < 1 || MAX_SECONDS > 3600 || STEP_SECONDS > MAX_SECONDS) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  for (int i = 0; i < 4; ++i) {
    if (pins[i] < 0) return;
    for (int j = 0; j < i; ++j) if (pins[i] == pins[j]) return;
  }
  pinMode(PIN_ADD, INPUT_PULLUP); pinMode(PIN_START, INPUT_PULLUP);
  Wire.begin(PIN_SDA, PIN_SCL); Wire.setTimeOut(20);
  if (!hasAck()) { displayFault(); return; }
  oled.setI2CAddress(OLED_ADDRESS * 2);
  oled.setBusClock(100000); oled.begin(); Wire.setTimeOut(20);
  oled.setFont(u8g2_font_6x12_tf);
  changedAt = millis(); ready = true;
  report("ready");
}

void loop() {
  if (!ready || ioFault) return;
  const uint32_t now = millis();
  updateTime(now);
  const int button = buttonEvent(now);
  if (button == 1 && !running) {
    durationSeconds = durationSeconds + STEP_SECONDS > MAX_SECONDS
                        ? STEP_SECONDS : durationSeconds + STEP_SECONDS;
    remainingMs = durationSeconds * 1000; state = "IDLE"; report("adjust");
  } else if (button == 1) report("ignored_while_running");
  if (button == 2) {
    if (running) { running = false; state = "STOPPED"; report("stop"); }
    else {
      running = true; startedAt = now; state = "RUNNING";
      remainingMs = durationSeconds * 1000; report("start");
    }
  }
  if (uint32_t(now - lastDraw) < 200) return;
  lastDraw = now;
  if (!hasAck()) { displayFault(); return; }
  char line[32];
  oled.clearBuffer(); oled.drawStr(0, 14, state);
  snprintf(line, sizeof(line), "TIME %lu s",
           (unsigned long)((remainingMs + 999) / 1000));
  oled.drawStr(0, 32, line);
  oled.drawStr(0, 50, "ADD / START-STOP"); oled.sendBuffer();
  updateTime(millis());
}
