# Week 02：ESP32-S3、開發環境與安全接線

日期：2026-09-16

## 準備器材

ESP32-S3 N16R8 向下 44 腳、USB 資料線、麵包板、公對公杜邦線、按鈕與
萬用電表。本週不使用 LED、蜂鳴器、馬達或外部電池。取得方式以 Week 1
公布的正式材料清單為準；教師現有三套材料不能視為每組固定配發。

請依[Week 2 器材與必帶確認表](week02_purchase_list.md)完成數量確認及資料線
測試。確認表列的是本實驗依賴，不是另一份購買通知。

學生在 Week 1 課後已完成 Arduino IDE 與 ESP32 board package 安裝。Week 2
只做快速驗證；安裝失敗者進個別排錯區，不占用全班授課時間。

## 教材流程

全班依[Week2 教材](Week2教材.md)，循序完成環境
確認、程式上傳、Serial、GPIO、安全接線、量測、基礎修改及任選變化題。
完成所有驗收、由教師或助教簽核、斷電並收好器材後，可以先離開。

## 教材內容

- Arduino IDE、board、port、編譯、上傳與 Serial Monitor。
- GPIO、GND、3.3V、5V、輸入、輸出、上拉與共地。
- 麵包板、杜邦線、電阻、按鈕及萬用電表的基本操作。
- 上電前檢查：短路、極性、電壓、接腳與供電能力。

## 課堂實作

1. 快速確認預先安裝的環境與 USB 線，成功上傳並看到 Serial log。
2. 用萬用電表量測電壓及通斷。
3. 填 GPIO 接線表後，完成 GPIO4 按鈕輸入、GPIO5 測試輸出及 Serial log。

## 完成檢核

- [ ] 可獨立上傳程式並查看 Serial。
- [ ] 上電前檢查與 GPIO 接線表完成。
- [ ] 按鈕控制輸出連續測試五次。
- [ ] 能說明 5V 訊號直接進入 3.3V GPIO 的風險。

參考：[已購設備總表](equipment_index.md)｜[程式片段](../../docs/course_materials/starter_code_snippets.md)｜[安全檢核](../../docs/course_materials/rubrics_and_checklists.md)

## 發布前驗證狀態

截至 2026-08-23，[硬體狀態表](../../docs/hardware_state.md)中三塊指定板卡仍是
`unverified`。
本教材已依 Espressif 官方資料核對模組容量、GPIO4／GPIO5、USB-to-UART 與
GPIO35～37 限制，但尚未完成 Arduino compile、指定板卡 Upload／Serial、
麵包板安裝、按鈕接線及萬用電表 target test。完成實機紀錄前，本單元是
待驗證教材，不應標示為已通過實機測試的學生發布版。
