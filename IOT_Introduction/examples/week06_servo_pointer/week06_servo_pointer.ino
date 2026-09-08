#include <ESP32Servo.h>
#include <cstring>
#include <Wire.h>
#include <U8g2lib.h>

const char* DEVICE_ID = "BOARD-T01";
const bool SERVO_PROFILE_CONFIRMED = false;
const bool POWER_AND_FIXTURE_CONFIRMED = false;
const bool STOP_PROFILE_CONFIRMED = false;
const int PIN_SERVO = -1;
const int PIN_STOP = -1;
const int SERVO_HZ = -1;
const int SERVO_MIN_US = -1;
const int SERVO_MAX_US = -1;
const int SAFE_MIN_ANGLE = -1;
const int SAFE_MAX_ANGLE = -1;
const int ZERO_ANGLE = -1;
const int SIX_ANGLE = -1;
const bool WITH_OLED = false; // Enable only after the standalone pointer test.
const bool OLED_PROFILE_CONFIRMED = false;
const int PIN_SDA = -1;
const int PIN_SCL = -1;
const int OLED_ADDRESS_7BIT = -1;
// ACK is not a controller ID. Select after electrical and fixed-screen checks.
#ifndef OLED_CONTROLLER
#define OLED_CONTROLLER 1306
#endif
#if OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#elif OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0, U8X8_PIN_NONE, PIN_SCL, PIN_SDA);
#else
#error Unsupported OLED_CONTROLLER: use a verified 1306 or 1315 configuration.
#endif
Servo pointer;
const uint32_t MAX_ARM_MS = 30000;
const uint32_t COMMAND_SPACING_MS = 1000;
const uint32_t RELEASE_STABLE_MS = 30;
const uint32_t DISPLAY_INTERVAL_MS = 250;
enum PointerState { DISARMED, ARMED, ABORTED };
PointerState state = DISARMED;
bool ready=false, injectedFault=false, ioFault=false, cleared=false, changed=true;
bool stopPressed=true;
uint32_t releasedSince=0, armedAt=0, commandedAt=0, lastDraw=0;
int count=0, angleCommand=-1;
const char* reason="boot_no_signal";

