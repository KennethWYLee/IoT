#include "ArduinoFake.h"
#include "DHT.h"
namespace blockedKy {
#include "public_ky.inc"
}
namespace blockedDht {
#include "public_dht.inc"
}
namespace ky {
#include "enabled_ky.inc"
}
namespace dh {
#include "enabled_dht.inc"
}
static int checks=0;
void expect(bool b,const char* name){if(!b){std::cerr<<"FAIL "<<name<<"\n"<<Serial.output;std::exit(1);}checks++;}
bool has(const char* s){return Serial.output.find(s)!=std::string::npos;}
void baselines(int a,int b){std::fill_n(ky::indoor,10,a);std::fill_n(ky::shade,10,b);ky::indoorReady=ky::shadeReady=true;ky::updateCalibration();}
void reading(float c,float rh,unsigned long when,const char* expected){Serial.clear();dh::reportReading(c,rh,when,false);expect(has(expected),expected);}
int main(){
  // On Windows, unsigned long has the same 32-bit wrap behavior as ESP32 millis.
  blockedKy::setup();blockedKy::loop();blockedDht::setup();blockedDht::loop();
  expect(has("gpio_profile_missing")&&has("module_or_gpio_profile_missing"),"public gates announce blocked");
  expect(adcCalls==0&&adcConfigCalls==0&&dhtBegins==0&&dhtReads==0,"public defaults make no hardware calls");
  Serial.clear();ky::setup();expect(adcConfigCalls==2,"enabled test fixture configures 12-bit ADC");
  ky::indoorReady=ky::shadeReady=false;ky::updateCalibration();expect(!ky::calibrated&&has("baseline_missing"),"missing baseline blocks");
  baselines(300,900);ky::indoor[9]=320;ky::shade[9]=920;ky::updateCalibration();
  expect(ky::threshold==610&&ky::shadeHigher,"separated threshold 610");
  expect(std::string(ky::classify(610))=="INDOOR"&&std::string(ky::classify(611))=="SHADE","threshold inclusive low boundary");
  expect(std::string(ky::classify(0))=="UNDECIDED"&&std::string(ky::classify(4095))=="UNDECIDED","endpoints conservative undecided");
  Serial.clear();ky::mode='0';ky::startRun('v');adcValue=950;int before=adcCalls;fakeNow+=499;ky::loop();expect(adcCalls==before,"no early sample");fakeNow++;ky::loop();
  expect(has("class=SHADE quality=suspect reason=outside_observed_span"),"outside span keeps candidate and suspect");
  expect(has("index=1"),"display uses one-based index");
  ky::startRun('s');expect(ky::mode=='v'&&has("run_busy"),"busy command rejected");
  for(int i=1;i<10;i++){fakeNow+=500;ky::loop();}
  expect(ky::mode=='0'&&has("index=10")&&has("run_finished"),"ten samples finish and stop");
  expect(ky::threshold==610,"validation did not retrain");
  baselines(900,300);expect(!ky::shadeHigher&&std::string(ky::classify(300))=="SHADE","reversed direction");
  baselines(510,511);expect(ky::threshold==510,"integer midpoint floors odd sum");
  Serial.clear();baselines(510,510);expect(!ky::calibrated&&ky::threshold==-1&&has("reason=overlap"),"touching intervals block and clear old threshold");
  baselines(300,900);ky::indoor[9]=4095;Serial.clear();ky::updateCalibration();expect(!ky::calibrated&&has("adc_endpoint_or_range"),"bad calibration endpoint blocks");
  baselines(300,900);ky::startRun('i');expect(!ky::calibrated&&!ky::indoorReady&&ky::threshold==-1,"new baseline invalidates old threshold immediately");
  adcValue=310;for(int i=0;i<10;i++){fakeNow+=500;ky::loop();}
  expect(ky::indoorReady&&has("mean=310.0 span=0"),"baseline integration summary");
  Serial.clear();ky::mode='0';Serial.command('?');ky::loop();expect(has("unknown_command"),"unknown command rejected");
  if(sizeof(unsigned long)==4){ky::startRun('v');ky::lastSampleMs=0xFFFFFF00UL;fakeNow=300;before=adcCalls;ky::loop();expect(adcCalls==before+1,"unsigned millis wrap");}
  std::cout<<"PASS KY gate, scheduler, directions, boundary, overlap, stale threshold, endpoints and independent validation\n";

  Serial.clear();fakeNow=0;dh::setup();expect(dhtBegins==1,"DHT initialized only in enabled fixture");
  before=dhtReads;fakeNow=2999;dh::loop();expect(dhtReads==before,"DHT initial 2.5s wait");fakeNow=3000;dh::loop();
  expect(dhtReads==before+2&&has("temperature_c=25.0 humidity_pct=50.0 valid=true quality=usable"),"DHT real path values and fields");
  reading(NAN,50,5500,"valid=false quality=invalid reason=read_failed");expect(!dh::havePrevious,"missing clears previous");
  reading(25,140,8000,"rh_out_of_bounds");reading(25,-1,10500,"rh_out_of_bounds");
  reading(INFINITY,50,13000,"read_failed");reading(25,NAN,15500,"read_failed");
  reading(45,50,18000,"valid=true quality=suspect reason=outside_classroom_policy");
  dh::havePrevious=false;reading(25,50,20500,"usable");reading(31,50,23000,"abrupt_change");reading(31,50,25500,"usable");
  dh::havePrevious=false;reading(25,50,28000,"usable");reading(30,60,30500,"usable");
  dh::havePrevious=false;reading(25,50,33000,"usable");reading(25,61,35500,"abrupt_change");
  dh::havePrevious=false;reading(10,0,38000,"usable");dh::havePrevious=false;reading(40,100,40500,"usable");
  Serial.clear();fakeNow=43000;Serial.command('f');before=dhtReads;dh::loop();expect(!dh::havePrevious&&has("source=injected next_read_after_ms=2500"),"f announces source and clears history");
  fakeNow+=2499;dh::loop();expect(dhtReads==before,"injection mode no early read");fakeNow++;dh::loop();
  expect(dhtReads==before&&has("quality=invalid reason=injected_read_failed")&&has("source=injected sample="),"injection does not call sensor and labels missing");
  Serial.clear();fakeNow+=100;Serial.command('r');dh::loop();expect(has("source=hardware next_read_after_ms=2500"),"r requests real source");
  fakeNow+=2500;fakeC=NAN;dh::loop();expect(has("source=hardware sample=")&&has("reason=read_failed"),"resume command is not a success guarantee");
  Serial.clear();fakeNow+=2500;fakeC=26;fakeRh=56;dh::loop();expect(has("temperature_c=26.0 humidity_pct=56.0 valid=true quality=usable"),"real path recovery after missing");
  std::cout<<"PASS DHT units, finite/RH guards, policy order, boundaries, jump, injection and real-path recovery\n";
  std::cout<<"HOST EXAMPLE OUTPUT (stubbed sensor, not physical):\n"<<Serial.output;
  std::cout<<"PASS "<<checks<<" assertions; no target hardware contacted.\n";
}
