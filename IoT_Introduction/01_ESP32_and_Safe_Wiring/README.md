# 01：ESP32-S3 與安全接線

## 對應週次

Week 2，並作為後續所有硬體實作的共同基礎。

## 教材內容

- ESP32-S3 DevKitC-1、USB 資料線、Arduino IDE、board／port、編譯與上傳。
- Serial Monitor、程式版本與最小可診斷 log。
- GPIO、GND、3.3V、5V、輸入、輸出、上拉與共地。
- 麵包板、杜邦線、電阻、按鈕、萬用電表的基本使用。
- 上電前檢查：短路、極性、電壓、電流能力、接腳用途。

## 實作順序

1. 確認 USB 線可傳資料，成功上傳並取得 Serial log。
2. 用萬用電表量測電壓與通斷。
3. 填寫 GPIO 接線表後，完成按鈕控制 LED 或蜂鳴器。
4. 測試按鈕未按、按下、彈跳與接線鬆脫。

## 安全底線

- 此批 ESP32-S3 是 **N16R8、排針向下、44 腳**；接線仍須以板身絲印與可靠 pinout 核對。
- 不把 5V 訊號直接送入 3.3V GPIO。
- 未確認供電及共地前，不接舵機、馬達或其他高耗電負載。

## 完成檢核

- [ ] 可獨立選板、選 port、上傳與查看 Serial。
- [ ] 有上電前檢查表與 GPIO 接線表。
- [ ] 按鈕輸入及一項輸出可穩定重複。

參考：[全部設備六類索引](equipment_index.md)｜[程式片段](../../docs/course_materials/starter_code_snippets.md)｜[安全檢核](../../docs/course_materials/rubrics_and_checklists.md)
