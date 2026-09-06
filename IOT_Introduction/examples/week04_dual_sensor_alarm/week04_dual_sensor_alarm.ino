#include <Arduino.h>
#include <DHT.h>
#include <math.h>

// Published defaults are deliberately blocked. No inferred module pin order.
const int PIN_LIGHT = -1;
const int PIN_DHT = -1;
const int PIN_BUZZER_CONTROL = -1;
const bool SENSOR_PROFILES_CONFIRMED = false;
const bool BUZZER_PROFILE_CONFIRMED = false;
const int BUZZER_ON_LEVEL = -1; // Set HIGH or LOW only from the approved driver profile.
const int INDOOR_MIN = -1;
const int INDOOR_MAX = -1;
const int SHADE_MIN = -1;
const int SHADE_MAX = -1;
const char *DEVICE_ID = "CHANGE_ME";
const uint32_t LIGHT_INTERVAL_MS = 50;
const uint32_t DHT_INTERVAL_MS = 2500;
const uint32_t STABLE_MS = 150;
const uint32_t BEEP_MS = 120;
const uint32_t PRINT_INTERVAL_MS = 500;

DHT dht(PIN_DHT, DHT11);
bool ready = false, shadeHigher = true;
int threshold = -1;
bool injectDht = false, injectLight = false;
bool muted = false, beepActive = false;
uint32_t beepStarted = 0, lastLight = 0, lastDht = 0, lastPrint = 0;
uint32_t lightSample = 0, dhtSample = 0, coverEvents = 0;
int lightRaw = -1;
bool lightValid = false;
// -1: no accepted stable classification yet; 0: indoor; 1: covered.
int candidate = -1, stable = -1;
uint32_t candidateSince = 0;
bool armed = false;
float temperatureC = NAN, humidityPct = NAN;
bool haveDht = false, dhtValid = false, previousDhtValid = false;
float previousC = 0, previousRh = 0;
uint32_t previousDhtMs = 0, dhtAt = 0;
const char *dhtQuality = "invalid", *dhtReason = "not_sampled";

bool configureCalibration() {
  if (INDOOR_MIN <= 0 || SHADE_MIN <= 0 || INDOOR_MAX >= 4095 || SHADE_MAX >= 4095 ||
      INDOOR_MIN > INDOOR_MAX || SHADE_MIN > SHADE_MAX) return false;
  if (INDOOR_MAX < SHADE_MIN) {
    shadeHigher = true; threshold = (INDOOR_MAX + SHADE_MIN) / 2;
  } else if (SHADE_MAX < INDOOR_MIN) {
    shadeHigher = false; threshold = (SHADE_MAX + INDOOR_MIN) / 2;
  } else return false;
  return true;
}

bool profileReady() {
  return SENSOR_PROFILES_CONFIRMED && BUZZER_PROFILE_CONFIRMED &&
         PIN_LIGHT >= 0 && PIN_DHT >= 0 && PIN_BUZZER_CONTROL >= 0 &&
         PIN_LIGHT != PIN_DHT && PIN_LIGHT != PIN_BUZZER_CONTROL && PIN_DHT != PIN_BUZZER_CONTROL &&
         (BUZZER_ON_LEVEL == HIGH || BUZZER_ON_LEVEL == LOW);
}

void silence() {
  digitalWrite(PIN_BUZZER_CONTROL, BUZZER_ON_LEVEL == HIGH ? LOW : HIGH);
  beepActive = false;
}

void serviceBeep(uint32_t now) {
  if (beepActive && now - beepStarted >= BEEP_MS) {
    silence();
    Serial.printf("device_id=%s event_type=beep_off uptime_ms=%lu reason=duration_elapsed\n", DEVICE_ID, (unsigned long)now);
  }
}

void resetLightState() {
  candidate = stable = -1;
  armed = false; // A new stable release is required after any invalid interval.
}

void readLight(uint32_t now) {
  ++lightSample;
  lightRaw = injectLight ? -1 : analogRead(PIN_LIGHT);
  // Controller policy is stricter than Week 3's candidate label: outside observed span is rejected.
  lightValid = !injectLight && lightRaw > 0 && lightRaw < 4095 &&
               lightRaw >= min(INDOOR_MIN, SHADE_MIN) && lightRaw <= max(INDOOR_MAX, SHADE_MAX);
  if (!lightValid) { resetLightState(); silence(); return; }
  const bool lowSide = lightRaw <= threshold;
  const int current = (shadeHigher ? !lowSide : lowSide) ? 1 : 0;
  if (candidate != current) { candidate = current; candidateSince = now; }
  if (now - candidateSince < STABLE_MS || stable == candidate) return;
  stable = candidate;
  Serial.printf("device_id=%s event_type=light_stable state=%s uptime_ms=%lu source=hardware\n",
                DEVICE_ID, stable ? "SHADE" : "INDOOR", (unsigned long)now);
  if (stable == 0) { armed = true; return; }
  if (!armed) return; // Booting while covered is not a new cover action.
  armed = false;
  ++coverEvents;
  Serial.printf("device_id=%s event_type=cover_event count=%lu uptime_ms=%lu buzzer_command=%s\n",
                DEVICE_ID, (unsigned long)coverEvents, (unsigned long)now, muted ? "muted" : "on");
  if (!muted) {
    digitalWrite(PIN_BUZZER_CONTROL, BUZZER_ON_LEVEL);
    beepActive = true; beepStarted = now;
  }
}

