#include "Arduino.h"
#include "Wire.h"
#include "U8g2lib.h"
#include "ESP32Servo.h"
#include "esp_system.h"
#include <iostream>
namespace lesson {
#include "lesson.inc"
}
int checks=0;
#define CHECK(x) do { ++checks; if(!(x)) {std::cerr<<"FAIL "<<__LINE__<<": "<<#x<<'\n';return 1;} } while(0)
void frame(uint32_t now) {
  lesson::lastSample=now;lesson::hadSample=true;
  lesson::lightSettled=true;lesson::unsettled=false;
  lesson::injectedFault=lesson::ioFault=false;
  lesson::startButton={};lesson::finishButton={};
  lesson::startButton.changedAt=lesson::finishButton.changedAt=now-30;
}
void running(int n=0) {
  frame(10000);lesson::state=lesson::RUNNING;
  lesson::count=n;lesson::startedAt=10000;
  lesson::greenPhase=true;lesson::buzzerOn=false;
  lesson::stable=lesson::INDOOR;lesson::eventArmed=true;
}
int main() {
  lesson::setup();CHECK(lesson::ready);
  CHECK(servoAttaches==0 && ledcAttaches==0);
  CHECK(lesson::LESSON_STAGE==1 && lesson::GAME_MS==30000 && lesson::TARGET==6);
  CHECK(lesson::SAMPLE_MS==50 && lesson::STABLE_MS==150);
  CHECK(lesson::COLOR_MS==PERIOD);
  const uint32_t times[]={1000,2000,4000,7000,10000,13000};
#if PERIOD == 3000
  const int expected[]={1,2,1,2,1,2};
#elif PERIOD == 5000
  const int expected[]={1,2,3,2,3,4};
#elif PERIOD == 1500
  const int expected[]={1,0,1,2,3,4};
#else
#error Unsupported test period
#endif
  frame(10000);lesson::state=lesson::IDLE;lesson::stable=lesson::INDOOR;
  lesson::stepGame(10000,true,false,false,false);
  CHECK(lesson::state==lesson::RUNNING && lesson::count==0 && lesson::gameId==1);
  std::cout<<"period_ms="<<PERIOD<<" confirmed_event_times_ms=1000,2000,4000,7000,10000,13000 counts=";
  for(int i=0;i<6;i++) {
    const auto now=10000+times[i];frame(now);
    lesson::stepGame(now,false,false,true,false);
    CHECK(lesson::count==expected[i]);
    CHECK(lesson::greenPhase==((times[i]/PERIOD)%2==0));
    std::cout<<(i?",":"")<<lesson::count;
  }
  frame(24000);lesson::stepGame(24000,false,true,false,false);
  CHECK(lesson::state==lesson::FAILED && !lesson::buzzerOn);
  CHECK(lesson::frozenRemaining==16000);
  std::cout<<" finish_ms=14000 result="<<lesson::stateName()<<'\n';
  CHECK(Serial.output.find("event_type=cover")!=std::string::npos);
  CHECK(Serial.output.find("reason=finish_below_target")!=std::string::npos);
  CHECK(servoAttaches==0 && ledcAttaches==0);
  running();frame(10000+PERIOD-1);
  lesson::stepGame(10000+PERIOD-1,false,false,false,false);CHECK(lesson::greenPhase);
  frame(10000+PERIOD);lesson::stepGame(10000+PERIOD,false,false,false,false);
  CHECK(!lesson::greenPhase);
  running(3);frame(10000+PERIOD);
  lesson::stepGame(10000+PERIOD,false,false,true,false);CHECK(lesson::count==2);
  frame(10000+2*PERIOD);
  lesson::stepGame(10000+2*PERIOD,false,false,false,false);CHECK(lesson::count==2);
  running(5);frame(10001);lesson::stepGame(10001,false,true,true,false);
  CHECK(lesson::state==lesson::SUCCESS && lesson::count==6);
  running(6);frame(10000+PERIOD);lesson::stepGame(10000+PERIOD,false,true,true,false);
  CHECK(lesson::state==lesson::FAILED && lesson::count==5);
  running(6);frame(40000);lesson::stepGame(40000,false,true,false,false);
  CHECK(lesson::state==lesson::FAILED && std::string(lesson::reason)=="deadline");
  running(6);frame(40000);lesson::stepGame(40000,false,true,true,true);
  CHECK(lesson::state==lesson::ABORTED);
  // The actual classifier must require a stable release before the next cover.
  lesson::stable=lesson::candidate=lesson::UNKNOWN;lesson::eventArmed=false;
  lesson::lightSettled=false;lesson::unsettled=true;lesson::unsettledAt=50000;
  CHECK(!lesson::sampleLight(310,50000));CHECK(!lesson::sampleLight(310,50150));
  CHECK(lesson::eventArmed);
  CHECK(!lesson::sampleLight(900,50200));CHECK(!lesson::sampleLight(900,50250));
  CHECK(!lesson::sampleLight(600,50300));CHECK(!lesson::sampleLight(900,50350));
  CHECK(!lesson::sampleLight(900,50400));CHECK(!lesson::sampleLight(900,50450));
  CHECK(lesson::sampleLight(900,50500));CHECK(!lesson::sampleLight(900,50600));
  // Direction reversal is supported; keep the numeric thresholds but swap labels.
  lesson::shadeHigh=false;lesson::stable=lesson::candidate=lesson::UNKNOWN;
  lesson::eventArmed=false;lesson::lightSettled=false;
  CHECK(!lesson::sampleLight(900,51000));CHECK(!lesson::sampleLight(900,51150));
  CHECK(lesson::eventArmed && lesson::stable==lesson::INDOOR);
  CHECK(!lesson::sampleLight(310,51200));CHECK(lesson::sampleLight(310,51350));
  CHECK(lesson::stable==lesson::SHADE);
  std::cout<<"PASS "<<checks<<" assertions; host fake I/O, not physical gameplay.\n";
}
