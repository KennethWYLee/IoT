# IoT 入門 QA

這份 QA 給第一次接觸 IoT、ESP32-S3 與感測器的學生使用。請先把本課程想成一個資料流：

```text
感測器 / 手機影像
  -> ESP32-S3 或筆電
  -> MQTT / HTTP / API
  -> dashboard / database
  -> ESP32-S3 控制燈號、蜂鳴器、伺服馬達
```

## Q1. ESP32-S3 是什麼？跟 Arduino、Raspberry Pi 差在哪？

**ESP32-S3 是一顆有 Wi-Fi / Bluetooth 的微控制器晶片。**  
我們買的 ESP32-S3 DevKit 是把晶片、USB、穩壓、排針等都做好的一片開發板。

| 名稱 | 本質 | 適合做什麼 | 不適合做什麼 |
|---|---|---|---|
| ESP32-S3 | 微控制器 MCU | 感測器、馬達、Wi-Fi、MQTT、低成本 IoT 裝置 | 大型影像辨識、完整 Linux、ROS 2 主機 |
| Arduino Uno | 微控制器開發板 | 入門 GPIO、感測器、簡單控制 | 內建 Wi-Fi 較弱、效能較低 |
| Raspberry Pi | 單板電腦 SBC | Linux、Python、OpenCV、ROS 2、Web server | 價格較高、供電與系統維護較麻煩 |

本課程選 ESP32-S3，是因為它便宜、可連網、可以控制多種實體裝置，也足夠完成互動玩具、環境裝置、智慧停車場或其他入門 IoT 作品。

## Q2. ESP32-S3 是寫 Arduino 嗎？

可以。課程前半建議使用 **Arduino IDE 或 PlatformIO 的 Arduino framework**。

Arduino 在這裡不是指 Arduino Uno 那片板子，而是指一套容易上手的開發方式。ESP32-S3 也可以用 Arduino framework 寫程式。

常用函式庫：

- `WiFi.h`：連 Wi-Fi。
- `HTTPClient.h` / `WebServer.h`：HTTP 溝通。
- `PubSubClient`：MQTT。
- `ESP32Servo`：控制 SG90 伺服馬達。
- `DHT sensor library`：讀 DHT11 溫濕度。

## Q3. 為什麼 IoT 要用 MQTT 或 HTTP？

IoT 的重點不是只有感測器，而是「裝置能把資料送到系統，也能被系統控制」。

| 通訊方式 | 適合情境 | 可以想成 |
|---|---|---|
| HTTP | 查詢、送表單、呼叫 API、dashboard 控制 | 瀏覽器打 API |
| MQTT | 裝置頻繁回報狀態、多個裝置訂閱訊息 | 裝置聊天室 |

智慧停車場例子：

```text
OpenCV 判斷 A1 車位已占用
  -> 後端更新 dashboard
  -> MQTT 發布 parking/A1/status = occupied
  -> ESP32-S3 收到後亮紅燈或關閉閘門
```

如果只做一台裝置，HTTP 就夠。  
如果未來有很多車位、很多教室、很多機台，MQTT 會更自然。

### MQTT 多一點例子

MQTT 有三個重要角色：

| 角色 | 意思 | 本課程例子 |
|---|---|---|
| Broker | 訊息中繼站 | Mosquitto、EMQX、HiveMQ |
| Publisher | 發訊息的人 | ESP32-S3、OpenCV 程式、後端 |
| Subscriber | 收訊息的人 | ESP32-S3、dashboard、後端 |

MQTT 用 **topic** 分類訊息。Topic 很像頻道名稱。

停車場 topic 範例：

```text
parking/A1/status
parking/A2/status
parking/gate/command
parking/gate/state
parking/device/esp32/status
```

訊息範例：

```text
topic: parking/A1/status
message: occupied

topic: parking/gate/command
message: open

topic: parking/device/esp32/status
message: online
```

資料流程：

```text
OpenCV 程式 publish parking/A1/status = occupied
Dashboard subscribe parking/+/status
ESP32-S3 subscribe parking/gate/command
ESP32-S3 收到 open 後，控制 SG90 開閘門
```

如果用 JSON，訊息可以更完整：

```json
{
  "slot_id": "A1",
  "status": "occupied",
  "confidence": 0.91,
  "updated_at": "2026-05-14T14:30:00"
}
```

HTTP 比較像「我問你答」：

```text
ESP32-S3 -> POST /api/readings
Dashboard -> GET /api/parking/status
```

MQTT 比較像「訂閱頻道，有消息就推播」：

