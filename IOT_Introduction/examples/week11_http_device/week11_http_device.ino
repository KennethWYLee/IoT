// Generated from the maintained lesson; do not edit this repository copy.
// Save a personal sketch before entering settings or secrets.
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include "secrets.h"

const char DEVICE_ID[] = "replace-with-team-device-id";

// 只可抄入本人Week 7已驗證的profile。
const bool DRY_RUN = true;
const int PIN_START = -1;
const int PIN_STOP = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;  // 經實測後填HIGH或LOW

enum class DeviceState { IDLE, ACTIVE, ERROR_STATE };
DeviceState state = DeviceState::IDLE;

bool startLastRaw = false;
bool stopLastRaw = false;
bool startStablePressed = false;
bool stopStablePressed = false;
unsigned long startChangedAt = 0;
unsigned long stopChangedAt = 0;
unsigned long lastPollAt = 0;
unsigned long lastWifiAttemptAt = 0;

struct ProcessedCommand {
  String id;
  String result;
  String message;
};
const int PROCESSED_COMMAND_CAPACITY = 8;
ProcessedCommand processedCommands[PROCESSED_COMMAND_CAPACITY];
int nextProcessedCommand = 0;

const unsigned long DEBOUNCE_MS = 35;
const unsigned long COMMAND_POLL_MS = 750;
const unsigned long WIFI_RETRY_MS = 10000;

const char *stateName() {
  switch (state) {
    case DeviceState::IDLE: return "idle";
    case DeviceState::ACTIVE: return "active";
    case DeviceState::ERROR_STATE: return "error";
  }
  return "unknown";
}

bool identifierReady(const char *value) {
  size_t length = strlen(value);
  if (length == 0 || length > 80 || String(value).startsWith("replace-")) return false;
  for (size_t index = 0; index < length; index++) {
    char character = value[index];
    bool allowed = isAlphaNumeric(character) || character == '.' ||
                   character == '_' || character == '-';
    if (!allowed) return false;
  }
  return isAlphaNumeric(value[0]);
}

bool allPinsUnique(const int *pins, size_t count) {
  for (size_t left = 0; left < count; left++)
    for (size_t right = left + 1; right < count; right++)
      if (pins[left] == pins[right]) return false;
  return true;
}

bool profileReady() {
  const int pins[] = {PIN_START, PIN_STOP, PIN_RGB_R, PIN_RGB_G, PIN_RGB_B};
  bool pinsReady = PIN_START >= 0 && PIN_STOP >= 0 &&
                   PIN_RGB_R >= 0 && PIN_RGB_G >= 0 && PIN_RGB_B >= 0;
  bool levelReady = RGB_ON_LEVEL == HIGH || RGB_ON_LEVEL == LOW;
  return pinsReady && allPinsUnique(pins, 5) && levelReady;
}

int rgbOffLevel() {
  return RGB_ON_LEVEL == HIGH ? LOW : HIGH;
}

void setRgb(bool red, bool green, bool blue) {
  if (DRY_RUN || !profileReady()) return;
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : rgbOffLevel());
}

void applySafeOutput() {
  if (state == DeviceState::IDLE) setRgb(false, false, true);
  if (state == DeviceState::ACTIVE) setRgb(false, true, false);
  if (state == DeviceState::ERROR_STATE) setRgb(true, false, false);
}

void enterState(DeviceState next, const char *reason) {
  state = next;
  applySafeOutput();
  Serial.printf("state=%s reason=%s\n", stateName(), reason);
}

bool wifiReady() {
  return WiFi.status() == WL_CONNECTED;
}

