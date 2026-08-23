# Week 3：感測器與輸入品質實驗

日期：2026-09-23

本週使用KY-018光敏模組與YS-31 DHT11溫濕度模組。完成後，
Serial Monitor不只會顯示數字，還會標示單位、狀態、有效性與失敗原因。
光線門橻必須來自自己的重複量測，不直接複製別人的數字。

> 驗證狀態：本版已依Espressif官方資料選擇GPIO4作ADC輸入、GPIO5作
> DHT11資料腳。三個程式已以Arduino CLI 1.4.1、Espressif `esp32` core 3.3.11、
> `esp32:esp32:esp32s3`、DHT sensor library 1.4.7及Adafruit Unified Sensor 1.1.15
> 完成compile。`docs/hardware_state.md`中的指定板卡與模組仍為`unverified`；
> 未進行指定實物的Upload、Serial輸出、接線、量測或故障注入。

## 一、學習目標

完成實驗後，應能：

1. 分辨數位輸入、類比輸入與感測器library回傳值。
2. 依實物絲印辨識電源、GND與訊號腳，不依左右位置猜測。
3. 在遮光、室內光與手機手電筒三種條件下重複量測KY-018。
4. 計算minimum、maximum、average與spread，判斷三種分布是否重疊。
5. 依實測結果建立DARK、NORMAL與BRIGHT判斷。
6. 安裝與記錄DHT library，依取樣間隔讀取溫度與濕度。
7. 辨識讀取失敗、數值超出範圍與更新過快的現象。
8. 用`valid`與`reason`保留無效資料，不偽裝系統正常。

## 二、實驗流程

| 階段 | 開始前狀態 | 操作 | 完成條件 |
|---|---|---|---|
| A. 辨識 | USB已拔除 | 核對兩個模組絲印 | 腳位表與照片完成 |
| B. KY-018原始值 | 只接KY-018 | Upload類比讀取程式 | 光線改變時raw value可重複變化 |
| C. 光線校正 | KY-018正常 | 三種光線各取30筆 | 有min、max、average與重疊判斷 |
| D. DHT11讀取 | 斷電、拆KY-018 | 安裝library、接線、Upload | 溫濕度含單位、時間與有效狀態 |
| E. 故障注入 | 保留正常log | 斷電後移除一條訊號線 | 有故障、檢查、修正與恢復證據 |
| F. 整合 | 兩模組個別正常 | 同時接回兩模組 | 連續三筆單行log含`valid`與`reason` |

## 三、器材、軟體與前置條件

| 品項 | 數量 | 用途 |
|---|---:|---|
| ESP32-S3-DevKitC-1 N16R8，排針向下44腳 | 1 | ADC、DHT11與Serial |
| KY-018光敏模組 | 1 | 類比原始值與光線校正 |
| YS-31 DHT11模組 | 1 | 溫度、濕度與無效狀態 |
| 400孔麵包板 | 1 | 原型接線 |
| 公對母杜邦線 | 至少6條 | 模組公針接到開發板 |
| USB資料線、筆電與充電器 | 各1 | Upload、Serial與紀錄 |
| 手機手電筒 | 1 | 固定的亮光條件 |

課堂只提供萬用電表輪流量測。HC-SR501、HC-SR04、OLED、RGB、蜂鳴器、
舵機與電池盒本週不使用。

軟體條件：Arduino IDE 2、Espressif `esp32` board package，以及Adafruit的
`DHT sensor library`與`Adafruit Unified Sensor`。如尚無法Verify、Upload或開啟
Serial Monitor，先回到[Week 2主教材](../Week_02_ESP32_Hardware_Basics/week2_main.md)排除開發環境問題。

## 四、安全與資料原則

### 改線前一律斷電

1. 關閉Serial Monitor不等於斷電。
2. 將USB線從ESP32拔除。
3. 確認開發板電源指示燈熄滅。
4. 才能安裝、移除或重插杜邦線。

通斷與電阻檔只在斷電時使用。直流電壓量測需上電時，黑表筆固定在GND，
紅表筆只觸碰一個測試點，不讓筆尖橫跨兩腳。

### 本週統一使用3.3V

兩個模組都從ESP32的`3V3`腳供電，不使用`5V`或外部電池。
如果實物沒有清楚標示`S`／`OUT`、`+`／`VCC`與`-`／`GND`，
停止接線並拍照回報，不依購物圖或左右順序猜測。

### 感測數字不等於事實

