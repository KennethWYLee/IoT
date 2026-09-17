# Week 2–7 操作缺口修正紀錄

日期：2026-09-17。課程：IoT。依教師要求「先補會阻止操作完成的缺口」。

本輪以 `95b2160` 的逐頁檢查為基準，修正 `docs/teaching_drafts/` 的維護來源並重新產生六份 PDF，不更動正式週目錄的 notebook／PDF、課綱、評分與採購。沒有硬體操作。修正完成後教師接續要求「修正後 commit and push」，授權發布這批來源、PDF、檢查程式及紀錄；不包含 Google Drive 上傳。

原 [288 頁檢查報告](2026-09-17-week2-7-page-review/report.md)和[逐頁紀錄](2026-09-17-week2-7-page-review/page_review.md)保留原樣，供版本追溯；舊頁碼與雜湊不是這次新版的頁碼與雜湊。當前閱讀入口為[重設稿索引](../teaching_drafts/README.md)。

## 修正內容

| 週次 | 新版頁數 | 已修正的操作說明 |
|---|---:|---|
| Week 2 | 34 | 計數器使用實際 `.ino` 檔；補下載、解壓縮、資料夾與 IDE 開檔步驟，不依賴複製 PDF 程式。 |
| Week 3 | 54 | 補各程式路徑、設定查找、保存 UTF-8 log；按鈕改明確孔位；延長選做測試的取樣間隔，使學生能測試忙碌時再次按鍵；分開兩種接線的收尾步驟。 |
| Week 4 | 58 | 補程式路徑、Serial 輸入位置、蜂鳴器 1kΩ 接線及欄位、延伸按鈕孔位。DHT 不再用模糊提示掩蓋缺少的腳位與電壓資料，而是明列必須取得的資料與停止點。 |
| Week 5 | 56 | 補程式取得與兩顆按鈕孔位；明確區分 Serial 倒數版與按鈕倒數版的中止／收尾操作，後者不接受 x、z、o。 |
| Week 6 | 49 | 裸板設定／上傳移到接線前；列出設定欄位；補 STOP 孔位、外部共地引線及 OLED 缺少的 3V3→a6；OLED 設定與接線分頁；補啟用、停止及斷電順序。接頭與舵機參數仍須實物確認。 |
| Week 7 | 48 | 先設定、裸板上傳，再接線；補各 GPIO 與設定名稱、按鈕回地線及避免共用插孔；將開始、計分、結束拆為三局，先教重開；補擴充輸出欄位及回到 Stage 1 的拆線、設定與比較基準。 |
| 合計 | 299 | 包含完整程式附錄；不是新增 11 頁必評量活動。 |

Week 2 維護來源為 `counter_project.cjs`；Week 3–7 為各週 `weekN_main.md`，Week 6／7 同步修正 `build.cjs` 中的接線圖。PDF 和 Week 3–7 的 `build_manifest.json` 均由建置產生，不直接修改 PDF。

沒有修改 `.ino`。沒有重設既有實測狀態。新增孔位是將既有功能接法明確寫出後的教材配置，不能說成這組孔位已在實物上測過。

## 驗證與限制

- 六個 builder 均成功，Week 2 圖片與排版檢查通過；Week 3–7 沒有頁面內容溢出或缺圖，最小頁尾間距依序為 45.16、114.45、80.20、84.97、74.72 CSS px。
- Week 3–7 各週 `verify.py` 通過：來源雜湊、完整附錄程式與維護來源相符、練習下一頁是解答、既有答案運算與節點檢查通過；265 頁均已重新渲染。
- 目視檢查 35 張受影響頁面；最後另用 Poppler 放大檢查 Week 6 p24 OLED 供電表、Week 7 p9 雙按鈕圖表，未見遮擋或裁切。
- 新增[靜態操作檢查](../teaching_drafts/integration_checks/verify_walkthrough_steps.py)：程式路徑、順序、版本命令、練習相鄰頁與理想麵包板連線模型通過。模型分別檢查每顆按鈕放開／按下、回到 GND 的路徑及列出的插孔無重複占用。
- 麵包板模型只涵蓋明列的按鈕回路與 OLED 電源，不驗證整機電流、接觸品質、元件額定值或實物按鈕方向。使用者仍須按教材做斷電導通確認。
- 全課程結構及本地連結檢查通過（114 份 Markdown／notebook）；`git diff --check` 通過，`.ino` 差異為空。
- 本輪未重新編譯 Arduino，也未重跑沒有變更的韌體主機測試；既有結果保留原日期與範圍，不能當成本輪新測試。沒有 Upload、致動器動作、帶載電源測試或學生跟做測試。

在 repository 根目錄重跑本輪檢查：

```powershell
python -X utf8 IOT_Introduction/docs/teaching_drafts/integration_checks/verify_walkthrough_steps.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week3_redesign/verify.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week5_redesign/verify.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week6_redesign/verify.py
python -X utf8 IOT_Introduction/docs/teaching_drafts/week7_redesign/verify.py
python -X utf8 IOT_Introduction/scripts/verify_course_materials.py
git diff --check
```

## 尚未解除的條件

先讀[硬體狀態](../hardware/hardware_state.md)，保留已成功的上傳、按鈕、KY、RGB、OLED、受限蜂鳴器與空載降壓量測紀錄，不要求全部重做。

1. **Week 4 DHT：** 接頭遮住實際腳位標示，尚缺斷電後清楚的接腳照片、該模組 3.3V 供電／DATA 相容性及選用 GPIO。只補文字不能讓此路徑實際完成；資料不足時維持阻擋，不猜腳位。
2. **Week 6 舵機與 Week 7 Stage 2：** 仍缺確切型號、接頭匹配與負載能力、帶載電源、頻率／脈寬／安全角度、啟動及停止驗證。GPIO7 仍只是候選。先輸出 signal 再開外部電源的既有流程，還須確認不會異常回灌，必要時修改介面或啟動策略。
3. **既有零件整合：** RGB 限流、OLED 邏輯電壓與光敏基準等原有待確認項目，仍以硬體紀錄為準。T01 曾出現成功畫面或聲音，不等於所有同名模組、聲長或新整合接法均通過。
4. **課堂節奏：** 本輪只處理操作缺口，沒有實測全班完成時間；既有 165 分鐘課表與各週核心／選做內容的安排，需要另行審視，不能用程式附錄頁數推算授課時間。

## 下一步與發布狀態

優先取得 **Week 4 DHT 缺少的實物資訊**，因為它是依授課順序最早仍會擋住完整操作的元件。預期產出是與實物相符的腳位照片、電壓依據及設定；完成條件是資訊足以寫出確定接線，並在明確授權且安全條件確認後完成受控測試。舵機項目另外保留，不以它阻擋已能做的低功率活動。

本輪不宣稱「所有缺口已解除」或「學生一定能做完」。本次 Git 發布只涵蓋重設稿及相關索引、檢查紀錄；正式出口與舊版封存尚未執行，之後替換時須同步處理維護來源、notebook、PDF 與索引，避免兩套內容同名。未追蹤的 `examples/` 與其中 runtime 資料庫未更動，也不納入提交。

發布前 `git fetch origin` 成功，本機 `main` 與 `origin/main` 均為 `95b2160`，沒有分歧。此次使用一般提交及一般推送，不改寫歷史；完成與否以 Git 提交及推送後的遠端核對為準。
