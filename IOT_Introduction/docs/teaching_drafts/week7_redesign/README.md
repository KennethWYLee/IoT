# Week 7 紅綠燈遮光挑戰重設稿

2026-09-17。延續教師核定的「一起操作、看到結果、再解釋」方式。
本輪只新增重設稿，未取代正式 Week 7 notebook／PDF，也未變更課綱、採購或評分。

同日依[原逐頁檢查報告](../../lab_notes/2026-09-17-week2-7-page-review/report.md)補完整配置、上傳順序、明確孔位及返回低功率版步驟，並將開始、計分、結束拆成三局練習。更新後 48 頁；見[修正紀錄](../../lab_notes/2026-09-17-week2-7-operation-fixes.md)。沒有新增實物或學生跟做測試。

- [講義 PDF](week7_main.pdf)
- [維護來源](week7_main.md)
- [唯一完整遊戲程式](../../../examples/week07_traffic_light_challenge/week07_traffic_light_challenge.ino)
- [事件測試原始輸出](event_test_results.json)
- [檢查及限制](review.md)

## 閱讀安排

| 頁 | 內容 |
|---|---|
| 1–4 | 作品、取得程式、規則演示、時間安排 |
| 5–7 | GPIO、設定及裸板上傳 |
| 8–13 | 供電列、兩鍵、KY、RGB、OLED、第一次開機 |
| 14–16 | 三局分開練習：開始、計分、結束 |
| 17–25 | 計時、事件、門檻、優先順序、狀態、log、故障、概念題與解答 |
| 26–29 | 有條件加入舵機與蜂鳴器、設定、布局及光學干擾 |
| 30–31 | 返回低功率版；同樣30秒，每色從3秒改5秒 |
| 32–33 | 改每色1.5秒的練習，下一頁解答 |
| 34–36 | 排錯、證據與報告銜接、來源 |
| 37–48 | 自動嵌入的完整遊戲程式 |

## 使用限制

先讀[硬體狀態](../../hardware/hardware_state.md)及[Week 6檢查](../week6_redesign/review.md)。
Stage 1 不啟用舵機／蜂鳴器，也不配置它們的PWM資源；仍需先確認低功率模組、GPIO、RGB限流、OLED邏輯與光線基準。
Stage 2 同時加入舵機及蜂鳴器，不是假定其中一個可隨意省略的模式。

SG90、帶載電源、上電順序、聲長及整合停止仍沒有新增實測。
尤其先 a 後外部 ON 的流程，需要確切器材已確認不由signal異常回灌。
未完成前保持 Stage 1、外部電源與舵機／蜂鳴器分離；不是把false改true就完成安全條件。

主機測試中的GPIO4～11與300～320／900～920是替代I/O資料，不是T01的全班接線表。
學生只使用與自己的實物相符的已確認設定。接線使用功能表及明確孔組，不能混合其他日期的孔號。

## 重建與檢查

在repo根目錄執行：

```powershell
python IOT_Introduction/docs/teaching_drafts/week7_redesign/test_events.py
node IOT_Introduction/docs/teaching_drafts/week7_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week7_redesign/verify.py
python IOT_Introduction/scripts/verify_game_host.py 7
python IOT_Introduction/scripts/verify_game_host.py 7 --tone --oled1315
```

Node需marked／playwright及Edge，Python需PyMuPDF／Pillow，主機測試需MSVC或g++／clang++。
沿用前週builder的固定A4、照片嵌入、完整程式對照與LF正規化hash；不直接修改生成的PDF。

`test_events.py`只在忽略的tmp產生測試設定，讀同一份正式.ino。
比較每色3000／5000／1500 ms × OLED1306／1315，保持30秒、目標6、取樣與穩定參數一致。
餵入的是「已確認的事件」，不是用滑鼠／感測器量得的手勢；原始輸出保存在event_test_results.json。
`verify.py`另以Python餘數算式核對表格、紅綠總時數、主機輸出、來源及測試hash和相鄰解答頁。

Arduino基準：Arduino-ESP32 3.3.11、U8g2 2.36.15、ESP32Servo 3.2.1。
本機另有全域ESP32Servo3.2.0，需明確用既有版本路徑；該本機路徑不隨Git發布，另一台先安裝相同版本。

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=default --libraries _outputs/profile_compile/arduino_user/libraries IOT_Introduction/examples/week07_traffic_light_challenge
```

沒有Upload或實物操作。正式.ino未修改，3種節奏只是課堂修改示例及tmp的主機變體，不另外維護重複遊戲程式。
HTML、tmp、渲染與編譯產物不提交。第六週既有未提交內容和無關examples/保持原狀。
