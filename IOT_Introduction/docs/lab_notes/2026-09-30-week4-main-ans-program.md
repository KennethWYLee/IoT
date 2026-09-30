# Week4：依 Week3 整理 Main、Ans 與 program

後續發布：教師新增 Week2、Week5 修訂及 commit、push、雲端同步授權。本檔所述 Week4 成果已併入該次發布；Main、Ans、program 均回讀核對相同。見[三週發布紀錄](2026-09-30-week245-main-ans-program-publication.md)。下方「未發布」描述本檔初次完成時的狀態。

日期：2026-09-30。教師要求先整理 Week3 的教學方式，再重寫 Week4，未授權本輪發布。

## 先確認可沿用的做法

沿用的是交付分工與閱讀順序，不是光敏／OLED 題材。Main 是自足的題目卷，先說作品、特色、預期結果、驗證，再留作答處；Ans 先依原卷填答，所有題目結束才按題序教操作、結果與原理；完整程式從同名資料夾開啟，不逐頁列印。

已寫入 `docs/teaching_drafts/week2_redesign/revision_guidelines.md` 的首節，保留既有沿革。適用範圍、題目去重、第一次解釋概念、物件標字、反例、安全、程式同步與發布界線一併列明。未自動修改其他週。

## 修改範圍

| 項目 | 本輪內容 |
|---|---|
| Week4 Main | 12 頁；Q1 後加四作品關係說明；明確說出電表插孔、筆尖、DHT 各腳與供電電流方向；不加入解法或 GPIO 配置 |
| Week4 Ans | 64 頁；前 12 頁依原卷格式填答，p13 起依 Q1～Q7 詳解；實測不填假答案；移除重複作答表與重複詳解 |
| 完整程式 | 原四支 canonical `.ino` 行為不改；以題目名稱標示用途，副本重新核對，附 `START_HERE.md` |
| 設定與排錯 | 集中列出待確認設定與啟動訊息，區分 blocked、ready、真正讀取成功；不擅自解除硬體保護 |
| 維護 | 更新 README、review、逐頁驗證及私有答案檢查；Main 與 Ans 前段逐行核對題幹及條件 |

頁數不是縮短或擴充內容的目標。Ans 新增原卷填答頁、程式啟動說明，同時移除三頁重複概述／詳解；基本教學、既有四作品及必要安全內容保留。

## 修改前後例子

- 「黑筆線插 COM，紅筆線插 Ω」改成明說表筆插頭要插入電表哪個孔，接觸導線則稱金屬筆尖。
- 進入 A 前沒有四作品總覽，改成先比較四個作品分別增加什麼要求，再逐一出題。
- Ans 一開始是索引與零散答案，改成完整原卷填答，全部題目結束後才是索引與逐題教學。
- 「完整函式見某頁」改成真正的 `.ino` 與函式位置；該頁只負責說明操作，不假稱含完整程式。
- 已在 Main 驗證的事件數不再要求另填一張相同表格；精確毫秒邊界繼續用程式或題目資料核對。

## 逐題檢查

Q1 檢查實際阻值與量程／接點判讀；Q2 實測溫濕度；Q3 依已給順序判讀；Q4 區分供電與資料傳遞；Q5 說明避免重複計次；Q6 檢查不同取得時刻；Q7 檢查成功與跳過的紀錄是否完整。各有不同主要目的，未增加新題、取樣筆數、零件、OLED、功能、評分或週次變更。

Main 自足是指題意、條件與完成標準完整，不代表硬體尚未確認也可實作。作品 A～D 的實物完成仍受下列硬體條件限制。

## 本輪驗證

- Node／marked／Playwright／Edge 重建 Main 12 頁、Ans 64 頁，版面 DOM 檢查通過，最小頁尾間距 50.94 CSS px。
- `week4_redesign/verify.py --render` 及 `--answers --render` 通過：來源／PDF 雜湊、頁碼引用、圖片、文字邊界、完整程式未嵌入、程式副本與檔名。
- Poppler 渲染全部 76 頁，檢視全冊縮圖；另放大核對原卷填答、程式設定、電流箭頭及程式檔名引用。修正電流箭頭位置後重建並再次檢視受影響頁。
- 私有 `check_exam_answers.py` 獨立驗算量程單位、品質判讀、時間差及七次收錄結果，並核對 Main 全部頁序、題幹、條件與 Ans 前段相同；詳解依題序排列。
- `package_answer_programs.cjs 4 --check`／`verify_answer_programs.py 4` 通過；四份完整程式與一份開檔說明共五個交付檔，與維護來源 byte-identical。
- `git diff --check` 通過。Ans、完整程式與其來源／測試保留既有 Git 忽略。
- 主機 C++ runner 已嘗試，但本機沒有 MSVC 工具，未執行；既有 `tmp/host_results.json` 是先前結果，不作本輪通過證據。未重新進行 ESP32 目標編譯，也未接線、上傳韌體或實物測試。
- PDF 檢查使用既有 `_outputs/review_dependencies` 的 PyMuPDF／Pillow，缺少的 beautifulsoup4 安裝在同一忽略目錄，不改全域 Python 或課程執行環境。

### 本輪 PDF SHA-256

```text
Main  7d3d5819cd9f94582deca7a5bb7d8eb83edf201f43bcc75427694d3069bb7c60
Ans   779e098dd6c07670acbf1b3053e138631238e88f625e1749239e1d2c79d4beb1
```

## 技術來源與限制

核對既有硬體紀錄、參考程式，以及 [Adafruit DHT 接線說明](https://learn.adafruit.com/dht/connecting-to-a-dhtxx-sensor)、[DHT 程式庫 1.4.7 原始碼](https://github.com/adafruit/DHT-sensor-library/blob/1.4.7/DHT.cpp)、[香港天文台相對濕度說明](https://www.weather.gov.hk/en/education/meteorological-instruments/automatic-weather-stations/00714-Lets-talk-about-relative-humidity.html)。裸 DHT 元件的通用接法不能證明本批三線模組的腳序或 ESP32 的電壓相容性。

優先下一步仍是確認本批 DHT 的腳序、3.3 V 供電與 DATA 電壓、可用 GPIO，取得可追溯的接線與實際輸出。這是 A～D 共用的新硬體；確認後才能填入程式設定並判斷實作是否可進行。蜂鳴器的電流、上電及停止另待確認，未確認保留無聲版。

## 本機與發布界線

本輪未 commit、push 或上傳雲端。GitHub 與雲端日後分別依教師當次授權處理。未更動既有 Week4 dual sketch 的工作區差異與未追蹤資料庫；過程中出現的 Week3 正式教材／同步工具／備份變動不屬本輪，保留不動。

較早同一對話已依教師指示將雲端 `codex/課堂教材/IoT/program` 的 Week3 程式同步到本機，九份副本校驗通過；本輪不將 Week4 程式上傳，也不覆蓋那批 Week3 新版程式。
