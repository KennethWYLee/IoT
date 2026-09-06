# IoT 課程與無人機專題

## 選擇入口

- [IoT課程：18週教材](IOT_Introduction/README.md)
- [Week 1：課程大綱與中文採購清單](IOT_Introduction/Week_01_Course_Orientation/week1_main.md)
- [Drone：無人機專題](Drone/README.md)

每週只有一份主教材。Week 2～7為完整備課版（含參考解答）；
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
