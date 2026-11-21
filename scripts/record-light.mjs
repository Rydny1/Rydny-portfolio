// Records the hero (load sequence + light trips). Output: _brief/report/light-*.webm (1x) and *-halfspeed.mp4
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
const PORT = 4400, BASE = `http://localhost:${PORT}`;
const out = '_brief/report'; mkdirSync(out, { recursive: true });
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { shell: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 500)); }
const browser = await chromium.launch();
for (const [name, q] of [['one-light', ''], ['two-lights', '?lights=2']]) {
  const tmp = `${out}/_tmp`; rmSync(tmp, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: tmp, size: { width: 1440, height: 900 } } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/' + q, { waitUntil: 'networkidle' });
  await page.waitForTimeout(15500);
  await ctx.close();
  const f = readdirSync(tmp)[0];
  renameSync(`${tmp}/${f}`, `${out}/light-${name}.webm`);
  rmSync(tmp, { recursive: true, force: true });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${out}/light-${name}.webm`, '-vf', 'setpts=2*PTS,fps=30', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', `${out}/light-${name}-halfspeed.mp4`]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${out}/light-${name}.webm`, '-vf', 'fps=30', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', `${out}/light-${name}.mp4`]);
}
await browser.close();
server.kill(); spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { shell: true, stdio: 'ignore' });
console.log('recorded');
