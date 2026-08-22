# IoT 課堂教材包

本資料夾是現行「IoT 玩具與互動硬體設計」可維護教材。學生可自由選擇
實體作品，但必須讓軟體記錄資料／事件或協助使用者監看與操作。

## 文件

- `teacher_18_week_materials.md`：每週教師課卡、時間配置與可收成果。
- `student_worksheets.md`：可貼到 LMS 的學生任務單與紀錄模板。
- `rubrics_and_checklists.md`：安全檢查、筆試藍圖、訪談與期末評分表。
- `starter_code_snippets.md`：ESP32-S3 與連網範例骨架；實機前須核對腳位。
- `../../examples/course_backend/`：可執行的 HTTP／WebSocket／SQLite 課堂 prototype。

## 使用順序

1. 先查 `../../PROJECT.md` 與 `../18_week_plan.md` 的最新固定決策。
2. 依當週教師課卡準備器材、故障例與課末可檢查成果。
3. 從學生任務單挑選必要頁面，不必每週整份發放。
4. 程式範例先由教師使用確切板卡、腳位與供電完成實機驗證。
5. 學生版本不得包含筆試答案、教師評分註記、Wi-Fi 密碼或 API key。

## 共同底線

- 第 2-5 週只處理硬體、安全、感測、致動與單機互動。
- 第 6 週起使用 HTTP／WebSocket；第 10-12 週加入 MQTT、Database 與手機前台。
- 每件期末作品有真實硬體、學生後端、Database、structured log 與手機可用介面。
- 控制行為留下命令與執行結果；系統錯誤有可見狀態與安全處理。
- 教師三套材料是驗證、示範、短期借用與故障備品，不代表全班每組均有一套。
- 智慧停車與 UCI 4WD 是教師延伸案例，不是共同評量。
