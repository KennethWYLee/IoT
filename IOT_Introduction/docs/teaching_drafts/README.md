# Week 2–7 主教材重設稿入口

2026-09-16：教師採用「全班一起操作，看到結果後再解釋原理」，並要求依 Week 2 重設 Week 3、4、5。下列為目前重設稿，**尚未取代各週正式目錄的 notebook／PDF**；另一台電腦請從這裡開啟，不把舊出口誤認成新版。

| 週次 | 閱讀 PDF | 維護及檢查 |
|---|---|---|
| Week 2 | [從頭操作與雙按鈕計數器](week2_redesign/Week2_main_layout_sample.pdf) | [README](week2_redesign/README.md) |
| Week 3 | [電表、光敏與 ADC](week3_redesign/week3_main.pdf) | [README](week3_redesign/README.md)、[檢查紀錄](week3_redesign/review.md) |
| Week 4 | [環境紀錄、失敗與遮光提醒](week4_redesign/week4_main.pdf) | [README](week4_redesign/README.md)、[檢查紀錄](week4_redesign/review.md) |
| Week 5 | [RGB、OLED 與倒數](week5_redesign/week5_main.pdf) | [README](week5_redesign/README.md)、[檢查紀錄](week5_redesign/review.md) |
| Week 6 | [舵機紙指針與加減計數](week6_redesign/week6_main.pdf) | [README](week6_redesign/README.md)、[檢查紀錄](week6_redesign/review.md) |
| Week 7 | [紅綠燈遮光挑戰整合](week7_redesign/week7_main.pdf) | [README](week7_redesign/README.md)、[檢查紀錄](week7_redesign/review.md) |

2026-09-17：依教師要求接續完成 Week 6 重設稿，保留現行「SG90 紙指針」主題。網路通訊在現行第 11 週，不套用早期第 6 週通訊規劃。教師已授權提交及推送本輪進度；正式出口仍未替換，舵機供電與上電順序的實機驗證仍未完成。

同日接續 Week 7：先做雙按鈕、KY、RGB、OLED 的低功率遊戲，再加入已確認的舵機／蜂鳴器；延伸只修改紅綠燈切換時間，附同事件序列主機測試與改造解答。實際提交與推送狀態以 Git 歷史為準，不表示硬體整合已通過。

## 2026-09-17 逐頁檢查後的狀態

已檢查六份 PDF 共 288 頁，包含程式附錄。[檢查報告](../lab_notes/2026-09-17-week2-7-page-review/report.md)及[每頁紀錄](../lab_notes/2026-09-17-week2-7-page-review/page_review.md)列出尚未修正的操作缺口。

目前不能把編譯、來源雜湊及排版通過當成學生能完整跟做。Week 6 p21 漏列 OLED 供電引線，Week 5 p38 收尾命令不適用於按鈕版，Week 7 跨頁教學與 30 秒遊戲及模式切換仍需修正。這次提交保存的是草稿與發現的問題，不是修正完成版。

教師同意之後可替換原位置，舊版可另行保存。本次先保留正式週目錄不動；修正完成後再替換並同步處理舊 notebook、PDF、來源與匯出工具，避免兩份不同教材同名。跨電腦接續時，第一步是修報告列出的操作缺口，不是重新做完所有已成功的硬體測試。

## 使用及跨電腦交接

教師最新決定：每週可加入前一週或更早已教過的零件，設計更多變化；不必只使用當週新零件。Week 3–5 已各增加一個跨週整合範例、完整程式與動手改造題，題目下一頁即解答；教師已授權將這輪新增提交並推送，實際版本以 Git 歷史為準。不增加採購、評分或強制繳交要求。

| 週次 | 累積使用的零件 | 動手改造 |
|---|---|---|
| Week 3 | Week 2 按鈕＋KY-018 | 一次按壓從一筆改三筆取樣 |
| Week 4 | 按鈕＋KY-018＋DHT11 | 無有效 DHT 時不收錄，但保留跳過紀錄 |
| Week 5 | Week 2 雙按鈕＋OLED | 可調整、開始／中止的倒數器，改五秒一格 |
| Week 6 | Week 2 按鈕作 STOP、Week 5 OLED、SG90 | Serial 加減計數指針，改每次兩格並限制 0～6；不是新增兩個實體加減按鈕 |
| Week 7 | 雙按鈕＋KY＋RGB＋OLED；受限加入 SG90／蜂鳴器 | 相同規則與事件序列，只改每色 3／5／1.5 秒，區分計分測試與實物結果 |

新增活動取代部分重複操作或作延伸，不把三週都加長成同一堂課必做。技術驗證及限制見 [整合範例檢查](integration_checks/README.md)。

- 先 `git pull --ff-only` 取得已推送提交；本地有變更或歷史分歧時先比較，不重設丟棄。
- PDF 是閱讀成品；Markdown／builder 是維護來源，程式從既有 `.ino` 自動嵌入。不要直接修改 PDF。
- 讀取[硬體狀態](../hardware/hardware_state.md)再碰實物。Git 同步不代表元件接法、供電、GPIO 與實測進度自動同步。
- 教材內的假資料、示意圖、主機替代 I/O 測試都不是實物已通過。課前待確認項目見各週 review。
- 練習後緊接解答，適合共讀與形成性練習，不是隱藏答案的考卷。私有 QA、runtime 資料庫、暫存渲染與編譯產物不納入這次發布。
- Week 3／4 review 內「當時未 commit／push」描述撰寫當下。本次教師已授權把 Week 3–5 重設稿一併提交與推送；不表示正式出口已切換或已完成硬體驗證。
