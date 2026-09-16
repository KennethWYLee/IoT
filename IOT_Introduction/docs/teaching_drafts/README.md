# Week 2–5 主教材重設稿入口

2026-09-16：教師採用「全班一起操作，看到結果後再解釋原理」，並要求依 Week 2 重設 Week 3、4、5。下列為目前重設稿，**尚未取代各週正式目錄的 notebook／PDF**；另一台電腦請從這裡開啟，不把舊出口誤認成新版。

| 週次 | 閱讀 PDF | 維護及檢查 |
|---|---|---|
| Week 2 | [從頭操作與雙按鈕計數器](week2_redesign/Week2_main_layout_sample.pdf) | [README](week2_redesign/README.md) |
| Week 3 | [電表、光敏與 ADC](week3_redesign/week3_main.pdf) | [README](week3_redesign/README.md)、[檢查紀錄](week3_redesign/review.md) |
| Week 4 | [環境紀錄、失敗與遮光提醒](week4_redesign/week4_main.pdf) | [README](week4_redesign/README.md)、[檢查紀錄](week4_redesign/review.md) |
| Week 5 | [RGB、OLED 與倒數](week5_redesign/week5_main.pdf) | [README](week5_redesign/README.md)、[檢查紀錄](week5_redesign/review.md) |

## 使用及跨電腦交接

- 先 `git pull --ff-only` 取得已推送提交；本地有變更或歷史分歧時先比較，不重設丟棄。
- PDF 是閱讀成品；Markdown／builder 是維護來源，程式從既有 `.ino` 自動嵌入。不要直接修改 PDF。
- 讀取[硬體狀態](../hardware/hardware_state.md)再碰實物。Git 同步不代表元件接法、供電、GPIO 與實測進度自動同步。
- 教材內的假資料、示意圖、主機替代 I/O 測試都不是實物已通過。課前待確認項目見各週 review。
- 練習後緊接解答，適合共讀與形成性練習，不是隱藏答案的考卷。私有 QA、runtime 資料庫、暫存渲染與編譯產物不納入這次發布。
- Week 3／4 review 內「當時未 commit／push」描述撰寫當下。本次教師已授權把 Week 3–5 重設稿一併提交與推送；不表示正式出口已切換或已完成硬體驗證。
