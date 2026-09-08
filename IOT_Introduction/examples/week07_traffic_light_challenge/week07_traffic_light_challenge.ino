#include <Arduino.h>
#include <Wire.h>
#include <U8g2lib.h>
#include <ESP32Servo.h>
#include <esp_system.h>

// 0: blocked; 1: verified low-power game; 2: add verified servo + buzzer.
const int LESSON_STAGE = 0;
const char* DEVICE_ID = "BOARD-T01";
const bool LOW_POWER_PROFILE_CONFIRMED = false;
const bool SERVO_AND_POWER_PROFILE_CONFIRMED = false;
const bool BUZZER_PROFILE_CONFIRMED = false;
const int PIN_LIGHT = -1;
const int PIN_START = -1;
const int PIN_FINISH = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;
const int PIN_SDA = -1;
const int PIN_SCL = -1;
const int OLED_ADDRESS_7BIT = -1;
const int PIN_SERVO = -1;
const int PIN_BUZZER = -1;
const int BUZZER_ON_LEVEL = -1;
const bool BUZZER_USE_TONE = false;
const int BUZZER_SERIES_OHMS = -1; // HW-508 tone path requires a verified 1 kOhm resistor.
const uint32_t BUZZER_HZ = 2000;
const int SERVO_HZ = -1;
const int SERVO_MIN_US = -1;
const int SERVO_MAX_US = -1;
const int SAFE_MIN_ANGLE = -1;
const int SAFE_MAX_ANGLE = -1;
const int ZERO_ANGLE = -1;
const int SIX_ANGLE = -1;
const int INDOOR_MIN = -1;
const int INDOOR_MAX = -1;
const int SHADE_MIN = -1;
const int SHADE_MAX = -1;

const uint32_t GAME_MS=30000, COLOR_MS=3000, SAMPLE_MS=50, STABLE_MS=150;
const uint32_t BUTTON_MS=30, UNSETTLED_LIMIT_MS=2000, SAMPLE_STALE_MS=200;
const uint32_t DISPLAY_MS=200, LOG_MS=500, BEEP_MS=200, PREPARE_LIMIT_MS=20000;
const int TARGET=6;
// ACK is not a controller ID. Select after electrical and fixed-screen checks.
#ifndef OLED_CONTROLLER
#define OLED_CONTROLLER 1306
#endif
#if OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE,PIN_SCL,PIN_SDA);
#elif OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE,PIN_SCL,PIN_SDA);
#else
#error Unsupported OLED_CONTROLLER: use a verified 1306 or 1315 configuration.
#endif
Servo pointer;
enum GameState { IDLE, RUNNING, SUCCESS, FAILED, ABORTED };
enum LightState { UNKNOWN=-1, INDOOR=0, SHADE=1 };
GameState state=IDLE;
LightState stable=UNKNOWN,candidate=UNKNOWN;
bool ready=false,shadeHigh=true,lightSettled=false,eventArmed=false,hadSample=false;
bool unsettled=true,injectedFault=false,ioFault=false,cleared=false,prepared=false;
bool greenPhase=false,buzzerOn=false,dirty=true;
bool buzzerFault=false;
int lowerThreshold=-1,upperThreshold=-1,lightRaw=-1,count=0,angleCommand=-1;
uint32_t bootId=0,gameId=0,startedAt=0,frozenRemaining=GAME_MS,candidateAt=0;
uint32_t unsettledAt=0,lastSample=0,lastDraw=0,lastLog=0,beepAt=0,preparedAt=0;
const char* reason="boot_idle";
struct Button {
 bool raw=false,candidate=false,stable=false,edge=false;
 uint32_t changedAt=0;
 void update(bool pressed,uint32_t now){
  raw=pressed;edge=false;
  if(pressed!=candidate){candidate=pressed;changedAt=now;}
  if(candidate!=stable && now-changedAt>=BUTTON_MS){stable=candidate;edge=stable;}
 }
 bool released(uint32_t now)const{return !raw&&!stable&&!candidate&&now-changedAt>=BUTTON_MS;}
};
Button startButton,finishButton;

