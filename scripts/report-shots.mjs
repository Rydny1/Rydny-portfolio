// Usage: node scripts/report-shots.mjs <siteDir> <outDir>
// Serves <siteDir>'s build with astro preview and shoots hero, about, contact and footer at 1440 and 390.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const [siteDir, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const PORT = Number(process.env.PORT ?? 4400);
const BASE = `http://localhost:${PORT}`;
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { cwd: siteDir, shell: true, stdio: 'ignore' });
for (let i = 0; i < 80; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${outDir}/hero-${w}.png` });
  // scroll through so reveals fire and lazy images load
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 250) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(45); }
  await page.waitForTimeout(1500);
  for (const [name, sel] of [['about', '#about'], ['contact', '#contact']]) {
    const el = await page.$(sel);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await el.screenshot({ path: `${outDir}/${name}-${w}.png` });
  }
  // footer: the bottom of the page
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${outDir}/footer-${w}.png` });
  await ctx.close();
}
await browser.close();
server.kill();
spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
console.log('shots done', outDir);
