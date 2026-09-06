# IoT 課程與無人機專題

本 repository 分成兩個獨立入口：`IOT_Introduction` 保存 IoT 玩具與互動硬體設計課程，
`Drone` 保存 ESP32 無人機研究。兩者都同步到 GitHub；無人機研究不是課程必買材料或必做進度。

IoT 課程從 ESP32-S3、安全接線與感測實作開始，完成紅綠燈遮光挑戰，
再逐步整合後端、資料庫與手機介面。學生專題須有實體行為、可追蹤資料及安全復原證據。

## 從這裡開始

| 你要做什麼 | 入口 |
|---|---|
| 查看無人機專題的目前方向與研究紀錄 | [Drone](Drone/README.md) |
| 閱讀各週教材、查看目前進度 | [18週教材](IOT_Introduction/README.md) |
| 確認學生必買器材與分組電表 | [Week 1正式材料清單](IOT_Introduction/Week_01_Course_Orientation/week1_main.md#一學生材料採購總表) |
| 開啟Arduino程式或執行後端 | [範例程式](IOT_Introduction/examples/README.md) |
| 備課、查課綱、硬體狀態與實作紀錄 | [課程文件](IOT_Introduction/docs/README.md) |

所有週次只保留一份主教材，Week 1已整合課程大綱與中文採購清單，不再另開support。
Week 2～7以單本`weekN_main.ipynb`為閱讀入口，包含概念、圖解、程式、
操作、練習及參考解答；屬於**完整備課版（含答案）**。各週入口與實機待驗狀態見
[18週導覽](IOT_Introduction/README.md#18-週導覽)，不要把重整中的舊稿當成已完成教材。

## 目錄分工

```text
Drone/                無人機專題與研究文件
IOT_Introduction/     IoT 課程
  Week_01_.../        各週教材，依序到 Week 18
  examples/          Arduino 程式與後端
  docs/              維護來源、硬體資料、照片與實作紀錄
  scripts/           教材生成與驗證工具
*.md                 全課課綱、進度及設計總覽
```

根目錄的課程總覽：

- [18週課程規劃](18_week_plan.md)：正式週次、評量與作品要求。
- [中文課綱](1151_course_syllabus_draft.md)／[英文課綱](1151_course_syllabus_english.md)／[校曆對齊](1151_calendar_aligned_course_plan.md)。
- [教材設計標準](weekly_lesson_design_framework.md)／[18週教師課卡](teacher_18_week_materials.md)。
- [硬體教材藍圖](hardware_course_material_plan.md)／[紅綠燈遮光挑戰設計](traffic_light_challenge_design.md)。
- [材料與課堂執行](18_week_materials_arrival_runbook.md)／[Type B活動設計](typeb_course_redesign.md)。

每週教材、程式 README、圖片說明與實作紀錄留在所屬資料夾，不全部攤在根目錄。
器材圖片保留在`IOT_Introduction/docs/images/`；歷史入門QA及舊致動器教材集中於
[舊稿區](IOT_Introduction/docs/archive/README.md)，不列入主要閱讀路徑。

## 在另一台電腦繼續

第一次下載：

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
```

之後更新，先確認沒有未保存的修改：

```powershell
git status
git pull --ff-only
```

若有本機修改，先保存並檢查差異，不以強制覆寫方式更新。
實機前查閱[硬體狀態](IOT_Introduction/docs/hardware/hardware_state.md)及[實作紀錄](IOT_Introduction/docs/lab_notes/README.md)；
完成後記錄接法、結果與尚未驗證事項，再同步版本。

`Drone/`與`IOT_Introduction/`及公開 Markdown 文件均由同一個 Git repository 追蹤。
編輯後須檢查、commit 並 push 才會更新 GitHub；另一台電腦須 pull 才會更新，並非自動即時同步。

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`仍僅保留本機，
不會隨GitHub下載；換電腦時如需使用，另行複製本機文件。暫存輸出集中在
`_outputs/`並排除於Git。Wi-Fi密碼、API金鑰與其他機密不得提交。

重整後請從本頁重新開啟教材；舊資料夾連結可能失效。網址中使用 commit 編號的歷史版本
不會更新成最新版；一般閱讀請使用 `main` 分支。目錄名稱統一為 `IOT_Introduction`，大小寫一致。

從 repository 根目錄檢查文件：

```powershell
python IOT_Introduction/scripts/verify_course_materials.py
git diff --check
```
