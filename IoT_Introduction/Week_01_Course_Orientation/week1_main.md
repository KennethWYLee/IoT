# Week 1教材：課程大綱、評量與作品方向

日期：2026-09-09<br>
課程：物聯網與雲端運算（Internet of Things and Cloud Computing）

第一週不攜帶硬體、不接線、不上電，也不進行程式上傳。本週先確認整學期
要完成的作品、18週學習路徑、評量方式、材料責任及第二週前的準備工作。

## 一、Week 1 Overview

### Teaching Objectives

By the end of Week 1, students will be able to:

1. Explain what a full-stack IoT system is and why it requires both physical hardware
   and software.
2. Describe how physical input, an ESP32-S3, physical output, network communication,
   a backend, a database, and a mobile interface work together.
3. Analyze an IoT project in terms of its user, input, output, data, interaction, and
   safety requirements.
4. Develop an initial IoT project idea with a clear purpose and a feasible system scope.

### Teaching Content

This course introduces the design of complete IoT systems that connect physical
devices with useful software. Students will learn how sensors and buttons provide
input, how an ESP32-S3 interprets that input, and how LEDs, buzzers, servos, or other
actuators create observable physical responses. Electrical safety, power, grounding,
signal quality, system states, and recovery from errors are treated as essential parts
of the design process.

The course also covers the communication and software layers that make a device part
of a larger system. Students will connect devices through Wi-Fi, exchange structured
data with HTTP, WebSocket, or MQTT, develop backend services, store events in a
database, and use logs to understand successful and failed operations. A mobile-friendly
interface will provide real-time status, historical information, and controlled commands.

These elements will be combined into a full-stack IoT project with a clear user and
purpose. The completed system should include meaningful physical interaction, reliable
data flow, safe behavior, error handling, testing evidence, and enough documentation
for another person to understand and rebuild it.

## 二、課程基本資料

| 項目 | 內容 |
|---|---|
| 開課班級 | 四技資二乙 |
| 任課教師 | 李文毅 |
| 上課時間 | 星期三第5～7節，13:30～16:15 |
| 每週時數 | 3小時 |
| 先備能力 | 具任一程式語言基礎；不要求電子電路或機器人經驗 |
| 主要開發板 | ESP32-S3-DevKitC-1 N16R8、已焊排針、向下44腳位 |
| 教材語言 | 繁體中文為主，保留必要英文介面與專業術語 |
| 教科書與服務 | 不指定購買教科書，不要求付費雲端服務 |

學分數、科目代碼、必修／選修及正式授課語言等行政欄位，以校務系統最後
公告為準。

## 三、18週課程大綱

| 週次 | 日期 | 核心內容 | 當週主要成果 |
|---:|---|---|---|
| 1 | 09-09 | 課程介紹、配分、作品、材料與安全責任 | 課程確認及作品構想卡；不操作硬體 |
| 2 | 09-16 | ESP32-S3、Upload、Serial、GPIO、GND與量測 | 上傳、按鈕輸入、GPIO測試輸出及量測證據 |
| 3 | 09-23 | KY-018、DHT11、校正、取樣與異常值 | 光線與溫溼度的有效／無效資料紀錄 |
| 4 | 09-30 | RGB、蜂鳴器、SG90、4AA供電、共地與安全停止 | 狀態提示、受限動作及timeout測試 |
| 5 | 10-07 | 單機互動、狀態機與錯誤復原 | 可重複操作的光線互動狀態裝置 |
| 6 | 10-14 | Wi-Fi、HTTP、JSON、WebSocket、Backend與手機雙向控制 | 真實裝置事件到達手機；手機命令與裝置結果可追蹤 |
| 7 | 10-21 | 第一次個人筆試：硬體接線、電氣概念與安全 | 全週個人作答；不安排新進度或實作 |
| 8 | 10-28 | 第一次專題報告：題目與技術可行性 | 硬體片段、資料流、材料、風險與驗收條件 |
| 9 | 11-04 | 教師出國 | 不要求到校、不收新成果；提供選讀資料 |
| 10 | 11-11 | MQTT、多裝置、Topic、presence與acknowledgement | 遙測、上線／離線、命令與回應 |
| 11 | 11-18 | Database、歷史API、structured log與分析 | 資料表、歷史查詢及錯誤解釋 |
| 12 | 11-25 | 手機前台、Responsive Web／PWA與權限 | 即時、歷史、操作及錯誤／離線流程 |
| 13 | 12-02 | 第二次個人筆試：網路通訊與軟硬整合架構 | 全週個人作答；不安排新進度或實作 |
| 14 | 12-09 | 自動反應、安全、故障復原與重建 | 自動行為、三項異常測試、復原與乾淨環境重建 |
| 15 | 12-16 | 第二次專題報告、修正、彩排與版本凍結 | 完整資料路徑、使用測試、修正、兩次彩排與凍結版本 |
| 16 | 12-23 | 第三次專題報告：期末展示與個人問答 | 依公布場次進行期末報告；不安排新進度 |
| 17 | 12-30 | 第三次專題報告：期末展示與個人問答 | 依公布場次進行期末報告；不安排新進度 |
| 18 | 01-06 | 校定期末考週：保留空白 | 不安排常規教材、新進度或評量 |

## 四、評量方式

