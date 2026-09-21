// Temporary: CDP trace capture to name the layout-shift invalidator. Delete after use.
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

  let events = [];
  let tracingDone;
  const done = new Promise((r) => { tracingDone = r; });
  cdp.on('Tracing.dataCollected', (e) => { events.push(...e.value); });
  cdp.on('Tracing.tracingComplete', () => tracingDone());

  await cdp.send('Tracing.start', {
    transferMode: 'ReportEvents',
    traceConfig: {
      includedCategories: [
        'devtools.timeline',
        'disabled-by-default-devtools.timeline',
        'disabled-by-default-devtools.timeline.stack',
        'blink.user_timing',
        'loading',
      ],
    },
  });

  await page.goto('https://kinetic-design-agency.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 14000));
  await cdp.send('Tracing.end');
  await done;

  const nav = events.find((e) => e.name === 'navigationStart');
  const t0 = nav ? nav.ts : 0;
  const shifts = events.filter((e) => e.name === 'LayoutShift' && e.args?.data?.had_recent_input === false);
  console.log(`layout shifts: ${shifts.length}`);
  for (const s of shifts.slice(0, 12)) {
    const d = s.args.data;
    console.log(
      `t=${Math.round((s.ts - t0) / 1000)}ms score=${(+d.weighted_score_delta).toFixed(4)} nodes=${(d.impacted_nodes || []).length}`,
    );
  }
  const inv = events.filter((e) => e.name === 'LayoutInvalidationTracking');
  console.log(`invalidations: ${inv.length}`);
  const byReason = {};
  for (const e of inv) {
    const r = e.args?.data?.reason || '?';
    byReason[r] = (byReason[r] || 0) + 1;
  }
  console.log('reasons:', JSON.stringify(byReason));
  // stacks of invalidations near the biggest shift time
  const scored = shifts.map((s) => ({ t: s.ts, v: s.args.data.weighted_score_delta }));
  scored.sort((a, b) => b.v - a.v);
  if (scored[0]) {
    console.log('biggest shift nearby invalidations:');
    inv
      .filter((e) => Math.abs(e.ts - scored[0].t) < 500000)
      .slice(0, 8)
      .forEach((e) => {
        const st = (e.args?.data?.stackTrace || []).map((f) => f.functionName || '(anon)').join(' <- ');
        console.log(`  t=${Math.round((e.ts - t0) / 1000)}ms reason=${e.args?.data?.reason} stack=${st.slice(0, 220)}`);
      });
  }
  await browser.close();
})().catch((e) => {
  console.error('TRACE-FAIL:', e.message);
  process.exit(1);
});
