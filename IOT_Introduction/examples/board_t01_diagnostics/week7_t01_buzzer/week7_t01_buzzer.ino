#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>

// Local BOARD-T01 candidate test, NOT a verified classroom wiring profile.
// REMOVE d6-a10. GPIO18 -> a10; mandatory 1k resistor b10-b12;
// HW-508 plus -> a12, minus -> c22 (GND), middle unconnected.
// No battery or servo. Never bypass the resistor to increase volume.
// OLED: GND b3, VDD b6, SDA8, SCK9; light4; start5; finish6.
constexpr int BUZZER_PIN=18, LIGHT_PIN=4, START_PIN=5, FINISH_PIN=6;
constexpr int SDA_PIN=8, SCL_PIN=9;
constexpr uint32_t BEEP_HZ=2000, BEEP_MS=200;
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(
    U8G2_R0, U8X8_PIN_NONE, SCL_PIN, SDA_PIN);
bool ready=false, testUsed=false;
uint8_t address=0;
uint32_t lastFrame=0;
const char* testState="WAIT";

bool responds(uint8_t addr) {
  Wire.beginTransmission(addr);
  return Wire.endTransmission()==0;
}
bool buttonsReleased() {
  return digitalRead(START_PIN)==HIGH && digitalRead(FINISH_PIN)==HIGH;
}
void silence() {
  // Keep the attached output at LOW, not floating between trials.
  ledcWrite(BUZZER_PIN,0);
}
void shortBeep() {
  if (!ready || testUsed || !buttonsReleased()) {
    Serial.println("beep=rejected reason=not_ready_or_used_or_button_held");
    return;
  }
  if (!responds(address)) {
    ready=false; testState="I2C FAIL";
    Serial.println("beep=rejected reason=oled_ack_lost");
    return;
  }
  testUsed=true; // One trial per boot, even if a terminal queues repeated b's.
  Serial.println("beep=command hz=2000 duration_ms=200 series_ohms=1000");
  const uint32_t actualHz=ledcWriteTone(BUZZER_PIN,BEEP_HZ);
  if (actualHz==0) {
    silence(); ready=false; testState="PWM FAIL";
    Serial.println("status=failed reason=pwm_start_failed");
    return;
  }
  const uint32_t started=millis();
  bool aborted=false;
  // This short diagnostic intentionally suspends OLED I2C transfers while
  // sounding. It is not the final game's non-blocking control loop.
  while ((uint32_t)(millis()-started)<BEEP_MS) {
    if (!buttonsReleased()) { aborted=true; break; }
    if (Serial.available() && Serial.read()=='x') { aborted=true; break; }
    delay(1);
  }
  silence();
  testState=aborted?"STOPPED":"DONE";
  Serial.printf("beep=off reason=%s sound_observation=pending\n",
                aborted?"stop":"duration_complete");
}

void setup() {
  digitalWrite(BUZZER_PIN,LOW); pinMode(BUZZER_PIN,OUTPUT);
  for (int pin : {15,16,17}) { digitalWrite(pin,LOW); pinMode(pin,OUTPUT); }
  pinMode(START_PIN,INPUT_PULLUP); pinMode(FINISH_PIN,INPUT_PULLUP);
  pinMode(LIGHT_PIN,INPUT);
  Serial.begin(115200); delay(1000);
  Serial.println("test=week7_t01_buzzer version=1 gpio=18 battery=DISCONNECTED");
  analogReadResolution(12); analogSetPinAttenuation(LIGHT_PIN,ADC_11db);
  if (!Wire.begin(SDA_PIN,SCL_PIN,100000)) {
    Serial.println("status=failed reason=i2c_begin_failed"); return;
  }
  Wire.setTimeOut(20);
  const bool at3c=responds(0x3C), at3d=responds(0x3D);
  if (at3c==at3d) {
    Serial.println("status=failed reason=missing_or_ambiguous_oled"); return;
  }
  address=at3c?0x3C:0x3D;
  oled.setI2CAddress(address<<1); oled.setBusClock(100000); oled.begin();
  Wire.setTimeOut(20); oled.setContrast(80);
  if (!responds(address)) {
    Serial.println("status=failed reason=oled_init_ack_lost"); return;
  }
  if (!ledcAttach(BUZZER_PIN,BEEP_HZ,10)) {
    Serial.println("status=failed reason=pwm_attach_failed"); return;
  }
  silence(); ready=true; testState="READY";
  Serial.println("status=ready send=b_once stop=x_or_either_button resistor_required=1000ohm");
}

void loop() {
  if (Serial.available()) {
    const char c=(char)Serial.read();
    if (c=='x') {
      if (ready) silence();
      testUsed=true; testState="STOPPED";
      Serial.println("beep=off reason=serial_stop");
    } else if (c=='b') shortBeep();
  }
  if (!ready) { delay(5); return; }
  const uint32_t now=millis();
  if (now-lastFrame<500) return;
  lastFrame=now;
  if (!responds(address)) {
    silence(); ready=false; testState="I2C FAIL";
    Serial.println("status=failed reason=oled_ack_lost unplug_before_rewiring=true");
    return;
  }
  const int raw=analogRead(LIGHT_PIN);
  const int start=digitalRead(START_PIN), finish=digitalRead(FINISH_PIN);
  char line[28]; oled.clearBuffer(); oled.drawFrame(0,0,128,64);
  oled.setFont(u8g2_font_6x12_tf);
  snprintf(line,sizeof(line),"BUZZER: %s",testState); oled.drawStr(5,14,line);
  snprintf(line,sizeof(line),"TIME: %lu s",(unsigned long)(now/1000)); oled.drawStr(5,29,line);
  snprintf(line,sizeof(line),"LIGHT: %d",raw); oled.drawStr(5,44,line);
  snprintf(line,sizeof(line),"START:%d FINISH:%d",start,finish); oled.drawStr(5,59,line);
  oled.sendBuffer();
  Serial.printf("uptime_ms=%lu light_raw=%d start=%d finish=%d buzzer=%s\n",
                (unsigned long)now,raw,start,finish,testState);
}
