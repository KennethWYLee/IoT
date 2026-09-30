const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { marked } = require('marked');
const { chromium } = require('playwright');

marked.use({extensions:[{name:'cjkStrong',level:'inline',start:s=>s.indexOf('**'),
  tokenizer(s){const m=/^\*\*([^\n]+?)\*\*/.exec(s);if(m)return{type:'cjkStrong',raw:m[0],tokens:this.lexer.inlineTokens(m[1])};},
  renderer(t){return '<strong>'+this.parser.parseInline(t.tokens)+'</strong>';}}]});
const course=path.resolve(__dirname,'..');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const input=file=>({file:path.relative(course,file).replaceAll('\\','/'),sha256:sha(/\.(md|cjs|json|ino|css)$/.test(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):fs.readFileSync(file))});
const titles={4:'環境顯示、提示與比較',5:'用 RGB 製作狀態提示燈',6:'三種舵機紙指針',7:'環境作品整合練習'};
const css=`
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#293e43;font-family:'Microsoft JhengHei',sans-serif;font-size:12pt;line-height:1.6;letter-spacing:0}
.page{width:210mm;height:297mm;padding:14mm 17mm 16mm;break-after:page;position:relative;background:white}.page:last-child{break-after:auto}
header{height:12mm;font-size:9pt;color:#627d83;border-bottom:.3mm solid #b8cccf;display:flex;justify-content:space-between;align-items:flex-start}
main{height:245mm;padding-top:6mm}footer{position:absolute;bottom:8mm;left:17mm;right:17mm;display:flex;justify-content:space-between;font-size:9pt;color:#627d83}
h2{font-size:23pt;line-height:1.35;color:#195a62;margin:0 0 6mm}h3{font-size:15pt;line-height:1.4;margin:5mm 0 3mm}p{margin:0 0 3mm}ul,ol{padding-left:7mm;margin:2mm 0 4mm}li{margin-bottom:1.5mm}
table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11pt;margin:3mm 0 5mm}th,td{text-align:left;vertical-align:top;padding:2.5mm;border-bottom:.3mm solid #c7d7da;overflow-wrap:anywhere}th{background:#edf3f3}
code{font-family:Consolas,monospace;font-size:10.5pt;overflow-wrap:anywhere}pre{white-space:pre-wrap;font-size:10pt;line-height:1.45}
.screen{background:#152025;color:#fff;font-family:Consolas,monospace;font-size:14pt;line-height:1.4;padding:4mm;margin:3mm 0;white-space:pre}
.write-space{border:.3mm solid #b3c5c9;height:28mm;margin:3mm 0 5mm}.write-space.small{height:19mm}.answer{border-left:1mm solid #246e73;padding:3mm 4mm;background:#f1f7f6;margin:3mm 0}
.safety{border-left:1.2mm solid #b34839;background:#fff3f0;padding:3mm 4mm;margin:3mm 0 5mm}figure{margin:4mm 0}figure img{display:block;max-width:100%;object-fit:contain;margin:auto}figcaption{font-size:10pt;color:#546d73;margin-top:2mm}
svg{display:block;width:100%;max-height:108mm;font-family:'Microsoft JhengHei',sans-serif}a{color:#195a62}blockquote{margin:3mm 0;border-left:1mm solid #b8cccf;padding-left:4mm}
`;

