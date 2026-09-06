# Week 5：單機互動、狀態機與錯誤復原實驗

日期：2026-10-07

本週把兩顆按鈕、Week 3的KY-018校正結果，以及Week 4的RGB、蜂鳴器、
SG90與外部供電組成一個不需要網路的光線互動裝置。使用者按下按鈕後，系統
檢查感測設定、等待指定光線條件、顯示狀態，條件成立時完成一次受限舵機動作，
再返回可重新開始的狀態。感測無效、timeout或模擬故障時必須進入ERROR。

> 驗證狀態：Week 5實物操作依賴已完成target test的Week 3感測profile、Week 4
> 致動器profile及本週第二顆STOP按鈕profile。目前`IOT_Introduction/docs/hardware/hardware_state.md`仍未
> 公布這些驗證結果。完整程式
> 預設`DRY_RUN=true`，只執行Serial狀態轉換，不驅動GPIO或舵機。只有前兩週
> profile及Week 5整合接線均驗證後，才能改為`false`並接上外部電源。

## 一、Unit Overview

### 教學目標

完成本單元後，學生應能：

1. 使用明確的閒置（IDLE）、就緒（READY）、執行中（ACTIVE）、結果（RESULT）與錯誤（ERROR）狀態描述互動裝置。
2. 將輸入讀取（input reading）、資料驗證（validation）、狀態判斷（state decision）、致動器輸出（actuator output）與復原行為（recovery）分成能清楚解釋的程式區段。
3. 使用非阻塞計時（non-blocking timing），讓程式持續處理按鈕（pushbutton）、感測器有效性（sensor validity）、逾時（timeout）及安全停止（safe stop）判斷。
4. 進入狀態時明確設定所有輸出，不依賴前一個狀態留下的輸出。
5. 完成並記錄三次可重複的互動循環，每次都從閒置狀態開始並回到閒置狀態。
6. 使用專用實體停止按鈕（STOP button）、安全的感測故障或逾時條件進入錯誤狀態，停止致動器控制，並依明確的清除（clear）及重設（reset）流程復原。
7. 產生一致的事件欄位（event field），供後續網路單元轉換為資料交換格式（JSON）並傳送。

### 教學內容

本單元將先前已驗證的輸入、感測、指示、動作與供電部分整合為單機互動系統（standalone interactive system）。學生會先設計狀態表（state table），再撰寫程式；先在不啟用硬體輸出的情況下測試狀態轉換（state transition），確認後才啟用實體線路，且不改變各狀態的意思。

程式避免長時間的阻塞延遲（blocking delay），並以裝置（device）、事件（event）、狀態（state）、數值（value）、單位（unit）、有效性（validity）、原因（reason）與運行時間（uptime）欄位記錄重要轉換。學生會比較正常循環、逾時（timeout）、模擬感測故障（simulated sensor failure）、重新啟動（restart）及復原（recovery），讓相同的本機行為日後能接入後端（backend），而不削弱硬體安全規則。

### 核心實驗流程

| 階段 | 開始前狀態 | 實驗內容 | 完成條件 |
|---:|---|---|---|
| 1 | 所有實體輸出斷電 | 完成狀態圖與轉移表 | 每個狀態有進入、輸出、離開及timeout |
| 2 | `DRY_RUN=true` | Serial狀態機 | 正常、fault、clear及reset轉移正確 |
| 3 | USB與電池均斷開 | 重建Week 2～4接線並加入獨立STOP | profile、接線及電源照片完整 |
| 4 | profile已驗證 | `DRY_RUN=false`實體測試 | 按鈕、感測、RGB、蜂鳴器及SG90一致 |
| 5 | 單次流程正常 | 三次重複流程 | 每次由IDLE開始並回到IDLE |
| 6 | 正常證據已保存 | timeout、感測故障與restart | ERROR停止脈波，復原步驟可重做 |
| 7 | 核心任務完成 | 修改一項規則 | 修改前後各有預測與三次結果 |
| 8 | 測試完成 | 後續網路單元事件欄位與復原 | 欄位固定、電池取出、所有電源關閉 |

## 二、器材、軟體與進入條件

