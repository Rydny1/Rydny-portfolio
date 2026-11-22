// Measures the build against the mockup's exact vector values at 1440x900, and samples the target's colours.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { serve } from './lib/serve.mjs';

// ---- target colours (sampled from the image)
const img = sharp('_brief/target/1-hero.png');
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => [0, 1, 2].map((i) => data[(y * info.width + x) * info.channels + i]);
const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
const avg = (pts) => pts.map(([x, y]) => px(x, y)).reduce((a, c) => a.map((v, i) => v + c[i]), [0, 0, 0]).map((v, _, arr) => Math.round(v / pts.length));
console.log('TARGET bg samples', [[300, 110], [720, 640], [1100, 760], [200, 330], [1200, 90]].map(([x, y]) => hex(px(x, y))).join(' '));
console.log('TARGET bg mean   ', hex(avg([[300, 110], [720, 640], [1100, 760], [200, 330], [1200, 90], [60, 700], [1380, 700], [700, 120]])));
console.log('TARGET green (inside F stem)', hex(px(100, 220)), hex(px(105, 230)));
console.log('TARGET orange button', hex(px(80, 825)), ' button text', hex(px(100, 834)));

// ---- my build
const { base, stop } = await serve('.', 4471);
try {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })).newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const m = await p.evaluate(() => {
    const tr = (el) => (el.getAttribute('transform') || '').match(/-?[\d.]+/g)?.map(Number);
    const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
    return {
      start: tr(document.querySelector('.wire .start')),
      end: tr(document.querySelector('.wire .end')),
      pills: [...document.querySelectorAll('.wire .pill')].map((g) => tr(g)),
      l1: r('.l1'), l2: r('.l2'), name: r('.nav .name'), tag: r('.nav .tag'), links: r('.nav .links'), touch: r('.nav .touch'),
      lead: r('.lead'), btn: r('.hero .btn'), facts: r('.facts'),
      h1size: getComputedStyle(document.querySelector('.big')).fontSize,
      green: getComputedStyle(document.querySelector('.big')).color,
      heroBg: getComputedStyle(document.querySelector('.hero')).backgroundColor,
    };
  });
  console.log('MINE', JSON.stringify(m));
  console.log('MOCKUP  start 1362,272  end 462,580  MAP 1211,375  DESIGN 624,391  AUTOMATE 230,441  TEST 330,586  h1 172px');
  console.log('MOCKUP nav: name x64 y~45; tagline x423; links x823-1020; button 1250-1376 y22-68; lead x64 y~742; button 64-200 y808-860; facts x1025 / 1245');
  await b.close();
} finally {
  stop();
}
