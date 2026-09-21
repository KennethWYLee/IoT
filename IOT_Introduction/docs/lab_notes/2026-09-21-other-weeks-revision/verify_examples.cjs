// Local tests only: no server, MQTT connection, serial port or hardware access.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const course = path.resolve(__dirname, '../../..');
const read = p => fs.readFileSync(path.join(course, p), 'utf8').replace(/\r\n/g, '\n');

for (const week of [3, 4, 5, 6, 7]) {
  const lesson = read(`docs/teaching_drafts/week${week}_redesign/week${week}_main.md`);
  const ids = [...lesson.matchAll(/<!-- page: (\S+) \|/g)].map(m => m[1]);
  assert.equal(ids.indexOf('buildresults'), ids.indexOf('buildexercise') + 1);
  assert.equal(ids.indexOf('buildanswer'), ids.indexOf('buildresults') + 1);
  assert.equal(ids.indexOf('answer'), ids.indexOf('exercise') + 1);
  assert(!/舊教材|TPO|做完再講|再翻頁|先不要翻頁|重設稿/.test(lesson));
  const builder = read(`docs/teaching_drafts/week${week}_redesign/build.cjs`);
  assert(!builder.includes('一起操作 → 看到結果 → 解釋原理'));
}

const lesson14 = read('Week_14_Mobile_PWA/week14_main.md');
const snippet = [...lesson14.matchAll(/```javascript\s*\n([\s\S]*?)\n```/g)]
  .map(m => m[1]).find(block => block.includes('window.confirm'));
assert(snippet);
const html = read('examples/course_backend/static/index.html');
const start = html.indexOf("document.querySelector('#command-form').addEventListener");
const end = html.indexOf("window.addEventListener('online'", start);
let handler = html.slice(start, end).trim();
const guard = 'if (!deviceId || !operatorKey || !navigator.onLine || !wsConnected) return;';
assert.equal(handler.split(guard).length, 2);
handler = handler.replace(guard, guard + '\n' + snippet);

async function tryCommand(command, confirmed, key = 'host-fixture') {
  let submit;
  const confirmations = [], requests = [], status = [];
  const ui = {deviceId: {value: 'team03-device01'}, sendButton: {disabled: false}, commandStatus: {}};
  const context = {
    ui, operatorKey: key, navigator: {onLine: true}, wsConnected: true,
    document: {querySelector(selector) {
      if (selector === '#command-form') return {addEventListener: (_, fn) => { submit = fn; }};
      if (selector === '#command') return {value: command};
      throw Error('Unexpected DOM selector ' + selector);
    }},
    window: {confirm(message) { confirmations.push(message); return confirmed; }},
    setStatus: (_, message) => status.push(message),
    fetchJson: async (url, options) => {
      requests.push({url, body: JSON.parse(options.body)});
      return {command_id: 'host-command'};
    },
    refresh: async () => {},
    updateAvailability: () => { ui.sendButton.disabled = false; }
  };
  vm.runInNewContext(handler, context);
  await submit({preventDefault() {}});
  return {confirmations, requests, ui, status};
}

(async () => {
  const cancel = await tryCommand('start', false);
  assert.equal(cancel.requests.length, 0);
  assert.equal(cancel.confirmations.length, 1);
  assert(cancel.confirmations[0].includes('team03-device01'));
  assert(cancel.confirmations[0].includes('start'));
  assert.equal(cancel.ui.sendButton.disabled, false);
  const accept = await tryCommand('start', true);
  assert.equal(accept.requests.length, 1);
  assert.equal(accept.requests[0].body.command, 'start');
  assert.equal(accept.requests[0].url, '/api/commands');
  const stop = await tryCommand('stop', false);
  assert.equal(stop.confirmations.length, 0);
  assert.equal(stop.requests.length, 1);
  assert.equal(stop.requests[0].body.command, 'stop');
  const viewer = await tryCommand('start', true, '');
  assert.equal(viewer.confirmations.length, 0);
  assert.equal(viewer.requests.length, 0);

  // Independent arithmetic for the stated valid-sample scenario, not firmware execution.
  const raw = [300, 310, 305, 315, 900, 910, 905, 915];
  function expectedStates(required) {
    let state = 'IDLE', streak = 0;
    return raw.map(value => {
      const matches = state === 'IDLE' ? value <= 513 : value >= 706;
      streak = matches ? streak + 1 : 0;
      if (streak >= required) {
        state = state === 'IDLE' ? 'ACTIVE' : 'IDLE';
        streak = 0;
      }
      return state;
    });
  }
  assert.deepEqual(expectedStates(3), ['IDLE','IDLE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','IDLE','IDLE']);
  assert.deepEqual(expectedStates(4), ['IDLE','IDLE','IDLE','ACTIVE','ACTIVE','ACTIVE','ACTIVE','IDLE']);
  const lesson15 = read('Week_15_Automation_and_Safety/week15_main.md');
  assert(lesson15.includes('four_dark_samples') && lesson15.includes('four_light_samples'));
  console.log('PASS: exercise/result/answer order, removed narration, actual UI handler with lesson snippet, and independent Week 15 table calculation.');
  console.log('No HTTP/MQTT requests, browser, firmware upload or physical test performed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
