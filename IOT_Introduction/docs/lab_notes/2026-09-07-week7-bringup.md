# 2026-09-07 BOARD-T01：作品分項測試與舵機交接

本紀錄保存使用者回報、照片及診斷程式；不是整班通用接線profile。
韌體版本以本紀錄所在Git提交及下列來源為準，不把編譯、Upload、軟體命令與實物反應合併成「全部測試通過」。

## 目前結論

- 已有使用者確認：OLED能顯示經過秒數與光線數字，兩顆按鈕按下1→0／放開回1，RGB三色正確，限流蜂鳴測試有聲音。
- SG90未進行實機驗證。最後只有候選接線指示，沒有收到「接線完成」或通電轉動回報。
- 電池實際為四顆1.5 V AA，回報6.6 V；教師沿用既有降壓模組作補充測試，不更改學生4×1.2 V鎳氫採購方案。
- 降壓後空載：模組OUT顯示4.85 V、電表跨VOUT回報4.76 V；未測舵機負載、漣波、啟動或停止。
- 已要求電池OFF、USB拔除；**尚未收到最終斷電完成回覆**。下次操作先確認，不從聊天停止推定已關電。
- 現在不是完整遊戲測試成果；DHT11也不在本次測試中。

## 裝置與工具

BOARD-T01：YD-ESP32-S3 Type-A V1.5、ESP32-S3-WROOM-1 N16R8，放在400孔麵包板外側。
OLED背面MN096-12864-4G V1.0；U8g2 SSD1315建構子可顯示，不等於已確認晶片真實型號。
RGB為黑色HW-479元件面、B／G／R／−與板上電阻；較早藍色背面照片不能單獨證明同一PCB。
蜂鳴器HW-508，外側−／+、中間無明確功能標示；商品KY-012名稱不支配本次實物判定。
舵機標籤SG90；降壓板V591、晶片字樣疑似LM2596S ADJ，整板額定負載未確認。

編譯環境：Arduino CLI、Arduino-ESP32 3.3.11、U8g2 2.36.15，
FQBN `esp32:esp32:esp32s3:FlashSize=16M,PSRAM=opi`。序列115200 baud。
使用者IDE為2.3.10；早期截圖Flash Size是4 MB、USB CDC On Boot Disabled，與本次CLI設定不同。
使用者Upload的映像不能宣稱與此編譯輸出逐位元相同。

## 已回報接線：低功率部分

表內孔位是本次指定麵包板的實際交接，不是GPIO編號。a～e同側同列相通；跨列不相通。
不同階段的接法不要混搭；舊Week 2的GPIO4按鈕／GPIO5輸出不再是目前用途。

| 起點 | 終點／路徑 | 現況 |
|---|---|---|
| ESP32 GND | 棕線→a3 | 使用者依指示確認 |
| ESP32 3V3 | 紅線→a6 | 使用者依指示確認 |
| KY−／中間供電 | 綠線→c3／橘線→c6 | 保留 |
| KY S | 黃線→a15；c15藍線→GPIO4 | 目前ADC輸入 |
| Start四腳按鈕 | e20、f20、e22、f22；GPIO5→a20 | 按放1→0→1回報 |
| Finish四腳按鈕 | e27、f27、e29、f29；GPIO6→a27 | 按放1→0→1回報 |
| 按鈕共同地 | d3→a22；b22→a29 | 第22、29列為地節點 |
| OLED GND／VDD | b3／b6 | 使用者明確回覆VDD已接b6；供電公對母 |
| OLED SDA／SCK | GPIO8／GPIO9 | 兩端排針，母對母 |
| RGB R／G／B | GPIO15／16／17 | 母對母；測試HIGH有效、顏色正確回報 |
| RGB− | e3 | 公對母；第3列a～e已占滿，不再擠線 |
| 蜂鳴器控制 | GPIO18→a10；**1 kΩ電阻b10↔b12**；+→a12 | 1 kΩ保留，不旁路 |
| 蜂鳴器回路 | −→c22；中間腳不接 | 不接電池 |

早期直流測試的**d6→a10已移除**，才以GPIO18取代。不能把3V3和GPIO18同時接a10。
當前蜂鳴器程式將RGB維持全關；這不是RGB故障。不要在全部模組仍連接時任意回燒舊測試：
bringup與RGB版本未管理後來新增的蜂鳴器腳，必須依各版指定硬體先斷電拆開不適用負載。

## OLED、按鈕與光敏證據

![OLED正面實物，GND／VDD／SCK／SDA](../images/hardware/actual/OLED_1.jpg)

![OLED背面實物、板號與排針方向](../images/hardware/actual/OLED_2.jpg)

使用者回報透明支架已組裝，未提供最終整組照片；先前生成圖有排針／支架幾何不準確，
不納入接線或安裝驗證證據。正背原圖以SHA-256保存於照片目錄索引。

