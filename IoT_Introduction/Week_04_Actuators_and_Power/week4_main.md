# Week 4：致動器、外部供電與安全停止實驗

日期：2026-09-30

本週使用KY-016 RGB LED、KY-012有源蜂鳴器、SG90舵機及4AA帶開關電池盒，
比較「GPIO控制訊號」與「致動器工作電源」。完成後，RGB與蜂鳴器能表達系統
狀態，SG90只能在已驗證的角度、供電及時間限制內動作；錯誤命令、timeout或
重啟時，程式與操作流程都必須回到安全狀態。

> 驗證狀態：指定KY-016、KY-012、SG90、AA電池種類、安全轉接端子、GPIO、
> ESP32Servo版本、脈波範圍、安全角度及負載電壓仍為`unverified`。本章程式
> 使用`-1`作為未公布設定，會安全拒絕控制。教師完成target test並在
> `docs/hardware_state.md`公布Week 4 hardware profile前，不得自行填值、接上
> 電池或讓舵機動作。

## 一、Unit Overview

### Teaching Objectives

By the end of this unit, students will be able to:

1. Distinguish a GPIO control signal from the external power required by an actuator.
2. Identify the signal, power, and ground connections of RGB, buzzer, servo, and battery
   components from their physical labels.
3. Use RGB and buzzer output to represent READY, ACTIVE, SUCCESS, and ERROR states.
4. Measure battery polarity, open-circuit voltage, and servo operating voltage with a
   multimeter.
5. Build a common-ground circuit in which the servo uses an approved external power
   source and the ESP32-S3 supplies only the control signal.
6. Apply verified angle, pulse-width, motion-time, cooldown, and restart limits to an
   SG90 command.
7. Use Serial evidence to distinguish an applied, completed, stopped, or rejected
   actuator command.

### Teaching Content

This unit introduces actuators that produce light, sound, and physical motion. Students
will first test low-power indicators and connect each visible or audible state to a
specific program state. They will then examine why a servo cannot be powered from a GPIO
pin and how external power, polarity, voltage under load, and common ground affect the
complete circuit.

The servo activity uses a verified hardware profile rather than assumed angles or pin
numbers. Commands are checked before motion begins, repeated commands are limited, and
the control signal is detached after a bounded sequence. Students will compare normal
motion, rejected input, timeout, restart, and power-related faults while preserving
measurements and Serial logs as evidence.

### 核心實驗流程

| 階段 | 開始前狀態 | 實驗內容 | 完成條件 |
|---:|---|---|---|
| 1 | 所有電源關閉 | 辨識元件、線色、絲印及profile | 實物表完成；未驗證欄位不猜測 |
| 2 | 只使用USB與3.3V | RGB與蜂鳴器狀態 | READY、ACTIVE、SUCCESS、ERROR可分辨 |
| 3 | 電池盒OFF、舵機未接 | 極性與空載電壓 | 極性、電池種類及空載電壓有紀錄 |
| 4 | USB正常、電池盒OFF | 外部供電、共地與SG90接線 | 正向、反向接線檢查通過 |
| 5 | 舵機不帶機構 | 受限動作與負載電壓 | 動作、返回、停止及負載電壓有證據 |
| 6 | 正常動作已保存 | 拒絕、timeout與重啟 | 不安全命令不執行；異常時可立即斷電 |
| 7 | 全部測試完成 | 復原與收納 | 電池取出、USB拔除、外露端子已隔離 |

## 二、器材、軟體與前置條件

| 品項 | 數量 | 用途 |
|---|---:|---|
| ESP32-S3-DevKitC-1 N16R8 | 1 | 控制訊號與Serial紀錄 |
| KY-016 RGB LED模組 | 1 | READY、ACTIVE、SUCCESS、ERROR狀態 |
| KY-012有源蜂鳴器模組 | 1 | 短聲提示與錯誤警示 |
| SG90 180度舵機 | 1 | 受限角度動作 |
| 四腳輕觸按鈕 | 1 | 要求一次舵機動作 |
| 400孔麵包板 | 1 | 3V3、GND及外部電源分接 |
| 公對公、公對母、母對母杜邦線 | 各若干 | 依模組接頭與麵包板連接 |
| 4AA帶開關電池盒 | 1 | 經驗證後供應舵機工作電源 |
| 課堂核准的AA電池 | 4 | 電池種類須與Week 4 profile一致 |
| 電池盒安全轉接端子 | 1組 | 固定正負導線，避免裸線短路 |
| USB資料線、筆電與充電器 | 各1 | Upload、Serial與紀錄 |
| 萬用電表 | 課堂輪用 | 極性、空載及負載電壓 |

