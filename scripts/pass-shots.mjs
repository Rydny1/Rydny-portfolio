// Usage: node scripts/pass-shots.mjs <outDir> [siteDir]
// Shoots every section at the report viewports. Scrolls through first so reveals and lazy images settle.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { serve } from './lib/serve.mjs';

const [outDir, siteDir = '.'] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const { base, stop } = await serve(siteDir, 4420);
const sizes = [[1536, 695], [1440, 789], [390, 844], [360, 740]];
const sections = [['hero', '#top'], ['proof', '#work'], ['fix', '#fix'], ['about', '#about'], ['contact', '#contact']];
try {
  const browser = await chromium.launch();
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...(w < 800 ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${outDir}/hero-${w}x${h}.png` });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 300) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
    await page.waitForTimeout(1200);
    for (const [name, sel] of sections.slice(1)) {
      const top = await page.evaluate((s) => document.querySelector(s)?.getBoundingClientRect().top + scrollY, sel);
      if (top == null) continue;
      await page.evaluate((v) => window.scrollTo(0, v), Math.max(0, top - 70));
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${outDir}/${name}-${w}x${h}.png` });
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/footer-${w}x${h}.png` });
    await ctx.close();
  }
  await browser.close();
} finally {
  stop();
}
console.log('shots done', outDir);
