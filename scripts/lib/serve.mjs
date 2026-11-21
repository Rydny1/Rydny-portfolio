// Starts `astro preview` for a built site and reliably stops it (kills whatever listens on the port).
import { spawn, execSync } from 'node:child_process';

export async function serve(dir = '.', port = 4400) {
  const base = `http://localhost:${port}`;
  const proc = spawn('npx', ['astro', 'preview', '--port', String(port)], { cwd: dir, shell: true, stdio: 'ignore' });
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  const stop = () => {
    try {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const pids = new Set(
        out
          .split('\n')
          .filter((l) => l.includes('LISTENING'))
          .map((l) => l.trim().split(/\s+/).pop()),
      );
      for (const pid of pids) if (pid && pid !== '0') execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      /* nothing listening */
    }
    try {
      proc.kill();
    } catch {
      /* already gone */
    }
  };
  return { base, stop };
}