本週不使用WS2812、MG90S、LM2596、6AA電池盒、L298N或DC馬達。斜口鉗與
剝線鉗不列每位學生必備；未公布已驗證的端子加工程序時，不自行剪線、剝線
或處理電池盒導線。安全轉接端子必須是教師完成target test後公布的型號。

軟體條件：Week 2的Verify、Upload及Serial Monitor已通過；Arduino IDE可開啟
Library Manager。SG90段落使用`ESP32Servo`，版本必須與Week 4 hardware profile
相同。版本未公布或無法安裝時，先完成RGB與蜂鳴器，不自行改用其他library。

### Week 4 hardware profile

開始操作前，將`docs/hardware_state.md`中已完成target test的數值抄入
[Week 4支援資料](week4_support.md)。下列任一欄仍空白時，不得上電測試相應元件：

- RGB紅、綠、藍GPIO及ON邏輯準位。
- KY-012訊號GPIO、VCC接法及ON邏輯準位。
- 按鈕GPIO與接法。
- SG90訊號GPIO、library版本、pulse width範圍。
- 安全最小角度、HOME角度、安全最大角度、單段動作時間與整體timeout。
- AA電池種類、允許空載／負載電壓及低電量停止值。
- 電池盒正負端、安全轉接方式與量測點。

## 三、安全原則與關鍵名詞

### GPIO訊號不是工作電源

GPIO輸出HIGH或LOW是控制訊號，只能提供有限電流。RGB與經驗證的低功率模組
可依接線表使用GPIO控制；SG90的紅色電源線不得接到GPIO或ESP32的3V3腳。

### 外部電源與共地

**外部電源**是ESP32以外、專門供應負載的電源。本週ESP32由USB供電，SG90由
核准的4AA方案供電。電池盒正極只供應舵機，不接ESP32的3V3、5V或任何GPIO。

**共地（common ground）**表示電池負極、SG90 GND與ESP32 GND連在同一個參考
點。沒有共地時，ESP32送出的控制訊號對舵機可能沒有明確參考；但共地不代表
可以把兩個電源正極相連。

```text
ESP32 GPIO_SERVO ---------------- SG90 signal

4AA approved positive ----------- SG90 V+
4AA negative ----+--------------- SG90 GND
                 |
ESP32 GND -------+

禁止：4AA positive → ESP32 3V3／5V／GPIO
```

### 上電與斷電順序

1. 接線、改線、通斷或電阻量測前，USB拔除、電池盒OFF並取出至少一顆電池。
2. 完成接線後，先裝回電池但保持電池盒OFF。
3. 先接USB，確認程式顯示`status=ready`，再開啟電池盒。
4. 發現抖動、卡住、反覆重啟、電壓快速下降、發熱、異味或異常聲音，立即將
   電池盒切到OFF，再拔USB。
5. 結束時先關閉電池盒並取出電池，再拔USB。

`servo.detach()`只停止控制脈波，不等於切斷舵機電源。若舵機卡住或持續發熱，
真正的安全停止是把電池盒切到OFF。

## 四、辨識元件與建立接線紀錄

USB與電池均保持斷開。將四個元件正反面放在桌上，逐項填寫support中的實物表。

### KY-016 RGB LED

找到LED、三個色彩控制腳及共用腳。腳位可能標示`R`、`G`、`B`、`-`或其他
符號；不得依購物圖的左右順序猜測。確認模組上是否可見限流電阻。若無法確認
共陰／共陽或限流元件，停止該段，不直接接GPIO試錯。

### KY-012有源蜂鳴器

