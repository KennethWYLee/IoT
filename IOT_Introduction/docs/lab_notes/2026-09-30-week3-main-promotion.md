# 2026-09-30：Week3 原入口替換為目前考卷

## 範圍

教師要求立即替換原 Week3 Main。原週目錄的 `week3_main.pdf` 換成
`docs/teaching_drafts/week3_redesign/week3_main.pdf` 的相同位元組；13 頁、
Q1～Q5、A～D、題目要求與版面均不變。Notebook 由同一份維護來源產生
13 個 Markdown 題目段落，附 Q3 電路圖，不含答案、程式 cell 或執行輸出。

維護來源仍為 week3_redesign，不把生成副本當作獨立來源。
新增 `scripts/sync_week3_main.cjs` 同步與核對原入口；產生器與入口檢查
依此辨識新版，舊版圖形／分類產生器拒絕覆寫新版。課程索引直接連原位置 PDF。

## 保留與發布

舊 PDF、Notebook JSON、PDF 匯出清單及匯出器原始版本保存於
`docs/archive/week3_before_exam_promotion/`。含答案的 PDF／JSON 加入 Git
忽略規則；匯出器原始版本只用於保留未修改其他週 PDF 的產生來源紀錄。
既有 Git 歷史沒有刪除或改寫，本次封存不代表撤回過去已公開的教材。

原有 Week4 修改、修訂準則及根目錄未追蹤 examples 均保留。
為避免替換 Week3 後斷鏈，只修正舊 Week4 教學來源及其 Notebook 的一個
跨週分類連結，改指仍存在的原分類來源，並重新匯出舊 Week4 PDF。
沒有改動正在修訂的 Week4 重設稿、程式或答案。
本次沒有 stage、commit、push、雲端上傳或硬體操作。雲端原先已有相同
13 頁考卷，本次修正本機原週目錄；GitHub 原入口要在提交與推送後才會更新。

## 檢查

1. `sync_week3_main.cjs --check` 通過：原入口 PDF 與維護輸出完全相同，
   SHA-256 為 `12d1d8534b21cf8104c7ce5d9d30dc1d661381501d2665939d932c6b2625bff7`。
   Notebook 的 13 個題目段落與來源及電路附件一致，沒有答案或 code cells。
2. Week3 `verify.py` 通過：來源／產生器／PDF 雜湊、13 頁、字元、頁型、
   題目順序、電路算式與接點檢查。用 Poppler 渲染 13 頁，檢視全部頁面
   縮圖及 Q3 放大圖，未見缺字、裁切或重疊。
3. Notebook 在本機 Edge 以 1200／420 px 寬度預覽，13 個段落與圖片完整
   載入、頁面無水平溢出；另檢視 Q3 電路附件。未測試 GitHub 線上渲染。
4. `verify_intro_navigation.cjs`、`verify_week3_notebook.cjs`、
   `verify_course_materials.py`、`export_notebook_pdfs.cjs --check` 通過。
   全課程結構與連結檢查涵蓋 143 份 Markdown／Notebook。
5. 舊 Week4 PDF 的 51 頁文字與修正前完全一致；全部頁面在 36 dpi
   渲染的像素也相同。回讀第 32 頁確認分類連結已更新。其他週的 PDF
   未重新產生；保留原匯出器版本作為其來源紀錄，而非冒稱重新建置。
6. Git 忽略規則確認舊含答案 PDF／Notebook JSON 不會新增至公開 Git。
   `git diff --check` 沒有空白錯誤，只有既有 CRLF 提示。
7. 額外執行的舊照片檢查器 `verify_hardware_galleries.cjs` 因 Week2 已無
   `week2_main.ipynb` 而停止；此為先前入口替換留下的舊工具假設，本次
   不擴大修正 Week2，也不宣稱該全週照片檢查通過。

本次只替換教材入口與必要的連結／產生工具，不重跑韌體或實機測試，
不據此宣稱器材已通過操作驗證。教師最後指示先更新 Week3，本輪不再
擴大至其他週的教材重整。

## 後續 Git 發布授權

教師接續明確要求 commit、push。本次只提交本紀錄所列的 Week3 原入口、
必要連結、工具、索引及封存忽略規則；舊 Week4 的一處跨週連結修正隨同
其來源、Notebook／PDF 提交。Week4 重設稿、教材修訂準則、Week4 程式、
另一本機 Week4 作業紀錄及根目錄 examples 不在本次提交範圍。
共用 teaching_drafts/README 僅提交 Week3 文字，保留 Week4 段落為本機修改。

發布前 `git fetch origin` 成功，HEAD 與 origin/main 均為 `78be3f1`，
雙向提交差異為 0／0。採一般 commit、push，不強制推送或改寫歷史；
本次不另上傳雲端 PDF，不加入 Ans 或新程式包。
