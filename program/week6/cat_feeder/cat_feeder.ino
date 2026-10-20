// Week6 Q1：課堂紙球模型。光敏只確認等候位置遮光，不辨識動物。
#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
#include <ESP32Servo.h>
#include <string.h>
#define OLED_CONTROLLER 1315
const int PIN_LIGHT=4,PIN_BUTTON=5,PIN_STOP=6,PIN_SERVO=7,PIN_SDA=8,PIN_SCL=9;
const int PIN_RED=15,PIN_GREEN=16,PIN_BLUE=17;
const bool SERVO_SETUP_CONFIRMED=true,RGB_WIRING_CONFIRMED=true;
const int SAFE_MIN_US=1500,SAFE_MAX_US=2000;
const uint32_t MAX_ARM_MS=30000,MOVE_INTERVAL_MS=1000;
const uint32_t WAIT_MS=10000,DISPENSE_MS=2000,SETTLE_MS=500;
#if OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#elif OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#else
#error Select the verified OLED controller.
#endif
Servo pointer;
enum Stage{PREPARE,POWER_CONFIRM,RUN,HALTED};
enum FeedState{READY,COUNT,WAIT,OPENING,DISPENSE,CLOSING,DONE};
Stage stage=PREPARE;
FeedState feed=READY;
bool armed=false,oledReady=false;
uint8_t oledAddress=0;
uint32_t armedAt=0,lastMoveAt=0,startedAt=0,openedAt=0,lastFrame=0,lastOledTry=0,completed=0;
int position=0,target=0;
int raw=0,emptyRaw=0,presentRaw=0,calibrationStep=0,presence=-1,candidate=-2;
uint32_t candidateAt=0;
bool calibrationRetry=false;
int reading=HIGH,stableButton=HIGH;
bool released=false;
uint32_t changedAt=0;
const char* stopReason="--";
char lines[6][24]{};
char sentLines[6][24]{};
bool screenSent=false;
volatile bool stopRequested=false;
void ARDUINO_ISR_ATTR onStopPress(){stopRequested=true;}
bool configured(){return SERVO_SETUP_CONFIRMED&&SAFE_MIN_US>=500&&SAFE_MAX_US<=2400&&SAFE_MAX_US>SAFE_MIN_US;}
bool lightValid(){return raw>=0&&raw<=4095;}
bool ack(uint8_t address){Wire.beginTransmission(address);return Wire.endTransmission()==0;}
bool feeding(){return feed==OPENING||feed==DISPENSE||feed==CLOSING;}
int workColor(){return feeding()?1:(feed==COUNT||feed==WAIT)?3:2;}
void setRgb(int color){
 if(!RGB_WIRING_CONFIRMED)return;
 digitalWrite(PIN_RED,color==1?HIGH:LOW);digitalWrite(PIN_GREEN,color==2?HIGH:LOW);digitalWrite(PIN_BLUE,color==3?HIGH:LOW);
}
const char* positionName(int value){return value==0?"CLOSED":"OPEN";}
const char* presenceName(){return presence==0?"EMPTY":presence==1?"PRESENT":"UNKNOWN";}
void stopWork(const char* reason){
 if(stage==HALTED)return;
 stopReason=reason;stage=HALTED;armed=false;pointer.detach();setRgb(0);
 Serial.println("STOP: external power OFF; remove paper payload; release buttons; RST.");
}
void checkStop(){
 if(stage==HALTED)return;
 if(stopRequested||digitalRead(PIN_STOP)==LOW)stopWork("STOP");
 else if(armed&&uint32_t(millis()-armedAt)>=MAX_ARM_MS)stopWork("TIMEOUT");
}
bool pressed(){
 int r=digitalRead(PIN_BUTTON);if(r!=reading){reading=r;changedAt=millis();}
 if(uint32_t(millis()-changedAt)<40)return false;
 if(r==HIGH)released=true;
 if(r==stableButton)return false;stableButton=r;
 if(r==LOW&&released){released=false;return true;}return false;
}
bool startOled(){
 const bool a=ack(0x3C),b=ack(0x3D);if(a==b)return false;
 oledAddress=a?0x3C:0x3D;oled.setI2CAddress(oledAddress<<1);
 screenSent=false;oled.begin();oled.setBusClock(100000);oled.setFont(u8g2_font_6x10_tf);return ack(oledAddress);
}
int classifyPresence(){
 if(calibrationStep<2||!lightValid())return -1;
 const int gap=abs(presentRaw-emptyRaw),mid=(presentRaw+emptyRaw)/2;
 const int d=(raw-mid)*(presentRaw>emptyRaw?1:-1);
 return d>=gap/10?1:d<=-gap/10?0:-1;
}
void readPresence(){
 uint32_t sum=0;for(int i=0;i<8;i++)sum+=analogRead(PIN_LIGHT);raw=sum/8;
 const int c=classifyPresence();
 if(c!=candidate){candidate=c;candidateAt=millis();presence=-1;}
 // 新讀值與中間區間不沿用先前的「已靠近」。
 presence=c>=0&&uint32_t(millis()-candidateAt)>=500?c:-1;
}
void calibrate(){
 if(!lightValid())return;
 if(calibrationStep==0){emptyRaw=raw;calibrationStep=1;calibrationRetry=false;}
 else{
  presentRaw=raw;
  if(abs(presentRaw-emptyRaw)<100){calibrationStep=0;calibrationRetry=true;return;}
  calibrationStep=2;presence=-1;candidate=-2;
 }
}
void arm(){
 checkStop();if(stage==HALTED||!oledReady||!configured()||!RGB_WIRING_CONFIRMED||calibrationStep!=2||!lightValid())return;
 // 料筒先清空，外接電源保持 OFF；attach 可能送出初始脈衝。
 pointer.setPeriodHertz(50);pointer.attach(PIN_SERVO,SAFE_MIN_US,SAFE_MAX_US);
 checkStop();if(stage==HALTED)return;
 if(!pointer.attached()){stopWork("ATTACH");return;}
 if(!ack(oledAddress)){oledReady=false;stopWork("OLED");return;}
 checkStop();if(stage==HALTED)return;
 pointer.writeMicroseconds(SAFE_MIN_US);position=target=0;
 armed=true;armedAt=lastMoveAt=millis();stage=POWER_CONFIRM;
}
void handlePress(){
 checkStop();if(stage==HALTED)return;
 if(calibrationStep<2){calibrate();return;}
 if(!configured())return;
 if(stage==PREPARE){arm();return;}
 if(stage==POWER_CONFIRM){stage=RUN;feed=READY;presence=-1;candidate=-2;return;}
 if(feeding())return; // 出料中不排隊，不因按住或連按追加動作。
 if(feed==COUNT||feed==WAIT){feed=READY;target=0;return;}
 feed=COUNT;startedAt=millis();target=0;
}
uint32_t remaining(){
 if(feed==READY)return 10;
 if(feed!=COUNT)return 0;
 const uint32_t elapsed=millis()-startedAt;return elapsed>=WAIT_MS?0:(WAIT_MS-elapsed+999)/1000;
}
void updateWork(){
 if(stage!=RUN)return;
 if(feed==COUNT&&uint32_t(millis()-startedAt)>=WAIT_MS)feed=WAIT;
 if(feed==WAIT&&presence==1){feed=OPENING;target=2;}
 // 使用最後送命令的時間留出示意到位等待；沒有位置回授。
 if(feed==OPENING&&position==2&&uint32_t(millis()-lastMoveAt)>=SETTLE_MS){feed=DISPENSE;openedAt=millis();}
 if(feed==DISPENSE&&uint32_t(millis()-openedAt)>=DISPENSE_MS){feed=CLOSING;target=0;}
 if(feed==CLOSING&&position==0&&uint32_t(millis()-lastMoveAt)>=SETTLE_MS){feed=DONE;++completed;}
 setRgb(workColor());
}
void moveTarget(){
 checkStop();if(!armed||stage!=RUN)return;
 if(!lightValid()){stopWork("LIGHT");return;}
 if(!pointer.attached()){stopWork("ATTACH");return;}
 if(target==position||uint32_t(millis()-lastMoveAt)<MOVE_INTERVAL_MS)return;
 if(target!=0&&target!=2){stopWork("TARGET");return;}
 if(!ack(oledAddress)){oledReady=false;stopWork("OLED");return;}
 checkStop();if(stage==HALTED)return;
 pointer.writeMicroseconds(target==0?SAFE_MIN_US:SAFE_MAX_US);position=target;lastMoveAt=millis();
}
const char* phaseName(){
 switch(feed){case READY:return "READY: PRESS";case WAIT:return "WAIT FOR CAT";case OPENING:return "OPENING";case DISPENSE:return "FEEDING";case CLOSING:return "CLOSING";case DONE:return "DONE: PRESS NEW";default:return "COUNT";}
}
void buildLines(){
 for(auto& line:lines)line[0]=0;
 snprintf(lines[0],sizeof(lines[0]),"CAT FEEDER");
 if(stage==HALTED){snprintf(lines[1],sizeof(lines[1]),"STOP: POWER OFF");snprintf(lines[2],sizeof(lines[2]),"REASON:%s",stopReason);snprintf(lines[4],sizeof(lines[4]),"REMOVE PAPER PAYLOAD");return;}
 if(calibrationStep<2){
  snprintf(lines[1],sizeof(lines[1]),"RAW:%d",raw);snprintf(lines[2],sizeof(lines[2]),"%s",calibrationStep==0?"EMPTY; PRESS":"PRESENT; PRESS");
  snprintf(lines[3],sizeof(lines[3]),"%s",calibrationRetry?"RETRY: GAP <100":"SERVO POWER OFF");return;
 }
 if(!configured()){snprintf(lines[1],sizeof(lines[1]),"PREVIEW ONLY");snprintf(lines[2],sizeof(lines[2]),"RAW:%d %s",raw,presenceName());snprintf(lines[3],sizeof(lines[3]),"NO SERVO OUTPUT");snprintf(lines[4],sizeof(lines[4]),"CHECK TEACHER SETUP");return;}
 if(configured()&&stage==PREPARE){snprintf(lines[1],sizeof(lines[1]),"POWER OFF; PRESS");snprintf(lines[2],sizeof(lines[2]),"%s",RGB_WIRING_CONFIRMED?"EMPTY TUBE FIRST":"CHECK RGB SETUP");return;}
 if(stage==POWER_CONFIRM){snprintf(lines[1],sizeof(lines[1]),"ON OK CLOSED");snprintf(lines[2],sizeof(lines[2]),"POWER ON THEN PRESS");}
 else{
  if(feed==COUNT)snprintf(lines[1],sizeof(lines[1]),"COUNT:%lu s",(unsigned long)remaining());else snprintf(lines[1],sizeof(lines[1]),"%s",phaseName());
  snprintf(lines[2],sizeof(lines[2]),"RAW:%d %s",raw,presenceName());
  snprintf(lines[3],sizeof(lines[3]),"%s:%s N:%lu",armed?"CMD":"PREVIEW",positionName(armed?position:0),(unsigned long)completed);
  snprintf(lines[4],sizeof(lines[4]),"RGB:%s",stage!=RUN?"OFF":workColor()==1?"RED":workColor()==2?"GREEN":"BLUE");
 }
 if(armed)snprintf(lines[5],sizeof(lines[5]),"SESSION:%lu s",(unsigned long)((MAX_ARM_MS-uint32_t(millis()-armedAt)+999)/1000));else snprintf(lines[5],sizeof(lines[5]),"SERVO OFF / PREVIEW");
}
void drawScreen(){
 buildLines();if(screenSent&&memcmp(lines,sentLines,sizeof(lines))==0)return;
 oled.clearBuffer();for(int i=0;i<6;i++)if(lines[i][0])oled.drawStr(0,10+i*10,lines[i]);
 oled.sendBuffer();memcpy(sentLines,lines,sizeof(lines));screenSent=true;
}
void setup(){
 Serial.begin(115200);pinMode(PIN_BUTTON,INPUT_PULLUP);pinMode(PIN_STOP,INPUT_PULLUP);reading=stableButton=digitalRead(PIN_BUTTON);changedAt=millis();
 attachInterrupt(PIN_STOP,onStopPress,FALLING);
 analogReadResolution(12);analogSetPinAttenuation(PIN_LIGHT,ADC_11db);
 if(RGB_WIRING_CONFIRMED)for(int pin:{PIN_RED,PIN_GREEN,PIN_BLUE}){digitalWrite(pin,LOW);pinMode(pin,OUTPUT);}
 Wire.begin(PIN_SDA,PIN_SCL);Wire.setClock(100000);Wire.setTimeOut(20);oledReady=startOled();lastOledTry=millis();
}
void loop(){
 checkStop();
 if(!oledReady){if(armed)stopWork("OLED");setRgb(0);if(uint32_t(millis()-lastOledTry)>=2000){lastOledTry=millis();oledReady=startOled();}reading=stableButton=digitalRead(PIN_BUTTON);released=false;changedAt=millis();return;}
 if(!ack(oledAddress)){oledReady=false;stopWork("OLED");return;}
 readPresence();checkStop();if(armed&&!lightValid())stopWork("LIGHT");
 if(pressed())handlePress();checkStop();updateWork();moveTarget();
 if(uint32_t(millis()-lastFrame)>=100){drawScreen();lastFrame=millis();checkStop();if(!ack(oledAddress)){oledReady=false;stopWork("OLED");}}
}
