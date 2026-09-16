#pragma once
#include "Arduino.h"
constexpr int U8G2_R0 = 0, U8X8_PIN_NONE = 255;
inline const char u8g2_font_6x12_tf[] = "fake_font";
inline std::string frame;
inline int sends = 0;
struct FakeOled {
  FakeOled(int, int, int, int) {}
  void setI2CAddress(int a) { assert(a == 0x78); }
  void setBusClock(int n) { assert(n == 100000); }
  void begin() {}
  void setFont(const char*) {}
  void clearBuffer() { frame.clear(); }
  void drawStr(int, int, const char* s) { frame += s; frame += '\n'; }
  void sendBuffer() { ++sends; fakeNow += 10; }
};
using U8G2_SSD1306_128X64_NONAME_F_HW_I2C = FakeOled;
using U8G2_SSD1315_128X64_NONAME_F_HW_I2C = FakeOled;