| 品項 | 數量 | 來源 |
|---|---:|---|
| ESP32-S3、USB資料線、筆電 | 各1 | Week 2已驗證環境 |
| 四腳按鈕 | 2 | START沿用Week 2接法；STOP為本週獨立安全輸入 |
| KY-018 | 1 | Week 3校正profile |
| KY-016、KY-012 | 各1 | Week 4低功率profile |
| SG90、4AA帶開關電池盒 | 各1 | Week 4外部供電profile |
| 400孔麵包板與三種杜邦線 | 各1組 | 重建已驗證接線 |
| 核准AA電池與安全轉接端子 | 1組 | Week 4 profile |
| 萬用電表 | 每組1台；1人組可跨組共用 | 復查負載電壓及共地；各組分別保存量測證據 |

DHT11不是本週共同必接元件；先讓狀態、停止與重複測試清楚。Week 3、Week 4
或第二顆STOP任一profile尚未完成、接線照片無法核對、舵機曾發熱或電池電壓
未通過時，只做DRY RUN，不進入實體整合。

軟體沿用Week 4核准的ESP32Servo版本。不要在本週同時更換GPIO、library、電池
種類、門檻與安全角度，否則無法判斷故障來自哪一項變更。

## 三、狀態機與事件欄位

**狀態機（state machine）**把系統分成有限狀態，並明確規定何時進入、輸出什麼、
何時離開。程式不應只散落許多`if`，也不應依賴上一狀態遺留的燈光或舵機訊號。

| 狀態 | 進入原因 | 本狀態輸出 | 離開條件 |
|---|---|---|---|
| IDLE | 開機、完成或reset | 舵機detach；提示關閉 | START按鈕或`start` |
| READY | 接受開始 | 藍燈；檢查profile及感測設定 | 檢查通過後進ACTIVE |
| ACTIVE | 檢查通過 | 黃燈；定期讀KY-018 | 條件連續成立或timeout |
| RESULT | 條件成立 | 綠燈、短聲、受限動作→HOME→detach | 動作完成後回IDLE |
| ERROR | STOP、感測無效、timeout或fault | 紅燈、短聲，並在本機輸入處理週期detach | `clear`後再`reset` |

**非阻塞（non-blocking）**表示程式不以長時間`delay()`停住全部工作，而是用
`millis()`比較時間。這樣動作期間仍能處理`stop`、timeout及感測故障。

Week 5固定下列事件欄位；後續網路單元只會把同一筆資料轉成JSON，不重新命名：

- `device_id`
- `event_type`
- `state`
- `value`
- `unit`
- `valid`
- `reason`
- `uptime_ms`

範例：

```text
device_id=device01 event_type=state_changed state=ACTIVE value=1820 unit=adc_raw valid=true reason=none uptime_ms=4200
```

## 四、安全與接線重建

1. 開始時USB拔除、電池盒OFF並取出至少一顆電池。
2. 第一顆按鈕標記`START`，沿用Week 2的INPUT_PULLUP接法：一側接
   `PIN_START`，另一側接GND。
3. 第二顆按鈕標記`STOP`，使用另一個已驗證GPIO：一側接`PIN_STOP`，另一側
   接同一個GND。START與STOP不得共用同一個GPIO。
4. 依Week 3 profile接KY-018 signal、3V3與GND，不重新選GPIO或門檻。
5. 依Week 4 profile接RGB及蜂鳴器。
6. SG90 signal接已驗證GPIO；SG90 V+只接電池正極安全端子。
7. 電池負極、SG90 GND與ESP32 GND共地；電池正極不得接ESP32。
8. 從ESP32、電池與各模組起點正向檢查，再從元件反向檢查回來源。
9. 確認電池盒OFF、沒有裸線、舵機不帶機構後，拍攝完整俯視照片。

`servo.detach()`不是斷電。抖動、卡住、發熱、異味、重啟或負載電壓低於Week 4
停止值時，先將電池盒切到OFF，再拔USB。

## 五、建立完整狀態機程式

建立`week5_standalone_interaction`並貼上完整程式。第一次保持`DRY_RUN=true`。
程式中的`-1`只能填入Week 2～5已驗證profile；`DEVICE_ID`使用課堂指定代碼，
不使用姓名或學號。

