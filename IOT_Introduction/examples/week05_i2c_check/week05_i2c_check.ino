#include <Wire.h>

// Confirm the exact module's power, logic voltage, pin labels and bus pins first.
const bool ELECTRICAL_PROFILE_CONFIRMED = false;
const int PIN_SDA = -1;
const int PIN_SCL = -1;
bool scanned = false;

void setup() {
  Serial.begin(115200);
  delay(1000); // Startup visibility only; this is not a countdown.
  if (!ELECTRICAL_PROFILE_CONFIRMED || PIN_SDA < 0 || PIN_SCL < 0 ||
      PIN_SDA == PIN_SCL) {
    Serial.println("week=5 status=blocked reason=i2c_electrical_profile_missing");
    return;
  }
  if (!Wire.begin(PIN_SDA, PIN_SCL, 100000)) {
    Serial.println("week=5 status=blocked reason=i2c_begin_failed");
    return;
  }
  Wire.setTimeOut(20);
  int found = 0;
  for (int address = 8; address <= 119; ++address) {
    Wire.beginTransmission(address);
    const uint8_t error = Wire.endTransmission();
    if (error == 0) {
      ++found;
      Serial.printf("event_type=i2c_ack address_7bit=0x%02X model=unknown\n", address);
    }
  }
  scanned = true;
  Serial.printf("event_type=scan_finished found=%d model_verified=false\n", found);
}

void loop() {
  // One scan per boot; never turn ACK into proof of controller or correct wiring.
}
