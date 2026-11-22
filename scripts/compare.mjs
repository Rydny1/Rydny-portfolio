// Compare loop: screenshot each section at 1440x900, diff against _brief/target/*.png with pixelmatch,
// write side-by-side and diff images to _brief/report/compare/ and print the mismatch per section.
// Usage: node scripts/compare.mjs [hero|proof|fix|contact ...]
import { chromium } from 'playwright';
import sharp from 'sharp';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { serve } from './lib/serve.mjs';

const out = '_brief/report/compare';
mkdirSync(out, { recursive: true });
const want = process.argv.slice(2);
const sections = [
  { id: 'hero', target: '1-hero.png', sel: '#top' },
  { id: 'proof', target: '2-proof.png', sel: '#work' },
  { id: 'fix', target: '3-what-i-fix.png', sel: '#fix' },
  { id: 'contact', target: '4-contact-and-footer.png', sel: '#contact' },
].filter((s) => !want.length || want.includes(s.id));

const { base, stop } = await serve('.', 4470);
try {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // the mockup has no fixed nav, cursor or floating pill: hide them for the comparison
  await page.addStyleTag({ content: (want.length === 1 && want[0] === 'hero' ? '' : '.nav,') + '.cursor,.fab,.grain{display:none!important}' });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 400) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(30); }

  for (const s of sections) {
    const tbuf = readFileSync(`_brief/target/${s.target}`);
    const tmeta = await sharp(tbuf).metadata();
    const W = tmeta.width, H = tmeta.height;
    if (s.id === 'fix') await page.evaluate(() => document.querySelectorAll('.fix .row')[1]?.classList.add('open'));
    if (s.id === 'contact') {
      await page.fill('#f-name', 'Anna Berzina');
      await page.check('input[name=choice][value="Improve what I have"]', { force: true });
    }
    const top = await page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY, s.sel);
    await page.evaluate((v) => window.scrollTo(0, v), s.id === 'hero' ? 0 : top);
    await page.waitForTimeout(900);
    const shot = await page.screenshot({ fullPage: true, type: 'png' });
    const startY = s.id === 'hero' ? 0 : Math.round(top);
    const mine = await sharp(shot).extract({ left: 0, top: startY, width: W, height: Math.min(H, (await sharp(shot).metadata()).height - startY) }).png().toBuffer();
    const mm = await sharp(mine).metadata();
    const h = Math.min(H, mm.height);
    const a = PNG.sync.read(await sharp(tbuf).extract({ left: 0, top: 0, width: W, height: h }).png().toBuffer());
    const b = PNG.sync.read(await sharp(mine).extract({ left: 0, top: 0, width: W, height: h }).png().toBuffer());
    const diff = new PNG({ width: W, height: h });
    const bad = pixelmatch(a.data, b.data, diff.data, W, h, { threshold: 0.12 });
    const pct = ((bad / (W * h)) * 100).toFixed(1);
    writeFileSync(`${out}/${s.id}-diff.png`, PNG.sync.write(diff));
    const half = 720;
    const tA = await sharp(tbuf).resize({ width: half }).png().toBuffer();
    const tB = await sharp(mine).resize({ width: half }).png().toBuffer();
    const hh = Math.max((await sharp(tA).metadata()).height, (await sharp(tB).metadata()).height);
    await sharp({ create: { width: half * 2 + 16, height: hh, channels: 3, background: '#888' } })
      .composite([{ input: tA, left: 0, top: 0 }, { input: tB, left: half + 16, top: 0 }])
      .png()
      .toFile(`${out}/${s.id}-side-by-side.png`);
    await sharp(mine).toFile(`${out}/${s.id}-mine.png`);
    console.log(`${s.id.padEnd(8)} target ${W}x${H}  mine ${mm.width}x${mm.height}  differing pixels ${pct}%`);
  }
  await browser.close();
} finally {
  stop();
}
