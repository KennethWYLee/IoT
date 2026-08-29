# Week 3支援資料

本檔放置檢查表、量測表、故障紀錄與回報格式。操作步驟依
[Week 3主教材](week3_main.md)進行。

## 一、課前與上電前檢查

- [ ] Week 2的sketch可Verify、Upload與顯示Serial。
- [ ] ESP32-S3、USB線、麵包板、KY-018、DHT11、六條公對母線與兩條母對母線齊全。
- [ ] 220Ω、1kΩ與10kΩ各一顆，且原始標籤仍可辨識。
- [ ] 輪到使用的萬用電表外觀、表筆與電池狀態正常。
- [ ] 兩模組無斷裂、氧化或歪針。
- [ ] Arduino IDE可開啟Library Manager；已安裝DHT library者已記錄版本。
- [ ] 手機手電筒可固定與光敏元件距離。

| 項目 | 版本或型號 |
|---|---|
| Arduino IDE |  |
| Espressif `esp32` board package |  |
| DHT sensor library |  |
| Adafruit Unified Sensor |  |
| ESP32-S3模組絲印 |  |
| Board選項／Port |  |

### Week 2銜接量測紀錄

#### 散裝電阻

| 標稱值 | Ω量程 | 畫面數字 | 換算實測值與單位 | 是否同數量級 |
|---:|---|---:|---:|---|
| 220Ω |  |  |  | 是／否 |
| 1kΩ |  |  |  | 是／否 |
| 10kΩ |  |  |  | 是／否 |

#### 電源腳與GPIO電壓

| 測量項目 | 黑表筆測點 | 紅表筆測點 | 檔位 | 實測值與單位 | 判讀 |
|---|---|---|---|---:|---|
| P3V3 | PGND：_____ | P3V3：_____ | `V⎓ 20` |  |  |
| P5V | PGND：_____ | P5V：_____ | `V⎓ 20` |  |  |
| GPIO LOW 1 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| GPIO HIGH 1 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| GPIO LOW 2 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| GPIO HIGH 2 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| GPIO LOW 3 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| GPIO HIGH 3 | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |
| RST後startup LOW | PGND：_____ | TPO：_____ | `V⎓ 20` |  |  |

- [ ] Serial的LOW／HIGH預期與電表結果分開記錄，沒有把文字當成電壓證據。
- [ ] GPIO電壓量測時TPO沒有連接LED、蜂鳴器、舵機或其他負載。
- [ ] 量測結束後已拔USB、把電表轉回`OFF`並拆除P5V線。
- [ ] 進入感測器接線時只保留彼此分開的P3V3與PGND。

上電前：

- [ ] USB已拔除，電源燈熄滅。
- [ ] `P3V3`只接ESP32 `3V3`，`PGND`只接ESP32 `GND`。
- [ ] KY-018與DHT11腳位來自同批板卡target-test profile，不是候選值或網路圖片。
- [ ] `P3V3`與`PGND`是兩個分開的五孔組，沒有任何線接到5V。
- [ ] 接線已正向、反向各檢查一次。
- [ ] 俯視照可辨識模組絲印、ESP32腳位、`P3V3`與`PGND`。

| 麵包板標籤 | 實際五孔組座標 | ESP32來源 | 已確認 |
|---|---|---|---|
| P3V3 |  | 3V3 | [ ] |
| PGND |  | GND | [ ] |

## 二、接線檢查

### KY-018

| 實物絲印 | 功能 | 線材 | 接到 | 線色 | 已確認 |
|---|---|---|---|---|---|
|  | 訊號 | 母對母 | profile的`PIN_LIGHT` |  | [ ] |
|  | 電源 | 公對母 | P3V3 |  | [ ] |
|  | 參考地 | 公對母 | PGND |  | [ ] |

### DHT11

| 實物絲印 | 功能 | 線材 | 接到 | 線色 | 已確認 |
|---|---|---|---|---|---|
|  | 資料 | 母對母 | profile的`PIN_DHT` |  | [ ] |
|  | 電源 | 公對母 | P3V3 |  | [ ] |
|  | 參考地 | 公對母 | PGND |  | [ ] |

## 三、KY-018校正

| 條件 | 固定方式 | min | max | average | spread |
|---|---|---:|---:|---:|---:|
| DARK |  |  |  |  |  |
| NORMAL |  |  |  |  |  |
| BRIGHT |  |  |  |  |  |

