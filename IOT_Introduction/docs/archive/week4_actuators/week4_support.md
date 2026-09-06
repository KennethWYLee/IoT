# Week 4支援資料

本檔放置hardware profile、實物辨識、接線檢查、電壓量測、測試紀錄與故障
回報表。逐步操作依[Week 4主教材](week4_main.md)進行。

## 一、課前與安全入口

- [ ] Week 2的Board、Port、Upload與Serial仍可正常使用。
- [ ] Week 4 hardware profile已由target test公布，不是空白或`unverified`。
- [ ] ESP32-S3、按鈕、KY-016、KY-012、SG90、麵包板及三種杜邦線齊全。
- [ ] 4AA帶開關電池盒、安全轉接端子及四顆核准AA電池齊全。
- [ ] 電池盒導線無裸銅、破皮或鬆脫；SG90與模組無歪針或破損。
- [ ] Arduino IDE可開啟Library Manager；ESP32Servo版本可核對。
- [ ] 萬用電表的COM、VΩmA及DCV檔可辨識。

下列任一項未通過時，仍可閱讀與完成低功率程式，但不得裝入電池或接SG90。

## 二、Week 4 hardware profile

資料來源必須填寫`IOT_Introduction/docs/hardware/hardware_state.md`的組合ID、Lab Note或Git commit。

| 項目 | 已驗證值 | 資料來源 |
|---|---|---|
| Board／kit ID |  |  |
| ESP32 board package |  |  |
| ESP32Servo版本 |  |  |
| RGB R GPIO |  |  |
| RGB G GPIO |  |  |
| RGB B GPIO |  |  |
| RGB ON level |  |  |
| KY-012 signal GPIO |  |  |
| KY-012 VCC接法 |  |  |
| KY-012 ON level |  |  |
| Button GPIO |  |  |
| SG90 signal GPIO |  |  |
| Servo minimum pulse width |  |  |
| Servo maximum pulse width |  |  |
| 安全最小角度 |  |  |
| HOME角度 |  |  |
| 安全最大角度 |  |  |
| 首次小範圍測試角度 |  |  |
| 單段保持時間 |  |  |
| Sequence timeout |  |  |
| Command cooldown |  |  |
| 蜂鳴器最長時間 |  |  |
| AA電池種類 |  |  |
| 允許空載電壓 |  |  |
| 允許負載電壓／停止值 |  |  |
| 安全轉接端子及正負測試點 |  |  |

profile來源確認日期：____________________

## 三、實物辨識

### KY-016

| 實物絲印 | 功能 | 是否看見限流元件 | 對應profile GPIO／電源 |
|---|---|---|---|
|  | Red |  |  |
|  | Green |  |  |
|  | Blue |  |  |
|  | Common |  |  |

共陰／共陽或實際ON level：____________________

### KY-012

| 實物絲印 | 功能 | 接到 | 線材／線色 |
|---|---|---|---|
|  | Signal |  |  |
|  | VCC或等效腳位 |  |  |
|  | GND或等效腳位 |  |  |

### SG90與電池盒

| 元件 | 實物線色／標示 | 功能 | 安全端點 |
|---|---|---|---|
| SG90 |  | Signal |  |
| SG90 |  | V+ |  |
| SG90 |  | GND |  |
| 4AA |  | Positive |  |
| 4AA |  | Negative |  |

電池盒外觀、開關與導線檢查：________________________________________

## 四、RGB與蜂鳴器接線及結果

| 起點 | 終點 | profile依據 | 線色 | 正向、反向已確認 |
|---|---|---|---|---|
| ESP32 3V3 | P3V3 |  |  | [ ] |
| ESP32 GND | PGND |  |  | [ ] |
| RGB common | profile指定電源／GND |  |  | [ ] |
| RGB R | profile GPIO |  |  | [ ] |
| RGB G | profile GPIO |  |  | [ ] |
| RGB B | profile GPIO |  |  | [ ] |
| KY-012 signal | profile GPIO |  |  | [ ] |
| KY-012 power／GND | profile指定接點 |  |  | [ ] |

- [ ] USB上電前沒有SG90、電池盒或5V進入接線。
- [ ] 俯視照片可讀到模組絲印、ESP32腳位、P3V3與PGND。

| 命令 | 預期狀態 | 實際RGB | 蜂鳴器 | Serial log | 結果 |
|---|---|---|---|---|---|
| `r` | READY |  |  |  |  |
| `a` | ACTIVE |  |  |  |  |
| `s` | SUCCESS |  |  |  |  |
| `e` | ERROR |  |  |  |  |
| `o` | OFF |  |  |  |  |

## 五、電池盒與電壓量測

