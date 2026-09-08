#pragma once
#include "Arduino.h"
constexpr int U8G2_R0=0,U8X8_PIN_NONE=255;
inline const char u8g2_font_6x12_tf[]="fake font";
inline int oledBegins=0, oledDraws=0;
inline uint32_t fakeTransferMs=0;
struct U8G2_SSD1306_128X64_NONAME_F_HW_I2C {
 U8G2_SSD1306_128X64_NONAME_F_HW_I2C(int,int,int,int){}
 void setI2CAddress(int a){assert(a==0x3c*2);}
 void setBusClock(int hz){assert(hz==100000);}
 void begin(){oledBegins++;}
 void clearBuffer(){}
 void setFont(const char*){}
 void drawStr(int,int,const char*){}
 void sendBuffer(){oledDraws++;fakeNow+=fakeTransferMs;}
};
// Both constructors use the same bus stub; controller compatibility needs a real display.
using U8G2_SSD1315_128X64_NONAME_F_HW_I2C = U8G2_SSD1306_128X64_NONAME_F_HW_I2C;
