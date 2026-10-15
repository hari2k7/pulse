const fs = require('fs');
const file = process.argv[2] || './scratch/lh-fav-current.json';
if (!fs.existsSync(file)) {
  console.log('File does not exist:', file);
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const c = data.categories;
const a = data.audits;
console.log('File:', file);
console.log('Performance:', Math.round((c.performance?.score || 0) * 100));
console.log('Accessibility:', Math.round((c.accessibility?.score || 0) * 100));
console.log('Best Practices:', Math.round((c['best-practices']?.score || 0) * 100));
console.log('SEO:', Math.round((c.seo?.score || 0) * 100));
console.log('FCP:', a['first-contentful-paint']?.displayValue, 'score:', a['first-contentful-paint']?.score);
console.log('LCP:', a['largest-contentful-paint']?.displayValue, 'score:', a['largest-contentful-paint']?.score);
console.log('TBT:', a['total-blocking-time']?.displayValue, 'score:', a['total-blocking-time']?.score);
console.log('CLS:', a['cumulative-layout-shift']?.displayValue, 'score:', a['cumulative-layout-shift']?.score);
console.log('Speed Index:', a['speed-index']?.displayValue, 'score:', a['speed-index']?.score);
const lcpItem = a['largest-contentful-paint-element']?.details?.items?.[0];
console.log('LCP Element snippet:', lcpItem?.node?.snippet);
console.log('LCP Element selector:', lcpItem?.node?.selector);
