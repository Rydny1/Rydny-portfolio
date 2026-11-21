// Small interaction helpers shared by every page. No dependencies.

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Magnetic buttons: move up to 6px toward the cursor when it is near.
if (fine && !reduced) {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));
  const MAX = 6;
  const RANGE = 90;
  window.addEventListener(
    'pointermove',
    (e) => {
      for (const el of items) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const near = Math.abs(dx) < r.width / 2 + RANGE && Math.abs(dy) < r.height / 2 + RANGE;
        if (near) {
          el.style.transition = 'transform 0.12s linear, color 0.35s';
          el.style.transform = `translate(${Math.max(-MAX, Math.min(MAX, dx * 0.12))}px, ${Math.max(-MAX, Math.min(MAX, dy * 0.2))}px)`;
        } else if (el.style.transform) {
          el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s';
          el.style.transform = '';
        }
      }
    },
    { passive: true },
  );
}

import './cursor';
import './scroll';

export {};
