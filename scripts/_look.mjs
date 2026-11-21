import { chromium } from 'playwright';
const base = 'http://localhost:4431';
for (let i = 0; i < 40; i++) {
  try { if ((await fetch(base)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 400));
}
const b = await chromium.launch();
const errs = [];
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 789 } })).newPage();
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  const top = await p.evaluate(() => document.querySelector('#work').getBoundingClientRect().top + scrollY);
  let i = 0;
  for (const off of [0, 500, 900, 1500, 2200]) {
    for (let y = 0; y <= top + off; y += 300) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(25); }
    await p.evaluate((v) => window.scrollTo(0, v), top + off);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `_brief/shots/proof-d${i++}.png` });
  }
}
{
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  const top = await p.evaluate(() => document.querySelector('#work').getBoundingClientRect().top + scrollY);
  for (let y = 0; y <= top + 200; y += 300) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(25); }
  await p.evaluate((v) => window.scrollTo(0, v), top + 140);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: '_brief/shots/proof-m0.png' });
  await p.evaluate(() => { const r = document.querySelector('[data-rail]'); r.scrollTo({ left: r.clientWidth * 0.86 + 16, behavior: 'instant' }); });
  await p.waitForTimeout(900);
  await p.screenshot({ path: '_brief/shots/proof-m1.png' });
}
console.log(errs.join('|') || 'no errors');
await b.close();