```cpp
#include <ESP32Servo.h>

const bool DRY_RUN = true;
const char* DEVICE_ID = "device01";

const int PIN_START = -1;
const int PIN_STOP = -1;
const int PIN_LIGHT = -1;
const int PIN_SERVO = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int PIN_BUZZER = -1;
const int RGB_ON_LEVEL = -1;
const int BUZZER_ON_LEVEL = -1;

const int LIGHT_DIRECTION = 0;
const int LIGHT_THRESHOLD_DARK_NORMAL = -1;
const int LIGHT_THRESHOLD_NORMAL_BRIGHT = -1;
const int LIGHT_VALID_MIN = -1;
const int LIGHT_VALID_MAX = -1;
const bool LIGHT_PROFILES_SEPARATED = false;
const int TARGET_LIGHT_STATE = -1;  // 1=DARK, 2=BRIGHT

const int SERVO_MIN_US = -1;
const int SERVO_MAX_US = -1;
const int SAFE_MIN_ANGLE = -1;
const int SAFE_HOME_ANGLE = -1;
const int SAFE_TARGET_ANGLE = -1;
const int SAFE_MAX_ANGLE = -1;
const long SERVO_HOLD_MS = -1;
const long SERVO_SEQUENCE_TIMEOUT_MS = -1;
const int BUZZ_DURATION_MS = -1;

const unsigned long READY_HOLD_MS = 500;
const unsigned long ACTIVE_TIMEOUT_MS = 10000;
const unsigned long RESULT_DISPLAY_MS = 1000;
const unsigned long LIGHT_SAMPLE_MS = 100;
const int REQUIRED_MATCHES = 3;

enum SystemState { IDLE, READY, ACTIVE, RESULT, ERROR_STATE };
enum ServoPhase { SERVO_IDLE, SERVO_TO_TARGET, SERVO_TO_HOME };

SystemState state = IDLE;
ServoPhase servoPhase = SERVO_IDLE;
Servo servo;
unsigned long stateEnteredAt = 0;
unsigned long lastLightSampleAt = 0;
unsigned long servoPhaseDeadline = 0;
unsigned long servoSequenceStartedAt = 0;
unsigned long resultReadyAt = 0;
unsigned long buzzerOffAt = 0;
int consecutiveMatches = 0;
int latestLightRaw = 0;
bool simulatedSensorFault = false;
bool resultMotionDone = false;
bool errorCleared = false;

const char* stateName(SystemState value) {
  if (value == IDLE) return "IDLE";
  if (value == READY) return "READY";
  if (value == ACTIVE) return "ACTIVE";
  if (value == RESULT) return "RESULT";
  return "ERROR";
}

bool allPinsUnique(const int *pins, size_t count) {
  for (size_t left = 0; left < count; left++)
    for (size_t right = left + 1; right < count; right++)
      if (pins[left] == pins[right]) return false;
  return true;
}

bool hardwareProfileReady() {
  const int pins[] = {
    PIN_START, PIN_STOP, PIN_LIGHT, PIN_SERVO,
    PIN_RGB_R, PIN_RGB_G, PIN_RGB_B, PIN_BUZZER
  };
  bool pinsReady = PIN_START >= 0 && PIN_STOP >= 0 &&
                   PIN_START != PIN_STOP && PIN_LIGHT >= 0 && PIN_SERVO >= 0 &&
                   PIN_RGB_R >= 0 && PIN_RGB_G >= 0 && PIN_RGB_B >= 0 &&
                   PIN_BUZZER >= 0;
  bool levelsReady = (RGB_ON_LEVEL == LOW || RGB_ON_LEVEL == HIGH) &&
                     (BUZZER_ON_LEVEL == LOW || BUZZER_ON_LEVEL == HIGH);
  bool lightReady = (LIGHT_DIRECTION == 1 || LIGHT_DIRECTION == -1) &&
                    LIGHT_THRESHOLD_DARK_NORMAL >= 0 &&
                    LIGHT_THRESHOLD_DARK_NORMAL <= 4095 &&
                    LIGHT_THRESHOLD_NORMAL_BRIGHT >= 0 &&
                    LIGHT_THRESHOLD_NORMAL_BRIGHT <= 4095 &&
                    LIGHT_VALID_MIN >= 0 && LIGHT_VALID_MAX <= 4095 &&
                    LIGHT_VALID_MIN < LIGHT_VALID_MAX &&
                    LIGHT_THRESHOLD_DARK_NORMAL >= LIGHT_VALID_MIN &&
                    LIGHT_THRESHOLD_DARK_NORMAL <= LIGHT_VALID_MAX &&
                    LIGHT_THRESHOLD_NORMAL_BRIGHT >= LIGHT_VALID_MIN &&
                    LIGHT_THRESHOLD_NORMAL_BRIGHT <= LIGHT_VALID_MAX &&
                    LIGHT_PROFILES_SEPARATED &&
                    (TARGET_LIGHT_STATE == 1 || TARGET_LIGHT_STATE == 2) &&
                    ((LIGHT_DIRECTION == 1 &&
                      LIGHT_THRESHOLD_DARK_NORMAL <
                      LIGHT_THRESHOLD_NORMAL_BRIGHT) ||
                     (LIGHT_DIRECTION == -1 &&
                      LIGHT_THRESHOLD_DARK_NORMAL >
                      LIGHT_THRESHOLD_NORMAL_BRIGHT));
  bool servoReady = SERVO_MIN_US >= 500 && SERVO_MAX_US <= 2500 &&
                    SERVO_MIN_US < SERVO_MAX_US &&
                    SAFE_MIN_ANGLE >= 0 && SAFE_MAX_ANGLE <= 180 &&
                    SAFE_MIN_ANGLE < SAFE_MAX_ANGLE &&
                    SAFE_HOME_ANGLE >= SAFE_MIN_ANGLE &&
                    SAFE_HOME_ANGLE <= SAFE_MAX_ANGLE &&
                    SAFE_TARGET_ANGLE >= SAFE_MIN_ANGLE &&
                    SAFE_TARGET_ANGLE <= SAFE_MAX_ANGLE &&
                    SERVO_HOLD_MS >= 100 && SERVO_HOLD_MS <= 2000 &&
                    SERVO_SEQUENCE_TIMEOUT_MS >= SERVO_HOLD_MS * 2 + 100 &&
                    BUZZ_DURATION_MS >= 20 && BUZZ_DURATION_MS <= 500;
  return pinsReady && allPinsUnique(pins, 8) && levelsReady &&
         lightReady && servoReady;
}

int offLevel(int onLevel) {
  return onLevel == HIGH ? LOW : HIGH;
}

void setRgb(bool red, bool green, bool blue) {
  if (DRY_RUN) return;
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
}

void startBuzz() {
  if (DRY_RUN) return;
  digitalWrite(PIN_BUZZER, BUZZER_ON_LEVEL);
  buzzerOffAt = millis() + BUZZ_DURATION_MS;
}

void stopServoSignal() {
  if (!DRY_RUN && servo.attached()) servo.detach();
  servoPhase = SERVO_IDLE;
}

void logEvent(const char* eventType, int value, const char* unit,
              bool valid, const char* reason) {
  Serial.printf("device_id=%s event_type=%s state=%s value=%d unit=%s "
                "valid=%s reason=%s uptime_ms=%lu\n",
                DEVICE_ID, eventType, stateName(state), value, unit,
                valid ? "true" : "false", reason, millis());
}

void enterState(SystemState nextState, bool valid, const char* reason) {
  state = nextState;
  stateEnteredAt = millis();
  consecutiveMatches = 0;

  if (state == IDLE) {
    stopServoSignal();
    setRgb(false, false, false);
  } else if (state == READY) {
    stopServoSignal();
    setRgb(false, false, true);
  } else if (state == ACTIVE) {
    stopServoSignal();
    setRgb(true, true, false);
  } else if (state == RESULT) {
    setRgb(false, true, false);
    startBuzz();
    resultMotionDone = DRY_RUN;
    resultReadyAt = DRY_RUN ? millis() : 0;
  } else {
    stopServoSignal();
    errorCleared = false;
    setRgb(true, false, false);
    startBuzz();
  }
  logEvent("state_changed", latestLightRaw, "adc_raw", valid, reason);
}

int classifyLight(int raw) {
  if (LIGHT_DIRECTION == 1) {
    if (raw <= LIGHT_THRESHOLD_DARK_NORMAL) return 1;
    if (raw >= LIGHT_THRESHOLD_NORMAL_BRIGHT) return 2;
  } else {
    if (raw >= LIGHT_THRESHOLD_DARK_NORMAL) return 1;
    if (raw <= LIGHT_THRESHOLD_NORMAL_BRIGHT) return 2;
  }
  return 0;
}

bool lightReadingValid(int raw) {
  return !simulatedSensorFault && raw >= LIGHT_VALID_MIN &&
         raw <= LIGHT_VALID_MAX;
}

void startResultMotion() {
  if (DRY_RUN || servoPhase != SERVO_IDLE) return;
  servo.setPeriodHertz(50);
  servo.attach(PIN_SERVO, SERVO_MIN_US, SERVO_MAX_US);
  servo.write(SAFE_TARGET_ANGLE);
  servoPhase = SERVO_TO_TARGET;
  servoPhaseDeadline = millis() + SERVO_HOLD_MS;
  servoSequenceStartedAt = millis();
  logEvent("actuator_applied", SAFE_TARGET_ANGLE, "degree", true, "none");
}

void updateResultMotion() {
  if (DRY_RUN || servoPhase == SERVO_IDLE) return;
  unsigned long now = millis();
  if (now - servoSequenceStartedAt >=
      (unsigned long)SERVO_SEQUENCE_TIMEOUT_MS) {
    stopServoSignal();
    enterState(ERROR_STATE, false, "servo_timeout");
    return;
  }
  if ((long)(now - servoPhaseDeadline) < 0) return;

  if (servoPhase == SERVO_TO_TARGET) {
    servo.write(SAFE_HOME_ANGLE);
    servoPhase = SERVO_TO_HOME;
    servoPhaseDeadline = now + SERVO_HOLD_MS;
    logEvent("actuator_return", SAFE_HOME_ANGLE, "degree", true, "none");
  } else {
    stopServoSignal();
    resultMotionDone = true;
    resultReadyAt = now;
    logEvent("actuator_done", SAFE_HOME_ANGLE, "degree", true, "none");
  }
}

bool startLastRawPressed = false;
bool startStablePressed = false;
unsigned long startChangedAt = 0;
bool stopLastRawPressed = false;
bool stopStablePressed = false;
unsigned long stopChangedAt = 0;

bool pressedEvent(int pin, bool& lastRawPressed, bool& stablePressed,
                  unsigned long& changedAt) {
  if (DRY_RUN) return false;
  bool rawPressed = digitalRead(pin) == LOW;
  unsigned long now = millis();
  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAt = now;
  }
  if (now - changedAt >= 30 && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    return stablePressed;
  }
  return false;
}

void readButtons() {
  if (DRY_RUN) return;
  bool stopPressedEvent = pressedEvent(PIN_STOP, stopLastRawPressed,
                                       stopStablePressed, stopChangedAt);
  bool startPressed = pressedEvent(PIN_START, startLastRawPressed,
                                   startStablePressed, startChangedAt);
  // STOP是持續的安全條件，不只是一個按下邊緣。按住STOP時不得被reset繞過。
  if (stopStablePressed) {
    if (stopPressedEvent || state != ERROR_STATE) {
      enterState(ERROR_STATE, false, "physical_stop");
    }
    return;
  }
  if (startPressed && state == IDLE) {
    enterState(READY, true, "start_button");
  } else if (startPressed) {
    logEvent("command_rejected", latestLightRaw, "adc_raw", false,
             "start_not_allowed");
  }
}

void readSerialCommand() {
  if (Serial.available() == 0) return;
  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command == "start" && state == IDLE) {
    enterState(READY, true, "serial_start");
  } else if (command == "trigger" && DRY_RUN && state == ACTIVE) {
    enterState(RESULT, true, "dry_run_trigger");
  } else if (command == "fault") {
    simulatedSensorFault = true;
    enterState(ERROR_STATE, false, "simulated_sensor_fault");
  } else if (command == "stop") {
    enterState(ERROR_STATE, false, "manual_stop");
  } else if (command == "clear") {
    if (state != ERROR_STATE) {
      logEvent("command_rejected", latestLightRaw, "adc_raw", false,
               "clear_not_in_error");
    } else if (!DRY_RUN && stopStablePressed) {
      logEvent("command_rejected", latestLightRaw, "adc_raw", false,
               "physical_stop_active");
    } else {
      simulatedSensorFault = false;
      errorCleared = true;
      logEvent("fault_cleared", latestLightRaw, "adc_raw", true, "none");
    }
  } else if (command == "reset" && state == ERROR_STATE) {
    if (simulatedSensorFault) {
      logEvent("command_rejected", latestLightRaw, "adc_raw", false,
               "sensor_fault_active");
    } else if (!DRY_RUN && stopStablePressed) {
      logEvent("command_rejected", latestLightRaw, "adc_raw", false,
               "physical_stop_active");
    } else if (!errorCleared) {
      logEvent("command_rejected", latestLightRaw, "adc_raw", false,
               "clear_required");
    } else {
      enterState(IDLE, true, "manual_reset");
    }
  } else if (command == "status") {
    logEvent("status", latestLightRaw, "adc_raw",
             state != ERROR_STATE, state == ERROR_STATE ? "error_active" : "none");
  } else {
    logEvent("command_rejected", latestLightRaw, "adc_raw", false,
             "invalid_for_current_state");
  }
}

void updateStateMachine() {
  unsigned long now = millis();
  if (state == READY && now - stateEnteredAt >= READY_HOLD_MS) {
    if (!DRY_RUN && !hardwareProfileReady()) {
      enterState(ERROR_STATE, false, "config_missing");
    } else {
      enterState(ACTIVE, true, "ready_complete");
    }
  } else if (state == ACTIVE) {
    if (now - stateEnteredAt >= ACTIVE_TIMEOUT_MS) {
      enterState(ERROR_STATE, false, "active_timeout");
      return;
    }
    if (DRY_RUN || now - lastLightSampleAt < LIGHT_SAMPLE_MS) return;
    lastLightSampleAt = now;
    latestLightRaw = analogRead(PIN_LIGHT);
    if (!lightReadingValid(latestLightRaw)) {
      enterState(ERROR_STATE, false, "sensor_invalid");
      return;
    }
    int lightState = classifyLight(latestLightRaw);
    consecutiveMatches = lightState == TARGET_LIGHT_STATE ?
                         consecutiveMatches + 1 : 0;
    logEvent("sensor_sample", latestLightRaw, "adc_raw", true, "none");
    if (consecutiveMatches >= REQUIRED_MATCHES) {
      enterState(RESULT, true, "target_condition_met");
      startResultMotion();
    }
  } else if (state == RESULT) {
    updateResultMotion();
    if (resultMotionDone && now - resultReadyAt >= RESULT_DISPLAY_MS) {
      enterState(IDLE, true, "cycle_complete");
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!DRY_RUN && !hardwareProfileReady()) {
    Serial.println("week=5 status=blocked reason=config_missing");
    return;
  }
  if (!DRY_RUN) {
    pinMode(PIN_START, INPUT_PULLUP);
    pinMode(PIN_STOP, INPUT_PULLUP);
    pinMode(PIN_RGB_R, OUTPUT);
    pinMode(PIN_RGB_G, OUTPUT);
    pinMode(PIN_RGB_B, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
  }
  Serial.printf("week=5 status=ready mode=%s\n", DRY_RUN ? "dry_run" : "hardware");
  Serial.println("commands: start, trigger(dry run), fault, stop, clear, reset, status");
  enterState(IDLE, true, "boot");
}

void loop() {
  if (!DRY_RUN && !hardwareProfileReady()) return;
  if (!DRY_RUN && buzzerOffAt != 0 &&
      (long)(millis() - buzzerOffAt) >= 0) {
    digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
    buzzerOffAt = 0;
  }
  readSerialCommand();
  readButtons();
  updateStateMachine();
}
```

