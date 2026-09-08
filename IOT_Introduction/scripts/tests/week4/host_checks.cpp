#include "ArduinoFake.h"
#include "Arduino.h"
#include "DHT.h"
namespace blockedClassifier {
#include "public_classifier.inc"
}
namespace classifier {
#include "enabled_classifier.inc"
}
namespace blockedDual {
#include "public_dual.inc"
}
namespace dual {
#include "enabled_dual.inc"
}
namespace missingResistor {
#include "missing_resistor.inc"
}
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
  missingResistor::setup();missingResistor::loop();
  expect(!missingResistor::ready&&gpioWrites==0&&ledcAttaches==0,"missing tone resistor blocks all outputs");
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
  Serial.clear();before=adcCalls;int configuredBefore=adcConfigCalls;
  blockedClassifier::setup();blockedClassifier::loop();
  expect(has("gpio_profile_missing")&&adcCalls==before&&adcConfigCalls==configuredBefore,"classifier public gate no GPIO access");
  Serial.clear();classifier::setup();expect(classifier::threshold==610,"classifier computes gap midpoint");
  expect(std::string(classifier::classifyLight(610))=="INDOOR"&&std::string(classifier::classifyLight(611))=="SHADE","classifier exact boundary");
  expect(std::string(classifier::classifyLight(0))=="UNDECIDED"&&std::string(classifier::classifyLight(4095))=="UNDECIDED","classifier endpoint policy");
  expect(std::string(classifier::qualityReason(700))=="between_baselines","gap candidate flagged suspect");
  expect(std::string(classifier::qualityReason(1200))=="outside_observed_span","outside candidate flagged suspect");
  expect(std::string(classifier::qualityReason(305))=="within_baseline_range","baseline classified relative only");
  adcValue=700;before=adcCalls;fakeNow+=499;classifier::loop();expect(adcCalls==before,"classifier no early sample");
  fakeNow++;classifier::loop();expect(adcCalls==before+1&&has("class=SHADE label=遮光 valid=true quality=suspect reason=between_baselines"),"classifier actual output and Chinese label");
  std::cout<<"PASS Week 3 classifier actual sketch with stubbed ADC; "<<checks<<" total assertions.\n";
  Serial.clear();before=adcCalls;configuredBefore=adcConfigCalls;const int modesBefore=gpioModes;
  blockedDual::setup();blockedDual::loop();
  expect(has("profile_or_calibration_missing")&&adcCalls==before&&adcConfigCalls==configuredBefore&&gpioModes==modesBefore&&gpioWrites==0,"dual public profile gate never drives hardware");
  fakeNow=0;Serial.clear();dual::setup();expect(dual::ready&&buzzerLevel==LOW,"dual startup quiet");
  auto light=[](int raw,unsigned long at){adcValue=raw;fakeNow=at;dual::readLight(at);};
  light(910,500);light(910,650);expect(!dual::armed&&dual::coverEvents==0,"boot covered does not invent event");
  light(310,800);light(310,949);expect(!dual::armed,"release waits full stability");light(310,950);expect(dual::armed,"stable release arms");
  light(910,1000);light(310,1050);light(910,1100);light(910,1249);expect(dual::coverEvents==0,"candidate bounce restarts timer");
  light(910,1250);expect(dual::coverEvents==1&&dual::beepActive&&buzzerLevel==HIGH,"one stable cover starts one beep");
  dual::serviceBeep(1369);expect(dual::beepActive,"beep active before 120ms");dual::serviceBeep(1370);expect(!dual::beepActive&&buzzerLevel==LOW,"beep ends at software duration boundary");
  light(910,2000);light(910,2500);expect(dual::coverEvents==1,"held cover no repeats");
  light(0,2600);expect(!dual::lightValid&&!dual::armed&&dual::stable==-1,"invalid clears state and rearm");
  light(910,2700);light(910,2850);expect(dual::coverEvents==1,"recovery covered does not invent edge");
  light(310,2900);light(310,3050);dual::muted=true;light(910,3100);light(910,3250);
  expect(dual::coverEvents==2&&!dual::beepActive,"muted event counted without beep");
  Serial.clear();Serial.command('u');dual::lastDht=fakeNow;dual::lastLight=fakeNow;dual::loop();expect(!dual::muted&&!dual::beepActive,"unmute does not replay");
  Serial.clear();Serial.command('f');dual::loop();expect(dual::injectDht&&!dual::haveDht&&!dual::dhtValid&&isnan(dual::temperatureC),"DHT injection clears old current value");
  fakeNow+=2500;before=dhtReads;dual::loop();expect(dhtReads==before&&has("source=injected")&&has("injected_read_failed"),"dual DHT injection never calls hardware");
  const auto countBefore=dual::coverEvents;
  light(310,6000);light(310,6150);light(910,6200);light(910,6350);expect(dual::coverEvents==countBefore+1,"KY works while DHT missing");
  fakeNow=6400;Serial.command('k');dual::loop();expect(dual::injectLight&&!dual::armed&&!dual::beepActive&&dual::lightRaw==-1,"KY injection stops beep and clears current value");
  Serial.clear();Serial.command('r');dual::loop();expect(!dual::injectLight&&!dual::injectDht&&!dual::haveDht,"resume both sources, not success");
  fakeNow+=2500;fakeC=NAN;before=dhtReads;dual::loop();expect(dhtReads==before+2&&!dual::dhtValid&&has("reason=read_failed"),"dual resumed hardware can still fail");
  fakeNow+=2500;fakeC=26;fakeRh=55;dual::loop();expect(dual::dhtValid&&dual::haveDht,"dual actual path recovers on finite data");
  light(1200,fakeNow+50);expect(!dual::lightValid,"outside calibration span excluded from event control");
  if(dual::BUZZER_USE_TONE){
    expect(ledcAttaches==1&&lastToneHz==2000,"one PWM allocation for repeated 2000Hz beeps");
    dual::startBeep(fakeNow);expect(dual::beepActive,"tone started");
    Serial.command('q');dual::loop();expect(!dual::beepActive&&buzzerLevel==LOW,"mute stops tone immediately");
    ledcToneGood=false;dual::muted=false;dual::startBeep(fakeNow);
    expect(dual::buzzerFault&&dual::muted&&!dual::beepActive&&has("tone_start_failed"),"tone failure latched and logged");
    const int tones=ledcTones;Serial.command('u');dual::loop();dual::startBeep(fakeNow);
    expect(dual::muted&&ledcTones==tones,"unmute cannot recover failed PWM");
    ledcToneGood=true;dual::buzzerFault=false;ledcWriteGood=false;dual::silence();
    expect(dual::buzzerFault&&!dual::beepActive&&buzzerLevel==LOW&&ledcDetaches>0,"stop failure detaches PWM and drives LOW");
    ledcWriteGood=true;dual::buzzerFault=false;ledcAttachGood=false;dual::ready=false;dual::setup();
    expect(!dual::ready&&has("buzzer_init_failed"),"failed PWM allocation blocks startup");
  }else expect(ledcAttaches==0&&ledcTones==0,"active mode never allocates PWM");
  std::cout<<"PASS Week 4 actual dual sketch: gating, candidates, edges, mute, pulse, independent faults/recovery; "<<checks<<" total assertions.\n";
}
