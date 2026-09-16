const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dir = path.join(__dirname, 'reference_images');
const base = 'https://raw.githubusercontent.com/arduino/docs-content/main/content/software/ide-v2/tutorials/';
const esp = 'https://developer.espressif.com/blog/2025/10/arduino-get-started/';
const files = [
  ['arduino-install.png', base+'getting-started/01.ide-v2-downloading-and-installing/assets/downloading-and-installing-img02.png', 'Arduino / Karl Soderby', 'https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-downloading-and-installing/'],
  ['arduino-upload.png', base+'getting-started/02.ide-v2-uploading-a-sketch/assets/uploading-a-sketch-img01.png', 'Arduino / Karl Soderby and Jacob Hylen', 'https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-uploading-a-sketch/'],
  ['arduino-select.png', base+'getting-started/02.ide-v2-uploading-a-sketch/assets/uploading-a-sketch-img03.png', 'Arduino / Karl Soderby and Jacob Hylen', 'https://docs.arduino.cc/software/ide-v2/tutorials/getting-started/ide-v2-uploading-a-sketch/'],
  ['arduino-monitor.png', base+'ide-v2-serial-monitor/assets/serial-monitor-img03.png', 'Arduino / Karl Soderby', 'https://docs.arduino.cc/software/ide-v2/tutorials/ide-v2-serial-monitor/'],
  ['esp-preferences.webp', esp+'arduino-preferences_hu_136fd0fc34e5a193.webp', 'Espressif / Jan Prochazka', esp],
  ['esp-url.webp', esp+'arduino-url_hu_3ddb3ec3d456564.webp', 'Espressif / Jan Prochazka', esp],
  ['esp-install.webp', esp+'arduino-install_hu_b76097e8be93d94d.webp', 'Espressif / Jan Prochazka', esp],
];
(async()=>{
  fs.mkdirSync(dir,{recursive:true});
  const manifest=[];
  for(const [name,url,credit,sourcePage] of files){
    const response=await fetch(url,{signal:AbortSignal.timeout(40000)});
    if(!response.ok) throw Error(`${name}: ${response.status}`);
    const buffer=Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(dir,name),buffer);
    manifest.push({name,url,credit,sourcePage,downloadedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(buffer).digest('hex'),altered:false});
  }
  fs.writeFileSync(path.join(dir,'sources.json'),JSON.stringify(manifest,null,2));
  console.log(manifest.map(x=>x.name).join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1;});
