# Week6：餵食器與自動遮陽板

2026-10-19 教師要求兩件完整作品，並把原提醒牌改成定時感應餵食器模型。Q1 用紙筒、少量紙球、輕紙閘板與玩偶，滿10秒且目前已確認遮光才出料，一輪只出料一次。Q2 保留已接受的自動遮陽板，強光遮陽、弱光採光、手動收起與恢復自動。DHT 不列必接。

維護 Main 在本目錄；Ans、兩支獨立 INO、生成器、測試與完整3D來源在私有 `../week6_answers`。目前檔案清單為 cat_feeder 與 auto_shade；舊四題和提醒牌均保存在修訂備份／legacy 資料夾，不作現行開檔順序。

建置使用 bundled Node/Python、NODE_PATH、Edge、Microsoft JhengHei。依序：

1. `node ../week6_answers/generate_week6.cjs`
2. `node ../week6_answers/two_works/check_feeder.cjs` 與 `check_host.cjs`，產生當版實際程式模擬與重播。
3. `node ../week6_answers/two_works/check_target.cjs`，只編譯，不上傳。
4. `node ../../../scripts/package_answer_programs.cjs 6`
5. `node build.cjs`、`node build.cjs --answers`
6. `node ../week6_answers/two_works/build_animation.cjs`、`check_web.cjs`
7. `python ../week6_answers/two_works/review_pdf.py`，檢查實際 PDF 圖頁。

完整本機動畫在 `Week_06_Servo_Pointer/animations/index.html`，左邊完整步驟、右邊3D模型與實際程式 OLED 文字；兩件合計約90秒，可暫停／選步驟／拖時間／換視角。Q1 兩次試作明確呈現中間關電、RST 與重新設定。

保留核對後外接供電、共地、教師實測行程、STOP、首次ON OK起30秒、至少1秒命令間隔及人工關電。軟體停止不保證閘板關閉，Q1 關電後移走紙球。紙機構不卡料、實際帶載與停止仍需教師試作。

2026-10-19 本版 Main／Ans 與完整動畫已更新學生網站及教師雲端，並依教師後續指示同步 GitHub。Arduino 原碼、Ans 維護來源及檢查仍不公開；本目錄建置指令需教師本機私有依賴，不是學生下載後即可重建的程式包。發布範圍見 `../../lab_notes/2026-10-19-week6-two-works-publication.md`。
