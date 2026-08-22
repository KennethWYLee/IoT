# 06：Backend、Database 與 structured logs

## 對應週次

Week 6 建立第一個 Backend，Week 11 加入 Database、歷史查詢與分析。

## 教材內容

- API 路由、輸入驗證、錯誤回應、設定與服務重啟。
- 即時狀態、歷史事件、命令紀錄與錯誤紀錄的差異。
- 基本欄位：timestamp、device_id、event_type、value、command_id、result。
- structured log、correlation／command ID、錯誤與操作統計。
- 不在程式、Database 或 log 中留下密碼、token 與不必要個資。

## 實作

1. 啟動範例 Backend 並以測試 API 驗證。
2. 寫入真實裝置事件及命令結果。
3. 建立依 device、時間或事件類型查詢的歷史 API。
4. 製造一次失敗並用 log 還原原因。

## 完成檢核

- [ ] Backend 能由 README 重新啟動。
- [ ] Database 有真實歷史資料且可查詢。
- [ ] 一次失敗可由 structured log 完整解釋。
- [ ] 有至少一種操作與一種錯誤統計。

參考：[可執行的範例 Backend](../../examples/course_backend/README.md)｜[Database 與 log 設計表](../../docs/course_materials/student_worksheets.md)
