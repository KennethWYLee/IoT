# Week7 紙杯垃圾桶：Arduino＋手機 App

完整控制程式與 App 原始碼在同一個 Arduino 專案內。ESP32 提供網頁，手機加入本組 Wi-Fi 後用 Chrome 開啟，不需要另裝 APK，也不需要雲端伺服器。

- [Arduino 主程式](firmware/bin_app/bin_app.ino)：接腳、Wi-Fi、OLED 與舵機輸出。
- [控制規則](firmware/bin_app/controller.hpp)：校正、自動感應、手機要求、計時與停止。
- [手機 App 原始碼](firmware/bin_app/app_page.h)：完整 HTML／CSS／JavaScript，可由學生修改外觀。
- [開檔、啟用與 API 說明](firmware/START_HERE.md)。
- [Main、Ans、動畫與資訊流向圖](../../IOT_Introduction/Week_07_Traffic_Light_Challenge/README.md)。

## 先保留保護預覽

下載版 `SERVO_SETUP_CONFIRMED=false`，兩個舵機端點為 `-1`。這不是缺程式，而是先允許連線與光線校正，不 attach、不送舵機命令。依 Ans 先空載測試，由教師核對每顆舵機、供電與兩端後才填入設定；不要照抄其他作品的數字。

Arduino IDE 開 `firmware/bin_app/bin_app.ino`，同資料夾的兩個 `.h` 必須保留。App 是 `app_page.h`，不是另一個可獨立上傳的檔案；改 App 後仍須重新編譯整個 Arduino 專案。

先完成純舵機＋App，再全部斷電安裝紙杯、重新核對帶載行程。預設自動開啟5秒且感應點清空才關；準備起最多180秒。App停止與逾時不會切電，異常直接關舵機電池，收納再拔USB。

本版是課堂隔離 Wi-Fi 示範，課堂共用密碼不是個人憑證或正式登入機制。編譯與電腦測試不能代替每組實物、Android Chrome、供電與紙蓋負載驗證。