找到`S`、`+`、`-`或實物上的等效絲印，記錄模組究竟使用獨立VCC與signal，
還是其他接法。有源蜂鳴器在固定控制準位下自行發聲，不使用`tone()`產生音高。
腳位不清楚時不得上電。

### SG90與4AA電池盒

記錄SG90三條線的實際顏色與標示，不只背誦常見配色。記錄電池盒開關、電池
方向圖、兩條輸出線及安全轉接端子。電池盒導線有裸銅、鬆脫或破皮時不裝電池。

## 五、RGB與蜂鳴器狀態測試

本段不接SG90，也不在電池盒內放電池。ESP32只由USB供電。

### 步驟1：建立低功率接線

1. USB保持拔除。
2. 在麵包板建立`P3V3`與`PGND`兩個分開的五孔組。
3. ESP32 3V3接到`P3V3`，ESP32 GND接到`PGND`。
4. 依實物絲印及profile，把RGB共用電源腳接到指定電源或GND，R、G、B分別
   接到已驗證GPIO。
5. 依profile接KY-012 VCC、GND及signal。
6. 從ESP32腳位沿線正向檢查到模組，再由模組反向檢查回ESP32。
7. 確認沒有線接到5V、SG90或電池盒後，拍攝俯視照片。

接線表中的GPIO與邏輯準位必須取自hardware profile。主程式保留`-1`時只會
顯示`config_missing`，不會驅動任何腳位。

### 步驟2：建立狀態提示程式

建立`week4_indicators`，貼上程式，再依profile替換七個`-1`：

```cpp
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int PIN_BUZZER = -1;
const int RGB_ON_LEVEL = -1;
const int BUZZER_ON_LEVEL = -1;
const int BUZZ_DURATION_MS = -1;

unsigned long buzzerOffAt = 0;

bool allPinsUnique(const int *pins, size_t count) {
  for (size_t left = 0; left < count; left++)
    for (size_t right = left + 1; right < count; right++)
      if (pins[left] == pins[right]) return false;
  return true;
}

bool profileReady() {
  const int pins[] = {PIN_RGB_R, PIN_RGB_G, PIN_RGB_B, PIN_BUZZER};
  bool pinsReady = PIN_RGB_R >= 0 && PIN_RGB_G >= 0 &&
                   PIN_RGB_B >= 0 && PIN_BUZZER >= 0;
  bool levelsReady = (RGB_ON_LEVEL == LOW || RGB_ON_LEVEL == HIGH) &&
                     (BUZZER_ON_LEVEL == LOW || BUZZER_ON_LEVEL == HIGH);
  return pinsReady && allPinsUnique(pins, 4) && levelsReady &&
         BUZZ_DURATION_MS >= 20 && BUZZ_DURATION_MS <= 500;
}

int offLevel(int onLevel) {
  return onLevel == HIGH ? LOW : HIGH;
}

void setRgb(bool red, bool green, bool blue) {
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
}

void startBuzz() {
  digitalWrite(PIN_BUZZER, BUZZER_ON_LEVEL);
  buzzerOffAt = millis() + BUZZ_DURATION_MS;
}

void applyState(char command) {
  if (command == 'r') {
    setRgb(false, false, true);
    Serial.println("state=READY rgb=blue buzzer=off");
  } else if (command == 'a') {
    setRgb(true, true, false);
    Serial.println("state=ACTIVE rgb=yellow buzzer=off");
  } else if (command == 's') {
    setRgb(false, true, false);
    startBuzz();
    Serial.println("state=SUCCESS rgb=green buzzer=short");
  } else if (command == 'e') {
    setRgb(true, false, false);
    startBuzz();
    Serial.println("state=ERROR rgb=red buzzer=short");
  } else if (command == 'o') {
    setRgb(false, false, false);
    Serial.println("state=OFF rgb=off buzzer=off");
  } else {
    Serial.printf("result=rejected reason=unknown_command value=%c\n", command);
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!profileReady()) {
    Serial.println("week=4 indicators status=blocked reason=config_missing");
    return;
  }
  pinMode(PIN_RGB_R, OUTPUT);
  pinMode(PIN_RGB_G, OUTPUT);
  pinMode(PIN_RGB_B, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
  setRgb(false, false, false);
  Serial.println("week=4 indicators status=ready commands=r,a,s,e,o");
}

void loop() {
  if (!profileReady()) return;
  if (buzzerOffAt != 0 && (long)(millis() - buzzerOffAt) >= 0) {
    digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
    buzzerOffAt = 0;
  }
  if (Serial.available() == 0) return;
  char command = tolower(Serial.read());
  while (Serial.available() > 0) Serial.read();
  applyState(command);
}
```

