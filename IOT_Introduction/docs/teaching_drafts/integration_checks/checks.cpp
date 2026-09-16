#include "Arduino.h"
#include "DHT.h"
#include "Wire.h"
#include "U8g2lib.h"
#include "sketch.inc"

int checks = 0;
#define CHECK(x) do { if (!(x)) { fprintf(stderr, "FAIL line %d: %s\n", __LINE__, #x); return 1; } ++checks; } while (0)
void advance(uint32_t dt) { fakeNow += dt; loop(); }
void releaseButtons() {
  levels[5] = HIGH; levels[4] = HIGH;
  loop(); advance(40);
}
void pressButton(int pin) { levels[pin] = LOW; loop(); advance(40); }
bool contains(const char* s) { return Serial.output.find(s) != std::string::npos; }

int main() {
  levels[5] = LOW; // Boot-held input must not trigger a record/start.
  setup();
#if BLOCKED
  for (int i = 0; i < 10; ++i) advance(500);
  CHECK(!ready); CHECK(modes == 0); CHECK(adcCalls == 0);
  CHECK(dhtBegins == 0); CHECK(wireBegins == 0); CHECK(sends == 0);
#elif TASK_WEEK == 3
  advance(100); CHECK(batch == 0);
  releaseButtons(); pressButton(5);
  CHECK(batch == 1); CHECK(sampleIndex == 1); CHECK(adcCalls == 1);
  if (SAMPLES_PER_PRESS == 3) {
    releaseButtons(); pressButton(5);
    CHECK(contains("reason=batch_busy")); CHECK(batch == 1);
    advance(120); CHECK(sampleIndex == 2);
    adcValue = 4095; advance(200); CHECK(sampleIndex == 3);
    CHECK(contains("endpoint=1")); CHECK(!collecting);
  }
  advance(2000); CHECK(batch == 1);
  CHECK(adcCalls == SAMPLES_PER_PRESS);
  releaseButtons();
  levels[5] = LOW; loop(); advance(10);
  levels[5] = HIGH; loop(); advance(10);
  CHECK(batch == 1); // Short bounce is not accepted.
  releaseButtons(); pressButton(5); CHECK(batch == 2);
  advance(200); advance(200);
  fakeNow = UINT32_MAX - 20; releaseButtons(); pressButton(5);
  CHECK(batch == 3); CHECK(contains("index=1"));
#elif TASK_WEEK == 4
  advance(100); CHECK(attempt == 0);
  releaseButtons(); pressButton(5);
  CHECK(attempt == 1);
  CHECK(recordCount == (REQUIRE_VALID_DHT ? 0u : 1u));
  CHECK(contains(REQUIRE_VALID_DHT ? "event=skipped" : "dht_age_ms=NA"));
  fakeNow = 2500; loop(); CHECK(dhtFinishedAt == 2525); CHECK(dhtValid);
  CHECK(dhtReads == 1);
  releaseButtons(); pressButton(5);
  CHECK(attempt == 2); CHECK(contains("dht_age_ms=80"));
  const auto saved = recordCount;
  advance(1000); CHECK(recordCount == saved); // Held button.
  fakeTemperature = NAN; fakeNow = 5000; loop(); CHECK(!dhtValid);
  releaseButtons(); pressButton(5); CHECK(attempt == 3);
  CHECK(recordCount == saved + (REQUIRE_VALID_DHT ? 0u : 1u));
  CHECK(std::isnan(temperature)); // Never reuse the earlier success as new.
  fakeTemperature = 25; adcValue = 4095; fakeNow = 7500; loop();
  releaseButtons(); pressButton(5); CHECK(contains("endpoint=1"));
  CHECK(dhtReads == 3);
  CHECK(recordCount == (REQUIRE_VALID_DHT ? 2u : 4u));
#elif TASK_WEEK == 5
  advance(100); CHECK(!running); CHECK(durationSeconds == STEP_SECONDS);
  releaseButtons();
  for (uint32_t i = 0; i < MAX_SECONDS / STEP_SECONDS; ++i) {
    pressButton(4); releaseButtons();
  }
  CHECK(durationSeconds == STEP_SECONDS); // Upper bound wraps.
  pressButton(4); CHECK(durationSeconds == 2 * STEP_SECONDS);
  advance(1000); CHECK(durationSeconds == 2 * STEP_SECONDS);
  releaseButtons();
  levels[4] = LOW; levels[5] = LOW; loop(); advance(40);
  CHECK(!running); CHECK(durationSeconds == 2 * STEP_SECONDS);
  releaseButtons(); pressButton(5); CHECK(running);
  releaseButtons(); pressButton(4);
  CHECK(contains("ignored_while_running")); CHECK(durationSeconds == 2 * STEP_SECONDS);
  releaseButtons(); advance(1000); pressButton(5);
  CHECK(!running); CHECK(std::string(state) == "STOPPED");
  const auto frozen = remainingMs; advance(1000); CHECK(remainingMs == frozen);
  releaseButtons(); pressButton(5); CHECK(running);
  CHECK(remainingMs == durationSeconds * 1000);
  advance(durationSeconds * 1000);
  CHECK(!running); CHECK(remainingMs == 0); CHECK(std::string(state) == "DONE");
  const auto firstExpired = Serial.output.find("event=expired");
  advance(1000); CHECK(Serial.output.find("event=expired", firstExpired + 1) == std::string::npos);
  releaseButtons(); fakeNow = UINT32_MAX - 150; pressButton(5);
  CHECK(running); advance(durationSeconds * 1000); CHECK(!running);
  releaseButtons(); pressButton(5); CHECK(running);
  ack = false; advance(250); CHECK(ioFault); CHECK(!running);
  const auto sendCount = sends;
  ack = true; releaseButtons(); pressButton(5);
  CHECK(!running); CHECK(sends == sendCount); CHECK(contains("event=display_fault"));
#endif
  printf("PASS week=%d blocked=%d checks=%d (fake I/O only)\n", TASK_WEEK, BLOCKED, checks);
  return 0;
}
