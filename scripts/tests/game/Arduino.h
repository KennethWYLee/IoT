#pragma once
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <cstdarg>
#include <string>
#include <deque>
#include <map>
#include <algorithm>
inline uint32_t fakeNow=0;
inline int gpioWrites=0, gpioModes=0, adcCalls=0, adcValue=310;
inline std::map<int,int> pinLevels;
constexpr int HIGH=1, LOW=0, OUTPUT=1, INPUT_PULLUP=2, ADC_11db=3;
inline uint32_t millis(){return fakeNow;}
inline void delay(uint32_t n){fakeNow+=n;}
inline void digitalWrite(int p,int v){assert(p>=0);gpioWrites++;pinLevels[p]=v;}
inline void pinMode(int p,int){assert(p>=0);gpioModes++;}
inline int digitalRead(int p){return pinLevels.count(p)?pinLevels[p]:HIGH;}
inline void analogReadResolution(int n){assert(n==12);}
inline void analogSetPinAttenuation(int p,int a){assert(p>=0&&a==ADC_11db);}
inline int analogRead(int p){assert(p>=0);adcCalls++;return adcValue;}
struct FakeSerial {
 std::string output;std::deque<char> input;
 void begin(int b){assert(b==115200);}
 void println(const char*s){output+=s;output+='\n';}
 void printf(const char* f,...){char b[2048];va_list a;va_start(a,f);vsnprintf(b,sizeof b,f,a);va_end(a);output+=b;}
 bool available(){return !input.empty();}
 char read(){auto c=input.front();input.pop_front();return c;}
};
inline FakeSerial Serial;