### 步驟3：Verify、Upload與狀態測試

1. 在Arduino IDE沿用Week 2已驗證的Board與Port。
2. Verify、Upload，開啟115200 baud的Serial Monitor，行結尾設Newline。
3. 如果看到`status=blocked reason=config_missing`，停止操作並核對profile，不猜GPIO。
4. 看到`status=ready`後，依序輸入`r`、`a`、`s`、`e`、`o`。
5. 將實際顏色、蜂鳴時間與Serial文字填入support。顏色錯誤時先保存現象，拔USB
   後核對R、G、B；蜂鳴器持續發聲時立即拔USB，再核對ON邏輯準位。

本段完成條件是五個命令都有對應log，四個狀態可分辨，蜂鳴器只短聲且最後能
完全停止。

## 六、4AA極性與空載電壓

本段只量電池盒，不接ESP32、SG90或麵包板。

1. 確認電池盒開關OFF，導線已固定在課堂核准的安全端子中。
2. 依電池盒方向圖裝入hardware profile指定的四顆AA電池；不要混用種類、品牌、
   新舊程度或充電狀態不同的電池。
3. 萬用電表黑表筆插`COM`，紅表筆插`VΩmA`，切到可涵蓋預期值的DCV檔。
4. 黑表筆接profile標示的負端測試點，紅表筆接正端測試點。
5. 將電池盒短暫切到ON並讀值。負號表示表筆測點相反，不代表可以交換電池盒
   導線；先切回OFF再核對標示。
6. 記錄空載電壓後立即切回OFF。
7. 數值不在profile公布的允許範圍、跳動明顯、端子鬆動或導線發熱時，取出
   電池並停止本週舵機段落。

**空載電壓**是在尚未接負載時量到的電壓；它不能證明接上舵機後仍然穩定。
舵機動作時的電壓稱為**負載電壓**，必須在後面另外量測。

## 七、SG90外部供電、共地與安全動作

只有hardware profile、空載電壓及安全轉接全部通過時才能進入本節。舵機先不裝
搖臂、連桿、閘門或其他機構，周圍保留不會碰撞物品的空間。

### 步驟1：安裝ESP32Servo

1. 選擇 **Tools > Manage Libraries...**。
2. 搜尋`ESP32Servo`。
3. 核對作者及profile指定版本後安裝，不自動改用其他同名library。
4. 將實際版本寫入support。

`ESP32Servo.h: No such file or directory`表示library尚未安裝在目前IDE環境；先處理
Library Manager，不改GPIO或電源線。

### 步驟2：建立按鈕與舵機接線

USB拔除、電池盒OFF並取出一顆電池：

1. 按鈕一側接profile指定的`PIN_BUTTON`，另一側接ESP32 GND；程式使用
   `INPUT_PULLUP`，未按下讀到HIGH、按下接GND後讀到LOW。
2. SG90 signal接profile指定的`PIN_SERVO`。
3. SG90 V+只接安全轉接端子的電池正極。
4. SG90 GND接電池負極。
5. 再用一條線把電池負極接到ESP32 GND，形成共地。
6. 正向檢查GPIO→signal、電池正極→V+、電池負極→SG90 GND及ESP32 GND。
7. 從SG90三條線反向檢查回來源，確認電池正極沒有接ESP32。
8. 拍攝能看清端點、轉接端子、按鈕及電池盒OFF狀態的俯視照片。

### 步驟3：建立安全控制程式

建立`week4_safe_servo`，貼上程式。依profile替換所有`-1`；`DEVICE_ID`改成課堂
指定代碼，不使用姓名或學號。

