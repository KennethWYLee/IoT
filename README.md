# 低成本 IoT 互動系統設計與實作

本課程目前規劃為資管學生可負擔、可入門、可延伸的 IoT 實作課。期中前以「手機視覺辨識智慧停車場」作為共同案例，讓學生完成 ESP32-S3 控制、手機影像、OpenCV、dashboard 與資料紀錄的最小可行系統。期中後先加做一個「自動教室占用與節能異常偵測」IoT 專案，再讓學生利用上課時間發展期末作品，可延伸到夾娃娃機、自走車、倉儲貨位、座位占用偵測、置物櫃或腳踏車停放管理。

## 設計原則

- 每組使用一片 ESP32-S3 DevKit，視覺辨識使用學生手機與筆電，不要求購買相機板、樹莓派、Jetson 或 LiDAR。
- 期中前共同完成智慧停車場 MVP；期中後加做自動教室占用與節能異常偵測，再進入期末專題。
- 學生自費上限以每人整學期 NT$800 內為原則，必買材料控制在每組約 NT$600-1,200。
- 停車場只是訓練場，不是期末限制；材料需能延伸到其他互動 IoT 題目。

## 目前決策

- 主板：ESP32-S3-DevKitC-1 N16R8，已焊排針，排針向下，44 腳位。
- 共同案例：智慧停車場。
- 第二專案：自動教室占用與節能異常偵測。
- 視覺方案：學生手機當相機，筆電跑 OpenCV。
- ESP32-S3 角色：閘門、燈號、蜂鳴器、超音波入口偵測、狀態回傳。
- 第二專案感測：PIR 人體紅外線、KY-018 光敏、DHT11 溫濕度。
- 不採用循跡車作為共同案例。

詳細課程規劃見 [docs/18_week_plan.md](docs/18_week_plan.md)。
採購清單見 [docs/purchase_list.md](docs/purchase_list.md)。
入門 QA 見 [docs/iot_beginner_qa.md](docs/iot_beginner_qa.md)。
學生圖解講義 PDF 見 [docs/iot_beginner_visual_qa.pdf](docs/iot_beginner_visual_qa.pdf)。
