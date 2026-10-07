(function(root) {
  'use strict';
  const api=root.DualAlarmLog, $=id=>document.getElementById(id);
  const supported='serial' in navigator && typeof root.showDirectoryPicker==='function';
  let pending=false;
  const client=new root.AlarmAnalysis.AnalysisClient(api,{changed:()=>{
    controls();
    if (!pending) { pending=true; requestAnimationFrame(()=>{pending=false;render();}); }
  }});
  root.analysisClient=client;
  function controls() {
    const locked=client.busy || client.phase==='connecting';
    $('connect').disabled=!supported || !!client.port || locked;
    $('folder').disabled=!supported || locked;
    $('start').disabled=!supported || !client.port || !client.ready || !client.directory || locked;
    $('stop').disabled=client.phase!=='recording' || client.closing;
    $('disconnect').disabled=!client.port || client.closing || client.phase==='connecting';
    $('report').disabled=!client.session?.rows.length || locked;
    $('status').textContent=client.message; $('status').dataset.state=client.phase;
    $('folder-name').textContent=client.directory?.name ?? '未選擇';
    $('filename').textContent=client.session?.name || '--'; $('saved').textContent=client.session?.rows.length ?? 0;
    $('file-state').textContent=client.session?.failed?'不完整':client.session?.complete?'完成':client.active?'紀錄中':'--';
    $('device-return').textContent=client.deviceLines.join('\n') || '尚未收到裝置回傳';
  }
  function render() {
    const session=client.session, rows=session?.rows ?? [];
    const summary=rows.length?api.summarize(rows,session.reason):null;
    const valid=summary && !session.failed;
    for (const [prefix,kind] of [['light','light'],['temp','temperature']]) {
      $(prefix+'-count').textContent=valid?summary[kind].count:'--';
      $(prefix+'-total').textContent=valid?api.seconds(summary[kind].alarm):'--';
      $(prefix+'-longest').textContent=valid?api.seconds(summary[kind].longest):'--';
    }
    $('failed').textContent=summary?.temperature.unknown ?? '--';
    const last=rows.at(-1);
    $('live').textContent=last?'RAW:'+ (last.raw??'--')+' T:'+(last.t??'--')+' C RH:'+(last.rh??'--')+' % | LIGHT:'+last.light.state+' TEMP:'+last.temperature.state:'RAW:-- T:-- C RH:-- %';
    $('feedback').textContent=session?.failed?'已停止回傳':session?.feedbackTime != null?'已傳送：'+api.seconds(session.feedbackTime)+' s · 紀錄 '+session.id:'尚未傳送';
    const warnings=summary?.warnings.filter(w=>!client.active || !w.includes('未收到裝置的停止紀錄')) ?? [];
    $('warnings').replaceChildren(...warnings.map(w=>{const li=document.createElement('li');li.textContent=w;return li;}));
    $('events').replaceChildren(...(summary?.notable.slice(-100) ?? []).map(r=>{
      const tr=document.createElement('tr');
      for(const value of [api.seconds(r.time),r.kind,api.names[r.event]??r.event,r.state]) {
        const td=document.createElement('td');td.textContent=value;tr.append(td);
      }
      return tr;
    }));
    for (const [id,field,label,limit] of [['light-plot','raw','RAW',summary?.limitRaw],['temp-plot','t','T / °C',summary?.limitT],['rh-plot','rh','RH / %',null]]) {
      if(summary)api.chart($(id),rows,field,label,limit);
      else $(id).getContext('2d').clearRect(0,0,$(id).width,$(id).height);
    }
  }
  $('connect').onclick=()=>client.connect(navigator.serial);
  $('folder').onclick=()=>client.chooseFolder(options=>root.showDirectoryPicker(options));
  $('start').onclick=()=>client.start(); $('stop').onclick=()=>client.stop(); $('disconnect').onclick=()=>client.disconnect();
  $('report').onclick=()=>{
    const session=client.session;
    if(!session?.rows.length || client.busy)return;
    render();
    const images=['light-plot','temp-plot','rh-plot'].map(id=>$(id).toDataURL());
    const url=URL.createObjectURL(new Blob([api.reportHtml(session.rows,session.reason,images)],{type:'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=session.name.replace(/\.csv$/,'_report.html');a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  navigator.serial?.addEventListener('disconnect',event=>{
    if((event.port || event.target)!==client.port)return;
    client.ready=false;
    if(client.active)client.fail('USB 已拔除，紀錄不完整');else client.update('USB 已拔除');
    void client.disconnect();
  });
  root.addEventListener('beforeunload',event=>{if(client.port || client.busy){event.preventDefault();event.returnValue='';}});
  root.addEventListener('pagehide',()=>{void client.disconnect();});root.addEventListener('resize',render);
  if(!supported)client.update('請使用支援序列埠與資料夾存取的桌面 Chrome／Edge');
  controls();render();
})(window);
