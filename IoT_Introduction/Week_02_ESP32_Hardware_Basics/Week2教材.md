# Week2 教材：ESP32-S3 第一次完整操作

本教材由全班共同開啟並依序操作。不要跳步；每一階段完成後，先讓同組成員
互相確認，再進入下一階段。

全班依階段與檢查點同步操作，再完成基礎修改及任選變化題。完成全部驗收、
斷電與收納後，可以先離開。

## 這份教材要怎麼使用

本教材刻意把「理解」和「動手」分開，不要求任何人一邊念、一邊接線。

1. 先完成「Part A：先閱讀的觀念教材」。此時硬體留在桌上，不插 USB、
   不接杜邦線。
2. 進入「Part B：逐步操作」後，每次只閱讀一張操作卡。
3. 讀完操作卡的所有步驟，再開始動手；做完才回到教材看成功判斷。
4. 若結果不同，直接查看同一張卡下面的排錯，不要同時改很多設定。
5. 每個檢查點通過後再繼續。快速完成者做變化題，不必等待其他組。

建議開兩個視窗：左邊顯示本教材，右邊開 Arduino IDE。不要把教材、IDE、
Serial Monitor 疊在同一個小視窗中反覆切換。

## 文件導覽

- Part A：ESP32、程式流程、USB、電壓、GPIO、麵包板與萬用電表觀念。
- Part B：從接上 USB 到按鈕、GPIO5 與萬用電表的完整實作。
- Part C：必要修改、九種變化題、故障排查、繳交與驗收。

## 一、今天會完成什麼

完成本教材後，你應該能：

1. 說出 ESP32-S3、USB、GPIO、GND、3.3V 與 5V 的用途。
2. 在 Arduino IDE 選擇正確開發板及連接埠。
3. 編譯、上傳程式並使用 Serial Monitor 查看 log。
4. 用萬用電表確認通斷與直流電壓。
5. 將按鈕接到 GPIO4，使用 `INPUT_PULLUP` 讀取狀態。
6. 使用 GPIO5 產生 HIGH／LOW，並以 Serial 與萬用電表證明結果。
7. 保存接線圖、程式、log、量測值及測試結果。

# Part A：先閱讀的觀念教材

閱讀 Part A 時不要接線。這一部分的目的，是先知道每個動作背後的原因；
稍後操作時只需依卡片做，不必在接線途中才第一次理解概念。

## A1. ESP32-S3 是什麼

ESP32-S3 是微控制器，不是縮小版的 Windows 電腦。它通常只執行一份上傳
進去的程式，透過 GPIO 接收按鈕或感測器訊號，再控制輸出或透過 Wi-Fi 傳送
資料。

下圖是本課已購買板卡的商品辨識圖。它只能協助辨識型號；接腳仍以實物絲印
與 Espressif 官方文件為準。

![本課使用的 ESP32-S3 DevKitC-1 N16R8](../../docs/images/hardware/esp32-s3-devkitc-1-n16r8-product-page.png)

這塊開發板可以分成三個層次：

| 層次 | 你看到的東西 | 用途 |
|---|---|---|
| 模組 | 金屬屏蔽罩上的 ESP32-S3-WROOM 字樣 | 包含 ESP32-S3、Flash、PSRAM 與天線 |
| 開發板 | USB、按鈕、穩壓、USB-to-UART、排針 | 讓模組容易供電、上傳與接線 |
| 外部電路 | 麵包板、按鈕、感測器、致動器 | 讓程式和真實世界互動 |

本批購買規格標示 `N16R8`：`N16` 表示 16 MB Flash，`R8` 表示 8 MB PSRAM。
依 Espressif Arduino-ESP32 文件，WROOM-1 N16R8 的 Flash Mode 為 QSPI，
PSRAM 為 OPI。Flash 用來保存程式及檔案；PSRAM 是執行時可使用的額外記憶體。

本週不會使用 Wi-Fi、感測器或馬達。先把「能安全上傳、讀一個輸入、產生
一個輸出、用證據驗證」建立好，後面所有 IoT 實作都建立在這條基礎上。

## A2. 程式如何進入 ESP32

Arduino IDE 的流程不是只有按一個箭頭：

```text
撰寫 Sketch
    ↓
Verify／Compile：檢查語法並建立韌體
    ↓
選 Board：告訴工具要為哪一類晶片編譯
    ↓
選 Port：告訴工具要傳到哪一個實體裝置
    ↓
Upload：把韌體寫入 Flash
    ↓
ESP32 Reset 並開始執行
    ↓
Serial Monitor 顯示程式輸出的 log
```

