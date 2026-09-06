# 學生任務單與紀錄模板

教師可依當週需要將單一區段貼入 LMS。不要每週重交同一份資料；已有內容
以連結或版本編號引用，再補本週新增的證據。

## 1. Lab Notebook

```text
組別／成員／角色：
日期／週次：
程式版本：
今天要驗證的問題：

硬體
- 開發板與模組：
- GPIO 與接線圖：
- 邏輯準位／供電／共地：
- 安全停止或斷電方式：

軟體與資料流
- Input -> ESP32 state/action -> Network -> Backend -> Database -> Phone
- 本週實際完成到哪一段：

測試證據
- 測試條件：
- 預期結果：
- 實際結果與 log／照片／影片：

錯誤與修正
- 現象：
- 根據哪項證據判斷：
- 修改：
- 重測結果：

AI 使用
- AI 產出：
- 人工修改與理由：
- 如何驗證：

下一次第一件事：
```

## 2. 實體作品與軟體用途

| 問題 | 本組回答 |
|---|---|
| 想製作什麼玩具或硬體？ |  |
| 誰會操作或使用？ |  |
| 實體輸入是什麼？ |  |
| 實體輸出或行為是什麼？ |  |
| 軟體要記錄哪些資料／事件？ |  |
| 軟體如何協助監看或操作？ |  |
| 斷線或錯誤時，硬體應怎麼做？ |  |
| 哪個結果可以證明作品有完成？ |  |

## 3. 開發環境證據

| 項目 | 實際設定 | 成功證據／錯誤 |
|---|---|---|
| Board model |  |  |
| Board revision／外觀辨識 |  |  |
| USB port |  |  |
| Arduino-ESP32 version |  |  |
| 上傳 |  |  |
| Serial baud rate／輸出 |  |  |

## 4. 上電前檢查

| 檢查 | 結果 | 證據或修正 |
|---|---|---|
| 已核對板卡與模組供電規格 |  |  |
| ESP32 GPIO 未直接收到未保護的 5V |  |  |
| 電源正負極與麵包板電源軌正確 |  |  |
| LED 有限流；輸入有必要的上拉／下拉 |  |  |
| 外部電源與 ESP32 訊號共地 |  |  |
| 馬達／舵機不由 GPIO 供電 |  |  |
| 已先測 stop／timeout／斷電方式 |  |  |
| 線材固定且不會因機構移動短路 |  |  |

## 5. GPIO 與接線表

| 模組／腳位 | VCC | GND | Signal GPIO | 邏輯準位 | 方向 | 備註 |
|---|---|---|---|---|---|---|
|  |  |  |  |  | input／output |  |
|  |  |  |  |  | input／output |  |
|  |  |  |  |  | input／output |  |

## 6. 感測品質測試

| 測試條件 | Raw value | 處理後值／狀態 | 有效？ | 原因／限制 |
|---|---:|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 教材指定的安全異常情境 |  |  |  |  |

請回答：取樣間隔、門檻、去抖／平滑、無效值與教材指定的異常情境分別如何處理？

## 7. 致動器與供電測試

| 測試 | 電源 | 控制值 | 負載 | 預期 | 實際 | 是否安全停止 |
|---|---|---:|---|---|---|---|
| 無負載 |  |  |  |  |  |  |
| 輕負載 |  |  |  |  |  |  |
| timeout |  |  |  |  |  |  |
| 重開機 |  |  |  |  |  |  |

## 8. 單機互動狀態表

| State | Input／觸發 | Action／Output | 結束條件 | Timeout | Error／Recovery |
|---|---|---|---|---|---|
| idle |  |  |  |  |  |
| active |  |  |  |  |  |
| success |  |  |  |  |  |
| error |  |  |  |  |  |
| reset |  |  |  |  |  |

| Run | 成功／失敗 | 完成時間 | 誤觸發 | 失敗原因 | 下次修改 |
|---:|---|---:|---:|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |

## 9. 事件與命令格式

### Device event

```json
{
  "device_id": "team01-device01",
  "event_type": "action_completed",
  "value": 1,
  "state": "idle",
  "timestamp": "2026-10-14T14:30:00+08:00"
}
```

### Command and result

```json
{
  "command_id": "7d27d95a-7742-44cb-a10a-a4702bc71ba4",
  "device_id": "team01-device01",
  "command": "start",
  "parameters": {},
  "requested_at": "2026-10-14T14:30:00+08:00"
}
```

