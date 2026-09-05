# IoT 課堂教材包

本資料夾是現行「IoT 玩具與互動硬體設計」可維護教材。學生可自由選擇
實體作品，但必須讓軟體記錄資料／事件或協助使用者監看與操作。

## 文件

- [weekly_lesson_design_framework.md](weekly_lesson_design_framework.md)：依Week 2／Week 3
  修訂經驗建立的教材產生與驗收方法。涵蓋入門概念、完整例子、數字／單位判讀、圖解、
  跨階段操作、單一主題Discussion及學生提問回寫；以好懂、清楚、完整為標準，不設教材時間上限。
- `teacher_18_week_materials.md`：每週教師課卡、時間配置與可收成果。
- `student_worksheets.md`：可貼到 LMS 的學生任務單與紀錄模板。
- `rubrics_and_checklists.md`：安全檢查、兩次筆試藍圖與三次專題報告評分表。
- `starter_code_snippets.md`：ESP32-S3 與連網範例骨架；實機前須核對腳位。
- `../../examples/course_backend/`：可執行的 HTTP／WebSocket／SQLite 課堂 prototype。

## 使用順序

1. 先查 `../../PROJECT.md` 與 `../18_week_plan.md` 的最新固定決策。
2. 一般教學週依 `weekly_lesson_design_framework.md` 建立Teaching Point與完整教學循環；
   一次完成一個已授權單元的修訂與適用驗證，不以課堂分鐘數刪減必要說明。
3. 依當週教師課卡準備器材、故障例與課末可檢查成果。
4. 從學生任務單挑選必要頁面，不必每週整份發放。
5. 程式範例先由教師使用確切板卡、腳位與供電完成實機驗證。
6. 學生版本不得包含筆試答案、教師評分註記、Wi-Fi 密碼或 API key。

## 共同底線

- 第2-6週只處理硬體、安全、量測、感測、致動與單機互動。
- 第10週使用HTTP／WebSocket；第11週整合MQTT與Database，第13週完成手機前台。
- 每件期末作品有真實硬體、學生後端、Database、structured log 與手機可用介面。
- 控制行為留下命令與執行結果；系統錯誤有可見狀態與安全處理。
- 教師三套材料只作驗證與示範，不提供學生借用或故障替換；學生每組1～3人並
  準備1台萬用電表，1人組可跨組共用，教師電表只作示範與參考。
- 智慧停車與 UCI 4WD 是教師延伸案例，不是共同評量。
