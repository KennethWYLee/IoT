#include "Arduino.h"
#include "Wire.h"
#include "U8g2lib.h"
#include "ESP32Servo.h"
#include <iostream>
namespace blocked {
#include "public_pointer.inc"
}
namespace p {
#include "enabled_pointer.inc"
}
static int assertions=0;
#define CHECK(x) do{++assertions;if(!(x)){std::cerr<<"FAIL line "<<__LINE__<<": "<<#x<<'\n';return 1;}}while(0)
int main(){
 blocked::setup();blocked::loop();CHECK(!blocked::ready);
 CHECK(gpioWrites==0&&gpioModes==0&&wireBegins==0&&servoAttaches==0);
 fakeNow=0;p::setup();CHECK(p::ready&&p::state==p::DISARMED);CHECK(servoAttaches==0);
 CHECK(p::angleForCount(0)==30);CHECK(p::angleForCount(3)==90);
 CHECK(p::angleForCount(4)==110);CHECK(p::angleForCount(6)==150);
 p::handleCommand('a',1000);CHECK(!p::pointer.attached());
 p::handleCommand('a',1030);CHECK(p::pointer.attached()&&p::state==p::ARMED);CHECK(lastServoAngle==30);
 p::handleCommand('4',1500);CHECK(p::count==0);
 p::handleCommand('4',2030);CHECK(p::count==4&&lastServoAngle==110);
 p::handleCommand('3',3030);CHECK(p::count==3&&lastServoAngle==90);
 p::handleCommand('a',3500);CHECK(p::armedAt==1030);
 p::handleCommand('6',4000);CHECK(p::count==3);
 p::handleCommand('6',4030);CHECK(p::count==6&&lastServoAngle==150);
 p::serviceStop(31030);CHECK(p::state==p::ABORTED&&!p::pointer.attached());
 CHECK(std::string(p::reason)=="arm_session_timeout");
 p::handleCommand('a',31031);CHECK(p::state==p::ABORTED);
 p::handleCommand('z',31032);CHECK(p::state==p::ABORTED);
 p::handleCommand('c',31033);CHECK(p::cleared);p::handleCommand('z',31034);
 CHECK(p::state==p::DISARMED&&!p::pointer.attached());
 p::handleCommand('a',31035);CHECK(p::pointer.attached());
 pinLevels[10]=LOW;p::serviceStop(31036);CHECK(p::state==p::ABORTED&&!p::pointer.attached());
 p::handleCommand('c',32000);p::handleCommand('z',32000);p::handleCommand('a',32000);
 CHECK(p::state==p::ABORTED&&!p::cleared&&!p::pointer.attached());
 p::serviceStop(32000);pinLevels[10]=HIGH;p::serviceStop(32001);
 p::handleCommand('c',32001);CHECK(!p::cleared);
 p::handleCommand('c',32030);p::handleCommand('z',32031);CHECK(p::state==p::DISARMED);
 p::handleCommand('a',32032);p::handleCommand('q',32033);
 CHECK(p::state==p::DISARMED&&!p::pointer.attached());
 CHECK(std::string(p::reason)=="manual_detach_power_not_removed");
 p::handleCommand('a',33000);p::handleCommand('f',33001);
 CHECK(p::injectedFault&&p::state==p::ABORTED&&!p::pointer.attached());
 ackGood=false;p::handleCommand('c',33002);CHECK(!p::cleared&&p::ioFault);
 ackGood=true;p::handleCommand('c',33003);p::handleCommand('z',33004);
 CHECK(p::state==p::DISARMED&&!p::pointer.attached());
 p::handleCommand('a',0xfffffff0u);p::serviceStop(0x20u);
 CHECK(p::state==p::ARMED);p::serviceStop(uint32_t(0xfffffff0u+30000u));CHECK(p::state==p::ABORTED);
 p::handleCommand('c',40000);p::handleCommand('z',40001);servoAttachGood=false;p::handleCommand('a',40002);
 CHECK(p::state==p::ABORTED&&std::string(p::reason)=="attach_failed");
 servoAttachGood=true;p::handleCommand('c',40003);p::handleCommand('z',40004);p::handleCommand('a',40005);
 ackGood=false;p::drawSnapshot(40006);CHECK(p::state==p::ABORTED&&!p::pointer.attached());
 CHECK(p::ioFault&&std::string(p::reason)=="display_ack_failed");
 ackGood=true;p::handleCommand('c',41000);p::handleCommand('z',41001);p::handleCommand('a',41002);
 fakeNow=71001;fakeTransferMs=1200;p::loop();CHECK(p::state==p::ABORTED&&!p::pointer.attached());
 CHECK(std::string(p::reason)=="arm_session_timeout");
 std::cout<<"PASS "<<assertions<<" Week 6 assertions against canonical sketch with stub I/O; no physical test.\n";
}
