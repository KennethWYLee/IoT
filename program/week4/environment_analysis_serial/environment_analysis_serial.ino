#include <Arduino.h>
#include <DHT.h>

// Confirm the actual module's supply, ground and data pins before enabling it.
const int PIN_DHT = 10, PIN_LIGHT = 4, PIN_BUTTON = 5;
const bool DHT_WIRING_CONFIRMED = false;
// Practice settings, not calibrated light or safety limits.
const int LIGHT_LIMIT_RAW = 3000;
const float TEMP_LIMIT_C = 28.0f;
DHT dht(PIN_DHT, DHT11);
enum State { WAIT, NORMAL, ALERT, UNKNOWN };
struct Alarm {
  State state = WAIT;
  bool open = false, ack = false;
  uint32_t count = 0, total = 0;
};
const char* stateName(State state);
const char* updateAlarm(Alarm& alarm, bool valid, bool exceeded);
bool confirmAlarm(Alarm& alarm);
Alarm lightAlarm, tempAlarm;
struct Analysis { uint32_t count = 0, total = 0, longest = 0; };
Analysis pcLight, pcTemp;
float temperature = NAN, humidity = NAN;
int raw = 0;
bool lightValid = false, dhtValid = false, recording = false, firstFrame = true;
bool hasAnalysis = false, pcOff = false;
uint32_t lastSample = 0, lastFrame = 0, sessionStart = 0, lastAccount = 0;
uint32_t sessionId = 0, latestEmittedTime = 0, analysisSourceTime = 0, lastAnalysis = 0;
int lastReading = HIGH, stableButton = HIGH;
bool releaseSeen = false;
uint32_t changedAt = 0;
char command[128]{}, lines[6][32]{};
size_t commandLength = 0;
bool commandOverflow = false;
bool limitsValid() {
  return LIGHT_LIMIT_RAW >= 0 && LIGHT_LIMIT_RAW <= 4095 && isfinite(TEMP_LIMIT_C);
}
const char* stateName(State state) {
  return state == WAIT ? "WAIT" : state == NORMAL ? "NORMAL" : state == ALERT ? "ALERT" : "UNKNOWN";
}
void accountTime(uint32_t now) {
  const uint32_t elapsed = uint32_t(now - lastAccount);
  if (recording && lightAlarm.state == ALERT) lightAlarm.total += elapsed;
  if (recording && tempAlarm.state == ALERT) tempAlarm.total += elapsed;
  lastAccount = now;
}
const char* updateAlarm(Alarm& alarm, bool valid, bool exceeded) {
  if (!valid) { alarm.state = UNKNOWN; return "NONE"; }
  alarm.state = exceeded ? ALERT : NORMAL;
  if (recording && exceeded && !alarm.open) {
    alarm.open = true; alarm.ack = false; ++alarm.count; return "ALARM";
  }
  if (recording && !exceeded && alarm.open) {
    alarm.open = false; alarm.ack = false; return "RECOVER";
  }
  return "NONE";
}
void clearAnalysis() {
  hasAnalysis = false; pcLight = Analysis{}; pcTemp = Analysis{};
  analysisSourceTime = lastAnalysis = 0;
}
bool analysisCurrent() {
  if (!hasAnalysis || pcOff) return false;
  if (!recording) return analysisSourceTime == latestEmittedTime;
  return uint32_t(millis() - lastAnalysis) <= 6500 &&
    uint32_t(uint32_t(millis() - sessionStart) - analysisSourceTime) <= 6500;
}
const char* pcStateName() {
  if (pcOff) return "OFF";
  if (sessionId && !recording) return analysisCurrent() ? "STOP" : "WAIT";
  if (!hasAnalysis) return "WAIT";
  return analysisCurrent() ? "LIVE" : "STALE";
}
void emit(const char* event, const char* lightEvent = "NONE", const char* tempEvent = "NONE") {
  if (!limitsValid()) { Serial.println("# CHECK LIMITS"); return; }
  char light[8]{}, t[16]{}, h[16]{}, row[320]{};
  if (lightValid) snprintf(light, sizeof(light), "%d", raw);
  if (dhtValid) {
    snprintf(t, sizeof(t), "%.3f", temperature);
    snprintf(h, sizeof(h), "%.3f", humidity);
  }
  latestEmittedTime = strcmp(event, "START") == 0 ? 0 : uint32_t(millis() - sessionStart);
  snprintf(row, sizeof(row), "%lu,%s,%s,%s,%s,%s,%s,%s,%s,%d,%d,%lu,%lu,%lu,%lu,%d,%.3f",
    (unsigned long)latestEmittedTime, light, t, h, event,
    stateName(lightAlarm.state), stateName(tempAlarm.state), lightEvent, tempEvent,
    lightAlarm.ack ? 1 : 0, tempAlarm.ack ? 1 : 0,
    (unsigned long)lightAlarm.count, (unsigned long)tempAlarm.count,
    (unsigned long)lightAlarm.total, (unsigned long)tempAlarm.total, LIGHT_LIMIT_RAW, TEMP_LIMIT_C);
  Serial.println(row);
}
void startSession(uint32_t id) {
  sessionStart = lastAccount = lastSample = millis();
  lightAlarm = Alarm{}; tempAlarm = Alarm{};
  lightValid = dhtValid = false; temperature = humidity = NAN;
  recording = true; firstFrame = true; sessionId = id; latestEmittedTime = 0;
  pcOff = false; clearAnalysis();
  char message[32]{}; snprintf(message, sizeof(message), "# SESSION %lu", (unsigned long)id);
  Serial.println(message);
  Serial.println("time_ms,light_raw,temperature_c,humidity_percent,event,light_state,temperature_state,light_event,temperature_event,light_acknowledged,temperature_acknowledged,light_alarm_count,temperature_alarm_count,light_alarm_ms,temperature_alarm_ms,light_limit_raw,temp_limit_c");
  emit("START");
}
void stopSession() {
  accountTime(millis());
  if (recording) emit("STOP");
  recording = false; firstFrame = true;
}
bool decimalFields(const char* text, uint32_t* values, size_t count) {
  for (size_t i = 0; i < count; ++i) {
    if (*text < '0' || *text > '9') return false;
    uint32_t value = 0;
    do {
      const uint32_t digit = uint32_t(*text++ - '0');
      if (value > (UINT32_MAX - digit) / 10) return false;
      value = value * 10 + digit;
    } while (*text >= '0' && *text <= '9');
    values[i] = value;
    if (i + 1 < count) { if (*text++ != ' ') return false; }
    else if (*text != 0) return false;
  }
  return true;
}
void acceptAnalysis(const uint32_t* v) {
  if (!sessionId || v[0] != sessionId || pcOff || v[1] < analysisSourceTime ||
      v[1] > uint32_t(millis() - sessionStart) || v[1] > latestEmittedTime ||
      v[2] > lightAlarm.count || v[3] > lightAlarm.total || v[4] > v[3] ||
      v[5] > tempAlarm.count || v[6] > tempAlarm.total || v[7] > v[6]) return;
  analysisSourceTime = v[1]; pcLight = {v[2], v[3], v[4]}; pcTemp = {v[5], v[6], v[7]};
  lastAnalysis = millis(); hasAnalysis = true; firstFrame = true;
}
void executeCommand() {
  uint32_t v[8]{};
  if (strncmp(command, "START ", 6) == 0 && decimalFields(command + 6, v, 1)) {
    if (v[0] && v[0] != sessionId) startSession(v[0]);
  } else if (strcmp(command, "HELLO") == 0) Serial.println("# ANALYSIS CAPABLE");
  else if (strcmp(command, "STOP") == 0) stopSession();
  else if (strcmp(command, "PC_OFF") == 0) { pcOff = true; clearAnalysis(); firstFrame = true; }
  else if (strncmp(command, "ANALYSIS ", 9) == 0 && decimalFields(command + 9, v, 8)) acceptAnalysis(v);
}
void readCommands() {
  for (int i = 0; i < 32 && Serial.available(); ++i) {
    const unsigned char c = static_cast<unsigned char>(Serial.read());
    if (c == '\n') {
      if (commandLength && command[commandLength - 1] == '\r') --commandLength;
      command[commandLength] = 0;
      if (!commandOverflow) executeCommand();
      commandLength = 0; commandOverflow = false;
    } else if ((c < 32 && c != '\r') || c > 126) commandOverflow = true;
    else if (commandLength < sizeof(command) - 1) command[commandLength++] = char(c);
    else commandOverflow = true;
  }
}
bool buttonPressed() {
  const uint32_t now = millis(); const int reading = digitalRead(PIN_BUTTON);
  if (reading != lastReading) { lastReading = reading; changedAt = now; }
  if (uint32_t(now - changedAt) < 40) return false;
  if (reading == HIGH) releaseSeen = true;
  if (reading == stableButton) return false;
  stableButton = reading;
  if (stableButton == LOW && releaseSeen) { releaseSeen = false; return true; }
  return false;
}
bool confirmAlarm(Alarm& alarm) {
  if (!alarm.open || alarm.ack) return false;
  alarm.ack = true; return true;
}
void readEnvironment() {
  const uint32_t now = millis();
  if (uint32_t(now - lastSample) < 2500) return;
  lastSample = now;
  raw = analogRead(PIN_LIGHT); lightValid = raw >= 0 && raw <= 4095;
  temperature = humidity = NAN;
  if (DHT_WIRING_CONFIRMED) {
    temperature = dht.readTemperature(); humidity = dht.readHumidity();
  }
  accountTime(millis());
  dhtValid = isfinite(temperature) && isfinite(humidity) && humidity >= 0 && humidity <= 100;
  if (!dhtValid) temperature = humidity = NAN;
  const char* le = updateAlarm(lightAlarm, lightValid && limitsValid(), raw > LIGHT_LIMIT_RAW);
  const char* te = updateAlarm(tempAlarm, dhtValid && limitsValid(), temperature > TEMP_LIMIT_C);
  if (recording) emit("SAMPLE", le, te);
}
void buildLines(bool statistics) {
  for (auto& line : lines) line[0] = 0;
  if (!statistics) {
    if (lightValid) snprintf(lines[0], sizeof(lines[0]), "RAW:%d", raw);
    else snprintf(lines[0], sizeof(lines[0]), "RAW:--");
    if (dhtValid) snprintf(lines[1], sizeof(lines[1]), "T:%.1fC RH:%.1f%%", temperature, humidity);
    else snprintf(lines[1], sizeof(lines[1]), "T:--C RH:--%%");
    snprintf(lines[2], sizeof(lines[2]), "LIGHT:%s", stateName(lightAlarm.state));
    snprintf(lines[3], sizeof(lines[3]), "TEMP:%s", stateName(tempAlarm.state));
    snprintf(lines[4], sizeof(lines[4]), "ACK L:%s T:%s", lightAlarm.ack ? "YES" : "NO", tempAlarm.ack ? "YES" : "NO");
    if (!DHT_WIRING_CONFIRMED) snprintf(lines[4], sizeof(lines[4]), "CHECK DHT WIRING");
    else if (!limitsValid()) snprintf(lines[4], sizeof(lines[4]), "CHECK LIMITS");
    snprintf(lines[5], sizeof(lines[5]), "PC:%s", pcStateName());
  } else {
    const bool current = analysisCurrent();
    const Analysis results[2] = {pcLight, pcTemp};
    for (int i = 0; i < 2; ++i) {
      const char kind = i == 0 ? 'L' : 'T';
      if (current) {
        snprintf(lines[i*3], sizeof(lines[0]), "%c COUNT:%lu", kind, (unsigned long)results[i].count);
        snprintf(lines[i*3+1], sizeof(lines[0]), "%c TOTAL:%.1fs", kind, results[i].total / 1000.0f);
        snprintf(lines[i*3+2], sizeof(lines[0]), "%c MAX:%.1fs", kind, results[i].longest / 1000.0f);
      } else {
        snprintf(lines[i*3], sizeof(lines[0]), "%c COUNT:--", kind);
        snprintf(lines[i*3+1], sizeof(lines[0]), "%c TOTAL:--s", kind);
        snprintf(lines[i*3+2], sizeof(lines[0]), "%c MAX:--s", kind);
      }
    }
  }
}
void showReading() {
  buildLines((uint32_t(millis() - sessionStart) / 3000) % 2 != 0);
  Serial.println("# FRAME");
  for (const auto& line : lines) {
    char message[40]{}; snprintf(message, sizeof(message), "# %s", line); Serial.println(message);
  }
}
void setup() {
  Serial.begin(115200);
  analogReadResolution(12); analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  lastReading = stableButton = digitalRead(PIN_BUTTON); changedAt = millis();

  if (DHT_WIRING_CONFIRMED) dht.begin();
  lastFrame = lastSample = sessionStart = lastAccount = millis();
  Serial.println("# ANALYSIS READY");
}
void loop() {
  accountTime(millis()); readCommands(); readEnvironment();
  if (buttonPressed() && recording) {
    const bool l = confirmAlarm(lightAlarm), t = confirmAlarm(tempAlarm);
    if (l || t) { accountTime(millis()); emit("ACK", l ? "ACK" : "NONE", t ? "ACK" : "NONE"); firstFrame = true; }
  }

  const uint32_t now = millis();
  if (firstFrame || uint32_t(now - lastFrame) >= 1000) {
    firstFrame = false; lastFrame = now; showReading();
  }
}
