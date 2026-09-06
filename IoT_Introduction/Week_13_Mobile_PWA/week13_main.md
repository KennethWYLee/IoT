# Week 13：Mobile Frontend、Responsive Web／PWA與Permissions

日期：2026-12-02

本章把Week 6、10、11完成的即時事件、歷史資料、命令與統計整理成手機可用的前台。
學生會在真實手機上驗證版面與操作狀態，區分viewer與operator權限，完成一筆可追蹤的
實體命令，並分別判定Responsive Web與PWA條件是否真的成立。

## 一、Unit Overview

### 教學目標

完成本單元後，學生應能：

1. 在手機上完成核心監看與控制流程（monitor-and-control workflow），不依賴橫向整頁捲動、僅限桌面的操作方式，並避免誤觸啟動。
2. 在介面上明確區分載入中（loading）、無資料（empty）、即時更新（live）、等待結果（pending）、完成（done）、遭拒（rejected）、逾時（timeout）、失敗（failure）、連線中斷（disconnected）及離線（offline）狀態。
3. 結合HTTP歷史查詢介面（historical HTTP API）與網頁雙向通訊更新（WebSocket update），不將過期資料（stale data）呈現為裝置目前狀態。
4. 在介面與後端（backend）同時落實檢視者（viewer）及操作者（operator）的能力限制，並解釋隱藏或停用按鈕為何不能取代授權邊界（authorization boundary）。
5. 檢查網頁應用程式資訊清單（web app manifest）與服務工作者（service worker），依瀏覽器實際條件區分響應式網頁（responsive web page）與可安裝的漸進式網頁應用程式（PWA）。
6. 執行行動裝置易用性（mobile usability）、權限（permission）、網路中斷（network loss）及實體結果（physical result）測試，並保留可重現的證據。

### 教學內容

本單元發展全端物聯網系統（full-stack IoT system）面向使用者的介面。學生會運用行動優先（mobile-first）的響應式版面（responsive layout）、明確的介面狀態（interface state）、歷史查詢介面（historical API）載入與網頁雙向通訊更新（WebSocket update），呈現裝置資訊，也呈現資料的不確定性。遠端命令（remote command）必須作為可追蹤的操作處理，不能將按下按鈕直接當成實體已動作；操作者授權（operator authorization）由後端檢查，並在介面上反映其限制。學生會檢查網頁應用程式資訊清單（web app manifest）、服務工作者（service worker）、安全環境（secure context）要求與安裝條件，分開回報響應式網頁行為及已驗證的漸進式網頁應用程式（PWA）行為。

## 二、核心使用流程與開始狀態

本週不新增硬體。使用已購ESP32-S3、START／STOP按鈕、KY-018及KY-016 RGB；可沿用
Week 10 MQTT或Week 6 HTTP路徑。只有下列完整路徑先正常，才開始修改前台：

```text
真實輸入 → ESP32 → Backend → Database → 手機顯示
手機命令 → Backend → 目標ESP32 → 實體RGB → result → 手機顯示
```

最小核心流程：

1. 使用者開啟手機頁面，立即知道網路、WebSocket與角色狀態。
2. 輸入不含個資的device ID，讀到該裝置歷史事件、命令與統計。
3. Viewer可以監看，但不能建立命令。
4. Operator輸入臨時key後送出安全`start`、`stop`或`reset`。
5. 畫面先顯示requested，之後顯示accepted與terminal result；實體RGB結果一致。
6. 裝置、Backend或網路失效時，畫面不把舊資料誤標成「現在正常」。

## 三、啟動基準系統

PowerShell進入`examples/course_backend`：

```powershell
.\.venv\Scripts\Activate.ps1
$env:IOT_OPERATOR_KEY="replace-with-your-temporary-classroom-key"
$env:IOT_COMMAND_TIMEOUT_SECONDS="20"
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

若使用MQTT，再啟動broker與`mqtt_bridge.py`。ESP32先保持IDLE且RGB為安全顏色。筆電開
`http://127.0.0.1:8000`，手機開`http://<筆電LAN-IP>:8000`。

Backend命令deadline預設20秒。**timeout（逾時）**表示裝置在deadline前沒有完成，
不是「命令稍後一定會成功」。發生timeout後，不自動重送可能造成危險或重複的動作。

## 四、閱讀前台的HTML、CSS與JavaScript

本週基準頁面為[static/index.html](../../examples/course_backend/static/index.html)。先另建
Git branch保存自己的修改，且不要修改`app.py`的權限規則來讓畫面看似成功。

### 4.1 HTML：結構與可辨認控制

**HTML**描述頁面的內容與語意。開啟`index.html`，找到：

- `<meta name="viewport" ...>`：告訴手機以裝置viewport寬度排版；缺少時手機可能先以
  寬桌面畫布縮小整頁。
