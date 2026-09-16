#include <cassert>
#include <iostream>
#include <string>
#include <vector>

constexpr int HIGH = 1, LOW = 0, INPUT_PULLUP = 2;
unsigned long nowMs = 0;
int pins[6] = {HIGH, HIGH, HIGH, HIGH, HIGH, HIGH};
unsigned long millis() { return nowMs; }
int digitalRead(int pin) { return pins[pin]; }
void pinMode(int pin, int mode) {
  assert((pin == 4 || pin == 5) && mode == INPUT_PULLUP);
}
struct {
  std::string pending;
  std::vector<std::string> lines;
  void begin(int baud) { assert(baud == 115200); }
  void print(const char* value) { pending += value; }
  void println(int value) {
    lines.push_back(pending + std::to_string(value));
    pending.clear();
  }
  void println(const char* value) {
    lines.push_back(pending + value);
    pending.clear();
  }
} Serial;

#include "counter_exercise_solution/counter_exercise_solution.ino"

void run(int plus, int minus, unsigned long duration) {
  pins[4] = plus; pins[5] = minus;
  for (unsigned long i = 0; i < duration; ++i) { loop(); ++nowMs; }
}
void reset() {
  count = 0; lastPlus = lastMinus = HIGH;
  changedAt = 0; readyForPress = false;
  Serial.lines.clear(); Serial.pending.clear();
  setup(); run(HIGH, HIGH, 100);
}
void press(int plus, int minus) {
  run(plus, minus, 100); run(HIGH, HIGH, 100);
}
int main() {
  reset();
  press(HIGH, LOW);
  for (int i = 0; i < 6; ++i) press(LOW, HIGH);
  press(HIGH, LOW);
  const std::vector<std::string> expected = {
    "event=start count=0", "event=minimum count=0",
    "event=plus count=1", "event=plus count=2", "event=plus count=3",
    "event=plus count=4", "event=plus count=5", "FULL",
    "event=maximum count=5", "FULL", "event=minus count=4"};
  assert(count == 4 && Serial.lines == expected);
  std::cout << "PASS worksheet sequence and exact FULL placement\n";
  for (const auto& entry : Serial.lines) std::cout << entry << '\n';

  reset(); run(LOW, HIGH, 2000);
  assert(count == 1 && Serial.lines.size() == 2);
  std::cout << "PASS restart and long hold\n";

  reset();
  for (int i = 0; i < 4; ++i) press(LOW, HIGH);
  auto before = Serial.lines.size();
  run(LOW, HIGH, 2000);
  assert(count == 5 && Serial.lines.size() == before + 2);
  assert(Serial.lines.back() == "FULL");
  std::cout << "PASS held fifth press prints FULL only once\n";

  reset(); run(LOW, LOW, 100); run(HIGH, LOW, 100);
  assert(count == 0 && Serial.lines.size() == 1);
  run(HIGH, HIGH, 100); press(LOW, HIGH); assert(count == 1);
  std::cout << "PASS overlap rule unchanged\n";

  reset(); run(LOW, HIGH, 5); run(HIGH, HIGH, 5);
  run(LOW, HIGH, 100); assert(count == 1);
  std::cout << "PASS simulated bounce\n";
  std::cout << "5 exercise software test groups passed; no physical test.\n";
}