| 評量項目 | 比例 | 主要證據 |
|---|---:|---|
| 平常成績 | 15% | 每週實作、QA、Lab Notebook、文件、安全、協作與AI使用驗證 |
| 第一次個人筆試（Week 7） | 15% | 硬體接線、GPIO／GND、電壓、共地、感測、致動、供電與安全 |
| 第一次專題報告（Week 8） | 15% | 題目、硬體片段、軟體用途、架構、材料、風險與驗收條件 |
| 第二次個人筆試（Week 13） | 15% | Wi-Fi、HTTP、JSON、WebSocket、MQTT與軟硬整合資料流、log除錯 |
| 第二次專題報告（Week 15） | 15% | 端到端資料路徑、手機流程、歷史資料、log、使用測試與修正證據 |
| 第三次專題報告（Week 16～17） | 25% | 完整實體互動、前後台、資料、可靠性、測試、文件與個人理解 |
| 合計 | 100% |  |

硬體價格、機構複雜度及作品速度不是直接加分項目。基礎材料只要形成可靠的
互動、完整資料流、清楚手機流程與充分測試，也能符合高分標準。

## 五、期末作品最低要求

期末作品必須同時包含：

- 一件可安全運作的實體作品與清楚使用情境。
- ESP32-S3或經教師核准的控制板。
- 至少一種實體輸入及一種實體輸出；例外須在Week 8取得核准。
- Wi-Fi，以及HTTP或MQTT裝置通訊。
- 學生自行撰寫且可以重新啟動的Backend。
- Database、歷史查詢及structured log。
- 手機可用介面，呈現即時、歷史、操作／設定及錯誤／離線狀態。
- WebSocket即時更新；控制行為須留下command、result／ack或timeout。
- 至少一項自動反應、狀態機或排程。
- 至少三種測試，其中一種為斷線、錯誤輸入、感測異常或服務停止。
- 原始碼、接線圖、資料流圖、資料格式、BOM、重建步驟、AI使用與驗證紀錄、
  已知限制。

現成Dashboard或IoT平台可以作輔助，但不能取代學生自行撰寫的裝置端、
Backend、Database及手機介面核心成果。

## 六、第一週購買摘要

### 每位學生必買的電子基本包

| 品項 | 每人數量 |
|---|---:|
| ESP32-S3開發板 | 1片 |
| 400孔麵包板 | 1片 |
| 20 cm杜邦線：公對公、公對母、母對母 | 各1排 |
| 常用電阻包 | 1包 |
| 四腳輕觸按鈕 | 2顆 |
| KY-018光敏輸入模組 | 1個 |
| YS-31 DHT11溫溼度模組 | 1個 |
| KY-016 RGB LED模組 | 1個 |
| KY-012有源蜂鳴器模組 | 1個 |
| SG90 180度小型舵機 | 1個 |
| 4AA帶開關電池盒 | 1個 |

電子基本包依教師既有成交價估算約 **NT$659／人**。正式型號、規格、首次及
後續使用週次、學生另須自備的用品、暫時不要購買的項目、商品辨識圖片與到貨
檢查，統一放在[Week 1支援資料](week1_support.md#一學生材料採購總表)。

## 七、硬體與資料安全責任

第一週不操作硬體。從Week 2開始，每次實作都遵守：

1. 接線、改線及通斷量測前先斷電。
2. 不依購物頁圖片猜測VCC、GND或訊號腳；以實物絲印及課程接線表為準。
3. 不將5V訊號直接接入未保護的ESP32-S3 GPIO。
4. 不使用GPIO直接驅動舵機、馬達、泵、電磁閥或高電流負載。
5. 外部電源與ESP32控制訊號必須使用已驗證的共地及安全停止方式。
6. 發熱、異味、異常聲音、反覆重啟或線材鬆脫時立即斷電並停止操作。
7. 不在Git提交Wi-Fi密碼、API key、token、學生個資或可識別的成績資料。
8. 未經同意不得蒐集可識別個人的影像、聲音或其他敏感資料。

## 八、Git、文件與AI使用責任

- 每組保留可追蹤的程式版本、接線圖、資料流、BOM、測試及已知限制。
- Lab Notebook記錄目標、操作、結果、錯誤、修正、AI使用與下一步。
- 可以使用生成式AI協助程式初稿、介面、資料格式、測試案例或除錯假設。
- AI產出不是驗證結果。提交前必須人工理解、修改、執行並保存測試證據。
- 不得以「AI說可以」取代官方規格、實物核對、編譯、log、量測或實機測試。
- 每位成員須能說明自己提交的程式、資料路徑、接線與安全限制。

## 九、作品構想卡

第一週提出初步方向，不等於題目已定案，也不要求先購買專題特殊材料。使用
[作品構想卡](week1_support.md#二作品構想卡)記錄：

1. 想協助的使用者或使用情境。
2. 一項可以觀察的實體輸入。
3. 一項可以觀察的實體輸出。
4. 軟體要記錄什麼，或如何協助操作。
5. 一項目前已知的技術、安全或範圍風險。

## 十、Week 2前完成

- [ ] 已閱讀本教材並確認評量比例與重要週次。
- [ ] 已完成作品構想卡。
- [ ] 已依正式採購總表下單或盤點既有用品。
- [ ] 已閱讀並完成[Week 2課前環境準備](week1_support.md#三week-2課前環境準備)。
- [ ] Arduino IDE 2可以開啟。
- [ ] Espressif `esp32` board package已安裝。
- [ ] 已取得最新版課程repository。
- [ ] 已確認USB線可以傳輸資料。
- [ ] 材料若尚未到貨或規格不同，已在Week 2前回報。

完成上述項目即完成第一週課程要求。Week 2才開始ESP32-S3、Upload、Serial、
GPIO、按鈕接線與萬用電表量測。
