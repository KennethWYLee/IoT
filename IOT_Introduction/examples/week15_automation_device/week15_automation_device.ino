// Generated from the maintained lesson; do not edit this repository copy.
// Save a personal sketch before entering settings or secrets.
#include <Arduino.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include "secrets.h"

const char DEVICE_ID[] = "replace-with-team-device-id";
const bool DRY_RUN = true;
const int PIN_START = -1;
const int PIN_STOP = -1;
const int PIN_LIGHT = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int RGB_ON_LEVEL = -1;
const int LIGHT_VALID_MIN = -1;
const int LIGHT_VALID_MAX = -1;

enum class DeviceState { IDLE, ACTIVE, ERROR_STATE };
DeviceState state = DeviceState::IDLE;
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

String topicTelemetry, topicEvents, topicPresence, topicCommands, topicAcks;
bool startLastRaw = false, stopLastRaw = false;
bool startStablePressed = false, stopStablePressed = false;
unsigned long startChangedAt = 0, stopChangedAt = 0;
unsigned long lastWifiAttemptAt = 0, lastMqttAttemptAt = 0, lastTelemetryAt = 0;
const unsigned long DEBOUNCE_MS = 35;
const unsigned long WIFI_RETRY_MS = 10000;
const unsigned long MQTT_RETRY_MS = 5000;
const unsigned long TELEMETRY_MS = 2000;

// 全部值來自本人Week 3校正，不可照抄placeholder。
const bool DARK_WHEN_RAW_LESS = true;
const int DARK_ENTER_RAW = -1;
const int LIGHT_EXIT_RAW = -1;
const int REQUIRED_CONSECUTIVE_SAMPLES = 3;

const unsigned long AUTOMATION_SAMPLE_MS = 500;
const unsigned long MAX_ACTIVE_MS = 10000;
const unsigned long NETWORK_GRACE_MS = 30000;

bool autoMode = false;
bool latestSensorValid = false;
bool simulatedSensorFault = false;
int latestLightRaw = -1;
int darkCount = 0;
int lightCount = 0;
unsigned long lastAutomationSampleAt = 0;
unsigned long activeStartedAt = 0;
unsigned long mqttOfflineSince = 0;

struct ProcessedCommand {
  String id;
  String result;
  String message;
};
const int PROCESSED_COMMAND_CAPACITY = 8;
ProcessedCommand processedCommands[PROCESSED_COMMAND_CAPACITY];
int nextProcessedCommand = 0;

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
  const int pins[] = {
    PIN_START, PIN_STOP, PIN_LIGHT, PIN_RGB_R, PIN_RGB_G, PIN_RGB_B
  };
  bool pinsReady = PIN_START >= 0 && PIN_STOP >= 0 && PIN_LIGHT >= 0 &&
                   PIN_RGB_R >= 0 && PIN_RGB_G >= 0 && PIN_RGB_B >= 0;
  bool range = LIGHT_VALID_MIN >= 0 && LIGHT_VALID_MAX <= 4095 &&
               LIGHT_VALID_MAX > LIGHT_VALID_MIN;
  bool level = RGB_ON_LEVEL == HIGH || RGB_ON_LEVEL == LOW;
  return pinsReady && allPinsUnique(pins, 6) && range && level;
}

bool automationProfileReady() {
  if (!profileReady()) return false;
  if (DARK_ENTER_RAW < LIGHT_VALID_MIN || DARK_ENTER_RAW > LIGHT_VALID_MAX) return false;
  if (LIGHT_EXIT_RAW < LIGHT_VALID_MIN || LIGHT_EXIT_RAW > LIGHT_VALID_MAX) return false;
  if (DARK_WHEN_RAW_LESS) return DARK_ENTER_RAW < LIGHT_EXIT_RAW;
  return DARK_ENTER_RAW > LIGHT_EXIT_RAW;
}

bool meetsDarkEnter(int raw) {
  return DARK_WHEN_RAW_LESS ? raw <= DARK_ENTER_RAW : raw >= DARK_ENTER_RAW;
}

bool meetsLightExit(int raw) {
  return DARK_WHEN_RAW_LESS ? raw >= LIGHT_EXIT_RAW : raw <= LIGHT_EXIT_RAW;
}

int rgbOffLevel() { return RGB_ON_LEVEL == HIGH ? LOW : HIGH; }

void setRgb(bool red, bool green, bool blue) {
  if (DRY_RUN || !profileReady()) return;
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : rgbOffLevel());
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : rgbOffLevel());
}