```cpp
#include <ESP32Servo.h>

const char* DEVICE_ID = "student01";
const int PIN_BUTTON = -1;
const int PIN_SERVO = -1;
const int PIN_RGB_R = -1;
const int PIN_RGB_G = -1;
const int PIN_RGB_B = -1;
const int PIN_BUZZER = -1;
const int RGB_ON_LEVEL = -1;
const int BUZZER_ON_LEVEL = -1;
const int SERVO_MIN_US = -1;
const int SERVO_MAX_US = -1;
const int SAFE_MIN_ANGLE = -1;
const int SAFE_HOME_ANGLE = -1;
const int SAFE_MAX_ANGLE = -1;
const long SERVO_HOLD_MS = -1;
const long SEQUENCE_TIMEOUT_MS = -1;
const long COMMAND_COOLDOWN_MS = -1;
const int BUZZ_DURATION_MS = -1;

Servo servo;
enum MotionPhase { IDLE, MOVING_TO_TARGET, RETURNING_HOME };
MotionPhase motionPhase = IDLE;
unsigned long phaseDeadline = 0;
unsigned long sequenceStartedAt = 0;
unsigned long lastCommandAt = 0;
unsigned long buzzerOffAt = 0;
bool hasAcceptedCommand = false;

bool allPinsUnique(const int *pins, size_t count) {
  for (size_t left = 0; left < count; left++)
    for (size_t right = left + 1; right < count; right++)
      if (pins[left] == pins[right]) return false;
  return true;
}

bool profileReady() {
  const int pins[] = {
    PIN_BUTTON, PIN_SERVO, PIN_RGB_R, PIN_RGB_G, PIN_RGB_B, PIN_BUZZER
  };
  bool pinsReady = PIN_BUTTON >= 0 && PIN_SERVO >= 0 && PIN_RGB_R >= 0 &&
                   PIN_RGB_G >= 0 && PIN_RGB_B >= 0 && PIN_BUZZER >= 0;
  bool levelsReady = (RGB_ON_LEVEL == LOW || RGB_ON_LEVEL == HIGH) &&
                     (BUZZER_ON_LEVEL == LOW || BUZZER_ON_LEVEL == HIGH);
  bool angleReady = SAFE_MIN_ANGLE >= 0 &&
                    SAFE_MIN_ANGLE <= SAFE_HOME_ANGLE &&
                    SAFE_HOME_ANGLE <= SAFE_MAX_ANGLE && SAFE_MAX_ANGLE <= 180;
  bool pulseReady = SERVO_MIN_US >= 500 && SERVO_MAX_US <= 2500 &&
                    SERVO_MIN_US < SERVO_MAX_US;
  bool timeReady = SERVO_HOLD_MS >= 100 && SERVO_HOLD_MS <= 2000 &&
                   SEQUENCE_TIMEOUT_MS >= SERVO_HOLD_MS * 2 + 100 &&
                   COMMAND_COOLDOWN_MS >= 500 &&
                   BUZZ_DURATION_MS >= 20 && BUZZ_DURATION_MS <= 500;
  return pinsReady && allPinsUnique(pins, 6) && levelsReady &&
         angleReady && pulseReady && timeReady;
}

int offLevel(int onLevel) {
  return onLevel == HIGH ? LOW : HIGH;
}

void setRgb(bool red, bool green, bool blue) {
  digitalWrite(PIN_RGB_R, red ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_G, green ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
  digitalWrite(PIN_RGB_B, blue ? RGB_ON_LEVEL : offLevel(RGB_ON_LEVEL));
}

void startBuzz() {
  digitalWrite(PIN_BUZZER, BUZZER_ON_LEVEL);
  buzzerOffAt = millis() + BUZZ_DURATION_MS;
}

void detachServo(const char* result, const char* reason) {
  if (servo.attached()) servo.detach();
  motionPhase = IDLE;
  if (hasAcceptedCommand) lastCommandAt = millis();
  Serial.printf("device=%s event=actuator_result result=%s reason=%s\n",
                DEVICE_ID, result, reason);
}

void rejectCommand(int requestedAngle, const char* reason) {
  setRgb(true, false, false);
  startBuzz();
  Serial.printf("device=%s event=actuator_command requested_angle=%d "
                "applied_angle=none result=rejected reason=%s\n",
                DEVICE_ID, requestedAngle, reason);
}

void startSequence(int requestedAngle, const char* source) {
  unsigned long now = millis();
  if (motionPhase != IDLE) {
    rejectCommand(requestedAngle, "busy");
    return;
  }
  if (hasAcceptedCommand && now - lastCommandAt < COMMAND_COOLDOWN_MS) {
    rejectCommand(requestedAngle, "cooldown");
    return;
  }
  if (requestedAngle < SAFE_MIN_ANGLE || requestedAngle > SAFE_MAX_ANGLE) {
    rejectCommand(requestedAngle, "out_of_range");
    return;
  }

  servo.setPeriodHertz(50);
  servo.attach(PIN_SERVO, SERVO_MIN_US, SERVO_MAX_US);
  servo.write(requestedAngle);
  motionPhase = MOVING_TO_TARGET;
  phaseDeadline = now + SERVO_HOLD_MS;
  sequenceStartedAt = now;
  lastCommandAt = now;
  hasAcceptedCommand = true;
  setRgb(true, true, false);
  Serial.printf("device=%s event=actuator_command source=%s requested_angle=%d "
                "applied_angle=%d result=applied reason=none\n",
                DEVICE_ID, source, requestedAngle, requestedAngle);
}

void updateMotion() {
  if (motionPhase == IDLE) return;
  unsigned long now = millis();
  if (now - sequenceStartedAt >= (unsigned long)SEQUENCE_TIMEOUT_MS) {
    setRgb(true, false, false);
    startBuzz();
    detachServo("stopped", "timeout");
    return;
  }
  if ((long)(now - phaseDeadline) < 0) return;

  if (motionPhase == MOVING_TO_TARGET) {
    servo.write(SAFE_HOME_ANGLE);
    motionPhase = RETURNING_HOME;
    phaseDeadline = now + SERVO_HOLD_MS;
    Serial.printf("device=%s event=actuator_return applied_angle=%d\n",
                  DEVICE_ID, SAFE_HOME_ANGLE);
  } else {
    setRgb(false, true, false);
    startBuzz();
    detachServo("done", "none");
  }
}

void readButton() {
  static bool lastRawPressed = false;
  static bool stablePressed = false;
  static unsigned long changedAt = 0;
  bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  unsigned long now = millis();
  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAt = now;
  }
  if (now - changedAt >= 30 && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    if (stablePressed) startSequence(SAFE_MAX_ANGLE, "button");
  }
}

void readSerialCommand() {
  if (Serial.available() == 0) return;
  String command = Serial.readStringUntil('\n');
  command.trim();
  if (command == "test_timeout") {
    if (motionPhase != IDLE) {
      rejectCommand(SAFE_HOME_ANGLE, "busy");
      return;
    }
    unsigned long now = millis();
    servo.setPeriodHertz(50);
    servo.attach(PIN_SERVO, SERVO_MIN_US, SERVO_MAX_US);
    servo.write(SAFE_HOME_ANGLE);
    motionPhase = MOVING_TO_TARGET;
    phaseDeadline = now + SERVO_HOLD_MS;
    sequenceStartedAt = now - (unsigned long)SEQUENCE_TIMEOUT_MS;
    lastCommandAt = now;
    hasAcceptedCommand = true;
    setRgb(true, true, false);
    Serial.printf("device=%s event=timeout_test result=armed applied_angle=%d\n",
                  DEVICE_ID, SAFE_HOME_ANGLE);
  } else if (command == "home") {
    startSequence(SAFE_HOME_ANGLE, "serial");
  } else if (command == "stop") {
    setRgb(true, false, false);
    detachServo("stopped", "manual_stop");
  } else if (command.startsWith("move ")) {
    String valueText = command.substring(5);
    bool validNumber = valueText.length() > 0 && valueText.length() <= 4;
    bool hasDigit = false;
    for (unsigned int i = 0; i < valueText.length(); i++) {
      if (isDigit(valueText[i])) hasDigit = true;
      else if (!(i == 0 && valueText[i] == '-')) {
        validNumber = false;
      }
    }
    if (!validNumber || !hasDigit) rejectCommand(-1, "invalid_format");
    else startSequence(valueText.toInt(), "serial");
  } else {
    rejectCommand(-1, "unknown_command");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  if (!profileReady()) {
    Serial.println("week=4 servo status=blocked reason=config_missing");
    return;
  }
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_RGB_R, OUTPUT);
  pinMode(PIN_RGB_G, OUTPUT);
  pinMode(PIN_RGB_B, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
  setRgb(false, false, true);
  Serial.println("week=4 servo status=ready external_power=off");
  Serial.println("commands: home, move <angle>, stop, test_timeout");
}

void loop() {
  if (!profileReady()) return;
  if (buzzerOffAt != 0 && (long)(millis() - buzzerOffAt) >= 0) {
    digitalWrite(PIN_BUZZER, offLevel(BUZZER_ON_LEVEL));
    buzzerOffAt = 0;
  }
  readButton();
  readSerialCommand();
  updateMotion();
}
```

