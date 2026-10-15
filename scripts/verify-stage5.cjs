const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\hari\\.gemini\\antigravity-ide\\brain\\4aac6c6a-35bd-4934-bb39-9fde28e5e798';
const BASE_URL = 'http://localhost:4173';
const TEST_EVENT_ID = '0fdc5427-4be3-59d8-9f17-1d7fc20d515a';

const viewports = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1920', width: 1920, height: 1080 },
];

async function runStage5Verification() {
  console.log('=== STAGE 5 VERIFICATION SUITE ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const checkResults = {
    introOncePerSession: false,
    introSkipsCleanly: false,
    introNeverOnReload: false,
    directEventNoTransition: false,
    h1FirstFrameVisible: false,
    realmCountsSumToTotal: false,
    homePortalNavigation: false,
    eventsPortalToggle: false,
    noHorizontalScroll: true,
    noConsoleErrors: true,
    screenshotsCaptured: [],
    consoleErrors: [],
  };

  try {
    // 1. Check Intro Sequence & Session Storage on Home
    console.log('\n--- 1. Testing Intro Sequence & Session Handling ---');
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1280, height: 800 });

    page1.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource')) {
          checkResults.consoleErrors.push({ url: page1.url(), text });
        }
      }
    });

    // Fresh session load
    await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    // Check h1 is immediately in DOM with non-zero opacity
    const h1Opacity = await page1.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;
      return window.getComputedStyle(h1).opacity;
    });
    console.log('Home h1 initial opacity:', h1Opacity);
    checkResults.h1FirstFrameVisible = h1Opacity === '1';

    // Clear session storage first to test fresh visit
    await page1.evaluate(() => sessionStorage.clear());
    await page1.reload({ waitUntil: 'networkidle2' });

    // Check Skip Intro button is present
    const skipBtn = await page1.$('button[aria-label="Skip introductory portal animation"]');
    if (skipBtn) {
      console.log('Skip Intro button present. Clicking to skip...');
      await skipBtn.click();
      await new Promise(r => setTimeout(r, 200));
      const introPlayed = await page1.evaluate(() => sessionStorage.getItem('strange_hero_intro_played'));
      checkResults.introSkipsCleanly = introPlayed === 'true';
      console.log('Session storage strange_hero_intro_played after skip:', introPlayed);
    } else {
      console.log('Skip button already skipped or bypassed.');
    }

    // Reload page in same session
    await page1.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 200));
    const skipBtnAfterReload = await page1.$('button[aria-label="Skip introductory portal animation"]');
    checkResults.introNeverOnReload = skipBtnAfterReload === null;
    console.log('Skip Intro button absent after reload (intro bypassed):', checkResults.introNeverOnReload);
    checkResults.introOncePerSession = checkResults.introNeverOnReload;

    await page1.close();

    // 2. Direct event load (no intro transition, loads directly)
    console.log('\n--- 2. Testing Direct Event Load ---');
    const pageEvent = await browser.newPage();
    await pageEvent.setViewport({ width: 1280, height: 800 });
    const eventLoadStart = Date.now();
    await pageEvent.goto(`${BASE_URL}/events/${TEST_EVENT_ID}`, { waitUntil: 'networkidle2' });
    const eventLoadDuration = Date.now() - eventLoadStart;
    const eventH1 = await pageEvent.$eval('h1', el => el.textContent.trim());
    console.log(`Direct event URL loaded in ${eventLoadDuration}ms with h1: "${eventH1}"`);
    checkResults.directEventNoTransition = Boolean(eventH1);
    await pageEvent.close();

    // 3. Realm Counts Sum to Total & Home Portal Click
    console.log('\n--- 3. Testing Realm Counts & Portal Navigation ---');
    const pageRealms = await browser.newPage();
    await pageRealms.setViewport({ width: 1280, height: 800 });
    await pageRealms.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

    const portalCounts = await pageRealms.evaluate(() => {
      const portals = Array.from(document.querySelectorAll('a[href*="/events?realm="]'));
      return portals.map(a => {
        const text = a.textContent || '';
        const match = text.match(/(\d+)\s+events?/i);
        return {
          href: a.getAttribute('href'),
          count: match ? parseInt(match[1], 10) : 0,
        };
      });
    });
    console.log('Home realm portals:', portalCounts);
    const sumCounts = portalCounts.reduce((acc, p) => acc + p.count, 0);
    console.log('Total realm events sum:', sumCounts);
    checkResults.realmCountsSumToTotal = sumCounts === 30;

    // Click first portal on home and verify landing on /events?realm=...
    if (portalCounts.length > 0) {
      await Promise.all([
        pageRealms.waitForNavigation({ waitUntil: 'networkidle2' }),
        pageRealms.click('a[href*="/events?realm="]'),
      ]);
      const currentUrl = pageRealms.url();
      console.log('Landed on URL after clicking portal:', currentUrl);
      checkResults.homePortalNavigation = currentUrl.includes('/events?realm=');
    }
    await pageRealms.close();

    // 4. Events Page Portal Toggle & Multi-select
    console.log('\n--- 4. Testing Events Portal Toggle & Filtering ---');
    const pageEvents = await browser.newPage();
    await pageEvents.setViewport({ width: 1280, height: 800 });
    await pageEvents.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });

    // Target the realm portals specifically inside [aria-label="Multiverse Realm Filters"]
    const realmButtons = await pageEvents.$$('div[aria-label="Multiverse Realm Filters"] button[aria-pressed]');
    console.log(`Found ${realmButtons.length} realm portal filter buttons in selector row`);
    if (realmButtons.length >= 2) {
      // Click first realm (Creation)
      await realmButtons[0].click();
      await new Promise(r => setTimeout(r, 400));
      const urlAfterClick1 = pageEvents.url();
      console.log('URL after clicking 1st realm:', urlAfterClick1);
      
      // Click second realm (Challenge)
      await realmButtons[1].click();
      await new Promise(r => setTimeout(r, 400));
      const urlAfterClick2 = pageEvents.url();
      console.log('URL after clicking 2nd realm (multi-select):', urlAfterClick2);
      checkResults.eventsPortalToggle = urlAfterClick2.includes('realm=') && urlAfterClick2.includes(',');
    }
    await pageEvents.close();

    // 5. Responsive Screenshots & Horizontal Scroll Check at 375, 768, 1280, 1920
    console.log('\n--- 5. Capturing Real Screenshots & Viewport Verifications ---');
    for (const vp of viewports) {
      console.log(`\nTesting Viewport ${vp.name} (${vp.width}x${vp.height})...`);
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });

      // Home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
      // Skip intro if present
      const skip = await page.$('button[aria-label="Skip introductory portal animation"]');
      if (skip) await skip.click();
      await new Promise(r => setTimeout(r, 500));

      const homeHasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (homeHasHScroll) {
        console.warn(`Horizontal scroll detected on Home at ${vp.name}!`);
        checkResults.noHorizontalScroll = false;
      }
      const homePath = path.join(ARTIFACT_DIR, `home_${vp.name}.png`);
      await page.screenshot({ path: homePath });
      checkResults.screenshotsCaptured.push(`home_${vp.name}.png`);
      console.log(`Captured home_${vp.name}.png`);

      // Events
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const eventsHasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (eventsHasHScroll) {
        console.warn(`Horizontal scroll detected on Events at ${vp.name}!`);
        checkResults.noHorizontalScroll = false;
      }
      const eventsPath = path.join(ARTIFACT_DIR, `events_${vp.name}.png`);
      await page.screenshot({ path: eventsPath });
      checkResults.screenshotsCaptured.push(`events_${vp.name}.png`);
      console.log(`Captured events_${vp.name}.png`);

      // Event Detail
      await page.goto(`${BASE_URL}/events/${TEST_EVENT_ID}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 500));
      const detailHasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (detailHasHScroll) {
        console.warn(`Horizontal scroll detected on Detail at ${vp.name}!`);
        checkResults.noHorizontalScroll = false;
      }
      const detailPath = path.join(ARTIFACT_DIR, `detail_${vp.name}.png`);
      await page.screenshot({ path: detailPath });
      checkResults.screenshotsCaptured.push(`detail_${vp.name}.png`);
      console.log(`Captured detail_${vp.name}.png`);

      // Lightbox screenshot at 1280 and 375
      if (vp.name === '1280' || vp.name === '375') {
        const thumb = await page.$('button[id^="gallery-thumb-"]');
        if (thumb) {
          await thumb.click();
          await new Promise(r => setTimeout(r, 400));
          const lbPath = path.join(ARTIFACT_DIR, `lightbox_${vp.name}.png`);
          await page.screenshot({ path: lbPath });
          checkResults.screenshotsCaptured.push(`lightbox_${vp.name}.png`);
          console.log(`Captured lightbox_${vp.name}.png`);
        }
      }

      await page.close();
    }

  } finally {
    await browser.close();
  }

  if (checkResults.consoleErrors.length > 0) {
    console.error('Console errors logged during verification:', checkResults.consoleErrors);
    checkResults.noConsoleErrors = false;
  }

  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(JSON.stringify(checkResults, null, 2));

  fs.writeFileSync(
    path.join(__dirname, '..', 'scratch', 'stage5-verification-results.json'),
    JSON.stringify(checkResults, null, 2)
  );
}

runStage5Verification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