void readDht(uint32_t now) {
  (void)now; // Acquisition timestamp is taken after the synchronous library call.
  ++dhtSample;
  temperatureC = humidityPct = NAN;
  if (!injectDht) { humidityPct = dht.readHumidity(); temperatureC = dht.readTemperature(); }
  dhtAt = millis(); // Acquisition completion time; not the KY sample's timestamp.
  haveDht = true; dhtValid = true;
  dhtQuality = "usable"; dhtReason = "basic_checks_passed";
  if (!isfinite(temperatureC) || !isfinite(humidityPct)) {
    dhtValid = false; dhtQuality = "invalid";
    dhtReason = injectDht ? "injected_read_failed" : "read_failed";
  } else if (humidityPct < 0 || humidityPct > 100) {
    dhtValid = false; dhtQuality = "invalid"; dhtReason = "rh_out_of_bounds";
  } else if (temperatureC < 10 || temperatureC > 40) {
    dhtQuality = "suspect"; dhtReason = "outside_classroom_policy";
  } else if (previousDhtValid && dhtAt - previousDhtMs <= 2 * DHT_INTERVAL_MS &&
             (fabsf(temperatureC - previousC) > 5 || fabsf(humidityPct - previousRh) > 10)) {
    dhtQuality = "suspect"; dhtReason = "abrupt_change";
  }
  previousDhtValid = dhtValid && !injectDht;
  if (previousDhtValid) { previousC=temperatureC; previousRh=humidityPct; previousDhtMs=dhtAt; }
  // Report each sensor's own acquisition, rather than faking simultaneous samples.
  Serial.printf("device_id=%s sensor=dht11 source=%s sample=%lu uptime_ms=%lu temperature_c=%.1f humidity_pct=%.1f valid=%s quality=%s reason=%s\n",
                DEVICE_ID, injectDht ? "injected" : "hardware", (unsigned long)dhtSample,
                (unsigned long)dhtAt, temperatureC, humidityPct, dhtValid ? "true" : "false", dhtQuality, dhtReason);
}

void setup() {
  Serial.begin(115200); delay(500);
  if (!profileReady() || !configureCalibration()) {
    Serial.println("week=4 status=blocked reason=profile_or_calibration_missing"); return;
  }
  // The approved module must also remain quiet before setup and during reset.
  digitalWrite(PIN_BUZZER_CONTROL, BUZZER_ON_LEVEL == HIGH ? LOW : HIGH);
  pinMode(PIN_BUZZER_CONTROL, OUTPUT);
  analogReadResolution(12); analogSetPinAttenuation(PIN_LIGHT, ADC_11db);
  dht.begin();
  lastLight = lastDht = lastPrint = millis(); ready = true;
  Serial.printf("week=4 status=ready device_id=%s threshold=%d light_interval_ms=%lu dht_interval_ms=%lu stable_ms=%lu beep_ms=%lu\n",
                DEVICE_ID, threshold, (unsigned long)LIGHT_INTERVAL_MS, (unsigned long)DHT_INTERVAL_MS,
                (unsigned long)STABLE_MS, (unsigned long)BEEP_MS);
  Serial.println("commands=f:inject_dht k:inject_light r:resume_both q:mute u:unmute");
}

void loop() {
  if (!ready) return;
  uint32_t now = millis();
  serviceBeep(now);
  if (Serial.available()) {
    const char c=Serial.read();
    if (c=='f' || c=='r') { injectDht=c=='f'; previousDhtValid=false; haveDht=false; dhtValid=false; temperatureC=humidityPct=NAN; lastDht=now; }
    if (c=='k' || c=='r') { injectLight=c=='k'; lightRaw=-1; lightValid=false; resetLightState(); silence(); }
    if (c=='q') { muted=true; silence(); }
    if (c=='u') muted=false; // Does not replay a previous event.
    if (c!='\n' && c!='\r' && c!=' ') {
      const bool known=c=='f'||c=='k'||c=='r'||c=='q'||c=='u';
      Serial.printf("device_id=%s event_type=command status=%s command=%c uptime_ms=%lu\n", DEVICE_ID, known?"accepted":"rejected", c, (unsigned long)now);
    }
  }
  if (now-lastLight >= LIGHT_INTERVAL_MS) { lastLight=now; readLight(now); }
  // Avoid a DHT transaction while a beep is active, so it cannot lengthen this pulse.
  if (!beepActive && now-lastDht >= DHT_INTERVAL_MS) { lastDht=now; readDht(now); }
  now=millis(); serviceBeep(now);
  if (now-lastPrint >= PRINT_INTERVAL_MS) {
    lastPrint=now;
    Serial.printf("device_id=%s sensor=ky018 source=%s sample=%lu uptime_ms=%lu age_ms=%lu light_raw=%d valid=%s state=%s candidate=%d armed=%s event_count=%lu\n",
                  DEVICE_ID, injectLight?"injected":"hardware", (unsigned long)lightSample, (unsigned long)lastLight, (unsigned long)(now-lastLight),
                  lightRaw, lightValid?"true":"false", stable<0?"UNKNOWN":stable?"SHADE":"INDOOR", candidate,
                  armed?"true":"false", (unsigned long)coverEvents);
    if (!haveDht) Serial.println("sensor=dht11 snapshot=none valid=false age_ms=unknown");
    else Serial.printf("sensor=dht11 snapshot=latest source=%s age_ms=%lu valid=%s quality=%s reason=%s\n",
                       injectDht?"injected":"hardware", (unsigned long)(now-dhtAt),
                       dhtValid?"true":"false", dhtQuality, dhtReason);
  }
}
