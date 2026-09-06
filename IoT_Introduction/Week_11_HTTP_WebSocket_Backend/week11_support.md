# Week 11支援資料

本檔提供課前檢查、網路紀錄、命令追蹤、分層故障排查與延伸實作。核心操作依
[Week 11主教材](week11_main.md)順序完成。

## 課前安裝Python與Git

在Windows開始功能表搜尋Python與Git；在PowerShell分別執行`python --version`與`git --version`。若找不到，依[Python Windows官方文件](https://docs.python.org/3/using/windows.html)與[Git官方下載](https://git-scm.com/downloads)安裝，重新開啟PowerShell再測。記錄實際版本與路徑；不要在原本正常的環境同時升級多個套件。無安裝權限時先回報教師，不繞過學校安全設定。

執行`git status`確認自己的修改，再依主教材進入`examples/course_backend`建立虛擬環境。虛擬環境（virtual environment）是本專案專用的Python套件位置，不是另一台電腦。命令出現版本號表示可啟動，不代表Backend或硬體測試完成。

## 一、課前環境與器材確認

### 軟體與檔案

| 項目 | 檢查方法 | 實際結果 | 可開始條件 |
|---|---|---|---|
| 本機repository | `git status`、`git pull --ff-only` |  | 無未處理衝突；可看到Week 11與Backend |
| Python | PowerShell執行`python --version` |  | 可啟動且版本已記錄 |
| Git | PowerShell執行`git --version` |  | 可執行Git命令 |
| Arduino IDE | 開啟IDE並讀取About／版本畫面 |  | Week 7相同環境可用 |
| esp32 board package | Boards Manager讀取已安裝版本 |  | Week 7相同版本可用 |
| ArduinoJson | Library Manager搜尋已安裝版本 |  | Verify時可找到`ArduinoJson.h` |
| Backend檔案 | 開啟`examples/course_backend` |  | `app.py`、`requirements.txt`、`static`存在 |

版本不是越新越好；本週先記錄實際版本，不在同一次除錯中同時升級Python、board
package與library。

### 學生自備器材

| 品項 | 數量 | 本週用途 | 上電前確認 |
|---|---:|---|---|
| ESP32-S3開發板（依核准的確切板卡） | 1 | Wi-Fi裝置與GPIO控制 | 型號、USB端口、排針無彎折 |
| USB資料線 | 1 | Upload及USB供電 | Week 7已驗證可傳資料 |
| 400孔麵包板 | 1 | START、STOP與RGB接線 | 電源軌方向已辨認 |
| 四腳按鈕 | 2 | START與本機STOP | Week 7按鈕腳位方向已辨認 |
| KY-016 RGB模組 | 1 | IDLE／ACTIVE／ERROR輸出 | Week 5 ON level已記錄 |
| 杜邦線 | 依profile | 訊號、3V3與GND | 無鬆脫、破皮、焦痕 |
| 筆電與手機 | 各1 | Backend與mobile browser | 能加入同一可信任LAN |

本週不使用4AA電池盒、SG90與蜂鳴器；避免把網路故障和外部供電故障混在一起。

## 二、網路身分與秘密檢查表

### 網路身分表

| 欄位 | 實際值 | 如何取得 | 是否可出現在公開截圖 |
|---|---|---|---|
| Backend筆電LAN IPv4 |  | `ipconfig`目前Wi-Fi adapter | 可局部遮蔽 |
| Backend port | `8000` | 啟動命令 | 可以 |
| ESP32 IPv4 |  | Serial Monitor | 可局部遮蔽 |
| 手機目前Wi-Fi名稱 |  | 手機Wi-Fi設定 | 視環境遮蔽 |
| `DEVICE_ID` |  | 程式常數 | 可以，但不得含個資 |
| API base URL |  | `secrets.h` | 公開前遮蔽IP |
| operator key | 不抄入本表 | PowerShell暫存值 | 不可以 |
| Wi-Fi密碼 | 不抄入本表 | 網路管理者提供 | 不可以 |

### 提交前秘密掃描

在repository根目錄執行下列檢查前，先把搜尋字串替換成**自己密碼的一小段獨特片段**；
不要把完整密碼貼入終端截圖：

```powershell
git status --short
git diff --cached --name-only
rg -n "replace-with-wifi|replace-with-your-temporary" .
```

另外人工確認：

- `secrets.h`沒有被`git status`列出。
- 螢幕錄影沒有拍到PowerShell中的operator key。
- 手機頁面截圖裁掉key輸入欄。
- `DEVICE_ID`不含姓名、學號、電子郵件或手機號碼。

## 三、命令追蹤與資料流紀錄

### 事件資料流表

| 檢查點 | 應觀察欄位 | 實際證據 | 結論 |
|---|---|---|---|
| ESP32產生事件 | event type、state、uptime | Serial行號／截圖 |  |
| HTTP request | method、path、body | Serial `POST`紀錄 |  |
| HTTP response | status code | `201`或錯誤碼 |  |
| Backend驗證 | action、device、valid | Backend structured log |  |
| SQLite保存 | id、recorded_at | Events歷史查詢 |  |
| WebSocket推送 | connection、event | 手機未刷新更新 |  |

### 命令追蹤表

| `command_id` | 目標device | command | requested | accepted | terminal result | 實體輸出 | 說明 |
|---|---|---|---|---|---|---|---|
|  |  | start |  |  |  |  |  |
|  |  | stop |  |  |  |  |  |
|  |  | start in ERROR |  |  | rejected |  |  |
|  |  | unknown |  |  | rejected |  |  |

若`requested`後沒有結果，先問「ESP32是否使用相同device ID取得命令」，不要直接寫
「ESP32壞掉」。若有`accepted`但沒有terminal result，表示裝置已收到，故障範圍已縮小
到執行或結果回報階段。

### HTTP證據表

| Method | Path | 正常status | 此請求的意義 |
|---|---|---:|---|
| POST | `/api/events` | 201 | 新增一筆裝置事件 |
| GET | `/api/events` | 200 | 讀回歷史事件 |
| POST | `/api/commands` | 201 | 建立有權限的控制命令 |
| GET | `/api/devices/<id>/commands/next` | 200／204 | 有待處理命令／目前沒有命令 |
| POST | `/api/commands/<id>/result` | 200／409 | 更新accepted或最終結果／拒絕覆寫terminal status |
| GET | `/api/commands` | 200 | 讀回命令歷史 |
| GET | `/api/stats` | 200 | 讀取事件與命令統計 |

## 四、分層故障排查表

所有接線檢查都先拔USB。本表的「第一個檢查」刻意限制成單一動作，避免一次更動多項
設定後失去因果證據。

| 症狀 | 最可能層次 | 第一個安全檢查 | 正常基準 | 下一步 |
|---|---|---|---|---|
| `python`找不到 | host環境 | 執行`where.exe python` | 顯示一個可用路徑 | 回課前安裝，不改ESP32 |
| Uvicorn無法啟動 | Backend | 讀第一行traceback | 無紅色exception | 查套件或port占用 |
| `127.0.0.1:8000`打不開 | Backend | 看Uvicorn是否仍執行 | 顯示running | 修正Backend後再測LAN |
| host POST得到422 | JSON/API | 讀response的`detail` | 欄位驗證成功為201 | 核對拼字與資料型別 |
| 手機打不開但筆電可開 | LAN/firewall | 比對手機與筆電Wi-Fi名稱 | 同一LAN | 核對LAN IP及private firewall |
| 手機顯示頁面但disconnected | WebSocket | 看Backend `/ws`連線log | connected | 先重載一次，再查proxy/network |
| ESP32一直`0.0.0.0` | Wi-Fi | Serial輸入`status` | `wifi=connected` | 核對SSID與2.4 GHz可用性 |
| ESP32 status為負數 | HTTP transport | 核對`API_BASE_URL`的LAN IP | POST為201 | 確認Backend與port |
| GET持續204 | command routing | 比對手機與ESP32 device ID | 完全相同 | 查看命令是否送給別的ID |
| 命令停在requested | device poll | 看ESP32是否持續loop | 有poll且Wi-Fi連線 | 查device ID、Backend URL |
| 命令停在accepted | device execution | 找同ID後續Serial行 | 最終done/rejected/error | 查程式分支與POST result |
| START按鈕無事件 | hardware input | 拔USB後核對INPUT_PULLUP與GND | Week 7按鈕接法一致 | 不先改網路 |
| RGB顏色相反 | hardware profile | 拔USB後核對ON level | Week 7按鈕／Week 5 RGB profile一致 | 不隨機交換GPIO |
| Backend關閉後STOP失效 | safety architecture | 立即拔USB | STOP本機生效 | 把STOP讀取移出網路條件 |
| 板子發熱或重開 | electrical/power | 立即拔USB | 板子常溫、穩定Serial | 不再上電，檢查短路與供電 |

## 五、故障注入紀錄

每次故障以一列記錄，完成後必須回到baseline再測下一項。

| 故障 | 唯一改變的變因 | 預測 | 實際現象 | 故障層次 | 復原動作 | baseline恢復證據 |
|---|---|---|---|---|---|---|
| 錯誤device ID |  |  |  |  |  |  |
| 錯誤Backend IP |  |  |  |  |  |  |
| Backend停止 |  |  |  |  |  |  |
| 未知命令 |  |  |  |  |  |  |

可接受的結論應指出觀察位置，例如「ESP32仍取得Wi-Fi IP，但POST沒有HTTP status，
修正Backend host後恢復201」；不可只寫「連不上」或「重開就好了」。

## 六、Lab Notebook模板

```text
日期：2026-11-18
姓名／組別：
本機commit：

Host環境：
- Python：
- FastAPI／Uvicorn：
- Backend host test：通過／未通過，證據：

Target環境：
- ESP32 board package：
- ArduinoJson：
- DEVICE_ID：
- Week 7按鈕／Week 5 RGB profile來源：
- Verify：通過／未通過，證據：
- Upload：通過／未通過，證據：
- Physical test：通過／未進行／失敗，證據：

完整事件：
- 實體輸入：
- HTTP status：
- Backend event id：
- 手機WebSocket現象：

完整命令：
- command_id：
- requested：
- accepted：
- terminal result：
- 實體輸出：

本機STOP在Backend關閉時的結果：

本次故障：
- 唯一變因：
- 預測：
- 觀察：
- 定位層次：
- 復原：
```

## 七、延伸實作

完成主教材所有核心項目後，再選一項。每次保留原始可運作版本，另開Git branch或
複製sketch；不得一邊修baseline一邊加入延伸功能。

### 延伸A：加入KY-018遙測

沿用Week 3已驗證的signal GPIO、有效raw範圍與校正方向，每兩秒新增一筆
`light_sample`。資料必須包含`valid`與`reason`；無效值不能觸發ACTIVE。

完成條件：正常光線與教材指定的無效資料情境在手機上可分辨，而且HTTP event rate
不超過每兩秒一筆。

### 延伸B：量測端到端延遲

Backend的`recorded_at`由伺服器產生，ESP32提供`uptime_ms`。連續按START十次，記錄
按下、Backend收到與手機顯示的觀察時間。不要把不同時鐘直接相減成精確延遲；先說明
時鐘來源與測量誤差，再比較相對變化。

### 延伸C：讓錯誤狀態更可見

在手機頁面中，把`rejected`、`timeout`、`error`用不同文字標籤顯示。不得只靠紅綠色，
因為顏色不是所有使用者都能可靠辨識。

### 延伸D：Backend API探索

開啟`http://127.0.0.1:8000/docs`，對`GET /api/events`使用`device_id`與
`event_type`filter。記錄原始筆數、篩選條件與篩選後筆數；不刪除database。

## 八、官方與repository參考

- [Espressif Arduino Wi-Fi API](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html)
- [FastAPI WebSocket官方文件](https://fastapi.tiangolo.com/advanced/websockets/)
- [課程Backend完整執行說明](../../examples/course_backend/README.md)
- [課程Backend程式](../../examples/course_backend/app.py)
- [Week 7按鈕與整合經驗](../Week_07_Traffic_Light_Challenge/week7_main.ipynb)（本週將Finish改作STOP，不沿用遊戲送出規則）

官方文件用來確認API行為；本課的欄位名稱、命令狀態與安全限制則以本教材和課程
Backend為準。