常見誤解：

- Verify 成功只表示程式可以編譯，不代表已經寫進板子。
- Upload 成功只表示寫入完成，不代表接線或功能一定正確。
- Serial 出現文字仍可能是上一版程式，因此本教材要求修改版本字串再驗證。
- Port 是電腦作業系統分配的，換 USB 孔或換電腦後可能改變。

Arduino Sketch 的兩個入口：

```cpp
void setup() {
  // 每次開機或 Reset 後只執行一次
}

void loop() {
  // setup 完成後持續重複執行
}
```

如果初始化 GPIO、Serial 的程式放錯位置，結果可能和預期不同。例如遺漏
`Serial.begin()`，Serial Monitor 就無法正常顯示你的 log。

## A3. USB 線同時負責什麼

USB 在本週負責兩件不同的事：

1. **供電**：電腦透過 USB 讓開發板上電。
2. **資料**：電腦透過 USB 上傳程式與接收 Serial。

充電線只有供電線芯，可能讓電源燈亮起，卻沒有資料線芯，所以不會出現
Port，也無法 Upload。看到燈亮不能證明線材可傳資料。

DevKitC-1 有 USB-to-UART 與 ESP32-S3 原生 USB 兩條可能路徑。為了讓全班
設定一致，本週使用教師在實物上標記的 USB-to-UART 接頭。若未來改用原生
USB，USB CDC、Upload Mode 與 Serial 行為也要一起調整，不能只換插孔。

## A4. 電壓、電流、GND 與邏輯準位

### 電壓

電壓一定是兩點之間的差。說「這裡是 3.3V」時，通常是指這個測試點相對
GND 約為 3.3V。因此量電壓時，黑表筆接 GND，紅表筆接目標測試點。

### 電流

電流表示電荷流動量。GPIO 可以輸出邏輯訊號，但不能被當成馬達、舵機或
其他高耗電負載的電源。負載曾經動過，不代表接法安全。

### GND

GND 是共同參考。GPIO5 的 HIGH 是「GPIO5 相對 GND 約為 3.3V」。如果兩個
裝置交換訊號卻沒有共同參考，接收方可能無法正確判斷 HIGH 與 LOW。

### HIGH 與 LOW

本週用萬用電表觀察：

| 程式狀態 | 理想邏輯 | 實際量測預期 |
|---|---|---|
| `digitalWrite(5, LOW)` | 0 | 接近 0V |
| `digitalWrite(5, HIGH)` | 1 | 接近 3.3V |

「接近」表示實測不必剛好等於理想數字；線材、電表與供電都會造成小差異。
但若 HIGH 和 LOW 幾乎相同，就必須排查程式版本、接腳、表筆及檔位。

### 5V 安全底線

ESP32-S3 GPIO 使用 3.3V 邏輯。本週絕不把 5V 直接接到 GPIO4 或 GPIO5。
板上的 5V pin 是供電路徑，不是「更強的 HIGH」。

## A5. GPIO 輸入、輸出與 INPUT_PULLUP

GPIO 可以在程式中設定成輸入或輸出：

```cpp
pinMode(4, INPUT_PULLUP);  // GPIO4 讀取按鈕
pinMode(5, OUTPUT);        // GPIO5 產生 HIGH／LOW
```

輸入腳如果沒有接到明確的 HIGH 或 LOW，可能浮動並隨雜訊變化。`INPUT_PULLUP`
會啟用晶片內部上拉，使未按下時維持 HIGH；按下按鈕後，GPIO4 接到 GND，
所以讀到 LOW。

```text
未按下
內部 3.3V --[上拉]-- GPIO4      按鈕斷開      GND
                       ↓
                     HIGH

按下
內部 3.3V --[上拉]-- GPIO4 ----- 按鈕閉合 ----- GND
                       ↓
                      LOW
```

真值表：

| 實際動作 | `digitalRead(4)` | 程式中的 `pressed` |
|---|---|---|
| 未按下 | HIGH | false |
| 按下 | LOW | true |

所以「按下讀到 LOW」是這種接法的正常結果，不是程式寫反。

## A6. 為什麼按鈕要去抖

金屬接點按下或放開時，不一定只乾淨切換一次，可能在極短時間內反覆接通與
斷開。人只按一次，程式卻可能讀到多次事件，這叫做 bounce。