數字只代表程式取得一個值。還必須檢查單位、取樣間隔、重複性、
條件間是否可分，以及斷線時是否顯示無效。

## 五、辨識兩個模組

### KY-018

KY-018的光敏電阻會隨光線改變電阻，模組將變化轉成訊號電壓。
ESP32讀到的是ADC raw value，不是lux或絕對照度。

1. 拔除USB。
2. 找到光敏電阻與三個腳位旁的絲印。
3. 將絲印寫入下表，拍攝可同時看見元件與絲印的照片。

| 實物絲印 | 作用 | 將連接到 |
|---|---|---|
| ______ | 訊號 | GPIO4／ADC |
| ______ | 電源 | 3V3 |
| ______ | 參考地 | GND |

### YS-31 DHT11

DHT11模組將溫度與相對濕度以數位通訊送給ESP32，不使用`analogRead()`。

1. 找到有通風孔的DHT11感測元件。
2. 核對模組板或附帶線材旁的腳位絲印，不依線色猜測。
3. 寫入下表並拍照。

| 實物絲印 | 作用 | 將連接到 |
|---|---|---|
| ______ | 資料 | GPIO5 |
| ______ | 電源 | 3V3 |
| ______ | 參考地 | GND |

任一模組無法確定腳位時，本階段就停止，不嘗試上電。

## 六、KY-018類比讀取與校正

### ADC、raw value與GPIO4

ADC是Analog-to-Digital Converter（類比數位轉換器）。本程式設為12-bit，
`analogRead()`預期回傳0～4095的raw value。GPIO4是ESP32-S3的ADC1腳位；
本週不保留Week 2的GPIO4按鈕線路。

### 步驟1：接線

確認USB已拔除，依功能接線：

| KY-018 | ESP32-S3 | 上電前覆核 |
|---|---|---|
| `S`或訊號 | GPIO4 | 不是5V或GND |
| `+`或VCC | 3V3 | 不是5V |
| `-`或GND | GND | 不是其他GPIO |

![KY-018與ESP32-S3接線圖](../../docs/images/wiring/week3_ky018.svg)

用手指著接線路徑：訊號→GPIO4、電源→3V3、GND→GND。
拍攝能看見模組絲印與ESP32腳位的俯視照片後，才能復電。

### 步驟2：建立校正程式

在Arduino IDE選擇 **File > New Sketch**，以 **File > Save As...** 存為
`week3_ky018_calibration`，貼上完整程式：

```cpp
const int PIN_LIGHT = 4;
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

const char* nearestLabel(int raw) {
  Profile* nearest = &darkProfile;
  int distance = abs(raw - darkProfile.average);
  Profile* candidates[] = {&normalProfile, &brightProfile};
  for (Profile* candidate : candidates) {
    int nextDistance = abs(raw - candidate->average);
    if (nextDistance < distance) {
      nearest = candidate;
      distance = nextDistance;
    }
  }
  return nearest->label;
}

void reportCurrent() {
  int raw = analogRead(PIN_LIGHT);
  if (!allReady()) {
    Serial.printf("sensor=ky018 light_raw=%d light_state=UNKNOWN "
                  "valid=false reason=not_calibrated\n", raw);
  } else if (profilesOverlap()) {
    Serial.printf("sensor=ky018 light_raw=%d light_state=UNCERTAIN "
                  "valid=false reason=profiles_overlap\n", raw);
  } else {
    Serial.printf("sensor=ky018 light_raw=%d light_state=%s "
                  "valid=true reason=none\n", raw, nearestLabel(raw));
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  analogReadResolution(12);
  Serial.println("week=3 sensor=ky018 status=ready adc_bits=12");
  Serial.println("commands: d=DARK n=NORMAL b=BRIGHT r=read");
}

void loop() {
  if (Serial.available() == 0) return;
  char command = Serial.read();
  while (Serial.available() > 0) Serial.read();

  if (command == 'd' || command == 'D') captureProfile(darkProfile);
  else if (command == 'n' || command == 'N') captureProfile(normalProfile);
  else if (command == 'b' || command == 'B') captureProfile(brightProfile);
  else if (command == 'r' || command == 'R') reportCurrent();
  else Serial.printf("command=unknown value=%c\n", command);
}
```

### 步驟3：Verify、Upload與原始值

1. 接回USB，確認 **Tools > Board**與 **Tools > Port** 沿用Week 2驗證設定。
2. 按 **Verify**，再按 **Upload**。
3. 開啟 **Tools > Serial Monitor**，baud rate設`115200`，行結尾設 **Newline**。
4. 輸入`r`。未校正前應看到：

