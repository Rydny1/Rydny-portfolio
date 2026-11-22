import { chromium } from 'playwright';
import { serve } from './lib/serve.mjs';
const { base, stop } = await serve('.', 4488);
try {
  const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [360, 740]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.5, reducedMotion: 'reduce' })).newPage();
    await p.goto(base, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `_brief/report/p56/after/hero-${w}x${h}.png` });
  }
  await b.close();
} finally { stop(); }
