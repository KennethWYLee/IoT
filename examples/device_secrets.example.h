#pragma once

// Copy only the fields required by the selected course sketch into secrets.h.
// Replace every placeholder locally. Never commit secrets.h.
const char WIFI_SSID[] = "replace-with-wifi-name";
const char WIFI_PASSWORD[] = "replace-with-wifi-password";

const char API_BASE_URL[] = "http://192.168.1.23:8000";

const char MQTT_HOST[] = "192.168.1.23";
const int MQTT_PORT = 1883;
const char MQTT_USERNAME[] = "replace-with-broker-user";
const char MQTT_PASSWORD[] = "replace-with-broker-password";
