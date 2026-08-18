import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';

const CHROME = process.env.CHROME || '/c/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9338;

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const profile = `/tmp/sb-foot-cdp-${Date.now()}`;
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--mute-audio',
  `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, 'about:blank',
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let targets = null;
  for (let i = 0; i < 40; i++) {
    try { targets = await getJson(`http://localhost:${PORT}/json/list`); if (targets && targets.length) break; } catch {}
    await sleep(500);
  }
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result?.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
  await sleep(8000);
  const footer = await evaluate(`(() => {
    const body = document.body.innerText;
    return JSON.stringify({
      hasCredit: body.includes('Pankaj Upadhyay'),
      hasHeart: body.includes('❤️') || body.includes('♥'),
      snippet: body.slice(body.indexOf('Pankaj') > -1 ? body.indexOf('Pankaj') - 30 : body.length - 100, body.indexOf('Pankaj') > -1 ? body.indexOf('Pankaj') + 60 : body.length).trim()
    });
  })()`);
  console.log('footer:', JSON.parse(footer).hasCredit ? '✅ credit visible' : '❌ not found');
  console.log('  snippet:', JSON.parse(footer).snippet);
  console.log('  heart:', JSON.parse(footer).hasHeart ? '✅' : '❌');

  // Check audio file is fetchable from the Pages site
  const audioCheck = await evaluate(`fetch('/audio/beginner-l1-s1.mp3', {method: 'HEAD'}).then(r => JSON.stringify({ok: r.ok, type: r.headers.get('content-type'), size: r.headers.get('content-length')}))`);
  console.log('audio fetch:', audioCheck);

  const pass = JSON.parse(footer).hasCredit;
  console.log(pass ? '✅ PASS' : '❌ FAIL');
  ws.close();
  process.exit(pass ? 0 : 2);
} finally {
  chrome.kill('SIGKILL');
  execFileSync('rm', ['-rf', profile]);
}
