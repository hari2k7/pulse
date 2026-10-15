const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\hari\\.gemini\\antigravity-ide\\brain\\4aac6c6a-35bd-4934-bb39-9fde28e5e798';
const BASE_URL = 'http://localhost:5173';
const ROBOTICS_ID = '4819d0b0-4b31-527d-ab30-44cf58ed3b11';

const viewports = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1920', width: 1920, height: 1080 },
];

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    for (const vp of viewports) {
      console.log(`\n--- Capturing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      // 1. Home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 700));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `home_${vp.name}.png`) });
      console.log(`Captured home_${vp.name}.png`);

      // 2. Events (type search to show single X button)
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 700));
      await page.type('input[type="search"]', 'Robotics');
      await new Promise(r => setTimeout(r, 300));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `events_${vp.name}.png`) });
      console.log(`Captured events_${vp.name}.png`);

      // 3. Detail with More in Theme row
      await page.goto(`${BASE_URL}/events/${ROBOTICS_ID}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 700));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `detail_${vp.name}.png`) });
      console.log(`Captured detail_${vp.name}.png`);

      // 4. Detail with Lightbox open (for 1280 and 375)
      if (vp.name === '1280' || vp.name === '375') {
        const btn = await page.$('button[aria-label^="Open image "]');
        if (btn) {
          await btn.click();
          await new Promise(r => setTimeout(r, 500));
          await page.screenshot({ path: path.join(ARTIFACT_DIR, `lightbox_${vp.name}.png`) });
          console.log(`Captured lightbox_${vp.name}.png`);
        }
      }

      await page.close();
    }
    console.log('\nAll viewport screenshots successfully updated!');
  } finally {
    await browser.close();
  }
}

capture().catch(console.error);
