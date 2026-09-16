#pragma once
#include "Arduino.h"
inline bool ack = true;
inline int wireBegins = 0;
struct FakeWire {
  void begin(int sda, int scl) { assert(sda >= 0 && scl >= 0); ++wireBegins; }
  void setTimeOut(int n) { assert(n == 20); }
  void beginTransmission(int address) { assert(address == 0x3c); }
  int endTransmission() { return ack ? 0 : 4; }
};
inline FakeWire Wire;