```text
ESP32-S3 訂閱 gate command
後端一發布 open，ESP32-S3 馬上收到
```

## Q4. 感測器、致動器、模組、開發板怎麼分？

| 名稱 | 意思 | 本課程例子 |
|---|---|---|
| 開發板 | 可寫程式的主控板 | ESP32-S3 DevKit |
| 感測器 | 把現實世界變成資料 | DHT11、光敏、PIR、HC-SR04 |
| 致動器 | 把指令變成實體動作 | SG90 伺服、LED、蜂鳴器 |
| 模組 | 已經把小電路整理好的元件板 | KY-016 RGB LED、KY-012 蜂鳴器 |

一句話：

```text
感測器負責「看世界」
致動器負責「動手做」
開發板負責「判斷與連網」
```

## Q5. 什麼是 GPIO？

GPIO 是 **General Purpose Input/Output**，意思是「通用輸入/輸出腳位」。

你可以把 GPIO 想成 ESP32-S3 對外溝通的小門：

- 當輸出：ESP32-S3 控制 LED、蜂鳴器、伺服訊號。
- 當輸入：ESP32-S3 讀按鈕、PIR、超音波 Echo。

例子：

```text
PIN_SERVO     -> 控制 SG90 伺服馬達訊號線
PIN_RGB_RED   -> 控制 RGB LED 的紅色腳
PIN_BUTTON    <- 讀取按鈕是否被按下
PIN_PIR       <- 讀取 PIR 是否偵測到動作
```

程式概念：

```cpp
// 這兩個值只能從教師公布的verified pin profile填入。
const int PIN_RGB_RED = -1;
const int PIN_BUTTON = -1;

pinMode(PIN_RGB_RED, OUTPUT);
digitalWrite(PIN_RGB_RED, HIGH);

pinMode(PIN_BUTTON, INPUT_PULLUP);
int pressed = digitalRead(PIN_BUTTON);
```

注意：不是每個 ESP32-S3 腳位都適合所有用途。教師會先用同批板卡完成
target test，再公布當週verified pin profile；學生只依該profile接線。

## Q6. GND 是什麼？

GND 是 **Ground**，通常翻成「地」或「接地」。在我們的小電路裡，可以先把它想成：

> 所有電壓的共同參考點，也是電流回家的路。

電壓不是單獨存在的，它是「兩點之間的差」。  
所以 3.3V 的意思其實是：

```text
3.3V 腳位 比 GND 高 3.3V
```

常見接法：

```text
ESP32-S3 3V3 -> 感測器 VCC
ESP32-S3 GND -> 感測器 GND
ESP32-S3 GPIO -> 感測器 Signal
```

如果有外接伺服馬達電源，也要共地：

```text
ESP32-S3 GND --------+
                     |
外接 5V 電源 GND ----+
                     |
SG90 棕色線 GND -----+
```

如果沒有共用 GND，ESP32-S3 給伺服的訊號就沒有共同參考點，伺服可能亂動或完全不動。

最危險的錯誤：

```text
5V 直接接 GND
```

這叫短路，可能造成電腦 USB 保護、板子重開、線發熱，甚至燒壞元件。

## Q7. 什麼是有限流電阻？

限流電阻就是「限制電流大小的電阻」。

LED 很常需要限流，因為 LED 不是接上電就會自己保護自己。沒有電阻時，電流可能太大，LED 或 GPIO 可能受損。

基本接法：

```text
ESP32-S3 GPIO
  -> 電阻
  -> LED 正極
  -> LED 負極
  -> GND
```

常用電阻值：

```text
220Ω、330Ω、1kΩ
```

本課程買的 KY-016 RGB LED 模組通常已經把接線做得比較簡單，但理解限流仍然重要。若你使用裸 LED，就一定要加限流電阻。

直覺例子：

```text
沒有電阻：水龍頭全開，水流太大
有限流電阻：水龍頭被限制，水流比較安全
```

## Q8. 3.3V 和 5V 到底怎麼分？為什麼不能統一？

你會亂是正常的，這是初學 IoT 最常見的混亂點。

先記住一句話：

> ESP32-S3 的腦袋是 3.3V，但有些外部設備需要 5V 才有力氣工作。

| 電壓 | 常見用途 |
|---|---|
| 3.3V | ESP32-S3 GPIO 訊號、DHT11、PIR、部分感測器 |
| 5V | USB 電源、SG90 伺服、HC-SR04 供電、部分 Arduino 模組 |

為什麼不統一？

- 3.3V 比較省電，適合微控制器晶片。
- 5V 對馬達、伺服、某些舊 Arduino 模組比較常見。
- 不同年代、不同目的的元件，設計電壓不同。

