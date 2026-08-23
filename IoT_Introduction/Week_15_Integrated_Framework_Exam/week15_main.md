# Week 15：第二次個人筆試—網路通訊與軟硬整合架構

日期：2026-12-16

## Unit Overview

### Teaching Objectives

By the end of this assessment, students will be able to:

1. Trace sensor events and control commands across ESP32, Wi-Fi, HTTP or MQTT, backend,
   database, WebSocket, and mobile-interface boundaries.
2. Compare request-response, publish-subscribe, live-update, historical-storage, and
   structured-log responsibilities.
3. Use identifiers, status codes, payload fields, timestamps, and logs to locate the
   first failed layer in an integrated system.
4. Explain authorization, timeout, invalid-data, offline, and recovery behavior without
   confusing interface status with physical evidence.

### Teaching Content

This individual written assessment examines the networking and integrated architecture
developed after the first project report. Students interpret HTTP, JSON, WebSocket, MQTT,
backend validation, database records, structured logs, mobile states, and cross-layer
identifiers as one traceable system. No new teaching content, laboratory activity,
project report, or group work is included during the week.

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
