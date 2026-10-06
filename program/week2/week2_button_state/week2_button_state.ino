#include <Arduino.h>

// Example board: YD-ESP32-S3 Type-A V1.5, N16R8. Verify the actual board.
// GPIO5 -> button group A; button group B -> GND. No external supply.
const int BUTTON_PIN = 5;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  const int reading = digitalRead(BUTTON_PIN);
  Serial.println(reading == LOW ? "pressed" : "released");
  delay(300);
}
