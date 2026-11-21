// Leaf cursor: a small vintage-green leaf that trails the pointer on a light spring, turns toward its
// direction of travel and sways when idle. Multiply blend, so the text under it stays fully readable.
// Fine pointers only, never with reduced motion.

if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<svg class="leaf" viewBox="0 0 24 24" width="22" height="22" focusable="false">' +
    '<path class="blade" d="M12 1.6C18.4 6.4 19.2 14 12 22.4C4.8 14 5.6 6.4 12 1.6Z"/>' +
    '<path class="vein" d="M12 22.4V7.2M12 15.2L8.6 11.6M12 12.4L15.2 9.2"/>' +
    '</svg><span class="label">View project</span>';
  document.body.append(el);
  const leaf = el.querySelector<SVGElement>('.leaf')!;
  const label = el.querySelector<HTMLElement>('.label')!;
  document.documentElement.classList.add('has-cursor');

  // Spring state
  let x = -100;
  let y = -100;
  let vx = 0;
  let vy = 0;
  let tx = -100;
  let ty = -100;
  let rot = 20; // degrees; the leaf tip leads
  let tilt = 0; // extra tilt over links
  let tiltTarget = 0;
  let scale = 1;
  let scaleTarget = 1;
  let lastMove = 0;
  let running = false;
  let first = true;

  const STIFF = 0.16;
  const DAMP = 0.74;

  const shortest = (a: number, b: number) => ((((b - a) % 360) + 540) % 360) - 180;

  const frame = (now: number) => {
    vx = (vx + (tx - x) * STIFF) * DAMP;
    vy = (vy + (ty - y) * STIFF) * DAMP;
    x += vx;
    y += vy;
    const speed = Math.hypot(vx, vy);
    if (speed > 1.2) {
      const target = (Math.atan2(vy, vx) * 180) / Math.PI + 90; // leaf points up at 0deg
      rot += shortest(rot, target) * 0.14;
    }
    tilt += (tiltTarget - tilt) * 0.2;
    scale += (scaleTarget - scale) * 0.2;
    const idle = now - lastMove > 350 && speed < 0.15;
    const sway = idle ? Math.sin(now / 520) * 4 : 0;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    leaf.style.transform = `translate(-50%, -50%) rotate(${(rot + tilt + sway).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
    if (idle && Math.abs(tilt - tiltTarget) < 0.05 && Math.abs(scale - scaleTarget) < 0.002 && now - lastMove > 4000) {
      running = false; // fully settled: stop the loop until the next move
      return;
    }
    requestAnimationFrame(frame);
  };
  const wake = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (first) {
        x = tx;
        y = ty;
        first = false;
      }
      lastMove = performance.now();
      const t = e.target as Element | null;
      const field = !!t?.closest('input, textarea, select');
      el.classList.toggle('on', !field);
      const view = !!t?.closest('[data-cursor]');
      const link = !view && !!t?.closest('a, button, label, summary, [role=button], [data-hover]');
      el.classList.toggle('view', view);
      el.classList.toggle('link', link);
      tiltTarget = link ? 20 : 0;
      scaleTarget = link ? 1.35 : 1;
      wake();
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => el.classList.remove('on'));
  document.addEventListener('pointerdown', () => (scaleTarget = 0.85));
  document.addEventListener('pointerup', () => (scaleTarget = el.classList.contains('link') ? 1.35 : 1));
  void label;
}

export {};