void enterState(DeviceState next, const char *reason) {
  DeviceState previous = state;
  state = next;
  if (state == DeviceState::IDLE) setRgb(false, false, true);
  if (state == DeviceState::ACTIVE) setRgb(false, true, false);
  if (state == DeviceState::ERROR_STATE) setRgb(true, false, false);
  if (state == DeviceState::ACTIVE && previous != DeviceState::ACTIVE) {
    activeStartedAt = millis();
  }
  if (state != DeviceState::ACTIVE) activeStartedAt = 0;
  Serial.printf("action=state_transition from=%d to=%s reason=%s raw=%d auto=%s\n",
                static_cast<int>(previous), stateName(), reason, latestLightRaw,
                autoMode ? "true" : "false");
}

void buildTopics() {
  String root = "course/" + String(DEVICE_ID) + "/";
  topicTelemetry = root + "telemetry";
  topicEvents = root + "events";
  topicPresence = root + "presence";
  topicCommands = root + "commands";
  topicAcks = root + "acks";
}

bool publishJson(const String &topic, JsonDocument &document, bool retained = false) {
  if (!mqttClient.connected()) return false;
  String payload;
  serializeJson(document, payload);
  bool sent = mqttClient.publish(topic.c_str(), payload.c_str(), retained);
  Serial.printf("mqtt=publish topic=%s sent=%s payload=%s\n",
                topic.c_str(), sent ? "true" : "false", payload.c_str());
  return sent;
}

void publishPresence(const char *value) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = "presence";
  doc["value"] = value; doc["unit"] = "status"; doc["state"] = stateName();
  doc["valid"] = true; doc["reason"] = "mqtt_session"; doc["uptime_ms"] = millis();
  publishJson(topicPresence, doc, true);
}

void publishEvent(const char *type, int value, const char *unit,
                  bool valid, const char *reason) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = type;
  doc["value"] = value; doc["unit"] = unit; doc["state"] = stateName();
  doc["valid"] = valid; doc["reason"] = reason; doc["uptime_ms"] = millis();
  publishJson(topicEvents, doc);
}

void publishAck(const String &id, const char *result, const char *message) {
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["command_id"] = id;
  doc["result"] = result; doc["message"] = message;
  publishJson(topicAcks, doc);
}

int findProcessedCommand(const String &id) {
  for (int index = 0; index < PROCESSED_COMMAND_CAPACITY; index++) {
    if (processedCommands[index].id == id) return index;
  }
  return -1;
}

void finishCommand(const String &id, const char *result, const char *message) {
  processedCommands[nextProcessedCommand] = {id, result, message};
  nextProcessedCommand = (nextProcessedCommand + 1) % PROCESSED_COMMAND_CAPACITY;
  publishAck(id, result, message);
}

void executeCommand(const String &id, const String &command) {
  int previousIndex = findProcessedCommand(id);
  if (previousIndex >= 0) {
    publishAck(id, processedCommands[previousIndex].result.c_str(),
               processedCommands[previousIndex].message.c_str());
    return;
  }
  publishAck(id, "accepted", "received by device");

  if (command == "test_sensor_fault") {
    simulatedSensorFault = true;
    latestSensorValid = false;
    enterSafetyError("simulated_sensor_invalid");
    finishCommand(id, "done", "sensor fault test active; safe output applied");
  } else if (command == "clear_sensor_fault_test") {
    simulatedSensorFault = false;
    latestSensorValid = false;
    finishCommand(id, "done",
                  "sensor fault test cleared; wait for a fresh valid sample before reset");
  } else if (command == "stop") {
    enterSafetyError("remote_stop");
    finishCommand(id, "done", "safe output applied");
  } else if (command == "reset") {
    if (!DRY_RUN && stopStablePressed) {
      finishCommand(id, "rejected", "release physical stop before reset");
    } else if (!latestSensorValid && !DRY_RUN) {
      finishCommand(id, "rejected", "sensor must be valid before reset");
    } else {
      autoMode = false;
      enterState(DeviceState::IDLE, "remote_reset");
      finishCommand(id, "done", "idle output applied; auto mode off");
    }
  } else if (command == "auto_on") {
    if (state != DeviceState::IDLE || !automationProfileReady() ||
        (!latestSensorValid && !DRY_RUN)) {
      finishCommand(id, "rejected",
                    "idle state, valid sensor, and verified profile required");
    } else {
      autoMode = true;
      darkCount = 0; lightCount = 0;
      finishCommand(id, "done", "automation armed");
    }
  } else if (command == "auto_off") {
    autoMode = false;
    if (state == DeviceState::ERROR_STATE) {
      finishCommand(id, "done", "automation disabled; error remains latched");
    } else {
      enterState(DeviceState::IDLE, "remote_auto_off");
      finishCommand(id, "done", "automation disabled and idle applied");
    }
  } else if (command == "start" && !autoMode &&
             state != DeviceState::ERROR_STATE) {
    enterState(DeviceState::ACTIVE, "remote_manual_start");
    finishCommand(id, "done", "manual active output applied");
  } else if (command == "start" && autoMode) {
    finishCommand(id, "rejected", "disable auto mode before manual start");
  } else {
    finishCommand(id, "rejected", "command not allowed in current state");
  }
}

