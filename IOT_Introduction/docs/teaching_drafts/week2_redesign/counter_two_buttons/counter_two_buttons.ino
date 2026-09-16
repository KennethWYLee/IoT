// YD-ESP32-S3 Type-A V1.5 only; disconnect external wiring before upload.
const int PLUS_PIN = 4;
const int MINUS_PIN = 5;
const int MAX_COUNT = 99;
const unsigned long DEBOUNCE_MS = 40;

int count = 0;
int lastPlus = HIGH;
int lastMinus = HIGH;
unsigned long changedAt = 0;
bool readyForPress = false;

void printCount(const char* event) {
  Serial.print("event=");
  Serial.print(event);
  Serial.print(" count=");
  Serial.println(count);
}

void setup() {
  pinMode(PLUS_PIN, INPUT_PULLUP);
  pinMode(MINUS_PIN, INPUT_PULLUP);
  Serial.begin(115200);
  changedAt = millis();
  printCount("start");
}

void loop() {
  int plus = digitalRead(PLUS_PIN);
  int minus = digitalRead(MINUS_PIN);
  unsigned long now = millis();

  if (plus != lastPlus || minus != lastMinus) {
    lastPlus = plus;
    lastMinus = minus;
    changedAt = now;
  }
  // Overlapping presses require both buttons to be released again.
  if (plus == LOW && minus == LOW) readyForPress = false;
  if (now - changedAt < DEBOUNCE_MS) return;

  if (plus == HIGH && minus == HIGH) {
    readyForPress = true;
    return;
  }
  if (!readyForPress) return;
  readyForPress = false;

  if (plus == LOW) {
    if (count < MAX_COUNT) {
      count = count + 1;
      printCount("plus");
    } else {
      printCount("maximum");
    }
  } else {
    if (count > 0) {
      count = count - 1;
      printCount("minus");
    } else {
      printCount("minimum");
    }
  }
}