bool profileReady(){
 if(LESSON_STAGE<1||LESSON_STAGE>2||!LOW_POWER_PROFILE_CONFIRMED)return false;
 if(RGB_ON_LEVEL!=LOW&&RGB_ON_LEVEL!=HIGH)return false;
 if(OLED_ADDRESS_7BIT<8||OLED_ADDRESS_7BIT>119)return false;
 if(INDOOR_MIN<=0||SHADE_MIN<=0||INDOOR_MAX>=4095||SHADE_MAX>=4095||
    INDOOR_MIN>INDOOR_MAX||SHADE_MIN>SHADE_MAX)return false;
 shadeHigh=INDOOR_MAX<SHADE_MIN;
 if(!shadeHigh && !(SHADE_MAX<INDOOR_MIN))return false;
 const int lowEnd=shadeHigh?INDOOR_MAX:SHADE_MAX;
 const int highBegin=shadeHigh?SHADE_MIN:INDOOR_MIN;
 if(highBegin-lowEnd<3)return false;
 lowerThreshold=lowEnd+(highBegin-lowEnd)/3;
 upperThreshold=lowEnd+2*(highBegin-lowEnd)/3;
 const int pins[]={PIN_LIGHT,PIN_START,PIN_FINISH,PIN_RGB_R,PIN_RGB_G,PIN_RGB_B,
                   PIN_SDA,PIN_SCL,PIN_SERVO,PIN_BUZZER};
 const int size=LESSON_STAGE==2?10:8;
 for(int i=0;i<size;i++){if(pins[i]<0)return false;for(int j=0;j<i;j++)if(pins[i]==pins[j])return false;}
 if(LESSON_STAGE==2 && (!SERVO_AND_POWER_PROFILE_CONFIRMED||!BUZZER_PROFILE_CONFIRMED||
    (BUZZER_USE_TONE ? BUZZER_SERIES_OHMS!=1000 :
     (BUZZER_ON_LEVEL!=LOW&&BUZZER_ON_LEVEL!=HIGH))||SERVO_HZ<10||SERVO_HZ>400||
    SERVO_MIN_US<500||SERVO_MAX_US>2500||SERVO_MIN_US>=SERVO_MAX_US||
    SAFE_MIN_ANGLE<0||SAFE_MAX_ANGLE>180||SAFE_MIN_ANGLE>ZERO_ANGLE||
    ZERO_ANGLE>=SIX_ANGLE||SIX_ANGLE>SAFE_MAX_ANGLE))return false;
 return true;
}
const char* stateName(){switch(state){case IDLE:return "IDLE";case RUNNING:return "RUNNING";
 case SUCCESS:return "SUCCESS";case FAILED:return "FAILED";default:return "ABORTED";}}
