#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

// Local BOARD-T01 assembly test, not a verified classroom hardware profile.
// OLED: GND=b3, VDD=b6 (3.3 V), SDA=GPIO8, SCK=GPIO9.
// KY-018: S=a15/c15 -> GPIO4. No servo, buzzer or RGB connected.
// Future buttons: Start GPIO5->a20, Finish GPIO6->a27, INPUT_PULLUP.
// Upload this before connecting the two button signal wires.
constexpr int PIN_LIGHT = 4;
constexpr int PIN_START = 5;
constexpr int PIN_FINISH = 6;
constexpr int PIN_SDA = 8;
constexpr int PIN_SCL = 9;

// Seller specifies SSD1315 for the purchased 0.96-inch variant.
// Successful ACK alone does NOT prove controller identity or display operation.
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(
    U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
bool displayReady = false;
uint8_t address = 0;
uint32_t lastFrame = 0;

bool responds(uint8_t target) {
  Wire.beginTransmission(target);
  return Wire.endTransmission() == 0;
}

void setup() {
  pinMode(PIN_START, INPUT_PULLUP);
  pinMode(PIN_FINISH, INPUT_PULLUP);
  pinMode(PIN_LIGHT, INPUT);
  Serial.begin(115200);
  delay(1000);
  Serial.println("test=week7_t01_bringup controller_candidate=SSD1315");
  Serial.println("sda=8 scl=9 light=4 start=5 finish=6 buttons=INPUT_PULLUP");
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  if (!Wire.begin(PIN_SDA, PIN_SCL, 100000)) {
    Serial.println("status=failed reason=i2c_begin_failed unplug_usb_before_rewiring=true");
    return;
  }
  Wire.setTimeOut(20);
  const bool at3c = responds(0x3C);
  const bool at3d = responds(0x3D);
  if (at3c == at3d) {
    Serial.printf("status=failed reason=%s unplug_usb_before_rewiring=true\n",
                  at3c ? "multiple_oled_addresses" : "no_oled_ack");
    return;
  }
  address = at3c ? 0x3C : 0x3D;
  oled.setI2CAddress(address << 1); // U8g2 accepts the shifted address.
  oled.setBusClock(100000);
  oled.begin();
  Wire.setTimeOut(20);
  if (!responds(address)) {
    Serial.println("status=failed reason=ack_lost_after_init");
    return;
  }
  oled.setContrast(80);
  displayReady = true;
  Serial.printf("status=awaiting_visual_check oled_address=0x%02X physical_pass=false\n", address);
}

void loop() {
  if (!displayReady) { delay(20); return; }
  const uint32_t now = millis();
  if (now - lastFrame < 500) return;
  lastFrame = now;
  if (!responds(address)) {
    displayReady = false;
    Serial.println("status=failed reason=oled_ack_lost unplug_usb_before_rewiring=true");
    return;
  }
  const int raw = analogRead(PIN_LIGHT);
  const int start = digitalRead(PIN_START);
  const int finish = digitalRead(PIN_FINISH);
  char line[28];
  oled.clearBuffer();
  oled.drawFrame(0, 0, 128, 64);
  oled.setFont(u8g2_font_6x12_tf);
  oled.drawStr(5, 14, "WEEK7 OLED TEST");
  snprintf(line, sizeof(line), "TIME: %lu s", (unsigned long)(now / 1000));
  oled.drawStr(5, 29, line);
  snprintf(line, sizeof(line), "LIGHT: %d", raw);
  oled.drawStr(5, 44, line);
  snprintf(line, sizeof(line), "START:%d FINISH:%d", start, finish);
  oled.drawStr(5, 59, line);
  oled.sendBuffer();
  Serial.printf("uptime_ms=%lu light_raw=%d start=%d finish=%d display_write_attempted=true\n",
                (unsigned long)now, raw, start, finish);
}
