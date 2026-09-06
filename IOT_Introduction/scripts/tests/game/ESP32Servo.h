#pragma once
#include "Arduino.h"
inline int servoAttaches=0,servoDetaches=0,servoWrites=0,lastServoAngle=-1;
inline bool servoAttachGood=true;
class Servo {
 bool active=false;
public:
 void setPeriodHertz(int hz){assert(hz>=10&&hz<=400);}
 int attach(int pin,int min,int max){assert(pin>=0&&min>=500&&max<=2500&&min<max);servoAttaches++;active=servoAttachGood;return 0;}
 bool attached(){return active;}
 void detach(){active=false;servoDetaches++;}
 void write(int angle){assert(active&&angle>=0&&angle<=180);lastServoAngle=angle;servoWrites++;}
};
