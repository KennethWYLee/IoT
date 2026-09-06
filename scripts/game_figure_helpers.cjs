// Course-authored functional diagrams: never physical pinout evidence.
const ink='#183047',blue='#1765ad',red='#ae2842',green='#087768',muted='#52657a';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const t=(x,y,s,size=25,c=ink,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${c}" text-anchor="${anchor}">${esc(s)}</text>`;
const box=(x,y,w,h,fill='#f3f7fb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#bacbd7" stroke-width="2"/>`;
const line=(x,y,x2,y2,c=muted,w=3)=>`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"/>`;
const arr=(x,y,x2,y2,c=blue)=>{const a=Math.atan2(y2-y,x2-x),p=(d)=>[x2-13*Math.cos(a+d),y2-13*Math.sin(a+d)];const l=p(.5),r=p(-.5);return line(x,y,x2,y2,c)+`<path d="M${l} L${x2},${y2} L${r}" fill="none" stroke="${c}" stroke-width="3"/>`;};
const svg=(title,subtitle,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${h}" viewBox="0 0 1200 ${h}" role="img"><title>${esc(title)}</title><desc>${esc(subtitle)}</desc><style>text{font-family:'Microsoft JhengHei','Noto Sans CJK TC',sans-serif}</style><rect width="1200" height="${h}" fill="white"/>${t(30,48,title,32)}${t(30,91,subtitle,23,muted)}${body}</svg>\n`;
module.exports={ink,blue,red,green,muted,t,box,line,arr,svg};