```text
sensor=ky018 light_raw=<0至4095的實測值> light_state=UNKNOWN valid=false reason=not_calibrated
```

如無輸出，先檢查baud rate與Port，不立即改線。raw永遠0或4095時，
拔除USB後才核對訊號、3V3與GND。

### 步驟4：收集三種光線

1. **DARK**：用不透光物固定遮住光敏電阻，等2秒後送出`d`。
2. **NORMAL**：移除遮光物，保持室內光線不變，送出`n`。
3. **BRIGHT**：固定手機與模組距離，開手電筒，等2秒後送出`b`。
4. 每次保持條件不變直到`capture=done`。
5. 把三組min、max、average與spread填入[Week 3支援資料](week3_support.md)。

比較三組average，實測光線變亮時raw上升或下降。再檢查範圍是否重疊。
若重疊，程式會回報`profiles_overlap`；這是有效結果，代表當前條件不足以穩定分類。

### 步驟5：重複測試與故障

1. 在DARK、NORMAL、BRIGHT下各送出`r`三次，記錄分類。
2. 保留一筆正常log後拔除USB。
3. 只移除KY-018訊號線，保留3V3與GND，拍照後復電並送出`r`。
4. 記錄raw固定、漂動或靠近0／4095；不先假設特定數字。
5. 斷電後將訊號線恢復到GPIO4，復電、重新校正並保留正常log。

本程式無法可靠辨識所有KY-018斷線狀況，這項限制必須寫入Lab Note。

## 七、DHT11取樣與無效狀態

### 步驟1：斷電、更換線路

1. 儲存KY-018結果後拔除USB。
2. 移除KY-018的三條線並收好模組。
3. 依DHT11實物絲印接線：

| DHT11 | ESP32-S3 | 上電前覆核 |
|---|---|---|
| `S`或`OUT` | GPIO5 | 不是5V或GND |
| `+`或`VCC` | 3V3 | 不是5V |
| `-`或`GND` | GND | 不是其他GPIO |

![DHT11與ESP32-S3接線圖](../../docs/images/wiring/week3_dht11.svg)

拍攝可看見DHT11絲印、GPIO5、3V3與GND的俯視照片。

### 步驟2：安裝library

1. 選擇 **Tools > Manage Libraries...**。
2. 搜尋`DHT sensor library`，安裝作者為 **Adafruit** 的版本。
3. 一併安裝`Adafruit Unified Sensor`依賴。
4. 在Library Manager把兩個已安裝版本寫入support。

`DHT.h: No such file or directory`代表library不在當前IDE環境；先檢查Library Manager，
不改GPIO或重插線。

### 步驟3：建立程式

建立sketch並存為`week3_dht11_quality`：

```cpp
#include <DHT.h>

const int PIN_DHT = 5;
const int DHT_TYPE = DHT11;
const unsigned long SAMPLE_INTERVAL_MS = 2500;

DHT dht(PIN_DHT, DHT_TYPE);
unsigned long lastSampleMs = 0;

void reportReading(float temperatureC, float humidityPct) {
  if (isnan(temperatureC) || isnan(humidityPct)) {
    Serial.printf("device=student01 uptime_ms=%lu sensor=dht11 "
                  "temperature_c=nan humidity_pct=nan "
                  "valid=false reason=read_failed\n", millis());
    return;
  }

  bool inRange = temperatureC >= 0.0 && temperatureC <= 50.0 &&
                 humidityPct >= 20.0 && humidityPct <= 90.0;
  if (!inRange) {
    Serial.printf("device=student01 uptime_ms=%lu sensor=dht11 "
                  "temperature_c=%.1f humidity_pct=%.1f "
                  "valid=false reason=outside_dht11_range\n",
                  millis(), temperatureC, humidityPct);
    return;
  }

  Serial.printf("device=student01 uptime_ms=%lu sensor=dht11 "
                "temperature_c=%.1f humidity_pct=%.1f "
                "valid=true reason=none\n",
                millis(), temperatureC, humidityPct);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  dht.begin();
  Serial.printf("week=3 sensor=dht11 status=ready interval_ms=%lu\n",
                SAMPLE_INTERVAL_MS);
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_INTERVAL_MS) return;
  lastSampleMs = now;
  float humidityPct = dht.readHumidity();
  float temperatureC = dht.readTemperature();
  reportReading(temperatureC, humidityPct);
}
```

