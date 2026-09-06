// Additive Week 3 maintenance source. Does not touch Week 2 or the original diagrams.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const sharp=require('sharp'), crypto=require('node:crypto');
const root=path.resolve(__dirname, '../..'), check=process.argv.includes('--check');
const sourcePath=path.join(root,'IOT_Introduction/docs/course_materials/week3_classification.source.md');
const notebookPath=path.join(root,'IOT_Introduction/Week_03_Electrical_Measurement_and_ADC/week3_main.ipynb');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=25,color='#183047')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const line=(x,y,x2,y2,color='#1765ad',width=4)=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#f3f7fb" stroke="#9fb3c5" stroke-width="2"/>`;
const svg=(title,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}"><title>${esc(title)}</title><style>text{font-family:'Microsoft JhengHei','Noto Sans CJK TC',sans-serif}</style><rect width="1200" height="${h}" fill="white"/>${text(32,53,title,32)}${body}</svg>\n`;
function figures(){
 const result={};let b=text(32,100,'資料流程示意：箭頭不是電流。以下數字為教學示例。',25);
 [['ADC讀取','raw＝700'],['程式比較','700 ＞ 610'],['加上文字','SHADE／遮光']].forEach(([a,z],i)=>{let x=32+i*390;b+=box(x,155,355,170)+text(x+22,205,a,30)+text(x+22,265,z,29);if(i<2)b+=text(x+358,252,'→',29);});
 b+=text(32,390,'真實操作條件 → 先記錄兩組基準 → 訂規則 → 用新資料驗證',27);
 b+=text(32,452,'700在兩組基準中間：雖有暫定標籤，quality仍是suspect。',27,'#ae2842');
 b+=text(32,514,'文字不會增加量測資訊；改變位置或規則，標籤可能失準。',26);
 result['flow']=svg('「遮光」是程式解釋，不是ADC直接吐出的物理量',555,b);
 for(const overlap of [false,true]){
  let b=text(32,103,'教學示例；橫軸raw無V、Ω或lux單位。粗線表示本次觀察範圍。',24);
  const x=v=>110+v*.8;
  b+=line(110,445,1110,445,'#52657a',2);
  for(let v=0;v<=1200;v+=200)b+=text(x(v)-15,488,v,23);
  for(const [lo,hi,name,y,col]of overlap?[[300,700,'室內光',225,'#1765ad'],[600,1000,'遮光',355,'#087768']]:[[300,320,'室內光',225,'#1765ad'],[900,920,'遮光',355,'#087768']]){
   b+=text(32,y-35,`${name}：${lo}～${hi}`,27,col)+line(x(lo),y,x(hi),y,col,18);
  }
  if(overlap){b+=`<rect x="${x(600)}" y="150" width="${x(700)-x(600)}" height="270" fill="#ae2842" opacity=".15"/>`;
   b+=text(32,550,'raw＝650可能來自任一條件 → 本方法拒絕建立門檻。',28,'#ae2842')+text(32,610,'先核對控制條件及原始log，不刪掉重疊數字來製造好結果。',25);
  }else{b+=line(x(610),155,x(610),440,'#ae2842',3)+text(x(610)-40,145,'610',28,'#ae2842');
   b+=text(32,550,'(320＋900) ÷ 2＝610；先找兩組靠近空隙的邊界。',28)+text(32,610,'本例raw ≤ 610：室內光；raw > 610：遮光。',27);
  }
  b+=text(32,670,'這是本地觀察的分類規則，不能推廣成所有環境的永久答案。',25,'#ae2842');
  result[overlap?'overlap':'separated']=svg(overlap?'兩組重疊：一個數字不能唯一推回條件':'兩組分開：在中間留一條相對門檻',715,b);
 }
 return result;
}
function artifact(file,data){const bytes=Buffer.isBuffer(data)?data:Buffer.from(data);if(check){assert(fs.existsSync(file),file);assert(fs.readFileSync(file).equals(bytes),`Stale ${file}`);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}}
function proseCell(s){
 const attachments={};s=s.trim();
 s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>{const file=path.resolve(path.dirname(sourcePath),url),name=path.basename(file);attachments[name]={'image/png':fs.readFileSync(file).toString('base64')};return `![${alt}](attachment:${name})`;});
 s=s.replace(/(?<!!)\[([^\]]*)\]\(([^)]+)\)/g,(m,label,url)=>{if(/^(https?:|#|attachment:)/.test(url))return m;const [file,anchor]=url.split('#');return `[${label}](${path.relative(path.dirname(notebookPath),path.resolve(path.dirname(sourcePath),file)).replaceAll('\\','/')}${anchor?'#'+anchor:''})`;});
 const cell={cell_type:'markdown',metadata:{maintenance_source:'week3_classification.source.md'},source:(s+'\n').match(/.*\n/g)};
 if(Object.keys(attachments).length)cell.attachments=attachments;return cell;
}
async function main(){
 for(const [name,markup]of Object.entries(figures())){const file=path.join(root,`IOT_Introduction/docs/images/wiring/week3-classifier-${name}`);artifact(file+'.svg',markup);artifact(file+'.png',await sharp(Buffer.from(markup)).png().toBuffer());}
 const nb=JSON.parse(fs.readFileSync(notebookPath,'utf8'));
 nb.cells=nb.cells.filter(c=>c.metadata?.maintenance_source!=='week3_classification.source.md');
 for(const c of nb.cells){let s=c.source.join('');
  s=s.replace('DHT11、光線門檻、感測有效／無效分類與兩種感測器整合留到Week 4。','本週再用已保存的兩組資料建立本地光線門檻，讓Serial顯示室內光／遮光。\nDHT11、雙感測器品質、穩定遮光事件與蜂鳴器提示留到Week 4。');
  s=s.replace('本頁兩支程式目前','本頁三支程式目前');
  s=s.replace('`valid`或`reason`；那些是Week 4校正後的內容。','`valid`或`reason`；本週第十二之一節的分類程式才加入這些欄位，Week 4再處理雙感測器品質。');
  s=s.replace('本題不設定明暗分類門檻，校正與分類留到Week 4。','本題先解釋電路與數字方向；本週第十二之一節另用已知條件建立相對分類，不把本題結果直接當永久門檻。');
  s=s.replace('8. 使用1 kΩ與10 kΩ固定電阻','9. 使用1 kΩ與10 kΩ固定電阻');
  if(s.includes('## 一、Unit Overview')&&!s.includes('8. 由兩組已知'))s=s.replace('9. 使用1 kΩ','8. 由兩組已知光線條件建立相對分類門檻（relative threshold），在Serial顯示文字標籤，並以另一段資料說明規則的適用範圍與限制。\n9. 使用1 kΩ');
  s=s.replace('而不直接將讀值視為伏特（volt）、勒克斯（lux）或已校正的光線狀態。','而不直接將讀值視為伏特（volt）或勒克斯（lux）。再由本地基準建立室內光／遮光文字分類，區分原始值、暫定標籤與資料品質。');
  if(s.includes('| [G. Discussion]')&&!s.includes('| [F3.'))s=s.replace('| [G. Discussion]','| [F3. 本地光線分類](#w3-classification) | 已有兩組原始資料與不重疊基準 | 計算門檻、換分類程式，觀察文字與quality | 保存規則及各5筆新驗證資料；能解釋重疊或改位置的限制 |\n| [G. Discussion]');
  if(s.includes('[ADC程式與採樣](#w3-adc-practice)')&&!s.includes('｜[本地光線分類]'))s=s.replace('[ADC程式與採樣](#w3-adc-practice)','[ADC程式與採樣](#w3-adc-practice)｜[本地光線分類](#w3-classification)');
  s=s.replace('並能解釋兩種讀值之間的關係與限制。本週不建立threshold（分類門檻），\n不把這20筆直接變成永久的明暗判斷規則。','並能解釋兩種讀值之間的關係與限制。接下來第十二之一節沿用這20筆建立本地threshold（分類門檻），\n不把這些觀察當成永久的明暗判斷規則。');
  s=s.replace('8. 兩個sketch及Lab Note；','8. 三個sketch及Lab Note；');
  if(s.includes('### 繳交內容')&&!s.includes('10. 本地分類'))s=s.replace('### 完成檢核','10. 本地分類的四個範圍值、門檻、方向及獨立驗證紀錄；兩種條件各5筆，已有完整獨立紀錄可引用。\n\n### 完成檢核');
  s=s.replace('Week 2～6硬體教材藍圖','Week 2～7硬體教材藍圖');
  c.source=s.match(/.*\n|.+$/g);
 }
 const source=fs.readFileSync(sourcePath,'utf8').replaceAll('\r\n','\n'),extra=[];
 const parts=source.split(/<!-- sketch:(week03_[a-z0-9_]+) -->/);
 parts.forEach((s,i)=>{if(i%2===0)extra.push(proseCell(s));else{const code=fs.readFileSync(path.join(root,`IOT_Introduction/examples/${s}/${s}.ino`),'utf8').replaceAll('\r\n','\n');extra.push({cell_type:'code',metadata:{language:'cpp',maintenance_source:'week3_classification.source.md'},execution_count:null,outputs:[],source:code.match(/.*\n|.+$/g)});}});
 extra.forEach((c,i)=>c.id='w3-classifier-'+crypto.createHash('sha256').update(i+':'+c.source.join('')).digest('hex').slice(0,10));
 const at=nb.cells.findIndex(c=>c.source.join('').includes('<a id="w3-discussion">'));assert(at>0);
 nb.cells.splice(at,0,...extra);
 artifact(notebookPath,JSON.stringify(nb,null,1)+'\n');
 console.log(`PASS ${check?'compared':'built'} Week 3 classifier: three diagrams, three added cells; original material retained.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
