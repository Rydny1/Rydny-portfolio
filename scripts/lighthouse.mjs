// Lighthouse against the built site (mobile and desktop). Usage: node scripts/lighthouse.mjs
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { serve } from './lib/serve.mjs';

const { base, stop } = await serve('.', 4440);
const results = {};
try {
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
  for (const form of ['mobile', 'desktop']) {
    const flags = { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] };
    const config = form === 'desktop' ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
    const r = await lighthouse(base, flags, config);
    const lhr = r.lhr;
    const cat = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]));
    const a = lhr.audits;
    results[form] = {
      scores: cat,
      LCP: a['largest-contentful-paint'].displayValue,
      TBT: a['total-blocking-time'].displayValue,
      CLS: a['cumulative-layout-shift'].displayValue,
      FCP: a['first-contentful-paint'].displayValue,
      transfer: a['total-byte-weight'].displayValue,
      failing: Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable').map((x) => `${x.id} (${x.score})`).slice(0, 14),
    };
    mkdirSync('_brief/report', { recursive: true });
    writeFileSync(`_brief/report/lighthouse-${form}.json`, JSON.stringify(lhr));
  }
  await chrome.kill();
} finally {
  stop();
}
console.log(JSON.stringify(results, null, 2));
