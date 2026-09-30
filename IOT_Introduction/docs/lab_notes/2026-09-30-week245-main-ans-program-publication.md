# Week2、Week4、Week5 修訂與發布

日期：2026-09-30。教師要求先整理 Week3 的 Main／Ans／program 做法，再改寫 Week4，並延伸到 Week2、Week5；本次授權 commit、push 及雲端更新。

## 現行檔案

| 週次 | Main | Ans | program |
|---|---:|---:|---|
| Week2 | 6 頁 | 44 頁，前 6 頁原卷填答 | 4 支 .ino 與中文使用說明 |
| Week4 | 12 頁 | 64 頁，前 12 頁原卷填答 | 4 支 .ino 與中文使用說明 |
| Week5 | 8 頁 | 54 頁，前 8 頁原卷填答 | 4 支 .ino 與中文使用說明 |

公開閱讀入口仍由課程 README 指向 Week2 正式週目錄、Week4/5 redesign PDF。Ans 的後段依題序先操作、看結果，再說明原理。所有完整程式由同名資料夾開啟，不從 PDF 拼接。

共同原則記於 [教材修訂準則](../teaching_drafts/week2_redesign/revision_guidelines.md)。不增加器材、功能、作業量、評分或週次安排。Week3 教師已修改的程式保留，不覆蓋。

## 主要修改

- Week2 Main 增加題目與三個作品的關係，保留 Q1～Q5；Ans 直接由同一份 Main 產生前段，再填入參考回答。移除後段重複題頁，重新換算教學交叉頁碼。
- Week2 電表說明從「紅筆插 VΩmA、10A 不用」改為表筆的插頭插哪一個電表插孔；電流反例仍只紙上討論。刪除教學中重複抄錄的自測欄位。
- Week4 本輪細節見 [Week4 修訂紀錄](2026-09-30-week4-main-ans-program.md)。本次一併發布該輪尚未提交的變更。
- Week5 Main 先交代 A/B/C 的差別：電腦命令倒數、按鈕中止後重新開始、暫停後續跑；Q1～Q7 與要求不增加。
- Week5 Ans 先依 Main 填答，再依題序教學；把重複六題與重複解答併入對應原理頁。測量欄位依實測，不填假讀值。
- OLED 接線先說實物印 SCK，再解釋程式 PIN_SCL 指向同一時脈接線；不要求學生找不存在的 SCL 印字。修正顯示示意圖受 SVG 全域樣式影響而文字太暗的問題。
- Week5 C 指定開啟 pause_timer 檔案，明確列出設定尚未填寫會阻擋啟動；不以「上傳成功」代替接線或畫面驗證。
- 三週程式包新增 START_HERE.md，列出題目、檔案、設定及啟動結果。未改動 .ino 的功能與安全旗標。

## 驗證

- Week2 Main/Ans 同源題文與填答位置、電壓比較說明、獨立電路計算、交叉頁次及程式引用通過。
- Week4 再跑來源、圖片、頁碼、題文順序、獨立答案及程式包檢查，全部通過；本次未再改 PDF。
- Week5 逐行比較前段 Main 與 Ans 題文，核對詳細教學順序，獨立重算倒數與暫停範例，通過。
- 兩週共 112 頁重新以 Poppler 渲染；檢查全部縮圖及填答、電表、OLED 顯示等放大頁。修正 OLED 對比後重新建置與渲染。
- DOM 檢查頁面越界、Week2 填答區裁切、圖片載入；PDF 檢查文字邊界與缺字；程式包檢查來源雜湊、同名資料夾與文件引用。
- 各 ZIP 解開內容逐檔比對本機，均相同；每包只含 4 支 .ino、START_HERE、README、manifest。
- 沒有上傳韌體、接電或移動實體線路。本機缺少 MSVC C++ 工具，未聲稱本輪主機測試或 Arduino 目標編譯通過；舊測試記錄不是本輪的新結果。
- 技術核對來源：[Espressif GPIO](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/gpio.html)、[U8g2 API](https://github.com/olikraus/u8g2/wiki/u8g2reference)、[Arduino 時間差示例](https://docs.arduino.cc/built-in-examples/digital/BlinkWithoutDelay/)。

## 雲端

六份 PDF 已原地更新，保留原 ID、資料夾與分享權限。三個 ZIP 新增於既有 `codex/課堂教材/IoT/program`，不動該資料夾中 Week3 的九支程式。九檔均用 Drive 重新取回原始檔、下載並核對 SHA-256，與本機完全相同。

| 週次與檔案 | SHA-256 |
|---|---|
| Week2 Main | `a2e0876b1ff6129e89d35c5708c1b3f1a52af81cdec0b2a711ccefd6d4395817` |
| Week2 Ans | `f2e77188a6658692467ae3a0c397eaf95809137c5a663480841b7b3d6096e1ee` |
| Week2 program | `8769cbe39bcce32f8803f157489c8347aae3ece08d7844ff5d3b85a1cbe88d1b` |
| Week4 Main | `7d3d5819cd9f94582deca7a5bb7d8eb83edf201f43bcc75427694d3069bb7c60` |
| Week4 Ans | `779e098dd6c07670acbf1b3053e138631238e88f625e1749239e1d2c79d4beb1` |
| Week4 program | `19e9569fe8077587a4e6848a60bd556af6ba6eef58ac8004c170dd446ccff882` |
| Week5 Main | `39792fcbc1764614259311dcc735216dc9ab36192572f26168b56297ca4cd845` |
| Week5 Ans | `88a05ee182cc5a3fa22185ead1eca1a1cad3aee2e6c73c2e56da2d2e150b99f1` |
| Week5 program | `9e23ba9fa0cec233af6ed4e1ca6fbad8ea0afe808107ce3fe2df6f8f916fe03f` |

本機詳細雲端檔案 ID、大小、時間與回讀結果在忽略追蹤的 `_outputs/week245-publication-20260930/verified_cloud.json`；不將有時效的下載網址加入 repository。

## Git 與限制

GitHub 已確認 Public。只提交三週 Main、必要維護來源、檢查與紀錄；Ans、答案程式、雲端 ZIP、暫存檔及 runtime 資料庫不加入 Git。Week4 既有 .ino 的未提交換行差異及根目錄 examples/ 無關資料保留，不代替使用者提交。

提交前已 fetch，main 與 origin/main 相同。最後的 commit/push 結果與遠端 HEAD 另在完成回報確認，避免此提交自我引用 SHA。

優先下一步仍是本組器材安全核對後的實作驗收，尤其 Week4 DHT/蜂鳴器與 Week5 RGB/OLED 電氣條件；文件、模擬與排版通過不等於硬體已通過。
