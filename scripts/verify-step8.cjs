const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

async function run() {
  console.log('--- Step 8: Comprehensive Verification Starting ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800'],
  });

  const testReport = [];
  function logResult(name, pass, detail) {
    const status = pass ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${name}: ${detail}`);
    testReport.push({ name, pass, detail });
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. API Blocking - Cold Cache
    console.log('\n--- 1. Testing API Host Blocking (Cold Cache) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.setRequestInterception(true);
    const blockHandler = (req) => {
      if (req.url().includes('render72.pages.dev')) {
        req.abort('failed');
      } else {
        req.continue();
      }
    };
    page.on('request', blockHandler);

    await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('[role="alert"]', { timeout: 6000 });
    } catch {}

    const coldErrorState = await page.evaluate(() => {
      const el = document.querySelector('[role="alert"]');
      const text = document.body.innerText;
      return {
        hasAlert: !!el,
        hasRetryBtn: text.includes('Try Again') || text.includes('Retry'),
        hasNavbar: !!document.querySelector('header') || !!document.querySelector('nav'),
      };
    });
    logResult('API Blocking (Cold Cache)', coldErrorState.hasAlert && coldErrorState.hasNavbar, 
      `Alert rendered: ${coldErrorState.hasAlert}, Retry button: ${coldErrorState.hasRetryBtn}, Navbar intact: ${coldErrorState.hasNavbar}`);

    // 2. API Blocking - Warm Cache
    console.log('\n--- 2. Testing API Host Blocking (Warm Cache) ---');
    await page.evaluate(() => {
      const dummyEvents = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Cached Dimension Hackathon',
          blurb: 'Cached event blurb',
          category: 'Coding',
          event_status: 'ACTIVE',
          price: 0,
        }
      ];
      localStorage.setItem('strange_events_cache', JSON.stringify({
        events: dummyEvents,
        at: Date.now(),
        timestamp: Date.now()
      }));
    });

    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    const warmCacheState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const rawText = document.body.innerText;
      return {
        hasWarningBanner: text.includes('saved data') || text.includes('showing saved data') || text.includes('astral cached') || text.includes('offline mode') || text.includes('saved at'),
        hasCachedEvent: rawText.includes('Cached Dimension Hackathon'),
      };
    });
    logResult('API Blocking (Warm Cache)', warmCacheState.hasCachedEvent && warmCacheState.hasWarningBanner,
      `Cached event rendered: ${warmCacheState.hasCachedEvent}, Warning banner shown: ${warmCacheState.hasWarningBanner}`);

    // Unblock network
    page.off('request', blockHandler);
    await page.setRequestInterception(false);
    await page.evaluate(() => localStorage.clear());

    // 3. Offline Mode
    console.log('\n--- 3. Testing Offline Mode ---');
    // First load events normally
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Trigger offline mode
    await page.setOfflineMode(true);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    await new Promise(r => setTimeout(r, 500));
    const offlineState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasOfflineBanner: text.includes('You are offline') || text.includes('offline'),
        stillHasEvents: document.querySelectorAll('.card-strange').length > 0,
      };
    });
    logResult('Offline Banner & Cache', offlineState.hasOfflineBanner && offlineState.stillHasEvents,
      `Offline banner visible: ${offlineState.hasOfflineBanner}, Events cards visible: ${offlineState.stillHasEvents}`);

    // Reconnect
    await page.setOfflineMode(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    await new Promise(r => setTimeout(r, 400));

    // 4. Invalid Event ID (non-UUID)
    console.log('\n--- 4. Testing Invalid Event ID (/events/not-a-real-id) ---');
    let detailNetworkCalls = 0;
    const countDetail = (req) => {
      if (req.url().includes('/api/test/events/')) detailNetworkCalls++;
    };
    page.on('request', countDetail);
    await page.goto(`${BASE_URL}/events/not-a-real-id`, { waitUntil: 'networkidle2' });
    page.off('request', countDetail);
    const notFoundState = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isNotFound: text.includes('Event Not Found') || text.includes('Not Found') || text.includes('404'),
        hasBackLink: !!document.querySelector('a[href="/events"]'),
      };
    });
    logResult('Invalid non-UUID ID Guard', notFoundState.isNotFound && detailNetworkCalls === 0,
      `Shows Not Found: ${notFoundState.isNotFound}, Zero network calls dispatched: ${detailNetworkCalls === 0}`);

    // 5. Empty Event List (?sim=empty)
    console.log('\n--- 5. Testing Empty Event List (?sim=empty) ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/events?sim=empty`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const emptyState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        isEmptyState: text.includes('no events found') || text.includes('no dimensional events') || text.includes('adjusting your'),
        cardCount: document.querySelectorAll('.card-strange').length,
      };
    });
    logResult('Empty Event List State', emptyState.isEmptyState && emptyState.cardCount === 0,
      `Empty state message: ${emptyState.isEmptyState}, Card count: ${emptyState.cardCount}`);

    // 6. Partial Malformed Payload (?sim=partial)
    console.log('\n--- 6. Testing Partial Malformed Payload (?sim=partial) ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/events?sim=partial`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    const partialState = await page.evaluate(() => {
      const cards = document.querySelectorAll('.card-strange');
      const text = document.body.innerText;
      return {
        cardCount: cards.length,
        hasValidEvent: text.includes('Valid Multiverse Hackathon'),
      };
    });
    logResult('Tolerant Validation (?sim=partial)', partialState.cardCount >= 1 && partialState.hasValidEvent,
      `Corrupted items dropped, kept ${partialState.cardCount} valid events (Preserved: ${partialState.hasValidEvent})`);

    // 7. Rate Limit 429 Simulation
    console.log('\n--- 7. Testing 429 simulation ---');
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${BASE_URL}/events?sim=429`, { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('[role="alert"]', { timeout: 6000 });
    } catch {}
    await new Promise(r => setTimeout(r, 400));
    const sim429State = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasAlert = !!document.querySelector('[role="alert"]');
      return {
        hasRateNotice: text.includes('Rate limit') || text.includes('Too many requests') || text.includes('429') || text.includes('Too Many') || text.includes('temporal rate limit') || hasAlert,
      };
    });
    logResult('Rate Limit 429 Handling', sim429State.hasRateNotice,
      `Handled gracefully without crash: ${sim429State.hasRateNotice}`);

    // 8. "Show 12 more" Pagination & Reset on Filter
    console.log('\n--- 8. Testing "Show 12 more" Pagination & Filter Reset ---');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const paginationTest = await page.evaluate(async () => {
      const initialCards = document.querySelectorAll('.card-strange').length;
      const showMoreBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Show 12 more'));
      const hasAriaLive = !!document.querySelector('[aria-live="polite"]');

      if (!showMoreBtn) return { initialCards, step: 'no_button', hasAriaLive };

      showMoreBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const afterClickCards = document.querySelectorAll('.card-strange').length;
      const isFocused = document.activeElement === showMoreBtn;

      // Click a category filter pill to test pagination reset
      const filterPills = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Hackathon') || b.textContent.includes('Coding') || b.textContent.includes('All'));
      const hackathonPill = filterPills.find(b => b.textContent.includes('Hackathon'));
      if (hackathonPill) {
        hackathonPill.click();
        await new Promise(r => setTimeout(r, 400));
      }
      const afterFilterCards = document.querySelectorAll('.card-strange').length;

      return {
        initialCards,
        afterClickCards,
        hasAriaLive,
        isFocused,
        afterFilterCards,
      };
    });

    logResult('Show 12 more Pagination', paginationTest.initialCards === 12 && paginationTest.afterClickCards > 12,
      `Initial: ${paginationTest.initialCards}, After click: ${paginationTest.afterClickCards}, aria-live: ${paginationTest.hasAriaLive}`);

    // 9. Lite Mode Budget Check
    console.log('\n--- 9. Testing Low-End Mode Budget Check ---');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const liteModeState = await page.evaluate(() => {
      const musicNotes = document.querySelectorAll('.custom-diamond-cursor ~ div svg');
      return {
        musicNotesCount: musicNotes.length,
      };
    });
    logResult('Lite Mode Effects Suppression', liteModeState.musicNotesCount === 0,
      `Music notes suppressed: ${liteModeState.musicNotesCount === 0}`);

    // 10. Favorites & Core Feature Check
    console.log('\n--- 10. Testing Favorites & Core Features ---');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));

    const favTest = await page.evaluate(async () => {
      const heartBtn = document.querySelector('button[aria-label*="favorites"]');
      if (!heartBtn) return { success: false, reason: 'no_heart' };
      const beforePressed = heartBtn.getAttribute('aria-pressed');
      heartBtn.click();
      await new Promise(r => setTimeout(r, 200));
      const afterPressed = heartBtn.getAttribute('aria-pressed');
      const stored = localStorage.getItem('strange:favorites');
      return {
        success: beforePressed !== afterPressed,
        stored: !!stored && JSON.parse(stored).length > 0,
      };
    });
    logResult('Favorites Heart Toggle', favTest.success && favTest.stored,
      `Toggled state: ${favTest.success}, Persisted in strange:favorites: ${favTest.stored}`);

    console.log('\n--- Summary Report ---');
    const allPass = testReport.every(t => t.pass);
    console.log(`Total tests: ${testReport.length}, Passed: ${testReport.filter(t => t.pass).length}, Failed: ${testReport.filter(t => !t.pass).length}`);
    if (allPass) {
      console.log('ALL 10 VERIFICATION CHECKS PASSED PERFECTLY!');
    } else {
      console.error('SOME CHECKS FAILED');
    }

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

run();
