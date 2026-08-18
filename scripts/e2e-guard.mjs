// Verify admin guard: no panel content for logged-out / non-admin users.
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9335;

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

const profile = `/tmp/sb-guard-cdp-${Date.now()}`;
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
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
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

  // Logged out → guard card, no panel
  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/admin' });
  await sleep(6000);
  const loggedOut = await evaluate(`(() => {
    const body = document.body.innerText;
    return JSON.stringify({
      showsGuard: body.includes('Admin access required'),
      leaksPanel: body.includes('Sentences') && body.includes('Packages') && body.includes('Analytics')
    });
  })()`);
  console.log('logged-out:', loggedOut, JSON.parse(loggedOut).showsGuard && !JSON.parse(loggedOut).leaksPanel ? '✅' : '❌');

  // Normal (non-admin) user → guard card, no panel
  await evaluate(`localStorage.setItem('sb_user_v1', JSON.stringify({
    id: 'u-plain', name: 'Rahul', email: 'rahul@example.com',
    avatarColor: 'emerald', createdAt: new Date().toISOString(), isAdmin: false
  })); true`);
  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/admin' });
  await sleep(6000);
  const plainUser = await evaluate(`(() => {
    const body = document.body.innerText;
    return JSON.stringify({
      showsGuard: body.includes('Admin access required'),
      leaksPanel: body.includes('Sentences') && body.includes('Packages') && body.includes('Analytics')
    });
  })()`);
  console.log('non-admin user:', plainUser, JSON.parse(plainUser).showsGuard && !JSON.parse(plainUser).leaksPanel ? '✅' : '❌');

  const pass =
    JSON.parse(loggedOut).showsGuard && !JSON.parse(loggedOut).leaksPanel &&
    JSON.parse(plainUser).showsGuard && !JSON.parse(plainUser).leaksPanel;
  console.log(pass ? '✅ PASS' : '❌ FAIL');
  ws.close();
  process.exit(pass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