你要分兩種事情：

### 1. 供電電壓

這是模組吃多少電。

```text
SG90 伺服：常用 5V 供電
DHT11 模組：通常 3.3V 或 5V 都可
ESP32-S3：板上晶片用 3.3V
```

### 2. 訊號電壓

這是 GPIO 看到的高低電位。

ESP32-S3 GPIO 只能安全接受 3.3V 左右的訊號。  
如果某模組輸出 5V 給 ESP32-S3 GPIO，就可能傷到板子。

最重要例子：

```text
HC-SR04 VCC  可以接 5V
HC-SR04 Trig 可以由 ESP32-S3 GPIO 控制
HC-SR04 Echo 可能輸出 5V，要分壓後再進 ESP32-S3
```

簡單判斷表：

| 情境 | 做法 |
|---|---|
| ESP32-S3 控制 LED 模組 | GPIO 直接控制即可 |
| ESP32-S3 讀 3.3V 感測器 | 通常可直接接 |
| ESP32-S3 讀 5V 輸出訊號 | 要分壓或電平轉換 |
| 伺服馬達需要力氣 | 用 5V 供電，訊號線接 ESP32-S3 GPIO，GND 共地 |

## Q9. Dashboard 是什麼？是硬體嗎？是麵包板嗎？

Dashboard 不是硬體，也不是麵包板。

Dashboard 是一個「看資料、操作系統的畫面」。可以是：

- 網頁。
- Node-RED dashboard。
- Streamlit app。
- Flask / FastAPI + 前端頁面。
- Grafana。
- 甚至先用 Google Sheet 或簡單 HTML。

智慧停車場 dashboard 可以顯示：

- 現在有幾個空位。
- A1/A2/A3 每格狀態。
- 閘門目前開或關。
- 車輛進出紀錄。
- 異常事件。

智慧教室 dashboard 可以顯示：

- 教室是否使用中。
- 溫度、濕度、亮度。
- 最近是否偵測到活動。
- 疑似忘關燈或冷氣的事件。

麵包板是硬體，用來接線。  
Dashboard 是軟體畫面，用來給人看資料和操作系統。

## Q10. 相機板是什麼？

相機板就是「相機模組做成一小片電路板」，可以接到開發板或單板電腦。

常見例子：

- ESP32-CAM。
- ESP32-S3-CAM。
- Raspberry Pi Camera Module。
- USB camera 模組。

本課程先不用相機板，因為：

- 學生手機相機品質更好。
- 手機架起來就能拍停車場模型。
- 筆電跑 OpenCV 比 ESP32-S3 跑影像辨識穩。
- 相機板會增加驅動、供電、串流除錯成本。

所以第一版架構是：

```text
手機當相機
筆電做影像辨識
ESP32-S3 控制實體裝置
```

期末進階組若想做更完整的嵌入式影像系統，再考慮相機板、Raspberry Pi 或 Jetson。

## Q11. 麵包板和杜邦線怎麼接才不會燒掉？

先記住五條規則：

1. 接線前先拔 USB 或關電源。
2. 不要把 `5V/3V3` 直接接到 `GND`。
3. ESP32-S3 的 GPIO 不要直接接 5V 訊號。
4. LED 要有限流電阻，或使用已經做好的 LED 模組。
5. 多個模組一起用時，通常要共用 `GND`。

常見接法：

```text
ESP32-S3 3V3  -> 模組 VCC，若該模組支援 3.3V
ESP32-S3 GND  -> 模組 GND
ESP32-S3 GPIO -> 模組 signal / data
```

伺服馬達要特別注意：SG90 通常用 5V 供電，但控制訊號可以由 ESP32-S3 的 GPIO 輸出。若外接 5V 電源，ESP32-S3 和伺服電源必須共用 GND。

## Q12. HC-SR04 為什麼要接分壓電阻？

HC-SR04 是超音波距離感測器。它常用 5V 供電，問題在於 Echo 腳可能輸出 5V 訊號，而 ESP32-S3 的 GPIO 是 3.3V 邏輯。

```text
HC-SR04 Trig  <- ESP32-S3 GPIO，可直接控制
HC-SR04 Echo  -> 可能輸出 5V，不要直接進 ESP32-S3 GPIO
```

解法是用 1kΩ + 2.2kΩ 做分壓，把 Echo 訊號降到 ESP32-S3 比較安全的範圍。

```text
HC-SR04 Echo
   |
  1kΩ
   |
ESP32-S3 GPIO
   |
  2.2kΩ
   |
GND
```