### 步驟4：先以電池盒OFF完成程式驗收

1. 電池盒保持OFF，先裝回電池。
2. 接USB，Verify、Upload並開啟115200 baud Serial Monitor。
3. 看到`status=blocked`時不開電池盒，回頭核對所有profile值。
4. 看到`status=ready external_power=off`後，先輸入`move 200`。程式必須輸出
   `result=rejected reason=out_of_range`，舵機不得動作。
5. 再輸入`move abc`，必須得到`reason=invalid_format`。
6. 只有拒絕測試正確時，才進入上電測試。

### 步驟5：首次舵機上電與小範圍動作

1. 確認舵機未接任何機構，所有人的手離開舵機軸。
2. 將電池盒切到ON並觀察數秒。若舵機立即連續轉動、抖動、發熱或ESP32重啟，
   立刻切回OFF並拔USB。
3. 正常時輸入`home`，確認只在profile的HOME附近完成一次受限動作後停止脈波。
4. 輸入profile允許範圍內、接近HOME的小角度，例如由profile指定的首次測試值；
   不自行使用0或180。
5. 每次命令後等待完整`result=done`，不可用手阻擋舵機。
6. 按一下按鈕，確認只接受一次命令；快速重複按壓應得到`busy`或`cooldown`。

### 步驟6：量測負載電壓

