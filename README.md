# IoT 課程與無人機專題

2026-09-30 最新發布：Week3 Ans 已補充分壓推導與 OLED 實物接線說明，86 頁 PDF 原地更新至雲端；Week3 的 9 支完整程式另以 ZIP 提供於雲端，兩檔均下載回讀、核對 SHA-256 與上傳版本一致。Ans 與新程式包仍不加入 GitHub；Ans 程式正在修改，雲端 ZIP 是本次已上傳的版本，不代表後續本機修改已同步。其他週次程式維持暫不上傳。見[發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-cloud-update.md)。

## 選擇入口

- [IoT課程：18週教材](IOT_Introduction/README.md)
- [Week 1：課程大綱與中文採購清單](IOT_Introduction/Week_01_Course_Orientation/week1_main.md)
- [Week 2–7 重設稿、操作修正與待確認事項](IOT_Introduction/docs/teaching_drafts/README.md)
- [Drone：無人機專題](Drone/README.md)

每週只有一份主教材。Week2～7、11、12、14、15 的 Main 都是題目卷，完整基本教學與參考答案另在教師提供的 Ans，完整程式改為另外開啟檔案。Ans 與新程式資料夾不加入 Git；Week3 程式已另提供雲端 ZIP，其他週次程式暫留本機。雲端狀態以[最新發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-cloud-update.md)為準。OLED 正式教學安排在 Week5；報告週、筆試規定與配分不變。
無人機研究與課程的必買材料、必做進度分開。

## 檔案分類

```text
README.md             本頁
.gitignore            Git排除規則
Drone/                無人機專題
IOT_Introduction/     IoT課程
  Week_01_.../        每週唯一主教材，依序到Week 18
  examples/          Arduino程式與後端
  docs/              課綱、備課設計、硬體資料、圖片與實作紀錄
  scripts/           教材生成與驗證工具
```

課綱、進度與教師設計文件不再放在根目錄，統一從[課程文件導覽](IOT_Introduction/docs/README.md)查閱。

## 電腦與GitHub同步

第一次下載：

```powershell
git clone https://github.com/KennethWYLee/IoT.git
cd IoT
```

之後更新，先確認本機修改已保存並檢查差異：

```powershell
git status
git pull --ff-only
```

本機修改經檢查、commit及push後才會更新GitHub，並非自動即時同步。
驗證方式見[工具說明](IOT_Introduction/scripts/README.md)；實機前先查[硬體狀態](IOT_Introduction/docs/hardware/hardware_state.md)。

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`只留本機，不上傳GitHub；換電腦時另行複製。
暫存輸出集中在`_outputs/`，密碼、API金鑰與快取不提交。
