# 低成本 IoT 互動系統設計與實作

本課程目前規劃為資管學生可負擔、可入門、可延伸的 Full-stack IoT 實作課。教師以智慧停車系統作為整合案例，學生不必造車。學生先建立 ESP32-S3、感測／輸出、HTTP／JSON、WebSocket 與手機介面的共同能力，再加入 MQTT、學生自建後端、資料庫、結構化 log 與分析，期末完成具前台、後台及實體互動的完整 IoT 系統。

## 設計原則

- 每組使用一片 ESP32-S3 DevKit，視覺辨識使用學生手機與筆電，不要求購買相機板、樹莓派、Jetson 或 LiDAR。
- 第 7 週以個人概念筆試確認基礎理解；第 8 週每組只進行一次題目與技術可行性訪談，不要求繳交完整成品。
- 期末共同技術邊界為 `ESP32-S3 -> HTTP/MQTT -> 自建後端 -> 資料庫/log -> WebSocket -> 手機前台`，並包含反向控制與故障處理。
- 學生自費上限以每人整學期 NT$800 內為原則，必買材料控制在每組約 NT$600-1,200。
- 停車場只是訓練場，不是期末限制；材料需能延伸到其他互動 IoT 題目。

## 目前決策

- 主板：ESP32-S3-DevKitC-1 N16R8，已焊排針，排針向下，44 腳位。
- 教師參考案例：智慧停車場與 UCI K-4 4WD 自主停靠系統；不是學生共同必修作品。
- 第 7 週：個人概念筆試與題目工作坊。
- 第 8 週：每組一次 12-15 分鐘概念與技術可行性訪談，展示一個可運作片段。
- 第 9 週：教師出國，不要求到校、不收新評量成果。
- 學生期末作品：自選題目的完整 Full-stack IoT 系統，必須具自建後端、資料庫、structured log、手機前台及雙向控制。
- 視覺方案：學生手機當相機，筆電跑 OpenCV。
- ESP32-S3 角色：學生專題控制器；亦用於教師停車案例的車輛控制、距離感測、閘門、燈號、蜂鳴器與狀態回傳。
- 第 10-12 週新內容：MQTT／多裝置、資料庫／log 分析、手機 PWA／WebSocket／權限。
- 後半學期安排：第 13、15 週進度檢核，第 14、16 週整合工作坊，第 17 週作品展示。
- 不採用循跡車作為共同案例。

詳細課程規劃見 [docs/18_week_plan.md](docs/18_week_plan.md)。
115-1 課程教學大綱填寫草案見 [docs/1151_course_syllabus_draft.md](docs/1151_course_syllabus_draft.md)。
115-1 課程教學大綱英文版見 [docs/1151_course_syllabus_english.md](docs/1151_course_syllabus_english.md)。
115-1 校曆對齊版課程規劃見 [docs/1151_calendar_aligned_course_plan.md](docs/1151_calendar_aligned_course_plan.md)。
Type B 互動教學重設計版見 [docs/typeb_course_redesign.md](docs/typeb_course_redesign.md)。
舊版 UCI 4WD 材料 Runbook 見 [docs/18_week_materials_arrival_runbook.md](docs/18_week_materials_arrival_runbook.md)，目前只供教師參考案例使用，不是現行學生週次。
舊版課堂教材包見 [docs/course_materials/README.md](docs/course_materials/README.md)，待依現行 Full-stack IoT 課表重寫。
採購清單見 [docs/purchase_list.md](docs/purchase_list.md)。
已購器材庫存盤點見 [docs/purchased_inventory.md](docs/purchased_inventory.md)。
入門 QA 見 [docs/iot_beginner_qa.md](docs/iot_beginner_qa.md)。
學生圖解講義 PDF 見 [docs/iot_beginner_visual_qa.pdf](docs/iot_beginner_visual_qa.pdf)。
課程 DokuWiki 離線鏡像工具見 [scripts/README.md](scripts/README.md)。
