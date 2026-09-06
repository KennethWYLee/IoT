unsigned long lastReportMs = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("boot: week02 group=CHANGE_ME version=1");
}

void loop() {
  unsigned long now = millis();

  if (now - lastReportMs >= 1000) {
    lastReportMs = now;
    Serial.printf("status: uptime_ms=%lu\n", now);
  }
}
