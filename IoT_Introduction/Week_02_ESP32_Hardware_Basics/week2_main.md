# Week 2：ESP32-S3 開發環境與數位輸入輸出實驗

本章以 ESP32-S3 開發板為實驗平台，完成開發環境確認、程式編譯與上傳、
GPIO 按鈕輸入、數位輸出及萬用電表驗證。

## 一、Unit Overview

### Teaching Objectives

By the end of this unit, students will be able to:

1. Identify the ESP32-S3 power, ground, USB, and GPIO connections required for a
   safe digital input and output circuit.
2. Configure Arduino IDE, compile and upload a program, and interpret Serial Monitor
   output.
3. Build and test a push-button input with `INPUT_PULLUP` and a GPIO HIGH/LOW output.
4. Measure loose resistors, continuity, and DC voltage with the correct multimeter
   function and range.
5. Use wiring, Serial logs, and measurements together to locate and explain a fault.

### Teaching Content

This unit introduces the complete workflow for developing a small embedded system with
an ESP32-S3. Students will identify the board connections, configure the development
environment, upload firmware, and use Serial output to observe what the program is doing.

The hardware activity connects a push button as a digital input and uses another GPIO
as a measurable digital output. Students will learn how `INPUT_PULLUP`, HIGH, LOW, GND,
and 3.3V logic relate to the physical circuit. A multimeter will first be used to compare
the nominal and measured resistance of loose resistors, and then to verify continuity
and voltage so that software messages are supported by physical evidence.
Safe power handling, systematic testing, and evidence-based troubleshooting are applied
throughout the activity.

### 必做實驗流程

| 階段 | 開始狀態 | 實驗內容 | 完成條件 |
|---:|---|---|---|
| 1 | 板子未接 USB | 環境與實物辨識 | 找到 USB、BOOT、RESET、GPIO4、GPIO5、GND |
| 2 | 只接 USB | 設定 Board 與 Port | IDE 顯示正確 Board、Port 與 N16R8 設定 |
| 3 | 只接 USB | Upload 與 Serial | log 顯示本組組別及 `version=2` |
| 4 | USB 已拔除 | 麵包板、按鈕、TP5、TPG 接線 | 依接線表逐線確認；獨自操作時正向、反向各檢查一次 |
| 5 | 接線已確認 | GPIO4 輸入與 GPIO5 輸出 | 五次按下／放開事件完全對應 |
| 6 | 量測站 | 散裝電阻、通斷及電壓 | 三種電阻有實測值；通斷合理；TP5 LOW／HIGH可分辨 |
| 7 | 核心任務完成 | 基本練習 | 按壓計數有可重複的 Serial 證據 |

各階段應依序完成。未達成完成條件時，應先依該節故障排除內容修正，再進入
下一階段。

## 二、實驗器材與分組

每個工作站使用一片ESP32-S3、一條可傳輸資料的USB線、一片400孔麵包板、
一顆四腳按鈕、至少四條公對公杜邦線、一包常用電阻，以及一台筆電。萬用電表由課堂輪流
提供；馬達、舵機、電池盒及其他高耗電設備不進入工作區。