`NaN`是Not a Number，代表library沒有取得可當一般數值使用的結果。
`isnan()`檢查失敗，程式不把上一筆正常值當成新資料。

### 步驟4：上傳與觀察

1. 覆核VCC→3V3、GND→GND、DATA→GPIO5。
2. 接回USB，Verify、Upload，再開啟115200 baud的Serial Monitor。
3. 等待至少5筆，不對感測器吹氣、泼水或加熱。
4. 正常格式為：

```text
device=student01 uptime_ms=<實測> sensor=dht11 temperature_c=<實測> humidity_pct=<實測> valid=true reason=none
```

記錄相鄰資料的`uptime_ms`差，應約為2500 ms。如差異完全不同，
先檢查上傳的是否為正確sketch。

### 步驟5：比較過快取樣

1. 保留2500 ms的5筆記錄。
2. 將`SAMPLE_INTERVAL_MS`改為`500`，Verify、Upload後記錄10筆。
3. 比較重複值、讀取失敗或其他現象；不預先假設一定失敗。
4. 將間隔恢復為`2500`，再次Verify與Upload。

### 步驟6：斷線與恢復

1. 保留一筆`valid=true`，拔除USB。
2. 只移除DHT11資料線，拍照後復電。
3. 等至少3次取樣並保留實際log。常見格式是：

```text
device=student01 uptime_ms=<實測> sensor=dht11 temperature_c=nan humidity_pct=nan valid=false reason=read_failed
```

4. 如現象不同，記錄實際結果，不修改證據去符合範例。
5. 拔除USB，將資料線恢復到GPIO5。
6. 復電後保留至少兩筆`valid=true`。

## 八、整合兩種感測資料

本階段不傳Wi-Fi、JSON或Backend；先將本機資料整理成一致欄位。

1. 拔除USB，保留DHT11線路。
2. 將KY-018訊號接回GPIO4、VCC接3V3、GND接GND。
3. 確認3V3與GND沒有接到同一列，拍照後復電。
4. 建立`week3_combined_sensors`，貼上程式，再將三個`-1`替換為自己量得的average。

```cpp
#include <DHT.h>

const int PIN_LIGHT = 4;
const int PIN_DHT = 5;
const int DHT_TYPE = DHT11;
const unsigned long SAMPLE_INTERVAL_MS = 2500;

const int LIGHT_CENTER_DARK = -1;
const int LIGHT_CENTER_NORMAL = -1;
const int LIGHT_CENTER_BRIGHT = -1;

DHT dht(PIN_DHT, DHT_TYPE);
unsigned long lastSampleMs = 0;

bool lightCalibrated() {
  return LIGHT_CENTER_DARK >= 0 && LIGHT_CENTER_NORMAL >= 0 &&
         LIGHT_CENTER_BRIGHT >= 0;
}

const char* classifyLight(int raw) {
  int centers[] = {LIGHT_CENTER_DARK, LIGHT_CENTER_NORMAL,
                   LIGHT_CENTER_BRIGHT};
  const char* labels[] = {"DARK", "NORMAL", "BRIGHT"};
  int nearest = 0;
  int distance = abs(raw - centers[0]);
  for (int index = 1; index < 3; index++) {
    int next = abs(raw - centers[index]);
    if (next < distance) {
      nearest = index;
      distance = next;
    }
  }
  return labels[nearest];
}

void reportCombined() {
  int lightRaw = analogRead(PIN_LIGHT);
  float humidityPct = dht.readHumidity();
  float temperatureC = dht.readTemperature();

  if (!lightCalibrated()) {
    Serial.printf("device=student01 uptime_ms=%lu light_raw=%d "
                  "light_state=UNKNOWN temperature_c=nan humidity_pct=nan "
                  "valid=false reason=light_not_calibrated\n",
                  millis(), lightRaw);
    return;
  }

  if (isnan(temperatureC) || isnan(humidityPct)) {
    Serial.printf("device=student01 uptime_ms=%lu light_raw=%d "
                  "light_state=%s temperature_c=nan humidity_pct=nan "
                  "valid=false reason=dht_read_failed\n",
                  millis(), lightRaw, classifyLight(lightRaw));
    return;
  }

  bool dhtInRange = temperatureC >= 0.0 && temperatureC <= 50.0 &&
                    humidityPct >= 20.0 && humidityPct <= 90.0;
  Serial.printf("device=student01 uptime_ms=%lu light_raw=%d "
                "light_state=%s temperature_c=%.1f humidity_pct=%.1f "
                "valid=%s reason=%s\n",
                millis(), lightRaw, classifyLight(lightRaw),
                temperatureC, humidityPct,
                dhtInRange ? "true" : "false",
                dhtInRange ? "none" : "outside_dht11_range");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  analogReadResolution(12);
  dht.begin();
  Serial.println("week=3 mode=combined status=ready");
}

void loop() {
  unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_INTERVAL_MS) return;
  lastSampleMs = now;
  reportCombined();
}
```

