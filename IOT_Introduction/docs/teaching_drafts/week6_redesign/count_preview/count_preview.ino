// Numerical preview only: no GPIO, servo library, or actuator output.
const int ZERO_EXAMPLE = 60;
const int SIX_EXAMPLE = 120;
int count = 0;

int exampleAngle(int n) {
  return ZERO_EXAMPLE + (SIX_EXAMPLE - ZERO_EXAMPLE) * n / 6;
}

void previewCommand(char c) {
  if (c == '\r' || c == '\n' || c == ' ') return;
  if (c < '0' || c > '6') {
    Serial.println("event=rejected reason=enter_one_digit_0_to_6");
    return;
  }
  count = c - '0';
  Serial.printf("mode=preview count=%d angle_example=%d servo_connected=false\n",
                count, exampleAngle(count));
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("mode=preview enter_one_digit_0_to_6 no_servo_output");
}

void loop() {
  if (Serial.available()) previewCommand((char)Serial.read());
}
