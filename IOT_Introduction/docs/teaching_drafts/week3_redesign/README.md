# Week 3 Main 與 Ans

## 2026-09-23：三個延伸作品

授課內容、四支基本程式及既有練習保留；Main 新增六頁題目與預期結果，合計 62 頁。
第 55–56 頁：光敏＋按鈕，可暫停的遮光計數器。
第 57–58 頁：光敏＋OLED，顯示即時值及本次最小／最大值。
第 59–60 頁：光敏＋按鈕＋OLED，保存光線快照並對照 Serial 紀錄。
每題只有情境、材料、成品畫面示意、功能規則及預期結果，不提供接線步驟、演算法或答案。
OLED 僅提前作為自行探索的延伸材料，Week5 正式 OLED 教學不搬動；安全規格仍須先確認。
三題不自動新增繳交要求或評分。既有 week3Ans 不改，沒有本次三題的答案。
本次未 commit、push、上傳或操作硬體；前一輪版本已於 a16866f 發布。
本次核對見 [延伸作品紀錄](../../lab_notes/2026-09-23-week3-extension-projects.md)。

以下內容保留各次修改當時的頁碼與狀態。

2026-09-22 本輪：Main 保留基本程式與原理，延伸題答案另放本機 week3Ans。
新增兩張「只改一處」反例對照圖，相關接線只作圖上推演；不新增實物實測。
目前頁次以 PDF 頁尾與產生器清單為準，下方舊頁碼保留沿革意義。
[本輪修改、驗證與限制](../../lab_notes/2026-09-22-weekly-main-answers.md)。本輪尚未提交或上傳。



2026-09-22 依教師要求沿用 Week2 的教學方式，不套用 Week2 題目。維持操作、觀察、解釋原理的順序；OLED 不加入本週。

- Main：本目錄 week3_main.pdf，54 頁；維護來源 week3_main.md、build.cjs。
- 基本程式：三支既有量測／分類程式，及 button_light_capture。全文直接由 .ino 嵌入各自操作段落，不維護手抄副本。
- p1–14：電表、3V3、GPIO5 電壓與完整程式。
- p15–26：光敏模組、S 電壓、ADC、保存紀錄與資訊流。
- p27–38：依本輪資料分類、完整程式、固定電阻分壓與電流。
- p39–47：按一下記一筆；接線圖、完整程式、資訊流、電流與按壓辨識。
- p48–49：單位及編譯摘要判讀。
- p50：觀念練習；p51–52：三筆取樣題目與預期結果；p53–54：保存／收納與來源。
- Ans：本機 ../week3_answers/week3Ans.pdf，10 頁。含兩個練習的解答、完整三筆程式與驗證方法；整個資料夾由 .gitignore 排除。
- button_light_capture 不含批次定時演算法；三筆練習不再只是改一個筆數常數。單筆範例保留 40 ms 去抖與放開再按，且在 Main 說明，不假設 Week2 已教過。
- 原 Week_03_Electrical_Measurement_and_ADC notebook／PDF 保留，不當成本次閱讀入口；尚未替換舊出口或修改其產生器。
- 本次沒有硬體操作，沒有 commit、push 或雲端上傳。其他週及 Week2 既有本機修改不動。

## 重建與檢查

在 repo 根目錄執行；先將 NODE_PATH 指到已安裝 marked、playwright 的 node_modules。

```powershell
node IOT_Introduction/docs/teaching_drafts/week3_redesign/build.cjs
python -X utf8 IOT_Introduction/docs/teaching_drafts/week3_redesign/verify.py
node IOT_Introduction/docs/teaching_drafts/week3_redesign/build.cjs --answers
python -X utf8 IOT_Introduction/docs/teaching_drafts/week3_redesign/verify.py --answers
python -X utf8 IOT_Introduction/docs/teaching_drafts/integration_checks/run.py --week 3
python -X utf8 IOT_Introduction/docs/teaching_drafts/week3_answers/run_checks.py
```

Ans 建置與測試需要另行取得本機私有資料夾；Main 可獨立建置。PDF 中的基本程式連結跳到本冊程式頁，不依賴尚未更新的 GitHub 程式。

逐頁範圍、編譯與待實測事項見 review.md 的最新增補及對應 lab note。建置、編譯、主機模擬與硬體實測分開記錄，不宣稱學生已獨立完成。