## 六、DRY RUN狀態轉換測試

DRY RUN不接任何模組或外部電源，只接USB。Verify、Upload後開啟115200 baud
Serial Monitor，行結尾設Newline。

### 正常流程

1. 開機後應顯示`mode=dry_run`及`state=IDLE`。
2. 輸入`start`，應由READY進入ACTIVE。
3. 在10秒內輸入`trigger`，應進入RESULT，再自動回IDLE。
4. 輸入`status`，確認目前是IDLE。

### 錯誤與復原

1. 再輸入`start`，進入ACTIVE後不要輸入`trigger`。
2. 超過`ACTIVE_TIMEOUT_MS`後應進入ERROR，reason為`active_timeout`。
3. ERROR中直接輸入`reset`，應得到`command_rejected reason=clear_required`。
4. 依序輸入`clear`與`reset`，確認回到IDLE。
5. 再進入ACTIVE並輸入`stop`，應立即進ERROR並顯示`manual_stop`；直接
   `reset`仍應被拒絕，再依序輸入`clear`與`reset`回到IDLE。
6. 輸入`fault`；應立即進ERROR並顯示
   `simulated_sensor_fault`。
7. fault仍存在時直接輸入`reset`，應得到
   `command_rejected reason=sensor_fault_active`。
8. 先輸入`clear`，再輸入`reset`，才能回IDLE。
9. 在不允許的狀態輸入`trigger`，應得到`command_rejected`。

