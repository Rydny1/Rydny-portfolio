// Glass cursor: a small clear ring that grows over links and shows "View" over project images.
// Fine pointers only, never with reduced motion. Moves with transform; size changes use transform scale.

if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const el = document.createElement('div');
  el.className = 'cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="ring"></div><div class="label"></div>';
  document.body.append(el);
  const label = el.querySelector<HTMLElement>('.label')!;
  document.documentElement.classList.add('has-cursor');

  let x = -100;
  let y = -100;
  let tx = -100;
  let ty = -100;
  let raf = 0;
  const loop = () => {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!el.classList.contains('on')) {
        x = tx = e.clientX;
        y = ty = e.clientY;
      }
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add('on');
      const t = e.target as Element | null;
      const field = !!t?.closest('input, textarea, select');
      el.classList.toggle('on', !field);
      const view = t?.closest<HTMLElement>('[data-cursor]');
      const link = !view && !!t?.closest('a, button, label, summary, [role=button]');
      el.classList.toggle('view', !!view);
      el.classList.toggle('link', link);
      label.textContent = view?.dataset.cursor ?? '';
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => el.classList.remove('on'));
  document.addEventListener('pointerdown', () => el.classList.add('down'));
  document.addEventListener('pointerup', () => el.classList.remove('down'));
}

export {};
