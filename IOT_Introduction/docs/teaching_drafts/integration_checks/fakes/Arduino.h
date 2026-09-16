#pragma once
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <cstdarg>
#include <string>
#include <map>
#include <cmath>
#include <limits>
inline uint32_t fakeNow = 0;
inline int modes = 0, adcCalls = 0, adcValue = 420;
inline std::map<int, int> levels;
constexpr int HIGH = 1, LOW = 0, INPUT_PULLUP = 2, ADC_11db = 3;
inline uint32_t millis() { return fakeNow; }
inline int digitalRead(int p) { return levels.count(p) ? levels[p] : HIGH; }
inline void pinMode(int p, int m) { assert(p >= 0 && m == INPUT_PULLUP); ++modes; }
inline void analogReadResolution(int n) { assert(n == 12); }
inline void analogSetPinAttenuation(int p, int a) { assert(p >= 0 && a == ADC_11db); }
inline int analogRead(int p) { assert(p >= 0); ++adcCalls; return adcValue; }
struct FakeSerial {
  std::string output;
  void begin(int n) { assert(n == 115200); }
  void println(const char* text) { output += text; output += '\n'; }
  void printf(const char* format, ...) {
    char buffer[1024]; va_list args; va_start(args, format);
    vsnprintf(buffer, sizeof(buffer), format, args); va_end(args);
    output += buffer;
  }
};
inline FakeSerial Serial;