負載電壓量測必須保持接線不動。黑表筆固定在安全轉接端子的電池負端測試點，
紅表筆固定在正端測試點；表筆不得直接探舵機三腳接頭。

1. 電池盒ON但舵機閒置時，記錄一次電壓。
2. 一人輸入已驗證的小範圍命令，另一人只看表值並記錄動作期間最低穩定讀值。
3. 電壓低於profile停止值、明顯跳動、ESP32重啟或舵機異常時，立即OFF。
4. 將空載、閒置及動作電壓填入support，不把瞬間看不清的數字編造成紀錄。

## 八、拒絕、timeout、重啟與恢復

依序完成並保存Serial log與實物狀態：

1. **out_of_range**：輸入超出安全角度的命令，確認沒有`applied`。
2. **cooldown／busy**：在動作尚未結束或冷卻期內再次要求動作，確認新命令被拒絕。
3. **manual_stop**：動作開始後輸入`stop`，確認脈波停止；再把電池盒切到OFF。
4. **timeout**：先保持電池盒OFF並輸入`test_timeout`。程式會把舵機控制設在
   HOME，接著以測試用的逾時起點立即走到既有timeout分支；預期依序看到
   `event=timeout_test result=armed`與`event=actuator_result result=stopped reason=timeout`。
   這個命令只建立可重現的程式逾時，不代表真實機械故障。只有hardware profile
   另外核准「舵機不接機構、保持HOME」的實機方法時，才可在電池盒ON狀態重做；
   不以手卡住舵機，也不延長動作時間製造故障。
5. **restart**：電池盒先OFF，再按RESET。確認重新開機只有READY狀態，沒有自動
   執行上一筆命令；確認後才重新開啟電池盒。
