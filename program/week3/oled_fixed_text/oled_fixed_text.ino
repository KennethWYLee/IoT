#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

// Confirm the actual board, wiring and 3.3 V supply/logic before enabling.
const bool PROFILE_CONFIRMED = false;
const int PIN_SDA = 8, PIN_SCL = 9;
int OLED_ADDRESS = -1;
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

bool ready = false, busReady = false;
uint32_t lastOledAttempt = 0, lastDraw = 0;

void drawText() {
  oled.clearBuffer();
  oled.drawStr(0, 14, "WEEK 3");
  oled.drawStr(0, 34, "OLED OK");
  oled.sendBuffer();
}

bool hasAck() {
  Wire.beginTransmission(OLED_ADDRESS);
  return Wire.endTransmission() == 0;
}

// An ACK locates the bus address; it does not identify the controller.
bool startDisplay() {
  int found = 0;
  for (int address = 0x3C; address <= 0x3D; ++address) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      OLED_ADDRESS = address;
      ++found;
    }
  }
  if (found != 1) {
    OLED_ADDRESS = -1;
    Serial.println(found == 0 ? "event=waiting reason=oled_no_ack sda=8 scl=9"
                              : "event=blocked reason=multiple_oled_addresses");
    return false;
  }
  oled.setI2CAddress(OLED_ADDRESS * 2);
  oled.setBusClock(100000);
  oled.begin();
  Wire.setTimeOut(20);
  oled.setPowerSave(0);
  oled.setFont(u8g2_font_6x12_tf);
  drawText();
  lastDraw = millis();
  Serial.printf("event=ready oled_address=0x%02X controller=%d\n",
                OLED_ADDRESS, OLED_CONTROLLER);
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!PROFILE_CONFIRMED || PIN_SDA < 0 || PIN_SCL < 0 || PIN_SDA == PIN_SCL) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  busReady = Wire.begin(PIN_SDA, PIN_SCL, 100000);
  if (!busReady) { Serial.println("event=blocked reason=i2c_begin_failed"); return; }
  Wire.setTimeOut(20);
  ready = startDisplay();
  lastOledAttempt = millis();
}

void loop() {
  const uint32_t now = millis();
  if (!ready) {
    if (busReady && uint32_t(now - lastOledAttempt) >= 2000) {
      ready = startDisplay();
      lastOledAttempt = millis();
    }
    return;
  }
  if (uint32_t(now - lastDraw) < 200) return;
  if (!hasAck()) {
    Serial.println("event=stopped reason=oled_no_ack"); ready = false; return;
  }
  lastDraw = now;
  drawText();
}
