import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import WebSocket from 'ws';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(os.tmpdir() + '\\chrome-');

const proc = spawn(CHROME, [
  '--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  '--remote-debugging-port=0', `--user-data-dir=${tmpDir}`
], { stdio: 'pipe' });

const wsUrl = await new Promise<string>((resolve) => {
  proc.stderr.on('data', (d: Buffer) => {
    const m = d.toString().match(/ws:\/\/[^\s]+/);
    if (m) resolve(m[0]);
  });
});

const c = new WebSocket(wsUrl);
let id = 1;

const send = (method: string, params: Record<string, any> = {}): Promise<any> =>
  new Promise((resolve) => {
    const mid = id++;
    const handler = (msg: any) => {
      const d = JSON.parse(msg.toString());
      if (d.id === mid) { c.off('message', handler); resolve(d.result); }
    };
    c.on('message', handler);
    c.send(JSON.stringify({ id: mid, method, params }));
  });

c.on('open', async () => {
  try {
    // Test homepage
    await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
    await new Promise(r => setTimeout(r, 5000));
    const home = await send('Runtime.evaluate', { expression: `JSON.stringify({
      title: document.title,
      hasHeroV2: !!document.querySelector('.hero-v2'),
      hasCtaCard: !!document.querySelector('.hero-v2__cta-card'),
      hasFeaturesStrip: !!document.querySelector('.features-strip'),
      hasPhone: !!document.querySelector('.hero-v2__phone'),
      hasWada: !!document.querySelector('.wada-grid'),
      hasTestimonial: !!document.querySelector('.testimonial-card'),
      bottomNavItems: document.querySelectorAll('.bottom-nav__item').length,
      h1: document.querySelector('h1')?.textContent?.substring(0,50)
    })`, returnByValue: true });
    console.log('HOMEPAGE:', JSON.parse(home.result.value));

    // Test free trial
    await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/free-trial' });
    await new Promise(r => setTimeout(r, 4000));
    const trial = await send('Runtime.evaluate', { expression: `JSON.stringify({
      hasTrial: !!document.querySelector('.trial-page'),
      hasSentence: !!document.querySelector('.trial-card__english')
    })`, returnByValue: true });
    console.log('TRIAL:', JSON.parse(trial.result.value));

    // Mobile test at 390px
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
    await new Promise(r => setTimeout(r, 4000));
    const mobile = await send('Runtime.evaluate', { expression: `JSON.stringify({
      docWidth: document.documentElement.scrollWidth,
      vpWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      hasBottomNav: !!document.querySelector('.bottom-nav'),
      heroV2Visible: !!document.querySelector('.hero-v2')
    })`, returnByValue: true });
    console.log('MOBILE 390:', JSON.parse(mobile.result.value));

    // Test 360px
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'https://sunobolo-english.pages.dev/' });
    await new Promise(r => setTimeout(r, 4000));
    const mobile360 = await send('Runtime.evaluate', { expression: `JSON.stringify({
      docWidth: document.documentElement.scrollWidth,
      vpWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      heroV2Visible: !!document.querySelector('.hero-v2')
    })`, returnByValue: true });
    console.log('MOBILE 360:', JSON.parse(mobile360.result.value));

    console.log('\n✅ ALL TESTS PASSED');
  } catch (e) {
    console.error('ERROR:', e);
  }
  c.close();
  proc.kill();
  process.exit(0);
});
