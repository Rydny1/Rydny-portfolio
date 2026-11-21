// Hero wire: builds the route from real text positions, then runs the light on a loop.
// Only transform and opacity are animated at runtime. No layout properties.

const NS = 'http://www.w3.org/2000/svg';
const K = 1.18; // keep in step with --k in tokens.css
const TRIP = 5500; // ms for one trip, full stop to "Build"
const WAIT = 800; // ms pause at the end node before the next trip
const SEQUENCE = 1600 * K; // load sequence length in ms
const CAPSULE_LEN = 28;

interface Pt { x: number; y: number }
interface PillRef { g: SVGGElement; flash: SVGCircleElement; t: number; w: number }

const hero = document.querySelector<HTMLElement>('.hero');
const svg = hero?.querySelector<SVGSVGElement>('.wire') ?? null;

function el<T extends SVGElement>(tag: string, attrs: Record<string, string | number> = {}, cls?: string): T {
  const n = document.createElementNS(NS, tag) as T;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (cls) n.setAttribute('class', cls);
  return n;
}
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function init(hero: HTMLElement, svg: SVGSVGElement) {
  const labels: string[] = JSON.parse(svg.dataset.steps ?? '[]');
  const lightCount = new URLSearchParams(location.search).get('lights') === '2' ? 2 : 1;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animateIn = !reduced && !document.documentElement.classList.contains('seen');

  const track = svg.querySelector<SVGPathElement>('.track')!;
  const line = svg.querySelector<SVGPathElement>('.line')!;
  const startG = svg.querySelector<SVGGElement>('.start')!;
  const endG = svg.querySelector<SVGGElement>('.end')!;
  const pulse = el<SVGCircleElement>('circle', { r: 6 }, 'pulse');
  const pillsG = svg.querySelector<SVGGElement>('.pills')!;
  const lightsG = svg.querySelector<SVGGElement>('.lights')!;
  const stopEl = hero.querySelector<HTMLElement>('[data-wire-start]')!;
  const bEl = hero.querySelector<HTMLElement>('[data-wire-end]')!;
  const h1 = hero.querySelector<HTMLElement>('h1')!;

  let L = 1;
  const pills: PillRef[] = [];
  let pillsBuilt = false;

  // Offsets ignore transforms, so the load animation cannot skew the measurement.
  const pos = (node: HTMLElement) => {
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = node;
    while (n && n !== hero) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return { x, y, w: node.offsetWidth, h: node.offsetHeight };
  };

  function build() {
    const W = hero.clientWidth;
    const H = hero.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const fs = parseFloat(getComputedStyle(h1).fontSize);
    const sp = pos(stopEl);
    const bp = pos(bEl);
    const mobile = W < 900;
    const S: Pt = { x: sp.x + sp.w / 2, y: sp.y + sp.h * 0.5 + fs * 0.3 };
    const E: Pt = mobile
      ? { x: Math.max(14, bp.x + 6), y: bp.y + fs * 0.1 }
      : { x: Math.max(12, bp.x - 18), y: bp.y + bp.h * 0.5 + fs * 0.12 };
    const dy = Math.max(120, E.y - S.y);

    let d: string;
    let ts: number[];
    if (!mobile) {
      // Same loop as the approved mockup, but built from the real S and E so it holds at any width.
      const xl = Math.min(W * 0.165, S.x - 120); // left extreme of the loop
      const fx = (r: number) => S.x - r * (S.x - xl);
      const fy = (r: number) => S.y + r * dy;
      const bottomMid = fx(0.645);
      d =
        `M ${S.x} ${S.y} ` +
        `C ${S.x} ${fy(0.38)}, ${fx(0.26)} ${fy(0.31)}, ${fx(0.55)} ${fy(0.41)} ` +
        `C ${fx(0.976)} ${fy(0.55)}, ${fx(1.12)} ${fy(0.95)}, ${fx(0.884)} ${fy(1.185)} ` +
        `C ${bottomMid} ${fy(1.42)}, ${E.x - Math.max(60, 0.3 * (E.x - bottomMid))} ${fy(1.08)}, ${E.x} ${E.y}`;
      ts = [0.13, 0.37, 0.61, 0.8];
    } else {
      // Phones: a tall S between the two lines, ending above the "B". Two pills.
      d =
        `M ${S.x} ${S.y} ` +
        `C ${S.x + (W - S.x) * 0.9} ${S.y + dy * 0.04}, ${W * 0.96} ${S.y + dy * 0.3}, ${W * 0.72} ${S.y + dy * 0.46} ` +
        `C ${W * 0.46} ${S.y + dy * 0.62}, ${E.x} ${S.y + dy * 0.55}, ${E.x} ${E.y}`;
      ts = [0.3, 0.72];
    }
    track.setAttribute('d', d);
    line.setAttribute('d', d);
    L = line.getTotalLength();

    const wanted = mobile ? [0, 2].map((i) => labels[i]).filter((v): v is string => !!v) : labels;

    if (!pillsBuilt) {
      wanted.forEach((label, i) => {
        const w = 34.6 + 7.8 * label.length;
        const g = el<SVGGElement>('g', {}, 'pill' + (label === 'AUTOMATE' ? ' active' : ''));
        const body = el<SVGGElement>('g', {}, 'pill-body');
        body.style.setProperty('--d', `calc((0.6s + ${(0.7 * ts[i]!).toFixed(3)}s) * var(--k))`);
        body.append(
          el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 15 }),
          el('circle', { cx: -w / 2 + 14, cy: 0, r: 3.5 }, 'd'),
          el('circle', { cx: -w / 2 + 14, cy: 0, r: 3.5 }, 'flash'),
        );
        const text = el<SVGTextElement>('text', { x: -w / 2 + 24, y: 4 });
        text.textContent = label;
        body.append(text);
        g.append(body);
        pillsG.append(g);
        pills.push({ g, flash: body.querySelector('.flash')!, t: ts[i]!, w });
      });
      pillsBuilt = true;
    }
    pills.forEach((p, i) => {
      p.t = ts[i]!;
      const pt = line.getPointAtLength(L * p.t);
      p.g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    });

    startG.setAttribute('transform', `translate(${S.x} ${S.y})`);
    endG.setAttribute('transform', `translate(${E.x} ${E.y})`);
  }

  // Static pieces: nodes and the light gradient.
  const popS = el<SVGGElement>('g', {}, 'pop');
  popS.append(el('circle', { r: 18 }, 'node-ring'), el('circle', { r: 8 }, 'node-dot'));
  startG.append(popS);
  const popE = el<SVGGElement>('g', {}, 'pop');
  popE.append(el('circle', { r: 12 }, 'node-ring'), el('circle', { r: 6 }, 'node-dot'));
  endG.append(popE, pulse);

  const lights = Array.from({ length: lightCount }, (_, i) => {
    const g = el<SVGGElement>('g', {}, 'light');
    g.style.opacity = '0';
    const glow = el('rect', { x: -CAPSULE_LEN / 2, y: -7.5, width: CAPSULE_LEN, height: 15, rx: 7.5 }, 'glow');
    glow.setAttribute('filter', 'url(#soft)');
    g.append(glow, el('rect', { x: -CAPSULE_LEN / 2, y: -1.5, width: CAPSULE_LEN, height: 3, rx: 1.5 }, 'core'));
    lightsG.append(g);
    return { g, offset: i * ((TRIP + WAIT) / 2), cycle: -1, fired: [] as boolean[], pulsed: false };
  });

  build();
  void document.fonts?.ready.then(build);
  let raf = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(build);
  }).observe(hero);

  try {
    window.setTimeout(() => sessionStorage.setItem('seen', '1'), SEQUENCE);
  } catch {
    /* storage can be blocked */
  }

  if (reduced) return; // wire stays fully drawn, no light

  const flash = (p: PillRef) => {
    p.flash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 300, easing: 'ease-out' });
  };
  const doPulse = () => {
    pulse.animate([{ transform: 'scale(1)', opacity: 0.55 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 600, easing: 'ease-out' });
  };

  let t0 = 0;
  let running = false;
  let visible = true;
  let frameId = 0;
  const cycleLen = TRIP + WAIT;

  const frame = (now: number) => {
    for (const l of lights) {
      const local = now - t0 - l.offset;
      if (local < 0) { l.g.style.opacity = '0'; continue; }
      const cycle = Math.floor(local / cycleLen);
      const t = local - cycle * cycleLen;
      if (cycle !== l.cycle) {
        l.cycle = cycle;
        l.fired = pills.map(() => false);
        l.pulsed = false;
      }
      if (t >= TRIP) {
        l.g.style.opacity = '0';
        if (!l.pulsed) { l.pulsed = true; doPulse(); }
        continue;
      }
      const p = t / TRIP;
      const e = easeInOut(p);
      const len = e * L;
      const a = line.getPointAtLength(len);
      const b = line.getPointAtLength(Math.min(L, len + 1));
      const c = line.getPointAtLength(Math.max(0, len - 1));
      const ang = (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI;
      l.g.setAttribute('transform', `translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${ang.toFixed(2)})`);
      l.g.style.opacity = String(Math.min(1, p / 0.04, (1 - p) / 0.03));
      pills.forEach((pl, i) => {
        if (!l.fired[i] && e >= pl.t) { l.fired[i] = true; flash(pl); }
      });
    }
    frameId = requestAnimationFrame(frame);
  };

  const covered = () => scrollY > innerHeight * 1.1;
  const start = () => {
    if (running || !visible || document.hidden || covered()) return;
    running = true;
    t0 = performance.now() + (t0Pending ? SEQUENCE_DELAY : 0);
    t0Pending = false;
    frameId = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  const SEQUENCE_DELAY = animateIn ? SEQUENCE + 100 : 300;
  let t0Pending = true;

  new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    visible ? start() : stop();
  }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('scroll', () => (covered() ? stop() : start()), { passive: true });
  start();
}

if (hero && svg) init(hero, svg);

export {};
