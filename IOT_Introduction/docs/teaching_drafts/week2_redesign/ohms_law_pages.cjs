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
    s += text(180,170,closed?'V_R ≈ 3.3V':'V_R ≈ 0V',20,'text-anchor="middle"');
    s += line(310,184,580,184) + line(310,178,310,190) + line(580,178,580,190);
    s += text(445,215,closed?'V_GPIO ≈ 0V → LOW':'V_GPIO ≈ 3.3V → HIGH',20,'text-anchor="middle"');
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
  return [
    page(21,'你的提問 · 用 V = I × R 解釋','放開時，電壓都留在 ESP32？','先分清：電阻兩端的電壓差，和 GPIO 對 GND 的電壓差。',`
      <p class="question"><b>你的提問：</b>「因為電流不通，所以電壓都在 ESP32，所以電壓是 HIGH？」<br><b>改成這樣更準確：</b>放開時幾乎沒有電流；GPIO4 仍透過電阻連著 3.3V，不是電壓被存起來。</p>
      <p><b>歐姆定律 V = I × R：</b>這裡 V 是電阻兩端的電壓差（伏特 V），I 是流過電阻的電流（安培 A），R 是電阻值（歐姆 Ω）。</p>
      <p>圖中 <b>V_R</b> 表示電阻左端減右端；<b>V_GPIO</b> 表示 GPIO4 減 GND。它們不是同一個電壓差。</p>
      <figure class="diagram">${circuit(false)}<figcaption>為了算數，假設晶片內上拉電阻 R = 30,000 Ω；不是實物精確阻值，也不是要外接這顆電阻。下方短線標示比較的位置，不是新增接線。</figcaption></figure>
      <h2>按鈕斷開，用三步算出 HIGH</h2>
      <figure class="diagram">${calculation(['① 按鈕斷開：I ≈ 0 A','② V_R = I × R ≈ 0 × 30,000 = 0V','③ V_GPIO ≈ 3.3 − 0 = 3.3V → HIGH'])}<figcaption>≈ 表示「約等於」。忽略 GPIO 的微小輸入電流，只看狀態穩定後的近似結果。</figcaption></figure>
      <aside class="note"><b>有電阻，不代表一定會降低電壓。</b>流過的電流幾乎是零，電阻兩端的電壓差也就幾乎是零。</aside>
    `),
    page(22,'你的提問 · 用 V = I × R 解釋','按下後，哪裡沒有電壓差？','不是整個電路沒有電壓差；只看 GPIO4 與 GND 這兩點。',`
      <p class="question"><b>你的提問：</b>「如果電流通了，電壓就變成沒有電壓差？」<br><b>要補上比較的位置：</b>按鈕接通讓 GPIO4 接到 GND，所以這兩點幾乎沒有電壓差。電源仍是 3.3V。</p>
      <figure class="diagram">${circuit(true)}<figcaption>沿用上一頁的假設 R = 30,000 Ω。V_R 比較電阻兩端；V_GPIO 比較 GPIO4 與 GND。箭頭表示電流方向，不是另一條線。</figcaption></figure>
      <h2>先看接點，再算流過電阻的電流</h2>
      <figure class="diagram">${calculation(['① GPIO4 接到 GND：V_GPIO ≈ 0V → LOW','② 電阻左端 3.3V、右端約 0V：V_R ≈ 3.3V','③ I = V_R ÷ R ≈ 3.3 ÷ 30,000 = 0.00011 A'])}<figcaption>電源 → 上拉電阻 → 接通的按鈕 → GND，形成電流路徑；忽略導線與按鈕的微小電阻。</figcaption></figure>
      <p><b>0.00011 A = 0.11 mA</b>，因為 1 A = 1,000 mA。這是限流後的小電流，不是「沒有電流」。</p>
      <p><b>記住：</b>HIGH／LOW 看 GPIO 對 GND 的電壓，不看電流強弱。以上是計算示例，不是實測；不拆電阻、不改接 3V3，也不切電表到電流檔。</p>
    `),
  ];
};
