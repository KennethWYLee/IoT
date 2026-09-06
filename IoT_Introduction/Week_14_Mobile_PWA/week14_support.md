# Week 14支援資料

本檔提供mobile workflow、interface state、permission、responsive、PWA與fault test表。核心
操作見[Week 14主教材](week14_main.md)。

## 一、手機與瀏覽器測試環境

| 項目 | 實際值 | 取得方式 | 注意事項 |
|---|---|---|---|
| 手機作業系統／版本 |  | Settings | 不記裝置序號或帳號 |
| 瀏覽器／版本 |  | Browser About | 安裝支援因browser而異 |
| Viewport直向 |  | DevTools或實測 | 不用型號名稱代替寬度 |
| Viewport橫向 |  | DevTools或實測 | 旋轉後重測核心流程 |
| Backend URL |  | LAN IP與port | 截圖可局部遮IP |
| Transport | HTTP／HTTPS | address bar | 決定secure context條件 |
| WebSocket | ws／wss | page／DevTools | 應與頁面protocol一致 |
| Device ID |  | 程式profile | 不含個資 |

## 二、手機核心流程表

| 步驟 | 使用者動作 | 預期畫面回饋 | Backend證據 | ESP32／實體證據 | 實際結果 |
|---:|---|---|---|---|---|
| 1 | 開啟URL | network、WebSocket、role可見 | GET與WS連線 | 無非預期動作 |  |
| 2 | 輸入device ID | loading後events／stats | filtered GET | ID一致 |  |
| 3 | Viewer嘗試操作 | button disabled | 無command row | 輸出不變 |  |
| 4 | 輸入operator key | role提示key entered | 尚未驗證 | 輸出不變 |  |
| 5 | 送start | requested／accepted／done | 同command ID | RGB變綠 |  |
| 6 | 送stop | requested／accepted／done | 同command ID | RGB安全紅色 |  |
| 7 | Backend停止 | disconnected／failure／stale | 程序停止 | 本機STOP仍有效 |  |

## 三、Interface State Matrix

| State | 如何建立 | 必須顯示 | 按鈕狀態 | 不可顯示 | 實際證據 |
|---|---|---|---|---|---|
| Loading | 第一次refresh | Loading文字 | 暫停送出 | Empty／success |  |
| Empty | 未知device、API成功 | 沒有符合資料 | 依權限 | Failure |  |
| Live | WS connected | Connected＋更新時間 | 依權限 | Offline |  |
| Pending | command created | command ID／requested | 防重複送出 | Done |  |
| Accepted | device收到 | accepted | 視動作決定 | Physical done |  |
| Done | device完成 | done與message | 可下一步 | Pending |  |
| Rejected | 安全規則拒絕 | rejected與reason | 保持安全 | Done |  |
| Timeout | 超過deadline | timeout與ID | 不自動重送 | Success |  |
| Failure | API 403／500 | status與detail | 視原因停用 | Empty |  |
| Disconnected | WS關閉 | disconnected/retrying | 停用remote | Connected |  |
| Offline | browser offline | offline＋last success | 停用remote | Live |  |
| Stale | 舊資料仍在 | last success time | 停用或警告 | Current/now |  |

## 四、Responsive檢查表

### 直向手機

- [ ] Address bar下不需雙指縮放即可讀第一層狀態。
- [ ] 頁面沒有整體水平scroll。
- [ ] Device ID、key與command控制完整可見。
- [ ] Input有label，聚焦後software keyboard不遮住必要動作。
- [ ] Button高度與間距足以避免相鄰誤觸。
- [ ] Long ID、reason、timestamp能換行或安全截斷。
- [ ] Events／commands每個value仍有欄名，不只剩數字。
- [ ] Error不只靠紅色，success不只靠綠色。

### 橫向手機／寬螢幕

- [ ] 旋轉後不遺失device、key或pending state。
- [ ] Layout使用增加寬度，但閱讀順序一致。
- [ ] Table header與cell對齊。
- [ ] Zoom至200%仍能使用核心操作。
- [ ] Keyboard-only desktop可依合理tab order操作。

## 五、Permission Test Matrix

| Case | UI state | Request header | 預期HTTP | Database新增 | ESP32動作 | 實際 |
|---|---|---|---:|---|---|---|
| Viewer／空key | disabled | 無 | 不應送出 | 否 | 否 |  |
| DevTools移除disabled／空key | 可點 | 無 | 403 | 否 | 否 |  |
| Wrong key | 可點 | 錯誤key | 403 | 否 | 否 |  |
| Valid key／錯device | 可點 | 正確key | 201 | 是 | 無，最後timeout |  |
| Valid key／正確device | 可點 | 正確key | 201 | 是 | 依命令 |  |
| Offline／valid key | disabled | 不送出 | 無 | 否 | 否 |  |

UI顯示`operator key entered`只是local input state。只有Backend的HTTP result能證明授權成功。

## 六、Command Trace

| 時間 | 層次 | command_id | status | message | physical state |
|---|---|---|---|---|---|
|  | Mobile request |  | requested |  | IDLE |
|  | Backend |  | requested |  | IDLE |
|  | Device |  | accepted |  | IDLE／processing |
|  | Device result |  | done／rejected |  |  |
|  | WebSocket UI |  | terminal |  |  |

若手機顯示done但實體不符，介面驗收失敗；不能以Backend row取代physical evidence。

