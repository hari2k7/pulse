const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targets = [
  { name: 'home-mobile', url: 'http://localhost:4173/', preset: 'mobile' },
  { name: 'home-desktop', url: 'http://localhost:4173/', preset: 'desktop' },
  { name: 'events-mobile', url: 'http://localhost:4173/events', preset: 'mobile' },
  { name: 'events-desktop', url: 'http://localhost:4173/events', preset: 'desktop' },
  { name: 'detail-mobile', url: 'http://localhost:4173/events/0fdc5427-4be3-59d8-9f17-1d7fc20d515a', preset: 'mobile' },
  { name: 'detail-desktop', url: 'http://localhost:4173/events/0fdc5427-4be3-59d8-9f17-1d7fc20d515a', preset: 'desktop' },
];

const resultsDir = path.join(__dirname, '..', 'scratch');
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

const summary = {};

for (const t of targets) {
  const jsonPath = path.join(resultsDir, `lh-${t.name}.json`);
  console.log(`Running Lighthouse for ${t.name} (${t.preset}) on ${t.url}...`);
  const presetArg = t.preset === 'desktop' ? '--preset=desktop' : '';
  const cmd = `npx -y lighthouse "${t.url}" ${presetArg} --output=json --output-path="${jsonPath}" --chrome-flags="--headless=new --no-sandbox" --quiet --skip-audits=full-page-screenshot`;
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const cats = data.categories;
    const audits = data.audits;
    
    // Extract top 10 opportunities / diagnostics
    const opps = Object.values(audits)
      .filter(a => a.details && (a.details.type === 'opportunity' || a.details.type === 'table') && typeof a.score === 'number' && a.score < 1)
      .map(a => ({
        id: a.id,
        title: a.title,
        score: a.score,
        displayValue: a.displayValue,
        savingsMs: a.details?.overallSavingsMs,
        savingsBytes: a.details?.overallSavingsBytes,
      }))
      .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0) || (a.score - b.score))
      .slice(0, 10);

    summary[t.name] = {
      performance: Math.round((cats.performance?.score || 0) * 100),
      accessibility: Math.round((cats.accessibility?.score || 0) * 100),
      bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
      seo: Math.round((cats.seo?.score || 0) * 100),
      fcp: audits['first-contentful-paint']?.displayValue,
      lcp: audits['largest-contentful-paint']?.displayValue,
      tbt: audits['total-blocking-time']?.displayValue,
      cls: audits['cumulative-layout-shift']?.displayValue,
      topOpportunities: opps,
    };
    console.log(`Finished ${t.name}: Perf ${summary[t.name].performance}, A11y ${summary[t.name].accessibility}, BP ${summary[t.name].bestPractices}, SEO ${summary[t.name].seo}, LCP ${summary[t.name].lcp}, CLS ${summary[t.name].cls}`);
  } catch (err) {
    console.error(`Failed on ${t.name}:`, err.message);
  }
}

const summaryPath = path.join(resultsDir, 'lh-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`\nSummary written to ${summaryPath}`);
