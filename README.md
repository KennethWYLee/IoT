# IoT 課程與無人機專題

2026-09-30 Week1：已補齊 Arduino／ESP32 安裝設定、Hello 上傳與 Serial 觀察、修改與排錯，以及 Week2 先備能力說明。入口為 [Week1](IOT_Introduction/Week_01_Course_Orientation/week1_main.md)，可下載程式在 [program/week1](program/week1/README.md)。本次更新 GitHub，不更新雲端；見[修訂與驗證紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week1-arduino-readiness.md)。

2026-09-30 程式公開：依教師新授權，Week3 的 9 支 `.ino` 放在 [program/week3](program/week3/README.md)，保留 Arduino 同名資料夾，不用 ZIP。未來各週已開放的程式統一放在 [program](program/README.md) 下按週分類；本次不連帶公開其他週程式，也不更新雲端。見[程式發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-program-github.md)。

2026-09-30 Ans 授權：Week3 Ans 的 86 頁 PDF 現列入 GitHub，見[Week3 答案與逐題教學](IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3Ans.pdf)。答案維護來源與其他週 Ans 不因此公開；Week3 程式另依上方新授權公開。下方較早發布紀錄的「Ans 不加入 GitHub」不再適用於這份 PDF。見[答案發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-ans-github.md)。

2026-09-30：Week2、Week4、Week5 已依 Week3 的 Main／Ans／program 分工完成修訂。Main 為 6／12／8 頁，Ans 為 44／64／54 頁，先原卷填答再按題序教學。六份 PDF 及三個程式 ZIP 已更新雲端並下載核對；程式包位於 `codex/課堂教材/IoT/program`。GitHub 維持 Public，不新增 Ans 或答案程式。見[本輪修訂與發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week245-main-ans-program-publication.md)。

2026-09-30 Week3 入口已替換：原週目錄的 PDF 與 Notebook 都改為目前 13 頁考卷。舊含答案教學版另行封存、不新增至 Git。課程索引直接開啟原週目錄的新版 PDF；教師已授權本次 commit、push。見[替換及發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-main-promotion.md)。

2026-09-30 最新發布：Week3 Ans 已補充分壓推導與 OLED 實物接線說明，86 頁 PDF 原地更新至雲端；Week3 的 9 支完整程式另以 ZIP 提供於雲端，兩檔均下載回讀、核對 SHA-256 與上傳版本一致。Ans 與新程式包仍不加入 GitHub；Ans 程式正在修改，雲端 ZIP 是本次已上傳的版本，不代表後續本機修改已同步。其他週次程式維持暫不上傳。見[發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week3-cloud-update.md)。

## 選擇入口

- [IoT課程：18週教材](IOT_Introduction/README.md)
- [各週程式：program](program/README.md)
- [Week1：課程、採購與 Arduino／ESP32 第一次操作](IOT_Introduction/Week_01_Course_Orientation/week1_main.md)
- [Week 2–7 重設稿、操作修正與待確認事項](IOT_Introduction/docs/teaching_drafts/README.md)
- [Drone：無人機專題](Drone/README.md)

每週只有一份主教材。Week2～7、11、12、14、15 的 Main 都是題目卷，完整基本教學與參考答案另在 Ans，完整程式改為另外開啟檔案。Week3 Ans PDF 與 9 支程式已獲准加入 GitHub，其餘 Ans 與新答案程式維持不加入 Git；Week2～5 程式已獲授權另提供雲端，其他週次程式暫留本機。雲端狀態以[最新雲端發布紀錄](IOT_Introduction/docs/lab_notes/2026-09-30-week245-main-ans-program-publication.md)為準，本次未變更雲端。OLED 正式教學安排在 Week5；報告週、筆試規定與配分不變。
無人機研究與課程的必買材料、必做進度分開。

## 檔案分類

```text
README.md             本頁
.gitignore            Git排除規則
Drone/                無人機專題
program/              已公開的各週 Arduino .ino，按 weekN 分類
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
