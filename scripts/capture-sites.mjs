// Captures the top of each live product (16:10 stills) and records short silent scroll loops for approval.
// Stills go to public/img; loops go to _brief/report/loops (NOT public until Rydny approves each one).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const targets = [{ slug: 'apex', url: 'https://apex-ai-analysis.vercel.app' }];
const loops = '_brief/report/loops';
mkdirSync(loops, { recursive: true });

const browser = await chromium.launch();
for (const t of targets) {
  // 1. Still: the top of the site at 1600x1000 (16:10)
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await ctx.newPage();
  await page.goto(t.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const png = await page.screenshot({ type: 'png' });
  await ctx.close();
  const base = sharp(png).resize({ width: 1600 });
  await Promise.all([
    base.clone().avif({ quality: 52, effort: 6 }).toFile(`public/img/${t.slug}.avif`),
    base.clone().webp({ quality: 74 }).toFile(`public/img/${t.slug}.webp`),
  ]);

  // 2. Loop: 7 seconds of the real product being scrolled
  const tmp = `${loops}/_tmp`;
  rmSync(tmp, { recursive: true, force: true });
  const vctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: tmp, size: { width: 1280, height: 800 } } });
  const vp = await vctx.newPage();
  await vp.goto(t.url, { waitUntil: 'networkidle' });
  await vp.waitForTimeout(800);
  const total = await vp.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const dist = Math.min(total, 1800);
  const steps = 70;
  for (let i = 0; i <= steps; i++) {
    const e = i / steps;
    const eased = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
    await vp.evaluate((y) => window.scrollTo(0, y), dist * eased);
    await vp.waitForTimeout(65);
  }
  await vp.waitForTimeout(600);
  await vctx.close();
  const f = readdirSync(tmp)[0];
  const raw = `${tmp}/${f}`;
  const out = `${loops}/${t.slug}-loop`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.6', '-i', raw, '-t', '7', '-an', '-vf', 'scale=1280:-2,fps=24', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', `${out}.webm`]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', '0.6', '-i', raw, '-t', '7', '-an', '-vf', 'scale=1280:-2,fps=24', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '30', '-preset', 'slow', '-movflags', '+faststart', `${out}.mp4`]);
  rmSync(tmp, { recursive: true, force: true });
  console.log(t.slug, 'webm', statSync(`${out}.webm`).size, 'mp4', statSync(`${out}.mp4`).size);
}
await browser.close();