本教材的程式會等 raw 狀態維持一小段時間後，才更新 stable 狀態：

```text
raw reading 變化
    ↓
記錄變化時間
    ↓
維持超過 DEBOUNCE_MS？
    ├─ 否：繼續觀察
    └─ 是：更新 stable state 並產生一次事件
```

去抖不是把反應做得越慢越好。設定太短可能仍重複計數；設定太長則會讓快速
按壓被忽略。後面的變化題會要求用實測比較。

## A7. 麵包板和四腳按鈕

麵包板表面有很多孔，但不是每個孔都獨立。中央區通常每五個孔為一組相通，
中央溝槽左右不相通。不同品牌電源軌可能中間斷開，因此必須用通斷檔驗證。

```text
左側五孔同組       中央溝槽       右側五孔同組
A B C D E             ||             F G H I J
● ● ● ● ●             ||             ● ● ● ● ●
```

四腳按鈕內部通常是同側兩腳相通，按下後才連接兩側：

```text
A1 ----- A2
 |       |
 | 按鈕  |
B1 ----- B2

未按下：A 側和 B 側分離
按下：A 側和 B 側導通
```

把按鈕跨過麵包板中央溝槽，可以讓按鈕兩側落在原本不相通的區域。方向放錯
時，程式可能永遠判定按下或永遠沒有反應。

## A8. 萬用電表本週只用兩個功能

### 通斷檔

- 電路必須斷電。
- 用來確認兩點是否電氣連通。
- 可檢查按鈕、麵包板內部與杜邦線。

### 直流電壓檔

- 電路需要上電。
- 黑表筆接 GND，紅表筆接測試點。
- 量程要高於預期的 3.3V。

本週不使用電流檔。電流量測需要把電表串入電路，接法和量電壓完全不同；
錯誤操作可能造成短路或燒斷電表保險絲。

## A9. 什麼才算成功

「我剛才看過它動」不是可再次檢查的證據。本週每個功能至少要有：

| 類型 | 證據 |
|---|---|
| 軟體 | 程式版本、Verify／Upload 結果 |
| 執行 | 含組別、事件與時間的 Serial log |
| 硬體 | 接線表與清楚照片 |
| 電氣 | 通斷及 HIGH／LOW 電壓量測 |
| 可靠性 | 五次重複測試與一次修改紀錄 |

完成 Part A 後，才拿出杜邦線並開始 Part B。

# Part B：逐步操作

## Part B 操作卡總覽

Part B 不需要從頭重念 Part A。每張卡先完整讀完，再動手，最後只檢查「通過
條件」。如果沒有通過，就留在該卡排錯。

| 操作卡 | 開始狀態 | 要完成的事 | 通過條件 |
|---:|---|---|---|
| 1 | 板子未接 USB | 環境與實物辨識 | 找到 USB、BOOT、RESET、GPIO4、GPIO5、GND |
| 2 | 只接 USB | 設定 Board 與 Port | IDE 顯示正確 Board、Port 與 N16R8 設定 |
| 3 | 只接 USB | Upload 與 Serial | log 顯示自己的組別及 `version=2` |
| 4 | USB 已拔除 | 麵包板、按鈕、TP5、TPG 接線 | 跨組或同組第二人逐線確認 |
| 5 | 接線已確認 | GPIO4 輸入與 GPIO5 輸出 | 五次按下／放開事件完全對應 |
| 6 | 量測站 | 通斷及電壓 | 通斷合理，TP5 LOW／HIGH 可分辨 |
| 7 | 核心任務完成 | 修改與變化 | 按壓計數與至少一題變化有證據 |

動手操作時若需要回看，只回到目前的操作卡，不要同時跳看三個章節。

## 二、準備器材與分組

每組使用：

- ESP32-S3-DevKitC-1 N16R8，排針向下 44 腳。
- 一條確認可傳輸資料的 USB 線。
- 400 孔麵包板。
- 6×6 mm 四腳按鈕一顆。
- 公對公杜邦線至少兩條。
- 筆電與充電器。

全班共用一支 A830L 萬用電表，各組依序到量測站操作。SG90、MG90S、
TT 馬達、L298N、LM2596、電池盒及其他高耗電設備本週不使用。

上課前請確認[Week 2 必買／必帶清單](week02_purchase_list.md)。依目前三組
工作站配置，本週不需再購買電子零件。

