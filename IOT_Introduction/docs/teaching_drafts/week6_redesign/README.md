# Week 6 舵機紙指針重設稿

更新：2026-09-17。教師要求接續 Week 2–5 的同步操作方式重設第六週。
這是供教師審閱的完整草稿；尚未取代正式 Week_06_Servo_Pointer 的 notebook／PDF。

2026-09-17 已依[原逐頁檢查報告](../../lab_notes/2026-09-17-week2-7-page-review/report.md)補齊 OLED 供電引線、設定欄位、STOP 孔位、共地與操作順序。更新後 49 頁；見[修正紀錄](../../lab_notes/2026-09-17-week2-7-operation-fixes.md)。端子匹配、帶載供電及舵機設定仍缺實物確認，不是實物驗證通過版。

- [閱讀講義](week6_main.pdf)
- [維護來源](week6_main.md)
- [裸板數字預覽](count_preview/count_preview.ino)
- [既有受限紙指針](../../../examples/week06_servo_pointer/week06_servo_pointer.ino)
- [新增加減計數指針](serial_pointer_counter/serial_pointer_counter.ino)
- [檢查及限制](review.md)

## 內容安排

| 頁 | 用途 |
|---|---|
| 1–5 | 成果預覽、取得程式、流程、裸板 Serial 運算 |
| 6–13 | 實物、三線功能、供電、電表、設定及上傳 |
| 14–21 | STOP 接線、受限動作、電流及資訊流 |
| 22–27 | 紙指針、OLED 設定與接線、共同 count、停止與故障 |
| 28–29 | 概念題與緊接的參考解答 |
| 30–32 | Serial +／− 加減計數延伸 |
| 33–34 | 每次兩格改造題與緊接的參考解答 |
| 35–36 | 收尾、銜接、來源與限制 |
| 37–49 | 三份完整程式，自動從來源嵌入 |

## 課前尚未解決的必要條件

先讀[硬體狀態](../../hardware/hardware_state.md)。沒有新增實物測試。
既有 SG90 仍未核准帶載供電、脈寬、位置區間、啟動順序、停止及接頭負載能力。
特別是現有 a 流程會先在工作電源 OFF 時輸出 signal，必須確認確切舵機不會異常回灌；
若不能確認，該流程不得直接上電。可能需要修改電氣介面或啟動策略，不可自行猜接法。

課前完成與器材相符的設定表後才能同步帶做舵機。不是要求每組上課排隊取得教師簽核。
程式保留 false／-1；只看到 blocked 不算實作完成。未完成條件時可做數字預覽與斷電辨識，
但不能聲稱已完成舵機定位。本次沒有改採購或課程配分，也沒有把供電未驗證改成已通過。

## 建置與檢查

在 repo 根目錄執行（Node 需能載入 marked／playwright，需 Edge）：

```powershell
node IOT_Introduction/docs/teaching_drafts/week6_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week6_redesign/verify.py
python IOT_Introduction/docs/teaching_drafts/week6_redesign/test_host.py
python IOT_Introduction/scripts/verify_game_host.py 6
```

`build.cjs` 使用 Week 5 的固定 A4 排版、圖片內嵌、完整程式附錄及雜湊規則；
Markdown／builder／.ino 是維護來源，不直接修改 PDF。
`verify.py` 比對來源雜湊、完整程式、練習相鄰頁、答案運算，並渲染全部頁面。

`test_host.py` 使用既有 game 測試替身與 C++ 編譯器。只在忽略的 tmp 中替換設定；
值 30～150、GPIO7／10 等都是主機測試資料，不是核准硬體設定。
兩種步進（1／2）、兩種 OLED 選項（1306／1315）各跑新測試及原有 Week 6 回歸測試。

Arduino 基準：Arduino-ESP32 3.3.11、ESP32Servo 3.2.1、U8g2 2.36.15；
本機另有全域 ESP32Servo 3.2.0，這次必須明確指定 repo `_outputs/profile_compile/arduino_user/libraries`
內既有的 3.2.1 與 U8g2。該目錄不隨 Git 發布；另一台電腦應安裝相同版本，不可依賴存在此路徑。

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=default --libraries _outputs/profile_compile/arduino_user/libraries IOT_Introduction/docs/teaching_drafts/week6_redesign/serial_pointer_counter
```

不用 Upload 命令。目標編譯與主機假 I/O 通過均不代表舵機實測通過。
HTML、tmp、編譯產物與渲染圖不提交；成果 PDF、來源、程式與檢查摘要可版本化。