使用者Upload原文節錄：

```text
Wrote 347536 bytes (202211 compressed) at 0x00010000
Hash of data verified.
Hard resetting via RTS pin...
```

初期COM7對應原生USB（先前唯讀列舉VID303A／PID1001），不是CH343 UART。
依指示移到板上COM接頭後收到序列文字；目前UART的Windows COM號碼未再次確認，不能固定寫成COM7或COM8。
初次`no_oled_ack`後，斷電核對／重接指示之後收到0x3C；使用者沒有說明確切改了哪個接點，根因保留未知。

以下為使用者貼上的實際節錄，非示例：

```text
test=week7_t01_bringup controller_candidate=SSD1315
sda=8 scl=9 light=4 start=5 finish=6 buttons=INPUT_PULLUP
status=awaiting_visual_check oled_address=0x3C physical_pass=false
uptime_ms=1427 light_raw=1036 start=1 finish=1 display_write_attempted=true
uptime_ms=1927 light_raw=1044 start=1 finish=1 display_write_attempted=true
uptime_ms=2427 light_raw=1017 start=1 finish=1 display_write_attempted=true
```

其後使用者明確說「有看到秒數跟光的數字，遮光數字變小，一般光數字變大」。
這些log未標記各筆光線條件，不能把1036等數字指定為一般光或遮光基準；TIME是開機經過秒數，不是倒數。
後續按鈕接線與按放測試經使用者確認完成；上面只有1／1的節錄本身不是按鈕測試證據。
目前方向與較早Week 3遮光較大不同，舊資料保留；目前配置的分類門檻仍未核准，不能湊不同輪次校正。

## RGB與蜂鳴器證據

RGB程式在OLED回應且兩鍵放開後等3秒，依序要求紅2秒、綠2秒、藍2秒、全關。
使用者回報「燈號都正確」。這支持目前通道對應及HIGH有效，不是電流、長時間或光學干擾測試。
沒有獨立RGB Upload全文或最後實物照片。

蜂鳴器與外部電源完全分離後，2 kΩ量測：外側+/−為單獨1，中間對−、中間對+亦為1。
只記未取得檔內阻值，不判1 Ω、NC或故障。保持1 kΩ的短暫直流測試回報無聲；
之後改用GPIO18的受限波形，不因無聲改用6.6 V或取消限流。

使用者實際貼上：

```text
uptime_ms=16927 light_raw=730 start=1 finish=1 buzzer=READY
uptime_ms=17427 light_raw=730 start=1 finish=1 buzzer=READY
beep=command hz=2000 duration_ms=200 series_ohms=1000
beep=off reason=duration_complete sound_observation=pending
uptime_ms=17934 light_raw=723 start=1 finish=1 buzzer=DONE
uptime_ms=18434 light_raw=729 start=1 finish=1 buzzer=DONE
```

最初回報無聲，之後重送出現`beep=rejected reason=not_ready_or_used_or_button_held`。
說明一次開機只准一次測試後，使用者最終回覆「有聲音」；確切重啟／重試時刻未知，不補造第二段log。
可記指定1 kΩ／波形條件下有可聽反應；未量電流、真實聲長、波形、控制腳電壓或Reset瞬態。
兩個外側端點的受限測試不是已驗證的三線VCC／GND／S介面，也未確認有源／無源內部構造。

## 降壓模組與尚未完成的SG90

![VIN接四顆1.5 V電池，OUT未接；顯示輸入6.47](../images/hardware/actual/BuckConverter_3.jpg)

照片支持紅線VIN+、黑線VIN−、VOUT空接與IN指示燈亮。使用者切OUT回報6.07，
初期順時針6.05／6.09不能當穩定趨勢；之後逆時針回報降低至6、4.85。
最後電表VOUT回報4.76 V，使用者要求不再調到完全一致。保留兩表各自讀值，不作校準或負載核准。
4.76 V略低於4.8 V參考，下一階段須核對允許值、輸入餘量及負載穩定性，不能靠空載有數字就上完整作品。

下表只是已提出的**斷電候選接法，尚未確認完成、尚未通電**。
普通杜邦線、公針與麵包板是否足以承擔這顆舵機負載尚未確認；先檢查牢固接點、導線與容許電流，
若端子不能確實夾住接點，或負載路徑不合適，不能採這個候選接法上電。

| 起點 | 終點 | 當時提出的線材 |
|---|---|---|
| 降壓VOUT+ | a23 | 公對公，端子接點須可靠固定 |
| 降壓VOUT− | a24 | 公對公，同上 |
| SG90紅線接頭位置 | b23 | 公對公 |
| SG90棕線接頭位置 | b24 | 公對公 |
| c24 | d22既有GND | 公對公，共地參考 |
| SG90黃線接頭位置 | BOARD-T01標示7的排針（GPIO7） | 舵機端公、板端母 |

