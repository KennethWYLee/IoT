#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== Week 2 board check ===");
  Serial.printf("chip_model=%s\n", ESP.getChipModel());
  Serial.printf("chip_revision=%u\n", ESP.getChipRevision());
  Serial.printf("cpu_mhz=%u\n", ESP.getCpuFreqMHz());
  Serial.printf("flash_bytes=%u\n", ESP.getFlashChipSize());
  Serial.printf("psram_bytes=%u\n", ESP.getPsramSize());
  Serial.println("status=running");
}

void loop() {
  static unsigned long lastReportMs = 0;
  const unsigned long now = millis();

  if (now - lastReportMs >= 1000) {
    lastReportMs = now;
    Serial.printf("uptime_ms=%lu\n", now);
  }
}