| 問題 | 結論 |
|---|---|
| 變亮時raw上升或下降 |  |
| DARK與NORMAL是否重疊 |  |
| NORMAL與BRIGHT是否重疊 |  |
| 校正結果`calibration_valid`／`reason` |  |
| raw方向（`1`上升或`-1`下降） |  |
| DARK／NORMAL threshold計算與結果 |  |
| NORMAL／BRIGHT threshold計算與結果 |  |
| 不確定區或限制 |  |

| 次數 | 實際條件 | raw | state | valid | reason | 符合預期 |
|---:|---|---:|---|---|---|---|
| 1 | DARK |  |  |  |  |  |
| 2 | DARK |  |  |  |  |  |
| 3 | DARK |  |  |  |  |  |
| 4 | NORMAL |  |  |  |  |  |
| 5 | NORMAL |  |  |  |  |  |
| 6 | NORMAL |  |  |  |  |  |
| 7 | BRIGHT |  |  |  |  |  |
| 8 | BRIGHT |  |  |  |  |  |
| 9 | BRIGHT |  |  |  |  |  |

## 四、DHT11取樣

裝置代碼（不使用姓名或學號）：____________________

### 2500 ms

| 筆 | uptime_ms | temperature_c | humidity_pct | valid | reason |
|---:|---:|---:|---:|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |

### 500 ms

| 筆 | uptime_ms | temperature_c | humidity_pct | valid | reason | 與前筆相同 |
|---:|---:|---:|---:|---|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |

取樣間隔結論：__________________________________________________

## 五、故障與恢復

| 欄位 | KY-018 | DHT11 |
|---|---|---|
| 故障前正常log |  |  |
| 斷電證據 |  |  |
| 只改變的線 |  |  |
| 故障log |  |  |
| 第一個安全檢查 |  |  |
| 修正動作 |  |  |
| 恢復log |  |  |
| 系統仍無法辨識的限制 |  |  |

## 六、整合驗收

| 程式設定 | 填入值 | 來源或檢查 |
|---|---|---|
| `DEVICE_ID` |  | 課堂指定裝置代碼 |
| `LIGHT_DIRECTION` |  | 校正輸出的`1`或`-1` |
| `LIGHT_THRESHOLD_DARK_NORMAL` |  | 自己的校正輸出 |
| `LIGHT_THRESHOLD_NORMAL_BRIGHT` |  | 自己的校正輸出 |
| `LIGHT_PROFILES_SEPARATED` |  | 只有`calibration_valid=true`才填`true` |

整合接線：

- [ ] P3V3共有ESP32 3V3、KY-018 VCC、DHT11 VCC三條線。
- [ ] PGND共有ESP32 GND、KY-018 GND、DHT11 GND三條線。
- [ ] KY-018訊號只接`PIN_LIGHT`，DHT11資料只接`PIN_DHT`，且兩者不同。
- [ ] 沒有任何線接到5V，接線已正向、反向各檢查一次。

| 測試 | light_raw／state | temperature／humidity | valid／reason | 結果 |
|---|---|---|---|---|
| DARK |  |  |  |  |
| NORMAL |  |  |  |  |
| BRIGHT |  |  |  |  |
| 光線範圍重疊（如有） |  |  | `false`／`light_profiles_overlap` |  |
| DHT斷線 |  |  |  |  |
| DHT恢復 |  |  |  |  |

## 七、故障回報

回報時提供：作業系統與所有版本、板卡與模組正反面照、接線俯視照、
完整sketch、完整錯誤或連續10筆Serial log、失敗階段、已嘗試步驟與目前是否斷電。

## 八、Lab Note摘要

| 欄位 | 紀錄 |
|---|---|
| 日期與使用者 |  |
| Board ID／模組絲印 |  |
| `PIN_LIGHT`／`PIN_DHT`實際值、用途與target-test來源 |  |
| 供電與GND |  |
| Board package／library版本 |  |
| 已完成測試 |  |
| 電阻、P3V3、P5V、GPIO LOW／HIGH及Reset後LOW |  |
| 感測實際數值範圍 |  |
| 光線方向與兩個threshold |  |
| 光線分布是否分離 |  |
| 故障、檢查、修正、恢復 |  |
| 未驗證限制 |  |
| Git commit |  |

## 九、相關資料

- [KY-018接線圖](../../docs/images/wiring/week3_ky018.svg)
- [DHT11接線圖](../../docs/images/wiring/week3_dht11.svg)
- [Espressif ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)
- [Adafruit DHT sensor library](https://github.com/adafruit/DHT-sensor-library)
