// Lists computed padding, margin and gap values that are not on the 8px scale (ignores 0 and 1 to 4px hairlines).
// Usage: node scripts/audit-spacing.mjs [width]
import { chromium } from 'playwright';
import { serve } from './lib/serve.mjs';

const width = Number(process.argv[2] ?? 1440);
const { base, stop } = await serve('.', 4422);
try {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })).newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  const bad = await p.evaluate(() => {
    const props = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginBottom', 'rowGap', 'columnGap'];
    const seen = new Map();
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg') || el.closest('.cursor')) continue;
      const cs = getComputedStyle(el);
      for (const k of props) {
        const v = parseFloat(cs[k]);
        if (!v || v <= 4 || Number.isNaN(v) || cs[k] === 'normal') continue;
        if (Math.abs(v / 8 - Math.round(v / 8)) > 0.02) {
          const name = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
          const key = `${name} ${k} ${v}`;
          seen.set(key, (seen.get(key) ?? 0) + 1);
        }
      }
    }
    return [...seen.entries()].map(([k, n]) => `${k} x${n}`);
  });
  console.log(bad.length ? bad.join('\n') : 'all on the 8px scale');
  await b.close();
} finally {
  stop();
}