void requestWifiConnection() {
  if (wifiReady()) return;
  unsigned long now = millis();
  if (now - lastWifiAttemptAt < WIFI_RETRY_MS && lastWifiAttemptAt != 0) return;
  lastWifiAttemptAt = now;
  Serial.printf("wifi=connecting ssid=%s\n", WIFI_SSID);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

int postJson(const String &path, const String &body) {
  if (!wifiReady()) return -1000;
  WiFiClient networkClient;
  HTTPClient http;
  String url = String(API_BASE_URL) + path;
  if (!http.begin(networkClient, url)) return -1001;
  http.setTimeout(1500);
  http.addHeader("Content-Type", "application/json");
  int statusCode = http.POST(body);
  String response = http.getString();
  Serial.printf("http=POST path=%s status=%d response=%s\n",
                path.c_str(), statusCode, response.c_str());
  http.end();
  return statusCode;
}

bool postEvent(const char *eventType, int value, const char *unit,
               bool valid, const char *reason) {
  JsonDocument document;
  document["device_id"] = DEVICE_ID;
  document["event_type"] = eventType;
  document["value"] = value;
  document["unit"] = unit;
  document["state"] = stateName();
  document["valid"] = valid;
  document["reason"] = reason;
  document["uptime_ms"] = millis();
  String body;
  serializeJson(document, body);
  int code = postJson("/api/events", body);
  return code == 201;
}

bool postCommandResult(const String &commandId, const char *result,
                       const char *message) {
  JsonDocument document;
  document["result"] = result;
  document["message"] = message;
  String body;
  serializeJson(document, body);
  String path = "/api/commands/" + commandId + "/result";
  int code = postJson(path, body);
  return code == 200;
}

bool pressedEvent(int pin, bool &lastRawPressed, bool &stablePressed,
                  unsigned long &changedAt) {
  bool rawPressed = digitalRead(pin) == LOW;  // INPUT_PULLUP：按下時為LOW
  unsigned long now = millis();
  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAt = now;
  }
  if (now - changedAt >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    return stablePressed;
  }
  return false;
}

int findProcessedCommand(const String &commandId) {
  for (int index = 0; index < PROCESSED_COMMAND_CAPACITY; index++) {
    if (processedCommands[index].id == commandId) return index;
  }
  return -1;
}

void rememberTerminalResult(const String &commandId, const char *result,
                            const char *message) {
  processedCommands[nextProcessedCommand] = {commandId, result, message};
  nextProcessedCommand = (nextProcessedCommand + 1) % PROCESSED_COMMAND_CAPACITY;
}

void finishCommand(const String &commandId, const char *result,
                   const char *message) {
  rememberTerminalResult(commandId, result, message);
  postCommandResult(commandId, result, message);
}

void executeCommand(const String &commandId, const String &command) {
  int previousIndex = findProcessedCommand(commandId);
  if (previousIndex >= 0) {
    postCommandResult(commandId,
                      processedCommands[previousIndex].result.c_str(),
                      processedCommands[previousIndex].message.c_str());
    return;
  }
  postCommandResult(commandId, "accepted", "received by device");

  if (command == "stop") {
    enterState(DeviceState::ERROR_STATE, "remote_stop");
    postEvent("remote_stop", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "safe output applied");
    return;
  }

  if (command == "start") {
    if (state == DeviceState::ERROR_STATE) {
      finishCommand(commandId, "rejected", "reset required after error");
      return;
    }
    enterState(DeviceState::ACTIVE, "remote_start");
    postEvent("remote_start", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "active output applied");
    return;
  }

  if (command == "reset") {
    if (!DRY_RUN && stopStablePressed) {
      finishCommand(commandId, "rejected", "release physical stop before reset");
      return;
    }
    enterState(DeviceState::IDLE, "remote_reset");
    postEvent("remote_reset", 1, "command", true, "command_executed");
    finishCommand(commandId, "done", "idle output applied");
    return;
  }

  finishCommand(commandId, "rejected", "unknown command");
}

