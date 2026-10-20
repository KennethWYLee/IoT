#include <Arduino.h>
#include <ESP32Servo.h>

Servo motor;
bool tested = false;

void setup() {
  Serial.begin(115200);
  motor.setPeriodHertz(50);
  motor.attach(7, 1000, 2000);
  if (!motor.attached()) {
    Serial.println("ATTACH FAILED. Servo power OFF.");
    return;
  }
  motor.writeMicroseconds(1500);
  Serial.println("READY: servo power ON, then send lowercase t.");
}

void loop() {
  if (tested || !motor.attached() || !Serial.available()) return;
  if (Serial.read() != 't') return;
  tested = true;

  // No button handling: cut external power immediately if the servo stalls.
  Serial.println("OUT: 1900 us");
  motor.writeMicroseconds(1900);
  delay(2000);
  Serial.println("RETURN: 1500 us");
  motor.writeMicroseconds(1500);
  delay(2000);
  motor.detach();
  Serial.println("COMMANDS SENT. Servo power OFF.");
}
