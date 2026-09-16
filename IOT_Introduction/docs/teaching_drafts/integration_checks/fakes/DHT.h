#pragma once
#include "Arduino.h"
constexpr int DHT11 = 11;
inline float fakeTemperature = 25, fakeHumidity = 50;
inline int dhtBegins = 0, dhtReads = 0;
class DHT {
 public:
  DHT(int, int) {}
  void begin() { ++dhtBegins; }
  float readTemperature() { ++dhtReads; return fakeTemperature; }
  float readHumidity() { fakeNow += 25; return fakeHumidity; }
};