## 三、開始前的安全規則

1. **接線或改線前，先拔除 USB。**
2. 不把 5V 接到任何 GPIO。
3. GPIO 是訊號腳，不用來直接供電給舵機或馬達。
4. 不確定接腳時，先看板身絲印與官方 pinout，不憑記憶猜測。
5. 上電前必須由另一位組員依接線表逐條檢查。
6. 發現板子、線材或零件發熱、異味或異常聲音，立即斷電並通知教師。

本次使用 GPIO4 與 GPIO5。Espressif 官方 DevKitC-1 header table 將兩者列為
一般 I/O。本批板卡標示 N16R8；為避免記憶體配置差異，本課不使用 GPIO35、
GPIO36、GPIO37。官方文件指出部分 Octal flash／PSRAM 版本會把這些腳位用於
內部通訊。

板載 RGB LED 不列入本週必要任務。DevKitC-1 初版與 v1.1 的 RGB LED 分別
可能使用 GPIO48 或 GPIO38，未確認板本版本前，不把網路上的 LED 腳位直接
套用到實物。

官方參考：[ESP32-S3-DevKitC-1 v1.1 使用指南](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html)

## 四、階段 1：環境與板子辨識

### 步驟 1：開啟課前安裝成果

確認下列項目：

- [ ] Arduino IDE 2 可以正常開啟。
- [ ] Boards Manager 顯示 Espressif `esp32` platform 已安裝。
- [ ] 已取得最新版課程 repository。
- [ ] USB 線已知具有資料傳輸功能。

若任何一項未完成，立刻進入環境排錯區，不要讓其他組員代替你的個人環境
驗收。課前安裝方式見[Week 2 課前環境準備](../Week_01_Course_Orientation/preclass_setup.md)。

### 步驟 2：只觀察，不接線

拿起 ESP32-S3，依板身標示找出：

- 兩個 USB 接頭及其絲印。
- BOOT 按鈕。
- RESET／RST 按鈕。
- 3V3、5V、G／GND。
- GPIO4 與 GPIO5。

官方 v1.1 header table 中，GPIO4 是 J1 第 4 腳、GPIO5 是 J1 第 5 腳；J1
第 22 腳與 J3 第 1、21、22 腳都是 GND。**實際操作請直接找板上印的 `4`、
`5`、`G`／`GND`，不要只靠數排針位置。**

在下表填寫你看到的文字，不要直接抄同學答案：

| 項目 | 板身實際標示／位置 |
|---|---|
| 開發板或模組型號 |  |
| 預計使用的 USB 接頭 |  |
| BOOT |  |
| RESET／RST |  |
| GPIO4 |  |
| GPIO5 |  |
| GND |  |

### 檢查點 1

請同組另一人指一個位置，你負責說出名稱與用途；交換角色再做一次。

## 五、階段 2：Arduino IDE、Board 與 Port

### 步驟 1：接上 USB

本週優先使用教師指定並在板子上貼標籤的 USB 接頭。使用已確認可傳資料的
線連接筆電。只接 USB，不接麵包板及其他模組。

### 步驟 2：選擇 Board 與 N16R8 設定

使用教師標記的 USB-to-UART 接頭時，先採用下列設定。Arduino-ESP32 版本
不同時，選單文字可能略有差異；若教師已在本批實物完成驗證，以教師公布
的截圖為準。

| 設定 | 本班使用值 |
|---|---|
| Board | `ESP32S3 Dev Module` |
| Flash Mode | `QIO 80MHz`，若選單分開則 Flash Mode 選 QIO |
| Flash Size | `16MB (128Mb)` |
| PSRAM | `OPI PSRAM` |
| USB CDC On Boot | `Disabled`（本週使用 USB-to-UART） |
| Upload Mode | `UART0 / Hardware CDC` |
| Upload Speed | 先用預設；不穩定時降低一級再試 |
| Partition Scheme | 選擇名稱含 `16M Flash` 的預設配置 |
| Erase All Flash Before Sketch Upload | `Disabled` |

這些設定來自本批 `WROOM-1 N16R8` 的記憶體標示與 Espressif Arduino-ESP32
工具選單說明：N16R8 使用 QSPI Flash、16 MB Flash 與 OPI PSRAM。若金屬
屏蔽罩實際不是 `WROOM-1 N16R8`，停止操作並請教師重新核對。

