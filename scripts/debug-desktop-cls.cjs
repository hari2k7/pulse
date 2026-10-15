const puppeteer = require('puppeteer-core');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1350, height: 940, deviceScaleFactor: 1 });

  const client = await page.target().createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8
  });

  await page.evaluateOnNewDocument(() => {
    window.__shifts = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__shifts.push({
            value: entry.value,
            sources: (entry.sources || []).map(s => ({
              nodeName: s.node ? s.node.nodeName : 'unknown',
              className: s.node ? s.node.className : '',
              id: s.node ? s.node.id : '',
              prevRect: s.previousRect,
              currRect: s.currentRect
            }))
          });
        }
      }
    });
    observer.observe({ type: 'layout-shift', buffered: true });
  });

  await page.goto('http://localhost:4173/favorites', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));

  const shifts = await page.evaluate(() => window.__shifts);
  console.log('Layout Shifts with Throttling:', JSON.stringify(shifts, null, 2));

  await browser.close();
}

main().catch(console.error);