切換到實體模式後另做安全測試：按住STOP不放，再輸入`clear`與`reset`，系統必須
保持ERROR，並回報`physical_stop_active`。放開STOP、確認其他故障條件消失後，
才可再次執行clear與reset。

DRY RUN完成條件是狀態順序與state table一致，而且timeout期間Serial仍可接受命令，
沒有使用長時間`delay()`阻塞整個loop。

## 七、啟用實體模式

只有Week 3、4 profile、第二顆STOP profile及完整接線都通過時才執行：

1. 儲存DRY RUN程式與log。
2. USB拔除、電池盒OFF並取出一顆電池。
3. 將`DRY_RUN`改為`false`。
4. 依profile填入START與STOP GPIO、其他GPIO、ON level、門檻、有效raw範圍、目標光線狀態、servo
   pulse width、安全最小／HOME／目標／最大角度及動作時間。
5. Verify成功後，重新依接線表正向、反向各檢查一次。
6. 裝回電池但保持OFF；接USB並確認`mode=hardware`、IDLE及沒有自動舵機動作。
7. 確認程式正常後才把電池盒切到ON。

如果看到`status=blocked reason=config_missing`，保持電池盒OFF並核對profile，不能
把`-1`任意改成看似合理的數字。

## 八、三次正常流程

