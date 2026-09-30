#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

const bool PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1, PIN_SDA = -1, PIN_SCL = -1;
const int OLED_ADDRESS = -1; // Verified 7-bit address, e.g. 0x3C.
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

const uint32_t UPDATE_MS = 200;
bool ready = false, hasReading = false;
int raw = 0, minimum = 0, maximum = 0;
uint32_t lastUpdate = 0;

bool hasAck() {
  Wire.beginTransmission(OLED_ADDRESS);
  return Wire.endTransmission() == 0;
}

void drawValues() {
  char line[24];
  oled.clearBuffer();
  snprintf(line, sizeof(line), "RAW %d", raw); oled.drawStr(0, 14, line);
  snprintf(line, sizeof(line), "MIN %d", minimum); oled.drawStr(0, 34, line);
  snprintf(line, sizeof(line), "MAX %d", maximum); oled.drawStr(0, 54, line);
  oled.sendBuffer();
}

void setup() {
  Serial.begin(115200);
  if (!PROFILE_CONFIRMED || PIN_LIGHT < 0 || PIN_SDA < 0 || PIN_SCL < 0 ||
      PIN_LIGHT == PIN_SDA || PIN_LIGHT == PIN_SCL || PIN_SDA == PIN_SCL ||
      OLED_ADDRESS < 8 || OLED_ADDRESS > 119) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  Wire.begin(PIN_SDA, PIN_SCL); Wire.setTimeOut(20);
  if (!hasAck()) { Serial.println("event=blocked reason=oled_no_ack"); return; }
  oled.setI2CAddress(OLED_ADDRESS * 2); // U8g2 uses an 8-bit address value.
  oled.setBusClock(100000); oled.begin(); Wire.setTimeOut(20);
  oled.setFont(u8g2_font_6x12_tf);
  oled.clearBuffer(); oled.drawStr(0, 14, "WAIT"); oled.sendBuffer();
  lastUpdate = millis();
  ready = true;
  Serial.println("event=ready");
}

void loop() {
  if (!ready) return;
  const uint32_t now = millis();
  if (uint32_t(now - lastUpdate) < UPDATE_MS) return;
  lastUpdate = now;
  if (!hasAck()) {
    Serial.println("event=stopped reason=oled_no_ack"); ready = false; return;
  }
  raw = analogRead(PIN_LIGHT);
  if (!hasReading) {
    minimum = maximum = raw; // Start with real data, not an invented zero.
    hasReading = true;
  } else {
    if (raw < minimum) minimum = raw;
    if (raw > maximum) maximum = raw;
  }
  drawValues();
  Serial.printf("raw=%d min=%d max=%d\n", raw, minimum, maximum);
}
