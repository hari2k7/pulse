const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\hari\\.gemini\\antigravity-ide\\brain\\4aac6c6a-35bd-4934-bb39-9fde28e5e798';
const BASE_URL = 'http://localhost:5173';

const results = {
  gallery: {},
  prizePool: {},
  skipButton: {},
  moreInTheme: {},
  cursor: {},
  searchX: {},
  screenshots: [],
};

async function run() {
  console.log('--- Launching Chrome for Comprehensive Verification ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // -------------------------------------------------------------
    // ITEM 2: HOME STATS PRIZE POOL & SKIP BUTTON
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Home Page (Prize Pool & Skip Button) ---');

    let extraDetailRequests = 0;
    const startTime = Date.now();
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/test/events/') && !url.endsWith('/events')) {
        extraDetailRequests++;
      }
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const loadDuration = Date.now() - startTime;

    // Check Skip Featured Events button
    const skipBtn = await page.$('a[href="#about"]');
    const skipBtnVisible = await page.evaluate((el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }, skipBtn);
    const skipBtnText = await page.evaluate(el => el ? el.textContent.trim() : '', skipBtn);
    console.log(`Skip Button visible: ${skipBtnVisible}, text: "${skipBtnText}"`);
    results.skipButton.visible = skipBtnVisible;
    results.skipButton.text = skipBtnText;

    // Test activating Skip Button by click
    await page.click('a[href="#about"]');
    await new Promise(r => setTimeout(r, 600));
    const activeEl = await page.evaluate(() => {
      return {
        id: document.activeElement ? document.activeElement.id : null,
        tag: document.activeElement ? document.activeElement.tagName : null,
        scrollY: window.scrollY,
      };
    });
    console.log(`Skip activated: focus moved to tag ${activeEl.tag} with id #${activeEl.id}, scrollY: ${activeEl.scrollY}`);
    results.skipButton.focusedId = activeEl.id;
    results.skipButton.scrollY = activeEl.scrollY;

    // Scroll down to stats section so IntersectionObserver triggers count-up
    await page.evaluate(() => {
      const stats = document.querySelector('section[aria-label="Festival Statistics"]');
      if (stats) stats.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo(0, 3000);
    });

    // Wait for idle queue to complete fetching details
    await new Promise(r => setTimeout(r, 2200));

    const statValues = await page.evaluate(() => {
      const prizeEl = document.getElementById('stat-counter-prize-pool');
      const realmsEl = document.getElementById('stat-counter-events-count');
      const persisted = localStorage.getItem('strange:prize-pool');
      return {
        prizeValue: prizeEl ? prizeEl.textContent.trim() : null,
        realmsValue: realmsEl ? realmsEl.textContent.trim() : null,
        persisted: persisted ? JSON.parse(persisted) : null,
      };
    });
    console.log('Home Stats Values after idle pool fetch:', statValues);
    console.log(`Extra background detail requests made: ${extraDetailRequests}, Time to resolve: ${loadDuration}ms`);
    results.prizePool.initial = statValues;
    results.prizePool.extraRequests = extraDetailRequests;
    results.prizePool.timeToResolveMs = loadDuration;

    // Verify across 5 hard refreshes that prize pool remains stable and visible immediately
    let stableAcross5 = true;
    for (let i = 1; i <= 5; i++) {
      await page.reload({ waitUntil: 'networkidle2' });
      await page.evaluate(() => {
        const stats = document.querySelector('section[aria-label="Festival Statistics"]');
        if (stats) stats.scrollIntoView({ behavior: 'instant' });
      });
      await new Promise(r => setTimeout(r, 600));
      const val = await page.evaluate(() => {
        const prizeEl = document.getElementById('stat-counter-prize-pool');
        return prizeEl ? prizeEl.textContent.trim() : null;
      });
      console.log(`Refresh #${i} prize pool value: ${val}`);
      if (!val) stableAcross5 = false;
    }
    results.prizePool.stableAcross5Refreshes = stableAcross5;

    // Verify after clearing localStorage
    await page.evaluate(() => localStorage.removeItem('strange:prize-pool'));
    await page.reload({ waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const stats = document.querySelector('section[aria-label="Festival Statistics"]');
      if (stats) stats.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 2200));
    const afterClearVal = await page.evaluate(() => {
      const prizeEl = document.getElementById('stat-counter-prize-pool');
      const persisted = localStorage.getItem('strange:prize-pool');
      return {
        prizeValue: prizeEl ? prizeEl.textContent.trim() : null,
        persisted: persisted ? JSON.parse(persisted) : null,
      };
    });
    console.log('Prize pool after clearing localStorage and re-fetch:', afterClearVal);
    results.prizePool.afterClear = afterClearVal;

    // -------------------------------------------------------------
    // ITEM 1: EVENT DETAIL GALLERY LIGHTBOX
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Event Detail Gallery & Lightbox ---');
    const roboticsId = '4819d0b0-4b31-527d-ab30-44cf58ed3b11'; // TrackTact: Autonomous Line-Follower Arena (Robotics)
    await page.goto(`${BASE_URL}/events/${roboticsId}`, { waitUntil: 'networkidle2' });

    const galleryButtons = await page.$$('button[aria-label^="Open image "]');
    console.log(`Found ${galleryButtons.length} gallery image buttons`);
    results.gallery.buttonCount = galleryButtons.length;

    if (galleryButtons.length > 0) {
      // 1. Mouse Click Open
      await galleryButtons[0].click();
      await new Promise(r => setTimeout(r, 400));

      const openState = await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');
        const counter = document.getElementById('lightbox-counter');
        const img = document.getElementById('lightbox-active-img');
        const backToTop = document.querySelector('.back-to-top');
        const backToTopDisplay = backToTop ? window.getComputedStyle(backToTop).display : 'none';
        const bodyLocked = document.body.style.overflow === 'hidden';

        return {
          isOpen: !!dialog,
          dialogAriaLabel: dialog ? dialog.getAttribute('aria-label') : null,
          counterText: counter ? counter.textContent.trim() : null,
          imgSrc: img ? img.getAttribute('src') : null,
          imgAlt: img ? img.getAttribute('alt') : null,
          backToTopDisplay,
          bodyLocked,
        };
      });
      console.log('Lightbox open state:', openState);
      results.gallery.openState = openState;

      // 2. Keyboard ArrowRight Navigation
      await page.keyboard.press('ArrowRight');
      await new Promise(r => setTimeout(r, 300));
      const counterAfterArrow = await page.evaluate(() => {
        const counter = document.getElementById('lightbox-counter');
        return counter ? counter.textContent.trim() : null;
      });
      console.log('Lightbox counter after ArrowRight:', counterAfterArrow);
      results.gallery.counterAfterArrow = counterAfterArrow;

      // 3. Test Escape key closes and returns focus to thumbnail
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
      const closedState = await page.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"][aria-modal="true"]');
        return {
          isOpen: !!dialog,
          focusedElementId: document.activeElement ? document.activeElement.id : null,
          bodyLocked: document.body.style.overflow === 'hidden',
          hasBodyClass: document.body.classList.contains('lightbox-open'),
        };
      });
      console.log('Lightbox closed state via Escape:', closedState);
      results.gallery.closedState = closedState;

      // 4. Test broken image fallback panel in lightbox
      await page.evaluate(() => {
        // Trigger broken image on active index
        const btn = document.querySelector('button[aria-label^="Open image "]');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
      const brokenImageFallback = await page.evaluate(() => {
        const img = document.getElementById('lightbox-active-img');
        if (img) {
          img.dispatchEvent(new Event('error'));
        }
        const unavailablePanel = document.body.textContent.includes('Image unavailable');
        const hasPrev = !!document.querySelector('button[aria-label="Previous image"]');
        const hasNext = !!document.querySelector('button[aria-label="Next image"]');
        return {
          hasUnavailablePanel: unavailablePanel,
          navigationIntact: hasPrev || hasNext,
        };
      });
      console.log('Broken image fallback state:', brokenImageFallback);
      results.gallery.brokenImageFallback = brokenImageFallback;

      // Close lightbox again
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    }

    // -------------------------------------------------------------
    // ITEM 4: "MORE IN {THEME}" ROW AT THE END OF DETAIL PAGE
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing "More in {theme}" Row on Detail Page ---');
    const moreSection = await page.evaluate(() => {
      const heading = document.getElementById('more-theme-heading');
      const track = document.querySelector('div[role="region"][aria-label*="track"]');
      const prevBtn = document.querySelector('button[aria-label="Scroll more events left"]');
      const nextBtn = document.querySelector('button[aria-label="Scroll more events right"]');
      const cards = track ? Array.from(track.querySelectorAll('a[href^="/events/"]')) : [];

      return {
        hasHeading: !!heading,
        headingText: heading ? heading.textContent.trim() : null,
        hasTrack: !!track,
        cardCount: cards.length,
        hasPrevBtn: !!prevBtn,
        hasNextBtn: !!nextBtn,
        cardHrefs: cards.map(c => c.getAttribute('href')),
      };
    });
    console.log('More in theme section on Robotics event:', moreSection);
    results.moreInTheme = moreSection;

    // Test clicking a card in "More in {theme}" row resets scroll to top
    if (moreSection.cardHrefs.length > 0) {
      await page.evaluate(() => {
        const track = document.querySelector('div[role="region"][aria-label*="track"]');
        const firstCardLink = track ? track.querySelector('a[href^="/events/"]') : null;
        if (firstCardLink) firstCardLink.click();
      });
      await new Promise(r => setTimeout(r, 800));
      const navigatedScroll = await page.evaluate(() => ({
        url: window.location.href,
        scrollY: window.scrollY,
      }));
      console.log('After clicking card in More in Theme row:', navigatedScroll);
      results.moreInTheme.cardNavigation = navigatedScroll;
    }

    // -------------------------------------------------------------
    // ITEM 5: CURSOR DISAPPEARS WHEN CLICKING SEARCH BAR OR SORT
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Cursor Native Zones & Pointer Rule ---');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });

    // Move real mouse over body
    await page.mouse.move(200, 200);
    await new Promise(r => setTimeout(r, 100));

    const cursorOverBody = await page.evaluate(() => {
      const diamond = document.querySelector('.custom-diamond-cursor');
      return {
        diamondOpacity: diamond ? window.getComputedStyle(diamond).opacity : null,
        bodyCursor: window.getComputedStyle(document.body).cursor,
        hasCustomCursorClass: document.documentElement.classList.contains('has-custom-cursor'),
      };
    });
    console.log('Cursor over body (outside native zone):', cursorOverBody);

    // Move mouse over search bar input (native text zone)
    const searchInputEl = await page.$('input[type="search"]');
    const searchRect = await page.evaluate(el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top) };
    }, searchInputEl);

    if (searchRect) {
      await page.mouse.move(searchRect.x + 20, searchRect.y + 15);
      await new Promise(r => setTimeout(r, 100));

      const cursorOverInput = await page.evaluate(() => {
        const diamond = document.querySelector('.custom-diamond-cursor');
        const input = document.querySelector('input[type="search"]');
        return {
          diamondOpacity: diamond ? window.getComputedStyle(diamond).opacity : null,
          inputCursor: input ? window.getComputedStyle(input).cursor : null,
        };
      });
      console.log('Cursor over search input (native zone):', cursorOverInput);

      // Focus input (click search bar), then move pointer OUTSIDE to body while input is still focused!
      await page.click('input[type="search"]');
      await page.keyboard.type('Cyber');
      await page.mouse.move(100, 300); // move pointer to body outside input
      await new Promise(r => setTimeout(r, 100));

      const cursorWhenFocusedButPointerOutside = await page.evaluate(() => {
        const diamond = document.querySelector('.custom-diamond-cursor');
        const input = document.querySelector('input[type="search"]');
        return {
          isInputFocused: document.activeElement === input,
          diamondOpacity: diamond ? window.getComputedStyle(diamond).opacity : null,
          bodyCursor: window.getComputedStyle(document.body).cursor,
        };
      });
      console.log('Cursor when input is focused BUT pointer is outside:', cursorWhenFocusedButPointerOutside);
      results.cursor.inputFocusedButPointerOutside = cursorWhenFocusedButPointerOutside;
    }

    // Move mouse over Sort <select>
    const sortSelectEl = await page.$('#events-sort-select');
    const sortRect = await page.evaluate(el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top) };
    }, sortSelectEl);

    if (sortRect) {
      await page.mouse.move(sortRect.x + 20, sortRect.y + 15);
      await new Promise(r => setTimeout(r, 100));

      const cursorOverSelect = await page.evaluate(() => {
        const diamond = document.querySelector('.custom-diamond-cursor');
        const select = document.getElementById('events-sort-select');
        return {
          diamondOpacity: diamond ? window.getComputedStyle(diamond).opacity : null,
          selectCursor: select ? window.getComputedStyle(select).cursor : null,
        };
      });
      console.log('Cursor over Sort select (native zone):', cursorOverSelect);
      results.cursor.selectOver = cursorOverSelect;

      // Move outside select
      await page.mouse.move(100, 300);
      await new Promise(r => setTimeout(r, 100));
      const cursorAfterSelect = await page.evaluate(() => {
        const diamond = document.querySelector('.custom-diamond-cursor');
        return {
          diamondOpacity: diamond ? window.getComputedStyle(diamond).opacity : null,
          bodyCursor: window.getComputedStyle(document.body).cursor,
        };
      });
      console.log('Cursor after moving outside Sort select:', cursorAfterSelect);
      results.cursor.afterSelectOutside = cursorAfterSelect;
    }

    // -------------------------------------------------------------
    // ITEM 6: SEARCH BAR SHOWS TWO CLOSE (X) BUTTONS
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Search Bar Clear (X) Button ---');
    await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });

    // Focus and type text
    await page.type('input[type="search"]', 'Hackathon');
    await new Promise(r => setTimeout(r, 350));

    const clearButtonEval = await page.evaluate(() => {
      const input = document.querySelector('input[type="search"]');
      const clearBtn = document.querySelector('button[aria-label="Clear search"]');
      const allButtonsInSearch = input && input.parentElement ? Array.from(input.parentElement.querySelectorAll('button')) : [];

      let hitArea = null;
      if (clearBtn) {
        const rect = clearBtn.getBoundingClientRect();
        hitArea = { width: Math.round(rect.width), height: Math.round(rect.height) };
      }

      return {
        hasText: input ? input.value === 'Hackathon' : false,
        totalCustomButtonsInSearchBar: allButtonsInSearch.length,
        hasClearBtn: !!clearBtn,
        ariaLabel: clearBtn ? clearBtn.getAttribute('aria-label') : null,
        hitArea,
        inputPaddingRight: input ? window.getComputedStyle(input).paddingRight : null,
      };
    });
    console.log('Clear button evaluation when field has text:', clearButtonEval);
    results.searchX = clearButtonEval;

    // Click clear button and verify input cleared, URL cleared, focus returned
    const clearBtnEl = await page.$('button[aria-label="Clear search"]');
    if (clearBtnEl) {
      await clearBtnEl.click();
      await new Promise(r => setTimeout(r, 200));

      const afterClear = await page.evaluate(() => {
        const input = document.querySelector('input[type="search"]');
        const clearBtn = document.querySelector('button[aria-label="Clear search"]');
        return {
          inputValue: input ? input.value : null,
          hasClearButtonNow: !!clearBtn,
          isInputFocused: document.activeElement === input,
          url: window.location.href,
        };
      });
      console.log('State after clicking clear button:', afterClear);
      results.searchX.afterClick = afterClear;
    }

    // -------------------------------------------------------------
    // ITEM 7: SCREENSHOTS AT 375, 768, 1280, 1920
    // -------------------------------------------------------------
    console.log('\n--- 6. Capturing Viewport Screenshots ---');
    const viewports = [
      { name: '375', width: 375, height: 812 },
      { name: '768', width: 768, height: 1024 },
      { name: '1280', width: 1280, height: 800 },
      { name: '1920', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });

      // Home
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const homePath = path.join(ARTIFACT_DIR, `home_${vp.name}.png`);
      await page.screenshot({ path: homePath, fullPage: false });
      console.log(`Saved home_${vp.name}.png`);

      // Events
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const eventsPath = path.join(ARTIFACT_DIR, `events_${vp.name}.png`);
      await page.screenshot({ path: eventsPath, fullPage: false });
      console.log(`Saved events_${vp.name}.png`);

      // Event Detail
      await page.goto(`${BASE_URL}/events/${roboticsId}`, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const detailPath = path.join(ARTIFACT_DIR, `detail_${vp.name}.png`);
      await page.screenshot({ path: detailPath, fullPage: false });
      console.log(`Saved detail_${vp.name}.png`);
    }

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'verification_results.json'),
      JSON.stringify(results, null, 2)
    );
    console.log('\nAll verifications and screenshots completed successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