官方參考：[Arduino-ESP32 Tools Menu](https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html)｜[PSRAM 設定排錯](https://docs.espressif.com/projects/arduino-esp32/en/latest/troubleshooting.html)

### 步驟 3：選擇 Port

先記下拔除 ESP32 時的 port 清單，再插回去。新出現的 port 通常就是本板。
選取後把實際 port 寫下來：

```text
我的 Port：____________________
```

如果沒有新 port：

1. 先換成已知可傳資料的 USB 線。
2. 換另一個電腦 USB 接頭。
3. 關閉並重新開啟 Arduino IDE 的 port 選單。
4. 查看 Windows 裝置管理員是否出現未知裝置。
5. 保存畫面後再請教師協助，不要隨機安裝來源不明的 driver。

## 六、階段 3：第一個可辨識的程式

### 步驟 1：建立程式

新增 sketch，完整貼上以下程式：

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

把 `CHANGE_ME` 改成組別，例如 `group=03`。不要更改 baud rate。

### 步驟 2：分辨 Verify 與 Upload

1. 按 **Verify**：只編譯，確認程式語法能轉成韌體。
2. 按 **Upload**：將韌體寫入目前選擇的 port。
3. 等待 IDE 顯示上傳完成。

Verify 成功不等於 Upload 成功；Upload 成功也不等於程式功能正確。三者需要
不同證據。

### 步驟 3：查看 Serial Monitor

開啟 Serial Monitor，baud rate 選擇 `115200`。預期看到類似：

```text
boot: week02 group=03 version=1
status: uptime_ms=1000
status: uptime_ms=2000
status: uptime_ms=3000
```

若是亂碼，先檢查 baud rate。若完全沒有文字，按一次 RESET，再檢查 port、
Monitor 是否開啟及程式是否包含 `Serial.begin(115200)`。

### 步驟 4：證明不是舊程式

把 `version=1` 改成 `version=2`，再次 Upload。Serial 必須出現 `version=2`。
保存包含組別、版本與 uptime 的畫面。

### 檢查點 2

- [ ] Verify 成功。
- [ ] Upload 成功。
- [ ] Serial 顯示正確組別與 `version=2`。
- [ ] 能用自己的話說明 Verify 與 Upload 的差異。

## 七、階段 4：認識麵包板與按鈕

### 步驟 1：先拔除 USB

確認開發板完全斷電。此時才拿出麵包板、按鈕與杜邦線。

### 步驟 2：了解四腳按鈕

四腳按鈕通常是：

```text
A1 ----- A2
 |       |
 | 按鈕  |
B1 ----- B2

未按下：A 側與 B 側不通
按下：A 側與 B 側導通
```

同一側的兩腳通常原本就相通，但必須在量測站用通斷檔確認實物，不能只看
示意圖。把按鈕跨在麵包板中央溝槽，避免四腳落在錯誤的同一排導通區。

### 步驟 3：本週按鈕接線

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

### 上電前接線表

| 元件 | 元件腳位 | ESP32 腳位 | 方向／用途 |
|---|---|---|---|
| 按鈕 | 一側 | GPIO4 | 數位輸入 |
| 按鈕 | 另一側 | GND | 按下時接地 |
| TP5 測試列 | 空白麵包板列 | GPIO5 | HIGH／LOW 電壓測試 |
| TPG 參考列 | 另一空白列 | GND | 黑表筆參考點 |

請另一位組員逐線檢查，簽名後才能插回 USB：

```text
檢查者：____________________
```

## 八、階段 5：按鈕輸入與 GPIO5 輸出

### 步驟 1：上傳完整程式

GPIO5 本週不接 LED、蜂鳴器、馬達或其他負載；我們直接用 Serial 與萬用
電表驗證它的輸出電壓。

```cpp
const int PIN_BUTTON = 4;
const int PIN_TEST_OUTPUT = 5;

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

  Serial.println("boot: week02 button-test version=1");
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
      "event=button_changed pressed=%s gpio5=%s time_ms=%lu\n",
      stablePressed ? "true" : "false",
      stablePressed ? "HIGH" : "LOW",
      now
    );
  }
}
```

### 步驟 2：觀察預期結果

按下與放開時，Serial 應出現：

```text
event=button_changed pressed=true gpio5=HIGH time_ms=...
event=button_changed pressed=false gpio5=LOW time_ms=...
```

如果按下沒有反應：

1. 拔除 USB。
2. 檢查是否真的接到 GPIO4 與 GND。
3. 確認按鈕方向及是否跨過麵包板中央溝槽。
4. 用通斷檔確認按鈕按下時兩側導通。
5. 接回 USB，按 RESET，再看 Serial。

不要在通電時一邊改線一邊猜。

### 步驟 3：連續測試五次

每次完整按下再放開，記錄：

| 次數 | 按下顯示 `true/HIGH` | 放開顯示 `false/LOW` | 備註 |
|---:|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4 |  |  |  |
| 5 |  |  |  |

五次中任何一次失敗，都先留下 log，再修正並重新計算五次。

## 九、階段 6：萬用電表量測站（分組輪流）

### A. 通斷量測：必須斷電

1. 拔除 USB。
2. 黑表筆插 `COM`，紅表筆插電壓／電阻／通斷孔。
3. 選擇通斷檔。
4. 量按鈕兩側：未按下應不導通，按下應導通。

記錄結果：

| 狀態 | 蜂鳴／顯示 | 判定 |
|---|---|---|
| 未按下 |  | 導通／不導通 |
| 按下 |  | 導通／不導通 |

### B. 直流電壓量測：接回 USB

1. 選擇直流電壓檔，量程必須高於預期的 3.3V。
2. 黑表筆接 TPG，紅表筆接 TP5；TPG 已連到 GND，TP5 已連到 GPIO5。
3. 放開按鈕，程式使 GPIO5 為 LOW，記錄電壓。
4. 按住按鈕，程式使 GPIO5 為 HIGH，記錄電壓。

| GPIO5 狀態 | 預期 | 實測值 |
|---|---:|---:|
| LOW | 接近 0V |  V |
| HIGH | 接近 3.3V |  V |

不要把萬用電表切到電流檔。本週不量電流。

### 檢查點 3

- [ ] 按鈕通斷結果符合實際狀態。
- [ ] GPIO5 LOW 與 HIGH 的量測值不同且合理。
- [ ] 能說明黑表筆為何接 GND。
- [ ] 能說明程式顯示 HIGH 仍需要量測證據的原因。

# Part C：修改、變化與驗收

## 十、基礎修改與變化題庫

組員可以討論，但不能全程只由一位組員操作。先完成「必要修改」，再從
變化題庫任選至少一題。做得較快的組別可以繼續挑戰其他題，不必等待全班。

### 必要修改：加入組別與按壓次數

修改程式，使每次按下時輸出：

```text
group=03 event=button_pressed count=1
group=03 event=button_pressed count=2
```

只有「按下」增加次數，放開不增加。Reset 後從 0 重新計算。

提示：新增一個整數變數，只在狀態從放開變成按下時加一。

### 變化 1：切換模式

每次按下按鈕，GPIO5 在 HIGH 與 LOW 之間切換；放開按鈕不改變模式。

預期 log：

```text
event=mode_changed mode=ON gpio5=HIGH
event=mode_changed mode=OFF gpio5=LOW
```

提示：建立 `bool outputOn`，只在新的按下事件發生時反轉它。

### 變化 2：長按與短按

放開按鈕時，計算這次按住多久。小於門檻輸出 `short_press`，達到門檻輸出
`long_press`。

```text
event=short_press duration_ms=326
event=long_press duration_ms=1842
```

提示：按下時保存 `pressedAtMs`，放開時以目前 `millis()` 相減。不得使用
阻塞式的長時間 `delay()`。

### 變化 3：閒置提醒

一段時間都沒有按鈕事件時，輸出一次 idle 訊息；再次操作後重新計時。

```text
status=idle idle_ms=10000
```

提示：保存 `lastActivityMs`。為避免每次 loop 都重複印出 idle，再增加一個
`idleReported` 狀態。

### 變化 4：三段狀態循環

每次按下依序切換：

```text
NORMAL -> WARNING -> ALARM -> NORMAL
```

每個狀態要有不同的 GPIO5 行為或 Serial 文字，並能在 Reset 後回到 NORMAL。

提示：可以使用整數 0、1、2，也可以使用 `enum`。log 必須印出狀態名稱，
不能只印數字。

### 變化 5：比較不同去抖時間

將 `DEBOUNCE_MS` 分別設成 `0`、`10`、`30`、`100`，每種設定實際按十次，
比較程式記錄到幾次按下事件。

| 去抖設定 | 實際按下 | 程式計數 | 使用感覺／問題 |
|---:|---:|---:|---|
| 0 ms | 10 |  |  |
| 10 ms | 10 |  |  |
| 30 ms | 10 |  |  |
| 100 ms | 10 |  |  |

不要只寫哪個「最好」，要根據重複計數或反應延遲說明選擇。

### 變化 6：反應時間遊戲

Reset 後等待一段隨機時間，Serial 顯示 `GO` 才能按按鈕。記錄從 `GO` 到
按下的反應時間；提早按下則顯示 `too_early`。

```text
game=ready
game=go
game=result reaction_ms=418
```

提示：需要 WAIT、GO、RESULT 等狀態，並使用 `random()` 與 `millis()`；不可
用長時間 `delay()`，否則無法偵測提早按下。

### 變化 7：改成 JSON 格式 log

把按鈕事件改成單行 JSON，方便未來傳給 Backend：

```json
{"device_id":"group03","event":"button_changed","pressed":true,"gpio5":"HIGH","time_ms":12345}
```

每一行必須是完整的一筆資料。檢查雙引號、逗號、布林值與數字格式，不要
把所有值都變成字串。

### 變化 8：找出系統無法偵測的故障

先斷電，拔掉 GPIO4 的訊號線，再重新上電。觀察程式會把它看成什麼狀態，
回答：目前只有 `INPUT_PULLUP` 時，程式能否分辨「真的沒按」與「訊號線
脫落」？

提出一種未來可改善的硬體或軟體方法。這題不要求立刻加購或重新接線，重點
是理解「看起來正常」不一定代表線材仍完整。

### 變化 9：交換操作與隱藏錯誤

由另一位組員操作上傳及測試。接著在斷電狀態下，由教師或其他組製造一個
安全的小錯誤，例如換錯 GPIO4 那條線的位置。請依序使用接線表、通斷、
Serial 及電壓證據找出問題；一次只能改一個變因。

### 變化完成紀錄

| 選擇的變化 | 修改內容 | 預期結果 | 實際結果 | 修正 |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |

## 十一、故障排查表

| 現象 | 先檢查 | 不要立刻做什麼 |
|---|---|---|
| 沒有 Port | 資料線、USB 接頭、裝置管理員 | 隨機裝網路 driver |
| Compile 失敗 | 第一個錯誤、括號、分號、board package | 重插所有接線 |
| Upload 失敗 | Board、Port、線材、是否被其他程式占用 | 直接更換整塊板 |
| Upload 完成但無 Serial | baud rate、port、RESET、`Serial.begin` | 同時改多個設定 |
| 按鈕永遠未按 | GPIO4、GND、按鈕方向、`INPUT_PULLUP` | 帶電改線 |
| 按鈕永遠按下 | GPIO4 是否持續短接 GND | 將 5V 接入測試 |
| GPIO5 電壓不變 | 程式版本、Serial 事件、表筆位置與檔位 | 切到電流檔 |
| 板子發熱或異味 | 立即拔 USB，通知教師 | 再次上電測試 |

排錯時一次只改一個變因，保存修改前後的 log，才能知道是哪個動作解決問題。

## 十二、繳交證據

建立自己的 Week 2 Lab Notebook，至少包含：

1. Arduino IDE board、port 與 ESP32 package 版本。
2. `version=2` 的第一次 Serial log。
3. GPIO4 按鈕與 GPIO5 測試輸出的接線表。
4. 接線清楚照片。
5. 五次按壓測試表。
6. 通斷、GPIO5 LOW 及 HIGH 的量測值。
7. 修改後的完整程式。
8. 必要修改的按壓計數及至少一題變化的 log／量測／測試表。
9. 一項遇到的問題、證據、修改與結果。

不得只交「成功」兩個字，也不能只交沒有接腳標示的照片。

## 十三、提前離開驗收

完成後舉手。教師或助教會逐項檢查：

- [ ] 每組能選擇正確 board 與 port 並完成上傳。
- [ ] Serial log 有組別、版本、按鈕事件與按壓計數。
- [ ] GPIO4、GPIO5 與 GND 接線表正確。
- [ ] 按鈕連續五次測試通過。
- [ ] 通斷及直流電壓量測有檔位、測試點與實測值。
- [ ] 至少一題變化完成，包含預期、實際結果及修改證據。
- [ ] 程式、Lab Notebook 與證據已保存／提交。
- [ ] USB 已拔除，零件數量確認，桌面與線材已復原。

全部通過並簽核後，可以先離開。未保存證據、未斷電或未收納，都不算完成。
