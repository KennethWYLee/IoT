#include "Arduino.h"
#include "Wire.h"
#include "U8g2lib.h"
#include "ESP32Servo.h"
#include "esp_system.h"
#include <iostream>
namespace blocked {
#include "public_game.inc"
}
namespace g {
#include "enabled_game.inc"
}
namespace low {
#include "enabled_low.inc"
}
namespace missingResistor {
#include "missing_resistor.inc"
}
int assertions=0;
#define CHECK(x) do{++assertions;if(!(x)){std::cerr<<"FAIL line "<<__LINE__<<": "<<#x<<'\n';return 1;}}while(0)
void frame(uint32_t now){
 g::lastSample=now;g::hadSample=true;g::lightSettled=true;g::unsettled=false;
 g::startButton={};g::finishButton={};g::startButton.changedAt=g::finishButton.changedAt=now-30;
 g::injectedFault=g::ioFault=false;ackGood=true;pinLevels[5]=pinLevels[6]=HIGH;
}
void running(int n=0,uint32_t t=10000){
 frame(t);g::state=g::RUNNING;g::startedAt=t;g::count=n;g::greenPhase=true;g::buzzerOn=false;
 g::frozenRemaining=g::GAME_MS;g::dirty=false;g::stable=g::INDOOR;g::eventArmed=true;
}
void lightReset(uint32_t now){
 g::stable=g::candidate=g::UNKNOWN;g::candidateAt=now;g::eventArmed=false;g::lightSettled=false;
 g::unsettled=true;g::unsettledAt=now;
}
int main(){
 missingResistor::setup();missingResistor::loop();CHECK(!missingResistor::ready&&ledcAttaches==0&&gpioWrites==0);
 blocked::setup();blocked::loop();CHECK(!blocked::ready);
 CHECK(gpioModes==0&&gpioWrites==0&&wireBegins==0&&servoAttaches==0);
 fakeNow=0;g::setup();CHECK(g::ready&&g::state==g::IDLE);CHECK(servoAttaches==0);
 CHECK(g::lowerThreshold==513&&g::upperThreshold==706);CHECK(g::bootId==0x1234abcd);
 g::Button button;
 button.update(true,100);CHECK(!button.edge);button.update(false,110);button.update(true,120);
 button.update(true,149);CHECK(!button.edge);button.update(true,150);CHECK(button.edge&&button.stable);
 button.update(true,200);CHECK(!button.edge);button.update(false,210);CHECK(!button.released(210));
 button.update(false,240);CHECK(button.released(240)&&!button.edge);
 const auto allocations=ledcAttaches;
 low::setup();CHECK(low::ready);CHECK(servoAttaches==0&&ledcAttaches==allocations);
 CHECK(g::displaySeconds(1)==1&&g::displaySeconds(1499)==2&&g::displaySeconds(0)==0);
 // Startup covered cannot be an event; indoor confirmation arms once.
 lightReset(1000);CHECK(!g::sampleLight(900,1000));CHECK(!g::sampleLight(900,1150));
 CHECK(g::stable==g::SHADE&&!g::eventArmed);
 CHECK(!g::sampleLight(310,1200));CHECK(!g::sampleLight(310,1350));CHECK(g::eventArmed);
 CHECK(!g::sampleLight(900,1400));CHECK(!g::sampleLight(900,1500));CHECK(g::sampleLight(900,1550));
 CHECK(!g::eventArmed);int repeated=0;for(int i=1;i<=40;i++)repeated+=g::sampleLight(900,1550+i*50);
 CHECK(repeated==0);CHECK(!g::sampleLight(310,3600));CHECK(!g::sampleLight(310,3750));CHECK(g::eventArmed);
 CHECK(!g::sampleLight(900,3800));CHECK(!g::sampleLight(600,3900));CHECK(!g::lightSettled);
 CHECK(!g::sampleLight(900,3950));CHECK(!g::sampleLight(900,4000));CHECK(g::sampleLight(900,4100));
 CHECK(!g::sampleLight(-1,4150));CHECK(g::stable==g::UNKNOWN&&!g::eventArmed);
 CHECK(!g::persistentFault(6149));CHECK(g::persistentFault(6150));
 // Start guard: Finish held, no preparation, wrong light; then accepted once.
 frame(10000);g::state=g::IDLE;g::stable=g::INDOOR;g::prepared=false;
 g::stepGame(10000,true,false,false,false);CHECK(g::state==g::IDLE);
 g::prepared=true;g::finishButton.raw=true;g::stepGame(10000,true,false,false,false);CHECK(g::state==g::IDLE);
 frame(10000);g::stable=g::SHADE;g::stepGame(10000,true,false,false,false);CHECK(g::state==g::IDLE);
 g::stable=g::INDOOR;g::stepGame(10000,true,false,false,false);CHECK(g::state==g::RUNNING&&g::count==0);
 const auto id=g::gameId;g::stepGame(10001,true,false,false,false);CHECK(g::gameId==id&&g::startedAt==10000);
 // Five green events, then red event, early Finish: 5 -> 4 -> FAILED.
 running();for(int i=0;i<5;i++){const int now=10000+i*400;frame(now);g::stepGame(now,false,false,true,false);}
 CHECK(g::count==5);frame(13000);g::stepGame(13000,false,false,true,false);CHECK(g::count==4&&!g::greenPhase);
 frame(13050);g::stepGame(13050,false,true,false,false);CHECK(g::state==g::FAILED&&g::buzzerOn);
 const auto beep=g::beepAt;const auto frozen=g::frozenRemaining;
 frame(14000);g::stepGame(14000,false,false,true,false);CHECK(g::count==4&&g::beepAt==beep&&g::frozenRemaining==frozen);
 g::lastDraw=fakeNow=13249;g::lastLog=13249;g::dirty=false;g::loop();CHECK(g::buzzerOn);
 fakeNow=13250;g::lastDraw=13250;g::loop();CHECK(!g::buzzerOn);
 // Bounds and crossing colors without a new cover.
 running();frame(13000);g::stepGame(13000,false,false,true,false);CHECK(g::count==0);
 frame(16000);g::stepGame(16000,false,false,true,false);CHECK(g::count==1);
 running(6);g::stepGame(10000,false,false,true,false);CHECK(g::count==6&&g::state==g::RUNNING);
 frame(13000);g::stepGame(13000,false,false,true,false);CHECK(g::count==5);
 frame(13050);g::stepGame(13050,false,true,false,false);CHECK(g::state==g::FAILED);
 running(3);frame(13000);g::stepGame(13000,false,false,true,false);CHECK(g::count==2);
 frame(16000);g::stepGame(16000,false,false,false,false);CHECK(g::count==2);
 running(3);g::stepGame(10000,false,false,true,false);frame(13000);g::stepGame(13000,false,false,false,false);CHECK(g::count==4);
 // Same-frame score before Finish; deadline and abort outrank both.
 running(5);frame(22000);g::stepGame(22000,false,true,true,false);CHECK(g::state==g::SUCCESS&&g::count==6);
 frame(22500);g::stepGame(22500,true,false,true,false);CHECK(g::state==g::SUCCESS&&g::count==6);
 running(6);frame(25000);g::stepGame(25000,false,true,true,false);CHECK(g::state==g::FAILED&&g::count==5);
 running(6);frame(40000);g::stepGame(40000,false,true,true,false);CHECK(g::state==g::FAILED&&g::remainingAt(50000)==0);
 running(6);frame(40000);g::stepGame(40000,true,true,true,true);CHECK(g::state==g::ABORTED&&!g::buzzerOn);
 // Short transition does not abort; prolonged unresolved classification does.
 running();g::lightSettled=false;g::unsettled=true;g::unsettledAt=10000;
 g::lastSample=10100;g::stepGame(10100,false,false,false,false);CHECK(g::state==g::RUNNING&&g::count==0);
 g::lastSample=11999;g::stepGame(11999,false,false,false,false);CHECK(g::state==g::RUNNING);
 g::lastSample=12000;g::stepGame(12000,false,false,false,false);CHECK(g::state==g::ABORTED&&!g::buzzerOn);
 g::handleCommand('z',12000);CHECK(g::state==g::ABORTED);
 frame(12050);g::finishButton.raw=true;g::handleCommand('c',12050);g::handleCommand('z',12050);CHECK(g::state==g::ABORTED);
 frame(12100);g::handleCommand('c',12100);CHECK(g::cleared);g::handleCommand('z',12100);
 CHECK(g::state==g::IDLE&&!g::prepared&&!g::pointer.attached()&&g::count==0);
 // Arm explicitly, no auto-motion on reset; preparation itself is bounded.
 g::stable=g::INDOOR;g::handleCommand('a',12100);CHECK(g::prepared&&g::pointer.attached()&&lastServoAngle==30);
 frame(32100);g::stepGame(32100,false,false,false,false);CHECK(g::state==g::ABORTED&&!g::pointer.attached());
 // Software injection does not claim instantaneous physical detection.
 running();g::handleCommand('f',10000);g::stepGame(10000,false,false,false,false);CHECK(g::state==g::RUNNING);
 g::lastSample=12000;g::stepGame(12000,false,false,false,false);CHECK(g::state==g::ABORTED);
 g::handleCommand('r',12001);CHECK(!g::injectedFault&&!g::lightSettled);
 // Unavailable sample and real stub ACK failure are device aborts.
 running();g::stepGame(10201,false,false,false,false);CHECK(g::state==g::ABORTED);
 running();ackGood=false;g::drawSnapshot(10000);CHECK(g::state==g::ABORTED&&!g::buzzerOn&&g::ioFault);
 // Timer wrap and no automatic success at six.
 running(6,0xfffffff0u);frame(0x20u);g::stepGame(0x20u,false,false,false,false);CHECK(g::remainingAt(0x20u)==29952);
 const auto end=uint32_t(0xfffffff0u+30000u);frame(end);g::stepGame(end,false,false,false,false);CHECK(g::state==g::FAILED);
 // Slow synchronous display: stale input has priority over a crossed deadline.
 running(6);fakeNow=39999;frame(fakeNow);g::lastDraw=0;g::dirty=true;fakeTransferMs=1200;g::loop();
 CHECK(g::state==g::ABORTED&&std::string(g::reason)=="sample_stale_after_display");
 // Invalidating a confirmed cover via Serial f in the same loop cannot score it.
 fakeTransferMs=0;running(2);g::stable=g::INDOOR;g::candidate=g::SHADE;
 g::candidateAt=10000;g::lastSample=10100;g::eventArmed=true;adcValue=900;
 fakeNow=10150;g::lastDraw=g::lastLog=fakeNow;g::dirty=false;Serial.input.push_back('f');g::loop();
 CHECK(g::count==2&&g::state==g::RUNNING&&!g::eventArmed);
 // Independent rounds reset count and preparation, each accepted Start gets a new ID.
 auto roundId=g::gameId;
 for(int i=0;i<3;i++){
  frame(20000+i*1000);g::state=g::IDLE;g::stable=g::INDOOR;g::prepared=true;
  const uint32_t now=20000+i*1000;g::stepGame(now,true,false,false,false);
  CHECK(g::gameId==++roundId&&g::count==0&&g::state==g::RUNNING);
  g::stepGame(now+1,false,true,false,false);CHECK(g::state==g::FAILED);
  frame(now+40);g::handleCommand('z',now+40);CHECK(g::state==g::IDLE&&!g::prepared&&!g::buzzerOn);
 }
 if(g::BUZZER_USE_TONE){
  CHECK(ledcAttaches==1&&lastToneHz==2000);
  running();g::settle(g::FAILED,"test",10000);CHECK(g::buzzerOn);
  g::handleCommand('x',10001);CHECK(!g::buzzerOn&&pinLevels[13]==LOW);
  running();ledcToneGood=false;g::settle(g::FAILED,"test",10000);
  CHECK(g::state==g::ABORTED&&g::buzzerFault&&!g::buzzerOn&&!g::pointer.attached());
  CHECK(std::string(g::reason)=="buzzer_failed_restart_required");
  frame(10050);g::handleCommand('c',10050);g::handleCommand('z',10050);CHECK(g::state==g::ABORTED&&!g::cleared);
  ledcToneGood=true;g::buzzerFault=false;ledcWriteGood=false;g::silence();
  CHECK(g::buzzerFault&&!g::buzzerOn&&pinLevels[13]==LOW&&ledcDetaches>0);
  ledcWriteGood=true;g::buzzerFault=false;ledcAttachGood=false;g::setup();CHECK(!g::ready);
 }else CHECK(ledcAttaches==0&&ledcTones==0);
 std::cout<<"PASS "<<assertions<<" Week 7 assertions against canonical sketch with stub I/O; no physical test.\n";
}