每次測試都從IDLE開始：

1. 固定與Week 3校正相同的光線環境。
2. 按一下START，確認READY藍燈後進入ACTIVE黃燈；不要以STOP開始流程。
3. 改變光線到profile指定的目標狀態並保持穩定。
4. 連續三筆符合條件後，確認RESULT綠燈、蜂鳴器短聲、SG90移到安全目標、
   返回HOME並detach。
5. 確認系統自動回IDLE，舵機沒有持續收到控制脈波。
6. 將每次開始、命中條件、舵機完成及回IDLE的uptime填入support。
7. 若任一步不同，電池盒OFF、USB拔除，保留失敗log後再排查；不在同一筆紀錄
   中途偷偷改門檻。

## 九、故障、restart與恢復

1. **實體STOP**：從IDLE按START，進入ACTIVE後按STOP，程式應在下一次本機
   輸入處理時進ERROR、
   舵機detach並顯示`reason=physical_stop`。輸入`clear`後再`reset`，完成一次正常
   流程；下一次舵機開始受限動作後，再按STOP，確認仍會detach，並記錄從按下
   到ERROR log的最長觀察時間。若來不及按，不延長舵機動作時間，
   保留ACTIVE階段的STOP證據即可。
2. **安全感測故障**：使用Serial輸入`fault`，不必拔除感測線。程式應進ERROR、
   舵機detach、紅燈及短聲。輸入`clear`後再`reset`才可恢復。
