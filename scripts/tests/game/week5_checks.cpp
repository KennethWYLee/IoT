#include "Arduino.h"
#include "Wire.h"
#include "U8g2lib.h"
#include <iostream>
namespace blocked {
#include "public_timer.inc"
}
namespace timer {
#include "enabled_timer.inc"
}
namespace scannerBlocked {
#include "public_scanner.inc"
}
namespace scanner {
#include "enabled_scanner.inc"
}
static int assertions=0;
#define CHECK(x) do{++assertions;if(!(x)){std::cerr<<"FAIL line "<<__LINE__<<": "<<#x<<'\n';return 1;}}while(0)
int main(){
 blocked::setup();blocked::loop();scannerBlocked::setup();scannerBlocked::loop();
 CHECK(!blocked::ready);CHECK(gpioModes==0&&gpioWrites==0&&wireBegins==0&&oledBegins==0);
 CHECK(Serial.output.find("profile_missing")!=std::string::npos);
 scanner::setup();CHECK(scanner::scanned);CHECK(wireProbes==112);
 Serial.output.clear();wireProbes=0;fakeNow=0;
 timer::setup();CHECK(timer::ready);CHECK(timer::state==timer::IDLE);CHECK(!timer::ioFault);
 CHECK(oledBegins==1);CHECK(pinLevels[4]==LOW&&pinLevels[5]==LOW&&pinLevels[6]==LOW);
 CHECK(timer::displaySeconds(0)==0);CHECK(timer::displaySeconds(1)==1);
 CHECK(timer::displaySeconds(1000)==1);CHECK(timer::displaySeconds(1001)==2);
 CHECK(timer::displaySeconds(1499)==2);CHECK(timer::displaySeconds(30000)==30);
 timer::handleCommand('4',1000);CHECK(timer::demoCount==4);timer::handleCommand('3',1001);CHECK(timer::demoCount==3);
 timer::handleCommand('s',10000);CHECK(timer::state==timer::RUNNING&&timer::greenPhase);
 CHECK(timer::remainingAt(11500)==28500);CHECK(timer::remainingAt(12999)==27001);
 timer::advanceTimer(13000);CHECK(!timer::greenPhase&&pinLevels[4]==HIGH&&pinLevels[5]==LOW);
 timer::handleCommand('s',14000);CHECK(timer::startedAt==10000);
 timer::handleCommand('4',14000);CHECK(timer::demoCount==3);
 timer::advanceTimer(16000);CHECK(timer::greenPhase);
 timer::advanceTimer(39999);CHECK(timer::state==timer::RUNNING);CHECK(timer::remainingAt(39999)==1);
 timer::advanceTimer(40000);CHECK(timer::state==timer::EXPIRED&&timer::remainingAt(40000)==0);
 CHECK(pinLevels[4]==LOW&&pinLevels[5]==LOW&&pinLevels[6]==LOW);
 timer::handleCommand('s',40100);CHECK(timer::state==timer::EXPIRED);
 timer::handleCommand('z',40200);CHECK(timer::state==timer::IDLE);CHECK(timer::remainingAt(50000)==30000);
 timer::handleCommand('s',50000);timer::handleCommand('x',51750);
 CHECK(timer::state==timer::ABORTED&&timer::remainingAt(100000)==28250);
 timer::handleCommand('z',52000);timer::handleCommand('s',53000);timer::handleCommand('f',54000);
 CHECK(timer::ioFault&&timer::injectedDisplayFault&&timer::state==timer::ABORTED);
 timer::handleCommand('z',54001);CHECK(timer::state==timer::ABORTED);
 ackGood=false;timer::handleCommand('c',54002);CHECK(timer::ioFault);
 ackGood=true;timer::handleCommand('c',54003);CHECK(!timer::ioFault&&timer::state==timer::ABORTED);
 timer::handleCommand('z',54004);CHECK(timer::state==timer::IDLE);
 timer::handleCommand('s',0xfffffff0u);timer::advanceTimer(0x20u);
 CHECK(timer::remainingAt(0x20u)==30000-48);CHECK(timer::state==timer::RUNNING);
 timer::advanceTimer(uint32_t(0xfffffff0u+30000u));CHECK(timer::state==timer::EXPIRED);
 // Slow display work still causes deadline re-evaluation after I2C returns.
 timer::handleCommand('z',1000);timer::handleCommand('s',1000);
 fakeNow=30999;fakeTransferMs=1200;timer::lastDraw=0;timer::loop();
 CHECK(timer::state==timer::EXPIRED&&timer::remainingAt(fakeNow)==0);CHECK(fakeNow==32199);
 // A real stub ACK failure aborts; it is not a simulated success or new round.
 fakeTransferMs=0;timer::handleCommand('z',fakeNow);timer::handleCommand('s',fakeNow);
 ackGood=false;fakeNow+=300;timer::loop();CHECK(timer::ioFault&&timer::state==timer::ABORTED);
 CHECK(std::string(timer::reason)=="display_ack_failed");
 std::cout<<"PASS "<<assertions<<" Week 5 assertions against canonical sketches with stub I/O; no physical test.\n";
}
