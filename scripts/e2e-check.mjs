// End-to-end check: load the live Cloudflare Pages site in headless Chrome,
// wait for real network fetches to the Worker API, then report what rendered.
// Usage: node scripts/e2e-check.mjs <url> [waitMs]
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.argv[2] || 'https://sunobolo-english.pages.dev';
const WAIT_MS = parseInt(process.argv[3] || '9000', 10);
const PORT = 9333;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const profile = `/tmp/sb-cdp-${Date.now()}`;
const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-extensions',
  '--mute-audio',
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${PORT}`,
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // Wait for the debugging endpoint
  let targets = null;
  for (let i = 0; i < 40; i++) {
    try {
      targets = await getJson(`http://localhost:${PORT}/json/list`);
      if (targets && targets.length) break;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  if (!targets || !targets.length) {
    console.log('FAIL: chrome debugging endpoint never came up');
    process.exit(1);
  }

  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let msgId = 0;
  const pending = new Map();
  const consoleErrors = [];
  const exceptions = [];

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
      if (msg.params.type === 'error') consoleErrors.push(args);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      exceptions.push(d.exception?.description || d.text || 'exception');
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++msgId;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: URL });

  // Wait real time for the SPA + API fetches
  await sleep(WAIT_MS);

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const body = document.body ? document.body.innerText : '';
      const meta = document.querySelector('meta[name="description"]');
      return JSON.stringify({
        title: document.title,
        hasCourseData: body.includes('Beginner') || body.includes('Interview') || body.includes('Travel') || body.includes('Kids English'),
        hasHindi: body.includes('मेरा नाम') || body.includes('नमस्ते') || body.includes('मैं'),
        bodyLen: body.length,
        bodySnippet: body.slice(0, 300),
        url: location.href
      });
    })()`,
    returnByValue: true,
  });

  const report = JSON.parse(evalRes.result.result.value);
  console.log('=== E2E RESULT ===');
  console.log(JSON.stringify(report, null, 2));
  console.log('--- console errors (' + consoleErrors.length + ') ---');
  consoleErrors.slice(0, 10).forEach((e) => console.log('  ', e.slice(0, 300)));
  console.log('--- exceptions (' + exceptions.length + ') ---');
  exceptions.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 300)));

  const pass =
    report.hasCourseData &&
    consoleErrors.length === 0 &&
    exceptions.length === 0;
  console.log(pass ? '✅ PASS' : '❌ FAIL');
  ws.close();
  process.exit(pass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