- `role="status"`：讓連線與命令狀態成為可被輔助技術辨認的狀態訊息。
- 包住input的`label`：標籤文字與控制項形成可辨認關係，點標籤也能聚焦正確欄位。
- Events與Commands table：寬螢幕用table，窄螢幕由CSS改成card-like rows。
- `type="password"`及`autocomplete="off"`：避免key直接顯示；仍不能把它當成後端安全。

### 4.2 CSS：Responsive Web

**Responsive Web Design（響應式網頁設計）**使同一份內容依viewport寬度重新排列。基準
CSS先定義一般版面，再以`@media (max-width: 680px)`調整窄螢幕。`@media`內隱藏
table header，並使用cell的`data-label`呈現欄名，避免手機只能左右拖曳大型表格。

檢查按鈕`min-height: 44px`、input寬度、單欄排列、文字換行及錯誤訊息。Responsive
不只是「頁面縮小」；核心操作必須可讀、可點、可理解。原理可參考
[MDN Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)。

### 4.3 JavaScript：資料與狀態

**JavaScript**在頁面載入後讀API、更新DOM（Document Object Model，瀏覽器中的頁面
物件）及維持WebSocket。找到這些函式：

| Function | 作用 | 失敗時必須呈現 |
|---|---|---|
| `fetchJson()` | 執行HTTP並解析JSON | status與錯誤detail |
| `refresh()` | 平行讀events、commands、stats | loading、empty或failure |
| `connectWebSocket()` | 建立即時連線並重連 | connecting／connected／disconnected |
| `renderEvents()` | 以安全text node顯示事件 | 空array顯示empty |
| `renderCommands()` | 顯示命令狀態 | pending與terminal status |
| command form的`submit` handler | 帶operator header建立命令 | 403、offline或其他failure |

頁面以`textContent`建立外部資料，不用`innerHTML`直接插入裝置payload，降低惡意文字被
當HTML執行的風險。

## 五、先做手機Responsive Baseline Test

1. 手機關閉自動旋轉，先用直向開啟頁面。
2. 不用雙指縮放，從頂端依序找到connection、device ID、operator key、command、stats、
   events與commands。
3. 確認頁面本身沒有水平捲動；長device ID與reason可換行。
4. 按鈕之間有足夠間距，不會因拇指觸碰相鄰控制而誤送。
5. 切到橫向再測一次；版面可使用較多寬度，但內容順序不改變。
6. 在筆電瀏覽器縮窄視窗，找出table轉成card的breakpoint現象。

完成條件不是一張好看的截圖，而是支援資料中每一個核心任務都能在實際手機完成。

## 六、驗證「最後成功更新時間」

歷史資料曾成功載入，不代表現在仍連線。基準頁面的裝置摘要已有
`<strong id="last-refresh">`，JavaScript以`ui.lastRefresh`取得它，並且只在
`refresh()`的三個API都成功後執行：

```javascript
ui.lastRefresh.textContent = new Date().toLocaleString();
```

依下列方式確認它真的代表「最後成功」，而不是「最後嘗試」：

1. Backend正常時按「套用並重新整理」，記下顯示日期與時間。
2. 等待數秒後再刷新一次，時間應更新。
3. 停止Backend，再按刷新或等待WebSocket重連；Events與Commands應顯示讀取失敗，
   保留下方舊資料並明確標示為舊資料；`Last successful refresh`必須保留上一次成功值。
4. 重新啟動Backend，成功refresh後時間才再次更新。

如果在`catch`或開始loading時更新這個欄位，就會把失敗嘗試誤標成成功；必須移回
`try`中的API與render完成之後。

## 七、完整介面狀態測試

### 7.1 Loading與Empty

重新載入頁面，應先看到Loading。使用一個從未出現的device ID，API成功回空array時應顯示
「目前沒有符合條件的事件／命令」，不能顯示讀取失敗。

### 7.2 Live與Historical

用真實ESP32 ID讀取歷史資料，再按實體START。不刷新頁面就出現新事件，表示WebSocket
live update；重新整理後仍存在，表示historical API／database可讀回。兩者都要通過。

### 7.3 Pending、Success與Rejected

送`start`後立即顯示requested；裝置收到顯示accepted；完成後顯示done。進ERROR後再送
`start`，應顯示rejected與原因，RGB不變綠。

### 7.4 Timeout

讓ESP32斷線，對正確device ID送安全`reset`。命令先requested，超過Backend deadline後
變timeout。重新連線時不能自動執行這筆已timeout命令。

### 7.5 Failure與Offline

- Operator key故意輸錯：HTTP 403，畫面顯示failure，不新增命令。
- 停止Backend：WebSocket disconnected，API讀取失敗，控制按鈕disabled。
- 關閉手機Wi-Fi：browser network offline；舊資料仍可見時必須保留「最後成功更新」與
  offline狀態，不能顯示為live。

## 八、Viewer與Operator Permissions

**authentication（身分驗證）**判斷請求者是誰或是否持有credential；**authorization
（授權）**判斷是否允許執行動作。本週簡化原型使用operator key授權建立命令。

### Viewer

1. Operator key留空。
2. 可讀events、commands與stats。
3. Send按鈕disabled。

