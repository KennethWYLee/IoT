# 07：手機 Web 與 PWA

## 對應週次

Week 12，並在 Week 13、15、17 持續驗證。

## 教材內容

- Responsive Web／PWA 與手機優先畫面。
- WebSocket 即時狀態、歷史 API 與命令操作。
- loading、empty、pending、success、failure、timeout、offline 狀態。
- 權限、危險操作確認與非開發者使用流程。

## 核心流程

1. 手機開啟頁面後辨識目前裝置及連線狀態。
2. 查看即時值與一段真實歷史。
3. 執行一項操作並看到 pending 與最終結果。
4. Backend 或裝置離線時顯示可理解的狀態及下一步。

## 完成檢核

- [ ] 不需縮放即可在手機完成核心流程。
- [ ] 即時、歷史與操作都使用真實資料。
- [ ] error／offline／timeout 不會顯示成成功。
- [ ] 非開發者不需 IDE 即可使用。

參考：[手機使用流程表](../../docs/course_materials/student_worksheets.md)｜[範例手機頁面](../../examples/course_backend/static/index.html)
