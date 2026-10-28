#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <U8g2lib.h>
#include <ESP32Servo.h>
#include "controller.hpp"
#include "app_page.h"

const int PIN_LIGHT=4, PIN_SERVO=7, PIN_SDA=8, PIN_SCL=9;
const bool SERVO_SETUP_CONFIRMED=false;
const int SAFE_REST_US=-1, SAFE_ACTIVE_US=-1;
#define OLED_CONTROLLER 1315
#if OLED_CONTROLLER == 1315
U8G2_SSD1315_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#elif OLED_CONTROLLER == 1306
U8G2_SSD1306_128X64_NONAME_F_HW_I2C oled(U8G2_R0,U8X8_PIN_NONE);
#else
#error Select the teacher-verified OLED controller.
#endif

// Public classroom example, not a personal Wi-Fi credential or production login.
const char CLASSROOM_AP_KEY[]="iot-class";
binapp::Controller controller;
Servo lid;
WebServer server(80);
QueueHandle_t commands=nullptr, stops=nullptr;
SemaphoreHandle_t stateLock=nullptr;
binapp::Snapshot sharedState;
uint32_t queueDrops=0, lastSample=0, lastFrame=0;
uint8_t oledAddress=0;
bool oledOk=false;
char deviceId[32]{};
uint32_t controlClient=0;

