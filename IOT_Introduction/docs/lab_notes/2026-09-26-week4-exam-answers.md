# Week4：改為考卷與完整解答

日期：2026-09-26。依教師「根據 Week3 做法改寫 Week4」執行；本輪只修改 Week4 及其入口、修訂準則，不 commit、push 或更新雲端。

## 成品與維護來源

- `docs/teaching_drafts/week4_redesign/week4_main.md`／PDF：11 頁純考卷。
- 本機 `docs/teaching_drafts/week4_answers/week4Ans.md`／PDF：72 頁完整教學與答案，受 Git 忽略規則保護。
- `week4_redesign/build.cjs`：同一風格、A4 分頁、題目用圖、作答區、完整程式自動嵌入及頁碼。
- `week4_redesign/verify.py`：Main／Ans 結構、題目需求、自足條件、程式完整性與共用輸出驗證。紙上解答檢查在本機 Ans 的 `check_exam_answers.py`，不把標準答案加入公開檢查器。
- 四份 canonical 程式本輪未修改；原有雙感測器 `.ino` 工作樹換行差異與根目錄未追蹤 `examples/` 保留，未清除或提交。

這是課堂形成性實作考卷，可查資料或使用 AI，不增加正式筆試、配分、繳交規定、零件或週次。原有量電阻、DHT、雙感測器、蜂鳴提示、按鈕基本紀錄及延伸收錄都保留；沒有增加 OLED。

## 題目與教學對應

| Main 位置 | 要觀察或回答的事 | Ans 對應 |
|---|---|---|
| p1／Q1 | 兩顆電阻實測、量程顯示與同列繞路 | p2，操作 p8～10 |
| p2／A、Q2 | DHT 真實讀值；真實、模擬失敗與恢復展示 | p3，操作 p11～24 |
| p3／Q3 | 五個獨立情境按完整給定規則判斷 | p25、62 |
| p4／Q4 | 供電與資訊分開畫；DATA 中斷的影響 | p4、22～23 |
| p5～6／B、Q5 | 穩定遮光、持續遮住不連加、獨立失敗與靜音；自己的計次狀態 | p26～46、63 |
| p7～8／C、Q6 | 按鈕記錄；同一行兩個來源時刻、錯改時刻的後果 | p47～54、64 |
| p9～11／D、Q7 | 有效性、資料時間、光線端點、第一個失敗原因、成功與跳過 | p55～58、65～71 |

Main 紙上題完整提供初始條件、數據、順序及符號含義，不需先讀 Ans 才知道題意。需要自己程式或實測的題目明確要求先完成作品，不把「題意可理解」誤稱為「初學者不需學習即可解題」。硬體規格與接法仍須課前確認；不能只靠考卷文字替代實物確認。

## 代表性修改

- 原 Main「只改開頭三個設定」與接線表：移到 Ans。Main 先說「溫濕度紀錄器」及可觀察的正常、失敗、恢復行為。
- 原「依上一頁規則填 valid、quality」：Main Q3 把必要規則、前值、間隔放在同頁，回答中文狀態與理由；Ans 對照原程式英文欄位。
- 原多處填寫事件數、保留紀錄表：Main 用一次實作展示核對，Q5 只問自己的程式如何避免持續遮住連加。
- 原時間／欄位解說：Main Q6 給具體兩個時刻，再只修改一個時刻考因果；計算結果不出現在 Main 其他頁。
- 精確毫秒邊界不要求用手重現；手按作品由程式紀錄核對，邊界另用給定數據或模擬。沒有影片位置、教師勾選或提早離開行政流程。
- 保留正常情境後的反例；斷電、未知模組、停止聲音及不拔帶電線的安全條件沒有刪除。

## 已完成的檢查

1. Main／Ans 均建置成功。頁數 11／72；來源、builder、PDF、照片及 canonical 程式 SHA-256 逐一核對。
2. 所有頁碼與內部連結有效；四份完整程式在 Ans 中逐字符合維護來源，Main 沒有完整程式、答案頁、私有解答連結或設定表。
3. 獨立 Python 紙上檢查核對 Q3 順序／邊界、電阻換算、Q6 時間差與 D 七次結果；另核對原基本教學順序未被重排。它與 C++ 主機測試使用不同實作，但共享題目規則，並非外部獨立審查。
4. `verify_week4_host.py`：96 assertions 通過；`--tone`：102 assertions 通過。包括 canonical DHT、光敏、穩定事件、獨立故障、靜音、聲音計時與未確認設定保護。編譯有既有 C4127 常數條件警告，沒有失敗。
5. `integration_checks/run.py --week 4`：基本按鈕紀錄的 blocked 6／base 17 checks 通過。
6. 本機 `week4_answers/run_checks.py`：延伸答案 blocked 2／active 37 checks 通過。以上都用 fake I/O，未連硬體。
7. Poppler 渲染全部 83 頁；逐頁縮圖檢查並放大新題目、表格、示意圖與程式頁。瀏覽器版面檢查與 PDF 文字邊界檢查通過，未見裁切、重疊、缺字或未展開標記。

本輪核對 [Adafruit DHT 1.4.7 原始碼](https://raw.githubusercontent.com/adafruit/DHT-sensor-library/1.4.7/DHT.cpp) 的最小間隔、NaN、請求與回覆，以及 [香港天文台相對濕度說明](https://www.weather.gov.hk/en/education/meteorological-instruments/automatic-weather-stations/00714-Lets-talk-about-relative-humidity.html)。Fluke 手冊線上工具本次未成功取回，未把此次請求寫成新增來源驗證；原已核對的斷電量阻原則保留，不用別型手冊推定 A830L 檔位。

詳細建置／渲染結果保存在兩目錄的 `build_manifest.json`、`tmp/layout_check.json`、`tmp/verification.json` 與按 PDF 雜湊區分的 `tmp/render/`。實測數字沒有由示例填入。

## 限制與下一步

沒有上傳韌體、接線、通電、發聲或新增實機證據；本輪沒有重跑 Arduino 目標編譯，因為四份韌體沒有修改。主機測試不驗證電流、讀取精度、實際延遲或 reset 瞬間。

優先下一步仍是確認本批 DHT11 的三針腳序、3.3 V 供電／DATA 電位與指定 GPIO，完成一輪真實讀取及保存紀錄後，才能作為全班的實機接法。蜂鳴器電流、上電與停止行為亦未確認，先維持無聲版；不把先前 T01 單次有聲觀察擴成全班可用。這些缺口沒有因重新排教材而消失。
