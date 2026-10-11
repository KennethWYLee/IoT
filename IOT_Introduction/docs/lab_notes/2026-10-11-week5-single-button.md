# Week5 單按鈕、倒數與自動夜燈修訂

日期：2026-10-11。教師要求本輪由 Codex 獨立完成，不呼叫 Claude。
範圍只含 Week5 教材、程式及指向該週的現行說明；不改日曆、評分、購物清單或其他週作品。
教師確認下一堂實際教 RGB，不依原訂日期推定已教到 Week6。

## 四題分工

| 題目 | 要完成的作品 | 按鈕的功能 | RGB 與 OLED |
|---|---|---|---|
| Q1 | 單按鈕變色燈 | 短按放開後開啟／換色；按住達 1 秒關閉 | SELECT 保留選色；LED 表示實際亮滅 |
| Q2 | OLED 30 秒倒數提醒 | 按下開始／取消，不分長短按 | OLED 倒數；30～11 秒綠、10～1 秒藍、0 秒紅 |
| Q3 | 可選色的自動小夜燈 | 起初兩次短按設定明暗；之後短按啟用／換色、長按停用 | 已啟用且判暗才亮所選色；AUTO、SELECT、LED 分開顯示 |
| Q4 | 環境巡檢與比較 | 初次兩次設定後，按下要求保存一筆新資料 | RGB 表示目前環境；OLED 區分即時值、剛保存資料及保存統計 |

Q1、Q3 長按後放開不得再觸發短按，關閉／停用保留選色。明亮時 Q3 換色只改 SELECT，不強制亮燈。
Q3 設定完成仍為 AUTO:OFF，第三次短按才啟用；長按不保存設定。
Q4 沿用既有光敏、DHT11、按鈕、OLED、RGB，維持較難的保存與比較，不加入 CSV、網路、新零件或新作業。
各元件的用途在 Main 說清楚，接線與實作在 Ans，完整程式保留獨立同名 Arduino 資料夾。

## 維護與舊檔

- Main：`docs/teaching_drafts/week5_redesign/week5_main.md`。
- Ans：`docs/teaching_drafts/week5_answers/week5Ans.md`。
- 程式生成器：`docs/teaching_drafts/week5_answers/generate_week5.cjs`。
- 現行四支程式：`desk_status`、`focus_countdown`、`night_light`、`environment_inspection`。Q1 保留既有檔名，以免破壞下載與公開清單。
- 配套程式：`week5_answers/programs`，入口 `START_HERE.md`；本機公開候選複本只更新 `program/week5` 的 Q1／Q2。
- 舊維護來源與 PDF、四支程式保存在忽略目錄 `docs/teaching_drafts/archives/week5_before_20261011/current`。其他歷史程式與舊 Notebook 保留，不當成現行教材。
- 正式週目錄 PDF 與 draft PDF 需逐位元組一致。答案維護來源、Q3／Q4 程式仍維持既有忽略範圍。

## 檢查紀錄

測試腳本位於私有 `week5_answers/checks/20261011/run.cjs`，結果在
`IoT/_outputs/week5_20261011/checks`。使用現有 Arduino／Wire／OLED／DHT 假輸入環境；
它驗證程式操作順序，不證明真實接點彈跳、電氣規格、OLED 控制器或感測器已實測。

- 原生 C++ 測試涵蓋未確認硬體設定、已確認設定、SSD1315 分支及開機時按住，共 14 組設定、472 個斷言通過。
- Q1／Q3：短按放開、999／1000 ms 邊界、長按放開不追加動作、保留選色、32 位計時回繞、開機按住、通訊失敗後操作。
- Q3：設定時長按不保存、同值重設、正反感測方向、等於分界、明亮時選色、暗處停用後不亮。
- Q2：30／11／10／1／0 秒、取消、按住一次、計時回繞。
- Q4：新讀值保存、失敗不存、未按下不改統計、長按不連存、20 筆上限、顯示通訊失敗後保留既存資料。
- 10 組 ESP32-S3 N16R8 編譯通過：四題各含保護預設與啟用設定，Q1／Q3 另驗 SSD1315 分支。安裝環境的 ESP32 core 為 3.3.12；課程既有 3.3.11 固定版本未修改，也不宣稱本輪已測該版本。沒有上傳韌體。
- Main 7 頁、Ans 13 頁；20 頁已逐頁檢查版面、字型、照片、接線表、頁碼、作答空間與 OLED 範例。最後改動的 Ans 第 3／4／7／13 頁重新檢視，其餘頁的渲染像素與先前檢查版本一致。
- `verify_artifacts.cjs` 核對生成器、四支維護程式、配套複本、公開候選 Q1／Q2、目標編譯檔與 PDF 雜湊。Q2／Q4 實作與備份逐字一致；Q1／Q3 更新。結果為 `IoT/_outputs/week5_20261011/verification.json`。
- 全課程結構、174 份文件與本機連結通過；`git diff --check` 通過，暫存區空白。HEAD 仍為 `d76bb1e70cc9ce2526b276ca51c06dd39f39ffcd`。不改動原有其他週程式與未提交使用者工作。

最終 PDF SHA-256：

| 檔案 | SHA-256 |
|---|---|
| week5_main.pdf | `7d89a7d2544c0563143780490fe7ec1fdb463070924ab21089cf56a2e2a46f90` |
| week5Ans.pdf | `54faac79a51d64c41f19d1464fdb81976a159e40c5179a4b9473853be441874a` |

編譯曾發現 Arduino 自動宣告把自訂回傳型別放在 enum 定義之前；已在 enum 後提供明確函式宣告並重跑。
版面初檢曾發現 Q1、Q2 溢出；以精簡重複說明及調整作答區修正，未縮小全篇字級。

U8g2 安裝作者已依[官方套件中繼資料](https://raw.githubusercontent.com/olikraus/U8g2_Arduino/master/library.properties)核對為 oliver。
按鈕接點去彈跳概念參考 [Arduino 官方 Debounce 範例](https://docs.arduino.cc/built-in-examples/digital/Debounce/)；本版採既有 40 ms 穩定讀取，長短按規則是本次教師指定的作品需求。

## 未做的操作

沒有呼叫 Claude、其他模型或子代理；沒有操作板子、上傳韌體或實體測試。
改稿完成當時沒有 commit、push、GitHub 更新、Drive 更新或權限變更。後續教師另行授權同步，見[發布紀錄](2026-10-11-week5-publication.md)；本段保留改稿與發布的區別。
下一步先以空麵包板和新版 Ans 實做 Q1，核對 RGB 電氣條件、OLED 控制器、短按換色及長按關閉；再依序做 Q2～Q4。
