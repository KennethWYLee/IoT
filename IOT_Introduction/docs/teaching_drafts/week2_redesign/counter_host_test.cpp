#include <cassert>
#include <iostream>
#include <vector>
constexpr int HIGH=1, LOW=0, INPUT_PULLUP=2;
int pins[6]={HIGH,HIGH,HIGH,HIGH,HIGH,HIGH};
int modes[6]={};
unsigned long elapsed=0;
int digitalRead(int p){return pins[p];}
void pinMode(int p,int mode){modes[p]=mode;}
void delay(unsigned long ms){assert(ms==200);elapsed+=ms;}
struct {
  std::vector<int> lines;
  void begin(int baud){assert(baud==115200);}
  void println(int n){lines.push_back(n);}
} Serial;
#include "counter_practice/counter_practice.ino"
void reset(){count=0;elapsed=0;Serial.lines.clear();pins[4]=pins[5]=HIGH;setup();}
void cycle(int plus,int minus,int times=1){pins[4]=plus;pins[5]=minus;for(int i=0;i<times;i++)loop();}
int main(){
  reset();assert((Serial.lines==std::vector<int>{0}));
  assert(modes[4]==INPUT_PULLUP&&modes[5]==INPUT_PULLUP);
  cycle(HIGH,HIGH,5);assert(Serial.lines.size()==1);
  std::cout<<"PASS setup and released buttons\n";
  cycle(LOW,HIGH,3);cycle(HIGH,LOW,2);
  assert((Serial.lines==std::vector<int>{0,1,2,3,2,1}));
  std::cout<<"PASS addition subtraction and numeric-only output\n";
  reset();cycle(HIGH,LOW);assert(count==-1);cycle(LOW,HIGH,102);assert(count==101);
  std::cout<<"PASS no custom bounds\n";
  reset();cycle(LOW,HIGH,10);assert(count==10&&elapsed==2000);
  std::cout<<"PASS held button repeats without single-press filtering\n";
  reset();cycle(LOW,LOW,2);assert((Serial.lines==std::vector<int>{0,1,0,1,0}));
  assert(count==0);std::cout<<"PASS independent conditions for both buttons\n";
  reset();cycle(LOW,HIGH);reset();assert(count==0&&Serial.lines.size()==1);
  std::cout<<"PASS restart returns to zero\n";
  std::cout<<"6 software test groups passed; no physical device tested.\n";
}