void onMqttMessage(char *topic, byte *payload, unsigned int length) {
  if (String(topic) != topicCommands) return;
  if (length == 0 || length >= 768) {
    Serial.printf("mqtt=reject reason=payload_length length=%u\n", length); return;
  }
  char buffer[768];
  memcpy(buffer, payload, length); buffer[length] = '\0';
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, buffer);
  if (error) {
    Serial.printf("mqtt=reject reason=json detail=%s\n", error.c_str()); return;
  }
  String target = doc["device_id"] | "";
  String id = doc["command_id"] | "";
  String command = doc["command"] | "";
  if (target != DEVICE_ID || id.length() == 0 || command.length() == 0) {
    Serial.println("mqtt=reject reason=identity_or_field"); return;
  }
  executeCommand(id, command);
}

void requestWifi() {
  if (WiFi.status() == WL_CONNECTED) return;
  unsigned long now = millis();
  if (lastWifiAttemptAt && now - lastWifiAttemptAt < WIFI_RETRY_MS) return;
  lastWifiAttemptAt = now; WiFi.disconnect(); WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println("wifi=connecting");
}

void requestMqtt() {
  if (WiFi.status() != WL_CONNECTED || mqttClient.connected()) return;
  unsigned long now = millis();
  if (lastMqttAttemptAt && now - lastMqttAttemptAt < MQTT_RETRY_MS) return;
  lastMqttAttemptAt = now;

  JsonDocument willDoc;
  willDoc["device_id"] = DEVICE_ID; willDoc["event_type"] = "presence";
  willDoc["value"] = "offline"; willDoc["unit"] = "status";
  willDoc["state"] = stateName(); willDoc["valid"] = true;
  willDoc["reason"] = "last_will";
  String willPayload; serializeJson(willDoc, willPayload);

  bool connected = mqttClient.connect(
    DEVICE_ID, MQTT_USERNAME, MQTT_PASSWORD,
    topicPresence.c_str(), 1, true, willPayload.c_str());
  Serial.printf("mqtt=connect connected=%s state=%d\n",
                connected ? "true" : "false", mqttClient.state());
  if (connected) {
    mqttClient.subscribe(topicCommands.c_str(), 1);
    publishPresence("online");
  }
}

bool pressedEvent(int pin, bool &lastRaw, bool &stablePressed,
                  unsigned long &changedAt) {
  bool pressed = digitalRead(pin) == LOW;
  unsigned long now = millis();
  if (pressed != lastRaw) {
    lastRaw = pressed;
    changedAt = now;
  }
  if (now - changedAt >= DEBOUNCE_MS && pressed != stablePressed) {
    stablePressed = pressed;
    return stablePressed;
  }
  return false;
}

void enterSafetyError(const char *reason) {
  autoMode = false;
  darkCount = 0;
  lightCount = 0;
  enterState(DeviceState::ERROR_STATE, reason);
  publishEvent("safety_error", latestLightRaw, "adc_raw", false, reason);
}

void evaluateNetworkSafety() {
  if (mqttClient.connected()) {
    mqttOfflineSince = 0;
    return;
  }
  if (mqttOfflineSince == 0) mqttOfflineSince = millis();
  if (state == DeviceState::ACTIVE &&
      millis() - mqttOfflineSince >= NETWORK_GRACE_MS) {
    enterSafetyError("network_timeout");
  }
}

