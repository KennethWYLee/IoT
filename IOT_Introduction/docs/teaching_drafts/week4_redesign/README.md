# Week4：環境顯示、提示與警報紀錄

現行 Main 是作品需求、預期行為、驗證與少量問答。維護來源為本目錄 `week4_main.md`；完整接線、程式設定、短原理及答案在教師的私有 `week4_answers`。

Q1 環境顯示器、Q2 超標提示器、Q3 環境警報紀錄器、Q4 電腦分析結果顯示。四件有 OLED／Serial 完整版本。Q3 只在裝置記憶體計次、計時及按鈕確認，開機直接開始，RST 歸零；Q4 才在授權資料夾建立 CSV、保存、分析、產生報告及回傳裝置。Q4 的 Serial 輸出在工具顯示，連線時不開 Monitor。不要求學生另學 Python。每週從空麵包板接線，下課斷電拆除。

現行程式維護來源為私有 `week4_answers/generate_three_projects.cjs`，Q3 使用同層 `alarm_recorder.cjs`，Q4 使用 `dual_alarm_analysis.cjs`。Q4 保留光敏與 DHT，光線、溫度各自判斷、計次、計時；濕度只顯示。現行工具入口 `dual_alarm_analysis.html`，不是舊版 `alarm_analysis.html`。八支獨立程式與工具維護於 `week4_answers`，`programs.sources.json` 指定複本。舊 A/B 程式只供追查。

```powershell
node IOT_Introduction/docs/teaching_drafts/week4_answers/generate_three_projects.cjs
node IOT_Introduction/scripts/package_answer_programs.cjs 4
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs
node IOT_Introduction/docs/teaching_drafts/week4_redesign/build.cjs --answers
node IOT_Introduction/scripts/package_answer_programs.cjs 4
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --render
python IOT_Introduction/scripts/verify_cumulative_lesson.py 4 --answers --render
```

建置需 Node 的 marked、playwright、Microsoft Edge 與 Microsoft JhengHei；驗證使用 Python 的 pypdf 及 Poppler。先更新程式複本再驗證 Ans。

建置會核對每頁區塊邊界、圖片、頁碼及來源雜湊，渲染另存於被 Git 忽略的 `_outputs`。仍需目視檢查，不能把程式編譯或桌面測試寫成實機通過。

2026-10-07 後續明確授權：更新 GitHub Main、Ans PDF，以及 Q1、Q2 的四支 OLED／Serial 程式。Q3、Q4 程式、電腦工具、答案維護來源與測試不公開；這次未要求更新 Drive。舊 review 記錄及程式只供追查。
Main 6 頁、Ans 11 頁。Main 新增教師提供的電腦端實測畫面，原 PNG 保存在 `docs/images/screenshots`，由既有 PDF builder 的 screenshot 指令嵌入並記錄雜湊；截圖不等於 OLED 回傳已通過。[2026-10-07 Q4 修訂](../../lab_notes/2026-10-07-week4-dual-alarms.md)改為兩組警報及＋／－軌接線。Q1～Q3 維護程式未改，Q3 現行檢查仍在 `checks/device_recorder_20261006`。較早單組 Q4、Q3 CSV 的測試只描述當時版本；新版檢查在 `checks/dual_20261007`。

教師的 `programs/environment_display_serial` 已手改 GPIO1、啟用 DHT，不覆蓋它。標準打包／全來源相等檢查會保護並指出這個差異。此輪使用 `node IOT_Introduction/docs/teaching_drafts/week4_answers/checks/dual_20261007/generate_package.cjs` 更新 Q4、工具及未修改的複本；專用 `verify_artifacts.py` 同時檢查兩份 PDF、輸出雜湊及該份明確記錄的工作設定。正式 Q1 維護來源仍為 GPIO10、核對旗標 false；不得把個人工作設定默認發布給全班。