這會把 5V 降到接近 3.3V，保護 ESP32-S3。

如果買到明確標示 Echo 支援 3.3V 的改良版超音波模組，可以不用這個分壓。但一般 HC-SR04 請先當成 5V Echo 處理，比較安全。

## Q13. 手機視覺、ESP32-S3、dashboard 彼此怎麼溝通？

智慧停車場不讓 ESP32-S3 做影像辨識，因為它不是影像 AI 主機。架構是：

```text
手機
  當相機，拍停車場模型

筆電
  用 Python + OpenCV 辨識車位空/滿、QR / ArUco
  更新 dashboard / database
  用 HTTP 或 MQTT 發指令

ESP32-S3
  收指令
  控制閘門、RGB LED、蜂鳴器
  回傳裝置狀態
```

也就是：

```text
手機負責看
筆電負責想
ESP32-S3 負責動
dashboard 負責給人看
```

## Q14. 為什麼不用 Raspberry Pi 或相機板？

不是不能用，而是第一門課不適合每組都買。

不用 Raspberry Pi 的原因：

- 成本高。
- 要裝 Linux、套件、相機驅動，教學摩擦大。
- 供電、SD 卡、散熱都會增加維護成本。
- 學生已經有筆電，可以先用筆電做 OpenCV 與 dashboard。

不用 ESP32-S3-CAM 的原因：

- 便宜但串流與供電比較容易卡。
- 影像辨識仍然通常要交給筆電或後端。
- 手機相機品質更好，學生也已經有。

所以第一版用「手機 + 筆電 + ESP32-S3」最穩。

## Q15. 停車場做完後，材料可以怎麼延伸？

停車場材料不是一次性用品。

| 已有材料 | 可延伸題目 |
|---|---|
| ESP32-S3 | 幾乎所有 IoT 專題 |
| SG90 伺服 | 閘門、夾爪、門鎖、升降機構 |
| RGB LED / 蜂鳴器 | 狀態燈、警報、遊戲回饋 |
| DHT11 | 教室、機房、倉儲環境監控 |
| KY-018 光敏 | 燈光偵測、節能判斷 |
| PIR | 教室占用、空間使用偵測 |
| HC-SR04 | 入口偵測、距離、液位概念 |
| 手機視覺 | 車位、座位、貨位、物件位置辨識 |

## Q16. 智慧停車場的完整資料流怎麼跑？

智慧停車場分成四個角色：

```text
手機：拍攝停車場模型
筆電：OpenCV 判斷車位狀態
後端 / dashboard：記錄與呈現資料
ESP32-S3：控制閘門、燈號、蜂鳴器
```

完整流程：

```text
1. 手機固定俯拍停車場模型
   -> 影像串流或拍照給筆電

2. 筆電使用 OpenCV 讀取影像
   -> 切出每個停車格 ROI
   -> 判斷 A1、A2、A3 是空位或占用
   -> 可選：辨識 QR / ArUco 作為車輛 ID

3. 筆電或後端更新資料
   -> parking_slots 表：車位狀態
   -> parking_events 表：進場、出場、異常事件

4. Dashboard 顯示
   -> 空位數
   -> 每格狀態
   -> 進出紀錄
   -> 異常事件

5. 後端用 HTTP 或 MQTT 通知 ESP32-S3
   -> gate/open
   -> gate/close
   -> led/status = full / available / error

6. ESP32-S3 控制實體裝置
   -> SG90 伺服馬達開關閘門
   -> RGB LED 顯示狀態
   -> 蜂鳴器提示進場或異常

7. ESP32-S3 回報裝置狀態
   -> gate_state = open / closed
   -> device_online = true
   -> ultrasonic_detected = true / false
```

資料表可以先很簡單：

```text
parking_slots
  slot_id
  status
  updated_at

parking_events
  event_id
  slot_id
  car_id
  event_type
  created_at
```

最小 MVP：

- OpenCV 判斷 3 個車位空/滿。
- Dashboard 顯示空位數。
- ESP32-S3 控制一個閘門或狀態燈。
- 系統留下事件紀錄。

## Q17. 智慧教室的完整資料流怎麼跑？

智慧教室不靠人按按鈕判斷是否使用中，而是用感測器資料推論教室狀態。

角色：

```text
ESP32-S3：讀取感測器
DHT11：溫濕度
KY-018：環境亮度
HC-SR501 PIR：近期是否有人活動
後端 / dashboard：狀態推論、紀錄、告警
RGB LED / 蜂鳴器：現場提示
```

完整流程：

