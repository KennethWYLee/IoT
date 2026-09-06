// Read-only checks; --render writes local previews, never uploads or contacts hardware.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const g=require('./hardware_galleries.cjs'),root=path.resolve(__dirname,'../..');
const allPhotos=Object.values(g.catalog.components).flatMap(p=>p.photos);
const actual=fs.readdirSync(path.join(g.base,'actual')).filter(p=>/\.(jpg|png)$/.test(p)).sort();
assert.deepEqual(actual,allPhotos.filter(p=>p.file.startsWith('actual/')).map(p=>path.basename(p.file)).sort());
for(const week of Object.keys(g.catalog.weeks).map(Number)) {
 const file=g.lessonPath(week),isNotebook=file.endsWith('.ipynb');
 const nb=isNotebook?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const text=nb?nb.cells.map(c=>c.source.join('')).join('\n'):fs.readFileSync(file,'utf8');
 const gallery=text.match(/<!-- hardware-gallery:start -->[\s\S]+?<!-- hardware-gallery:end -->/g);
 assert.equal(gallery?.length,1,file);
 assert.equal(gallery[0],g.gallery(week,file));
 const refs=[...gallery[0].matchAll(/!\[[^\]]+\]\(([^)]+)\)/g)];
 assert.equal(refs.length,g.imageCount(week));
 refs.forEach(m=>g.verifyPhotoReference(gallery[0],m[1],file));
 assert(!gallery[0].includes('attachment:'),'Do not duplicate full-resolution gallery bytes');
 if(nb)assert(fs.statSync(file).size<6*1024*1024,'Gallery should not bloat the notebook beyond the reviewed 6 MiB budget');
}
console.log(`PASS all ${actual.length} actual photographs catalogued; 11 exact galleries; canonical photo hashes; notebooks below reviewed 6 MiB budget.`);

async function render(){
 const {marked}=await import(pathToFileURL(require.resolve('marked')).href);
 const {chromium}=require('playwright'),http=require('node:http');
 const out=path.join(root,'_outputs/hardware_gallery_review');fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{
   const url=new URL(req.url,'http://localhost'),full=path.resolve(root,'.'+decodeURIComponent(url.pathname));
   const imageRoot=path.join(root,'IOT_Introduction/docs/images')+path.sep;
   if(!full.startsWith(imageRoot)||!/\.(png|jpg|jpeg)$/.test(full)||!fs.existsSync(full)){res.writeHead(404);res.end();return;}
   res.setHeader('Content-Type',full.endsWith('.png')?'image/png':'image/jpeg');fs.createReadStream(full).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 let browser;
 const css='body{font:17px/1.65 "Microsoft JhengHei",sans-serif;color:#183047;margin:24px}main{max-width:1080px;margin:auto}img{max-width:100%;height:auto}table{display:block;overflow:auto;border-collapse:collapse;margin-bottom:24px}td,th{border:1px solid #ccd7e1;padding:10px}th{background:#f3f6f8}p,a{overflow-wrap:anywhere}h4{font-size:21px;margin-top:32px}';
 try{
   browser=await chromium.launch({headless:true,channel:'msedge'});
   const page=await browser.newPage({viewport:{width:1200,height:960}});
   for(const week of Object.keys(g.catalog.weeks).map(Number)){
     const file=g.lessonPath(week),source=g.gallery(week,file);
     const base=`${origin}/${path.relative(root,path.dirname(file)).replaceAll('\\','/')}/`;
     await page.setViewportSize({width:1200,height:960});
     await page.setContent(`<!doctype html><meta charset="utf-8"><base href="${base}"><style>${css}</style><main>${marked.parse(source)}</main>`);
     await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
     assert.equal(await page.locator('img').count(),g.imageCount(week));
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     await page.screenshot({path:path.join(out,`week${week}-opening.png`)});
     if(week===1)for(const id of ['jumperwire','pushbutton','a830l','resistor','ky018','dht11','rgb_hw479','buzzer_hw508','sg90','batteryholder4aa','oled']){
       await page.locator(`#equipment-${id}`).evaluate(e=>e.scrollIntoView({block:'start'}));
       await page.screenshot({path:path.join(out,`part-${id}.png`)});
     }
     await page.setViewportSize({width:420,height:960});
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     await page.locator('#equipment-photos').evaluate(e=>e.scrollIntoView({block:'start'}));
     await page.screenshot({path:path.join(out,`week${week}-mobile.png`)});
     const offline=`<!doctype html><meta charset="utf-8"><style>${css}</style><main>${marked.parse(g.inlineLocalPhotos(source,file))}</main>`;
     fs.writeFileSync(path.join(out,`week${week}.html`),offline);
     console.log(`PASS Week ${week}: ${g.imageCount(week)} actual relative image requests resolved; desktop/mobile no page overflow.`);
   }
   // A browser-rendered contact sheet for reviewing every preserved angle. No asset edits.
   for(let offset=0;offset<allPhotos.length;offset+=8){
     await page.setViewportSize({width:1400,height:1250});
     const subset=allPhotos.slice(offset,offset+8);
     const body=subset.map(p=>`<figure><img src="${origin}/IOT_Introduction/docs/images/hardware/${p.file}"><figcaption>${path.basename(p.file)}<br>${p.kind}：${p.view}</figcaption></figure>`).join('');
     await page.setContent(`<style>body{font:16px "Microsoft JhengHei";margin:20px}main{display:grid;grid-template-columns:repeat(4,1fr)}figure{margin:8px}img{width:100%;height:460px;object-fit:contain}figcaption{padding:8px;line-height:1.5}</style><main>${body}</main>`);
     await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
     await page.screenshot({path:path.join(out,`all-photos-${offset}.png`),fullPage:true});
   }
   console.log('PASS local Edge render and relative-asset server checks. Live GitHub rendering and physical testing are not performed.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
if(process.argv.includes('--render'))render().catch(e=>{console.error(e);process.exitCode=1;});