## 七、Responsive Web與PWA證據表

| Capability | 測試URL／context | 需要條件 | 觀察方法 | 結果 | 可使用的結論 |
|---|---|---|---|---|---|
| Responsive layout | Phone LAN HTTP | viewport、CSS | 真實手機workflow |  |  |
| Manifest可讀 | Desktop localhost | manifest link | DevTools Application |  |  |
| Service worker registered | Desktop localhost | localhost secure context | DevTools |  |  |
| Shell cache | Desktop localhost | active SW | offline reload |  |  |
| API freshness | Online／offline | `/api/`不以舊cache冒充 | 關Backend |  |  |
| Phone installability | Phone | HTTPS或符合browser條件 | install UI／installed launch |  |  |
| Phone offline behavior | Installed PWA | active SW與設計策略 | airplane/offline test |  |  |

Repository中存在manifest、icon與sw，只能證明檔案存在。安裝按鈕、installed icon、standalone
launch及offline behavior必須實際測試後才能標示通過。

## 八、Fault Injection表

| 故障 | 唯一變因 | UI預測 | Backend／WS觀察 | 實體預測 | 實際 | 復原證據 |
|---|---|---|---|---|---|---|
| Wrong key |  | 403 failure | denied log | 不動作 |  |  |
| Unknown device |  | pending→timeout | command row | 不動作 |  |  |
| ESP32 offline |  | timeout | no ack | 不動作 |  |  |
| Backend stopped |  | disconnected／failure | process off | STOP仍本機有效 |  |  |
| Phone network off |  | offline／stale | WS close | 裝置保持安全 |  |  |
| Malformed API data |  | readable failure | 422 | 不動作 |  |  |

## 九、Usability Observation表

請另一位同學只依頁面文字完成核心流程。不得提供口頭操作步驟；可以阻止不安全動作。

| Task | 第一次找到控制所需步驟 | 誤觸／疑問 | 完成／失敗 | 要修改的label、order或feedback |
|---|---:|---|---|---|
| 找到connection state |  |  |  |  |
| 選擇device |  |  |  |  |
| 辨認viewer限制 |  |  |  |  |
| 送安全command |  |  |  |  |
| 找terminal result |  |  |  |  |
| 判斷offline／stale |  |  |  |  |

## 十、故障排查表

| 症狀 | 第一個檢查 | 正常基準 | 下一步 |
|---|---|---|---|
| 手機頁面完全打不開 | 筆電localhost是否可開 | Backend running | 查LAN IP／firewall |
| 手機版像縮小桌面 | 檢查viewport meta | device-width | 再查CSS fixed width |
| 頁面水平scroll | 找超出viewport元素 | main width flexible | 查table、long text、fixed px |
| Loading不結束 | Network panel第一個failed request | API 200 | 顯示catch failure |
| Empty與failure相同 | 比較HTTP 200空array與exception | 不同文字 | 分開render路徑 |
| WS connected但歷史空 | 直接測GET API | history independently works | 查filter ID |
| History有資料但live不更新 | 看WS status | connected | 查message handler |
| Button一直disabled | 讀network、WS、key三條件 | 全部ready | 不繞過Backend權限 |
| Wrong key看似operator | 實際送安全命令看403 | Backend決定 | 改UI文字，不宣稱validated |
| Pending不結束 | 查device及timeout worker | terminal status | 不自動重送 |
| Offline仍能點控制 | 查`updateAvailability()` | disabled | 先停用再修狀態 |
| Service worker在手機LAN HTTP失敗 | 看protocol與context | HTTPS／localhost | 記為responsive only |

## 十一、Lab Notebook模板

```text
日期／組別／commit：
Phone／browser：
URL protocol：

Responsive：
- portrait：
- landscape：
- horizontal scroll：
- tap／keyboard／text：

States：
- loading／empty／live：
- requested／accepted／done：
- rejected／timeout／failure：
- disconnected／offline／stale：

Permissions：
- viewer：
- wrong key：
- valid operator：
- key exposure check：

Physical command trace：
- command_id：
- phone result：
- ESP32／RGB result：

PWA evidence：
- manifest：
- service worker context：
- phone installability：
- exact conclusion：
```

## 十二、延伸實作

### 延伸A：Client-side event filter

加入event type select，選項由實際資料建立。Filter後0筆顯示empty；API failure仍顯示failure。

### 延伸B：Command confirmation與cooldown

START確認顯示target device；送出後短暫停用重複START，直到terminal result或timeout。STOP
不套用會延遲安全停止的confirmation／cooldown。

### 延伸C：Accessible live region

以`aria-live`讓重要command result可被screen reader讀出，但避免每兩秒telemetry造成大量
打斷。記錄使用哪類訊息觸發announcement。

### 延伸D：HTTPS PWA deployment

只在已核准的hosting環境配置HTTPS、authentication與secret management，再做phone install、
standalone launch、service worker update與offline測試。不可直接公開課堂Backend port。

## 十三、官方與Repository參考

- [MDN Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [課程mobile page](../../examples/course_backend/static/index.html)
- [課程manifest](../../examples/course_backend/static/manifest.json)
- [課程service worker](../../examples/course_backend/static/sw.js)
- [Week 12 Database主教材](../Week_12_MQTT_Database_and_Logs/week12_main.md)
