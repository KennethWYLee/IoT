#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
const int PIN_SDA=8, PIN_SCL=9, PIN_RED=15, PIN_GREEN=16, PIN_BLUE=17, PIN_BUTTON=5;
// Teacher verifies common GND, current limiting and GPIO current before enabling.
const bool RGB_WIRING_CONFIRMED=false;
#define OLED_CONTROLLER 1306
#if OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#elif OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#else
#error Select the verified OLED controller.
#endif
bool oledReady=false, attemptedOled=false;
uint8_t oledAddress=0;
uint32_t lastOledTry=0, lastFrame=0, changedAt=0;
int lastReading=HIGH, stableButton=HIGH;
bool releaseSeen=false;
void resetButton() {
  lastReading=stableButton=digitalRead(PIN_BUTTON);
  releaseSeen=false; changedAt=millis();
}
bool buttonPressed() {
  const uint32_t now=millis(); const int reading=digitalRead(PIN_BUTTON);
  if(reading!=lastReading) {lastReading=reading; changedAt=now;}
  if(uint32_t(now-changedAt)<40) return false;
  if(reading==HIGH) releaseSeen=true;
  if(reading==stableButton) return false;
  stableButton=reading;
  if(reading==LOW && releaseSeen) {releaseSeen=false; return true;}
  return false;
}
void setColor(int color) {
  if(!RGB_WIRING_CONFIRMED) return;
  digitalWrite(PIN_RED,color==1?HIGH:LOW);
  digitalWrite(PIN_GREEN,color==2?HIGH:LOW);
  digitalWrite(PIN_BLUE,color==3?HIGH:LOW);
}
const char* colorName(int c) {return c==1?"RED":c==2?"GREEN":c==3?"BLUE":"OFF";}
bool acknowledge(uint8_t a) {Wire.beginTransmission(a); return Wire.endTransmission()==0;}
bool startOled() {
  const bool a=acknowledge(0x3C), b=acknowledge(0x3D);
  if(a==b) return false;
  oledAddress=a?0x3C:0x3D; oled.setI2CAddress(oledAddress<<1);
  oled.begin(); oled.setBusClock(100000); oled.setFont(u8g2_font_6x10_tf);
  return acknowledge(oledAddress);
}
bool displayAvailable() {
  if(oledReady && !acknowledge(oledAddress)) oledReady=false;
  if(!oledReady) {
    setColor(0);
    if(!attemptedOled || uint32_t(millis()-lastOledTry)>=2000) {
      attemptedOled=true; lastOledTry=millis(); oledReady=startOled();
      if(!oledReady) Serial.println("OLED: check VDD/GND/SCK/SDA and controller");
    }
  }
  return oledReady;
}
void beginHardware() {
  Serial.begin(115200);
  Wire.begin(PIN_SDA,PIN_SCL); Wire.setClock(100000); Wire.setTimeOut(20);
  if(RGB_WIRING_CONFIRMED) {
    for(int pin:{PIN_RED,PIN_GREEN,PIN_BLUE}) {digitalWrite(pin,LOW); pinMode(pin,OUTPUT);}
  }
  pinMode(PIN_BUTTON,INPUT_PULLUP); resetButton();
}
char lines[6][32]{};
void clearLines() {for(auto& line:lines) line[0]=0;}
void showLines() {
  if(!RGB_WIRING_CONFIRMED) snprintf(lines[5],sizeof(lines[5]),"CHECK RGB WIRING");
  oled.clearBuffer();
  for(int i=0;i<6;++i) oled.drawStr(0,10+i*10,lines[i]);
  oled.sendBuffer(); lastFrame=millis();
  if(!acknowledge(oledAddress)) {oledReady=false; setColor(0);}
}

int deskState=0;
void setup() {beginHardware();}
void loop() {
  if(!displayAvailable()) {resetButton(); return;}
  if(buttonPressed()) deskState=(deskState+1)%3;
  const int color=deskState==0?2:deskState==1?1:3;
  setColor(color); clearLines();
  snprintf(lines[0],sizeof(lines[0]),"DESK STATUS");
  snprintf(lines[1],sizeof(lines[1]),"%s",deskState==0?"AVAILABLE":deskState==1?"BUSY":"AWAY");
  snprintf(lines[2],sizeof(lines[2]),"LED:%s",colorName(color));
  snprintf(lines[4],sizeof(lines[4]),"PRESS TO CHANGE");
  if(uint32_t(millis()-lastFrame)>=100) showLines();
}
