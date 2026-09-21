// Temporary CLS repro: serves dist, records LayoutShift entries with timestamps.
const { execSync } = require('node:child_process');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=360,640'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true });
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 11; moto g power (2021)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  );
  const cdp = await page.createCDPSession();
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 1638400, uploadThroughput: 750000,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluateOnNewDocument(() => {
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({
          t: Math.round(e.startTime),
          v: +e.value.toFixed(4),
          nodes: (e.sources || []).map((s) => {
            const n = s.node;
            if (!n || !n.tagName) return '?';
            return `<${n.tagName.toLowerCase()} class="${n.className?.baseVal ?? n.className ?? ''}" id="${n.id ?? ''}">`.slice(0, 110);
          }),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('http://127.0.0.1:4322/', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 9000));
  const shifts = await page.evaluate(() => window.__shifts);
  console.log(JSON.stringify(shifts, null, 1).slice(0, 4000));
  await browser.close();
})().catch((e) => {
  console.error('REPRO-FAIL:', e.message);
  process.exit(1);
});