6. **恢復**：回到正常命令，完成一次target→HOME→detach流程並保存`result=done`。

## 九、變化實作

先寫預測，再修改一項並重新測試：

1. 比較兩種不超過profile上限的蜂鳴時間，確認最後都能停止。
2. 改變READY、ACTIVE、SUCCESS、ERROR的RGB配色，說明為何仍可清楚區分。
3. 延長`COMMAND_COOLDOWN_MS`，比較快速按鈕命令的拒絕數量。
4. 將安全最大角度縮小，不得擴大，驗證原本允許的命令是否被拒絕。
5. 新增`status`命令，輸出目前motion phase、servo attached狀態與剩餘timeout。
6. 設計一個不接機構、不阻擋舵機的安全故障測試，先寫風險與停止方式再執行。

## 十、故障排查表

| 現象 | 第一個安全動作 | 後續檢查 | 不要做 |
|---|---|---|---|
| `config_missing` | 電池盒保持OFF | 核對hardware profile及每個`-1` | 不猜GPIO或角度 |
| RGB顏色錯誤 | 拔USB | 核對R／G／B絲印、GPIO及ON level | 不帶電換線 |
| 蜂鳴器持續響 | 拔USB | 核對ON level、模組腳位與程式版本 | 不用手短接腳位 |
| 空載電壓負號 | 電池盒OFF | 核對表筆測點與端子標示 | 不交換固定導線 |
| 空載電壓超出範圍 | 電池盒OFF並取出電池 | 核對電池種類、方向與狀態 | 不接舵機試看看 |
| 舵機完全不動 | 電池盒OFF | 核對V+、GND、signal、共地及profile | 不接ESP32 5V補電 |
| 舵機抖動或ESP32重啟 | 立即OFF，再拔USB | 記錄負載電壓、接點及共地 | 不連續重試 |
| 舵機卡住或發熱 | 立即OFF | 移除機構、停止使用並回報 | 不用手強轉或持續供電 |
| `busy`／`cooldown` | 保留log | 等待序列完成及冷卻時間 | 不反覆按RESET |
| `timeout` | 立即確認電池盒可OFF | 核對時間設定及實際動作 | 不延長timeout掩蓋故障 |
| RESET後自動動作 | 立即OFF | 核對上傳程式、啟動流程及浮接訊號 | 不讓機構保持連接 |

## 十一、繳交內容

1. KY-016、KY-012、SG90與電池盒的正反面、絲印、線色及端子照片。
2. Week 4 hardware profile與實際程式常數。
3. RGB／蜂鳴器接線表、俯視照片及五種命令結果。
4. 電池種類、極性、空載、閒置與舵機動作電壓。
5. 外部電源、共地、SG90訊號與按鈕接線圖及照片。
6. 正常、out-of-range、busy／cooldown、manual stop、restart及恢復log。
7. 一次異常的斷電、檢查、修正與恢復證據。
8. 兩個sketch及Lab Note，記錄版本、未驗證限制與安全停止方式。

## 十二、完成檢核與器材復原

- [ ] 能說明GPIO訊號、舵機工作電源與共地的不同作用。
- [ ] RGB與蜂鳴器四種狀態可分辨，而且蜂鳴器最後會停止。
- [ ] 電池極性、空載及負載電壓都有可讀證據。
- [ ] 舵機只執行profile允許的角度、時間及命令。
- [ ] 不安全、重複或格式錯誤的命令會被拒絕並留下reason。
- [ ] restart不會自動重播上一筆動作，異常時能先切斷電池電源。

復原順序：將電池盒切到OFF，取出四顆電池，拔USB，先拆電池正極與舵機V+，
再拆signal及所有GND。安全轉接端子不得留下裸銅；舵機、模組、線材及電池分開
收納。電池不得留在電池盒內。

## 參考資料

- [ESP32Servo official repository](https://github.com/madhephaestus/ESP32Servo)
- [ESP32-S3-DevKitC-1 User Guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/index.html)
- [Week 2～5硬體教材藍圖](../../docs/hardware_course_material_plan.md)
