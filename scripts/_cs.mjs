import { chromium } from 'playwright';
import { serve } from './lib/serve.mjs';
import fs from 'node:fs';
const tag = process.argv[2];
const open = process.argv[3] === 'how';
const dir = `_brief/report/content-pass/${tag}`;
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const { base, stop } = await serve('.', 4496);
try {
  const b = await chromium.launch();
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, ...(mobile ? { isMobile: true, hasTouch: true } : {}) })).newPage();
    await p.goto(base, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    for (const id of ['about', 'work', 'contact']) {
      const top = await p.evaluate((i) => document.getElementById(i).getBoundingClientRect().top + scrollY, id);
      const hgt = await p.evaluate((i) => document.getElementById(i).offsetHeight, id);
      const n = Math.min(3, Math.ceil(hgt / h));
      for (let k = 0; k < n; k++) {
        const target = top + k * h * 0.9;
        const from = Math.max(0, target - 300);
        await p.evaluate((v) => scrollTo(0, v), from); await p.waitForTimeout(400);
        await p.evaluate((v) => scrollTo(0, v), target); await p.waitForTimeout(2600);
        if (open && id === 'work' && k === 0) {
          await p.evaluate(() => document.querySelector('.how-btn')?.click());
          await p.waitForTimeout(900);
        }
        await p.screenshot({ path: `${dir}/${id}-${w}-${k + 1}.png` });
      }
    }
    await p.close();
  }
  await b.close();
} finally { stop(); }