void pollCommand() {
  if (!wifiReady()) return;
  unsigned long now = millis();
  if (now - lastPollAt < COMMAND_POLL_MS) return;
  lastPollAt = now;

  WiFiClient networkClient;
  HTTPClient http;
  String path = "/api/devices/" + String(DEVICE_ID) + "/commands/next";
  String url = String(API_BASE_URL) + path;
  if (!http.begin(networkClient, url)) return;
  http.setTimeout(1200);
  int statusCode = http.GET();

  if (statusCode == 204) {
    http.end();
    return;
  }
  if (statusCode != 200) {
    Serial.printf("http=GET path=%s status=%d\n", path.c_str(), statusCode);
    http.end();
    return;
  }

  String response = http.getString();
  http.end();
  JsonDocument document;
  DeserializationError error = deserializeJson(document, response);
  if (error) {
    Serial.printf("command=parse_error detail=%s\n", error.c_str());
    return;
  }
  String commandId = document["command_id"] | "";
  String command = document["command"] | "";
  if (commandId.length() == 0 || command.length() == 0) {
    Serial.println("command=invalid reason=missing_field");
    return;
  }
  executeCommand(commandId, command);
}

void readPhysicalInputs() {
  if (DRY_RUN || !profileReady()) return;
  bool stopPressedEvent =
    pressedEvent(PIN_STOP, stopLastRaw, stopStablePressed, stopChangedAt);
  bool startPressedEvent =
    pressedEvent(PIN_START, startLastRaw, startStablePressed, startChangedAt);
  // STOP是持續條件；按住時即使收到remote reset，也必須維持ERROR。
  if (stopStablePressed) {
    if (stopPressedEvent || state != DeviceState::ERROR_STATE) {
      enterState(DeviceState::ERROR_STATE, "physical_stop");
      postEvent("stop_pressed", 1, "pressed", true, "physical_input");
    }
    return;
  }
  if (startPressedEvent) {
    if (state == DeviceState::ERROR_STATE) {
      postEvent("start_rejected", 1, "pressed", false, "reset_required");
    } else {
      enterState(DeviceState::ACTIVE, "physical_start");
      postEvent("start_pressed", 1, "pressed", true, "physical_input");
    }
  }
}

void readSerialTestCommand() {
  if (!Serial.available()) return;
  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command == "test-event") {
    postEvent("serial_test", 1, "test", true, "manual_host_path_test");
  } else if (command == "status") {
    Serial.printf("device=%s state=%s wifi=%s ip=%s mode=%s\n",
                  DEVICE_ID, stateName(), wifiReady() ? "connected" : "offline",
                  WiFi.localIP().toString().c_str(), DRY_RUN ? "dry_run" : "hardware");
  } else {
    Serial.printf("serial=unknown value=%s\n", command.c_str());
  }
}

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(50);
  delay(500);

  if (!identifierReady(DEVICE_ID)) {
    Serial.println("fatal=device_id_missing_or_invalid");
    return;
  }
  if (!DRY_RUN && !profileReady()) {
    Serial.println("fatal=hardware_profile_incomplete");
    return;
  }
  if (!DRY_RUN) {
    pinMode(PIN_START, INPUT_PULLUP);
    pinMode(PIN_STOP, INPUT_PULLUP);
    pinMode(PIN_RGB_R, OUTPUT);
    pinMode(PIN_RGB_G, OUTPUT);
    pinMode(PIN_RGB_B, OUTPUT);
    applySafeOutput();
  }

  WiFi.mode(WIFI_STA);
  requestWifiConnection();
  Serial.printf("week=11 device=%s mode=%s state=%s\n",
                DEVICE_ID, DRY_RUN ? "dry_run" : "hardware", stateName());
}

void loop() {
  readPhysicalInputs();       // 每次loop先讀本機輸入；Backend成功不是STOP前置條件
  requestWifiConnection();
  pollCommand();
  readSerialTestCommand();

  static wl_status_t previousStatus = WL_NO_SHIELD;
  wl_status_t currentStatus = WiFi.status();
  if (currentStatus != previousStatus) {
    previousStatus = currentStatus;
    Serial.printf("wifi_status=%d ip=%s\n", currentStatus,
                  WiFi.localIP().toString().c_str());
  }
  delay(5);
}
