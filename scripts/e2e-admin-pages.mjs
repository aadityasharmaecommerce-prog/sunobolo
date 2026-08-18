// Admin pages load real API data: lessons (43) + sentences (390).
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9336;

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

const profile = `/tmp/sb-pages-cdp-${Date.now()}`;
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

  // Land on the site first (correct origin), THEN set the admin user, then reload
  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
  await sleep(4000);
  const setOk = await evaluate(`localStorage.setItem('sb_user_v1', JSON.stringify({
    id: 'u-admin-e2e', name: 'Admin', email: 'admin@sunobolo.com',
    avatarColor: 'sky', createdAt: new Date().toISOString(), isAdmin: true
  })); localStorage.getItem('sb_user_v1') ? 'ok' : 'fail'`);
  console.log('user set ->', setOk);

  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/admin/lessons' });
  await sleep(9000);
  const lessonsBody = await evaluate('document.body ? document.body.innerText : ""');
  const lessonsOk = lessonsBody.includes('Introduction') && lessonsBody.includes('Greetings');
  console.log('admin lessons from API ->', lessonsOk ? '✅ lessons listed' : '❌');
  if (!lessonsOk) console.log('   snippet ->', JSON.stringify(lessonsBody.slice(0, 400)));

  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/admin/sentences' });
  await sleep(9000);
  const sentencesBody = await evaluate('document.body ? document.body.innerText : ""');
  const sentencesOk = sentencesBody.includes('My name is Rahul') && sentencesBody.includes('मेरा नाम');
  console.log('admin sentences from API ->', sentencesOk ? '✅ sentence rows listed' : '❌');
  if (!sentencesOk) console.log('   snippet ->', JSON.stringify(sentencesBody.slice(0, 400)));

  console.log('--- console errors (' + consoleErrors.length + ') ---');
  consoleErrors.slice(0, 8).forEach((e) => console.log('  ', e.slice(0, 250)));
  console.log('--- exceptions (' + exceptions.length + ') ---');
  exceptions.slice(0, 5).forEach((e) => console.log('  ', e.slice(0, 250)));

  const pass = setOk === 'ok' && lessonsOk && sentencesOk && consoleErrors.length === 0 && exceptions.length === 0;
  console.log(pass ? '✅ PASS' : '❌ FAIL');
  ws.close();
  process.exit(pass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
