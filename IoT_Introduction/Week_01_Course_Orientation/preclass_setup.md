# Week 2 課前環境準備

截止時間：Week 2 上課前<br>
目的：把安裝工作留在家中完成，第二週課堂直接進入 ESP32 操作。

## 必做項目

### 1. 安裝 Arduino IDE 2

從 [Arduino 官方 IDE 文件](https://docs.arduino.cc/software/ide/)下載並安裝
Arduino IDE 2。安裝後至少開啟一次，確認程式可以正常啟動。

### 2. 安裝 Espressif ESP32 board package

依 [Espressif 官方安裝說明](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html)
使用 Boards Manager 安裝 `esp32` platform。若 IDE 要求 Additional Boards
Manager URL，使用官方 stable release：

```text
https://espressif.github.io/arduino-esp32/package_esp32_index.json
```

安裝後重新啟動 Arduino IDE。第一週只要求 package 安裝完成；實際 board、
flash 與 PSRAM 設定由教師在 Week 2 依實物板卡統一公布，不自行猜設定。

### 3. 取得課程資料

確認可開啟 GitHub repository，並以 `git pull`、clone 或 Download ZIP 取得
最新版。能找到下列檔案即完成：

```text
IoT_Introduction/Week_02_ESP32_Hardware_Basics/README.md
docs/course_materials/starter_code_snippets.md
docs/course_materials/student_worksheets.md
```

### 4. 準備上課用品

- 筆電與充電器。
- 一條已知可傳輸資料的 USB 線；只有充電功能的線不合格。
- 可登入自己的電腦並具備必要的安裝權限。
- 依Week 1的[學生材料採購總表](student_purchase_list.md)準備個人必買器材，
  並完成到貨檢查。若材料來不及到貨或規格不同，須在Week 2前回報。

## 繳交證據

- [ ] Arduino IDE 2 可開啟的截圖。
- [ ] Boards Manager 顯示 Espressif `esp32` 已安裝的截圖。
- [ ] 課程資料已下載或同步的截圖。
- [ ] 填寫作業系統版本及是否具有管理員權限。

## 安裝失敗時

不要只寫「不能用」。回報時附上：

1. 作業系統版本。
2. 進行到哪一步。
3. 完整錯誤訊息或截圖。
4. 已經嘗試過什麼。

Week 2 不會為全班重新播放完整安裝流程。未完成者進入個別環境排錯區，
完成環境後才能開始硬體驗收。
