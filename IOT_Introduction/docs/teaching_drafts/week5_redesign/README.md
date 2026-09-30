# Week 5 Main、Ans、program

## 現行版本

2026-09-30：Main 8 頁；Ans 54 頁，前 8 頁原卷填答，第 9 頁起按題序教學。Main 先做 RGB 與 OLED 題，再介紹 A、B、C 的關係；不強加新作品或評分要求。

- 學生入口：[Main PDF](week5_main.pdf)，維護來源 `week5_main.md` 與 `build.cjs`。
- Ans 維護來源：本機 `../week5_answers/week5Ans.md`；PDF 與來源不加入 Git。
- Ans 先填答，再依 Q1、Q2、A/Q3/Q4、B/Q5、C/Q6、Q7 安排操作及原理。
- 四份完整程式在本週 Ans 的 `programs`，先讀 `START_HERE.md`；每支程式各有同名子資料夾。
- 程式包以 `programs.sources.json` 指定維護來源，由共用包裝工具核對雜湊；不覆蓋學生或教師另外修改的副本。
- 雲端已更新 Main、Ans 與 `program/IoT_week5_program.zip`，三檔均下載回讀核對 SHA-256。GitHub 不新增 Ans 或答案程式。
- 舊週目錄 Notebook／PDF 維持歷史版本，課程索引直接開本目錄的現行 Main；不從舊 Notebook 重新匯出覆蓋。

[共同修訂準則](../week2_redesign/revision_guidelines.md)；[本輪修訂與發布檢查](../../lab_notes/2026-09-30-week245-main-ans-program-publication.md)。

## 重建與檢查

從 IoT repository 根目錄執行。需既有 Node、marked、Playwright、Edge、Python、PyMuPDF、BeautifulSoup 與 Pillow。

```powershell
node IOT_Introduction/scripts/package_answer_programs.cjs 5
node IOT_Introduction/docs/teaching_drafts/week5_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week5_redesign/build.cjs --answers
python IOT_Introduction/docs/teaching_drafts/week5_redesign/verify.py --render
python IOT_Introduction/docs/teaching_drafts/week5_redesign/verify.py --answers --render
python IOT_Introduction/docs/teaching_drafts/week5_answers/check_exam_answers.py
node IOT_Introduction/scripts/package_answer_programs.cjs 5 --check
```

只有公開 repository 時可重建 Main；Ans 及其檢查須教師的私有來源。完整程式不再嵌入 PDF，`build_manifest.json` 記錄來源、圖片、產生器與 PDF 雜湊。

## 優先下一步

先確認同批 RGB 限流及電流、OLED 供電與訊號電位，再依 Main 驗證倒數、中止與恢復。預設 -1、false、LESSON_STAGE=0 保留，不能只把全部旗標改 true。已上傳不代表畫面已初始化。

本輪未改 .ino 行為，未上傳韌體或操作硬體，未重新進行目標板編譯與 MSVC 主機測試。T01 的歷史顯示回報不代表每一組模組都已核對。

較早重設、備課時程及歷史測試留在 [review.md](review.md)，舊頁數不覆蓋上方現行分工。