上課前依[Week 2器材與必帶確認表](week2_support.md#一本週必帶與器材確認)
核對完整型號、數量、取得方式與上電前狀態。

## 三、安全須知

### 接線前先辨認電源與訊號

- **GPIO**（General-Purpose Input/Output，通用輸入／輸出接腳）：由程式讀取
  或控制的訊號腳，不是供應馬達電力的電源腳。GPIO4、GPIO5 是晶片編號，
  不是從板邊數過來的第 4、5 支排針。
- **GND**（Ground）：電路共同的 0V 參考點，也是電流返回路徑。
- **3V3**：板上的 3.3V 電源腳；**5V** 是板上的 5V 電源腳。ESP32-S3 GPIO
  使用 3.3V 邏輯，因此 5V 不可直接進入 GPIO。
- **絲印／pinout**：絲印是板面印的接腳文字；pinout 是整塊板的接腳功能圖。
  接線先核對實物絲印，再核對同一板本的官方 pinout。
- **短路**：兩個不該直接連接的點形成很低電阻的路徑，例如 5V 直接接 GND，
  可能造成過大電流、發熱或損壞。

1. **接線或改線前，先拔除 USB。**
2. 5V 不得接入任何 GPIO。
3. GPIO 是訊號腳，不得直接作為舵機或馬達的電源。
4. 接腳不確定時，應核對板身絲印與官方 pinout，不得憑記憶接線。
5. 接回 USB 前，必須依接線表逐條檢查。身邊有同學時，請同學和你一起檢查；
   獨自操作時，先從 ESP32 腳位沿線檢查到零件，再從零件反向檢查回 ESP32。
6. 發現板子、線材或零件發熱、異味或異常聲音，立即斷電並通知教師。

本次使用 GPIO4 與 GPIO5。Espressif 官方 DevKitC-1 接腳表將兩者列為
一般輸入／輸出接腳。採購紀錄標示本課板卡為 N16R8，操作前仍須讀取金屬
屏蔽罩確認。為避免記憶體配置差異，本課不使用 GPIO35、GPIO36、GPIO37，
因為使用 Octal SPI Flash／PSRAM 的相關版本會把這些腳位保留給板內部通訊。

板載 RGB LED（可顯示紅、綠、藍的多色燈）不列入本週必要任務。DevKitC-1
不同硬體修訂版本可能把它接到不同 GPIO；未確認板本版本前，不把網路上的
LED 腳位直接套用到實物。

官方參考：[ESP32-S3-DevKitC-1 v1.1 使用指南](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html)

## 四、開發環境與板卡辨識

### 步驟 1：驗證課前安裝

#### Arduino IDE 與開發板支援套件

- **Arduino IDE**：撰寫、編譯和上傳 ESP32 程式的軟體。
- **Boards Manager**：Arduino IDE 內安裝開發板支援套件的位置。
- **package／platform**：使 Arduino IDE 認得 ESP32、提供編譯工具與板型設定
  的軟體套件。本課選作者為 Espressif Systems 的 `esp32`。
- **repository／repo**：由 Git 管理的課程專案資料夾；GitHub 上看到新版不
  代表本機一定已同步。

依下列順序確認，不得僅以桌面是否存在 Arduino 圖示作為判斷：

1. 啟動 Arduino IDE 2，等待主視窗完整顯示。
2. 點左側 **Boards Manager** 圖示；若看不到，使用選單
   **Tools → Board → Boards Manager**。
3. 在搜尋欄輸入 `esp32`。
4. 找到作者為 **Espressif Systems** 的 `esp32` package。
5. 確認按鈕顯示 `REMOVE` 或旁邊標示已安裝版本；若仍顯示 `INSTALL`，表示
   課前作業尚未完成。`INSTALL` 是安裝，`REMOVE` 是移除；已安裝時不得
   按下 `REMOVE`。
6. 把已安裝版本填入：

```text
Arduino IDE 版本：____________________
Espressif esp32 package 版本：____________________
```

7. 用瀏覽器開啟本repository，確認目前看到的檔名是`week2_main.md`。

最後勾選：

- [ ] Arduino IDE 2 可以正常開啟。
- [ ] Boards Manager 顯示 Espressif `esp32` platform 已安裝。
- [ ] 已取得最新版課程 repository。
- [ ] USB 線已知具有資料傳輸功能。

任一項未完成時，應先進入環境排錯區。每位學生均須完成自己的環境驗收。

### 步驟 2：辨識板卡，不接線

#### 板卡組成

- **ESP32-S3** 是執行程式、讀取接腳及控制輸出的微控制器晶片。
- **模組**是金屬屏蔽罩下包含晶片、Flash、PSRAM 與天線的組合；**開發板**
  則再加上 USB、穩壓、按鈕與兩排排針，方便實驗。
- **BOOT** 用於進入程式下載模式；**RESET／RST** 讓目前程式從頭執行，
  不會刪除已上傳的程式。

拿起 ESP32-S3，依板身標示找出：

- 兩個 USB 接頭及其絲印。
- BOOT 按鈕。
- RESET／RST 按鈕。
- 3V3、5V、G／GND。
- GPIO4 與 GPIO5。

官方 v1.1 header table 中，GPIO4 是 J1 第 4 腳、GPIO5 是 J1 第 5 腳；J1
第 22 腳與 J3 第 1、21、22 腳都是 GND。**實際操作應直接找板上印的 `4`、
`5`、`G`／`GND`，不得僅以排針順序判斷。**

`J1`、`J3` 是官方文件替兩排連接器取的編號，不是 GPIO 編號；學生實際接線
仍以板上 `4`、`5`、`G` 等絲印為主。

依實物填寫下表，不得直接抄錄其他組員的內容：

| 項目 | 板身實際標示／位置 |
|---|---|
| 開發板或模組型號 |  |
| 預計使用的 USB 接頭 |  |
| BOOT |  |
| RESET／RST |  |
| GPIO4 |  |
| GPIO5 |  |
| GND |  |

### 本節檢核

兩位組員各自在板卡照片上標出 USB、BOOT、RESET、GPIO4、GPIO5 與 GND，
再互相比對；有不同之處就回到板身絲印核對並修正標記。

## 五、Arduino IDE 板卡與連接埠設定

### 步驟 1：建立 USB 連線

- **USB** 在這一步同時供電和傳輸資料；只有充電功能的線可以讓燈亮，卻不
  會讓電腦出現 Port。
- **USB-to-UART** 是把電腦 USB 資料轉成 ESP32 序列通訊的橋接路徑。本週
  固定使用教師標記的這個接頭，不使用另一個原生 USB 接頭。
- **USB hub** 是把一個 USB 孔擴充成多孔的集線器；鬆動或供電不穩時可能
  造成連線中斷，因此第一次測試先直接接筆電。

1. 確認 ESP32 尚未插在麵包板，也沒有接任何杜邦線。
2. 關閉 Arduino IDE 的 Serial Monitor，避免它占用 Port。
3. 把資料線接到教師在板子上標記的 **USB-to-UART** 接頭。
4. 把另一端接到筆電；不得使用接觸鬆動的 USB hub。
5. 等待作業系統完成裝置辨識。
6. 確認板上電源指示燈亮起。燈亮只證明有電，下一步仍要確認 Port。

此階段僅連接「ESP32、USB 與筆電」，不連接麵包板或其他模組。

### 步驟 2：選擇 Board 與 N16R8 設定

- **Board** 是 Arduino IDE 的編譯目標設定，告訴工具要為哪種晶片與硬體
  產生程式；它不是 USB Port。
- **N16R8** 是模組容量標示：`N16` 表示 16 MB Flash，`R8` 表示 8 MB
  PSRAM；必須先在金屬屏蔽罩看到相同標示，才能使用後面的候選設定。
- **Flash** 是斷電後仍保存程式的快閃記憶體；**PSRAM**（Pseudo Static RAM）
  是程式執行時使用、斷電後不保留內容的額外記憶體。
- **QIO**（Quad I/O，四線輸入／輸出）與 **OPI**（Octal Peripheral
  Interface，八線周邊介面）是記憶體資料傳輸模式。WROOM-1 N16R8 的 Flash
  使用 QIO，PSRAM 使用 OPI；不是看到較大的數字就任意選最快設定。
- **Flash Mode／Flash Size** 分別指定 Flash 的通訊方式與容量，兩者都必須
  符合實物 N16 規格。
- `MB` 的大寫 `B` 表示 byte，`Mb` 的小寫 `b` 表示 bit；8 bits = 1 byte，
  所以 128 Mb 等於 16 MB。
- **USB CDC** 是讓原生 USB 表現成序列通訊埠的功能；本週經 USB-to-UART，
  所以 `USB CDC On Boot` 選 Disabled。
- **UART**（Universal Asynchronous Receiver/Transmitter）是序列通訊硬體；
  UART0 是 ESP32 的其中一組通道。本週 Upload Mode 使用表中指定的
  `UART0 / Hardware CDC`。
- **Upload** 是把程式寫入 ESP32；Upload Mode 選通訊路徑，Upload Speed 選
  傳輸速度。真正執行 Upload 會在下一階段操作。
- **Partition Scheme** 決定 Flash 如何分配給程式和其他資料；**Erase All
  Flash** 則決定上傳前是否清除整顆 Flash。本週只照表設定，不自行改動。
- **Sketch** 是 Arduino 對一個程式專案的稱呼，因此選單中的 `Before Sketch
  Upload` 就是「上傳程式前」。

使用教師標記的 USB-to-UART 接頭時，N16R8 規格對應的候選設定如下。
Arduino-ESP32 版本不同時，選單文字與預設值可能不同；教師必須先在本批
實物完成 Upload、Serial 與重新開機測試，並把設定截圖記錄到
`docs/hardware_state.md`。學生以教師公布的實機驗證截圖為準；尚未公布時
不得猜設定或直接上傳。

| 設定 | N16R8 候選值／授課時使用方式 |
|---|---|
| Board | `ESP32S3 Dev Module` |
| Flash Mode | `QIO 80MHz`，若選單分開則 Flash Mode 選 QIO |
| Flash Size | `16MB (128Mb)` |
| PSRAM | `OPI PSRAM` |
| USB CDC On Boot | `Disabled`（本週使用 USB-to-UART） |
| Upload Mode | `UART0 / Hardware CDC` |
| Upload Speed | 先用預設；不穩定時降低一級再試 |
| Partition Scheme | 使用教師在相同 package 版本完成實機驗證的值，不自行挑選 |
| Erase All Flash Before Sketch Upload | `Disabled` |

Espressif 的 WROOM-1 模組資料表列出 N16R8 為 16 MB Quad SPI Flash 與
8 MB Octal SPI PSRAM；Arduino-ESP32 工具說明則要求設定符合實際模組。
這只能支持 QIO、16 MB 與 OPI 的規格判斷，不能取代本批開發板、USB 路徑、
  package 版本與 Partition Scheme 的指定實機測試（target test，也就是使用
  課堂實際板卡、線材與軟體版本完成操作）。若金屬屏蔽罩實際不是
`ESP32-S3-WROOM-1 N16R8`，立即停止並請教師重新核對。

官方參考：[ESP32-S3-WROOM-1 模組資料表](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf)｜[Arduino-ESP32 Tools Menu](https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html)｜[PSRAM 設定排錯](https://docs.espressif.com/projects/arduino-esp32/en/latest/troubleshooting.html)

實際點選順序：

1. 點 **Tools → Board → esp32 → ESP32S3 Dev Module**。
2. 再打開 **Tools**，逐項找到上表選項。
3. 每設定一項後回到 Tools 設定下一項；選擇 Board 不會自動完成其餘設定。
4. 對照教師公布、且已記錄 package 版本的實機驗證截圖；任一值不同時先停止，
   不自行判斷哪一個比較快或比較新。
5. 設完後重新打開 Tools，由上往下逐項比對一次。
6. 把 Tools 選單截圖保存為 `week02_board_settings_組別.png`。

如果 Tools 中完全看不到 ESP32-S3、Flash Size 或 PSRAM，通常是選錯 Board，
或 Espressif `esp32` package 沒有正確安裝。回到階段 1，不要繼續 Upload。

### 步驟 3：選擇 Port

- **Port** 是 Arduino IDE 要和哪一個已連接裝置通訊。Windows 常顯示為
  `COM5`、`COM6` 等，每台電腦和每次插孔都可能不同。
- 本節的 **COM5** 是 Windows 序列連接埠名稱；後面萬用電表上的 **COM**
  是黑表筆插孔，兩者完全不同。
- **driver** 是讓 Windows 辨認 USB 裝置並建立 Port 的驅動程式，不應看到
  問題就隨機安裝來源不明的 driver。

用「拔除前後比較」找 Port：

1. 先拔掉 ESP32 的 USB。
2. 打開 **Tools → Port**，把目前清單記下來或截圖。
3. 關閉 Port 選單。
4. 把 ESP32 接回同一個 USB 孔，等待裝置辨識。
5. 再開 **Tools → Port**。
6. 找出新出現的 Port，例如 Windows 的 `COM5`。
7. 點選該 Port；被選取的項目前應出現勾選符號。
8. COM 號碼由各台電腦分配，不得直接套用其他組別的號碼。

把實際 Port 寫下來：

```text
我的 Port：____________________
```

如果沒有新 port：

1. 先換成已知可傳資料的 USB 線。
2. 換另一個電腦 USB 接頭。
3. 關閉並重新開啟 Arduino IDE 的 port 選單。
4. 查看 Windows 裝置管理員是否出現未知裝置。
5. 保存畫面後交由教師協助，不得安裝來源不明的 driver。

### 本節檢核

- [ ] Board 是 `ESP32S3 Dev Module`。
- [ ] Flash Size 是 16MB，PSRAM 是 OPI。
- [ ] 使用 USB-to-UART 時，USB CDC On Boot 是 Disabled。
- [ ] 已用拔除前後比較找到自己的 Port。
- [ ] Board 設定截圖已保存。

## 六、第一個程式：編譯、上傳與序列輸出

### 步驟 1：建立程式

- **Sketch** 是 Arduino 對一個程式專案的稱呼，資料夾和主要 `.ino` 檔通常
  使用同一名稱。
- **`setup()`** 在開機或 RESET 後只執行一次；**`loop()`** 會在之後持續
  重複執行。
- `CHANGE_ME` 和 `XX` 是「請換成自己的資料」的預留文字，不是固定答案。
- **baud rate** 是序列通訊速度。本課程式使用 115200，稍後 Serial Monitor
  也必須選相同數值。

1. 點 **File → New Sketch**。
2. 點 **File → Save As**。
3. 將資料夾／Sketch 名稱設為 `week02_serial_groupXX`，把 `XX` 換成組別。
4. 刪除編輯器內原本的 `setup()` 與 `loop()` 範本，避免重複定義。
5. 使用 GitHub 程式區塊右上角的 Copy 按鈕，完整複製下列程式。
6. 貼到 Arduino IDE。
7. 把 `CHANGE_ME` 改成組別，例如第 3 組改成 `03`。
8. 按 **Ctrl+S** 儲存。

#### 程式語法說明

- `unsigned long` 是可保存非負整數的資料型別，本程式用來保存毫秒時間。
- `millis()` 取得 ESP32 從開機到目前經過的毫秒數。
- `if` 表示只有括號內條件成立，才執行大括號內的程式；`>= 1000` 表示已經
  過了至少 1000 毫秒。
- `Serial.begin(115200)` 以 115200 baud 啟動序列通訊。
- `Serial.println()` 輸出一整行文字；`Serial.printf()` 可把變數插入文字，
  `%lu` 對應 `unsigned long`，`\n` 表示換行。

完整程式：

```cpp
unsigned long lastReportMs = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("boot: week02 group=CHANGE_ME version=1");
}

void loop() {
  unsigned long now = millis();

  if (now - lastReportMs >= 1000) {
    lastReportMs = now;
    Serial.printf("status: uptime_ms=%lu\n", now);
  }
}
```

baud rate 維持 115200。貼上後確認程式只出現一組 `setup()` 與一組 `loop()`。

### 步驟 2：分辨 Verify 與 Upload

- **Verify／Compile（驗證／編譯）**：檢查語法，再把人寫的程式轉成 ESP32
  可執行的韌體；成功不代表已經寫進板子。
- **韌體（firmware）**：儲存在 ESP32 Flash、開機後會執行的程式。
- **Upload（上傳／燒錄）**：把編譯完成的韌體寫入板子。
- **Output**：IDE 下方顯示編譯和上傳過程的區域，不是稍後顯示程式文字的
  Serial Monitor。

1. 點左上角勾號 **Verify**。
2. 檢查視窗下方 Output 的文字，不以進度動畫作為成功判斷。
3. 等待編譯完成及記憶體用量訊息；若出現紅色錯誤，應先處理 Output 中最早
   出現的錯誤，不從最後一行反向推測。
4. Verify 成功後，點右箭頭 **Upload**。
5. Output 會先再次編譯，再出現連線、寫入百分比及完成訊息。
6. 等待 `Hard resetting via RTS pin...` 或 IDE 顯示 Upload 完成。
7. Upload 期間不得拔線、按 RESET 或移動板子。

`Hard resetting via RTS pin...` 通常表示 IDE 已透過 USB-to-UART 的 RTS 控制
訊號自動重設板子，讓新程式開始執行；它不是「硬體損壞」訊息。

Verify 成功不等於 Upload 成功；Upload 成功也不等於程式功能正確。三者需要
不同證據。

#### `Connecting...` 停滯時的處理

`Connecting...` 表示 IDE 正嘗試和 ESP32 建立下載連線。BOOT 可讓板子進入
下載模式，RESET 讓板子重新啟動；只有正常自動 Upload 失敗時才使用下列
手動順序。

依下列順序做一次手動下載模式：

1. 保持 USB 連接。
2. 按住板上的 **BOOT** 不放。
3. 短按一下 **RESET／RST** 後放開 RESET。
4. 再放開 BOOT。
5. 回到 Arduino IDE，重新確認 Port。
6. 再按 Upload。

另一種常見操作是先按 Upload，看到 `Connecting...` 時按住 BOOT，連線開始
寫入後再放開。兩種方式都只在正常自動 Upload 失敗時使用。

若 Output 顯示晶片不是 ESP32-S3，應立即停止並回到 Board 設定，不得使用
錯誤 Board 強行上傳。

### 步驟 3：檢查 Serial Monitor 輸出

- **Serial** 是 ESP32 與電腦依序傳送文字或資料的通訊方式。
- **Serial Monitor** 是 Arduino IDE 顯示這些程式輸出的視窗。
- **log** 是程式留下的執行紀錄，例如組別、版本、事件與時間。
- **115200 baud** 是本程式的傳輸速度；程式與 Serial Monitor 設定不同時，
  文字可能變成亂碼。

1. Upload 完成後，點 Arduino IDE 右上角 **Serial Monitor** 圖示，或選
   **Tools → Serial Monitor**。
2. 在 Serial Monitor 的 baud rate 選單選擇 `115200`。
3. 按一下板上的 RESET，讓開機訊息重新出現。
4. Serial 輸入框保持空白；本程式不讀取鍵盤輸入。
5. 預期看到：

```text
boot: week02 group=03 version=1
status: uptime_ms=1000
status: uptime_ms=2000
status: uptime_ms=3000
```

若是亂碼：

1. 確認 baud rate 是 115200。
2. 確認 Serial Monitor 使用的 Port 和 Upload 的 Port 相同。
3. 按 RESET 再看一次。

若完全沒有文字：

1. 關閉 Serial Monitor。
2. 重新確認 Tools → Port。
3. 再開 Serial Monitor 並選 115200。
4. 按 RESET。
5. 檢查程式是否包含 `Serial.begin(115200)`。
6. 仍無輸出時重新 Upload，保存 Output 及 Serial 畫面再求助。

### 步驟 4：驗證程式版本

1. 關閉 Serial Monitor。
2. 在程式中把 `version=1` 改成 `version=2`。
3. 按 Ctrl+S。
4. 再按 Upload。
5. Upload 完成後重新開啟 Serial Monitor，確認 115200。
6. 按 RESET。
7. Serial 必須出現正確組別及 `version=2`。
8. 保存包含組別、版本與 uptime 的畫面，命名
   `week02_serial_version2_組別.png`。

### 本節檢核

- [ ] Verify 成功。
- [ ] Upload 成功。
- [ ] Serial 顯示正確組別與 `version=2`。
- [ ] 實驗紀錄已各用一句文字記錄 Verify 與 Upload 的用途。

## 七、麵包板與按鈕接線

### 步驟 1：斷開 USB 電源

1. 關閉 Serial Monitor。
2. 從 ESP32 端拔除 USB 線。
3. 確認板上電源燈熄滅。
4. 等待數秒後，再拿出麵包板、按鈕與杜邦線。

後面凡是寫「拔除 USB」，都要做到電源燈熄滅。只關閉 Serial Monitor 或只
停止程式，都不等於斷電。

### 步驟 2：確認麵包板導通結構

**麵包板（solderless breadboard）**是不必焊接就能暫時接線的實驗板。孔洞
不是全部獨立：同一個五孔組內部由金屬片連通；中央溝槽把左右兩側分開；
邊緣紅藍長列稱為電源軌，但不同產品的電源軌可能中途斷開。

1. 將麵包板橫放，使 `A～E` 在中央溝槽左側、`F～J` 在右側。
2. 找到列號，例如 1、5、10；列號沿著長邊增加。
3. 在同一列中，`A～E` 五孔相通，`F～J` 五孔相通。
4. `E` 和 `F` 中間有溝槽，兩側不相通。
5. 若板上有紅、藍長電源軌，本週不使用，避免把「同列」和「長條電源軌」
   混在一起。

**TP** 是 Test Point（測試點）的縮寫。`TP5` 和 `TPG` 不是麵包板原廠名稱，
而是本實驗定義的標籤：TP5 之後接 GPIO5，TPG 之後接 GND。

先用筆或可移除標籤在板邊寫下：

```text
左外側接線欄：A
右外側接線欄：J
TP5 預留列：________
TPG 預留列：________
```

TP5 與 TPG 必須是兩個不同的空白列，而且不能位於 ESP32 排針占用的列。

### 步驟 3：確認四腳按鈕結構

本課按鈕是**常開、瞬時型**：平常左右兩側不導通，只有按住時左右導通，
放開後立即恢復。**導通**表示兩點之間有可通過電流的低阻抗路徑；**開路／
不導通**表示路徑中斷。

四腳按鈕通常是：

```text
左側                 右側
L1 ●                 ● R1
   │     [按鈕]      │
L2 ●                 ● R2

未按下：左側與右側不通
按下：左側與右側導通
```

同一側的兩腳通常原本就相通，但必須在量測站用通斷檔確認實物，不能只看
示意圖。把按鈕跨在麵包板中央溝槽，避免四腳落在錯誤的同一排導通區。

先不要插入，將按鈕放在桌上觀察：

1. 找到按鈕本體兩側各伸出的兩支腳。
2. 讓兩支腳朝左、兩支腳朝右，而不是四支腳排成上下方向。
3. 選兩個相隔約兩列的空白位置，例如第 27 與第 29 列。
4. 預定讓左側兩腳進入 `E27`、`E29`，右側兩腳進入 `F27`、`F29`。
5. 此時按鈕本體跨在 `E`、`F` 之間的中央溝槽。

若實物腳距不同，列號可以改，但必須同時滿足「左右跨槽」與「四腳自然對
孔」。不得把腳扳到明顯變形來配合例子。

### 步驟 4：將 ESP32 安裝至麵包板

**杜邦線（jumper wire）**是實驗用接線：公頭是裸露金屬針，可插麵包板；
母頭是插孔，可套住開發板排針。公對公兩端都是針，公對母則一端是針、一端
是插孔。

1. 確認 USB 仍未接上。
2. 讓 ESP32 元件與絲印朝上、排針朝下。
3. 讓兩個 USB 接頭朝麵包板短邊外側，避免接上線後壓住麵包板。
4. 先讓左排針對準 `B` 欄、右排針對準 `I` 欄，不要立刻壓下。
5. 從板子兩端目視，確認每一支排針都正對一個孔，沒有任何一支偏在孔邊。
6. 兩手分別平均按住板子兩端，垂直、緩慢壓入；不可只壓單側或 USB 接頭。
7. 插入後從側面確認兩排高度大致一致，排針沒有外彎。
8. 確認 `A`、`J` 外側各留一欄可插杜邦線。

若第 4 步無法自然對準，應立即停止且不得施力，改用以下備用方式：

1. ESP32 放在不導電且穩固的桌面墊上，不讓排針碰到金屬。
2. 使用公對母杜邦線，母端套在 ESP32 的 GPIO4、GPIO5、GND。
3. 公端分別插入麵包板預定列。
4. 每條線貼上 `4`、`5`、`G` 標籤。
5. 板子不得懸吊在線材上，也不得讓裸露排針碰觸彼此。

### 步驟 5：確認排針與外側接線孔

ESP32 插在 `B`、`I` 欄時，不要把杜邦線硬塞到排針旁邊。請看板身絲印，
找出 GPIO4、GPIO5、GND 各自所在的「同一列」，再使用該列外側的孔：

| 板身接腳落在哪一側 | 排針所在欄 | 同列可用接線孔 |
|---|---|---|
| 左側 | B | A |
| 右側 | I | J |

例如 GPIO4 的排針若落在 `B8`，則 `A8` 就與 GPIO4 相通；若 GPIO4 落在
`I8`，則使用 `J8`。**列號只是實物位置，請依絲印找，不可照抄這個例子。**

把實際孔位填好後才接線：

| 訊號 | 板身絲印 | 外側實際孔位 |
|---|---|---|
| 按鈕輸入 | `4`／GPIO4 |  |
| 測試輸出 | `5`／GPIO5 |  |
| 地 | `G`／GND |  |

### 步驟 6：安裝按鈕

1. 再確認預定的四個孔沒有被 ESP32 或導線占用。
2. 讓按鈕跨過中央溝槽。
3. 四支腳全部對孔後，從按鈕本體正上方平均壓入。
4. 輕推按鈕；它應穩定留在板上，不應只有兩腳勉強插入。
5. 用標籤把左側稱為 `BTN-A`，右側稱為 `BTN-B`。

### 步驟 7：完成實驗接線

一次只插一條線，每插完一條就在表中打勾：

1. [ ] GPIO4 的外側同列孔 → `BTN-A` 所在列的左側五孔組。
2. [ ] GND 的外側同列孔 → 預留的 TPG 空白五孔組。
3. [ ] TPG 同一五孔組的另一孔 → `BTN-B` 所在列的右側五孔組。
4. [ ] GPIO5 的外側同列孔 → 預留的 TP5 空白五孔組。

此接法只使用板上一個 GND：TPG 是共同接地列，再從 TPG 分接到按鈕。四條
杜邦線分別是 `GPIO4→BTN-A`、`GND→TPG`、`TPG→BTN-B`、`GPIO5→TP5`。

本週的電氣關係必須是：

![Week 2 GPIO4 按鈕與 GPIO5 量測點接線圖](../../docs/images/wiring/week2_gpio4_gpio5.svg)

```text
ESP32 GPIO4 -------- 按鈕的一側
ESP32 GND  --------- 按鈕的另一側
```

另外建立兩個安全量測點，不要直接用表筆在相鄰排針間探測：

```text
ESP32 GPIO5 -------- 麵包板空白列（標記為 TP5）
ESP32 GND  --------- 麵包板另一空白列（標記為 TPG）
```

後面量電壓時，黑表筆接 TPG，紅表筆接 TP5，可降低表筆滑動造成短路的
風險。TP5 只接 GPIO5 與紅表筆，不接其他模組。

本接法在程式中使用 `INPUT_PULLUP`，不需要額外外接上拉電阻：

- 未按下：讀到 `HIGH`。
- 按下：GPIO4 被接到 GND，讀到 `LOW`。

### 步驟 8：執行上電前接線檢查

不能只看接線「像不像圖片」，必須從訊號起點沿線檢查到終點：

1. 指著板身 `4` 絲印，沿著同列孔與線走到按鈕一側。
2. 指著板身 `G`／`GND`，沿線走到 TPG，再從 TPG 走到按鈕另一側。
3. 指著板身 `5`，沿線走到標記 TP5 的獨立列。
4. 指著 GND，沿線走到標記 TPG 的另一獨立列。
5. 確認 TP5 與 TPG 不在同一個五孔導通組。
6. 確認沒有任何線接到 `5V`、`3V3` 或未使用的 GPIO。
7. 從正上方拍一張能看清板身絲印與線路終點的照片。

### 上電前接線表

| 元件 | 元件腳位 | ESP32 腳位 | 方向／用途 |
|---|---|---|---|
| 按鈕 | 一側 | GPIO4 | 數位輸入 |
| 按鈕 | 另一側 | GND | 按下時接地 |
| TP5 測試列 | 空白麵包板列 | GPIO5 | HIGH／LOW 電壓測試 |
| TPG 參考列 | 另一空白列 | GND | 黑表筆參考點 |

身邊有同學時，請同學依照上述順序和你一起檢查。獨自操作時，先依第 1 至
第 5 項檢查一次，再從第 5 項反向檢查回第 1 項。確認兩次結果一致，而且沒有
任何線接到 5V，才能插回 USB。

### 本節檢核

- [ ] ESP32 排針筆直，或已使用安全固定的公對母備用接法。
- [ ] 按鈕四腳自然插入並跨過中央溝槽。
- [ ] GPIO4 只經按鈕連到 GND。
- [ ] GPIO5 只連到 TP5。
- [ ] TPG 連到 GND，而且 TP5、TPG 不互通。
- [ ] 接線已依上述方式逐線確認；獨自操作時已完成正向與反向兩次檢查。

## 八、GPIO4 按鈕輸入與 GPIO5 測試輸出

### GPIO 與按鈕原理

- **輸入**是 GPIO 接收外部狀態；**輸出**是程式讓 GPIO 產生狀態。
- **HIGH／LOW** 是數位邏輯的兩種狀態。ESP32 的 HIGH 通常接近 3.3V、LOW
  接近 0V，但實際數值仍要用電表量測。
- **`INPUT_PULLUP`** 把 GPIO 設成輸入並啟用內部上拉電阻：按鈕未按時預設
  HIGH，按下接到 GND 時變成 LOW，因此本接法不需外加上拉電阻。
- **浮動**是輸入沒有被明確維持在 HIGH 或 LOW，可能把電氣雜訊誤認成按鈕
  動作；內部上拉可避免未按時浮動。
- **去抖（debounce）**是等待按鈕接點穩定後才接受狀態，避免機械接點一次
  按壓中的快速開合被計成很多次。

### 步驟 1：上電前確認與 USB 復電

1. 確認階段 4 的接線檢查項目已全部通過。
2. 確認沒有人握著按鈕、杜邦線或萬用電表表筆。
3. 把 USB 接回原本測試成功的 USB-to-UART 接頭。
4. 觀察數秒；若出現發熱、異味或異常聲音，立刻拔除 USB。
5. 正常時只開 Arduino IDE，不要在上電後移動任何接線。

### 步驟 2：建立按鈕測試程式

GPIO5 本週不接 LED、蜂鳴器、馬達或其他負載；本實驗直接用 Serial 與萬用
電表驗證它的輸出電壓。**負載**是從電路取得能量的裝置，例如 LED、蜂鳴器
或馬達；GPIO 不適合直接供應高電流負載。

#### 程式結構

- `const int` 建立不應改變的整數名稱，本程式用它替 GPIO4、GPIO5 命名。
- `bool` 只保存 `true`／`false`，用來表示是否按下。
- `unsigned long` 可保存非負整數，本程式用來保存 `millis()` 毫秒時間。
- `setup()` 開機後執行一次；`loop()` 之後持續重複。
- `pinMode()` 設定接腳模式，`digitalRead()` 讀取 HIGH／LOW，
  `digitalWrite()` 輸出 HIGH／LOW。
- `Serial.printf()` 把文字與變數組合成一行 log；`%s` 放文字，`%lu` 放
  `unsigned long` 數值，`\n` 表示換行。

1. 在 Arduino IDE 點 **File → Save As**。
2. 新名稱輸入 `week02_button_groupXX`，將 `XX` 改成兩位數組別。
3. 確認視窗標題已變成新名稱，避免覆蓋前一個 Serial 練習。
4. 按 **Ctrl+A** 全選舊程式，再貼上下列完整程式。
5. 把 `CHANGE_ME` 改成組別，例如第 3 組改成 `03`，保留雙引號。
6. 按 **Ctrl+S**。

```cpp
const int PIN_BUTTON = 4;
const int PIN_TEST_OUTPUT = 5;
const char *GROUP_ID = "CHANGE_ME";

bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  digitalWrite(PIN_TEST_OUTPUT, LOW);

  Serial.printf("boot: week02 group=%s button-test version=1\n", GROUP_ID);
  Serial.println("state: released output=LOW");
}

void loop() {
  bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);

    Serial.printf(
      "group=%s event=button_changed pressed=%s gpio5=%s time_ms=%lu\n",
      GROUP_ID,
      stablePressed ? "true" : "false",
      stablePressed ? "HIGH" : "LOW",
      now
    );
  }
}
```

貼上後先做人工檢查：

- [ ] `PIN_BUTTON = 4`，不是板上排針位置的數字。
- [ ] `PIN_TEST_OUTPUT = 5`。
- [ ] `GROUP_ID` 已改成自己的組別。
- [ ] 只有一組 `setup()` 與一組 `loop()`。
- [ ] 程式最後的左右大括號數量沒有因複製而缺少。

### 步驟 3：編譯、上傳與開啟 Serial Monitor

1. 先按 **Verify**。
2. Verify 成功後，再檢查一次 **Tools → Board** 與 **Tools → Port**。
3. 關閉 Serial Monitor。
4. 按 **Upload**，等待完整寫入與重設完成。
5. 開啟 Serial Monitor，設定 `115200`。
6. 按一下 RESET。
7. 第一段文字必須包含自己的組別與 `button-test version=1`。

如果 Upload 成功但仍看到前一支程式每秒輸出的 `uptime_ms`，表示目前顯示的
可能是錯誤 Port、舊程式或 Upload 未真正完成。先核對 Port 和 Upload Output，
不要改硬體接線。

### 步驟 4：執行按鈕功能測試

按下與放開時，Serial 應出現：

```text
group=03 event=button_changed pressed=true gpio5=HIGH time_ms=...
group=03 event=button_changed pressed=false gpio5=LOW time_ms=...
```

請照固定節奏操作：

1. 先放開按鈕，確認沒有持續重複事件。
2. 按下並保持約一秒，只應新增一筆 `pressed=true`。
3. 放開並等待約一秒，只應新增一筆 `pressed=false`。
4. 再慢速做兩次。
5. 若一次動作印出很多筆，不要急著增大 `DEBOUNCE_MS`；先排除接觸不良和
   按鈕插錯方向。

如果按下沒有反應：

1. 拔除 USB。
2. 檢查是否真的接到 GPIO4 與 GND。
3. 確認按鈕方向及是否跨過麵包板中央溝槽。
4. 用通斷檔確認按鈕按下時兩側導通。
5. 接回 USB，按 RESET，再看 Serial。

所有線路修正均應先拔除 USB，不得在通電狀態下移動接線。

### 步驟 5：依現象進行故障排除

| Serial 現象 | 最可能方向 | 下一個動作 |
|---|---|---|
| 一上電就顯示 `pressed=true` | GPIO4 持續接地 | 拔 USB，檢查按鈕方向及 GPIO4、GND 是否在同一導通組 |
| 按下、放開都沒有事件 | GPIO4 未經按鈕接到 GND | 拔 USB，逐線摸查，再做通斷測試 |
| 一次按壓出現很多事件 | 接點彈跳或接觸不良 | 確認按鈕完全插入，再比較去抖設定 |
| 事件正常但組別錯誤 | 程式未改或舊程式 | 修改 `GROUP_ID`、Save、Upload、RESET |
| 完全沒有 Serial 文字 | Port／baud／USB 問題 | 回到階段 3 的 Serial 排錯，不動硬體線 |

排錯前先保存畫面。凡是要碰線，一律先拔 USB。修正後重新逐線檢查；獨自
操作時，必須再做一次正向與反向檢查。

### 步驟 6：執行五次重複性測試

每次完整按下再放開，記錄：

| 次數 | 按下顯示 `true/HIGH` | 放開顯示 `false/LOW` | 備註 |
|---:|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4 |  |  |  |
| 5 |  |  |  |

五次中任何一次失敗，都先留下 log，再修正並重新計算五次。

## 九、萬用電表驗證

依課堂公布的量測站順序使用萬用電表；輪到量測前，先完成五次 Serial 測試。
量測者控制表筆，另一人負責按鈕與記錄；兩人的手不要同時伸進電路。

**萬用電表（multimeter）**是一台可選擇不同功能量測電壓、電阻等數值的
儀表；紅、黑兩條尖端量測線稱為**表筆（probe）**。本教材以教師現有的
A830L 為操作示例；若正式材料清單安排功能相當的其他型號，符號與檔位位置
可能不同，操作時仍以實物標示為準。

### A. 散裝電阻量測（斷電、電阻不接電路）

**電阻（resistor）**是限制電流或建立電壓關係的元件，單位是歐姆`Ω`。
包裝上的220Ω、1kΩ與10kΩ是**標稱值**；萬用電表量到的是這顆實物在目前
環境下的實測值。兩者不一定完全相同，但必須具有相同數量級。

#### A1. 取出並辨識三顆電阻

1. 從ESP32端拔除USB，確認電源燈熄滅，桌上沒有電池或其他電源。
2. 從有原始標籤的電阻包各取出一顆220Ω、1kΩ與10kΩ電阻。
3. 三顆分開放置，分別貼上標稱值；未確認包裝標籤時不靠外觀猜測。
4. 電阻不得插在已上電的麵包板，也不得接到ESP32。

`kΩ`表示千歐姆，因此1kΩ等於1000Ω，10kΩ等於10000Ω。

#### A2. 選擇電阻檔與確認表筆

1. 萬用電表旋鈕轉到`OFF`。
2. 黑表筆插入`COM`，紅表筆插入`VΩmA`；本週完全不使用`10A`孔。
3. 先讓兩支表筆分開，再將旋鈕切到實物電表的電阻`Ω`區。
4. 選擇大於待測標稱值的最小量程。例如200Ω檔不足以量220Ω，應選下一個
   較高量程；1kΩ與10kΩ也依相同原則選擇。
5. 若顯示`OL`或最左側固定的`1`，先確認表筆沒有接觸，再切到更高量程重測。

#### A3. 逐顆量測並記錄

1. 將電阻平放在不導電桌面，一支表筆接觸一端金屬腳，另一支表筆接觸另一端。
2. 手可壓住電阻本體的絕緣部分，不要同時用手捏住兩端金屬腳。
3. 等顯示穩定後，記錄檔位、畫面數值及換算後的歐姆值。
4. 對220Ω、1kΩ、10kΩ各量一次；每次換電阻前先讓兩表筆離開元件。
5. 若三顆讀值幾乎相同，先檢查是否選錯元件、表筆接觸不良或沒有理解目前
   量程，不要直接把標稱值抄成實測值。

| 電阻標稱值 | 使用檔位 | 電表畫面 | 換算實測值 | 標稱與實測是否同數量級 |
|---:|---|---:|---:|---|
| 220Ω |  |  |  Ω | 是／否 |
| 1kΩ |  |  |  Ω | 是／否 |
| 10kΩ |  |  |  Ω | 是／否 |

三筆都有檔位、數值及單位，而且能辨認約十倍的1kΩ與10kΩ差異，才完成本段。
量完後將三顆電阻分別放回有標示的收納位置。

### B. 通斷量測（斷電）

#### B1. 表筆安裝與斷電確認

- 電表的 **`COM`** 是共同參考插孔，接黑表筆；它不是 Windows 的 COM Port。
- **`VΩmA`** 是量電壓、電阻與小電流時使用的紅表筆插孔。本週只量電壓與
  電阻／通斷。
- **`10A`** 是大電流量測插孔，本週完全不用。

1. 從 ESP32 端拔除 USB，確認電源燈熄滅。
2. 萬用電表旋鈕先轉到 `OFF`。
3. 黑表筆插入標示 `COM` 的孔，插到底。
4. 紅表筆插入標示 `VΩmA` 的孔，**不可插在 `10A` 孔**。
5. 輕拉兩條表筆接頭，確認沒有鬆脫。
6. 確認桌上沒有外接電池或其他電源。

#### B2. 選擇通斷或 200 Ω 檔

**通斷檔**用來判斷兩點是否低阻抗相通，必須先讓待測電路斷電。`Ω` 是電阻
單位歐姆；`200 Ω` 是這次選擇的量程。畫面顯示 `OL` 或最左側的 `1`，通常
代表開路或超出量程，不是測得 1 Ω。

1. 若表上有蜂鳴器／聲波符號，選擇通斷檔。
2. 若這支 A830L 沒有蜂鳴功能，旋鈕轉到電阻區的 `200`，表示最高量測
   200 Ω 的檔位。
3. 讓紅、黑表筆金屬尖端彼此接觸：應發出聲音，或顯示接近 `0` 的小數值。
4. 把兩表筆分開：應停止蜂鳴，或顯示 `1`／`OL`／超出量程。
5. 若短接表筆仍完全無反應，先檢查檔位、插孔、電池與表筆，不要拿錯誤的
   電表結果判定按鈕壞掉。

#### B3. 麵包板與按鈕量測

下列每次量測，表筆各碰一個孔中的金屬接點或同列杜邦線金屬端，不能讓兩支
表筆尖端互相碰到。

1. 先量同一側同一五孔組，例如 `A27` 與 `E27`：應導通。
2. 再量中央溝槽兩側同一列，例如 `E27` 與 `F27`：應不導通。
3. 將一支表筆接 `BTN-A`，另一支接 `BTN-B`。
4. 不按按鈕時讀值：應不導通。
5. 保持表筆不滑動，請記錄者按住按鈕：應導通。
6. 放開按鈕：應再次不導通。

若第 4 步一開始就導通，先檢查表筆是否位於按鈕同一側，或按鈕是否旋轉
90 度；問題排除前不得上電。

記錄結果：

| 狀態 | 蜂鳴／顯示 | 判定 |
|---|---|---|
| 未按下 |  | 導通／不導通 |
| 按下 |  | 導通／不導通 |

### C. 直流電壓量測（上電）

**電壓**是兩點之間的電位差，不是單獨一點自帶的數字。本實驗量測 TP5 相對
TPG／GND 的電壓，所以黑表筆固定在 TPG，紅表筆才移到 TP5。

#### C1. 切換到正確檔位

- **DCV** 是直流電壓，適合量 ESP32；**ACV** 是交流電壓，本週不用。
- **DCA** 是直流電流，必須用不同的串聯接法，本週不用。
- **量程**是該檔可量測的範圍；`DCV 20` 表示可量到約 20V，不是電表會輸出
  20V。
- **hFE** 是電晶體增益測試區，本週不用。

1. 保持黑表筆在 `COM`、紅表筆在 `VΩmA`。
2. 將旋鈕從電阻／通斷轉到直流電壓區的 `DCV 20`。
3. 確認不是 `ACV 200`、`DCA 20m`、`hFE` 或 `10A`。
4. 檔位切好後才接回 USB。
5. 開啟 Serial Monitor 並確認按下、放開事件仍正常。

`DCV 20` 表示可量測到 20V 左右，適合本週約 3.3V 的訊號；它不是要把
電路設定成 20V。

#### C2. 黑表筆參考點

1. 找到貼有 `TPG` 標籤的五孔組。
2. 黑表筆只接觸 TPG，不要直接探 ESP32 密集排針。
3. 由記錄者確認 TPG 的杜邦線另一端確實回到板身 `G`／`GND`。
4. 量測過程中先保持黑表筆不移動。

#### C3. LOW 電壓量測

1. 完全放開按鈕。
2. 看 Serial 是否出現 `pressed=false gpio5=LOW`；若沒有，先按下再放開一次。
3. 紅表筆接觸 TP5 的另一個空孔。
4. 等顯示穩定後記錄數值和正負號。
5. 正常應接近 0V。若跳動很大，先確認表筆接觸與 TP5 接線。

#### C4. HIGH 電壓量測

1. 紅、黑表筆保持在 TP5、TPG。
2. 請另一人按住按鈕，不要由量測者同時按。
3. 看 Serial 是否出現 `pressed=true gpio5=HIGH`。
4. 等電表顯示穩定後記錄數值，正常應接近 3.3V。
5. 請另一人放開按鈕，確認電壓回到接近 0V。
6. 若顯示約 `-3.3V`，代表紅黑測點對調；停止並重新確認 TP5、TPG。

| GPIO5 狀態 | 預期 | 實測值 |
|---|---:|---:|
| LOW | 接近 0V |  V |
| HIGH | 接近 3.3V |  V |

不要把萬用電表切到電流檔。本週不量電流。

#### C5. 量測結束與儀表復原

1. 先把紅表筆移離 TP5，再移開黑表筆。
2. 拔除 ESP32 USB。
3. 萬用電表旋鈕轉回 `OFF`。
4. 表筆整理好後交給下一組。
5. 將實測值連同單位 `V` 寫入表格，不可只寫 HIGH／LOW。

### 本節檢核

- [ ] 按鈕通斷結果符合實際狀態。
- [ ] 220Ω、1kΩ及10kΩ都有檔位、實測值與單位。
- [ ] GPIO5 LOW 與 HIGH 的量測值不同且合理。
- [ ] 實驗紀錄已記錄黑表筆接 GND 的原因。
- [ ] 實驗紀錄已記錄為何程式顯示 HIGH 仍要實際量測。

## 十、基本練習

每位組員均須參與程式修改、上傳或測試。

### 基本練習：加入組別與按壓次數

修改程式，使每次按下時輸出：

```text
group=03 event=button_pressed count=1
group=03 event=button_pressed count=2
```

只有「按下」增加次數，放開不增加。Reset 後從 0 重新計算。

本練習新增的**變數**是有名稱、可保存及改變的資料。`pressCount` 使用
`unsigned long` 保存非負計數；`if (stablePressed)` 表示只有條件成立才執行
大括號內容；`pressCount++` 表示把原值增加 1。

依下列位置逐項修改，不得同時改動其他程式區塊：

1. 點 **File → Save As**，另存為 `week02_count_groupXX`。
2. 找到 `const unsigned long DEBOUNCE_MS = 30;`。
3. 在它的下一行新增：

```cpp
unsigned long pressCount = 0;
```

這一行必須放在 `setup()` 外面，讓 `loop()` 每次執行都保留原本數值。

4. 在 `loop()` 內找到這一行：

```cpp
digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);
```

5. 在它的下一行、原本 `Serial.printf(` 的上一行插入：

```cpp
if (stablePressed) {
  pressCount++;
  Serial.printf(
    "group=%s event=button_pressed count=%lu\n",
    GROUP_ID,
    pressCount
  );
}
```

6. 按 **Ctrl+S → Verify → Upload**。
7. 開啟 115200 Serial Monitor，按 RESET。
8. 完整按下再放開三次。
9. 必須依序看到 `count=1`、`count=2`、`count=3`；放開事件之間不能增加
   count。
10. 再按 RESET，第一次按下必須重新顯示 `count=1`。

如果 Compile 出錯：

- `pressCount was not declared`：變數可能被放進錯誤函式或名稱拼錯。
- `expected '}'`：新增的 `if` 區塊少了一個右大括號。
- `expected ')'`：檢查 `Serial.printf` 的右括號及分號。
- Compile 成功但每次加兩次：確認增加程式只在 `if (stablePressed)` 中出現
  一次，而且不是放在每次 `loop()` 都執行的位置。

#### 完整參考程式

```cpp
const int PIN_BUTTON = 4;
const int PIN_TEST_OUTPUT = 5;
const char *GROUP_ID = "CHANGE_ME";

bool stablePressed = false;
bool lastRawPressed = false;
unsigned long changedAtMs = 0;
const unsigned long DEBOUNCE_MS = 30;
unsigned long pressCount = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_TEST_OUTPUT, OUTPUT);
  digitalWrite(PIN_TEST_OUTPUT, LOW);

  Serial.printf("boot: week02 group=%s button-count version=1\n", GROUP_ID);
  Serial.println("state: released output=LOW count=0");
}

void loop() {
  bool rawPressed = digitalRead(PIN_BUTTON) == LOW;
  unsigned long now = millis();

  if (rawPressed != lastRawPressed) {
    lastRawPressed = rawPressed;
    changedAtMs = now;
  }

  if (now - changedAtMs >= DEBOUNCE_MS && rawPressed != stablePressed) {
    stablePressed = rawPressed;
    digitalWrite(PIN_TEST_OUTPUT, stablePressed ? HIGH : LOW);

    if (stablePressed) {
      pressCount++;
      Serial.printf(
        "group=%s event=button_pressed count=%lu\n",
        GROUP_ID,
        pressCount
      );
    }

    Serial.printf(
      "group=%s event=button_changed pressed=%s gpio5=%s time_ms=%lu\n",
      GROUP_ID,
      stablePressed ? "true" : "false",
      stablePressed ? "HIGH" : "LOW",
      now
    );
  }
}
```

核對時仍要把 `CHANGE_ME` 換成自己的組別。

完成必要練習後，可使用[Week 2支援資料](week2_support.md#五延伸實作)
選做延伸實作；故障現象與安全排查表也集中在支援資料。

## 十一、實驗紀錄與繳交內容

建立 Week 2 實驗紀錄（Lab Notebook），至少包含：

1. Arduino IDE board、port 與 ESP32 package 版本。
2. `version=2` 的第一次 Serial log。
3. GPIO4 按鈕與 GPIO5 測試輸出的接線表。
4. 接線清楚照片。
5. 五次按壓測試表。
6. 220Ω、1kΩ、10kΩ、通斷、GPIO5 LOW及HIGH的量測值。
7. 修改後的完整程式。
8. 基本練習的按壓計數；若完成選做延伸，再附上對應的 log／量測／測試表。
9. 一項遇到的問題、證據、修改與結果。

不得只交「成功」兩個字，也不能只交沒有接腳標示的照片。

## 十二、完成檢核與器材復原

完成下列項目後，由教師或助教逐項檢查：

- [ ] 每個工作站能選擇正確 Board 與 Port 並完成上傳。
- [ ] Serial log 有組別、版本、按鈕事件與按壓計數。
- [ ] GPIO4、GPIO5 與 GND 接線表正確。
- [ ] 按鈕連續五次測試通過。
- [ ] 三種散裝電阻、通斷及直流電壓量測都有檔位、測試點、單位與實測值。
- [ ] 基本練習的按壓計數可重複驗證，並保存預期、實際結果及修改證據。
- [ ] 程式、實驗紀錄與證據已保存／提交。
- [ ] USB 已拔除，零件數量確認，桌面與線材已復原。

全部通過後，可依課程規定提前離開。未保存證據、未斷電或未完成收納
者，不列為完成。
