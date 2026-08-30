// 由教師公布的ADC target-test profile填入；未公布時保持-1。
const int PIN_LIGHT = -1;
const int SAMPLE_COUNT = 30;
const unsigned long SAMPLE_INTERVAL_MS = 100;

struct Profile {
  const char* label;
  int minimum;
  int maximum;
  int average;
  bool ready;
};

Profile darkProfile = {"DARK", 0, 0, 0, false};
Profile normalProfile = {"NORMAL", 0, 0, 0, false};
Profile brightProfile = {"BRIGHT", 0, 0, 0, false};

bool pinProfileReady() {
  return PIN_LIGHT >= 0;
}

void captureProfile(Profile& profile) {
  long total = 0;
  int minimum = 4095;
  int maximum = 0;

  Serial.printf("capture=started label=%s samples=%d\n",
                profile.label, SAMPLE_COUNT);
  for (int index = 0; index < SAMPLE_COUNT; index++) {
    int raw = analogRead(PIN_LIGHT);
    total += raw;
    if (raw < minimum) minimum = raw;
    if (raw > maximum) maximum = raw;
    Serial.printf("sample=%d label=%s light_raw=%d\n",
                  index + 1, profile.label, raw);
    delay(SAMPLE_INTERVAL_MS);
  }

  profile.minimum = minimum;
  profile.maximum = maximum;
  profile.average = total / SAMPLE_COUNT;
  profile.ready = true;
  Serial.printf("capture=done label=%s min=%d max=%d average=%d spread=%d\n",
                profile.label, profile.minimum, profile.maximum,
                profile.average, profile.maximum - profile.minimum);
}

bool allReady() {
  return darkProfile.ready && normalProfile.ready && brightProfile.ready;
}

bool profilesOverlap() {
  Profile* p[] = {&darkProfile, &normalProfile, &brightProfile};
  for (int a = 0; a < 3; a++) {
    for (int b = a + 1; b < 3; b++) {
      bool separated = p[a]->maximum < p[b]->minimum ||
                       p[b]->maximum < p[a]->minimum;
      if (!separated) return true;
    }
  }
  return false;
}

int lightDirection() {
  if (darkProfile.average < normalProfile.average &&
      normalProfile.average < brightProfile.average) return 1;
  if (darkProfile.average > normalProfile.average &&
      normalProfile.average > brightProfile.average) return -1;
  return 0;
}

int darkNormalThreshold() {
  if (lightDirection() == 1) {
    return (darkProfile.maximum + normalProfile.minimum) / 2;
  }
  return (darkProfile.minimum + normalProfile.maximum) / 2;
}

int normalBrightThreshold() {
  if (lightDirection() == 1) {
    return (normalProfile.maximum + brightProfile.minimum) / 2;
  }
  return (normalProfile.minimum + brightProfile.maximum) / 2;
}

const char* classifyLight(int raw) {
  int direction = lightDirection();
  int thresholdDarkNormal = darkNormalThreshold();
  int thresholdNormalBright = normalBrightThreshold();

  if (direction == 1) {
    if (raw <= thresholdDarkNormal) return "DARK";
    if (raw >= thresholdNormalBright) return "BRIGHT";
  } else {
    if (raw >= thresholdDarkNormal) return "DARK";
    if (raw <= thresholdNormalBright) return "BRIGHT";
  }
  return "NORMAL";
}

void reportCalibration() {
  if (!allReady()) return;
  if (profilesOverlap()) {
    Serial.println("calibration_valid=false reason=profiles_overlap");
    return;
  }
  int direction = lightDirection();
  if (direction == 0) {
    Serial.println("calibration_valid=false reason=profiles_not_ordered");
    return;
  }
  Serial.printf("calibration_valid=true direction=%s "
                "threshold_dark_normal=%d threshold_normal_bright=%d\n",
                direction == 1 ? "raw_rises_with_light" :
                                 "raw_falls_with_light",
                darkNormalThreshold(), normalBrightThreshold());
}

void reportCurrent() {
  int raw = analogRead(PIN_LIGHT);
  if (!allReady()) {
    Serial.printf("sensor=ky018 light_raw=%d light_state=UNKNOWN "
                  "valid=false reason=not_calibrated\n", raw);
  } else if (profilesOverlap()) {
    Serial.printf("sensor=ky018 light_raw=%d light_state=UNCERTAIN "
                  "valid=false reason=profiles_overlap\n", raw);
  } else if (lightDirection() == 0) {
    Serial.printf("sensor=ky018 light_raw=%d light_state=UNCERTAIN "
                  "valid=false reason=profiles_not_ordered\n", raw);
  } else {
    Serial.printf("sensor=ky018 light_raw=%d light_state=%s "
                  "valid=true reason=none\n", raw, classifyLight(raw));
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!pinProfileReady()) {
    Serial.println("week=3 sensor=ky018 status=blocked reason=gpio_profile_missing");
    return;
  }
  analogReadResolution(12);
  Serial.println("week=3 sensor=ky018 status=ready adc_bits=12");
  Serial.println("commands: d=DARK n=NORMAL b=BRIGHT r=read");
}

void loop() {
  if (!pinProfileReady()) return;
  if (Serial.available() == 0) return;
  char command = Serial.read();
  while (Serial.available() > 0) Serial.read();
  bool profileChanged = false;

  if (command == 'd' || command == 'D') {
    captureProfile(darkProfile);
    profileChanged = true;
  } else if (command == 'n' || command == 'N') {
    captureProfile(normalProfile);
    profileChanged = true;
  } else if (command == 'b' || command == 'B') {
    captureProfile(brightProfile);
    profileChanged = true;
  }
  else if (command == 'r' || command == 'R') reportCurrent();
  else Serial.printf("command=unknown value=%c\n", command);

  if (profileChanged && allReady()) reportCalibration();
}
