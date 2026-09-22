// counter_practice：加鍵 GPIO4、減鍵 GPIO5，按鈕另一端接 GND。
// 適用已核對的 YD-ESP32-S3 Type-A V1.5；改線前拔 USB。
const int PLUS_PIN = 4;
const int MINUS_PIN = 5;
int count = 0;                         // 記住目前數字。

void setup() {
  // 晶片內上拉電阻：放開是 HIGH，按下接 GND 是 LOW。
  pinMode(PLUS_PIN, INPUT_PULLUP);
  pinMode(MINUS_PIN, INPUT_PULLUP);
  Serial.begin(115200);                // Monitor 也選 115200。
  Serial.println(count);
}

void loop() {
  if (digitalRead(PLUS_PIN) == LOW) {   // 讀到加鍵按下。
    count = count + 1;                 // 計算後存回 count。
    Serial.println(count);            // 只顯示目前數字。
  }
  if (digitalRead(MINUS_PIN) == LOW) {  // 讀到減鍵按下。
    count = count - 1;
    Serial.println(count);
  }
  delay(200);                         // 暫停 0.2 秒，讓輸出容易看。
}
