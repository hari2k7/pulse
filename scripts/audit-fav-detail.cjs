const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targets = [
  { name: 'favorites-mobile', url: 'http://localhost:4173/favorites', preset: 'mobile' },
  { name: 'favorites-desktop', url: 'http://localhost:4173/favorites', preset: 'desktop' },
  { name: 'detail-mobile', url: 'http://localhost:4173/events/0fdc5427-4be3-59d8-9f17-1d7fc20d515a', preset: 'mobile' },
  { name: 'detail-desktop', url: 'http://localhost:4173/events/0fdc5427-4be3-59d8-9f17-1d7fc20d515a', preset: 'desktop' },
];

const resultsDir = path.join(__dirname, '..', 'scratch');
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

for (const t of targets) {
  const jsonPath = path.join(resultsDir, `lh-${t.name}.json`);
  console.log(`Running Lighthouse for ${t.name}...`);
  const presetArg = t.preset === 'desktop' ? '--preset=desktop' : '';
  const cmd = `npx -y lighthouse "${t.url}" ${presetArg} --output=json --output-path="${jsonPath}" --chrome-flags="--headless=new --no-sandbox" --quiet --skip-audits=full-page-screenshot`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const cats = data.categories;
    const audits = data.audits;
    
    const lcpElement = audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || 'unknown';
    
    console.log(`\n=== ${t.name} ===`);
    console.log(`Performance: ${Math.round((cats.performance?.score || 0) * 100)}`);
    console.log(`Accessibility: ${Math.round((cats.accessibility?.score || 0) * 100)}`);
    console.log(`Best Practices: ${Math.round((cats['best-practices']?.score || 0) * 100)}`);
    console.log(`SEO: ${Math.round((cats.seo?.score || 0) * 100)}`);
    console.log(`FCP: ${audits['first-contentful-paint']?.displayValue}`);
    console.log(`LCP: ${audits['largest-contentful-paint']?.displayValue}`);
    console.log(`TBT: ${audits['total-blocking-time']?.displayValue}`);
    console.log(`CLS: ${audits['cumulative-layout-shift']?.displayValue}`);
    console.log(`LCP Element: ${lcpElement}`);
    
    // Check metric scores
    const metricAudits = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
    for (const m of metricAudits) {
      if (audits[m]) {
        console.log(`  ${m}: score=${audits[m].score}, val=${audits[m].displayValue}`);
      }
    }
  } catch (err) {
    console.error(`Failed ${t.name}:`, err.message);
  }
}
