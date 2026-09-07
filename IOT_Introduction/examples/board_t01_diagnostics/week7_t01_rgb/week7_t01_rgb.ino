#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

// Local BOARD-T01 test only. No servo or buzzer connected; battery OFF.
// OLED GND=b3, VDD=b6 (3.3 V), SDA=8, SCK=9. KY S=4.
// Start 5->a20, Finish 6->a27; the other button groups connect to GND.
// HW-479, onboard channel resistors: R=15, G=16, B=17, minus=e3 (GND).
// Actual colors and polarity are to be observed, not assumed passed.
constexpr int PIN_LIGHT=4, PIN_START=5, PIN_FINISH=6;
constexpr int PIN_SDA=8, PIN_SCL=9;
constexpr int RGB_PINS[3]={15,16,17};
constexpr uint32_t COLOR_MS=2000, PREPARE_MS=3000;
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(
    U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
bool displayReady=false, sequenceEnabled=false;
uint8_t address=0;
uint32_t lastFrame=0, sequenceAt=0;
int phase=-2;
const char* colorName="OFF";

bool responds(uint8_t target) {
  Wire.beginTransmission(target);
  return Wire.endTransmission()==0;
}
void rgbOff() {
  for (int pin:RGB_PINS) digitalWrite(pin,LOW);
}
void stopSequence(const char* why) {
  rgbOff(); sequenceEnabled=false; colorName="OFF";
  Serial.printf("rgb_command=OFF reason=%s physical_pass=false\n",why);
}
void startSequence() {
  rgbOff(); sequenceAt=millis(); phase=-2;
  colorName="WAIT"; sequenceEnabled=true;
  Serial.println("sequence=WAIT_RED_GREEN_BLUE_OFF color_ms=2000 repeat_command=r stop_command=x");
}
void updateRgb(uint32_t now) {
  if (!sequenceEnabled) return;
  const uint32_t elapsed=now-sequenceAt;
  if (elapsed<PREPARE_MS) return;
  const uint32_t next=(elapsed-PREPARE_MS)/COLOR_MS;
  if (next>=3) { stopSequence("sequence_complete"); return; }
  if ((int)next==phase) return;
  rgbOff(); // One channel at a time; never mix all three during first test.
  phase=(int)next;
  digitalWrite(RGB_PINS[phase],HIGH);
  const char* names[]={"RED","GREEN","BLUE"};
  colorName=names[phase];
  Serial.printf("rgb_command=%s gpio=%d physical_pass=false\n",colorName,RGB_PINS[phase]);
}

void setup() {
  for (int pin:RGB_PINS) { digitalWrite(pin,LOW); pinMode(pin,OUTPUT); }
  pinMode(PIN_START,INPUT_PULLUP); pinMode(PIN_FINISH,INPUT_PULLUP);
  pinMode(PIN_LIGHT,INPUT);
  Serial.begin(115200); delay(1000);
  Serial.println("test=week7_t01_rgb version=1 controller_candidate=SSD1315");
  Serial.println("sda=8 scl=9 light=4 start=5 finish=6 rgb_r=15 rgb_g=16 rgb_b=17");
  analogReadResolution(12); analogSetPinAttenuation(PIN_LIGHT,ADC_11db);
  if (!Wire.begin(PIN_SDA,PIN_SCL,100000)) {
    Serial.println("status=failed reason=i2c_begin_failed"); return;
  }
  Wire.setTimeOut(20);
  const bool at3c=responds(0x3C), at3d=responds(0x3D);
  if (at3c==at3d) {
    Serial.printf("status=failed reason=%s\n",at3c?"multiple_addresses":"no_oled_ack"); return;
  }
  address=at3c?0x3C:0x3D;
  oled.setI2CAddress(address<<1); oled.setBusClock(100000); oled.begin();
  Wire.setTimeOut(20);
  if (!responds(address)) { Serial.println("status=failed reason=ack_lost_after_init"); return; }
  oled.setContrast(80); displayReady=true;
  Serial.printf("status=awaiting_visual_check oled_address=0x%02X\n",address);
  // A held button does not start illumination during boot.
  if (digitalRead(PIN_START)==HIGH && digitalRead(PIN_FINISH)==HIGH) startSequence();
  else Serial.println("rgb=OFF reason=release_buttons_then_send_r");
}

void loop() {
  if (!displayReady) { rgbOff(); delay(20); return; }
  const uint32_t now=millis();
  const bool bothPressed=digitalRead(PIN_START)==LOW && digitalRead(PIN_FINISH)==LOW;
  if (bothPressed && sequenceEnabled) stopSequence("both_buttons");
  if (Serial.available()) {
    const char c=(char)Serial.read();
    if (c=='x') stopSequence("serial_stop");
    if (c=='r' && digitalRead(PIN_START)==HIGH && digitalRead(PIN_FINISH)==HIGH) startSequence();
  }
  // startSequence() can sample a newer millis(); take a fresh timestamp.
  updateRgb(millis());
  if (now-lastFrame<500) return;
  lastFrame=now;
  if (!responds(address)) {
    displayReady=false; stopSequence("oled_ack_lost");
    Serial.println("unplug_usb_before_rewiring=true"); return;
  }
  const int raw=analogRead(PIN_LIGHT);
  const int start=digitalRead(PIN_START), finish=digitalRead(PIN_FINISH);
  char line[28]; oled.clearBuffer(); oled.drawFrame(0,0,128,64);
  oled.setFont(u8g2_font_6x12_tf);
  snprintf(line,sizeof(line),"RGB: %s",colorName); oled.drawStr(5,14,line);
  snprintf(line,sizeof(line),"TIME: %lu s",(unsigned long)(now/1000)); oled.drawStr(5,29,line);
  snprintf(line,sizeof(line),"LIGHT: %d",raw); oled.drawStr(5,44,line);
  snprintf(line,sizeof(line),"START:%d FINISH:%d",start,finish); oled.drawStr(5,59,line);
  oled.sendBuffer();
  // Do not leave a color on longer just because a display write took time.
  if (digitalRead(PIN_START)==LOW && digitalRead(PIN_FINISH)==LOW && sequenceEnabled)
    stopSequence("both_buttons_after_display");
  updateRgb(millis());
  Serial.printf("uptime_ms=%lu light_raw=%d start=%d finish=%d rgb_command=%s\n",
                (unsigned long)now,raw,start,finish,colorName);
}
