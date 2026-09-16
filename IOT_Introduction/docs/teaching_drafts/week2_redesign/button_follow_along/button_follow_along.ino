// For the pictured YD-ESP32-S3 Type-A V1.5 only.
// Upload with no external wiring; unplug USB before connecting the button.
const int BUTTON_PIN = 4;

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  int value = digitalRead(BUTTON_PIN);
  if (value == LOW) {
    Serial.println("pressed");
  } else {
    Serial.println("released");
  }
  delay(300);
}
