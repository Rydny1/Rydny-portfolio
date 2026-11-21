// Project loops: load lazily near the viewport, play only while in view, poster only on Save-Data,
// slow connections or reduced motion. (No loop ships until Rydny approves it: `video` is null in projects.ts.)
import { reduced } from './motion';

const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video.loop, video.shadows')).filter((v) => !v.classList.contains('shadows') || matchMedia('(min-width: 900px)').matches);
const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const posterOnly = reduced || !!conn?.saveData || /^(slow-2g|2g|3g)$/.test(conn?.effectiveType ?? '');

if (videos.length && !posterOnly) {
  const load = (v: HTMLVideoElement) => {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    for (const [type, src] of [['video/webm', v.dataset.webm], ['video/mp4', v.dataset.mp4]] as const) {
      if (!src) continue;
      const s = document.createElement('source');
      s.src = src;
      s.type = type;
      v.append(s);
    }
    v.load();
  };
  const near = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (load(e.target as HTMLVideoElement), near.unobserve(e.target))), { rootMargin: '600px 0px' });
  const watch = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? (e.target as HTMLVideoElement).play().catch(() => {}) : (e.target as HTMLVideoElement).pause())), { threshold: 0.25 });
  videos.forEach((v) => {
    near.observe(v);
    watch.observe(v);
  });
  document.addEventListener('visibilitychange', () => document.hidden && videos.forEach((v) => v.pause()));
}

export {};