| 項目 | 紀錄 |
|---|---|
| AA電池種類、品牌、額定資訊 |  |
| 四顆電池是否同類型、同狀態 |  |
| 電池方向已依盒內標示 |  |
| 黑表筆測試點 |  |
| 紅表筆測試點 |  |
| DCV檔位 |  |
| 開關OFF讀值 |  |
| 空載ON讀值 |  |
| profile允許範圍 |  |
| 是否允許進入舵機測試 |  |

| 負載狀態 | 電壓 | profile停止值 | ESP32狀態 | 舵機現象 | 結果 |
|---|---:|---:|---|---|---|
| 空載 |  |  | 未連接 | 未連接 |  |
| 舵機供電、閒置 |  |  |  |  |  |
| 首次HOME |  |  |  |  |  |
| 小範圍動作 |  |  |  |  |  |
| 返回HOME |  |  |  |  |  |

## 六、外部供電、共地、按鈕與SG90接線

| 起點 | 終點 | 不得接到 | 線色／端子 | 正向、反向已確認 |
|---|---|---|---|---|
| Button一側 | profile Button GPIO | 5V |  | [ ] |
| Button另一側 | ESP32 GND | 電池正極 |  | [ ] |
| SG90 signal | profile Servo GPIO | 電池正極 |  | [ ] |
| SG90 V+ | 電池正極安全端子 | ESP32 3V3／5V／GPIO |  | [ ] |
| SG90 GND | 電池負極 | 電池正極 |  | [ ] |
| 電池負極 | ESP32 GND | ESP32 3V3／5V |  | [ ] |

- [ ] 電池盒OFF，至少一顆電池已取出後才完成上述接線。
- [ ] 電池正極沒有連到ESP32的任何腳位。
- [ ] 共地只連接電池負極、SG90 GND及ESP32 GND。
- [ ] SG90未接搖臂、連桿或機構，周圍空間已清除。
- [ ] 照片可看清安全端子、所有端點與電池盒OFF位置。

## 七、命令、安全停止與恢復

| 測試 | 命令／動作 | 預期result／reason | 實際log | 實物狀態 | 通過 |
|---|---|---|---|---|---|
| Profile未填 | 保留`-1` | blocked／config_missing |  | 電池OFF |  |
| 角度超限 | `move 200`或profile指定值 | rejected／out_of_range |  | 不動作 |  |
| 格式錯誤 | `move abc` | rejected／invalid_format |  | 不動作 |  |
| HOME | `home` | applied→return→done |  | 返回HOME並detach |  |
| 小範圍 | profile指定角度 | applied→return→done |  | 受限動作 |  |
| Button | 按一下 | 只接受一次 |  | 受限動作 |  |
| Busy | 動作中再次命令 | rejected／busy |  | 原流程不變 |  |
| Cooldown | 完成後立即命令 | rejected／cooldown |  | 不啟動 |  |
| Manual stop | 動作中`stop` | stopped／manual_stop |  | detach，再OFF |  |
| Timeout程式路徑 | 電池盒OFF，輸入`test_timeout` | armed→stopped／timeout |  | detach；未供應舵機電力 |  |
| Timeout實機路徑 | 僅依profile核准方式 | armed→stopped／timeout |  | 無負載HOME後detach，再OFF |  |
| Restart | 電池OFF後RESET | READY，不重播 |  | 無自動動作 |  |
| Recovery | 正常命令 | done／none |  | 正常完成 |  |

## 八、故障、檢查、修正與恢復

| 欄位 | 紀錄 |
|---|---|
| 故障前正常log與電壓 |  |
| 異常現象 |  |
| 第一個安全動作 |  |
| 電池OFF與USB拔除證據 |  |
| 接線、profile或電壓檢查 |  |
| 修正內容 |  |
| 恢復後log、電壓與實物結果 |  |
| 仍未驗證限制 |  |

## 九、變化實作紀錄

| 修改項目 | 修改前 | 預測 | 修改後 | 實際結果 | 是否維持安全限制 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 十、Lab Note摘要

| 欄位 | 紀錄 |
|---|---|
| 日期與使用者 |  |
| Board／kit／servo ID |  |
| GPIO、ON level及library版本 |  |
| 電池種類、轉接與共地 |  |
| 安全角度、pulse width與時間限制 |  |
| 空載、閒置與負載電壓 |  |
| 正常、拒絕、停止、timeout與restart |  |
| 故障、檢查、修正與恢復 |  |
| 未進行的target test或限制 |  |
| Git commit |  |

## 十一、故障回報格式

回報時提供：作業系統與所有版本、Board／kit／servo ID、profile來源、模組正反面
與完整接線照片、安全端子及電池種類、空載與負載電壓、完整sketch、連續Serial
log、異常階段、第一個斷電動作、已嘗試檢查，以及目前電池是否已取出。

## 十二、相關資料

- [ESP32Servo official repository](https://github.com/madhephaestus/ESP32Servo)
- [ESP32-S3-DevKitC-1 User Guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/index.html)
- [Week 2～5硬體教材藍圖](../../course_materials/hardware_course_material_plan.md)
