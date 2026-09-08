#include <Wire.h>
#include <U8g2lib.h>

// 1: RGB only; 2: OLED only; 3: combined countdown. All start disabled.
const int LESSON_STAGE = 0;
const char* DEVICE_ID = "BOARD-T01";
const bool RGB_PROFILE_CONFIRMED = false;
const bool OLED_PROFILE_CONFIRMED = false;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;
const int PIN_SDA = -1;
const int PIN_SCL = -1;
const int OLED_ADDRESS_7BIT = -1;
const bool LIGHT_INTERFERENCE_TEST = false;
const bool LIGHT_PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
// This constructor is ONLY for an approved SSD1306 128x64 I2C module.
// Other controllers/resolutions need a matching reviewed constructor, not a guess.
// ACK is not a controller ID. Select after electrical and fixed-screen checks.
#ifndef OLED_CONTROLLER
#define OLED_CONTROLLER 1306
#endif
#if OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#elif OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#else
#error Unsupported OLED_CONTROLLER: use a verified 1306 or 1315 configuration.
#endif
const uint32_t DURATION_MS = 30000;
const uint32_t PHASE_MS = 3000;
const uint32_t DISPLAY_INTERVAL_MS = 200;
const uint32_t LOG_INTERVAL_MS = 500;
enum TimerState { IDLE, RUNNING, EXPIRED, ABORTED };
TimerState state = IDLE;
bool ready = false, ioFault = false, injectedDisplayFault = false;
bool changed = true, greenPhase = false;
int demoCount = 3;
const char* rgbRequested = "OFF";
uint32_t startedAt = 0, frozenRemaining = DURATION_MS, lastDraw = 0, lastLog = 0;
const char* reason = "boot";

