# Week 3支援資料

本檔放置檢查表、量測表、故障紀錄與回報格式。操作步驟依
[Week 3主教材](week3_main.md)進行。

## 一、課前與上電前檢查

- [ ] Week 2的sketch可Verify、Upload與顯示Serial。
- [ ] ESP32-S3、USB線、麵包板、KY-018、DHT11與六條公對母線齊全。
- [ ] 兩模組無斷裂、氧化或歪針。
- [ ] Adafruit DHT library與Adafruit Unified Sensor已安裝。
- [ ] 手機手電筒可固定與光敏元件距離。

| 項目 | 版本或型號 |
|---|---|
| Arduino IDE |  |
| Espressif `esp32` board package |  |
| DHT sensor library |  |
| Adafruit Unified Sensor |  |
| ESP32-S3模組絲印 |  |
| Board選項／Port |  |

上電前：

- [ ] USB已拔除，電源燈熄滅。
- [ ] VCC只接`3V3`，GND只接`GND`。
- [ ] KY-018訊號→GPIO4，DHT11資料→GPIO5。
- [ ] 沒有線橫跨3V3與GND。
- [ ] 俯視照可辨識模組絲印與ESP32腳位。

## 二、接線覆核

### KY-018

| 實物絲印 | 功能 | ESP32 | 線色 | 覆核 |
|---|---|---|---|---|
|  | 訊號 | GPIO4 |  | [ ] |
|  | 電源 | 3V3 |  | [ ] |
|  | 參考地 | GND |  | [ ] |

### DHT11

| 實物絲印 | 功能 | ESP32 | 線色 | 覆核 |
|---|---|---|---|---|
|  | 資料 | GPIO5 |  | [ ] |
|  | 電源 | 3V3 |  | [ ] |
|  | 參考地 | GND |  | [ ] |

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
| 兩個threshold的計算 |  |
| 不確定區或限制 |  |

| 次數 | 實際條件 | raw | state | valid | reason | 符合預期 |
|---:|---|---:|---|---|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |

## 四、DHT11取樣

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

| 測試 | light_raw／state | temperature／humidity | valid／reason | 結果 |
|---|---|---|---|---|
| DARK |  |  |  |  |
| NORMAL |  |  |  |  |
| BRIGHT |  |  |  |  |
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
| GPIO4／GPIO5用途 |  |
| 供電與GND |  |
| Board package／library版本 |  |
| 已完成測試 |  |
| 實際數值範圍 |  |
| 故障、檢查、修正、恢復 |  |
| 未驗證限制 |  |
| Git commit |  |

## 九、相關資料

- [KY-018接線圖](../../docs/images/wiring/week3_ky018.svg)
- [DHT11接線圖](../../docs/images/wiring/week3_dht11.svg)
- [Espressif ADC API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)
- [Adafruit DHT sensor library](https://github.com/adafruit/DHT-sensor-library)
