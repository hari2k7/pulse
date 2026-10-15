const { execSync } = require('child_process');
const fs = require('fs');

const pages = [
  { name: 'home', url: 'http://localhost:4173/' },
  { name: 'events', url: 'http://localhost:4173/events' },
  { name: 'favorites', url: 'http://localhost:4173/favorites' },
  { name: 'detail', url: 'http://localhost:4173/events/0fdc5427-4be3-59d8-9f17-1d7fc20d515a' },
];

for (const p of pages) {
  const jsonPath = `./scratch/lh-${p.name}.json`;
  const cmd = `npx -y lighthouse "${p.url}" --output=json --output-path="${jsonPath}" --chrome-flags="--headless=new --no-sandbox" --quiet --skip-audits=full-page-screenshot`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`${p.name.toUpperCase()}:`);
    console.log(`  Perf: ${Math.round((data.categories.performance?.score || 0) * 100)}`);
    console.log(`  FCP: ${data.audits['first-contentful-paint']?.displayValue}`);
    console.log(`  LCP: ${data.audits['largest-contentful-paint']?.displayValue}`);
    console.log(`  TBT: ${data.audits['total-blocking-time']?.displayValue}`);
    console.log(`  CLS: ${data.audits['cumulative-layout-shift']?.displayValue}`);
    console.log(`  Speed Index: ${data.audits['speed-index']?.displayValue}`);
  } catch (e) {
    console.error(`Failed ${p.name}:`, e.message);
  }
}