bool ack(uint8_t a){Wire.beginTransmission(a);return Wire.endTransmission()==0;}
void publishState(){
  binapp::Snapshot s;controller.fillSnapshot(millis(),s);
  if(xSemaphoreTake(stateLock,0)==pdTRUE){sharedState=s;xSemaphoreGive(stateLock);}
}
bool readState(binapp::Snapshot& s){
  if(xSemaphoreTake(stateLock,pdMS_TO_TICKS(10))!=pdTRUE)return false;
  s=sharedState;xSemaphoreGive(stateLock);return true;
}
void sendJson(int code,const char* json){server.sendHeader("Cache-Control","no-store");server.send(code,"application/json",json);}
void postCommand(){
  const String origin=server.header("Origin");
  if(origin.length()&&origin!=String("http://")+server.hostHeader()){
    sendJson(403,"{\"error\":\"origin\"}");return;
  }
  // WebServer parses the body first. Field limits do not bound that allocation.
  if(server.args()>12){sendJson(413,"{\"error\":\"too_large\"}");return;}
  for(int i=0;i<server.args();++i){
    if(server.argName(i).length()>=24||server.arg(i).length()>=24){sendJson(413,"{\"error\":\"too_large\"}");return;}
    for(int j=0;j<i;++j)if(server.argName(i)==server.argName(j)){sendJson(400,"{\"error\":\"duplicate_field\"}");return;}
  }
  String values[9];const char* p[9];
  const char* names[]={"cmd","boot","run","id","exp","secs","phone_now_ms","target_ms","utc_offset_min"};
  for(int i=0;i<9;++i){values[i]=server.arg(names[i]);p[i]=server.hasArg(names[i])?values[i].c_str():nullptr;}
  binapp::RawFields f{p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8]};
  binapp::Request r;const char* error=binapp::parseRequest(f,r);
  if(error){char b[96];snprintf(b,sizeof b,"{\"error\":\"%s\"}",error);sendJson(400,b);return;}
  if(r.cmd==binapp::Cmd::STOP){
    binapp::Snapshot s;
    if(!readState(s)){sendJson(503,"{\"error\":\"busy\"}");return;}
    if(r.boot!=s.boot){sendJson(409,"{\"error\":\"bad_boot\"}");return;}
    xQueueOverwrite(stops,&r);
  }else{
    uint32_t client=0;binapp::Snapshot s;
    if(!binapp::parseU32(server.arg("client").c_str(),client)||!client){sendJson(400,"{\"error\":\"bad_client\"}");return;}
    if(!readState(s)){sendJson(503,"{\"error\":\"busy\"}");return;}
    if(r.boot!=s.boot){sendJson(409,"{\"error\":\"bad_boot\"}");return;}
    if(controlClient&&controlClient!=client){sendJson(409,"{\"error\":\"controller_busy\"}");return;}
    if(xQueueSend(commands,&r,0)!=pdTRUE){++queueDrops;sendJson(429,"{\"error\":\"queue_full\"}");return;}
    controlClient=client;
  }
  char b[80];snprintf(b,sizeof b,"{\"queued\":true,\"id\":%lu}",(unsigned long)r.id);sendJson(202,b);
}
void networkTask(void*){
  const char* headers[]={"Origin"};server.collectHeaders(headers,1);
  server.on("/",HTTP_GET,[]{server.sendHeader("Cache-Control","no-store");server.send_P(200,"text/html; charset=utf-8",APP_PAGE);});
  server.on("/api/state",HTTP_GET,[]{
    binapp::Snapshot s;if(!readState(s)){sendJson(503,"{\"error\":\"busy\"}");return;}
    s.queueDrop=queueDrops;char json[3072];
    if(binapp::writeStateJson(s,millis(),json,sizeof json)<0)sendJson(500,"{\"error\":\"state_size\"}");else{
      const String response=String("{\"device_id\":\"")+deviceId+"\",\"control_client\":"+String(controlClient)+","+String(json+1);
      sendJson(200,response.c_str());
    }
  });
  server.on("/api/cmd",HTTP_POST,postCommand);
  server.onNotFound([]{sendJson(404,"{\"error\":\"not_found\"}");});server.begin();
  for(;;){server.handleClient();vTaskDelay(pdMS_TO_TICKS(2));}
}
void applyAction(binapp::Action a){
  using binapp::Action;
  if(a==Action::DETACH){lid.detach();return;}
  if(a==Action::ATTACH_CLOSE){
    lid.setPeriodHertz(50);lid.attach(PIN_SERVO,min(SAFE_REST_US,SAFE_ACTIVE_US),max(SAFE_REST_US,SAFE_ACTIVE_US));
    if(!lid.attached()){controller.latchFault(millis());lid.detach();return;}
  }
  if(a==Action::ATTACH_CLOSE||a==Action::CLOSE)lid.writeMicroseconds(SAFE_REST_US);
  if(a==Action::OPEN)lid.writeMicroseconds(SAFE_ACTIVE_US);
}
void checkStop(){
  binapp::Request r;if(xQueueReceive(stops,&r,0)==pdTRUE)controller.handle(r,millis());
  while(Serial.available()){int c=Serial.read();if(c=='x'||c=='X')controller.stop(0,millis());}
}
void setup(){
  Serial.begin(115200);commands=xQueueCreate(8,sizeof(binapp::Request));stops=xQueueCreate(1,sizeof(binapp::Request));stateLock=xSemaphoreCreateMutex();
  if(!commands||!stops||!stateLock){Serial.println("INIT FAILED: servo power OFF");for(;;)delay(1000);}
  binapp::Config cfg;cfg.servoSetupConfirmed=SERVO_SETUP_CONFIRMED;cfg.safeRestUs=SAFE_REST_US;cfg.safeActiveUs=SAFE_ACTIVE_US;
  controller.init(cfg,esp_random());analogReadResolution(12);analogSetPinAttenuation(PIN_LIGHT,ADC_11db);
  Wire.begin(PIN_SDA,PIN_SCL);Wire.setClock(100000);Wire.setTimeOut(20);
  const bool a=ack(0x3C),b=ack(0x3D);
  if(a!=b){oledAddress=a?0x3C:0x3D;oled.setI2CAddress(oledAddress<<1);oled.begin();oled.setBusClock(100000);oledOk=ack(oledAddress);}
  controller.setOledOk(oledOk);publishState();WiFi.mode(WIFI_AP);
  const uint64_t mac=ESP.getEfuseMac();
  snprintf(deviceId,sizeof deviceId,"IoT-bin-%02X%02X%02X%02X%02X%02X",unsigned(mac&0xFF),unsigned((mac>>8)&0xFF),unsigned((mac>>16)&0xFF),unsigned((mac>>24)&0xFF),unsigned((mac>>32)&0xFF),unsigned((mac>>40)&0xFF));
  if(!WiFi.softAP(deviceId,CLASSROOM_AP_KEY,1,0,1)){controller.latchFault(millis(),binapp::Fault::AP);Serial.println("AP FAILED: servo power OFF");return;}
  Serial.printf("Wi-Fi: %s\nClassroom key: %s\nApp: http://%s/\n",deviceId,CLASSROOM_AP_KEY,WiFi.softAPIP().toString().c_str());
  if(xTaskCreatePinnedToCore(networkTask,"bin-http",12288,nullptr,1,nullptr,0)!=pdPASS)controller.latchFault(millis(),binapp::Fault::NETWORK);
}
void loop(){
  checkStop();uint32_t now=millis();
  if(uint32_t(now-lastSample)>=20){lastSample=now;uint32_t sum=0;for(int i=0;i<8;++i)sum+=analogRead(PIN_LIGHT);controller.onSample(sum/8,now);}
  binapp::Request r;if(xQueueReceive(commands,&r,0)==pdTRUE)controller.handle(r,now);
  checkStop();applyAction(controller.tick(millis()));
  if(uint32_t(millis()-lastFrame)>=200){
    lastFrame=millis();
    if(!oledOk||!ack(oledAddress)){oledOk=false;controller.setOledOk(false);controller.latchFault(millis(),binapp::Fault::OLED);}
    else{
      binapp::Snapshot s;controller.fillSnapshot(millis(),s);binapp::OledFrame f;binapp::oledFrame(s,f);
      oled.clearBuffer();oled.setFont(u8g2_font_6x10_tf);for(int i=0;i<binapp::OLED_LINES;++i)oled.drawStr(0,10+i*10,f[i]);oled.sendBuffer();
      if(!ack(oledAddress)){oledOk=false;controller.setOledOk(false);controller.latchFault(millis(),binapp::Fault::OLED);}
    }
    checkStop();applyAction(controller.tick(millis()));
  }
  publishState();delay(1);
}