### Wrong key

1. 輸入錯誤key；頁面文字可能顯示「operator key entered」，這只代表欄位不空，**不代表
   Backend已驗證**。
2. 送命令得到403。
3. Database沒有新增command。

### Valid operator

輸入正確臨時key後，Backend建立command並回201。key只放JavaScript變數，不放URL、
`localStorage`、Git或畫面log。LAN HTTP沒有TLS加密，不能保護傳輸中的key；本週只使用
短期課堂key與低功率輸出，結束後作廢。對外部署必須另做HTTPS、使用者及裝置身分驗證。

即使使用者在Developer Tools移除`disabled`，Backend仍會拒絕沒有正確header的請求。
因此UI restriction改善使用流程，Backend authorization才是安全邊界。

## 九、Manifest、Service Worker與PWA判定

**Web App Manifest**是`manifest.json`，描述app name、start URL、display與icon。
**Service Worker**是與頁面分開執行的script，可攔截network request並提供cache等能力。

基準檔案：

- [manifest.json](../../examples/course_backend/static/manifest.json)
- [sw.js](../../examples/course_backend/static/sw.js)
- [icon.svg](../../examples/course_backend/static/icon.svg)

### 9.1 筆電localhost觀察

1. 用筆電開`http://127.0.0.1:8000`。
2. 開Developer Tools的Application區，檢查Manifest與Service Workers。
3. 重新整理，確認shell檔可由service worker cache取得；`/api/`資料不可由舊cache冒充最新值。
4. 停止Backend後再次整理，若shell可開，也必須清楚顯示API失敗／offline。

### 9.2 手機LAN HTTP限制

一般`http://<筆電LAN-IP>:8000`不是HTTPS，也不是手機自己的localhost。Service Worker
只在secure context可用，PWA installability也通常要求HTTPS或localhost／loopback。
因此本週共同LAN流程可以驗證**Responsive Web**，但不能因repository有manifest與sw檔就
宣稱手機PWA已安裝。官方條件見[MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
及[MDN Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)。

判定用語：

- `Responsive Web verified on phone over LAN HTTP`：手機核心流程通過。
- `Manifest and service worker inspected on desktop localhost`：筆電local開發條件通過。
- `Installable PWA verified on phone over HTTPS`：只有真的配置HTTPS並完成安裝／離線測試才可寫。

## 十、真實命令端到端驗收

1. ESP32為IDLE，手機顯示WebSocket connected及最近成功更新時間。
2. Operator對正確device送`start`。
3. 記錄`command_id`與requested time。
4. ESP32回accepted，RGB變綠，再回done。
5. 手機顯示同一ID的done；Events另有`remote_start`或相應事件。
6. 送`stop`，RGB進ERROR安全輸出並回done。
7. 停止Backend，按實體STOP仍生效；前台只顯示offline／stale，不能顯示新done。

核心驗收至少在一支真實手機完成；只用desktop responsive preview不能取代phone test。

## 十一、練習

### 練習1：狀態文字而非只有顏色

檢查connected、offline、pending、done、rejected、timeout是否都有文字。選一個只靠顏色的
地方改成「文字＋顏色」，並在灰階或降低螢幕亮度後重新辨認。

### 練習2：危險操作確認

為`start`加入清楚確認，內容要包含target device及動作；`stop`不可被確認dialog延遲。
完成後測試取消不建立命令、確認才建立命令、STOP仍可立即送出。

### 練習3：一個歷史filter

加入event type或時間範圍其中一種filter。空結果顯示empty，無效輸入顯示validation message，
network failure顯示failure；三者不可共用相同訊息。

## 十二、繳交內容與完成條件

繳交手機直向與橫向核心流程、viewport／responsive breakpoint觀察、最後成功更新功能、
完整狀態矩陣、viewer／wrong key／valid operator測試、command ID實體結果、offline／timeout
測試、localhost service worker觀察及PWA判定用語。截圖不得含operator key或個資。

- [ ] 手機不縮放、不水平拖動即可監看與操作。
- [ ] Loading、empty、failure、offline與stale可分辨。
- [ ] Requested、accepted、done、rejected與timeout可分辨並帶command ID。
- [ ] 歷史API與WebSocket live update都使用真實裝置資料。
- [ ] Viewer不能送命令，wrong key被Backend 403拒絕，valid operator才可建立命令。
- [ ] Key不在URL、localStorage、log、Git或截圖。
- [ ] 離線時控制disabled，舊資料保留最後成功時間而非冒充live。
- [ ] 手機命令與ESP32實體RGB結果一致，本機STOP不依賴Backend。
- [ ] Responsive Web、localhost service worker與installable phone PWA分開標示。
- [ ] 未配置與測試HTTPS時，不宣稱手機PWA已安裝或offline data已完整可用。

完成後使裝置回IDLE，停止Backend／bridge／broker並拔USB。詳細手機測試表、權限矩陣、
狀態矩陣、PWA證據表及延伸實作見[Week 13支援資料](week13_support.md)。
