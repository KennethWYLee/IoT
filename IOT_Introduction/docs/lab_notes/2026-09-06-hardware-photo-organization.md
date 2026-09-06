# 零件照片命名與主教材器材圖集整理

## 範圍與維護來源

本次依教師要求，先保留 Week 1 指定文字刪除結果，再整理零件照片與主教材開頭。
不新增採購種類、不改數量或 NT$724 歷史零件小計，不更動實驗程式、GPIO、安全限制、
評量與其他週主題。完成後只 commit，不 push。

- Week 1：在採購區展示共同材料，保留課綱、採購表、預算與 Week 2 課前準備；不重新加入已刪除表單、責任章節與課程理解活動。
- Week 2～7：主 Notebook 開頭加入當週器材外觀、角度與必要限制。
- Week 11、12、14、15：依實際主教材使用的按鈕／RGB／光敏組合加入圖集，並非依舊資料夾名稱推斷。
- 考試、報告、空白週及 Drone 未加入固定器材要求，維持原內容。
- 每週仍只有一份主教材；[照片資料](../images/hardware/photo_catalog.json)為共用維護來源，[照片索引](../images/hardware/item_gallery.md)不是新增必讀教材。

## 圖片保存與辨識

原有 34 張 actual 圖片全部按品項流水號重新命名，另將 3 張杜邦線商品參考卡改成
一致命名，共 37 次重新命名；逐一與修改前 Git 版本比對位元組，全部一致。
另收錄已提供的 `175584_0.jpg`、`175586_0.jpg`、`175589_0.jpg`，分別為燈條背面、
燈條正面及 PIR 側面補充角度。來源照片仍留在原上傳位置。

目前共用清單有 37 張實物／既有實物後製展示圖、3 張商品參考卡、1 張 OLED 所在訂單圖，
合計 41 個來源。SHA-256、舊檔名、已知原始上傳名與角度保存在照片資料中。
`175588_1.jpg`與已保存的PIR元件面內容完全相同，只記錄重複來源名稱，不再複製一張。
相同照片不在每週資料夾複製；模糊角度及歷史接線照保留，但不當作新接線答案。

OLED 並非完全沒有圖片：原始蝦皮訂單圖 2 倒數第三列有商品照片，選項「4 針、0.96 吋」。
本次先保留完整原始訂單圖並明示 OLED 所在列，不重畫商品、不補造控制器或腳位。
商品圖片、到貨近照、已購紀錄及實機驗證分開，不由圖片宣稱 SSD1306、解析度或通訊已驗證。

## 呈現與檔案大小

初稿將全尺寸照片全部嵌入，Notebook 達約 12～16 MiB；因此改為新增圖集使用
標準 Markdown 的相對圖片路徑，既有教學圖解與操作照片附件保持不變。
完成後 Week 2～7 約 0.65～4.24 MiB。離線閱讀須下載完整 repository，不能只下載 Notebook。

GitHub [官方說明](https://docs.github.com/en/repositories/working-with-files/using-files/working-with-non-code-files)
將 Notebook 呈現為靜態 HTML；[repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
亦提醒複雜檔案預覽可能逾時。本次檢查的是本機標準 Markdown、實際相對路徑請求及瀏覽器呈現，
沒有 push，因此沒有宣稱新的 GitHub 線上版本已驗證。

## 已執行檢查

| 層次 | 方法與結果 |
|---|---|
| 原圖保存 | 37 個重新命名檔與 Git 修改前版本逐一比較，位元組完全一致；新角度另記錄 SHA-256 |
| 同步檢查 | `hardware_galleries.cjs --check`、`verify_hardware_galleries.cjs`：11 週圖集、41 個照片來源、相對連結與大小預算通過 |
| Notebook／文件 | Week 2、3、4、5、6、7 專用檢查通過；完整程式與 canonical sketch 一致，未增加執行結果 |
| 生成一致 | Week 2／3 圖解、Week 3 分類、Week 4 及 Week 5～7 builder 的 `--check` 全部通過 |
| 課程導覽 | 全課程 86 份 Markdown／Notebook 相對連結、18 週單一入口與 Week 1 預算檢查通過 |
| 本機呈現 | Week 1 及 Week 2～7 完整預覽通過；11 週圖集以本機 HTTP 實際載入相對圖片，1200／420 px 無整頁橫向溢出；Week 2 完整預覽為1280／420 px |
| 人工圖片檢閱 | 檢視 41 個來源的瀏覽器圖版，以及 ESP32 正反面、電表原圖、器材與手機寬度預覽；未依模糊標示補造規格 |
| 教學內容保留 | Week 2／3 原有 cells、附件與程式在移除新增圖集後一致；Week 11／12／14／15 原文除新增圖集外一致；examples、原有接線圖與 Drone 無變更 |
| Git 差異 | 已檢閱變更；`git diff --check` 與 `git diff --cached --check` 通過，私人設定文件未納入提交 |
| 計算／model | 既有 Week 2 去抖 JavaScript model、Week 3／4 紙上計算與麵包板節點 assertions 通過；不是新韌體或實體測試 |
| 編譯／host／實機 | 未重新編譯、未執行新的 firmware host test、未 Upload、未操作 COM 埠或實體線路；本次未改韌體 |

尚待：OLED 到貨正反面近照、各未核准模組的實機 profile，以及日後 push 後的 GitHub
線上顯示複核。這些狀態不因照片整理而提升為已驗證。
