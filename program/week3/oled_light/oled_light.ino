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

const int PIN_LIGHT = 4;
// -1 reads the sensor; 0..4095 substitutes explicit software test data.
const int TEST_RAW = -1;
const uint32_t UPDATE_MS = 200;
bool ready = false, busReady = false;
int raw = 0;
uint32_t lastOledAttempt = 0, lastDraw = 0;

void drawValues() {
  char line[24];
  oled.clearBuffer();
  snprintf(line, sizeof(line), "RAW %d", raw);
  oled.drawStr(0, 14, line);
  if (raw == 0 || raw == 4095) oled.drawStr(0, 34, "CHECK");
  oled.drawStr(0, 54, TEST_RAW >= 0 ? "TEST" : "LIVE");
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
  raw = TEST_RAW >= 0 ? TEST_RAW : analogRead(PIN_LIGHT);
  drawValues();
  lastDraw = millis();
  Serial.printf("event=ready oled_address=0x%02X controller=%d\n",
                OLED_ADDRESS, OLED_CONTROLLER);
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  const int pins[] = {PIN_LIGHT, PIN_SDA, PIN_SCL};
  if (!PROFILE_CONFIRMED) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  if (TEST_RAW < -1 || TEST_RAW > 4095) {
    Serial.println("event=blocked reason=invalid_test_raw"); return;
  }
  for (int i = 0; i < 3; ++i) {
    if (pins[i] < 0) { Serial.println("event=blocked reason=check_configuration"); return; }
    for (int j = 0; j < i; ++j) if (pins[i] == pins[j]) {
      Serial.println("event=blocked reason=duplicate_pin"); return;
    }
  }
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
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
  if (uint32_t(now - lastDraw) < UPDATE_MS) return;
  if (!hasAck()) {
    Serial.println("event=stopped reason=oled_no_ack"); ready = false; return;
  }
  raw = TEST_RAW >= 0 ? TEST_RAW : analogRead(PIN_LIGHT);
  lastDraw = now;
  drawValues();
}
