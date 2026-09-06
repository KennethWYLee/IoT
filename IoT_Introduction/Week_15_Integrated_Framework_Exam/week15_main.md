# Week 15：第二次個人筆試—網路通訊與軟硬整合架構

日期：2026-12-16

## Unit Overview

### 教學目標

學生應能在本次評量中展現下列能力：

1. 追蹤感測事件（sensor event）與控制命令（control command），說明它們如何經過ESP32、無線網路（Wi-Fi）、超文字傳輸協定（HTTP）或訊息佇列遙測傳輸協定（MQTT）、後端（backend）、資料庫（database）、網頁雙向通訊（WebSocket）及行動介面（mobile interface）。
2. 比較請求／回應（request-response）、發布／訂閱（publish-subscribe）、即時更新（live update）、歷史儲存（historical storage）與結構化紀錄（structured log）的責任。
3. 使用識別碼（identifier）、狀態碼（status code）、訊息內容欄位（payload field）、時間戳記（timestamp）與紀錄（log），找出整合系統中首先失敗的層次。
4. 解釋授權（authorization）、逾時（timeout）、無效資料（invalid data）、離線（offline）與復原（recovery）行為，不混淆介面狀態與實體證據。

### 教學內容

本次個人筆試評量第一次專題報告後發展的網路通訊與整合架構（integrated architecture）。學生會將超文字傳輸協定（HTTP）、JSON資料交換格式（JSON）、網頁雙向通訊（WebSocket）、訊息佇列遙測傳輸協定（MQTT）、後端驗證（backend validation）、資料庫紀錄（database record）、結構化紀錄（structured log）、行動介面狀態（mobile state）及跨層識別碼（cross-layer identifier），視為同一套可追蹤系統進行判讀。本週不教授新內容，不安排實驗活動、專題報告或小組作業。

## 本週性質

本週全週只進行個人筆試，不安排新進度、硬體實作、專題報告或小組活動。
本次筆試占學期成績15%。

## 筆試範圍

- Wi-Fi、IP與裝置如何找到Backend。
- HTTP request／response、status code與JSON資料格式。
- 手機以HTTP建立命令，以及Backend以WebSocket推送即時狀態與命令結果。
- MQTT broker、topic、payload、presence與acknowledgement。
- ESP32、Backend、Database、structured log與手機前台的責任邊界。
- sensor signal如何成為event，以及command、result、error與timeout如何跨層流動。
- 依Serial、request log、server log、Database紀錄及手機狀態判斷中斷位置。

## 當週產出

完成第二次個人筆試。作答內容只以個人理解與判斷為評量依據。

## 完成檢核

- [ ] 完成個人筆試。
- [ ] 已依應試規定繳交試卷。

參考：[第二次筆試藍圖](../../docs/course_materials/rubrics_and_checklists.md)
