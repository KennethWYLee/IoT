#pragma once
#include <cassert>
#include <cmath>
#include <math.h>
#include <cstdarg>
#include <cstdio>
#include <cstdint>
#include <deque>
#include <iostream>
#include <string>
#include <algorithm>

// Host substitutes: no serial port, USB, GPIO or sensor access.
static unsigned long fakeNow=0;
static int adcCalls=0, adcConfigCalls=0, adcValue=300;
static int dhtBegins=0, dhtReads=0;
static float fakeC=25, fakeRh=50;
const int HIGH=1, LOW=0, OUTPUT=1;
static int gpioWrites=0,gpioModes=0,buzzerLevel=LOW;
void digitalWrite(int pin,int level){assert(pin==6);assert(level==HIGH||level==LOW);gpioWrites++;buzzerLevel=level;}
void pinMode(int pin,int mode){assert(pin==6&&mode==OUTPUT);gpioModes++;}
#include "../buzzer_fake.h"
struct FakeSerial {
  std::string output;
  std::deque<char> input;
  void begin(int baud){assert(baud==115200);}
  void println(const char* s){output+=s;output+='\n';}
  void printf(const char* format,...){char buffer[2048];va_list args;va_start(args,format);vsnprintf(buffer,sizeof(buffer),format,args);va_end(args);output+=buffer;}
  bool available(){return !input.empty();}
  char read(){char c=input.front();input.pop_front();return c;}
  void command(char c){input.push_back(c);}
  void clear(){output.clear();input.clear();}
} Serial;
unsigned long millis(){return fakeNow;}
void delay(unsigned long ms){fakeNow+=ms;}
const int ADC_11db=3;
void analogReadResolution(int n){assert(n==12);adcConfigCalls++;}
void analogSetPinAttenuation(int pin,int attenuation){assert(pin==4&&attenuation==ADC_11db);adcConfigCalls++;}
int analogRead(int pin){assert(pin==4);adcCalls++;return adcValue;}
