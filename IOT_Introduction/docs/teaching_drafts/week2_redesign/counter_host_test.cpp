#include <cassert>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

constexpr int HIGH = 1;
constexpr int LOW = 0;
constexpr int INPUT_PULLUP = 2;
unsigned long fakeTime = 0;
int pins[6] = {HIGH, HIGH, HIGH, HIGH, HIGH, HIGH};
int modes[6] = {};
unsigned long millis() { return fakeTime; }
int digitalRead(int pin) { return pins[pin]; }
void pinMode(int pin, int mode) { modes[pin] = mode; }
struct FakeSerial {
  std::string pending;
  std::vector<std::string> lines;
  void begin(int baud) { assert(baud == 115200); }
  void print(const char* value) { pending += value; }
  void println(int value) {
    lines.push_back(pending + std::to_string(value));
    pending.clear();
  }
} Serial;

// Run the actual sketch with only hardware I/O and time replaced.
#include "counter_two_buttons/counter_two_buttons.ino"

void run(int plus, int minus, unsigned long duration) {
  pins[4] = plus;
  pins[5] = minus;
  for (unsigned long i = 0; i < duration; ++i) {
    loop();
    ++fakeTime;
  }
}
void restart() {
  count = 0;
  lastPlus = lastMinus = HIGH;
  changedAt = 0;
  readyForPress = false;
  Serial.pending.clear();
  Serial.lines.clear();
  setup();
  assert(modes[4] == INPUT_PULLUP && modes[5] == INPUT_PULLUP);
  assert(Serial.lines.front() == "event=start count=0");
}
void release() { run(HIGH, HIGH, 100); }
void plusPress() { run(LOW, HIGH, 100); release(); }
void minusPress() { run(HIGH, LOW, 100); release(); }

int main() {
  static_assert(sizeof(unsigned long) == 4, "Match ESP32 millis width");
  restart(); release();
  plusPress(); plusPress(); plusPress(); minusPress(); minusPress();
  assert(count == 1);
  const std::vector<std::string> expected = {
    "event=start count=0", "event=plus count=1", "event=plus count=2",
    "event=plus count=3", "event=minus count=2", "event=minus count=1"};
  assert(Serial.lines == expected);
  std::cout << "PASS documented sequence and exact log\n";

  auto before = Serial.lines.size();
  run(LOW, HIGH, 2000);
  assert(count == 2 && Serial.lines.size() == before + 1);
  release(); plusPress(); assert(count == 3);
  std::cout << "PASS long hold counts once and release rearms\n";

  restart(); release(); minusPress();
  assert(count == 0 && Serial.lines.back() == "event=minimum count=0");
  for (int i = 0; i < 100; ++i) plusPress();
  assert(count == 99 && Serial.lines.back() == "event=maximum count=99");
  minusPress(); assert(count == 98);
  std::cout << "PASS minimum, maximum and recovery\n";

  restart(); release();
  run(LOW, HIGH, 5); run(HIGH, HIGH, 5);
  run(LOW, HIGH, 5); run(HIGH, HIGH, 5); run(LOW, HIGH, 100);
  assert(count == 1);
  run(HIGH, HIGH, 5); run(LOW, HIGH, 5); release();
  assert(count == 1); plusPress(); assert(count == 2);
  std::cout << "PASS simulated press and release bounce\n";

  restart(); release(); run(LOW, HIGH, 39); release();
  assert(count == 0);
  run(LOW, HIGH, 40); assert(count == 0);
  run(LOW, HIGH, 1); assert(count == 1); release();
  std::cout << "PASS below-threshold pulse and 40 ms acceptance boundary\n";

  restart(); run(LOW, HIGH, 500); assert(count == 0);
  release(); plusPress(); assert(count == 1);
  restart(); run(HIGH, LOW, 500); assert(count == 0);
  release(); plusPress(); assert(count == 1);
  std::cout << "PASS held button during startup is ignored\n";

  restart(); release(); run(LOW, LOW, 100);
  run(LOW, HIGH, 100); assert(count == 0);
  release(); plusPress(); assert(count == 1);
  run(HIGH, LOW, 100); assert(count == 0);
  run(LOW, LOW, 100); run(LOW, HIGH, 100); assert(count == 0);
  release(); plusPress(); assert(count == 1);
  std::cout << "PASS overlapping presses and full release recovery\n";

  restart(); release(); run(LOW, HIGH, 20); run(LOW, LOW, 100);
  run(HIGH, LOW, 100); assert(count == 0);
  release(); plusPress(); assert(count == 1);
  std::cout << "PASS staggered overlap before acceptance\n";

  restart(); release();
  for (int i = 0; i < 1000; ++i) { plusPress(); minusPress(); }
  assert(count == 0 && Serial.lines.size() == 2001);
  std::cout << "PASS 1000 complete plus-minus cycles\n";

  fakeTime = 0xFFFFFFF0UL;
  restart(); release();
  fakeTime = 0xFFFFFFF0UL;
  run(LOW, HIGH, 100); assert(count == 1);
  std::cout << "PASS unsigned millis wraparound\n";

  restart(); release(); assert(count == 0);
  std::cout << "PASS restart resets count\n";
  std::cout << "11 software test groups passed; no physical device tested.\n";
}