5. Verify、Upload後，在三種光線下各保留一筆。
6. 斷電後移除DHT11資料線，保留一筆`valid=false`。
7. 斷電恢復資料線，保留恢復後的`valid=true`。

Week 6會將`device`、`uptime_ms`、`light_raw`、`light_state`、`temperature_c`、
`humidity_pct`、`valid`與`reason`轉成JSON，不改變欄位意義。

## 九、變化實作

先寫預測，再保留實測證據：

1. 將KY-018取樣筆數改為10與100，比較average、spread與所需時間。
2. 固定30筆，將間隔改為20 ms與500 ms，比較穩定性與時間。
3. 固定手電筒距離5、10、20 cm，各量30筆並比較average。
4. 在分類切換處新增`UNCERTAIN`區，不讓靠近threshold的讀值直接成為確定狀態。
5. 在整合程式增加`valid_count`與`invalid_count`，用DHT11斷線測試驗證。
6. 找一種程式可能顯示`valid=true`但實際不可信的情境，不使用短路、潑水或加熱等危險方式。

## 十、故障排查表

| 現象 | 第一個安全檢查 | 後續檢查 | 不要做 |
|---|---|---|---|
| 無Port | 更換已知可傳資料的USB線與USB孔 | 檢查Week 2環境 | 不先改感測腳 |
| `DHT.h`找不到 | 查Library Manager | 核對Adafruit作者與依賴 | 不改接線 |
| KY-018永遠0 | 拔USB | 核對S→GPIO4、VCC→3V3、GND→GND | 不帶電改線 |
| KY-018永遠4095 | 拔USB | 檢查訊號浮接或誤接3V3 | 不用手指短接 |
| raw不隨光變 | 確認光真正照到光敏電阻 | 斷電核對GPIO4與絲印 | 不猜測數值方向 |
| `profiles_overlap` | 保留原始資料 | 重新固定遮光與手電筒距離 | 不任意改數字 |
| DHT持續`read_failed` | 拔USB | 核對DATA→GPIO5、VCC→3V3、GND→GND | 不改5V試錯 |
| DHT重複舊值 | 恢復2500 ms間隔 | 核對library版本 | 不吹氣、潑水或加熱 |
| ESP32反覆重啟 | 立即拔USB | 拆模組，先驗證空板 | 不連續復電 |
| `light_not_calibrated` | 檢查center是否仍為`-1` | 填自己的average並重上傳 | 不複製別組數字 |

## 十一、繳交內容

1. KY-018與DHT11正反面及腳位絲印照片。
2. 兩張單模組接線俯視照與一張整合接線照。
3. KY-018三種光線各30筆的min、max、average與spread。
4. 光線數值方向、門橻建立、範圍重疊與限制。
5. DHT11的2500 ms與500 ms記錄與比較結論。
6. 各一筆有效與無效log，保留`valid`與`reason`。
7. 故障前、斷電、故障、檢查、修正與恢復證據。
8. 三個sketch與Lab Note，含GPIO、供電、board package、library版本及未驗證限制。

## 十二、完成檢核與器材復原

- [ ] 能說明ADC raw value不是lux。
- [ ] KY-018三種條件各有30筆與統計。
- [ ] 光線狀態來自自己數據，並已檢查重疊。
- [ ] DHT11正常、過快、斷線與恢復都有記錄。
- [ ] 整合程式含一致欄位、`valid`與`reason`。
- [ ] 所有改線都在USB拔除後進行。

復原順序：儲存程式與紀錄，拔USB，先拆3V3線，再拆訊號與GND，
分別收納兩模組，檢查無裸線或歪針後收好ESP32。

## 參考資料

- [Espressif Arduino-ESP32 ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)
- [ESP32-S3-DevKitC-1 User Guide](https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/hw-reference/esp32s3/user-guide-devkitc-1.html)
- [Adafruit DHT sensor library](https://github.com/adafruit/DHT-sensor-library)
- [Week 2～5硬體教材藍圖](../../docs/hardware_course_material_plan.md)
