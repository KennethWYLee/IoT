# Week7 兩件作品修訂與發布範圍

2026-10-20，教師授權發布 Week7；期中考不上傳。

## 現行教材

- [Main](../../Week_07_Traffic_Light_Challenge/week7_main.pdf)：4 頁，Q1 免接觸垃圾桶模型、Q2 包裹開箱警示。
- [Ans](../../Week_07_Traffic_Light_Challenge/week7Ans.pdf)：13 頁，從空麵包板接線、舵機單獨測試、設定、操作與排錯。
- [動畫與開啟方式](../../Week_07_Traffic_Light_Challenge/animations/README.md)：同一份離線 HTML 包含兩件完整 3D 動畫，左列步驟，右顯示目前作品與預期 OLED。

每件作品分兩輪示範，輪間關閉外接電源、RST、重新設定光線；不因動畫總長而延長硬體單輪 30 秒。STOP 只停止控制，人仍須立即關閉外接電源。Q1 不是防夾設備；Q2 不辨識開箱者。紙件行程、供電與實物操作仍需教師逐組核對。

## 檢查與限制

維護來源與正式 PDF／程式包的雜湊一致。實際 INO 使用假 I/O 完成 45 個測試、350 個斷言；6 個 ESP32-S3 設定組合完成編譯。另寫的動畫模型完成 34 個預期狀態及四種桌面／手機寬度檢查，包含離線、畫面非空、動作、取景與 OLED。兩份 PDF 共 17 頁完成轉圖、文字與邊界檢查及目視核對。

Claude 檢查的是前版文件與初版兩作品模型；Codex 依核對結果修訂並完成上述檢查，不聲稱 Claude 再次審查最終 PDF／INO。動畫不是實機或 INO 重播；編譯、假 I/O 與動畫均不等於實物測試。

## 發布邊界

GitHub 僅納入本輪 Week7 Main、Ans、動畫、授權文字、相關 Main 維護檔與入口說明。舊四支 GIF 保留原已發布版本，不作新題目操作指引。雲端沿用既有 Week7 PDF 與動畫位置，不變更分享權限。GitHub HTML 頁不直接執行動畫，須下載後以 Chrome／Edge 開啟。

Week7 Arduino 程式、私有答案來源與測試記錄不公開；停車場期中考題目、解答、程式、考試網頁與 3D 動畫都不納入本次發布。Week6 已測成功的 Cat 設定與其他週本機修改不變。

正式 Main SHA-256：`d97f5f1a086938fb77d822e015b999ecc808e61551302cdf90539e7afb3cd81e`。

正式 Ans SHA-256：`e619a6192232d528ec6e15f45f5a9275af028f7a864d5923bd97171cb2c2956e`。

動畫 SHA-256：`a41e8dba2f303437a68d964d7df53cbb6bd7b56e00483c284d7bc3a9b40957b4`。
