(function (root) {
  'use strict';
  const header = 'time_ms,temperature_c,humidity_percent,state,event,acknowledged,alarm_count,alarm_ms,temp_limit_c,rh_limit_percent';
  const states = ['WAIT', 'NORMAL', 'ALERT', 'UNKNOWN'];
  const events = ['START', 'SAMPLE', 'ALARM', 'ACK', 'RECOVER', 'STOP'];
  const readingEvents = ['SAMPLE', 'ALARM', 'RECOVER'];
  const names = {START:'開始', SAMPLE:'讀取', ALARM:'新警報', ACK:'按鈕確認', RECOVER:'恢復正常', STOP:'停止'};
  function number(text, integer = false) {
    if (!/^-?\d+(?:\.\d+)?$/.test(text)) throw Error('數字欄位格式不正確');
    const n = Number(text);
    if (!Number.isFinite(n) || (integer && (!Number.isSafeInteger(n) || n < 0))) throw Error('數字欄位超出範圍');
    return n;
  }
  function parseLine(line) {
    line = line.replace(/^\uFEFF/, '').trim();
    if (!line || line.startsWith('#') || line === header) return null;
    const c = line.split(',');
    if (c.length !== 10 || !states.includes(c[3]) || !events.includes(c[4])) throw Error('不是本週 Q3 的十欄紀錄');
    const r = {time:number(c[0], true), t:c[1] === '' ? null : number(c[1]),
      rh:c[2] === '' ? null : number(c[2]), state:c[3], event:c[4], ack:number(c[5], true),
      count:number(c[6], true), alarm:number(c[7], true), limitT:number(c[8]), limitRh:number(c[9])};
    if (r.ack > 1 || r.limitRh < 0 || r.limitRh > 100) throw Error('確認或濕度門檻無效');
    if (['NORMAL','ALERT'].includes(r.state)) {
      if (r.t === null || r.rh === null || r.rh < 0 || r.rh > 100) throw Error('有效狀態缺少有效讀值');
    } else if (r.t !== null || r.rh !== null) throw Error('無效狀態不能冒充有效讀值');
    if (r.event === 'ALARM' && r.state !== 'ALERT') throw Error('新警報的狀態不一致');
    if (r.event === 'RECOVER' && r.state !== 'NORMAL') throw Error('恢復紀錄的狀態不一致');
    if (r.event === 'START' && (r.time || r.count || r.alarm || r.ack || r.state !== 'WAIT')) throw Error('開始紀錄沒有歸零');
    return r;
  }
  function validate(rows) {
    if (!rows.length || rows[0].event !== 'START') throw Error('缺少開始紀錄，不能混用不同次觀察');
    let open = false;
    for (let i = 1; i < rows.length; ++i) {
      const r = rows[i], p = rows[i-1];
      if (r.event === 'START' || p.event === 'STOP' || r.time < p.time) throw Error('裝置重啟或紀錄混在一起，請開始新紀錄');
      if (r.limitT !== p.limitT || r.limitRh !== p.limitRh) throw Error('同一次紀錄的門檻改變');
      if (r.count !== p.count + (r.event === 'ALARM' ? 1 : 0)) throw Error('警報次數不連續，可能漏資料');
      if (r.alarm < p.alarm || r.alarm - p.alarm > r.time - p.time + 30) throw Error('累計時間不一致');
      if (p.state !== 'ALERT' && r.alarm !== p.alarm) throw Error('非警報期間累計時間增加');
      let ack = p.ack;
      if (r.event === 'ALARM') { if (open) throw Error('持續警報被重複計次'); open = true; ack = 0; }
      if (r.event === 'RECOVER') { if (!open) throw Error('沒有開始卻出現恢復'); open = false; ack = 0; }
      if (r.event === 'ACK') { if (!open || p.ack) throw Error('按鈕確認紀錄不一致'); ack = 1; }
      if (r.ack !== ack) throw Error('確認狀態不一致');
      if (r.state === 'ALERT' && !open) throw Error('缺少警報開始紀錄');
      if (r.state === 'NORMAL' && open) throw Error('缺少恢復紀錄');
    }
  }
  function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    if (lines.find(l => l.trim())?.trim() !== header) throw Error('CSV 欄名不是本週 Q3 格式');
    const rows = lines.map(parseLine).filter(Boolean);
    validate(rows); return rows;
  }
  function toCsv(rows) {
    validate(rows);
    return header + '\r\n' + rows.map(r => [r.time, r.t ?? '', r.rh ?? '', r.state, r.event,
      r.ack, r.count, r.alarm, r.limitT, r.limitRh].join(',')).join('\r\n') + '\r\n';
  }
  function summarize(rows, reason = '') {
    validate(rows);
    const first = rows[0], last = rows.at(-1), alarms = [], warnings = [];
    let active = null, unknown = 0, success = 0;
    const notable = [];
    rows.forEach((r, i) => {
      if (readingEvents.includes(r.event)) { if (r.state === 'UNKNOWN') ++unknown; else ++success; }
      if (r.event === 'ALARM') {
        active = {start:r.time, end:null, baseline:r.alarm, duration:0, ack:null}; alarms.push(active);
      }
      if (active) {
        active.duration = r.alarm - active.baseline;
        if (r.event === 'ACK') active.ack = r.time;
        if (r.event === 'RECOVER') { active.end = r.time; active = null; }
      }
      if (['ALARM','ACK','RECOVER'].includes(r.event) ||
          (r.state === 'UNKNOWN' && rows[i-1]?.state !== 'UNKNOWN')) notable.push(r);
    });
    const samples = rows.filter(r => readingEvents.includes(r.event));
    if (samples.some((r, i) => i && r.time - samples[i-1].time > 3500)) warnings.push('讀取紀錄有較長間隔，可能有資料缺失。');
    const complete = last.event === 'STOP' && !reason;
    if (!complete) warnings.push(reason || '未收到裝置的停止紀錄；只分析已收到的部分。');
    if (unknown) warnings.push('讀取失敗期間無法判斷環境；沒有把它當成正常。');
    if (!success) warnings.push('沒有成功的溫濕度讀值，不能據此判斷環境。');
    if (active) warnings.push('結束時仍有未解除警報，最長時間可能包含這次未完成的警報。');
    const count = alarms.length, alarm = alarms.reduce((sum, item) => sum + item.duration, 0);
    if (count !== last.count || alarm !== last.alarm) throw Error('事件分析與裝置累計不一致');
    return {duration:last.time-first.time, count, alarm,
      longest:Math.max(0,...alarms.map(a=>a.duration)), unknown, success, alarms, notable,
      complete, warnings, limitT:first.limitT, limitRh:first.limitRh, last};
  }
  const escape = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const seconds = ms => (ms / 1000).toFixed(1);
  function chart(canvas, rows, field, label, limit) {
    const width = Math.max(300, Math.round(canvas.clientWidth || 600)), height = 200;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,width,height);
    const data = rows.filter(r => readingEvents.includes(r.event));
    const values = data.map(r=>r[field]).filter(v=>v !== null);
    const low = Math.min(limit,...values)-2, high = Math.max(limit,...values)+2;
    const duration = Math.max(1,rows.at(-1)?.time || 1);
    const right = width - 20;
    const x = t=>48+t/duration*(right-48), y=v=>164-(v-low)/(high-low)*128;
    ctx.font = '12px sans-serif'; ctx.fillStyle='#293e43'; ctx.strokeStyle='#bcc9cd';
    for(let i=0;i<3;++i) {
      const v=low+(high-low)*i/2; ctx.fillText(v.toFixed(1),3,y(v)+4);
      ctx.beginPath(); ctx.moveTo(48,y(v)); ctx.lineTo(right,y(v)); ctx.stroke();
    }
    ctx.fillText(label,48,16); ctx.fillText('0 s',48,189); ctx.fillText(seconds(duration)+' s',width-80,189);
    ctx.strokeStyle='#b34237'; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(48,y(limit)); ctx.lineTo(right,y(limit)); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle=field==='t'?'#286e63':'#476da2'; ctx.lineWidth=2;
    // An invalid reading or long receive gap breaks the line rather than filling with zero.
    let previous=null;
    for(const r of data) {
      if(r[field]===null) { previous=null; continue; }
      if(previous && r.time-previous.time<=3500) {
        ctx.beginPath(); ctx.moveTo(x(previous.time),y(previous[field])); ctx.lineTo(x(r.time),y(r[field])); ctx.stroke();
      }
      ctx.fillStyle=ctx.strokeStyle; ctx.beginPath(); ctx.arc(x(r.time),y(r[field]),2,0,Math.PI*2); ctx.fill(); previous=r;
    }
  }
  function reportHtml(rows, reason, images = []) {
    const s = summarize(rows,reason);
    const metrics = [['觀察時間',seconds(s.duration)+' 秒'],['溫度門檻',s.limitT+' °C'],['濕度門檻',s.limitRh+' %'],
      ['警報次數',s.count],['累計警報時間',seconds(s.alarm)+' 秒'],['最長一次警報',seconds(s.longest)+' 秒'],
      ['成功讀取',s.success+' 筆'],['失敗讀取',s.unknown+' 筆']];
    return '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>Week4 警報分析報告</title>'+ 
      '<style>body{font:15px/1.5 sans-serif;color:#293e43;max-width:900px;margin:24px auto;padding:0 16px;letter-spacing:0}h1{font-size:24px}h2{font-size:18px}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border-bottom:1px solid #ccd7da;padding:7px;text-align:left}th{background:#edf3f3}img{width:100%;max-width:600px;display:block}li{margin:5px 0}@media print{body{margin:0;font-size:11px}h1{font-size:20px}img{max-height:150px;object-fit:contain}tr{break-inside:avoid}}</style>'+ 
      '<h1>Week4 警報分析報告</h1><p>本次 USB 收到的紀錄；'+(s.complete?'已收到開始與停止回應。':'紀錄不完整。')+'</p>'+ 
      '<table><thead><tr><th>項目</th><th>結果</th></tr></thead><tbody>'+metrics.map(([k,v])=>'<tr><td>'+escape(k)+'</td><td>'+escape(v)+'</td></tr>').join('')+'</tbody></table>'+ 
      '<p>時間是程式維持警報的時間，不是實際環境超標的精確時間。讀取間隔為 2.5 秒；門檻為課堂練習設定，不是安全標準。</p>'+ 
      (s.warnings.length?'<h2>解讀限制</h2><ul>'+s.warnings.map(w=>'<li>'+escape(w)+'</li>').join('')+'</ul>':'')+
      images.filter(u=>/^data:image\/png;base64,/.test(u)).map((u,i)=>'<h2>'+ (i?'相對濕度':'溫度')+'與時間</h2><img alt="實際收到的資料與門檻" src="'+u+'">').join('')+
      '<p>虛線為門檻，失敗或較長缺資料處不連線。橫軸為開始後的秒數；縱軸分別為 °C 與 %。</p>'+ 
      '<h2>每次警報</h2><table><thead><tr><th>第幾次</th><th>開始（秒）</th><th>按鈕確認（秒）</th><th>恢復（秒）</th><th>累計警報秒數</th></tr></thead><tbody>'+ 
      s.alarms.map((a,i)=>'<tr><td>'+(i+1)+'</td><td>'+seconds(a.start)+'</td><td>'+(a.ack===null?'未確認':seconds(a.ack))+'</td><td>'+(a.end===null?'尚未解除':seconds(a.end))+'</td><td>'+seconds(a.duration)+'</td></tr>').join('')+'</tbody></table>'+ 
      '<h2>操作與狀態紀錄</h2><table><thead><tr><th>時間（秒）</th><th>事件</th><th>狀態</th></tr></thead><tbody>'+s.notable.map(r=>'<tr><td>'+seconds(r.time)+'</td><td>'+escape(names[r.event])+'</td><td>'+escape(r.state)+'</td></tr>').join('')+'</tbody></table>'+ 
      '<h2>紀錄解讀</h2><p>次數表示進入警報幾次；累計與最長時間表示程式處於警報多久。有缺失的時段不能當作正常，也不能用課堂門檻判斷健康風險。</p></html>';
  }
  const api = {header,parseLine,parseCsv,validate,toCsv,summarize,chart,reportHtml,seconds,names};
  if (typeof module !== 'undefined') module.exports = api; else root.AlarmLog = api;
})(typeof window !== 'undefined' ? window : globalThis);
