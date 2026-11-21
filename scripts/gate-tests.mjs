// Gate checks against the built site. Usage: npm run build && node scripts/gate-tests.mjs
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { HtmlValidate } from 'html-validate';
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 4400;
const BASE = `http://localhost:${PORT}`;
const shots = '_brief/shots';
mkdirSync(shots, { recursive: true });
const results = [];
const log = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

try {
  const browser = await chromium.launch();

  // Test 9: JS disabled, every copy string visible
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
    const src = readFileSync('src/content/copy.ts', 'utf8') + readFileSync('src/content/projects.ts', 'utf8');
    const wanted = [...src.matchAll(/(?:problem|fix|result|text|lead|title|label|badge|quote|name|line2|line1):\s*\n?\s*(['"])(.+?)\1,?\n/g)].map((m) => m[2]);
    const missing = wanted.filter((w) => w.length > 6 && !w.includes(' | ') && !text.toLowerCase().includes(w.replace(/\\'/g, "'").toLowerCase()));
    log('9  JS disabled: copy visible', missing.length === 0, missing.length ? 'missing: ' + missing.slice(0, 5).join(' | ') : `${wanted.length} strings checked`);
    await page.screenshot({ path: `${shots}/nojs-1440.png`, fullPage: true });
    await ctx.close();
  }

  // Dash rule
  {
    const html = readFileSync('dist/index.html', 'utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
    const hits = html.match(/[–—]/g);
    log('   no em or en dashes in rendered page', !hits, hits ? `${hits.length} found` : '');
  }

  // Test 8: screenshots across widths, overflow check
  for (const w of [360, 390, 768, 1024, 1280, 1440, 1920]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.screenshot({ path: `${shots}/hero-${w}.png` });
    // Trigger lazy images so the full-page shot is honest
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${shots}/full-${w}.png`, fullPage: true });
    log(`8  width ${w}: no horizontal overflow`, overflow <= 0, overflow > 0 ? `${overflow}px over` : '');
    log(`   width ${w}: no console errors`, errors.length === 0, errors.join(' ; '));
    await ctx.close();
  }

  // Hero fits the first screen on every device class, nothing clipped, overlapping or overflowing
  const devices = [
    [360, 640], [375, 667], [390, 844], [393, 852], [412, 915], [430, 932], [844, 390], [667, 375],
    [768, 1024], [820, 1180], [1024, 768], [1024, 1366], [1180, 820],
    [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1680, 1050], [1920, 1080], [2560, 1440], [3440, 1440],
  ];
  for (const [w, h] of devices) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const m = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const hero = r('.hero'), l1 = r('.l1'), l2 = r('.l2'), bot = r('.bottom'), nav = r('.nav');
      return { heroH: Math.round(hero.height), vh: innerHeight, navBottom: Math.round(nav.bottom), l1Top: Math.round(l1.top), l1Right: Math.round(l1.right), l2Bottom: Math.round(l2.bottom), botTop: Math.round(bot.top), botBottom: Math.round(bot.bottom), l2Right: Math.round(l2.right), l2Left: Math.round(l2.left), vw: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    const desktop = w >= 900;
    // Desktop must equal the screen. Portrait phones and tablets (800px tall or more) must fit. Short or landscape screens may scroll but never overlap.
    const heightOk = desktop ? m.heroH === m.vh : h >= 800 && h > w ? m.heroH <= m.vh + 1 : true;
    const ok = heightOk && m.l1Top > m.navBottom && m.l2Bottom < m.botTop && m.botBottom <= m.heroH - 8 && m.l1Right <= m.vw && m.l2Right <= m.vw && m.l2Left >= 0 && m.overflow <= 0;
    log(`   hero fits ${w}x${h}`, ok, ok ? '' : JSON.stringify(m));
    await page.screenshot({ path: `${shots}/fit-${w}x${h}.png` });
    await ctx.close();
  }

  // Hero wire: built, light travels, frames are smooth, nothing throws
  for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600); // load sequence is 1.89s
    const info = await page.evaluate(async () => {
      const pills = document.querySelectorAll('.wire .pill').length;
      const lightEl = document.querySelector('.wire .light');
      const samples = [];
      const gaps = [];
      let last = performance.now();
      await new Promise((res) => {
        const t0 = performance.now();
        const tick = (now) => {
          gaps.push(now - last); last = now;
          samples.push(lightEl.getAttribute('transform'));
          now - t0 < 2500 ? requestAnimationFrame(tick) : res();
        };
        requestAnimationFrame(tick);
      });
      const moved = new Set(samples.filter(Boolean)).size;
      gaps.sort((a, b) => a - b);
      return { pills, moved, p95: gaps[Math.floor(gaps.length * 0.95)], max: gaps[gaps.length - 1] };
    });
    log(`   wire ${label}: pills built (${info.pills}), light moves (${info.moved} positions)`, info.pills === (w < 900 ? 2 : 4) && info.moved > 20, JSON.stringify(info));
    log(`   wire ${label}: no script errors`, errs.length === 0, errs.join(' ; '));
    await page.screenshot({ path: `${shots}/wire-${label}.png` });
    await ctx.close();
  }

  // Test 10: reduced motion
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const playing = await page.evaluate(() => !document.querySelector('.hero .wall').paused);
    log('10 reduced motion: video not playing', !playing);
    await ctx.close();
  }

  // Test 4: axe
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
    log('4  axe: zero violations', r.violations.length === 0, r.violations.map((v) => `${v.id}(${v.nodes.length})`).join(', '));
    await ctx.close();
  }

  // Test 15: video pauses off screen
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const before = await page.evaluate(() => !document.querySelector('.hero .wall').paused);
    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => document.querySelector('.hero .wall').paused);
    log('15 video plays on screen, pauses off screen', before && after, `playing=${before} pausedAfterScroll=${after}`);
    await ctx.close();
  }

  await browser.close();

  // Test 5: html-validate
  {
    const hv = new HtmlValidate({ extends: ['html-validate:recommended'], rules: { 'no-inline-style': 'off', 'wcag/h30': 'off' } });
    let bad = 0;
    const out = [];
    for (const f of ['dist/index.html', 'dist/404.html']) {
      const rep = await hv.validateString(readFileSync(f, 'utf8'), f);
      for (const res of rep.results) for (const m of res.messages) { bad++; out.push(`${f}:${m.line} ${m.ruleId} ${m.message}`); }
    }
    log('5  html-validate: zero errors', bad === 0, out.slice(0, 5).join(' | '));
  }

  // Test 6: links
  {
    const html = readFileSync('dist/index.html', 'utf8');
    const hrefs = [...new Set([...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))].filter((h) => !h.includes('localhost') && !h.includes('rydny-portfolio.vercel.app'));
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
    const badAnchors = anchors.filter((a) => !ids.has(a));
    log('6  internal anchors resolve', badAnchors.length === 0, badAnchors.join(','));
    const bad = [];
    for (const h of hrefs) {
      try {
        let r = await fetch(h, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } });
        if (r.status !== 200) bad.push(`${h} -> ${r.status}`);
      } catch (e) { bad.push(`${h} -> ${e.cause?.code ?? e.message}`); }
    }
    log('6  external links return 200', bad.length === 0, bad.join(' ; ') || `${hrefs.length} checked`);
  }

  // Test 7: bundle sizes
  {
    const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
    const files = walk('dist');
    const sum = (re) => files.filter((f) => re.test(f)).reduce((a, f) => a + statSync(f).size, 0);
    const html = readFileSync('dist/index.html', 'utf8');
    const inlineJs = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].reduce((a, m) => a + m[1].length, 0);
    const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].reduce((a, m) => a + m[1].length, 0);
    console.log(`     JS: ${sum(/\.js$/)} B on disk + ${inlineJs} B inline | CSS: ${sum(/\.css$/)} B on disk + ${inlineCss} B inline | index.html ${statSync('dist/index.html').size} B`);
    log('7  JS under 60 KB, CSS under 25 KB (raw)', sum(/\.js$/) + inlineJs < 60000 && sum(/\.css$/) + inlineCss < 25000);
  }
} finally {
  server.kill();
  spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
