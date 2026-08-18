// Dashboard for a logged-in user: renders with stats, no errors.
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9337;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const profile = `/tmp/sb-dash-cdp-${Date.now()}`;
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--mute-audio',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let targets = null;
  for (let i = 0; i < 40; i++) {
    try {
      targets = await getJson(`http://localhost:${PORT}/json/list`);
      if (targets && targets.length) break;
    } catch { /* retry */ }
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
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push((msg.params.args || []).map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text || 'exception');
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
  await sleep(4000);
  await evaluate(`localStorage.setItem('sb_user_v1', JSON.stringify({
    id: 'u-dash-e2e', name: 'Priya', email: 'priya@example.com',
    avatarColor: 'rose', createdAt: new Date().toISOString(), isAdmin: false
  })); true`);

  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/dashboard' });
  await sleep(9000);
  const body = await evaluate('document.body ? document.body.innerText : ""');
  const ok = body.includes('Continue Learning') || body.includes('Beginner') || body.includes('Daily English');
  console.log('dashboard for user ->', ok ? '✅ renders' : '❌');
  if (!ok) console.log('   snippet ->', JSON.stringify(body.slice(0, 400)));
  else console.log('   snippet ->', JSON.stringify(body.slice(0, 220)));

  console.log('--- console errors (' + consoleErrors.length + ') ---');
  consoleErrors.slice(0, 8).forEach((e) => console.log('  ', e.slice(0, 250)));
  console.log('--- exceptions (' + exceptions.length + ') ---');
  exceptions.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 250)));

  const pass = ok && consoleErrors.length === 0 && exceptions.length === 0;
  console.log(pass ? '✅ PASS' : '❌ FAIL');
  ws.close();
  process.exit(pass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
