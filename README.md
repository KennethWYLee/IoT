# 低成本 IoT 玩具與互動硬體設計

這門課讓資管學生把程式帶進實體世界。學生可以做自己想玩的玩具、
互動裝置、環境系統、機構或移動平台；共同要求不是指定外型，而是硬體
必須真的產生行為，軟體必須留下可查的資料／事件，或實際協助使用者
監看與操作。期末作品會把兩者整合成可說明、可測試、可重建的
Full-stack IoT 系統。

## 課程主線

```text
實體輸入（按鈕／感測器／手機判斷）
  -> ESP32-S3 的狀態與決策
  -> 實體輸出（燈／聲音／顯示／舵機／馬達）
  -> Wi-Fi + HTTP／MQTT
  -> 學生建立的後端
  -> Database + structured log
  -> WebSocket
  -> 手機可用的監看與操作介面
```

第2-6週只處理硬體：安全用電、電氣量測、ADC、感測、輸出、機構、供電、
狀態與故障。第10週才將ESP32-S3接到HTTP／WebSocket；第11週把MQTT訊息、
Database與structured log整合成可查詢的持久化資料路徑，第13週再完成手機介面。

## 學生可以做什麼

- 手機控制、會記錄每次命令與結果的夾取或投擲玩具。
- 依光線、距離或人體活動反應，並保留歷史資料的互動燈具。
- 有使用時間、錯誤與得分紀錄的桌上遊戲或反應遊戲。
- 能在手機設定模式、查詢事件並安全停止的移動平台。
- 感測環境並由軟體告警、查詢與分析的教室或生活裝置。
- 其他經教師確認供電、致動器與使用情境可安全完成的作品。

昂貴硬體、複雜機構與速度不直接換取高分。基礎材料做出清楚的使用情境、
可靠的互動、完整的 log 與可重現測試，也可以取得完整評分。

## 教師材料

教師已購三套 ESP32-S3 與常用輸入／輸出材料，只作課前驗證、課堂示範與
教師專題備品，不提供學生借用或故障替換。學生在第 8 週
確認題目後可按作品需要加購材料；購買前須先核對相容性與安全。

教師的智慧停車與 UCI K-4 4WD 只是延伸示範，學生不必造車，也不採用
循跡車作為共同作業。

## 課程節點

- 第7週：第一次個人筆試，檢查硬體接線、電氣概念與安全；不安排新進度。
- 第 8 週：第一次專題報告—題目與技術可行性。
- 第 9 週：教師出國，不要求到校、不收新的評量成果。
- 第12週：第二次專題報告，檢查目前進度、取得回饋並建立修正計畫。
- 第13週：完成手機前台、Responsive Web／PWA與權限。
- 第14週：完成故障注入、復原及乾淨環境重建。
- 第15週：第二次個人筆試，檢查網路通訊與軟硬整合架構；不安排新進度。
- 第16至17週：第三次專題報告—期末展示與個人問答；分批進行，不安排新進度。
- 第 18 週：校定期末考週，保留空白，不安排常規教材或評量進度。

## 文件導覽

- [18 週課程進度](docs/18_week_plan.md)
- [校曆對齊計畫](docs/1151_calendar_aligned_course_plan.md)
- [中文課程大綱](docs/1151_course_syllabus_draft.md)
- [英文課程大綱](docs/1151_course_syllabus_english.md)
- [Type B 課堂設計](docs/typeb_course_redesign.md)
- [每週材料與課堂執行](docs/18_week_materials_arrival_runbook.md)
- [課堂教材入口](docs/course_materials/README.md)
- [採購原則](docs/purchase_list.md)
- [已購庫存](docs/purchased_inventory.md)
- [跨電腦硬體狀態](docs/hardware_state.md)
- [HTTP／WebSocket／SQLite 課堂 prototype](examples/course_backend/README.md)
- [入門 QA](docs/iot_beginner_qa.md)
- [圖解 QA PDF](docs/iot_beginner_visual_qa.pdf)
- [同步工具](scripts/README.md)

## 另一台電腦接手

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
git pull --ff-only
```

開始實機前先讀 `PROJECT.md`、`docs/hardware_state.md` 與最新的
`docs/lab_notes/`；完成實驗後更新硬體狀態與實作紀錄，再 commit、push。
Wi-Fi 密碼、API key 與裝置秘密不得進入 Git。
