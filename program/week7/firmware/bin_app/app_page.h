// app_page.h — Week7 紙杯垃圾桶＋App v3：手機 App 網頁（由 bin_app.ino 的 GET / 傳出）
// 開頁只讀 /api/state；只有使用者按鈕才送 POST /api/cmd；不自動重送、重連只讀。
// 這是示例介面，不限制學生自己的外觀設計。
#pragma once

static const char APP_PAGE[] = R"APP(<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>紙杯垃圾桶 App</title>
<style>
html,body{overscroll-behavior-y:contain}
body{font-family:system-ui,-apple-system,"Noto Sans TC","Microsoft JhengHei",sans-serif;margin:0;background:#f3f4f6;color:#111;font-size:17px;line-height:1.45}
header{background:#254a40;color:#fff;padding:10px 14px}
h1{font-size:20px;margin:0}
#conn{font-size:14px;margin-top:2px}
main{padding:10px;max-width:560px;margin:auto}
.card{padding:16px 2px;margin:0;border-bottom:1px solid #bcc9c5}
*{box-sizing:border-box;letter-spacing:0}
.row label{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;max-width:100%}
#hhmm{width:160px;max-width:100%;min-height:44px}
dd{overflow-wrap:anywhere;min-width:0}
.big{font-size:30px;font-weight:700}
dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;margin:8px 0}
dt{color:#333}
dd{margin:0;font-weight:600}
.row{display:flex;gap:8px;margin:8px 0;align-items:center;flex-wrap:wrap}
button{font-size:17px;padding:10px;border-radius:8px;border:1px solid #345;background:#e6edf6;color:#111;min-height:48px;flex:1}
button:disabled{opacity:.4}
.stop{background:#a4001d;color:#fff;border-color:#600;width:100%;font-weight:700;margin-top:6px}
input{font-size:17px;padding:8px;width:5.5em}
.hint{font-size:14px;color:#333}
.warn{background:#fff3cd;border:1px solid #b8901a;padding:8px;border-radius:6px}
#banner{display:none;background:#fde2e1;border:2px solid #a4001d;padding:8px;border-radius:6px;margin-bottom:10px}
.stale #banner{display:block}
.stale #status dd,.stale #status .big{color:#666}
summary{font-weight:700;font-size:18px;cursor:pointer}
table{border-collapse:collapse;font-size:14px;width:100%}
th,td{border:1px solid #bbb;padding:2px 4px;text-align:left}
pre{white-space:pre-wrap;word-break:break-all;font-size:12px}
</style>
</head>
<body>
<header><h1>紙杯垃圾桶 App</h1><div id="device">本組 Wi-Fi：--</div><div id="control">尚未取得控制</div><div id="conn">讀取狀態中（只讀取，不送指令）…</div></header>
<main>
<p class="hint">手機請勿下拉刷新；切換 App 後也可能重新載入，原頁的控制權不會轉交。</p>
<p id="controlRecovery" class="warn" hidden>本頁不能接手控制。先關電池，USB 供電時按 RST，再重連 Wi-Fi、刷新與重新校正。</p>
<div id="banner"><b>狀態已過期，畫面是舊值；控制已停用，不會自動重送。</b><br>若卡住、異音、發熱或手機失聯，<b>直接關閉電池開關</b>，不要等 App。<span id="bootMsg"></span></div>

<section class="card" id="status">
 <div class="hint">目前狀態</div>
 <div class="big" id="view">—</div>
 <dl>
  <dt>本輪剩餘</dt><dd id="sess">—</dd>
  <dt>開蓋倒數</dt><dd id="cd">—</dd>
  <dt>已採用關蓋時間</dt><dd id="scheduled">—</dd>
  <dt>最後已送命令</dt><dd id="last">—</dd>
  <dt>等待中的命令</dt><dd id="pend">—</dd>
  <dt>感應點</dt><dd id="zone">—</dd>
 </dl>
 <p class="hint">「已送命令」只表示程式送出舵機訊號，不是紙蓋到位的量測；請親眼確認。</p>
 <div id="req" class="hint">尚未送出要求。</div>
</section>

<section class="card" id="startBox" hidden>
 <b>人工確認後開始</b>
 <p class="hint">手離開紙蓋行程 → 人工打開電池開關 → 親眼確認紙蓋位置正確，再按：</p>
 <button data-c="start" disabled>已開電確認，開始自動感應</button>
</section>

<section class="card">
 <b>操作</b>
 <div class="row"><label>秒數 <input id="secs" type="number" min="1" max="60" step="1" value="5" inputmode="numeric"></label><button data-c="open_for" disabled>開蓋並計時</button></div>
 <div class="row"><button data-c="close" disabled>關蓋</button><button data-c="hold_open" disabled>保持開蓋</button><button data-c="auto" disabled>恢復自動</button></div>
 <div class="row"><label>今天 <input id="hhmm" type="time" step="60"></label><button data-c="close_at" disabled>開蓋至指定時間</button></div>
 <p class="hint">開蓋並計時：秒數 1～60 的整數；從開蓋命令送出起算（已開蓋則從現在起算），到時感應點清空才關，之後保持手動關閉。<br>今日時間：現在開蓋，到今天選定的時:分（秒為 00）且感應點清空才關；只接受本輪剩餘時間內，不排明天、不每天重複。<br>所有關蓋都要等感應點連續清空 0.5 秒，沒有強制關蓋。帶電時不要伸手整理紙蓋。</p>
 <button class="stop" data-c="stop" disabled>停止控制</button>
 <p class="hint">停止控制不是斷電。新一輪先關電池，USB 保持供電時按板上 RST，再重連 Wi-Fi、重新整理本頁與校正。完整收納另須拔 USB。</p>
</section>

<details class="card" id="setup" open>
 <summary>設定區（電池 OFF）</summary>
 <p class="warn"><b>電池開關保持 OFF</b> 才進行校正與準備。</p>
 <ol class="hint">
  <li>感應點不遮 → 按「記錄未遮光」。</li>
  <li>遮住感應點 → 按「記錄遮光」，然後把手移開。</li>
  <li>兩筆相差至少 100，且感應點目前連續清空 0.5 秒 → 按「準備舵機（電池關閉）」。</li>
 </ol>
 <div class="row"><button data-c="cal_clear" disabled>記錄未遮光</button><button data-c="cal_covered" disabled>記錄遮光</button></div>
 <dl>
  <dt>未遮光 RAW</dt><dd id="cc">—</dd>
  <dt>遮光 RAW</dt><dd id="cv">—</dd>
  <dt>兩筆差值</dt><dd id="cg">—</dd>
  <dt>方向</dt><dd id="cdir">—</dd>
  <dt>教師設定</dt><dd id="setupOk">—</dd>
  <dt>OLED</dt><dd id="oled">—</dd>
 </dl>
 <button data-c="prepare" disabled>準備舵機（電池關閉）</button>
 <p class="hint">按下後裝置送出初始關蓋命令，180 秒本輪上限從此起算（包含人工開電池的時間）。程式量不到電池開關或紙蓋位置。</p>
</details>

<details class="card">
 <summary>排錯資訊</summary>
 <dl>
  <dt>目前 RAW</dt><dd id="raw">—</dd>
  <dt>樣本年齡</dt><dd id="sage">—</dd>
  <dt>同一判斷持續</dt><dd id="zms">—</dd>
  <dt>boot / run</dt><dd id="br">—</dd>
  <dt>裝置已處理編號</dt><dd id="seq">—</dd>
  <dt>重送被忽略 / 佇列滿</dt><dd id="dq">—</dd>
 </dl>
 <table><thead><tr><th>編號</th><th>要求</th><th>控制迴圈結果</th><th>幾秒前</th></tr></thead><tbody id="res"></tbody></table>
 <pre id="json"></pre>
</details>
</main>
<script>
'use strict';
const $=id=>document.getElementById(id);
const VIEW={preview:'尚未準備',confirm:'待人工確認',auto:'自動',countdown:'開蓋倒數',hold:'保持',wait_clear:'等待清空',close_pending:'關蓋待送',manual_closed:'手動關閉',stopped:'停止',timeout:'逾時'};
const CMD={cal_clear:'記錄未遮光',cal_covered:'記錄遮光',prepare:'準備舵機（電池關閉）',start:'開始自動感應',open_for:'開蓋並計時',close:'關蓋',hold_open:'保持',auto:'恢復自動',close_at:'今日時間',stop:'停止控制'};
const RES={accepted:'控制迴圈已接受',bad_boot:'裝置已重新開機（boot 不符），請重新整理',old_run:'回合不符（舊頁面送出的要求）',old_id:'編號比裝置已處理的舊',expired:'要求已超過有效期',exp_too_far:'有效期超出允許範圍',latched:'已停止或逾時：請人工關電池；新一輪須斷電、按 RST',wrong_phase:'目前階段不能做這個操作',setup_locked:'教師設定尚未確認：預覽模式，不動舵機',oled_fail:'OLED 未初始化成功',cal_needed:'尚未完成兩筆合格校正（相差至少 100）',sensor_stale:'感測值不是最新的',not_clear:'感應點沒有連續清空 0.5 秒',bad_secs:'秒數須為 1～60 的整數',bad_time:'時間缺少、不是整數，或手機時鐘不合理',time_not_minute:'目標時間的秒數不是 00',time_past:'這個時間今天已過（不排明天）',time_beyond:'超出本輪剩餘時間',queue_full:'裝置佇列已滿，沒有排入',bad_cmd:'指令名稱錯誤',bad_id:'要求編號格式錯誤',bad_boot_field:'boot 欄位格式錯誤',bad_run_field:'run 欄位格式錯誤',bad_exp_field:'有效期欄位格式錯誤',not_found:'網址不存在'};
const ZONE={unknown:'未校正',clear:'清空',middle:'中間區（WAIT）',covered:'遮光'};
Object.assign(RES,{time_not_today:'只接受手機當地今天的時間',too_large:'要求太長，未排入',duplicate:'重送已忽略',latched:'已停止或逾時：電池 OFF，USB 供電時按 RST'});
const POS={none:'無',open:'開蓋',close:'關蓋'};
const WAIT={none:'',gap:'（等命令間隔 1 秒）',clear:'（等感應點連續清空 0.5 秒）',sensor:'（等感測值更新）'};
const ALL=['cal_clear','cal_covered','prepare','start','open_for','close','hold_open','auto','close_at','stop'];
let S=null,sAt=0,lastOk=0,boot0=null,bootChanged=false,polling=false,lastId=0,pend=null,sending=false,setupFolded=false;
const clientKey=crypto.getRandomValues(new Uint32Array(1))[0]||1;
const canControl=()=>!S?.control_client||S.control_client===clientKey;
const FAULT={servo:'舵機訊號 attach 失敗',oled:'OLED 連線失敗',ap:'Wi-Fi 熱點失敗',network:'App 服務啟動失敗'};
Object.assign(RES,{controller_busy:'本頁不能接手控制。先關電池，USB 供電時按 RST，再重連 Wi-Fi、刷新與重新校正。',bad_client:'控制分頁識別格式錯誤'});

function fetchT(url,opt,ms){const c=new AbortController();const t=setTimeout(()=>c.abort(),ms);return fetch(url,Object.assign({cache:'no-store',signal:c.signal},opt||{})).finally(()=>clearTimeout(t));}
async function poll(){
  if(polling)return;polling=true;
  try{const r=await fetchT('/api/state',{},1500);if(r.ok){const j=await r.json();if(boot0===null)boot0=j.boot;if(j.boot!==boot0)bootChanged=true;S=j;sAt=performance.now();lastOk=sAt;}}catch(e){}
  polling=false;render();
}
function isStale(){return !S||bootChanged||performance.now()-lastOk>2500||S.snap_age_ms>1000;}
function devNow(){return (S.now_ms+Math.floor(performance.now()-sAt))>>>0;}
function secs(ms){return ms<0?'—':Math.ceil(ms/1000)+' 秒';}
function mmss(ms){if(ms<0)return '—';const s=Math.ceil(ms/1000);return Math.floor(s/60)+' 分 '+String(s%60).padStart(2,'0')+' 秒';}
function say(t){$('req').textContent=t;}
function nm(c){return CMD[c]||c;}
function setBtn(c,on){document.querySelectorAll('button[data-c="'+c+'"]').forEach(b=>{b.disabled=!on;});}

async function send(c){
  if(isStale())return;
  if(c!=='stop'&&!canControl()){say(RES.controller_busy);return;}
  if(sending&&c!=='stop')return;
  const p={cmd:c,boot:String(S.boot),run:String(S.run),client:String(clientKey)};
  if(c==='open_for'){
    const v=$('secs').value.trim();
    if(!/^\d{1,2}$/.test(v)||+v<1||+v>60){say('秒數須為 1～60 的整數；沒有送出。');return;}
    p.secs=String(+v);
  }
  if(c==='close_at'){
    const v=$('hhmm').value;
    if(!/^\d\d:\d\d$/.test(v)){say('請先選擇今天的時:分；沒有送出。');return;}
    const now=Date.now();const d=new Date(now);d.setHours(+v.slice(0,2),+v.slice(3,5),0,0);const t=d.getTime();
    if(t<=now){say('這個時間今天已過（不排明天）；沒有送出。');return;}
    if(S.session_left_ms<0||t-now>=S.session_left_ms){say('超出本輪剩餘時間；沒有送出。');return;}
    p.phone_now_ms=String(now);p.target_ms=String(t);p.utc_offset_min=String(-new Date(now).getTimezoneOffset());
  }
  const id=Math.max(lastId,S.last_seq)+1;lastId=id;
  p.id=String(id);p.exp=String((devNow()+3000)>>>0);
  pend={id:id,c:c,at:performance.now()};
  if(c!=='stop')sending=true;
  render();say('#'+id+' '+nm(c)+'：送出中…');
  try{
    const r=await fetchT('/api/cmd',{method:'POST',body:new URLSearchParams(p)},2500);
    let j={};try{j=await r.json();}catch(e){}
    if(j.queued){if(pend&&pend.id===id)say('#'+id+' '+nm(c)+'：裝置已收到並排入（還不是控制迴圈接受），等待結果…');}
    else{say('#'+id+' '+nm(c)+'：沒有排入－'+(RES[j.error]||j.error||('HTTP '+r.status)));if(pend&&pend.id===id)pend=null;}
  }catch(e){say('#'+id+' '+nm(c)+'：送出失敗或逾時；不會自動重送，請看狀態再決定。');}
  sending=false;render();
}

function render(){
  const st=isStale();
  document.body.classList.toggle('stale',st);
  $('conn').textContent=!S?'尚未讀到裝置狀態（只讀取，不送指令）':bootChanged?'裝置已重新開機：請重新整理頁面並重新校正':st?'狀態過期：以下為舊值，控制已停用':'已連線（約每 0.7 秒讀取一次狀態）';
  $('bootMsg').textContent=bootChanged?' 裝置已重新開機，請重新整理頁面。':'';
  if(!S){ALL.forEach(c=>setBtn(c,false));return;}
  const old=st?'（舊值）':'';
  $('device').textContent='本組 Wi-Fi：'+(S.device_id||'未回傳識別');
  $('control').textContent=canControl()?(S.phase==='stopped'||S.phase==='timeout'?'本輪已停止':'本頁可控制'):'本頁只讀（刷新或另一頁控制中）'+(!st&&['preview','confirm','running'].includes(S.phase)?'，仍可停止':'');
  $('controlRecovery').hidden=canControl();
  $('view').textContent=(VIEW[S.view]||S.view)+(S.fault?'（'+(FAULT[S.fault_reason]||'裝置故障')+'）':'')+old;
  $('sess').textContent=mmss(S.session_left_ms)+old;
  $('scheduled').textContent=S.target_phone_ms ? new Date(S.target_phone_ms+S.utc_offset_min*60000).toISOString().slice(11,16)+'（裝置已採用）'+old : '—';
  $('cd').textContent=(S.countdown_left_ms<0?'—':secs(S.countdown_left_ms)+(S.countdown_started?'':'（等開蓋命令送出後起算）'))+old;
  $('last').textContent=(POS[S.last_cmd]||S.last_cmd)+(S.last_cmd_age_ms>=0?'（'+(S.last_cmd_age_ms/1000).toFixed(1)+' 秒前送出）':'')+old;
  $('pend').textContent=(S.pending_cmd==='none'?'無':(POS[S.pending_cmd]||S.pending_cmd)+(WAIT[S.wait]||''))+old;
  $('zone').textContent=(ZONE[S.zone]||S.zone)+(S.zone==='unknown'?'':(S.stable?'（已連續 0.5 秒）':'（未滿 0.5 秒）'))+(S.sample_fresh?'':'；感測值不新鮮')+old;
  $('cc').textContent=S.cal_clear<0?'未記錄':String(S.cal_clear);
  $('cv').textContent=S.cal_covered<0?'未記錄':String(S.cal_covered);
  $('cg').textContent=S.cal_gap<0?'—':S.cal_gap+(S.cal_gap>=100?'（合格）':'（不足 100，請重新記錄）');
  $('cdir').textContent=S.cal_ok?(S.covered_high?'遮光時數值較高（程式自動判斷）':'遮光時數值較低（程式自動判斷）'):'—';
  $('setupOk').textContent=S.setup_ok?'已確認':'未確認：預覽模式，不 attach、不送舵機命令';
  $('oled').textContent=S.oled_ok?'初始化成功':'失敗（不能準備舵機）';
  $('raw').textContent=String(S.raw);
  $('sage').textContent=S.sample_age_ms<0?'—':S.sample_age_ms+' ms';
  $('zms').textContent=S.zone_ms<0?'—':S.zone_ms+' ms';
  $('br').textContent=S.boot+' / '+S.run;
  $('seq').textContent=String(S.last_seq);
  $('dq').textContent=S.dup_count+' / '+S.queue_drop;
  const rows=(S.results||[]).map(e=>'<tr><td>'+e.id+'</td><td>'+nm(e.cmd)+'</td><td>'+(RES[e.res]||e.res)+'</td><td>'+(e.age_ms/1000).toFixed(1)+'</td></tr>');
  $('res').innerHTML=rows.join('');
  $('json').textContent=JSON.stringify(S,null,1);
  if(pend){
    const e=(S.results||[]).find(x=>x.id===pend.id&&x.cmd===pend.c&&(canControl()||pend.c==='stop'));
    if(e){say('#'+pend.id+' '+nm(pend.c)+'：'+(RES[e.res]||e.res));pend=null;}
    else if(performance.now()-pend.at>6000){say('#'+pend.id+' '+nm(pend.c)+'：狀態中沒有看到結果；不會自動重送。');pend=null;}
  }
  const ok=!st,ph=S.phase,free=ok&&!sending&&canControl();
  setBtn('cal_clear',free&&ph==='preview');
  setBtn('cal_covered',free&&ph==='preview');
  setBtn('prepare',free&&ph==='preview');
  setBtn('start',free&&ph==='confirm');
  ['open_for','close','hold_open','auto','close_at'].forEach(c=>setBtn(c,free&&ph==='running'));
  setBtn('stop',ok&&(ph==='preview'||ph==='confirm'||ph==='running'));
  $('startBox').hidden=(ph!=='confirm');
  if(ph!=='preview'&&!setupFolded){$('setup').open=false;setupFolded=true;}
}

document.querySelectorAll('button[data-c]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.c)));
setInterval(poll,700);
setInterval(render,500);
poll();
</script>
</body>
</html>
)APP";
