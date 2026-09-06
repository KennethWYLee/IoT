# Week 16：第三次專題報告—期末展示與個人問答

日期：2026-12-23

## Unit Overview

### 教學目標

完成期末專題報告後，學生應能：

1. 展示安全且可重複的實體互動（physical interaction），同時提供行動介面（mobile interface）、後端（backend）、資料庫（database）與通訊（communication）證據。
2. 追蹤一筆事件（event）與一筆控制命令（control command）經過完整系統的過程，包含最終結果（terminal result）或逾時（timeout）。
3. 重現一項自動行為（automatic behavior）、故障反應（fault response）與復原（recovery），且不隱藏已知限制。
4. 根據提交的版本及文件，解釋個人實作決策（implementation decision）、測試證據（test evidence）、人工智慧輔助工作（AI-assisted work）與尚未解決的風險。

### 教學內容

期末專題報告將實體作品（physical artifact）、裝置韌體（device firmware）、網路通訊（network communication）、後端（backend）、持久化資料（persistent data）、結構化紀錄（structured log）與行動操作流程（mobile workflow），整合為可驗證的展示。學生會呈現正常操作與異常復原（recovery），以實體行為和紀錄支持介面呈現的結果，並個別回答架構（architecture）、實作（implementation）、安全、測試與重建（reconstruction）相關問題。

本週與Week 17共同構成第三次專題報告時段。每組依教師公布的場次，在其中一週
完成一次期末展示與個人問答；本項仍只計一次，占學期成績25%。兩週皆不安排
新進度、功能開發或額外實作。

所有組別須在本週第一次展示前依教師公布的相同截止時間提交展示commit或
tag、文件與測試證據。截止後只允許修復啟動、網路或設備故障，不得增加評分
功能；Week 17報告組別同樣使用此截止版本。

## 現場必備

- 安全可運作的實體作品與手機前台。
- 可重新啟動的Backend、Database、WebSocket與HTTP或MQTT。
- 接線圖、資料流、BOM、資料格式、原始碼及重建步驟。
- 測試、structured log、已知限制與AI使用／驗證紀錄。

## 展示順序

1. 說明使用者、問題與價值。
2. 完成一次實體互動及一次手機操作。
3. 顯示即時、歷史、command result及log。
4. 展示自動反應與異常安全復原。
5. 每位組員回答個人及跨層資料流問題。

## 上台前檢核

- [ ] 電源、線材、帳號、網路與離線備案已確認。
- [ ] Week 12～14各階段commit可辨識，並指定共同截止前的已驗證展示版本。
- [ ] 所有組員能解釋完整資料流。

參考：[期末Rubric](../../docs/course_materials/rubrics_and_checklists.md)
