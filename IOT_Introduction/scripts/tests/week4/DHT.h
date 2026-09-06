#pragma once
const int DHT11=11;
class DHT {
public:
  DHT(int,int){}
  void begin(){dhtBegins++;}
  float readHumidity(){dhtReads++;return fakeRh;}
  float readTemperature(){dhtReads++;return fakeC;}
};
