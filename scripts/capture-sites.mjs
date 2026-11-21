// Captures the top of each live product (16:10 stills) and builds short silent scroll loops for approval.
// Stills go to public/img; loops go to _brief/report/loops (NOT public until Rydny approves each one).
// Loops are assembled from real screenshot frames (more dependable than page video recording).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, rmSync, statSync } from 'node:fs';
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

  // 2. Loop: the real product scrolled down and back up, 7 seconds at 24fps (168 frames)
  const tmp = `${loops}/_frames`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const vctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const vp = await vctx.newPage();
  await vp.goto(t.url, { waitUntil: 'networkidle' });
  await vp.waitForTimeout(800);
  const total = await vp.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const dist = Math.min(total, 1500);
  const frames = 168;
  for (let i = 0; i < frames; i++) {
    // down for the first half, back up for the second: a seamless loop
    const e = i / frames;
    const tri = e < 0.5 ? e * 2 : (1 - e) * 2;
    const eased = tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2;
    await vp.evaluate((y) => window.scrollTo(0, y), dist * eased);
    await vp.waitForTimeout(40);
    await vp.screenshot({ path: `${tmp}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 88 });
  }
  await vctx.close();
  const out = `${loops}/${t.slug}-loop`;
  const input = ['-framerate', '24', '-i', `${tmp}/f%04d.jpg`];
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...input, '-an', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36', '-row-mt', '1', '-pix_fmt', 'yuv420p', `${out}.webm`]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...input, '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-preset', 'slow', '-movflags', '+faststart', `${out}.mp4`]);
  rmSync(tmp, { recursive: true, force: true });
  console.log(t.slug, 'webm', statSync(`${out}.webm`).size, 'mp4', statSync(`${out}.mp4`).size);
}
await browser.close();
