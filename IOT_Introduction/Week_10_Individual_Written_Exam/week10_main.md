# Week 10：第一次個人筆試—硬體接線、電氣概念與安全

日期：2026-11-11

## Unit Overview

### 教學目標

學生應能在本次評量中展現下列能力：

1. 分析硬體接線圖（wiring diagram），辨認通用輸入輸出腳位（GPIO）、接地（ground）、供電（power supply）、訊號（signal）與共地（common ground）的關係。
2. 根據電壓（voltage）、通斷（continuity）、感測器有效性（sensor validity）、致動器供電（actuator power）、狀態（state）與逾時（timeout）證據作判斷，不依賴反覆猜測接線。
3. 根據指定的硬體症狀，選擇第一個安全的診斷動作（diagnostic action），並解釋為何不能嘗試不安全的替代作法。

### 教學內容

本次個人筆試評量第2至7週建立的硬體概念與安全推理。學生會判讀涉及ESP32-S3、感測器（sensor）、低功率輸出（low-power output）、致動器外部供電（external actuator power）、共地（common ground）、安全停止（safe stop）及逾時（timeout）的接線、量測、程式狀態與可觀察故障。本週不納入網路主題，不教授新內容，也不安排實驗活動或小組作業。

## 本週性質

本週全週只進行個人筆試，不安排新進度、硬體實作、手機操作或小組活動。
本次筆試占學期成績15%。

## 筆試範圍

ESP32-S3、GPIO、GND、3.3V／5V、麵包板、安全接線、電壓、共地、感測品質、
致動器供電、RGB／OLED、非阻塞倒數、完整遮光事件、計分與Finish優先序、安全停止、timeout與單機狀態判斷。本次不考HTTP、WebSocket、
MQTT、Backend、Database或手機前台。

## 當週產出

完成第一次個人筆試。作答內容只以個人理解與判斷為評量依據。

## 完成檢核

- [ ] 完成個人筆試。
- [ ] 已依應試規定繳交試卷。

參考：[筆試藍圖](../docs/course_materials/rubrics_and_checklists.md)

<a id="practice-and-reference"></a>

## 準備、紀錄表與延伸參考

<a id="support-應試準備"></a>

### 應試準備

本週不攜帶或操作ESP32-S3、感測器、致動器與外部電源。考前依正式公告確認
考場、座位、可攜物品與應試規定。

<a id="support-複習範圍"></a>

### 複習範圍

- GPIO、GND、3.3V／5V、共地、外部供電與安全停止。
- 感測取樣、有效／無效讀值、狀態機與timeout。
- 麵包板電源軌、訊號方向、輸入與輸出、致動器供電。
- 依接線圖、量測值、程式片段或Serial輸出判斷問題位置。

HTTP、WebSocket、MQTT、Backend、Database及手機前台不列入第一次筆試。

正式試題與答案不放在學生教材或公開repository中。

參考：[筆試藍圖](../docs/course_materials/rubrics_and_checklists.md)
