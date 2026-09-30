# Week3 程式以 .ino 公開到 GitHub

## 授權與位置

教師在 Week3 Ans 公開後，要求 Week3 code 也上傳，建立統一 `program` 資料夾，
直接放 `.ino` 而非 ZIP，未來所有週次程式沿用此入口。

- 本次公開 `program/week3/` 的 9 支程式，每支保留 Arduino 要求的同名資料夾。
- 程式、Main、Ans 的入口集中於 `program/README.md` 及課程 README。
- 其他週程式、其他週 Ans、答案 Markdown、私有測試、資料庫與 Week1 草稿不加入此次提交。
- 不建立 ZIP，不修改既有雲端檔案；本次處理的是前一輪 GitHub 發布的延續。

## 來源與內容

沿用本機 `week3_answers/programs.sources.json` 指定的九份維護來源，
沒有從較早 ZIP 覆蓋教師修改，也沒有變更程式邏輯或安全旗標。
只將公開副本的換行統一為 LF；每份來源、目的地與 SHA-256 記於
`program/week3/manifest.json`。

`light_snapshot` 保留教師目前的設定：光敏 4、按鈕 5、SDA 8、SCL 9、
啟動時偵測 0x3C／0x3D 的單一回應、OLED 預設控制器 1306。
`week05_i2c_check` 保留 SDA 8／SCL 9 與已啟用旗標。其他程式保留尚待填寫的
接腳、量測範圍或確認旗標。學生說明明列此差別，沒有把下載或編譯當成接線通過。

Ans 所列 `programs/程式名/程式名.ino` 對應公開的
`program/week3/程式名/程式名.ino`；原 PDF 無變更。
新下載說明另指出 D 會偵測位址，而 C 仍需手動設定，避免套用舊的統一設定說明。

## 驗證與發布界線

發布前核對九份內容、同名資料夾、引用與私有檔案界線，並檢查程式內未含
實際憑證或個資。以 `sync_public_programs.cjs 3 --check` 核對所有公開副本與來源。
此次只重新整理及發布，沒有重新編譯、上傳韌體、操作裝置或聲稱新的實機測試。

提交只包含 program、同步工具、使用說明及本紀錄；Git push 後比對遠端 commit，
再從公開網址逐檔下載九支 `.ino`，核對 LF 正規化後的 SHA-256。
完成結果記在本機忽略追蹤的 `_outputs/week3-program-github-20260930/`。

## 後續維護

先修改既有維護來源，再執行：

```powershell
node IOT_Introduction/scripts/sync_public_programs.cjs 3
node IOT_Introduction/scripts/sync_public_programs.cjs 3 --check
```

工具會保護已被另行修改的公開副本，不會自動提交或上傳。其他週次需獲授權後，
才加入可公開週次清單，避免把整批未開放答案一併發布。