async function build(week){
  if(!titles[week])throw Error('Unsupported week '+week);
  const answers=process.argv.includes('--answers');
  const stem=answers?`week${week}Ans`:`week${week}_main`;
  const folder=path.join(course,`docs/teaching_drafts/week${week}_${answers?'answers':'redesign'}`);
  const source=path.join(folder,stem+'.md');
  let raw=fs.readFileSync(source,'utf8');
  const setupFile=path.join(course,'docs/teaching_drafts/week4_answers/weekly_setup.cjs');
  const usesSetup=raw.includes('{{weekly_setup}}');
  if(usesSetup){if(!answers)throw Error('Answer setup in Main');raw=raw.replace('{{weekly_setup}}',()=>require(setupFile).setup(week));}
  const parts=[...raw.matchAll(/<!-- page: ([\w-]+)\s*\|\s*([^\n]+?)\s*-->([\s\S]*?)(?=<!-- page:|$)/g)];
  if(!parts.length)throw Error('No pages');
  const ids=parts.map(x=>x[1]);
  if(new Set(ids).size!==ids.length)throw Error('Duplicate page id');
  const inputs=[input(source),input(__filename),input(path.join(course,`docs/teaching_drafts/week${week}_redesign/build.cjs`))];
  if(answers)inputs.push(input(path.join(course,'docs/teaching_drafts/week4_answers/cumulative_figures.cjs')));
  if(usesSetup)inputs.push(input(setupFile));
  const render=s=>marked.parse(s.replace(/\{\{page:([\w-]+)\}\}/g,(_,id)=>{if(!ids.includes(id))throw Error('Unknown page '+id);return String(ids.indexOf(id)+1);})
    .replace(/\{\{diagram:([\w-]+)\}\}/g,(_,id)=>{if(!answers)throw Error('Answer figure in Main');return require('../docs/teaching_drafts/week4_answers/cumulative_figures.cjs').diagram(id,week);})
    .replace(/\{\{photo:([^|]+)\|(\d+)\|([^}]+)\}\}/g,(_,name,height,caption)=>{
      const file=path.join(course,'docs/images/hardware/actual',name);const bytes=fs.readFileSync(file);
      inputs.push({file:path.relative(course,file),sha256:sha(bytes)});
      return `<figure><img src="data:image/jpeg;base64,${bytes.toString('base64')}" style="height:${height}mm" alt="${esc(caption)}"><figcaption>${esc(caption)}</figcaption></figure>`;
    }));
  const html='<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>'+stem+'</title><style>'+css+'</style><body>'+parts.map((p,i)=>`<section class="page" data-id="${p[1]}"><header><span>Week ${week} · ${titles[week]}</span><span>${esc(p[2])}</span></header><main>${render(p[3])}</main><footer><span>Week ${week} · ${answers?'Ans':'Main'}</span><span>${i+1} / ${parts.length}</span></footer></section>`).join('')+'</body></html>';
  if(/\{\{/.test(html))throw Error('Unresolved directive');
  const review=path.join(course,'..',`_outputs/cumulative_rebuild_20260930/${stem}`);
  fs.mkdirSync(review,{recursive:true});
  const htmlPath=path.join(review,stem+'.html');fs.writeFileSync(htmlPath,html);
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:900,height:1200},deviceScaleFactor:1.3});
    await page.goto(pathToFileURL(htmlPath).href);await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
    const audit=await page.locator('section.page').evaluateAll(pages=>pages.map(p=>{
      const main=p.querySelector('main'),bound=main.getBoundingClientRect();
      const overflow=[...main.querySelectorAll('h2,h3,p,table,pre,figure,ul,ol,.write-space,.answer,.safety,svg')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>bound.bottom+1||r.right>bound.right+1||r.left<bound.left-1;}).map(e=>({tag:e.tagName,text:e.textContent.slice(0,100)}));
      return{id:p.dataset.id,overflow,brokenImages:[...p.querySelectorAll('img')].filter(i=>!i.complete||i.naturalWidth===0).length};
    }));
    fs.writeFileSync(path.join(review,'layout.json'),JSON.stringify(audit,null,2));
    if(audit.some(a=>a.overflow.length||a.brokenImages))throw Error('Layout failed: '+JSON.stringify(audit.filter(a=>a.overflow.length||a.brokenImages)));
    const pdf=path.join(folder,stem+'.pdf');await page.pdf({path:pdf,printBackground:true,preferCSSPageSize:true});
    for(let i=0;i<parts.length;i++)await page.locator('section.page').nth(i).screenshot({path:path.join(review,`page-${String(i+1).padStart(2,'0')}.png`)});
    if(answers){const config=path.join(folder,'programs.sources.json');inputs.push(input(config));const cfg=JSON.parse(fs.readFileSync(config,'utf8'));for(const f of cfg.files)inputs.push(input(path.join(course,f.source)));}
    const manifest={format:2,week,kind:answers?'Ans':'Main',pages:ids,inputs,pdfSha256:sha(fs.readFileSync(pdf)),layoutPassed:true,physicalTested:false};
    fs.writeFileSync(path.join(folder,'build_manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify({pdf,pages:parts.length,review}));return manifest;
  }finally{await browser.close();}
}
module.exports={build};
if(require.main===module)build(Number(process.argv[2])).catch(e=>{console.error(e);process.exitCode=1;});
