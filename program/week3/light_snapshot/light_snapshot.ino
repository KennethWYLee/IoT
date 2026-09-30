#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>


const bool PROFILE_CONFIRMED = true;
const int PIN_LIGHT = 4, PIN_BUTTON = 5;
const int PIN_SDA = 8, PIN_SCL = 9;
int OLED_ADDRESS = -1; // Detected on the configured I2C bus at startup.
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

const uint32_t DEBOUNCE_MS = 40, UPDATE_MS = 200;
bool ready = false, busReady = false, armed = false, hasSaved = false;
uint32_t lastOledAttempt = 0;
int lastButton = HIGH, raw = 0, savedRaw = 0;
uint32_t changedAt = 0, lastDraw = 0, savedCount = 0;

bool pressed(uint32_t now) {
  const int level = digitalRead(PIN_BUTTON);
  if (level != lastButton) { lastButton = level; changedAt = now; }
  if (uint32_t(now - changedAt) < DEBOUNCE_MS) return false;
  if (level == HIGH) { armed = true; return false; }
  if (!armed) return false;
  armed = false;
  return true;
}

bool hasAck() {
  Wire.beginTransmission(OLED_ADDRESS);
  return Wire.endTransmission() == 0;
}

void drawValues() {
  char line[24];
  oled.clearBuffer();
  snprintf(line, sizeof(line), "RAW %d", raw); oled.drawStr(0, 14, line);
  if (hasSaved) snprintf(line, sizeof(line), "LAST %d", savedRaw);
  else snprintf(line, sizeof(line), "LAST ---");
  oled.drawStr(0, 34, line);
  snprintf(line, sizeof(line), "SAVED %lu", (unsigned long)savedCount);
  oled.drawStr(0, 54, line); oled.sendBuffer();
}

// ACK finds a bus address; the controller remains the selected OLED_CONTROLLER.
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
  raw = analogRead(PIN_LIGHT);
  drawValues();
  lastButton = digitalRead(PIN_BUTTON);
  armed = false;
  changedAt = lastDraw = millis();
  Serial.printf("event=ready oled_address=0x%02X controller=%d release_button_first\n",
                OLED_ADDRESS, OLED_CONTROLLER);
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  const int pins[] = {PIN_LIGHT, PIN_BUTTON, PIN_SDA, PIN_SCL};
  if (!PROFILE_CONFIRMED) {
    Serial.println("event=blocked reason=check_configuration"); return;
  }
  for (int i = 0; i < 4; ++i) {
    if (pins[i] < 0) {
      Serial.println("event=blocked reason=check_configuration"); return;
    }
    for (int j = 0; j < i; ++j) if (pins[i] == pins[j]) {
      Serial.println("event=blocked reason=duplicate_pin"); return;
    }
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
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
  const bool save = pressed(now);
  if (!save && uint32_t(now - lastDraw) < UPDATE_MS) return;
  if (!hasAck()) {
    Serial.println("event=stopped reason=oled_no_ack"); ready = false; return;
  }
  raw = analogRead(PIN_LIGHT); // Read again when saving, not an old screen value.
  if (save) {
    savedRaw = raw; hasSaved = true; ++savedCount;
    Serial.printf("event=saved sample=%lu raw=%d\n",
                  (unsigned long)savedCount, savedRaw);
  }
  lastDraw = now;
  drawValues(); // Refresh RAW but keep LAST until the next new press.
}
