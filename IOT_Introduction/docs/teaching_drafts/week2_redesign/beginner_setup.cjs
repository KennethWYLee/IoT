module.exports = function({page, photo, reference, escape, hello, svg, marker, block, arrow}) {
  const source = (url, label) => `<p class="sources">操作依據與畫面來源：<a href="${url}">${label}</a>。圖片未修改；版本差異見圖說。</p>`;
  const espPage = 'https://developer.espressif.com/blog/2025/10/arduino-get-started/';
  const arduinoBase = 'https://docs.arduino.cc/software/ide-v2/tutorials/';
  const shot = (file, height, caption) => `<figure class="diagram"><img class="reference" style="height:${height}mm" src="${reference(file)}" alt="${caption}"/><figcaption>${caption}</figcaption></figure>`;
  return [
page(6,'從頭開始 · 安裝軟體','先安裝 Arduino IDE','它是電腦上的軟體：我們用它寫程式，再把程式放進 ESP32。',`
  <p>以下以 <b>Windows 11／Arduino IDE 2</b> 操作。板子先不用插 USB，也不接杜邦線；這一步只操作電腦。</p>
  <ol class="steps compact"><li>打開瀏覽器，進入 <a href="https://www.arduino.cc/en/software/">Arduino 官方下載頁</a>。</li><li>找 <b>Arduino IDE 2</b>，選 Windows 64-bit 的 <b>.exe 安裝檔</b>。不要選網頁版 Cloud Editor。</li><li>下載完成後，開啟電腦的「下載」資料夾，連按兩下剛下載的 .exe。</li><li>閱讀授權後，願意接受才按 <b>I Agree</b>。個人電腦可選 <b>Only for me</b>，再按 Next、Install。</li><li>等安裝完成，勾選 <b>Run Arduino IDE</b>，按 Finish。已安裝 IDE 2 的同學直接從開始選單打開。</li></ol>
  ${shot('arduino-install.png',75,'Arduino 官方安裝流程總覽，使用早期 IDE 2 畫面。實際版本號、使用者名稱與路徑不必相同；以目前安裝程式文字為準。')}
  <p class="question"><b>做完應看到：</b>Arduino IDE 的程式編輯視窗。第一次開啟可能還在下載必要工具，等它完成。</p>
  <aside class="safety">學校電腦若沒有安裝權限，先一起處理，不繞過管理限制。本講義不要求雲端帳號，也不需要付費方案。</aside>
  <p class="next">下一頁：在軟體裡加入 ESP32 的安裝來源。</p>
  ${source(arduinoBase+'getting-started/ide-v2-downloading-and-installing/','Arduino 安裝說明')}
`),
page(7,'從頭開始 · 加入安裝來源','告訴軟體去哪裡找 ESP32 支援','剛裝好的 Arduino IDE，還需要知道如何處理我們這種板子。',`
  <ol class="steps compact"><li>在視窗上方點 <b>File（檔案）→ Preferences（偏好設定）</b>。</li><li>找到 <b>Additional boards manager URLs</b> 欄位。可以點右側按鈕開啟清單。</li><li>貼上下面這個網址。若原本已有其他網址，保留它，另加一行；不要覆蓋別人的設定。</li></ol>
  <p class="urlbox"><a href="https://espressif.github.io/arduino-esp32/package_esp32_index.json">https://espressif.github.io/arduino-esp32/package_esp32_index.json</a></p>
  ${shot('esp-preferences.webp',105,'Espressif 官方偏好設定畫面。只找框出的 Additional boards manager URLs；不要照抄圖中個人路徑、主題或其他設定。')}
  <p>按 <b>OK</b> 關閉網址清單，再按偏好設定視窗的 <b>OK</b>。</p>
  <p class="question"><b>做完應確認：</b>重新開啟 Preferences，剛貼上的網址還在。網址中是 <b>package_esp32_index.json</b>，沒有 <b>dev</b>。</p>
  <p class="next">下一頁：下載並安裝 ESP32 的支援工具。</p>
  ${source(espPage,'Espressif 安裝教學')}
`),
page(8,'從頭開始 · 安裝 ESP32 支援','找到 esp32 by Espressif Systems','這一步把處理 ESP32 程式需要的工具裝進電腦。',`
  <ol class="steps compact"><li>點上方 <b>Tools（工具）→ Board（開發板）→ Boards Manager（開發板管理員）</b>。</li><li>在搜尋欄輸入 <b>esp32</b>。找到作者是 <b>Espressif Systems</b> 的那一項。</li><li>打開該項的版本選單，選 <b>3.3.11</b>，按 <b>INSTALL</b>，等下載與安裝完成。</li></ol>
  ${shot('esp-install.webp',110,'Espressif 官方管理員畫面：本課要下面的 esp32 by Espressif Systems，不是上面的 Arduino ESP32 Boards。')}
  <aside class="note"><b>不要照抄圖片的版本與板名。</b>圖中是舊版 3.3.1；本課選 3.3.11。上方 ESP32 Dev Module 也不是本課稍後要選的 ESP32S3 Dev Module。</aside>
  <p class="question"><b>做完應看到：</b>這一項顯示 <b>3.3.11 installed</b> 或已安裝狀態。先確認不是仍在下載，再關閉並重新打開 Arduino IDE。</p>
  <p class="next">下一頁：現在才把開發板接到電腦。</p>
  ${source(espPage,'Espressif 開發板管理員教學')}
`),
page(9,'從頭開始 · 插 USB','把 ESP32 接到電腦','使用可以傳資料的 USB 線；有些線只能充電，不能傳程式。',`
  <figure class="diagram"><img class="reference" style="height:88mm" src="${photo('ESP32S3_2.png')}" alt="YD-ESP32-S3 Type-A V1.5 背面，左邊有 COM 與 USB 兩個接頭標示"/><figcaption>這是課堂板子的背面照片。本頁照片的 USB 接頭在左側；找印字 COM 對應的接頭，不靠正反面翻轉後的上下位置猜。</figcaption></figure>
  <ol class="steps"><li>板子沒有杜邦線、按鈕、電池或其他模組。把板子翻過來，找到印字 <b>COM</b> 的接頭。</li><li>先看電腦軟體的 <b>Tools → Port</b> 清單。Port 是電腦用來識別連接裝置的通訊埠；現在沒有清單也沒關係。</li><li>把 USB 線一端插電腦，另一端插板子的 <b>COM</b> 接頭。先只接這一塊板。</li><li>把板子正面朝上放回乾燥、不導電的桌面，等 Windows 辨識，再重開 <b>Tools → Port</b>。</li></ol>
  <p><b>記下新增的名稱：</b>COM________。例如 COM8 只是某次電腦分配的號碼，不是全班都選 COM8。</p>
  <aside class="note">板背的 <b>COM</b> 是接頭標示；電腦上的 <b>COM8</b> 之類是軟體名稱。PWR 燈亮只表示板上有供電，還不能證明資料線或程式傳輸正常。</aside>
  <p class="next">下一頁：選板型與剛才新增的 Port。若沒有新增 Port，先看第 33 頁，不先亂選。</p>
`),
page(10,'從頭開始 · 選板子與連接','選 ESP32S3 Dev Module','這個選單告訴軟體「程式要給哪一種板子」。另一個 Port 選單則指定連哪一塊。',`
  ${shot('arduino-select.png',85,'Arduino 官方選單截圖，為 macOS／其他板型示例。只看下方 Select other board and port 的入口；不選圖中的 UNO、Nano 或 Bluetooth。')}
  <ol class="steps"><li>點頂端的開發板下拉選單，再點 <b>Select other board and port…</b>（選擇其他開發板與連接埠）。</li><li>在 <b>Boards</b> 搜尋欄輸入 <b>ESP32S3 Dev Module</b>，點選完全相同的名稱。留意中間有 <b>S3</b>。</li><li>在 <b>Ports</b> 清單，選第 9 頁剛記下的 COM 號碼，再按 <b>OK</b>。</li></ol>
  <table><thead><tr><th>你現在選的是</th><th>應該是什麼</th></tr></thead><tbody><tr><td>Board（板型）</td><td>ESP32S3 Dev Module</td></tr><tr><td>Port（連接埠）</td><td>我的 COM________，不是老師的固定號碼</td></tr></tbody></table>
  <p>清單若只寫 <b>Unknown</b>，不代表板子壞了；仍可手動選板型。若完全找不到 ESP32S3 Dev Module，回第 8 頁檢查安裝是否完成。</p>
  <p class="next">下一頁：跟著選好這塊 N16R8 板子需要的選項。</p>
  ${source('https://support.arduino.cc/hc/en-us/articles/4406856349970-Select-board-and-port-in-Arduino-IDE','Arduino 板型與 Port 說明；圖見 Arduino 上傳教學')}
`),
page(11,'從頭開始 · 跟著選設定','在 Tools 選單照表選一次','設定就是在選單裡選項目。這頁先照著操作，還不用理解每個英文名稱。',`
  <p>先確認第 10 頁已選 <b>ESP32S3 Dev Module</b>，再點上方 <b>Tools（工具）</b>。每選完一項，重新打開 Tools 選下一項。</p>
  <table class="settings"><thead><tr><th>在 Tools 找這個名稱</th><th>選右邊這個值</th></tr></thead><tbody>
    <tr><td>Upload Speed</td><td>115200</td></tr><tr><td>USB Mode</td><td>Hardware CDC and JTAG</td></tr><tr><td>USB CDC On Boot</td><td>Disabled</td></tr><tr><td>Upload Mode</td><td>UART0 / Hardware CDC</td></tr><tr><td>Flash Mode</td><td>QIO 80MHz</td></tr><tr><td>Flash Size</td><td>16MB (128Mb)</td></tr><tr><td>Partition Scheme</td><td>16M Flash (3MB APP/9.9MB FATFS)</td></tr><tr><td>PSRAM</td><td>OPI PSRAM</td></tr><tr><td>Erase All Flash Before Sketch Upload</td><td>Disabled</td></tr>
  </tbody></table>
  <p><b>其他項目先不改。</b>這張表只對應本講義照片中的 <b>YD-ESP32-S3 Type-A V1.5／N16R8</b>，以及 <b>esp32 3.3.11</b>。</p>
  <p class="question"><b>一起核對：</b>重開 Tools，依序對照表格。找不到選項時，先核對板型和安裝版本，不隨便挑名字相近的項目。</p>
  <aside class="note">這裡的 115200 是「把程式傳進板子」的速度。稍後訊息視窗也會用到 115200，但那是另一個設定，兩處都要各自選。</aside>
  <p class="next">下一頁：第一次上傳程式，先讓板子只做一件事：傳回 Hello。</p>
  ${source('https://docs.espressif.com/projects/arduino-esp32/en/latest/guides/tools_menu.html','Espressif Tools 選單；選項文字另核對本機 3.3.11')}
`),
page(12,'從頭開始 · 第一次上傳','把 Hello 程式放進 ESP32','「上傳」就是從電腦經 USB，把程式傳進板子；不是傳到網路。',`
  <ol class="steps compact"><li>點 <b>File → New Sketch</b>（檔案 → 新增草稿），開一份新的程式，依第 10–11 頁核對板型、Port 與選項。</li><li>在中間白色或黑色的程式編輯區點一下，按 <b>Ctrl+A</b> 全選，整段換成下面內容。</li><li>按 <b>Ctrl+S</b>，命名為 <b>hello_first</b>。仍只接 USB，不接杜邦線。</li></ol>
  <pre>${escape(hello)}</pre>
  ${shot('arduino-upload.png',60,'Arduino 官方工具列截圖。左上方勾勾是 Verify；右箭頭是 Upload。圖中 UNO 不是本課板型，本課仍選 ESP32S3 Dev Module。')}
  <p>按左上方<b>右箭頭 Upload</b>，先等程式檢查，再等傳輸；中途不拔 USB。若跳出另存視窗，先完成儲存。</p>
  <p class="question"><b>做完應看到：</b>IDE 顯示 <b>Done uploading</b> 或上傳完成。只有「編譯成功」不等於已傳進板子。錯誤時看第 33 頁。</p>
  <p class="next">下一頁：打開訊息視窗，看板子有沒有送回 Hello。</p>
  ${source(arduinoBase+'getting-started/ide-v2-uploading-a-sketch/','Arduino 上傳教學')}
`),
page(13,'從頭開始 · 看板子回話','打開序列監控視窗，看 Hello','Serial Monitor（序列監控視窗）就是顯示板子傳回文字的地方。',`
  <ol class="steps compact"><li>USB 保持插著。點 <b>Tools → Serial Monitor</b>（工具 → 序列監控視窗）；或點右上方對應圖示。</li><li>在下方訊息區找到 <b>baud</b> 速度選單，選 <b>115200</b>。不要照圖片選 9600。</li><li>看下方的 <b>Serial Monitor</b> 分頁，不是旁邊顯示編譯訊息的 <b>Output</b> 分頁。</li></ol>
  ${shot('arduino-monitor.png',72,'Arduino 官方示例只用來辨認右上入口與下方訊息區。本課是 ESP32S3、115200、文字 Hello；不是圖中的 UNO／9600／Hello World。')}
  <h2>預期每隔約一秒多一行</h2><pre>Hello\nHello\nHello</pre>
  <p>這是程式的預期示例，不是本次實測紀錄。看到連續三行後，先不接按鈕，確認全班都找到訊息區。</p>
  <p class="question"><b>再試一次：</b>關閉 Serial Monitor 分頁，把程式的 <code>"Hello"</code> 改成 <code>"Hi"</code>，儲存並再按 Upload。重新開啟訊息視窗後，應改成 Hi。</p>
  <p class="next">下一頁：先用剛才的結果，解釋電腦與板子各做了什麼。</p>
  ${source(arduinoBase+'ide-v2-serial-monitor/','Arduino Serial Monitor 教學')}
`),
page(14,'做完再講 · 第一個結果','剛才 Hello 是誰送出來的？','先分清楚「把程式傳進去」和「把執行結果傳回來」。',`
  <figure class="diagram">${svg(marker+block(15,25,195,62,'電腦上的程式')+arrow(210,56,382,56)+block(388,25,240,62,'ESP32 保存程式')+block(388,159,240,62,'ESP32 執行程式')+arrow(388,190,220,190)+block(15,159,195,62,'電腦顯示 Hello'),250)}<figcaption>上排：按 Upload 後，程式經 USB 傳進板子。下排：板子執行後，把文字經 USB 傳回電腦。這是資訊流，不是電源接線圖。</figcaption></figure>
  <table><thead><tr><th>剛才看到的程式</th><th>先用這句話理解</th></tr></thead><tbody><tr><td><code>setup()</code></td><td>板子開始執行時，先做一次準備。</td></tr><tr><td><code>Serial.begin(115200)</code></td><td>準備傳文字，速度用 115200；訊息視窗也要選相同值。</td></tr><tr><td><code>loop()</code></td><td>裡面的動作會反覆做。</td></tr><tr><td><code>Serial.println("Hello")</code></td><td>送出 Hello，然後換行。</td></tr><tr><td><code>delay(1000)</code></td><td>等約 1000 毫秒，也就是 1 秒。</td></tr></tbody></table>
  <p class="question"><b>先猜，再看：</b>把現在的 Hi 改成 Bye，只儲存、不按 Upload。訊息區會繼續顯示 Hi，還是變成 Bye？觀察後說明理由。</p>
  <p>這個小實驗沒有使用 Wi-Fi，也沒有連雲端。Arduino IDE 是電腦上的工具；真正重複送出文字的是 ESP32。</p>
  <p class="next">下一頁：現在才換成按鈕程式，然後拔掉 USB，一條線一條線接。</p>
`)
  ];
};
