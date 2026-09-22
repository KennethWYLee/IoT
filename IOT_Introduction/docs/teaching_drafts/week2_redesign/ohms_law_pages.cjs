module.exports = ({page, svg, text, line, dot, marker, block, arrow}) => {
  function circuit(closed) {
    let s = marker;
    s += text(22,25,'電源端',19) + text(286,25,'GPIO4',19) + text(555,25,'GND',19);
    s += text(22,52,'3.3V',22) + text(286,52,closed?'約 0V':'約 3.3V',22) + text(555,52,'0V',22);
    s += line(48,88,125,88) + `<rect x="125" y="74" width="108" height="28" fill="#fff4d6" stroke="#947336" stroke-width="2"/>`;
    s += line(233,88,395,88) + dot(310,88) + dot(395,88) + dot(461,88);
    s += line(395,88,461,closed?88:64) + line(461,88,580,88);
    s += text(179,125,'R = 30,000 Ω',18,'text-anchor="middle"');
    s += text(428,125,closed?'按鈕接通':'按鈕斷開',19,'text-anchor="middle"');
    s += line(96,143,265,143) + line(96,137,96,149) + line(265,137,265,149);
    s += text(180,170,closed?'電阻兩端：相差約 3.3V':'電阻兩端：相差約 0V',18,'text-anchor="middle"');
    s += line(310,184,580,184) + line(310,178,310,190) + line(580,178,580,190);
    s += text(445,215,closed?'GPIO4 與 GND：相差約 0V':'GPIO4 與 GND：相差約 3.3V',18,'text-anchor="middle"');
    if(closed) s += arrow(240,64,288,64);
    return svg(s,230);
  }
  function calculation(labels) {
    let s = marker;
    labels.forEach((label,i)=>{
      const y=5+i*59;
      s+=block(12,y,626,42,label);
      if(i<2)s+=arrow(325,y+42,325,y+57);
    });
    return svg(s,172);
  }
  function wireInsteadOfResistor(closed) {
    let s = text(18,26,'電源端',19) + text(310,26,'GPIO4',19,'text-anchor="middle"') + text(568,26,'GND',19);
    s += text(18,54,closed?'電壓可能下降':'3.3V',19);
    s += text(310,54,closed?'電壓不保證固定':'約 3.3V',19,'text-anchor="middle"') + text(568,54,'0V',19);
    s += line(48,88,395,88) + dot(310,88) + dot(395,88) + dot(461,88);
    s += line(395,88,461,closed?88:64) + line(461,88,580,88);
    s += text(180,122,'導線，沒有上拉電阻',18,'text-anchor="middle"');
    s += text(455,122,closed?'按鈕接通：短路':'按鈕斷開',18,'text-anchor="middle"');
    return svg(s,140);
  }
  return [
    page(21,'按鈕原理 · V = I × R','沒按按鈕，為什麼是 3.3V？','3.3V 電源與 GPIO4 中間連著一顆電阻，位於 ESP32 晶片內。',`
      <p class="question"><b>沒按時，通往 GND 的路斷開。</b>流過電阻的電流幾乎為零，電阻兩端幾乎沒有電壓差。因此 GPIO4 與電源端一樣，約為 <b>3.3V，讀到 HIGH</b>。</p>
      <p><b>歐姆定律 V = I × R：</b>這裡 V 是電阻兩端的電壓差（伏特 V），I 是流過電阻的電流（安培 A），R 是電阻值（歐姆 Ω）。</p>
      <p><b>為什麼要分兩個電壓？</b>電壓要比較兩個位置：電阻的電壓差比「左端與右端」；GPIO 的電壓比「GPIO4 與 GND」。比較的位置不同，數值可以不同。</p>
      <figure class="diagram">${circuit(false)}<figcaption>為了算數，假設晶片內上拉電阻 R = 30,000 Ω；不是實物精確阻值，也不是要外接這顆電阻。下方短線標示比較的位置，不是新增接線。</figcaption></figure>
      <h2>按鈕斷開，用三步算出 HIGH</h2>
      <figure class="diagram">${calculation(['① 按鈕斷開：I ≈ 0 A','② 電阻兩端電壓差 ≈ 0 × 30,000 = 0V','③ GPIO4 對 GND ≈ 3.3 − 0 = 3.3V → HIGH'])}<figcaption>≈ 表示「約等於」。忽略 GPIO 的微小輸入電流，只看狀態穩定後的近似結果。</figcaption></figure>
      <aside class="note"><b>有電阻，不代表一定會降低電壓。</b>流過的電流幾乎是零，電阻兩端的電壓差也就幾乎是零。</aside>
    `),
    page(22,'按鈕原理 · V = I × R','按下後，為什麼變成 0V？','GPIO4 與 GND 之間只有接通的按鈕和導線。',`
      <p class="question"><b>按下時，GPIO4 接到 GND（0V）。</b>雖然仍連著 3.3V，但那一側隔著大電阻；GND 這一側的電阻幾乎為零。因此 GPIO4 接近 <b>0V，讀到 LOW</b>。</p>
      <figure class="diagram">${circuit(true)}<figcaption>沿用上一頁的假設 R = 30,000 Ω。電阻左端約 3.3V、右端約 0V；GPIO4 與 GND 則都約 0V。箭頭表示電流方向，不是另一條線。</figcaption></figure>
      <h2>3.3V 沒消失，電壓差在電阻兩端</h2>
      <figure class="diagram">${calculation(['① GPIO4 對 GND 約 0V → LOW','② 電阻兩端電壓差 ≈ 3.3 − 0 = 3.3V','③ I = V ÷ R ≈ 3.3 ÷ 30,000 = 0.00011 A'])}<figcaption>電源 → 上拉電阻 → 接通的按鈕 → GND，形成電流路徑；忽略導線與按鈕的微小電阻。</figcaption></figure>
      <p><b>0.00011 A = 0.11 mA</b>，因為 1 A = 1,000 mA。這是限流後的小電流，不是「沒有電流」。</p>
      <p><b>記住：</b>HIGH／LOW 看 GPIO 對 GND 的電壓，不看電流強弱。以上是計算示例，不是實測；不拆電阻、不改接 3V3，也不切電表到電流檔。</p>
    `),
    page(23,'按鈕原理 · 電阻的作用','如果把電阻換成導線？','假設 3.3V 電源直接連到 GPIO4，中間不再有上拉電阻。',`
      <aside class="safety"><b>只看圖理解，不要照圖接線。</b>這不是操作練習，也不是拆除晶片內電阻的步驟。按下圖中的按鈕會使電源短路，可能損壞板子。</aside>
      <h2>① 沒按：GPIO4 仍約為 3.3V</h2>
      <figure class="diagram">${wireInsteadOfResistor(false)}<figcaption>電源正常供應 3.3V，按鈕處斷開，沒有形成電源到 GND 的短路路徑。</figcaption></figure>
      <p>GPIO4 直接連著電源，所以 GPIO4 與 GND 的電壓差約為 <b>3.3V</b>。導線兩端的電壓差則幾乎是零。</p>
      <h2>② 按下：電源直接接到 GND，形成短路</h2>
      <figure class="diagram">${wireInsteadOfResistor(true)}<figcaption>電源 → 導線 → 接通的按鈕 → GND。失去上拉電阻的限流，這不是正常的 LOW 操作。</figcaption></figure>
      <p>短路可能造成很大的電流、電源電壓下降或保護動作。<b>GPIO4 與 GND 的電壓差要看電源和線路，不能保證固定值。</b></p>
      <p>不能同時假設「電源維持正常 3.3V」和「整條導線都是 0V」。實際導線、按鈕和電源都有電阻或供電限制。</p>
      <aside class="note"><b>有上拉電阻：</b>按下時限制電流，GPIO4 可接近 0V，而電源仍正常供應 3.3V。<br><b>換成導線：</b>按下時把電源短接到 GND，不能再當成正常電路判讀。</aside>
    `),
  ];
};
