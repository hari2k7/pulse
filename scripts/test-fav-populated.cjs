const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

async function main() {
  const profileDir = path.resolve('./scratch/chrome-fav-profile');
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });

  console.log('Seeding localStorage in Chrome profile...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    userDataDir: profileDir,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/events', { waitUntil: 'networkidle2' });
  
  // Get first 4 event IDs
  const eventIds = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href^="/events/"]'));
    return cards.map(a => a.getAttribute('href').replace('/events/', '')).filter(id => id.length > 10).slice(0, 4);
  });
  console.log('Found event IDs:', eventIds);

  await page.evaluate((ids) => {
    localStorage.setItem('strange:favorites', JSON.stringify(ids));
  }, eventIds);

  await page.goto('http://localhost:4173/favorites', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();

  console.log('Running Lighthouse on populated /favorites...');
  const jsonPath = path.resolve('./scratch/lh-fav-populated.json');
  const cmd = `npx -y lighthouse "http://localhost:4173/favorites" --output=json --output-path="${jsonPath}" --chrome-flags="--headless=new --no-sandbox --user-data-dir=\\"${profileDir}\\"" --quiet --skip-audits=full-page-screenshot`;
  execSync(cmd, { stdio: 'inherit' });

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('\n=== POPULATED FAVORITES RESULT ===');
  console.log('Perf:', Math.round((data.categories.performance?.score || 0) * 100));
  console.log('FCP:', data.audits['first-contentful-paint']?.displayValue);
  console.log('LCP:', data.audits['largest-contentful-paint']?.displayValue);
  console.log('TBT:', data.audits['total-blocking-time']?.displayValue);
  console.log('CLS:', data.audits['cumulative-layout-shift']?.displayValue);
  console.log('Speed Index:', data.audits['speed-index']?.displayValue);
  const lcpItem = data.audits['largest-contentful-paint-element']?.details?.items?.[0];
  console.log('LCP snippet:', lcpItem?.node?.snippet);
}

main().catch(console.error);