void evaluateAutomation() {
  evaluateNetworkSafety();
  if (state == DeviceState::ACTIVE && activeStartedAt != 0 &&
      millis() - activeStartedAt >= MAX_ACTIVE_MS) {
    enterSafetyError("active_timeout");
    return;
  }
  if (DRY_RUN || !automationProfileReady()) return;
  unsigned long now = millis();
  if (now - lastAutomationSampleAt < AUTOMATION_SAMPLE_MS) return;
  lastAutomationSampleAt = now;
  latestLightRaw = analogRead(PIN_LIGHT);
  latestSensorValid = !simulatedSensorFault &&
                      latestLightRaw >= LIGHT_VALID_MIN &&
                      latestLightRaw <= LIGHT_VALID_MAX;
  if (!latestSensorValid) {
    if (state != DeviceState::ERROR_STATE) {
      enterSafetyError(simulatedSensorFault ? "simulated_sensor_invalid" :
                                                "sensor_out_of_profile");
    }
    return;
  }
  if (!autoMode) return;

  if (state == DeviceState::IDLE) {
    darkCount = meetsDarkEnter(latestLightRaw) ? darkCount + 1 : 0;
    lightCount = 0;
    if (darkCount >= REQUIRED_CONSECUTIVE_SAMPLES) {
      darkCount = 0;
      enterState(DeviceState::ACTIVE, "automation_dark_confirmed");
      publishEvent("automation_started", latestLightRaw, "adc_raw", true,
                   "three_dark_samples");
    }
  } else if (state == DeviceState::ACTIVE) {
    lightCount = meetsLightExit(latestLightRaw) ? lightCount + 1 : 0;
    darkCount = 0;
    if (lightCount >= REQUIRED_CONSECUTIVE_SAMPLES) {
      lightCount = 0;
      enterState(DeviceState::IDLE, "automation_light_confirmed");
      publishEvent("automation_stopped", latestLightRaw, "adc_raw", true,
                   "three_light_samples");
    }
  }
}

void readPhysicalInputs() {
  if (DRY_RUN || !profileReady()) return;
  bool stopPressedEvent =
    pressedEvent(PIN_STOP, stopLastRaw, stopStablePressed, stopChangedAt);
  bool startPressedEvent =
    pressedEvent(PIN_START, startLastRaw, startStablePressed, startChangedAt);
  if (stopStablePressed) {
    if (stopPressedEvent || state != DeviceState::ERROR_STATE) {
      enterSafetyError("physical_stop");
    }
    return;
  }
  if (startPressedEvent) {
    if (autoMode || state == DeviceState::ERROR_STATE) {
      publishEvent("start_rejected", 1, "pressed", false,
                   "manual_start_not_allowed");
    } else {
      enterState(DeviceState::ACTIVE, "physical_manual_start");
      publishEvent("start_pressed", 1, "pressed", true, "physical_input");
    }
  }
}

void publishTelemetryIfDue() {
  if (DRY_RUN || !profileReady() || !mqttClient.connected()) return;
  unsigned long now = millis();
  if (now - lastTelemetryAt < TELEMETRY_MS) return;
  lastTelemetryAt = now;
  int raw = analogRead(PIN_LIGHT);
  bool valid = raw >= LIGHT_VALID_MIN && raw <= LIGHT_VALID_MAX;
  JsonDocument doc;
  doc["device_id"] = DEVICE_ID; doc["event_type"] = "light_sample";
  doc["value"] = raw; doc["unit"] = "adc_raw"; doc["state"] = stateName();
  doc["valid"] = valid;
  doc["reason"] = valid ? "within_profile" : "out_of_profile";
  doc["uptime_ms"] = now;
  publishJson(topicTelemetry, doc);
}

void setup() {
  Serial.begin(115200); delay(500); buildTopics();
  if (!identifierReady(DEVICE_ID)) {
    Serial.println("fatal=device_id_missing_or_invalid"); return;
  }
  if (!DRY_RUN && !profileReady()) {
    Serial.println("fatal=hardware_profile_incomplete"); return;
  }
  if (!DRY_RUN) {
    pinMode(PIN_START, INPUT_PULLUP); pinMode(PIN_STOP, INPUT_PULLUP);
    pinMode(PIN_RGB_R, OUTPUT); pinMode(PIN_RGB_G, OUTPUT); pinMode(PIN_RGB_B, OUTPUT);
    enterState(DeviceState::IDLE, "boot");
  }
  WiFi.mode(WIFI_STA);
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(onMqttMessage);
  mqttClient.setBufferSize(768);
  mqttClient.setKeepAlive(20);
  mqttClient.setSocketTimeout(1);
  requestWifi();
  Serial.printf("week=12 device=%s topic=%s mode=%s\n",
                DEVICE_ID, topicCommands.c_str(), DRY_RUN ? "dry_run" : "hardware");
}

void loop() {
  readPhysicalInputs();
  evaluateAutomation();  // broker離線時也先處理本機STOP
  requestWifi();
  requestMqtt();
  if (mqttClient.connected()) mqttClient.loop();
  publishTelemetryIfDue();
  delay(5);
}
