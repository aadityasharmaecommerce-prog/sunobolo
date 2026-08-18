// Mobile responsive test: footer credit visible, no overflow, no errors at 360/390/768px.
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9339;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const profile = '/tmp/sb-mobile-cdp-' + Date.now();
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--mute-audio',
  '--user-data-dir=' + profile, '--remote-debugging-port=' + PORT, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let targets = null;
  for (let i = 0; i < 40; i++) {
    try { targets = await getJson('http://localhost:' + PORT + '/json/list'); if (targets && targets.length) break; } catch {}
    await sleep(500);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  const consoleErrors = [];
  const exceptions = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push((msg.params.args || []).map((a) => a.value || a.description || '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || 'exception');
    }
  };
  const send = (method, params) => new Promise((resolve) => {
    const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id: id, method: method, params: params || {} }));
  });
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result && r.result.result && r.result.result.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const viewports = [
    { w: 360, h: 640, name: '360px (small phone)' },
    { w: 390, h: 844, name: '390px (iPhone 14)' },
    { w: 768, h: 1024, name: '768px (tablet)' },
  ];

  const urls = [
    { url: 'https://sunobolo-english.pages.dev/', label: 'Homepage' },
    { url: 'https://sunobolo-english.pages.dev/courses/beginner/lessons/beginner-l1', label: 'Lesson' },
  ];

  let allPass = true;
  for (const vp of viewports) {
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: true });
    for (const u of urls) {
      consoleErrors.length = 0;
      exceptions.length = 0;
      await send('Page.navigate', { url: u.url });
      await sleep(8000);

      const checkExpr = [
        '(function() {',
        '  var body = document.body;',
        '  var html = document.documentElement;',
        '  var overflowX = html.scrollWidth > html.clientWidth;',
        '  var footer = document.querySelector(".footer__credit");',
        '  var footerRect = footer ? footer.getBoundingClientRect() : null;',
        '  var footerAboveNav = footerRect ? footerRect.bottom < (window.innerHeight + 60) : null;',
        '  var bottomNav = document.querySelector(".bottom-nav");',
        '  var bottomNavVisible = bottomNav ? window.getComputedStyle(bottomNav).display !== "none" : false;',
        '  return JSON.stringify({',
        '    overflowX: overflowX,',
        '    footerAboveNav: footerAboveNav,',
        '    bottomNavVisible: bottomNavVisible,',
        '    bodyLen: body.innerText.length',
        '  });',
        '})()'
      ].join('\n');

      const result = await evaluate(checkExpr);
      const r = JSON.parse(result);
      const errCount = consoleErrors.length + exceptions.length;
      const pass = !r.overflowX && r.bodyLen > 200 && errCount === 0;
      allPass = allPass && pass;

      var status = pass ? 'PASS' : 'FAIL';
      var info = 'overflow=' + r.overflowX + ' footerAboveNav=' + r.footerAboveNav + ' bottomNav=' + r.bottomNavVisible + ' len=' + r.bodyLen + ' errors=' + errCount;
      console.log(vp.name + ' | ' + u.label + ': ' + status + ' (' + info + ')');
    }
  }

  if (consoleErrors.length > 0) {
    console.log('--- console errors (' + consoleErrors.length + ') ---');
    consoleErrors.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 200)));
  }
  if (exceptions.length > 0) {
    console.log('--- exceptions (' + exceptions.length + ') ---');
    exceptions.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 200)));
  }

  console.log(allPass ? 'ALL PASS' : 'SOME FAIL');
  ws.close();
  process.exit(allPass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
