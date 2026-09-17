#include "Arduino.h"
#include "Wire.h"
#include "U8g2lib.h"
#include "ESP32Servo.h"
#include <iostream>
namespace preview {
#include "preview.inc"
}
namespace blocked {
#include "public_pointer.inc"
}
namespace p {
#include "enabled_pointer.inc"
}
static int assertions=0;
#define CHECK(x) do { ++assertions; if(!(x)) { std::cerr << "FAIL " << __LINE__ << ": " << #x << '\n'; return 1; } } while(0)
int main() {
  preview::setup();
  for(int n=0;n<=6;n++) {
    preview::previewCommand(char('0'+n));
    CHECK(preview::count==n);
    CHECK(preview::exampleAngle(n)==60+10*n);
  }
  preview::previewCommand('9'); CHECK(preview::count==6);
  preview::previewCommand('\n'); CHECK(preview::count==6);
  CHECK(gpioModes==0 && gpioWrites==0 && servoAttaches==0);
  blocked::setup(); blocked::loop(); CHECK(!blocked::ready);
  CHECK(gpioModes==0 && gpioWrites==0 && servoAttaches==0);
  fakeNow=0;p::setup();CHECK(p::ready && p::state==p::DISARMED);
  p::handleCommand('+',1030);CHECK(p::count==0 && !p::pointer.attached());
  p::handleCommand('a',1030);CHECK(p::count==0 && p::pointer.attached());
  uint32_t now=2030;
  for(int i=1;i<=6;i++) {
    p::handleCommand('+',now);now+=1000;
    CHECK(p::count==std::min(6,i*STEP));
  }
  CHECK(Serial.output.find("reason=upper_limit")!=std::string::npos || STEP==1);
  p::handleCommand('+',now);now+=1000;CHECK(p::count==6);
  CHECK(Serial.output.find("reason=upper_limit")!=std::string::npos);
  for(int i=1;i<=6;i++) {
    p::handleCommand('-',now);now+=1000;
    CHECK(p::count==std::max(0,6-i*STEP));
  }
  p::handleCommand('-',now);now+=1000;CHECK(p::count==0);
  CHECK(Serial.output.find("reason=lower_limit")!=std::string::npos);
  p::handleCommand('3',now);CHECK(p::count==3);now+=1000;
  p::handleCommand('+',now);CHECK(p::count==3+STEP);now+=1000;
  p::handleCommand('+',now);CHECK(p::count==std::min(6,3+2*STEP));now+=1000;
  p::handleCommand('-',now);CHECK(p::count==std::min(6,3+2*STEP)-STEP);
  int before=p::count;
  p::handleCommand('+',now+999);CHECK(p::count==before);
  p::handleCommand('+',now+1000);CHECK(p::count==std::min(6,before+STEP));
  CHECK(lastServoAngle==30+20*p::count);
  p::handleCommand('x',now+1001);before=p::count;
  p::handleCommand('-',now+2001);CHECK(p::count==before && !p::pointer.attached());
  p::handleCommand('a',now+2002);CHECK(p::state==p::ABORTED);
  p::handleCommand('c',now+2003);p::handleCommand('z',now+2004);
  p::handleCommand('a',now+2005);CHECK(p::count==0 && p::pointer.attached());
  pinLevels[10]=LOW;p::serviceStop(now+2006);
  p::handleCommand('+',now+4006);CHECK(p::count==0 && !p::pointer.attached());
  p::handleCommand('c',now+4007);p::handleCommand('z',now+4008);
  p::handleCommand('a',now+4009);CHECK(p::state==p::ABORTED);
  pinLevels[10]=HIGH;p::serviceStop(now+4010);
  p::handleCommand('c',now+4040);p::handleCommand('z',now+4041);
  p::handleCommand('a',now+4042);CHECK(p::state==p::ARMED);
  p::serviceStop(now+34042);CHECK(p::state==p::ABORTED && !p::pointer.attached());
  std::cout << "PASS " << assertions << " preview/counter assertions, step=" << STEP << "; fake I/O only.\n";
}
