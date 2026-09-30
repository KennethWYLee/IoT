module.exports = ({page}) => [
page(1, 'Q1 · 首次上傳', '先讓板子回傳文字', '本週完成一顆按鈕計數器。先確認程式確實進入板子，再加入按鈕。', `
<div class="goal"><b>第一個可觀察成果：</b>板子持續傳回 Hello。修改文字並重新上傳後，電腦看見新的文字。</div>
<h2>預期畫面</h2><pre>Hello\nHello\nHello</pre><p class="sources">輸出格式示意，不是本組實測紀錄。各行相隔約一秒。</p>
<h2>完成後展示</h2><ol class="steps"><li>只接 USB，展示板子持續回傳 Hello。</li><li>將文字改成 Hi，讓板子改為持續回傳 Hi。</li></ol>
<aside class="safety">使用可傳資料的 USB 線。板卡、接頭或電源條件不明時先核對；板子放在乾燥、不導電的平面。本階段不接按鈕、電池或其他模組。</aside>
<h2>Q1　只儲存、編譯，為什麼沒變？</h2><p>板子原本持續回傳 Hello。你把電腦檔案改成 Hi，儲存且編譯成功，但沒有重新上傳。視窗仍出現 Hello。這能證明修改沒存好嗎？還缺哪個動作？說明理由。</p><div class="write-space" style="height:36mm"></div>
`),
page(2, 'Q2 · 主要作品', '一顆按鈕，按一次加一', '用同一顆按鈕完成計數，電腦顯示目前次數。', `
<div class="goal"><b>作品行為：</b>重新啟動從 0 開始；每次按下只加 1，持續按住不連加。放開後再按，才增加下一次。</div>
<h2>預期反應</h2><table class="settings"><tr><th>動作</th><th>最新次數</th></tr><tr><td>放開按鈕，重新啟動</td><td>0</td></tr><tr><td>按住約兩秒</td><td>1，按住期間保持 1</td></tr><tr><td>放開約一秒，再按住</td><td>2</td></tr><tr><td>再放開約一秒，再按住</td><td>3</td></tr></table>
<pre>count=0\ncount=1\ncount=2\ncount=3</pre><p class="sources">預期格式示意，不是實測。只在啟動或次數改變時新增一行。</p>
<p><b>驗證：</b>依表慢慢操作，核對最新次數；按住時觀察是否連加。</p>
<aside class="safety">改線前斷開全部電源；通斷測試只在斷電時進行。按鈕不直接接電源正極與 GND；不以短接電源測試程式。</aside>
<h2>Q2　自己的程式如何避免按住連加？</h2><p>指出自己程式保存次數的位置，以及「什麼條件成立才加一次」。說明它如何區分持續按住與放開後再按。</p><div class="write-space" style="height:27mm"></div>
`),
page(3, 'Q3～Q4 · 完成後回答', '接點與電壓，連回自己的作品', '說明自己如何辨認按鈕接點，以及上拉電阻的用途。', `
<h2>Q3　你用了按鈕的哪兩組接點？</h2><p>依組裝前在全部斷電、按鈕與開發板分離時測到的通斷結果，畫出四腳。把放開時原本相通的腳連在一起，標出自己訊號線與 GND 線所接的兩組。若兩線誤接同一組，按下還能改變兩線間的通斷嗎？</p><div class="write-space" style="height:45mm"></div>
<h2>Q4　少了上拉，放開還有確定電壓嗎？</h2><p>以下只作紙上推理。正常電路的上拉電阻在晶片內，讓輸入接點經電阻接向 3.3 V；按鈕放開時，通往 GND（0 V）的路斷開。</p>
<figure><svg viewBox="0 0 650 100" role="img" aria-label="正常電路：3.3V經上拉電阻連到輸入接點，再經放開的按鈕連往GND"><text x="5" y="55" font-size="18">3.3 V</text><path d="M68 48H115 M225 48H405 M485 48H560" fill="none" stroke="#246f74" stroke-width="3"/><rect x="115" y="34" width="110" height="28" fill="#fff2dc" stroke="#80632d"/><text x="170" y="24" font-size="18" text-anchor="middle">上拉電阻</text><circle cx="310" cy="48" r="5" fill="#246f74"/><text x="310" y="85" font-size="18" text-anchor="middle">輸入接點</text><path d="M405 48L475 24" stroke="#246f74" stroke-width="3"/><text x="445" y="85" font-size="18" text-anchor="middle">按鈕放開</text><text x="567" y="55" font-size="18">GND</text></svg><figcaption>線表示電路連接，不是實物腳位排列。HIGH／LOW 表示輸入相對 GND 的電壓高／低。</figcaption></figure>
<p>只取消上拉、其餘接法不變：放開時能保證讀到 LOW 嗎？為什麼？若改成用導線取代電阻，按下後會接成什麼危險路徑？</p><div class="write-space" style="height:36mm"></div>
`)
];
