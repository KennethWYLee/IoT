#pragma once
// API substitutes only: no PWM timing, current, sound or servo resource model.
inline bool ledcAttachGood=true, ledcToneGood=true, ledcWriteGood=true;
inline int ledcAttaches=0, ledcTones=0, ledcDetaches=0;
inline uint32_t lastToneHz=0;
inline bool ledcAttach(int pin,uint32_t hz,int bits){
 assert(pin>=0&&hz==2000&&bits==10);ledcAttaches++;return ledcAttachGood;
}
inline bool ledcWrite(int pin,uint32_t duty){
 assert(duty==0);if(!ledcWriteGood)return false;digitalWrite(pin,LOW);return true;
}
inline uint32_t ledcWriteTone(int pin,uint32_t hz){
 assert(hz==2000);ledcTones++;lastToneHz=hz;
 if(!ledcToneGood)return 0;digitalWrite(pin,HIGH);return hz;
}
inline bool ledcDetach(int pin){assert(pin>=0);ledcDetaches++;return true;}