3. **ACTIVE timeout**：在不符合目標的安全光線下開始，保持條件直到ERROR，
   reason應為`active_timeout`。
4. **restart**：電池盒先OFF，再按RESET。重新開機必須從IDLE開始，不重播舊動作。
5. **低電壓或抖動**：不故意使用不合格電池。若自然出現，立即OFF並記錄；不為了
   製造作業證據反覆供電。
6. **恢復**：故障清除、電壓與接線正常後，完成一次完整正常流程。

KY-018訊號線拔除不一定能產生可辨識的固定錯誤值，因此不把硬體拔線當作唯一
感測故障測試。這項限制必須保留在Lab Note。

## 十、修改一項規則

先選一項，寫預測，再修改並重做三次正常流程與一次ERROR測試：

1. 將目標由BRIGHT改成DARK，使用同一組已驗證門檻。
2. 將`REQUIRED_MATCHES`由3增加為5，比較誤觸發與反應時間。
3. 縮短ACTIVE timeout，但不得短到無法正常操作。
4. 修改RGB配色，不改變狀態名稱與事件欄位。
5. 縮小SG90目標角度，不得超出Week 4安全範圍。
6. 增加一次按鈕在ACTIVE狀態被拒絕的事件log。

每次只改一項；不要同時更換GPIO、供電、library及門檻。

