(function (root) {
  'use strict';
  const activePhases = ['preparing', 'starting', 'recording', 'stopping', 'finishing'];
  const uint32 = value => Number.isSafeInteger(value) && value >= 0 && value <= 0xffffffff;
  const encoder = new TextEncoder();

  class AnalysisClient {
    constructor(api, options = {}) {
      this.api = api;
      this.timeoutMs = options.timeoutMs ?? 5000;
      this.changed = options.changed ?? (() => {});
      this.randomId = options.randomId ?? (() => {
        const value = new Uint32Array(1);
        root.crypto.getRandomValues(value);
        return value[0];
      });
      this.now = options.now ?? (() => new Date());
      this.port = null;
      this.reader = null;
      this.readTask = null;
      this.directory = null;
      this.session = null;
      this.phase = 'idle';
      this.message = '尚未連線';
      this.ready = false;
      this.closing = false;
      this.recovering = false;
      this.picking = false;
      this.timer = null;
      this.lineQueue = Promise.resolve();
      this.fileQueue = Promise.resolve();
      this.serialQueue = Promise.resolve();
      this.failureTask = Promise.resolve();
      this.preparationTask = Promise.resolve();
      this.deviceLines = [];
      this.usedIds = new Set();
    }

    get active() { return activePhases.includes(this.phase); }
    get busy() { return this.active || this.closing || this.recovering || this.picking; }
    update(message) {
      if (message !== undefined) this.message = message;
      this.changed(this);
    }
    clearTimer() { clearTimeout(this.timer); this.timer = null; }
    armTimer(message) {
      this.clearTimer();
      this.timer = setTimeout(() => this.fail(message), this.timeoutMs);
    }

    async chooseFolder(picker) {
      if (this.busy || this.phase === 'connecting') return;
      this.picking = true;
      this.update();
      try {
        // Call the picker directly from the click, before waiting on any other work.
        const directory = await picker({mode: 'readwrite', id: 'week4-analysis'});
        if (await directory.queryPermission({mode: 'readwrite'}) !== 'granted') {
          throw Error('資料夾未允許寫入');
        }
        this.directory = directory;
        this.update('已選擇資料夾：' + directory.name);
      } catch (error) {
        this.update(error.name === 'AbortError' ? '已取消選擇資料夾' : '無法選擇資料夾：' + error.message);
      } finally {
        this.picking = false;
        this.update();
      }
    }

    async connect(serial) {
      if (this.port || this.busy || this.phase === 'connecting') return;
      this.phase = 'connecting';
      this.update('選擇裝置');
      let selected;
      try {
        selected = await serial.requestPort();
        await selected.open({baudRate: 115200});
        this.port = selected;
        this.ready = false;
        this.phase = 'idle';
        this.update('已連線，等候 Q4 裝置回應');
        this.readTask = this.readLoop(selected);
        await this.command('HELLO');
      } catch (error) {
        if (this.port === selected) {
          await this.disconnect();
        } else if (selected?.readable || selected?.writable) {
          try { await selected.close(); } catch (_) { /* Preserve the connection error. */ }
        }
        this.port = null;
        this.ready = false;
        this.phase = 'idle';
        this.update(error.name === 'NotFoundError' ? '已取消選擇裝置' : '無法連線：' + error.message);
      }
    }

    command(text, allowed = () => true) {
      const port = this.port;
      const task = this.serialQueue.then(async () => {
        if (!allowed()) return false;
        if (!port || this.port !== port || !port.writable) throw Error('裝置沒有可用的輸出連線');
        const writer = port.writable.getWriter();
        try { await writer.write(encoder.encode(text + '\n')); }
        finally { writer.releaseLock(); }
        return true;
      });
      this.serialQueue = task.catch(() => {});
      return task;
    }

    append(session, text) {
      const task = this.fileQueue.then(async () => {
        if (!session.handle) throw Error('CSV 檔案尚未建立');
        const existing = await session.handle.getFile();
        if (existing.size !== session.bytes) throw Error('CSV 被其他程式修改，已停止寫入');
        let writable;
        try {
          writable = await session.handle.createWritable({keepExistingData: true, mode: 'exclusive'});
          await writable.seek(session.bytes);
          await writable.write(text);
          // A row is not considered saved, and is not fed back, until close commits it.
          await writable.close();
          session.bytes += encoder.encode(text).length;
        } catch (error) {
          if (writable) {
            try { await writable.abort(); } catch (_) { /* The original write/close failure matters. */ }
          }
          throw error;
        }
      });
      this.fileQueue = task.catch(() => {});
      return task;
    }

    async newFile(session) {
      if (await this.directory.queryPermission({mode: 'readwrite'}) !== 'granted') {
        throw Error('資料夾寫入權限已失效，請重新選擇');
      }
      const stamp = this.now().toISOString().replace(/[-:]/g, '').replace(/[.]/g, '_');
      const base = 'week4_analysis_' + stamp + '_' + session.id;
      for (let attempt = 0; attempt < 100; ++attempt) {
        const name = base + (attempt ? '_' + attempt : '') + '.csv';
        try {
          await this.directory.getFileHandle(name, {create: false});
          continue;
        } catch (error) {
          if (error.name !== 'NotFoundError') throw error;
        }
        const handle = await this.directory.getFileHandle(name, {create: true});
        if ((await handle.getFile()).size !== 0) continue;
        session.handle = handle;
        session.name = name;
        await this.append(session, this.api.header + '\r\n');
        return;
      }
      throw Error('無法建立不重複的 CSV 檔名');
    }

    nextId() {
      for (let attempt = 0; attempt < 100; ++attempt) {
        const id = this.randomId();
        if (uint32(id) && id > 0 && !this.usedIds.has(id)) {
          this.usedIds.add(id);
          return id;
        }
      }
      throw Error('無法產生新的紀錄編號');
    }

    async start() {
      if (!this.port || !this.directory || !this.ready || this.busy) return;
      this.phase = 'preparing';
      this.session = null;
      this.deviceLines = [];
      this.update('正在建立新 CSV');
      let session;
      try {
        await this.failureTask;
        await this.lineQueue;
        await this.fileQueue;
        await this.serialQueue;
        if (this.phase !== 'preparing' || !this.ready || !this.port) return;
        session = {id: this.nextId(), name: '', handle: null, bytes: 0, rows: [],
          marker: false, header: false, failed: false, reason: '', complete: false,
          summary: null, feedbackTime: null};
        this.session = session;
        this.preparationTask = this.newFile(session);
        await this.preparationTask;
        if (session.failed || this.closing) return;
        this.phase = 'starting';
        this.update('等候本次開始回應');
        this.armTimer('未收到本次開始回應，紀錄不完整');
        await this.command('START ' + session.id, () => !session.failed && this.session === session);
      } catch (error) {
        this.fail('無法開始：' + error.message);
      }
    }

    async stop() {
      if (this.phase !== 'recording' || this.closing) return;
      this.phase = 'stopping';
      this.update('等候停止回應');
      this.armTimer('未收到停止回應，紀錄不完整');
      try { await this.command('STOP'); }
      catch (error) { this.fail('無法停止：' + error.message); }
    }

    enqueue(line) {
      if (line.trim() === '# ANALYSIS CAPABLE') {
        this.ready = true;
        if (!this.active && this.phase !== 'failed') this.update('Q4 裝置已就緒');
        else this.update();
        return;
      }
      // Invalidate immediately on reboot, even if an earlier disk close is still pending.
      if (line.trim() === '# ANALYSIS READY') {
        if (this.active) this.fail('裝置重新啟動，紀錄不完整');
        this.deviceLines = [];
        this.ready = true;
        if (!this.active && this.phase !== 'failed') this.update('Q4 裝置已就緒');
        else this.update();
        return;
      }
      const task = this.lineQueue.then(() => this.accept(line));
      this.lineQueue = task.catch(error => this.fail('資料處理失敗：' + error.message));
    }

    async accept(line) {
      line = line.trim();
      const session = this.session;
      if (line.startsWith('#') && !line.startsWith('# SESSION')) {
        if (line.length > 512) {
          if (this.active) this.fail('裝置回傳文字過長，紀錄不完整');
          return;
        }
        if (this.phase !== 'starting' || session?.marker) {
          this.deviceLines = [...this.deviceLines, line].slice(-6);
          this.update();
        }
        return;
      }
      if (!session || session.failed || !['starting', 'recording', 'stopping'].includes(this.phase)) return;
      const marker = /^# SESSION ([1-9]\d*)$/.exec(line);
      if (marker) {
        const id = Number(marker[1]);
        if (this.phase === 'starting' && !session.marker) {
          if (uint32(id) && id === session.id) session.marker = true;
          return;
        }
        this.fail('收到另一段紀錄的回應，紀錄不完整');
        return;
      }
      if (this.phase === 'starting' && !session.marker) return;
      if (!line) return;
      if (line === this.api.header) {
        if (this.phase === 'starting' && !session.header) { session.header = true; return; }
        this.fail('紀錄欄名重複出現，紀錄不完整');
        return;
      }
      if (line.startsWith('#')) {
        this.fail('收到非預期裝置訊息，紀錄不完整');
        return;
      }
      let row;
      try {
        row = this.api.parseLine(line);
        if (!row) throw Error('沒有資料列');
        if (![row.time, row.count, row.alarm].every(uint32)) throw Error('整數超出 uint32 範圍');
        if (this.phase === 'starting' && (!session.header || row.event !== 'START')) {
          throw Error('本次回應缺少欄名或開始紀錄');
        }
        this.api.validate([...session.rows, row]);
        if (row.event === 'STOP' && this.phase !== 'stopping') throw Error('未要求停止卻收到停止紀錄');
      } catch (error) {
        this.fail('收到無效資料：' + error.message);
        return;
      }
      if (row.event === 'START') this.clearTimer();
      if (row.event === 'STOP') {
        this.clearTimer();
        this.phase = 'finishing';
        this.update('正在保存最後一筆並回傳結果');
      }
      try {
        await this.append(session, line + '\r\n');
        session.rows.push(row);
        session.summary = this.api.summarize(session.rows);
        if (session.failed || this.session !== session) { this.update(); return; }
        const summary = session.summary;
        const fields = this.api.analysisFields ? this.api.analysisFields(summary) :
          [summary.count, summary.alarm, summary.longest];
        const sent = await this.command(['ANALYSIS', session.id, row.time, ...fields].join(' '),
          () => !session.failed && this.session === session);
        if (!sent || session.failed) return;
        session.feedbackTime = row.time;
        if (row.event === 'START') {
          this.phase = 'recording';
          this.update('正在紀錄，CSV 已更新');
        } else if (row.event === 'STOP') {
          session.complete = true;
          this.phase = 'complete';
          this.update('紀錄完成，CSV 已保存，最後分析已傳送');
        } else this.update('正在紀錄，CSV 已更新');
      } catch (error) {
        this.fail('保存或回傳失敗：' + error.message);
      }
    }

    fail(message) {
      this.clearTimer();
      const session = this.session;
      if (session?.failed) return;
      if (session) { session.failed = true; session.reason = message; session.complete = false; }
      this.phase = 'failed';
      this.recovering = true;
      this.update(message + (session?.handle ? '；CSV 保留在所選資料夾' : ''));
      const off = this.port ? this.command('PC_OFF').catch(() => false) : Promise.resolve(false);
      this.failureTask = (async () => {
        await this.preparationTask.catch(() => {});
        await this.lineQueue;
        await this.fileQueue;
        if (session?.handle) {
          try { await this.append(session, '# INCOMPLETE ' + message.replace(/[\r\n]/g, ' ') + '\r\n'); }
          catch (_) { this.message += '；無法再寫入檔案'; }
        }
        if (!await off && this.port) this.message += '；未能通知裝置停止分析';
        this.recovering = false;
        this.update();
      })();
    }

    async readLoop(port) {
      const decoder = new TextDecoder('utf-8', {fatal: true});
      let buffer = '';
      const reader = port.readable.getReader();
      this.reader = reader;
      try {
        while (true) {
          const {value, done} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream: true});
          let end;
          while ((end = buffer.indexOf('\n')) >= 0) {
            if (end > 4096) throw Error('單筆資料過長');
            this.enqueue(buffer.slice(0, end).replace(/\r$/, ''));
            buffer = buffer.slice(end + 1);
          }
          if (buffer.length > 4096) throw Error('資料過長或缺少換行');
        }
        buffer += decoder.decode();
        await this.lineQueue;
        if (!this.closing) {
          this.ready = false;
          if (this.active || buffer.trim()) this.fail('裝置連線結束，紀錄不完整');
          else this.update('裝置連線已結束');
        }
      } catch (error) {
        this.ready = false;
        if (!this.closing) {
          if (this.active) this.fail('裝置中斷：' + error.message);
          else this.update('裝置連線中斷：' + error.message);
        }
      } finally {
        reader.releaseLock();
        if (this.reader === reader) this.reader = null;
        this.update();
      }
    }

    async disconnect() {
      if (!this.port || this.closing || this.phase === 'connecting') return;
      this.closing = true;
      const port = this.port;
      if (this.active) this.fail('未完成紀錄就中斷連線，紀錄不完整');
      this.update();
      try {
        await this.failureTask;
        await this.lineQueue;
        await this.fileQueue;
        await this.command('PC_OFF').catch(() => false);
        await this.serialQueue;
        if (this.reader) {
          try { await this.reader.cancel(); } catch (_) { /* An errored stream still releases its lock in readLoop. */ }
        }
        if (this.readTask) await this.readTask;
        await port.close();
        this.port = null;
        this.readTask = null;
        this.ready = false;
        if (this.phase !== 'failed') this.update('已中斷連線');
      } catch (error) { this.update('無法完整關閉連線：' + error.message); }
      finally { this.closing = false; this.update(); }
    }
  }

  if (typeof module !== 'undefined') module.exports = {AnalysisClient};
  else root.AlarmAnalysis = {AnalysisClient};

  if (typeof document === 'undefined' || !document.getElementById('analysis-app')) return;
  const $ = id => document.getElementById(id);
  const api = root.AlarmLog;
  const supported = 'serial' in navigator && typeof root.showDirectoryPicker === 'function';
  let renderPending = false;
  const client = new AnalysisClient(api, {changed: () => {
    controls();
    if (!renderPending) {
      renderPending = true;
      requestAnimationFrame(() => { renderPending = false; render(); });
    }
  }});
  root.analysisClient = client;

  function controls() {
    const locked = client.busy || client.phase === 'connecting';
    $('connect').disabled = !supported || !!client.port || locked;
    $('folder').disabled = !supported || locked;
    $('start').disabled = !supported || !client.port || !client.ready || !client.directory || locked;
    $('stop').disabled = client.phase !== 'recording' || client.closing;
    $('disconnect').disabled = !client.port || client.closing || client.phase === 'connecting';
    $('report').disabled = !client.session?.rows.length || locked;
    $('status').textContent = client.message;
    $('status').dataset.state = client.phase;
    $('folder-name').textContent = client.directory?.name ?? '未選擇';
    $('filename').textContent = client.session?.name || '--';
    $('saved').textContent = client.session?.rows.length ?? 0;
    $('file-state').textContent = client.session?.failed ? '不完整' : client.session?.complete ? '完成' : client.active ? '紀錄中' : '--';
    $('device-return').textContent = client.deviceLines.join('\n') || '尚未收到裝置回傳';
  }

  function render() {
    const session = client.session;
    const rows = session?.rows ?? [];
    const summary = rows.length ? api.summarize(rows, session.reason) : null;
    const valid = summary && !session.failed;
    $('count').textContent = valid ? summary.count : '--';
    $('total').textContent = valid ? api.seconds(summary.alarm) + ' s' : '--';
    $('longest').textContent = valid ? api.seconds(summary.longest) + ' s' : '--';
    $('failed').textContent = summary ? summary.unknown : '--';
    const last = rows.at(-1);
    $('live').textContent = last ? 'T:' + (last.t ?? '--') + ' C　RH:' + (last.rh ?? '--') + ' %　' + last.state : 'T:-- C　RH:-- %　WAIT';
    $('feedback').textContent = session?.failed ? '已停止回傳' : session?.feedbackTime !== null && session?.feedbackTime !== undefined ?
      '已傳送：' + api.seconds(session.feedbackTime) + ' s · 紀錄 ' + session.id : '尚未傳送';
    const warnings = summary?.warnings.filter(text => !client.active || !text.startsWith('未收到裝置的停止紀錄')) ?? [];
    $('warnings').replaceChildren(...warnings.map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    $('events').replaceChildren(...(summary?.notable.slice(-100) ?? []).map(row => {
      const tr = document.createElement('tr');
      for (const value of [api.seconds(row.time), api.names[row.event], row.state]) {
        const td = document.createElement('td'); td.textContent = value; tr.append(td);
      }
      return tr;
    }));
    if (summary) {
      api.chart($('temperature'), rows, 't', 'T / °C', summary.limitT);
      api.chart($('humidity'), rows, 'rh', 'RH / %', summary.limitRh);
    } else {
      for (const id of ['temperature', 'humidity']) {
        const canvas = $(id); canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  $('connect').onclick = () => client.connect(navigator.serial);
  $('folder').onclick = () => client.chooseFolder(options => root.showDirectoryPicker(options));
  $('start').onclick = () => client.start();
  $('stop').onclick = () => client.stop();
  $('disconnect').onclick = () => client.disconnect();
  $('report').onclick = () => {
    const session = client.session;
    if (!session?.rows.length || client.busy) return;
    render();
    const html = api.reportHtml(session.rows, session.reason, [$('temperature').toDataURL(), $('humidity').toDataURL()]);
    const url = URL.createObjectURL(new Blob([html], {type: 'text/html;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = session.name.replace(/\.csv$/, '_report.html'); anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  navigator.serial?.addEventListener('disconnect', event => {
    if ((event.port || event.target) !== client.port) return;
    client.ready = false;
    if (client.active) client.fail('USB 已拔除，紀錄不完整');
    else client.update('USB 已拔除');
    void client.disconnect();
  });
  root.addEventListener('beforeunload', event => {
    if (client.port || client.busy) { event.preventDefault(); event.returnValue = ''; }
  });
  root.addEventListener('pagehide', () => { void client.disconnect(); });
  root.addEventListener('resize', render);
  if (!supported) client.update('請使用支援序列埠與資料夾存取的桌面 Chrome／Edge');
  controls(); render();
})(typeof window !== 'undefined' ? window : globalThis);