第23列只屬外部正極，不連第6列3V3、5Vin、USB電源或GPIO。只有負極參考共地。
GPIO7是廠商I/O資料支持的候選，沒有runtime或舵機實測。第一輪不裝舵盤指針、無外接機構。

## 已保存程式與驗證層次

原先本機暫存的三支程式已原樣歸檔至[BOARD-T01診斷來源](../../examples/board_t01_diagnostics/README.md)，
不替換Week 4～7的正式條件式範例。三支來源與原本本機檔案相同；正式程式仍GPIO=-1／gate=false。

| 診斷程式 | 當日CLI編譯程式bytes／靜態RAM bytes | 指定實物證據 |
|---|---|---|
| week7_t01_bringup | 352360／25568 | 使用者Upload校驗、OLED畫面、光線方向與兩鍵回報；使用者IDE設定不同 |
| week7_t01_rgb | 353212／25576 | 使用者三色正確回報；未提供獨立Upload全文 |
| week7_t01_buzzer | 361223／25708 | 使用者命令／off log與最後有聲回報；非代理量測 |

以上程式上限為所選應用分割區1310720 bytes，RAM上限327680 bytes，非整片Flash／全部執行期記憶體。
本次整理後文件、生成、編譯及呈現檢查結果另列於本頁末；未執行診斷程式host test或simulation。
代理未新增Upload、target test或接觸實體硬體。完整遊戲、SG90、DHT及電源負載測試均未新增實機結果。

## 明天接續點

1. 先確認電池OFF、USB拔除；核對是否已按候選表接SG90，以及負載接點是否合適。不能假定已接完。
2. 保留已完成的OLED、按鈕、RGB與限流蜂鳴觀察，不重跑相同實驗；如現物改變，才針對受影響路徑檢查。
3. 完成電源／線材確認後，準備只做小範圍、可停止的SG90診斷程式；核對初始化、上電順序與共地，再進行第一輪無負載動作及供電觀察。
4. SG90、負載及停止通過後，才對齊SSD1315相容設定、HW-508波形介面、本次KY校正與正式遊戲；目前沒有發布新的全班profile。

## 來源

- [板卡廠商](https://github.com/vcc-gnd/YD-ESP32-S3)：確切板卡I/O與USB／COM；不套其他DevKit PCB。
- [U8g2建構子](https://github.com/olikraus/u8g2/wiki/u8g2setupcpp)：顯示設定與位址不同。
- [HW-508供應商](https://electronicwork.shop/items/635b6a65211ac37c851a1e7e)、[原作者實作](https://hackaday.io/project/167920-how-to-use-buzzer-hw-508-with-skiiid)：無源／中間NC的候選參考，不證明手上內部構造。
- [Espressif LEDC](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html)：3.x腳位式API；不混用舊通道式範例。
- [TowerPro SG90](https://towerpro.com.tw/product/sg90-7/)、[TI LM2596](https://www.ti.com/product/LM2596)：元件參考，不代替本片市售模組或負載測試。

## 本次整理檢查

| 層次 | 本次結果 |
|---|---|
| 文件與連結 | `verify_course_materials.py`通過，涵蓋88份Markdown／Notebook文件；各週仍只有一個主教材入口 |
| 維護來源／生成 | Week 4與Week 5～7建構器產出後，以`--check`逐位元比對通過；正式嵌入程式與canonical來源一致 |
| 照片 | 44筆照片來源SHA-256通過、40張實物照均登錄；三張新圖原檔未後製；11週圖集相對資源檢查通過 |
| Notebook與呈現 | Week 4～7結構、表格、連結、圖片解碼通過；本機Edge 1200／420px無整頁橫向溢出，36張既有SVG文字邊界檢查通過；未測即時GitHub頁面 |
| 人工目視 | 檢視新增蜂鳴器判讀、OLED接頭／序列、降壓照片及兩表讀值、Week 7交接表與OLED圖集畫面，未見文字／圖片遮擋 |
| 程式來源與編譯 | 三支歸檔來源與本機原稿一致；逐支重新編譯通過，程式／RAM數字均與上表一致；未修改診斷邏輯或正式遊戲程式 |
| Host／simulation | 本次未執行；不把編譯算成邏輯或模擬通過 |
| Upload／target／實機 | 本次整理未新增；只保留本頁明列的使用者原始回報，不宣稱代理完成接線或量測 |
| 差異 | `git diff --check`通過，已檢閱維護文字與生成差異；Week 1只補OLED照片／圖說，採購表與預算未變；Week 2／3及其程式、圖片無Git差異 |

本機PROJECT已更新交接入口但不上傳；本次依要求commit，不push。