```json
{
  "command_id": "7d27d95a-7742-44cb-a10a-a4702bc71ba4",
  "device_id": "team01-device01",
  "result": "done",
  "message": "action completed",
  "completed_at": "2026-10-14T14:30:03+08:00"
}
```

| 欄位 | 必要理由 | 產生者 | 使用者 | 無效時如何處理 |
|---|---|---|---|---|
| device_id |  |  |  |  |
| event_type／command |  |  |  |  |
| timestamp |  |  |  |  |
| state／result |  |  |  |  |
| command_id |  |  |  |  |

## 10. 通訊與除錯分段表

| 檢查位置 | 成功證據 | 失敗證據 | 本組結果 |
|---|---|---|---|
| ESP32 input／state | Serial log | 無讀值／狀態錯 |  |
| Wi-Fi | IP、連線狀態 | 斷線／認證失敗 |  |
| HTTP／MQTT | status／publish | timeout／錯 topic |  |
| Backend | request log | validation error |  |
| Database | 新增 row | transaction／schema error |  |
| WebSocket | client update | disconnected／stale |  |
| Phone UI | 正確狀態／結果 | 不更新／誤導 |  |

## 11. 第一次專題報告準備（第8週）

| 欄位 | 內容 |
|---|---|
| Project title |  |
| User and use scenario |  |
| Physical input |  |
| Physical output／behavior |  |
| What the software records |  |
| How the software assists operation |  |
| Working hardware fragment |  |
| Device -> Backend -> Database -> Phone data flow |  |
| Materials already available |  |
| Proposed purchases and estimated cost |  |
| Power／driver／logic-level risks |  |
| Three main project risks |  |
| Minimum acceptable Week 13 milestone |  |
| Minimum acceptable final result |  |

## 12. MQTT Topic 表

| Purpose | Topic | Publisher | Subscriber | Payload | Retained／QoS |
|---|---|---|---|---|---|
| telemetry |  |  |  |  |  |
| event |  |  |  |  |  |
| command |  |  |  |  |  |
| acknowledgement |  |  |  |  |  |
| presence |  |  |  |  |  |

## 13. Database 與 log 設計

| 資料 | 保存位置 | 主要欄位 | 保留理由 | 查詢／分析 |
|---|---|---|---|---|
| Sensor reading |  |  |  |  |
| Device event |  |  |  |  |
| Command／result |  |  |  |  |
| System error |  |  |  |  |

請用一筆 log 回答：何時、哪台裝置、發生什麼、系統怎麼處理、最後結果是什麼？

## 14. 手機使用流程

| Step | User action | System response | Stored evidence | Error state |
|---:|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |

## 15. 第二次專題報告準備（第13週）

| 檢查 | 完成 | 證據 |
|---|---|---|
| 一項真實硬體或軟硬整合片段可重複展示 |  |  |
| 裝置端進度已標示並附證據 |  |  |
| Backend進度已標示並附證據 |  |  |
| Database與log進度已標示並附證據 |  |  |
| 手機介面進度已標示並附證據 |  |  |
| mock與真實資料已清楚區分 |  |  |
| 一項目前問題或風險有具體證據 |  |  |
| 回饋已轉成有優先順序的修正項目 |  |  |
| 每項修正有負責人、完成條件及預計週次 |  |  |
| Week 13進度commit或tag可辨識 |  |  |

## 16. 故障測試與乾淨環境重建（第15週）

| 故障 | 操作方式 | 預期硬體狀態 | 預期手機狀態 | Log | Recovery | 實際結果 |
|---|---|---|---|---|---|---|
| 感測異常 |  |  |  |  |  |  |
| 網路中斷 |  |  |  |  |  |  |
| 錯誤命令／重複操作 |  |  |  |  |  |  |
| 服務停止 |  |  |  |  |  |  |

## 17. 專題進度與期末展示證據（第13至17週）

| 項目 | 完成 | 版本／證據 |
|---|---|---|
| 原始碼已 commit |  |  |
| 接線圖與實物一致 |  |  |
| Backend／Database 可依文件重建 |  |  |
| Wi-Fi／secret 未提交 |  |  |
| 三項異常測試完成 |  |  |
| 兩次完整彩排完成 |  |  |
| 展示影片與斷線備案完成 |  |  |
| 每位成員可解釋一條資料或命令路徑 |  |  |
