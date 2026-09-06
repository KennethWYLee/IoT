# IoT 玩具與互動硬體設計

從ESP32-S3、安全接線與感測實作開始，逐步整合後端、資料庫與手機介面。
專題由學生自行選題，但必須有可觀察的實體行為、可追蹤的資料或命令，以及安全與復原證據。

## 從這裡開始

| 你要做什麼 | 入口 |
|---|---|
| 閱讀各週教材、查看目前進度 | [18週教材](IoT_Introduction/README.md) |
| 確認學生必買器材與分組電表 | [Week 1正式材料清單](IoT_Introduction/Week_01_Course_Orientation/week1_support.md#一學生材料採購總表) |
| 開啟Arduino程式或執行後端 | [範例程式](examples/README.md) |
| 備課、查課綱、硬體狀態與實作紀錄 | [課程文件](docs/README.md) |

目前Week 2～4以單本`weekN_main.ipynb`為閱讀入口，包含概念、圖解、程式、
操作、練習及參考解答；屬於**完整備課版（含答案）**。其他週次的整理狀態見
[18週導覽](IoT_Introduction/README.md#18-週導覽)，不要把重整中的舊稿當成已完成教材。

## 目錄分工

```text
IoT_Introduction/   各週教材；從這裡閱讀
examples/           可直接開啟的程式與後端
docs/              課程規劃、備課、硬體資料、照片與紀錄
scripts/            教材生成與驗證工具
```

完整週次、評量與作品要求，以[18週課程規劃](docs/course/18_week_plan.md)為準。
器材圖片保留在`docs/images/`；歷史入門QA及舊致動器教材集中於
[舊稿區](docs/archive/README.md)，不列入主要閱讀路徑。

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
實機前查閱[硬體狀態](docs/hardware/hardware_state.md)及[實作紀錄](docs/lab_notes/README.md)；
完成後記錄接法、結果與尚未驗證事項，再同步版本。

`AGENTS.md`、`CLAUDE.md`、`PROJECT.md`及個人`ESP_Drone/`僅保留本機，
不會隨GitHub下載；換電腦時如需使用，另行複製本機文件。暫存輸出集中在
`_outputs/`並排除於Git。Wi-Fi密碼、API金鑰與其他機密不得提交。