bool profileReady() {
  if (!SERVO_PROFILE_CONFIRMED || !POWER_AND_FIXTURE_CONFIRMED || !STOP_PROFILE_CONFIRMED) return false;
  if (PIN_SERVO < 0 || PIN_STOP < 0 || PIN_SERVO == PIN_STOP ||
      SERVO_HZ < 10 || SERVO_HZ > 400 || SERVO_MIN_US < 500 || SERVO_MAX_US > 2500 ||
      SERVO_MIN_US >= SERVO_MAX_US || SAFE_MIN_ANGLE < 0 || SAFE_MAX_ANGLE > 180 ||
      SAFE_MIN_ANGLE > ZERO_ANGLE || ZERO_ANGLE >= SIX_ANGLE || SIX_ANGLE > SAFE_MAX_ANGLE) return false;
  if (WITH_OLED) {
    if (!OLED_PROFILE_CONFIRMED || OLED_ADDRESS_7BIT < 8 || OLED_ADDRESS_7BIT > 119) return false;
    const int pins[]={PIN_SERVO,PIN_STOP,PIN_SDA,PIN_SCL};
    for(int i=0;i<4;i++) { if(pins[i]<0)return false;for(int j=0;j<i;j++)if(pins[i]==pins[j])return false; }
  }
  return true;
}
int angleForCount(int n) { return ZERO_ANGLE + (SIX_ANGLE-ZERO_ANGLE)*n/6; }
const char* stateName() { return state==ARMED?"ARMED":state==ABORTED?"ABORTED":"DISARMED"; }
bool released(uint32_t now) { return !stopPressed && now-releasedSince>=RELEASE_STABLE_MS; }
bool oledAck() { Wire.beginTransmission(OLED_ADDRESS_7BIT);return Wire.endTransmission()==0; }
void stopSignal(const char* why, bool latch) {
  if(pointer.attached())pointer.detach();
  // Do not leave a driven HIGH on an unpowered servo's signal input.
  digitalWrite(PIN_SERVO, LOW);pinMode(PIN_SERVO,OUTPUT);
  state=latch?ABORTED:DISARMED;reason=why;cleared=false;changed=true;
}
void serviceStop(uint32_t now) {
  stopPressed=digitalRead(PIN_STOP)==LOW;
  if(stopPressed) {
    releasedSince=now;
    if(state!=ABORTED || std::strcmp(reason,"physical_stop")!=0)stopSignal("physical_stop",true);
  }
  if(state==ARMED && now-armedAt>=MAX_ARM_MS)stopSignal("arm_session_timeout",true);
}
void applyCount(int next,uint32_t now) {
  count=next;angleCommand=angleForCount(count);pointer.write(angleCommand);commandedAt=now;changed=true;
  Serial.printf("device_id=%s event_type=pointer_command value=%d unit=count angle_command=%d "
                "position_measured=false uptime_ms=%lu\n",DEVICE_ID,count,angleCommand,(unsigned long)now);
}
void handleCommand(char c,uint32_t now) {
  if(c=='\r'||c=='\n'||c==' ')return;
  if(c=='x'){stopSignal("manual_abort",true);return;}
  if(c=='f'){injectedFault=true;stopSignal("injected_fault",true);return;}
  if(c=='q' && state!=ABORTED){stopSignal("manual_detach_power_not_removed",false);return;}
  if(c=='c' && state==ABORTED && released(now)) {
    injectedFault=false;ioFault=WITH_OLED&&!oledAck();cleared=!ioFault;
    reason=cleared?"cause_cleared_reset_required":"display_still_unresponsive";changed=true;return;
  }
  if(c=='z' && state==ABORTED && cleared && released(now) && !injectedFault && !ioFault){
    state=DISARMED;reason="reset_no_signal";cleared=false;changed=true;return;
  }
  // 'a' is the operator's acknowledgement that external power is OFF.
  // There is no voltage sensor here; software cannot verify this condition.
  if(c=='a' && state==DISARMED && released(now) && !injectedFault && !ioFault){
    pointer.setPeriodHertz(SERVO_HZ);pointer.attach(PIN_SERVO,SERVO_MIN_US,SERVO_MAX_US);
    if(!pointer.attached()){stopSignal("attach_failed",true);return;}
    state=ARMED;armedAt=now;reason="operator_arm_power_off_acknowledged";
    applyCount(0,now);return;
  }
  if(c>='0' && c<='6' && state==ARMED && released(now) && !injectedFault && !ioFault &&
     now-commandedAt>=COMMAND_SPACING_MS){applyCount(c-'0',now);return;}
  Serial.printf("event_type=command_rejected command=%c state=%s reason=state_or_guard\n",c,stateName());
}
void drawSnapshot(uint32_t now) {
  (void)now;
  if(!WITH_OLED||ioFault)return;
  if(!oledAck()){ioFault=true;stopSignal("display_ack_failed",true);return;}
  char text[24];oled.clearBuffer();oled.setFont(u8g2_font_6x12_tf);
  oled.drawStr(0,12,stateName());
  snprintf(text,sizeof(text),"COUNT %d/6",count);oled.drawStr(0,28,text);
  snprintf(text,sizeof(text),"ANGLE CMD %d",angleCommand);oled.drawStr(0,44,text);
  oled.drawStr(0,60,pointer.attached()?"SIGNAL ON / NO SENSE":"NO SIGNAL / NO SENSE");
  oled.sendBuffer();
  if(!oledAck()){ioFault=true;stopSignal("display_ack_failed",true);}
}
void setup(){
  Serial.begin(115200);delay(1000);
  if(!profileReady()){Serial.println("week=6 status=blocked reason=profile_missing");return;}
  ready=true;digitalWrite(PIN_SERVO,LOW);pinMode(PIN_SERVO,OUTPUT);pinMode(PIN_STOP,INPUT_PULLUP);
  releasedSince=millis();serviceStop(millis());
  if(WITH_OLED){
    if(!Wire.begin(PIN_SDA,PIN_SCL,100000)){ioFault=true;stopSignal("i2c_begin_failed",true);}
    else {Wire.setTimeOut(20);if(!oledAck()){ioFault=true;stopSignal("display_ack_failed",true);}
      else {oled.setI2CAddress(OLED_ADDRESS_7BIT*2);oled.setBusClock(100000);oled.begin();Wire.setTimeOut(20);}}
  }
  Serial.println("week=6 commands=a,0..6,q,x,f,c,z external_power=operator_checked_not_sensed");
}
void loop(){
  if(!ready)return;
  uint32_t now=millis();serviceStop(now);
  if(Serial.available())handleCommand((char)Serial.read(),now);
  if(now-lastDraw>=DISPLAY_INTERVAL_MS){lastDraw=now;drawSnapshot(now);}
  now=millis();serviceStop(now);
  if(changed){changed=false;
    Serial.printf("device_id=%s event_type=pointer_status state=%s value=%d unit=count "
                  "signal_attached=%s position_measured=false power_measured=false reason=%s uptime_ms=%lu\n",
                  DEVICE_ID,stateName(),count,pointer.attached()?"true":"false",reason,(unsigned long)now);
  }
}
