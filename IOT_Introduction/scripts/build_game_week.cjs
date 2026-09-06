// Same authored Markdown / sketch / embedded PNG convention as Week 4.
// This builder writes only the requested Week 5, 6 or 7, never Week 2.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname, '../..'),week=Number(process.argv[2]),check=process.argv.includes('--check');
const directories={5:'Week_05_RGB_OLED_Countdown',6:'Week_06_Servo_Pointer',7:'Week_07_Traffic_Light_Challenge'};
assert(directories[week],'Usage: node IOT_Introduction/scripts/build_game_week.cjs 5|6|7 [--check]');
const sourcePath=path.join(root,`IOT_Introduction/docs/course_materials/week${week}_main.source.md`);
const notebookPath=path.join(root,`IOT_Introduction/${directories[week]}/week${week}_main.ipynb`);
function artifact(file,data){const bytes=Buffer.isBuffer(data)?data:Buffer.from(data);if(check){assert(fs.existsSync(file),file);assert(fs.readFileSync(file).equals(bytes),`Stale: ${file}`);}else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}}
async function main(){
 const figures=require(`./week${week}_figures.cjs`);
 for(const [name,svg]of Object.entries(figures)){
  const base=path.join(root,`IOT_Introduction/docs/images/wiring/week${week}-${name}`);
  artifact(base+'.svg',svg);artifact(base+'.png',await sharp(Buffer.from(svg)).png().toBuffer());
 }
 const source=fs.readFileSync(sourcePath,'utf8').replace(/\r\n/g,'\n'),cells=[];
 function markdown(s){s=s.trim();if(!s)return;const attachments={};
  s=s.replace(/!\[([^\]]+)\]\(([^)]+)\)/g,(_,alt,url)=>{const file=path.resolve(path.dirname(sourcePath),url);assert(/\.(png|jpg|jpeg)$/.test(file));const name=path.basename(file),mime=file.endsWith('.png')?'image/png':'image/jpeg';attachments[name]={[mime]:fs.readFileSync(file).toString('base64')};return `![${alt}](attachment:${name})`;});
  s=s.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,(match,label,url)=>{if(/^(https?:|#|attachment:)/.test(url))return match;const [file,anchor]=url.split('#');assert(fs.existsSync(path.resolve(path.dirname(sourcePath),file)),url);return `[${label}](${path.relative(path.dirname(notebookPath),path.resolve(path.dirname(sourcePath),file)).replaceAll('\\','/')}${anchor?'#'+anchor:''})`;});
  const c={cell_type:'markdown',metadata:{},source:(s+'\n').match(/.*\n/g)};if(Object.keys(attachments).length)c.attachments=attachments;cells.push(c);
 }
 for(const section of source.split(/<!-- cell -->/)){
  const pieces=section.split(/<!-- sketch:(week0[567]_[a-z0-9_]+) -->/);
  pieces.forEach((piece,i)=>{if(i%2===0)markdown(piece);else{const code=fs.readFileSync(path.join(root,`IOT_Introduction/examples/${piece}/${piece}.ino`),'utf8').replace(/\r\n/g,'\n');cells.push({cell_type:'code',metadata:{language:'cpp',sketch:piece},execution_count:null,outputs:[],source:code.match(/.*\n|.+$/g)});}});
 }
 cells.forEach((c,i)=>c.id=`w${week}-`+crypto.createHash('sha256').update(i+':'+c.source.join('')).digest('hex').slice(0,12));
 artifact(notebookPath,JSON.stringify({cells,metadata:{language_info:{name:'cpp'},course_edition:'complete-preparation-with-reference-answers',maintenance_source:`IOT_Introduction/docs/course_materials/week${week}_main.source.md`,hardware_validation:'pending-exact-module-and-gpio-profiles'},nbformat:4,nbformat_minor:5},null,1)+'\n');
 console.log(`PASS ${check?'compared':'built'} Week ${week}: ${cells.length} cells; ${Object.keys(figures).length} SVG/PNG pairs.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