const char* lightName(){return stable==SHADE?"SHADE":stable==INDOOR?"INDOOR":"UNKNOWN";}
bool terminal(){return state==SUCCESS||state==FAILED||state==ABORTED;}
uint32_t remainingAt(uint32_t now){return state==RUNNING?(now-startedAt>=GAME_MS?0:GAME_MS-(now-startedAt)):frozenRemaining;}
uint32_t displaySeconds(uint32_t ms){return (ms+999)/1000;}
bool bothReleased(uint32_t now){return startButton.released(now)&&finishButton.released(now);}
bool fresh(uint32_t now){return hadSample&&now-lastSample<=SAMPLE_STALE_MS;}
bool oledAck(){Wire.beginTransmission(OLED_ADDRESS_7BIT);return Wire.endTransmission()==0;}
void rgbOff(){const int off=1-RGB_ON_LEVEL;digitalWrite(PIN_RGB_R,off);digitalWrite(PIN_RGB_G,off);digitalWrite(PIN_RGB_B,off);}
void rgbPhase(){rgbOff();digitalWrite(greenPhase?PIN_RGB_G:PIN_RGB_R,RGB_ON_LEVEL);}
void silence(){
 if(LESSON_STAGE==2){
  if(BUZZER_USE_TONE){
   if(!ledcWrite(PIN_BUZZER,0)){
    ledcDetach(PIN_BUZZER);digitalWrite(PIN_BUZZER,LOW);pinMode(PIN_BUZZER,OUTPUT);
    if(!buzzerFault)Serial.println("event_type=buzzer_fault reason=tone_stop_failed restart_required=true");
    buzzerFault=true;
   }
  }else digitalWrite(PIN_BUZZER,1-BUZZER_ON_LEVEL);
 }
 buzzerOn=false;
}
bool initializeBuzzer(){
 digitalWrite(PIN_BUZZER,BUZZER_USE_TONE?LOW:1-BUZZER_ON_LEVEL);pinMode(PIN_BUZZER,OUTPUT);
 if(BUZZER_USE_TONE&&!ledcAttach(PIN_BUZZER,BUZZER_HZ,10))return false;
 silence();return !buzzerFault;
}
bool startBeep(uint32_t now){
 if(buzzerFault)return false;
 if(BUZZER_USE_TONE){
  if(ledcWriteTone(PIN_BUZZER,BUZZER_HZ)==0){buzzerFault=true;silence();return false;}
 }else digitalWrite(PIN_BUZZER,BUZZER_ON_LEVEL);
 buzzerOn=true;beepAt=now;return true;
}
void detachPointer(){if(LESSON_STAGE==2){if(pointer.attached())pointer.detach();digitalWrite(PIN_SERVO,LOW);}prepared=false;}
int angleForCount(int n){return ZERO_ANGLE+(SIX_ANGLE-ZERO_ANGLE)*n/TARGET;}
void logEvent(const char* type,const char* why,uint32_t now,int before){
 Serial.printf("device_id=%s boot_id=%08lx game_id=%lu event_type=%s state=%s value=%d unit=count "
  "valid=%s reason=%s uptime_ms=%lu phase=%s light_raw=%d light_state=%s settled=%s armed=%s "
  "count_before=%d count_after=%d remaining_ms=%lu result=%s angle_command=%d position_measured=false\n",
  DEVICE_ID,(unsigned long)bootId,(unsigned long)gameId,type,stateName(),count,
  fresh(now)&&lightSettled&&!injectedFault?"true":"false",why,(unsigned long)now,
  state==RUNNING?(greenPhase?"GREEN":"RED"):"OFF",lightRaw,lightName(),lightSettled?"true":"false",
  eventArmed?"true":"false",before,count,(unsigned long)remainingAt(now),stateName(),angleCommand);
}
void writePointer(uint32_t now){
 if(LESSON_STAGE==2&&pointer.attached()){
  angleCommand=angleForCount(count);pointer.write(angleCommand);logEvent("pointer_command","count_mapping",now,count);
 }
}
void settle(GameState target,const char* why,uint32_t now){
 if(terminal()){if(target==ABORTED){silence();detachPointer();rgbOff();}return;}
 if(target!=ABORTED&&state!=RUNNING)return;
 frozenRemaining=remainingAt(now);state=target;reason=why;cleared=false;dirty=true;
 rgbOff();silence();detachPointer();
 if(target==FAILED&&LESSON_STAGE==2&&!startBeep(now)){
  state=ABORTED;reason="buzzer_failed_restart_required";
 }
 logEvent("result",reason,now,count);
}
// Confirm an event only after a classified value remains for STABLE_MS.
// Middle-band readings keep the displayed previous state, but cannot confirm or rearm.
bool sampleLight(int raw,uint32_t now){
 lightRaw=raw;lastSample=now;hadSample=true;
 LightState next=UNKNOWN;
 if(raw>0&&raw<4095){if(raw<=lowerThreshold)next=shadeHigh?INDOOR:SHADE;
  else if(raw>=upperThreshold)next=shadeHigh?SHADE:INDOOR;}
 if(next==UNKNOWN){candidate=UNKNOWN;candidateAt=now;lightSettled=false;
  if(raw<=0||raw>=4095){stable=UNKNOWN;eventArmed=false;}
 }else{
  if(next!=candidate){candidate=next;candidateAt=now;}
  lightSettled=now-candidateAt>=STABLE_MS;
  if(lightSettled){
   const bool changed=stable!=next;stable=next;
   if(next==INDOOR)eventArmed=true;
   if(next==SHADE&&changed){const bool event=eventArmed;eventArmed=false;unsettled=false;return event;}
  }
 }
 if(lightSettled)unsettled=false;
 else if(!unsettled){unsettled=true;unsettledAt=now;}
 return false;
}
bool persistentFault(uint32_t now){return unsettled&&now-unsettledAt>=UNSETTLED_LIMIT_MS;}
void stepGame(uint32_t now,bool startEdge,bool finishEdge,bool coverEdge,bool abortRequest){
 // One snapshot, fixed priority: abort -> deadline -> color -> score -> finish.
 if(abortRequest||ioFault||buzzerFault||(state==RUNNING&&(!fresh(now)||persistentFault(now)))){
  settle(ABORTED,abortRequest?"manual_or_both_buttons":buzzerFault?"buzzer_failed_restart_required":
   ioFault?"display_ack_failed":"light_unavailable",now);return;
 }
 if(state==IDLE){
  if(LESSON_STAGE==2&&prepared&&now-preparedAt>=PREPARE_LIMIT_MS){settle(ABORTED,"prepare_timeout",now);return;}
  if(startEdge){
   if(!finishButton.raw&&!finishButton.stable&&finishButton.released(now)&&fresh(now)&&
      lightSettled&&stable==INDOOR&&!injectedFault&&(LESSON_STAGE==1||prepared)){
    state=RUNNING;gameId++;startedAt=now;frozenRemaining=GAME_MS;count=0;greenPhase=true;
    reason="start_accepted";eventArmed=true;rgbPhase();dirty=true;logEvent("start",reason,now,0);
   }else logEvent("start_rejected","release_finish_uncover_or_prepare",now,count);
  }
  return;
 }
 if(state!=RUNNING)return;
 if(now-startedAt>=GAME_MS){settle(FAILED,"deadline",now);return;}
 const bool nextGreen=((now-startedAt)/COLOR_MS)%2==0;
 if(nextGreen!=greenPhase){greenPhase=nextGreen;rgbPhase();dirty=true;logEvent("phase","clock_phase",now,count);}
 if(coverEdge){const int before=count;
  count=greenPhase?(count<TARGET?count+1:TARGET):(count>0?count-1:0);
  dirty=true;logEvent("cover",greenPhase?"green_credit":"red_penalty",now,before);
  if(count!=before)writePointer(now);
 }
 if(finishEdge)settle(count==TARGET?SUCCESS:FAILED,count==TARGET?"finish_target":"finish_below_target",now);
}
void handleCommand(char c,uint32_t now){
 if(c=='\r'||c=='\n'||c==' ')return;
 if(c=='x'){settle(ABORTED,"manual_abort",now);return;}
 if(c=='f'){injectedFault=true;sampleLight(-1,now);logEvent("fault_injection","software_missing_not_wire_removal",now,count);return;}
 if(c=='r'){injectedFault=false;logEvent("injection_removed","wait_new_stable_sample",now,count);return;}
 if(c=='c'&&state==ABORTED&&bothReleased(now)&&fresh(now)&&lightSettled&&!injectedFault&&!buzzerFault){
  ioFault=!oledAck();cleared=!ioFault;logEvent("clear",cleared?"reset_required":"display_still_unresponsive",now,count);return;
 }
 if(c=='z'&&terminal()&&bothReleased(now)&&fresh(now)&&lightSettled&&!injectedFault&&!ioFault&&!buzzerFault&&
    (state!=ABORTED||cleared)){
  silence();detachPointer();state=IDLE;count=0;angleCommand=-1;frozenRemaining=GAME_MS;
  cleared=false;reason="reset_idle_not_started";dirty=true;logEvent("reset",reason,now,0);return;
 }
 // Operator must have external servo power OFF and the approved power sequence.
 if(c=='a'&&LESSON_STAGE==2&&state==IDLE&&!prepared&&bothReleased(now)&&fresh(now)&&lightSettled&&
    stable==INDOOR&&!ioFault&&!injectedFault&&!buzzerFault){
  pointer.setPeriodHertz(SERVO_HZ);pointer.attach(PIN_SERVO,SERVO_MIN_US,SERVO_MAX_US);
  if(!pointer.attached()){settle(ABORTED,"attach_failed",now);return;}
  prepared=true;preparedAt=now;count=0;writePointer(now);dirty=true;
  logEvent("prepare","operator_power_off_acknowledged_not_sensed",now,count);return;
 }
 logEvent("command_rejected","state_or_guard",now,count);
}
void drawSnapshot(uint32_t now){
 if(ioFault)return;
 if(!oledAck()){ioFault=true;settle(ABORTED,"display_ack_failed",now);return;}
 char s[26];oled.clearBuffer();oled.setFont(u8g2_font_6x12_tf);
 oled.drawStr(0,12,stateName());
 snprintf(s,sizeof(s),"TIME %lu s  %d/6",(unsigned long)displaySeconds(remainingAt(now)),count);oled.drawStr(0,28,s);
 const char* hint=state==RUNNING?(greenPhase?"GREEN: COVER":"RED: NO COVER"):
  state==SUCCESS?"PASS / RESET z":state==FAILED?"FAIL / RESET z":state==ABORTED?"ABORT / CHECK LOG":
  LESSON_STAGE==1?"UN COVER / START":prepared?"READY / START":"POWER OFF / ARM a";
 oled.drawStr(0,44,hint);oled.drawStr(0,60,LESSON_STAGE==1?"STAGE1: NO SERVO/BEEP":pointer.attached()?"POINTER: COMMAND ONLY":"POINTER: NO SIGNAL");
 oled.sendBuffer();
 if(!oledAck()){ioFault=true;settle(ABORTED,"display_ack_failed",millis());}
}
void setup(){
 Serial.begin(115200);delay(1000);
 if(!profileReady()){Serial.println("week=7 status=blocked reason=profile_missing");return;}
 ready=true;bootId=esp_random();unsettledAt=millis();
 for(int p:{PIN_RGB_R,PIN_RGB_G,PIN_RGB_B}){digitalWrite(p,1-RGB_ON_LEVEL);pinMode(p,OUTPUT);}
 pinMode(PIN_START,INPUT_PULLUP);pinMode(PIN_FINISH,INPUT_PULLUP);
 startButton.changedAt=finishButton.changedAt=millis();
 analogReadResolution(12);analogSetPinAttenuation(PIN_LIGHT,ADC_11db);
 if(LESSON_STAGE==2){digitalWrite(PIN_SERVO,LOW);pinMode(PIN_SERVO,OUTPUT);
  if(!initializeBuzzer()){
   ready=false;Serial.println("week=7 status=blocked reason=buzzer_init_failed");return;
  }}
 if(!Wire.begin(PIN_SDA,PIN_SCL,100000)){ioFault=true;settle(ABORTED,"i2c_begin_failed",millis());}
 else {Wire.setTimeOut(20);if(!oledAck()){ioFault=true;settle(ABORTED,"display_ack_failed",millis());}
  else{oled.setI2CAddress(OLED_ADDRESS_7BIT*2);oled.setBusClock(100000);oled.begin();Wire.setTimeOut(20);}}
 Serial.printf("week=7 stage=%d duration_ms=%lu stable_ms=%lu lower=%d upper=%d shade_high=%s "
  "commands=a,x,f,r,c,z no_physical_feedback=true\n",LESSON_STAGE,(unsigned long)GAME_MS,
  (unsigned long)STABLE_MS,lowerThreshold,upperThreshold,shadeHigh?"true":"false");
}
void loop(){
 if(!ready)return;
 uint32_t now=millis();startButton.update(digitalRead(PIN_START)==LOW,now);
 finishButton.update(digitalRead(PIN_FINISH)==LOW,now);
 bool cover=false;if(!hadSample||now-lastSample>=SAMPLE_MS)cover=sampleLight(injectedFault?-1:analogRead(PIN_LIGHT),now);
 // Drain at most one command; input work remains bounded per iteration.
 if(Serial.available())handleCommand((char)Serial.read(),now);
 // A command can invalidate the sample taken earlier in this same iteration.
 if(injectedFault||!lightSettled)cover=false;
 stepGame(now,startButton.edge,finishButton.edge,cover,startButton.raw&&finishButton.raw);
 if(buzzerOn&&now-beepAt>=BEEP_MS)silence();
 // Skip display I/O during the short beep; checking its expiry takes priority.
 if(!buzzerOn&&(dirty||now-lastDraw>=DISPLAY_MS)){lastDraw=now;dirty=false;drawSnapshot(now);}
 now=millis();
 // I2C is synchronous. Recheck safety/deadline with NEW time, without replaying edges.
 const bool abortNow=digitalRead(PIN_START)==LOW&&digitalRead(PIN_FINISH)==LOW;
 if(abortNow||ioFault)settle(ABORTED,abortNow?"both_buttons_after_display":"display_ack_failed",now);
 else if(state==RUNNING&&!fresh(now))settle(ABORTED,"sample_stale_after_display",now);
 else if(state==RUNNING&&now-startedAt>=GAME_MS)settle(FAILED,"deadline_after_display",now);
 if(buzzerOn&&now-beepAt>=BEEP_MS)silence();
 if(now-lastLog>=LOG_MS){lastLog=now;logEvent("snapshot",reason,now,count);}
}