```text
1. ESP32-S3 定期讀取感測器
   -> DHT11：temperature、humidity
   -> KY-018：light_level
   -> PIR：motion_detected

2. ESP32-S3 上傳資料
   -> HTTP POST /api/classroom/readings
   或
   -> MQTT topic classroom/402/readings

3. 後端儲存原始資料
   -> classroom_readings 表
   -> 每筆資料都有時間、教室、溫度、濕度、亮度、PIR 狀態

4. 後端用時間窗推論狀態
   -> 最近 5 分鐘 PIR 有動作：近期有人活動
   -> 最近 30 分鐘 PIR 無動作：疑似空置
   -> 亮度高：燈可能開著
   -> 溫度偏低：冷氣可能開著
   -> 濕度偏高：環境或設備保存風險

5. 產生教室狀態
   -> 使用中
   -> 空置
   -> 疑似沒人但燈未關
   -> 疑似沒人但冷氣未關
   -> 舒適度異常

6. Dashboard 顯示
   -> 目前狀態
   -> 溫濕度與亮度曲線
   -> 今日使用紀錄
   -> 異常事件
   -> 節能建議

7. 後端通知 ESP32-S3 現場提示
   -> RGB LED 綠色：正常
   -> RGB LED 紅色：異常
   -> 蜂鳴器：警示
```

判斷規則範例：

```text
if motion_recent and light_high:
    status = "使用中"

if no_motion_30min and light_high:
    status = "疑似沒人但燈未關"

if no_motion_30min and temperature_low:
    status = "疑似沒人但冷氣未關"

if motion_recent and (temperature_high or humidity_high):
    status = "舒適度異常"
```

資料表也可以先很簡單：

```text
classroom_readings
  room_id
  temperature
  humidity
  light_level
  motion_detected
  created_at

classroom_events
  room_id
  event_type
  message
  created_at
```

最小 MVP：

- ESP32-S3 上傳 PIR、亮度、溫濕度。
- Dashboard 顯示即時資料。
- 系統能自動判斷至少 3 種狀態：使用中、空置、疑似忘關燈。
- RGB LED 或蜂鳴器能反映異常。

## Q18. 後面怎麼延伸到自走車？

自走車只是學生可選方向，不是本課共同平台。若某組確定要做，可使用現成
底盤降低機構加工負擔，例如：

- UCI 4WD 固定底盤與四顆馬達。
- L298N，左側兩顆馬達接一個 channel，右側兩顆接另一個 channel。
- 6AA Eneloop 電池盒、LM2596 與總電源開關。
- 需要時加 HC-SR04、ToF、encoder 或 IMU。

架構：

```text
ESP32-S3
  控馬達、讀感測器、連 Wi-Fi

筆電 / dashboard
  發任務、看狀態、記錄資料
```

UCI 4WD 採左右差速轉向，不是汽車式前輪轉向。選擇這條路線的小組仍須
完成供電、驅動、停止、感測、軟體操作與 log；不能只把現成底盤組起來。
不做車的小組可用同一片 ESP32-S3 製作燈光、遊戲、夾取、環境監測或
其他互動硬體，評量方式相同。

## Q19. 後面怎麼延伸到夾娃娃機？

ESP32-S3 和 SG90 可以沿用。

加買或自製：

- 更多 SG90 或較強的 MG90S。
- 搖桿模組。
- 紙板、滑軌、竹籤、橡皮筋、3D 列印件。
- LED / 蜂鳴器當遊戲回饋。

資管可以做：

- 遊戲次數紀錄。
- 成功率統計。
- 會員點數。
- 遠端監控。
- 機台營運 dashboard。

## Q20. 後面怎麼延伸到 ROS 2？

ESP32-S3 不適合跑完整 ROS 2，但可以當低階控制器。

```text
筆電 / Raspberry Pi
  跑 ROS 2
  發 /cmd_vel
  記錄 rosbag
  顯示 rviz

ESP32-S3
  控馬達
  讀感測器
  回傳狀態
```

初學可以先用 Serial / MQTT bridge：

```text
ROS 2 node -> MQTT / Serial -> ESP32-S3
```

進階再研究 micro-ROS。

## Q21. 我們這門課到底學的是什麼？

不是單純學接線，也不是只做一個玩具。

本課程核心能力：

- 把真實世界轉成資料。
- 讓裝置透過網路回報狀態。
- 讓系統透過指令控制實體設備。
- 把資料存下來、視覺化、分析。
- 設計異常判斷、告警與營運流程。
- 用低成本材料做出可展示、可延伸的 IoT 原型。

資管學生的強項會在後半段出現：資料流、流程設計、dashboard、API、資料庫、使用者情境與營運管理。