bool hasRgb() { return LESSON_STAGE == 1 || LESSON_STAGE == 3; }
bool hasOled() { return LESSON_STAGE == 2 || LESSON_STAGE == 3; }
bool profileReady() {
  if (LESSON_STAGE < 1 || LESSON_STAGE > 3) return false;
  int pins[6], count = 0;
  if (hasRgb()) {
    if (!RGB_PROFILE_CONFIRMED || (RGB_ON_LEVEL != LOW && RGB_ON_LEVEL != HIGH)) return false;
    pins[count++] = PIN_RGB_R; pins[count++] = PIN_RGB_G; pins[count++] = PIN_RGB_B;
  }
  if (hasOled()) {
    if (!OLED_PROFILE_CONFIRMED || OLED_ADDRESS_7BIT < 8 || OLED_ADDRESS_7BIT > 119) return false;
    pins[count++] = PIN_SDA; pins[count++] = PIN_SCL;
  }
  if (LIGHT_INTERFERENCE_TEST) {
    if (!LIGHT_PROFILE_CONFIRMED) return false;
    pins[count++] = PIN_LIGHT;
  }
  for (int i = 0; i < count; ++i) {
    if (pins[i] < 0) return false;
    for (int j = 0; j < i; ++j) if (pins[i] == pins[j]) return false;
  }
  return true;
}
const char* stateName() {
  switch (state) {
    case IDLE: return "IDLE";
    case RUNNING: return "RUNNING";
    case EXPIRED: return "EXPIRED";
    default: return "ABORTED";
  }
}
uint32_t remainingAt(uint32_t now) {
  if (state != RUNNING) return frozenRemaining;
  const uint32_t elapsed = now - startedAt; // Unsigned subtraction handles one wrap.
  return elapsed >= DURATION_MS ? 0 : DURATION_MS - elapsed;
}
uint32_t displaySeconds(uint32_t remaining) { return (remaining + 999u) / 1000u; }
void rgb(bool r, bool g, bool b) {
  if (!hasRgb() || !ready) return;
  rgbRequested = r ? "RED" : g ? "GREEN" : b ? "BLUE" : "OFF";
  const int off = RGB_ON_LEVEL == HIGH ? LOW : HIGH;
  digitalWrite(PIN_RGB_R, r ? RGB_ON_LEVEL : off);
  digitalWrite(PIN_RGB_G, g ? RGB_ON_LEVEL : off);
  digitalWrite(PIN_RGB_B, b ? RGB_ON_LEVEL : off);
}
void abortTimer(uint32_t now, const char* why) {
  frozenRemaining = remainingAt(now);
  state = ABORTED; greenPhase = false; reason = why; changed = true;
  rgb(false, false, false);
}
void advanceTimer(uint32_t now) {
  if (state != RUNNING) return;
  if (now - startedAt >= DURATION_MS) {
    frozenRemaining = 0; state = EXPIRED; greenPhase = false;
    reason = "deadline"; changed = true; rgb(false, false, false);
  } else {
    const bool next = ((now - startedAt) / PHASE_MS) % 2 == 0;
    if (greenPhase != next) changed = true;
    greenPhase = next; rgb(!greenPhase, greenPhase, false);
  }
}
bool oledAck() {
  if (injectedDisplayFault) return false;
  Wire.beginTransmission(OLED_ADDRESS_7BIT);
  return Wire.endTransmission() == 0;
}
void handleCommand(char c, uint32_t now) {
  if (c == '\r' || c == '\n' || c == ' ') return;
  if (c == 'x') { abortTimer(now, "manual_abort"); return; }
  if (c == 'f' && hasOled()) {
    injectedDisplayFault = true; ioFault = true;
    abortTimer(now, "injected_display_failure"); return;
  }
  if (c == 'c' && hasOled()) {
    injectedDisplayFault = false;
    // Allow a new physical ACK test, but do NOT resume the countdown.
    ioFault = !oledAck();
    reason = ioFault ? "display_still_unresponsive" : "ack_recovered_reset_required";
    changed = true; return;
  }
  if (c == 'z' && state != RUNNING && !ioFault) {
    state = IDLE; frozenRemaining = DURATION_MS; greenPhase = false;
    reason = "manual_reset"; changed = true; rgb(false, false, false); return;
  }
  if (state == IDLE && c >= '0' && c <= '6' && !ioFault) {
    demoCount = c - '0'; reason = "demo_count_changed"; changed = true; return;
  }
  if (c == 's' && LESSON_STAGE == 3 && state == IDLE && !ioFault) {
    startedAt = now; state = RUNNING; reason = "serial_start"; changed = true;
    advanceTimer(now); return;
  }
  if (hasRgb() && state == IDLE && !ioFault && (c == 'r' || c == 'g' || c == 'b' || c == 'o')) {
    rgb(c == 'r', c == 'g', c == 'b');
    Serial.printf("event_type=rgb_test requested=%c visual_verified=false\n", c);
    return;
  }
  Serial.printf("event_type=command_rejected command=%c state=%s\n", c, stateName());
}
void drawSnapshot(uint32_t now) {
  if (!hasOled() || ioFault) return;
  if (!oledAck()) { ioFault = true; abortTimer(millis(), "display_ack_failed"); return; }
  char text[24];
  oled.clearBuffer();
  oled.setFont(u8g2_font_6x12_tf);
  oled.drawStr(0, 12, stateName());
  snprintf(text, sizeof(text), "TIME %lu s", (unsigned long)displaySeconds(remainingAt(now)));
  oled.drawStr(0, 28, text);
  if (state == RUNNING) oled.drawStr(0, 44, greenPhase ? "GREEN / COVER" : "RED / WAIT");
  else {
    snprintf(text, sizeof(text), "RGB %s", rgbRequested);
    oled.drawStr(0, 44, hasRgb() && state == IDLE ? text : "NOT RUNNING");
  }
  snprintf(text, sizeof(text), "DEMO %d/6 NOT SCORE", demoCount);
  oled.drawStr(0, 60, text);
  oled.sendBuffer(); // Finite synchronous bus transfer, NOT zero-duration.
  if (!oledAck()) { ioFault = true; abortTimer(millis(), "display_ack_failed"); }
}
void setup() {
  Serial.begin(115200); delay(1000);
  if (!profileReady()) { Serial.println("week=5 status=blocked reason=profile_missing"); return; }
  ready = true;
  if (hasRgb()) {
    // Set the latch before output mode to reduce startup glitches after setup.
    rgb(false, false, false);
    pinMode(PIN_RGB_R, OUTPUT); pinMode(PIN_RGB_G, OUTPUT); pinMode(PIN_RGB_B, OUTPUT);
  }
  if (hasOled()) {
    if (!Wire.begin(PIN_SDA, PIN_SCL, 100000)) {
      ioFault = true; abortTimer(millis(), "i2c_begin_failed");
    } else {
      Wire.setTimeOut(20);
      if (!oledAck()) { ioFault = true; abortTimer(millis(), "display_ack_failed"); }
      else {
        oled.setI2CAddress(OLED_ADDRESS_7BIT * 2);
        oled.setBusClock(100000); oled.begin(); Wire.setTimeOut(20);
        if (!oledAck()) { ioFault = true; abortTimer(millis(), "display_ack_failed"); }
      }
    }
  }
  if (LIGHT_INTERFERENCE_TEST) {
    analogReadResolution(12); analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  }
  Serial.println("week=5 commands=r,g,b,o,0..6,s,x,f,c,z baud=115200");
}
void loop() {
  if (!ready) return;
  uint32_t now = millis();
  advanceTimer(now); // Deadline is evaluated before ordinary serial commands.
  if (Serial.available()) handleCommand((char)Serial.read(), now);
  if (now - lastDraw >= DISPLAY_INTERVAL_MS) {
    lastDraw = now; drawSnapshot(now);
  }
  now = millis(); advanceTimer(now); // Refresh after potentially slow I2C work.
  if (changed || now - lastLog >= LOG_INTERVAL_MS) {
    lastLog = now; changed = false;
    Serial.printf("device_id=%s event_type=timer_status state=%s remaining_ms=%lu "
                  "seconds=%lu phase=%s io_ok=%s reason=%s uptime_ms=%lu\n",
                  DEVICE_ID, stateName(), (unsigned long)remainingAt(now),
                  (unsigned long)displaySeconds(remainingAt(now)),
                  state == RUNNING ? (greenPhase ? "GREEN" : "RED") : "OFF",
                  ioFault ? "false" : "true", reason, (unsigned long)now);
    Serial.printf("event_type=view_snapshot demo_count=%d rgb_requested=%s visual_verified=false\n",
                  demoCount, rgbRequested);
    if (LIGHT_INTERFERENCE_TEST) {
      const int raw = analogRead(PIN_LIGHT);
      Serial.printf("event_type=interference_sample light_raw=%d rgb_requested=%s uptime_ms=%lu\n",
                    raw, rgbRequested, (unsigned long)millis());
    }
  }
}
