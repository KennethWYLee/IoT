(function (root) {
  'use strict';
  const base = typeof module !== 'undefined' ? require('./alarm_report.js') : root.AlarmLog;
  const header = 'time_ms,light_raw,temperature_c,humidity_percent,event,light_state,temperature_state,light_event,temperature_event,light_acknowledged,temperature_acknowledged,light_alarm_count,temperature_alarm_count,light_alarm_ms,temperature_alarm_ms,light_limit_raw,temp_limit_c';
  const states = ['WAIT', 'NORMAL', 'ALERT', 'UNKNOWN'];
  const kinds = ['light', 'temperature'];
  const labels = {light:'光線', temperature:'溫度'};
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function number(text, integer = false) {
    if (!/^-?\d+(?:\.\d+)?$/.test(text)) throw Error('數字欄位格式不正確');
    const n = Number(text);
    if (!Number.isFinite(n) || (integer && (!Number.isSafeInteger(n) || n < 0 || n > 0xffffffff))) throw Error('數字超出範圍');
    return n;
  }
  function parseLine(line) {
    line = line.replace(/^\uFEFF/, '').trim();
    if (!line || line.startsWith('#') || line === header) return null;
    const c = line.split(',');
    if (c.length !== 17 || !['START','SAMPLE','ACK','STOP'].includes(c[4])) throw Error('需要新版 Q4 的十七欄紀錄');
    const r = {time:number(c[0], true), raw:c[1] === '' ? null : number(c[1], true),
      t:c[2] === '' ? null : number(c[2]), rh:c[3] === '' ? null : number(c[3]), event:c[4],
      limitRaw:number(c[15], true), limitT:number(c[16])};
    if (r.limitRaw > 4095 || (r.raw !== null && r.raw > 4095)) throw Error('RAW 超出 0 到 4095');
    for (let i = 0; i < 2; ++i) {
      const a = r[kinds[i]] = {state:c[5+i], event:c[7+i], ack:number(c[9+i], true),
        count:number(c[11+i], true), alarm:number(c[13+i], true)};
      if (!states.includes(a.state) || !['NONE','ALARM','RECOVER','ACK'].includes(a.event) || a.ack > 1) throw Error('警報欄位無效');
      if ((r.event === 'ACK' && !['NONE','ACK'].includes(a.event)) ||
          (r.event === 'SAMPLE' && a.event === 'ACK') ||
          (['START','STOP'].includes(r.event) && a.event !== 'NONE')) throw Error('操作與警報事件不一致');
      if (a.event === 'ALARM' && a.state !== 'ALERT') throw Error('新警報狀態不一致');
      if (a.event === 'RECOVER' && a.state !== 'NORMAL') throw Error('恢復狀態不一致');
      if (r.event === 'START' && (r.time || a.count || a.alarm || a.ack || a.state !== 'WAIT')) throw Error('開始沒有歸零');
    }
    if (r.event === 'ACK' && !kinds.some(k => r[k].event === 'ACK')) throw Error('沒有確認任何警報');
    if (['NORMAL','ALERT'].includes(r.light.state)) {
      if (r.raw === null || (r.raw > r.limitRaw) !== (r.light.state === 'ALERT')) throw Error('光線讀值與狀態不一致');
    } else if (r.raw !== null) throw Error('無效光線狀態不應有讀值');
    if (['NORMAL','ALERT'].includes(r.temperature.state)) {
      if (r.t === null || r.rh === null || r.rh < 0 || r.rh > 100 ||
          (r.t > r.limitT) !== (r.temperature.state === 'ALERT')) throw Error('溫度讀值與狀態不一致');
    } else if (r.t !== null || r.rh !== null) throw Error('讀取失敗不能冒充有效溫濕度');
    return Object.assign(r, {count:r.temperature.count, alarm:r.temperature.alarm, state:r.temperature.state});
  }
  // Reuse the checked event-accounting rules separately; humidity is not an alarm input.
  function project(rows, kind) {
    return rows.map(r => ({time:r.time, t:kind === 'light' ? r.raw : r.t, rh:r.rh,
      ...r[kind], event:['START','STOP'].includes(r.event) ? r.event :
        r[kind].event !== 'NONE' ? r[kind].event : r.event === 'SAMPLE' ? 'SAMPLE' : 'NONE',
      limitT:kind === 'light' ? r.limitRaw : r.limitT, limitRh:0}));
  }
  function validate(rows) {
    if (!rows.length) throw Error('缺少開始紀錄');
    for (const r of rows) {
      if (r.limitRaw !== rows[0].limitRaw || r.limitT !== rows[0].limitT) throw Error('本次門檻改變');
    }
    for (const kind of kinds) base.validate(project(rows, kind));
  }
  function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    if (lines.find(l => l.trim())?.trim() !== header) throw Error('CSV 不是新版 Q4 格式');
    const rows = lines.map(parseLine).filter(Boolean);
    rows.incompleteReason = lines.find(l => l.startsWith('# INCOMPLETE'))?.slice(13).trim() || '';
    validate(rows); return rows;
  }
  function summarize(rows, reason = '') {
    validate(rows);
    reason = reason || rows.incompleteReason || '';
    const summaries = Object.fromEntries(kinds.map(k => [k, base.summarize(project(rows, k), reason)]));
    const warnings = [...new Set(kinds.flatMap(k => summaries[k].warnings.map(w =>
      labels[k] + '：' + w.replace('溫濕度', k === 'light' ? '光線' : '溫濕度'))))];
    const notable = kinds.flatMap(k => summaries[k].notable.map(r => ({...r, kind:labels[k]})))
      .sort((a,b) => a.time - b.time);
    return {...summaries.temperature, ...summaries, warnings, notable, limitRaw:rows[0].limitRaw,
      last:rows.at(-1), complete:summaries.light.complete && summaries.temperature.complete};
  }
  function toCsv(rows) {
    validate(rows);
    return header + '\r\n' + rows.map(r => [r.time,r.raw ?? '',r.t ?? '',r.rh ?? '',r.event,
      r.light.state,r.temperature.state,r.light.event,r.temperature.event,r.light.ack,r.temperature.ack,
      r.light.count,r.temperature.count,r.light.alarm,r.temperature.alarm,r.limitRaw,r.limitT].join(',')).join('\r\n') + '\r\n';
  }
  function chart(canvas, rows, field, label, limit = null) {
    const width = Math.max(240, Math.round(canvas.clientWidth || 600)), height = 200;
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,width,height);
    const data = rows.filter(r => r.event === 'SAMPLE');
    const values = data.map(r => r[field]).filter(v => v !== null);
    if (limit !== null) values.push(limit);
    const low = Math.min(...values, values.length ? Infinity : 0)-2;
    const high = Math.max(...values, values.length ? -Infinity : 1)+2;
    const duration = Math.max(1,rows.at(-1)?.time || 1), right = width-20;
    const x = t => 48+t/duration*(right-48), y = v => 164-(v-low)/(high-low)*128;
    ctx.font='12px sans-serif'; ctx.fillStyle='#293e43'; ctx.strokeStyle='#bcc9cd';
    for (let i=0;i<3;++i) {
      const v=low+(high-low)*i/2; ctx.fillText(v.toFixed(1),3,y(v)+4);
      ctx.beginPath(); ctx.moveTo(48,y(v)); ctx.lineTo(right,y(v)); ctx.stroke();
    }
    ctx.fillText(label,48,16); ctx.fillText('0 s',48,189); ctx.fillText(base.seconds(duration)+' s',width-80,189);
    if (limit !== null) {
      ctx.strokeStyle='#b34237'; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(48,y(limit)); ctx.lineTo(right,y(limit)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle=field === 'raw' ? '#937322' : field === 't' ? '#286e63' : '#476da2'; ctx.lineWidth=2;
    let previous=null;
    for (const r of data) {
      if (r[field] === null) { previous=null; continue; }
      if (previous && r.time-previous.time<=3500) {
        ctx.beginPath(); ctx.moveTo(x(previous.time),y(previous[field])); ctx.lineTo(x(r.time),y(r[field])); ctx.stroke();
      }
      ctx.fillStyle=ctx.strokeStyle; ctx.beginPath(); ctx.arc(x(r.time),y(r[field]),2,0,Math.PI*2); ctx.fill(); previous=r;
    }
  }
  function reportHtml(rows, reason, images = []) {
    const s=summarize(rows,reason);
    const section = kind => {
      const a=s[kind];
      return '<h2>'+labels[kind]+'警報</h2><p>次數：'+a.count+'；累計：'+base.seconds(a.alarm)+' 秒；最長：'+base.seconds(a.longest)+' 秒。</p>'+ 
        '<table><tr><th>第幾次</th><th>開始（秒）</th><th>確認（秒）</th><th>恢復（秒）</th><th>警報秒數</th></tr>'+a.alarms.map((v,i) =>
          '<tr><td>'+(i+1)+'</td><td>'+base.seconds(v.start)+'</td><td>'+(v.ack===null?'未確認':base.seconds(v.ack))+'</td><td>'+(v.end===null?'尚未解除':base.seconds(v.end))+'</td><td>'+base.seconds(v.duration)+'</td></tr>').join('')+'</table>';
    };
    return '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>Week4 光線與溫度警報報告</title>'+ 
      '<style>body{font:15px/1.6 sans-serif;color:#293e43;max-width:900px;margin:24px auto;padding:0 16px;letter-spacing:0}h1{font-size:24px}h2{font-size:18px}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border-bottom:1px solid #ccd7da;padding:7px;text-align:left}img{width:100%;max-width:650px;display:block}tr{break-inside:avoid}</style>'+ 
      '<h1>Week4 光線與溫度警報報告</h1><p>'+ (s.complete?'紀錄完成。':'紀錄不完整。')+'觀察 '+base.seconds(s.duration)+' 秒；光線 RAW &gt; '+s.limitRaw+'、溫度 &gt; '+s.limitT+' °C 各自警報。濕度只顯示，不觸發警報。</p>'+ 
      section('light')+section('temperature')+'<p>DHT 成功 '+s.temperature.success+' 筆、失敗 '+s.temperature.unknown+' 筆。時間是程式處於警報狀態的時間，失敗期間暫停該項計時；不是實際環境超標的精確時間。</p>'+ 
      '<ul>'+s.warnings.map(w => '<li>'+escape(w)+'</li>').join('')+'</ul>'+ 
      images.filter(u => /^data:image\/png;base64,/.test(u)).map((u,i) => '<h2>'+['光線 RAW','溫度 °C','相對濕度 %'][i]+'與時間</h2><img alt="本次收到的數據" src="'+u+'">').join('')+
      '<p>光線與溫度虛線是本次門檻；濕度沒有警報門檻。RAW 是 ADC 原始整數，不是照度。練習門檻不是安全標準。</p></html>';
  }
  const api = {header,parseLine,parseCsv,validate,toCsv,summarize,chart,reportHtml,seconds:base.seconds,names:base.names,
    analysisFields:s => [s.light.count,s.light.alarm,s.light.longest,s.temperature.count,s.temperature.alarm,s.temperature.longest]};
  if (typeof module !== 'undefined') module.exports=api; else root.DualAlarmLog=api;
})(typeof window !== 'undefined' ? window : globalThis);