## 十一、故障排查表

| 現象 | 第一個安全動作 | 後續檢查 | 不要做 |
|---|---|---|---|
| `config_missing` | 電池盒保持OFF | 核對Week 3、4 profile與所有`-1` | 不猜設定 |
| DRY RUN不轉移 | 保留Serial | 核對命令、行結尾與當前state | 不接硬體試錯 |
| 按鈕無反應 | 電池盒OFF、拔USB | 核對INPUT_PULLUP、GPIO及GND | 不帶電改線 |
| 光線永遠不觸發 | 保留raw log | 核對direction、threshold、target及環境 | 不直接改數字 |
| 立即`sensor_invalid` | 電池盒OFF、拔USB | 核對valid範圍、訊號及Week 3資料 | 不擴大範圍掩蓋斷線 |
| ACTIVE進入timeout | 保留完整log | 比較實際raw與目標條件 | 不移除timeout |
| RGB或蜂鳴器殘留 | 電池盒OFF、拔USB | 核對每個enterState是否設定全部輸出 | 不只補一個digitalWrite |
| SG90抖動、卡住或重啟 | 立即電池盒OFF，再拔USB | 核對負載電壓、共地及Week 4 profile | 不連續重試 |
| RESULT不回IDLE | 電池盒OFF | 核對servo phase、deadline與timeout log | 不延長無限等待 |
| ERROR無法reset | 先輸入`clear` | 核對fault旗標及當前state | 不反覆按硬體RESET |
| restart自動動作 | 立即電池盒OFF | 核對上傳程式、DRY_RUN及啟動狀態 | 不接機構測試 |

## 十二、繳交內容

1. 完成的狀態圖與狀態表。
2. DRY RUN正常、timeout、fault、clear及reset log。
3. Week 3與Week 4 profile來源、START／STOP及完整接線表與上電前照片。
4. 三次正常流程的state、raw、result與uptime紀錄。
5. 實體STOP、感測故障、timeout、restart及恢復證據。
6. 修改前預測、程式差異、三次結果與一次ERROR比較。
7. 後續網路單元事件欄位表與每種event範例。
8. 完整sketch及Lab Note，包含仍未驗證的限制。

## 十三、完成檢核與復原

- [ ] DRY RUN與實體模式使用相同的五個狀態名稱及轉移規則。
- [ ] 三次正常流程都從IDLE開始、經READY／ACTIVE／RESULT並回IDLE。
- [ ] fault、timeout及restart不會讓舵機持續收到控制脈波。
- [ ] 第二顆實體STOP按鈕在ACTIVE時會於下一次本機輸入處理進ERROR；已記錄
      最長觀察反應時間，且STOP與START使用不同GPIO。
- [ ] ERROR必須先清除原因，再reset，不能自動假裝恢復。
- [ ] 修改後仍通過三次正常流程與一次ERROR測試。
- [ ] 八個後續網路單元事件欄位名稱、型別與意義已固定。

復原順序：電池盒OFF，取出四顆電池，拔USB，先拆電池正極與SG90 V+，再拆
signal、低功率電源及所有GND。確認安全端子沒有裸銅，分別收納舵機、模組、
ESP32、線材與電池。

## 參考資料

- [ESP32Servo official repository](https://github.com/madhephaestus/ESP32Servo)
- [Week 2～5硬體教材藍圖](../../course_materials/hardware_course_material_plan.md)
