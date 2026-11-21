// Contact letter: blanks that grow, validation, submit, and the "sent" animation.

const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const wrap = document.querySelector<HTMLElement>('[data-form-wrap]');
const sent = document.querySelector<HTMLElement>('[data-sent]');
const errBox = document.querySelector<HTMLElement>('[data-error]');

const CHOICES = ['Build something new', 'Improve what I have', 'Hire you', 'Just say hi'];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mk = <T extends SVGElement>(tag: string, attrs: Record<string, string | number> = {}) => {
  const n = document.createElementNS(NS, tag) as T;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

if (form && wrap && sent && errBox) init(form, wrap, sent, errBox);

function init(form: HTMLFormElement, wrap: HTMLElement, sent: HTMLElement, errBox: HTMLElement) {
  const stamp = form.elements.namedItem('t') as HTMLInputElement;
  stamp.value = String(Date.now());

  // Blanks grow as you type. Browsers with field-sizing do it natively; others use a mirror.
  const native = CSS.supports('field-sizing', 'content');
  if (!native) {
    const mirror = document.createElement('span');
    mirror.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
    document.body.append(mirror);
    const fit = (f: HTMLInputElement | HTMLTextAreaElement) => {
      const cs = getComputedStyle(f);
      if (f instanceof HTMLTextAreaElement) {
        f.style.height = 'auto';
        f.style.height = `${f.scrollHeight}px`;
        return;
      }
      mirror.style.font = cs.font;
      mirror.style.letterSpacing = cs.letterSpacing;
      mirror.textContent = f.value || f.placeholder || '';
      f.style.width = `${Math.ceil(mirror.offsetWidth) + 14}px`;
    };
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type=text]:not([name=website]), input[type=email], textarea').forEach((f) => {
      f.addEventListener('input', () => fit(f));
      fit(f);
    });
    void document.fonts?.ready.then(() => form.querySelectorAll<HTMLInputElement>('input[type=text], input[type=email]').forEach((f) => f.dispatchEvent(new Event('input'))));
  }

  const field = (n: string) => form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | RadioNodeList;
  const val = (n: string) => ((field(n) as HTMLInputElement).value ?? '').trim();

  const validate = () => {
    const e: Record<string, string> = {};
    if (val('name').length < 1) e.name = 'Please add your name.';
    if (!CHOICES.includes(val('choice'))) e.choice = 'Please pick what you would like to do.';
    if (val('message').length < 5) e.message = 'Please write a line or two about what you need.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) e.email = 'Please enter a valid email so I can reply.';
    return e;
  };
  const firstEl = (name: string): HTMLElement | null => {
    if (name === 'choice') return form.querySelector<HTMLElement>('input[name=choice]');
    return form.elements.namedItem(name) as HTMLElement | null;
  };
  const showErrors = (e: Record<string, string>) => {
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    const order = ['name', 'choice', 'message', 'email'];
    const keys = order.filter((k) => e[k]);
    keys.forEach((k) => {
      if (k === 'choice') form.querySelectorAll('input[name=choice]').forEach((n) => n.setAttribute('aria-invalid', 'true'));
      else firstEl(k)?.setAttribute('aria-invalid', 'true');
    });
    errBox.textContent = keys.length ? e[keys[0]!]! : '';
    firstEl(keys[0] ?? '')?.focus();
  };
  form.addEventListener('input', (ev) => {
    const t = ev.target as HTMLElement;
    if (t.getAttribute('aria-invalid')) {
      t.removeAttribute('aria-invalid');
      if (t.getAttribute('name') === 'choice') form.querySelectorAll('input[name=choice]').forEach((n) => n.removeAttribute('aria-invalid'));
      errBox.textContent = '';
    }
  });

  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  let busy = false;

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (busy) return;
    const errs = validate();
    if (Object.keys(errs).length) return showErrors(errs);
    errBox.textContent = '';
    busy = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: val('name'),
          company: val('company'),
          choice: val('choice'),
          message: val('message'),
          email: val('email'),
          website: val('website'),
          t: Number(stamp.value),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> };
      if (res.ok && data.ok) {
        await playSent();
        return;
      }
      if (data.errors) showErrors(data.errors);
      else errBox.textContent = data.error ?? 'Something went wrong. Please email me directly.';
    } catch {
      errBox.textContent = 'Could not send. Please check your connection or email me directly.';
    }
    busy = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  });

  // On success: the orange line draws from the button to an end node, the light travels it, the form is replaced.
  async function playSent() {
    wrap.style.minHeight = `${wrap.offsetHeight}px`;
    if (!reduced) {
      const wr = wrap.getBoundingClientRect();
      const br = button.getBoundingClientRect();
      const bx = br.right - wr.left - 8;
      const by = br.top - wr.top + br.height / 2;
      const ex = clamp(bx + 360, bx + 120, wr.width - 16);
      const ey = by - clamp(wr.height * 0.18, 70, 150);

      const svg = mk<SVGSVGElement>('svg', { width: wr.width, height: wr.height, viewBox: `0 0 ${wr.width} ${wr.height}` });
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:5';
      const defs = mk('defs');
      const grad = mk('linearGradient', { id: 'capsule-sent', x1: 0, x2: 1, y1: 0, y2: 0 });
      [[0, 0], [0.5, 1], [1, 0]].forEach(([o, op]) => {
        const st = mk('stop', { offset: o!, 'stop-opacity': op! });
        st.style.stopColor = 'var(--glass)';
        grad.append(st);
      });
      defs.append(grad);
      const d = `M ${bx} ${by} C ${bx + 140} ${by + 30}, ${ex - 140} ${ey + 30}, ${ex} ${ey}`;
      const line = mk<SVGPathElement>('path', { d, pathLength: 1, fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' });
      line.style.stroke = 'var(--signal)';
      line.style.strokeDasharray = '1 1';
      line.style.strokeDashoffset = '1.01';
      const ring = mk<SVGCircleElement>('circle', { cx: ex, cy: ey, r: 12, 'fill-opacity': 0.16 });
      const dot = mk<SVGCircleElement>('circle', { cx: ex, cy: ey, r: 6 });
      const pulse = mk<SVGCircleElement>('circle', { cx: ex, cy: ey, r: 6 });
      [ring, dot, pulse].forEach((n) => (n.style.fill = 'var(--signal)'));
      pulse.style.cssText = 'opacity:0;transform-box:fill-box;transform-origin:center';
      [ring, dot].forEach((n) => (n.style.opacity = '0'));
      const light = mk<SVGGElement>('g');
      light.style.opacity = '0';
      light.append(mk('rect', { x: -14, y: -1.5, width: 28, height: 3, rx: 1.5, fill: 'url(#capsule-sent)' }));
      svg.append(defs, line, ring, dot, pulse, light);
      wrap.append(svg);

      await line.animate([{ strokeDashoffset: 1.01 }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }).finished;
      [ring, dot].forEach((n) => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: 'forwards' }));

      const L = line.getTotalLength();
      await new Promise<void>((resolve) => {
        const t0 = performance.now();
        const step = (now: number) => {
          const p = clamp((now - t0) / 1400, 0, 1);
          const len = ease(p) * L;
          const a = line.getPointAtLength(len);
          const b = line.getPointAtLength(Math.min(L, len + 1));
          const c = line.getPointAtLength(Math.max(0, len - 1));
          const ang = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI;
          light.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`);
          light.style.opacity = String(Math.min(1, p / 0.05, (1 - p) / 0.04));
          p < 1 ? requestAnimationFrame(step) : resolve();
        };
        requestAnimationFrame(step);
      });
      await pulse.animate([{ transform: 'scale(1)', opacity: 0.55 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 600, easing: 'ease-out' }).finished;
      await new Promise((r) => setTimeout(r, 250));
      await form.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished;
      svg.remove();
    }
    form.hidden = true;
    sent.hidden = false;
    sent.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: reduced ? 1 : 500, easing: 'cubic-bezier(0.16,1,0.3,1)' });
    sent.focus();
  }
}

export {};
