# Week 4 主教材重設稿

## 目前版本：2026-09-30

先整理 Week3 已確認的 Main／Ans／program 做法，再套用到 Week4。可沿用的規則集中在[教材修訂準則](../week2_redesign/revision_guidelines.md)最前一節。

- `week4_main.md`／PDF：12 頁考卷。Q1 後先說明 A～D 的關係，再依作品、特色、預期結果、驗證方法及作答安排；保留原來的器材、題目與行為條件。
- `../week4_answers/week4Ans.md`／PDF：64 頁。前 12 頁保留 Main 原題並填答，p13 起按相同題序教實作。實測欄不造假標準值；完整程式不印入 PDF。
- `../week4_answers/programs/`：四份完整 Arduino 程式、`START_HERE.md` 與來源雜湊清單。題目名稱、開檔位置、必要設定及啟動訊息對應；canonical 程式行為未改。
- 本輪沒有 commit、push 或雲端上傳。Ans 與 program 保持既有 Git 忽略；歷史發布紀錄不代表本輪已發布。

驗證結果與課前限制見[本輪紀錄](../../lab_notes/2026-09-30-week4-main-ans-program.md)。DHT 腳序、供電／訊號相容性與蜂鳴器的電流、上電、停止條件仍待確認；不能把 PDF 已建置當成實機通過。

```powershell
$env:NODE_PATH='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
$env:PYTHONPATH=(Resolve-Path '_outputs/review_dependencies').Path
$python='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
node IOT_Introduction/scripts/package_answer_programs.cjs 4 --check
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs --answers
& $python -X utf8 IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py --render
& $python -X utf8 IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py --answers --render
```

## 歷史版本：2026-09-26

教師要求「根據 Week3 做法改寫 Week4」：本目錄 `week4_main.md`／PDF 是 **11 頁純考卷**；`../week4_answers/week4Ans.md`／PDF 是 **72 頁完整教學與答案**，繼續由 Git 忽略，不公開加入 repository。

Main 順序是電阻量測、DHT 溫濕度紀錄、品質判讀、電流與資訊流、雙感測器遮光提醒、按鈕環境紀錄、延伸資料收錄。實作先說作品與特色、預期結果、驗證，再作答；不列板型、GPIO、程式庫、設定及完整程式。沒有增加 OLED、零件、功能、評分或週次。

Ans 首頁有 Main 題號索引；原基本教學、完整程式及反例解說已移入，延伸答案仍完整保留。四份 `.ino` 原文嵌入且雜湊核對，沒有修改韌體。現行課程入口仍指向本目錄，不改歷史週目錄。

完整性、題目條件、獨立紙上計算、主機測試與渲染檢查見[本輪紀錄](../../lab_notes/2026-09-26-week4-exam-answers.md)。教師後續授權發布，教材提交 cae86c6 已推送；兩份 PDF 已更新原雲端檔案，回讀 SHA-256 與本機一致。Ans 不加入 Git，專案仍為私人。沒有實機操作；DHT 與蜂鳴器的課前硬體確認尚未完成，不能把軟體檢查當成實機通過。

```powershell
$env:NODE_PATH='C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs --answers
python -X utf8 IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py --render
python -X utf8 IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py --answers --render
```

## 歷史版本

2026-09-22 本輪：Main 保留基本程式與原理，延伸題答案另放本機 week4Ans。
新增兩張「只改一處」反例對照圖，相關接線只作圖上推演；不新增實物實測。
目前頁次以 PDF 頁尾與產生器清單為準，下方舊頁碼保留沿革意義。
[本輪修改、驗證與限制](../../lab_notes/2026-09-22-weekly-main-answers.md)。本輪尚未提交或上傳。



依 2026-09-16 教師要求，沿用 Week 2「一起操作、看到結果、再講原理」的教學方式，並承接新版 Week 3。本稿是完整課堂閱讀稿，不是前幾頁的樣式試排。

- 維護來源：`week4_main.md`、`build.cjs`。既有兩支 `.ino` 加上本目錄 `button_environment_log/button_environment_log.ino`，附錄自動嵌入，不另維護複本。
- 閱讀成品：本目錄 `week4_main.pdf`，58 頁。p34–39 為按鈕＋光敏＋DHT 環境紀錄器；p38 動手改無效 DHT 時跳過收錄、p39 緊接解答。p44 起為完整程式。新增程式取得及 HW-508 接點表；DHT 確切腳序仍待確認。
- 練習與解答：第 17／18 頁、第 32／33 頁，均為題目後緊接解答。這是教師與學生共讀的形成性練習，不是未公開的考卷。
- 正式 `Week_04_Sensors_and_Data_Quality/week4_main.ipynb`、PDF、原 Markdown 來源與程式均未改動。尚未切換正式出版來源。
- 本稿先前已隨 869418b 發布；本次與 Week 3／5 一起增加舊零件整合活動，教師已授權提交並推送，版本見 Git 歷史。Week 2、QA、硬體實測紀錄及採購數量未更動。
- 課前仍需確認 DHT11 的實際三針腳序、3.3 V 供電及 DATA 電位；蜂鳴器僅有局部測試，不能當成全班已可照接。本稿沒有虛構這些確認結果。

## 重建

從 IoT repository 根目錄執行，環境需有 Node、marked、Playwright、Edge、Python、PyMuPDF、Pillow：

```powershell
$env:NODE_PATH='C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
python IOT_Introduction/docs/teaching_drafts/week4_redesign/verify.py
```

建置產生 PDF 與來源雜湊清單。HTML、版面檢查、每頁 PNG 和縮圖放在忽略追蹤的暫存區。這些命令不使用 USB、不上傳韌體。

## 教師備課

詳見 `review.md`。優先完成 DHT11 的課前核對與一輪實際取樣，因為它是新增的共同核心硬體。蜂鳴器尚未確認時可完成無聲整合作品；DHT 尚未確認時，不能宣稱已完成雙感測器實作。
