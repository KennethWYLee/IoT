# Week 02：ESP32-S3、開發環境與安全接線

日期：2026-09-16

## 準備器材

ESP32-S3 N16R8 向下 44 腳、USB 資料線、麵包板、公對公杜邦線、按鈕、
220Ω／330Ω 電阻、LED 或蜂鳴器、萬用電表。

學生在 Week 1 課後已完成 Arduino IDE 與 ESP32 board package 安裝。Week 2
只做快速驗證；安裝失敗者進個別排錯區，不占用全班授課時間。

## 時間安排

| 時間 | 內容 |
|---:|---|
| 0–90 分鐘 | ESP32、上傳流程、Serial、GPIO、電源安全、麵包板與萬用電表教學示範 |
| 90–165 分鐘 | 分組實作、個別說明、教師驗收與收納 |

完成所有驗收、由教師或助教簽核、斷電並收好器材後，可以先離開。詳細流程
見[90 分鐘教師講稿與實作驗收](week02_90min_teaching_script.md)。

## 教材內容

- Arduino IDE、board、port、編譯、上傳與 Serial Monitor。
- GPIO、GND、3.3V、5V、輸入、輸出、上拉與共地。
- 麵包板、杜邦線、電阻、按鈕及萬用電表的基本操作。
- 上電前檢查：短路、極性、電壓、接腳與供電能力。

## 課堂實作

1. 快速確認預先安裝的環境與 USB 線，成功上傳並看到 Serial log。
2. 用萬用電表量測電壓及通斷。
3. 填 GPIO 接線表後，完成按鈕控制燈光或聲音。

## 完成檢核

- [ ] 可獨立上傳程式並查看 Serial。
- [ ] 上電前檢查與 GPIO 接線表完成。
- [ ] 按鈕控制輸出連續測試五次。
- [ ] 每位組員完成一題個別口頭驗收。
- [ ] 能說明 5V 訊號直接進入 3.3V GPIO 的風險。

參考：[已購設備總表](equipment_index.md)｜[程式片段](../../docs/course_materials/starter_code_snippets.md)｜[安全檢核](../../docs/course_materials/rubrics_and_checklists.md)
