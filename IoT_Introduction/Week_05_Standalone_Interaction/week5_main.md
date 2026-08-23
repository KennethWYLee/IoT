# Week 05：單機互動作品

日期：2026-10-07

## 準備器材

ESP32-S3、按鈕、KY-018、KY-016、KY-012、SG90、學生個人自購的 4AA
帶開關電池盒、麵包板、杜邦線及萬用電表。重用 Week 2～4 已驗證的接線與
供電方式。

## 教材內容

- 按鈕開始、光線條件、狀態、決策、輸出與 reset。
- IDLE、READY、ACTIVE、RESULT、ERROR 狀態圖。
- 非阻塞時間控制、timeout 與 fail-safe。

## 課堂實作

先完成共同的「光線互動狀態裝置」：按鈕開始、KY-018 判斷光線條件、
RGB 顯示狀態，條件成立時由蜂鳴器短聲提示並讓 SG90 完成一次受限動作。
感測無效、timeout 或重新啟動時必須回到 ERROR 與安全位置。共同版本完成
後，再修改情境、門檻、提示或機構。

## 完成檢核

- [ ] 無網路仍可從 IDLE 完成互動並回到 IDLE。
- [ ] 狀態圖與程式行為一致。
- [ ] 三次正常流程都有狀態、結果與經過時間紀錄。
- [ ] 一次感測異常或 timeout 會進入 ERROR 並停止危險輸出。
- [ ] 已整理 Week 6 使用的事件欄位。

教材設計依據：[Week 2～5 硬體課程教材設計藍圖](../../docs/hardware_course_material_plan.md)

參考：[單機狀態表](../../docs/course_materials/student_worksheets.md)｜[狀態機範例](../../docs/course_materials/starter_code_snippets.md)
