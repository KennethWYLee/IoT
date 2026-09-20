// Local static fixtures only: no broker, device, database, or control requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const assets = path.join(root, 'IOT_Introduction/examples/course_backend/static');
  const output = path.join(root, '_outputs/lesson_review/mobile_shell');
  fs.mkdirSync(output, {recursive:true});
  let forbiddenRequests = 0;
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
      forbiddenRequests++;
      res.writeHead(405).end();
      return;
    }
    const name = new URL(req.url, 'http://localhost').pathname;
    if (name.startsWith('/api/')) {
      const value = name === '/api/stats'
        ? {event_count:0, invalid_event_count:0, command_count:0} : [];
      res.writeHead(200, {'Content-Type':'application/json'}).end(JSON.stringify(value));
      return;
    }
    const files = {'/':'index.html', '/sw.js':'sw.js', '/manifest.json':'manifest.json', '/icon.svg':'icon.svg'};
    if (!files[name]) {res.writeHead(404).end(); return;}
    const mime = {'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml'};
    res.writeHead(200, {'Content-Type':mime[path.extname(files[name])]});
    res.end(fs.readFileSync(path.join(assets, files[name])));
  });
  // Reject WebSocket upgrades; the disconnected UI is expected in this fixture.
  server.on('upgrade', (_, socket) => socket.destroy());
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || 'msedge'});
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = `http://127.0.0.1:${server.address().port}`;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#event-count').textContent === '0');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    const screenshots = [];
    for (const [label, width, height] of [['desktop',1280,800], ['phone',390,844]]) {
      await page.setViewportSize({width,height});
      assert.equal(await page.locator('#send-command').isDisabled(), true);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, `${label}: page overflow`);
      const file = path.join(output, `${label}.png`);
      await page.screenshot({path:file, fullPage:true});
      screenshots.push(path.relative(root, file));
    }
    const cached = await page.evaluate(async () => {
      const cache = await caches.open('iot-course-shell-v1');
      return (await cache.keys()).map(request => new URL(request.url).pathname);
    });
    assert(cached.includes('/') && cached.includes('/manifest.json') && cached.includes('/icon.svg'));
    assert(!cached.some(name => name.startsWith('/api/')));
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.querySelector('#network-status').textContent.includes('offline'));
    assert.equal(await page.locator('h1').textContent(), 'IoT Course Console');
    assert.equal(await page.locator('#send-command').isDisabled(), true);
    assert.equal(await page.evaluate(() => fetch('/api/events').then(() => true, () => false)), false);
    assert.equal(forbiddenRequests, 0);
    assert.deepEqual(errors, []);
    await page.screenshot({path:path.join(output, 'offline.png'), fullPage:true});
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({
      mode:'loopback static server with empty synthetic GET responses',
      viewports:[[1280,800],[390,844]], cached, screenshots, forbiddenRequests,
      serviceWorker:'registered and controlling on localhost',
      offline:'cached shell loads; API fails; command button disabled',
      limitations:'No real phone, LAN, HTTPS install, live WebSocket, device or database test.'
    }, null, 2) + '\n');
    console.log('PASS: desktop/phone viewport, viewer disabled, localhost worker, cached shell, offline API failure; no control request.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => {console.error(error); process.exitCode=1;});
