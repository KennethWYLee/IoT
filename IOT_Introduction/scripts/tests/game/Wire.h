#pragma once
#include "Arduino.h"
inline int wireBegins=0, wireProbes=0;
inline bool ackGood=true, beginGood=true;
struct FakeWire {
 bool begin(int a,int b,int hz){assert(a>=0&&b>=0&&a!=b&&hz==100000);wireBegins++;return beginGood;}
 void setTimeOut(int ms){assert(ms==20);}
 void beginTransmission(int a){assert(a>=8&&a<=119);}
 uint8_t endTransmission(){wireProbes++;return ackGood?0:2;}
};
inline FakeWire Wire;
