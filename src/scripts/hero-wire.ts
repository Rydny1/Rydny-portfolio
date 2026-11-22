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
  // "Reduce motion" (also switched on by Android battery saver and Remove animations) keeps the calm version:
  // the line still draws and the light still travels. Only the large spatial moves are dropped elsewhere.
  const reduced = false as boolean;
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
  let lut = new Float32Array(3 * 361);
  const pills: PillRef[] = [];
  let pillsBuilt = false;
  let lastMobile: boolean | null = null;

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
    if (lastMobile !== null && lastMobile !== mobile) {
      // the layout switched (rotation, resize): rebuild the pills for the new layout so none end up misplaced
      pillsG.replaceChildren();
      pills.length = 0;
      pillsBuilt = false;
    }
    lastMobile = mobile;
    const S: Pt = { x: sp.x + sp.w / 2 + fs * 0.03, y: sp.y + sp.h * 0.5 + fs * 0.31 };
    const E: Pt = mobile
      ? { x: Math.max(30, bp.x - 16), y: bp.y + bp.h * 0.5 }
      : { x: Math.max(12, bp.x - 6), y: bp.y + bp.h * 0.5 };
    const dy = Math.max(120, E.y - S.y);

    let d: string;
    let ts: number[];
    if (!mobile) {
      // The target's route (mockup 1440x900), rebuilt from the real full stop S and "B" node E so it holds at any size:
      // down from the stop, a long run left through MAP and DESIGN, the turn at AUTOMATE, then back right to TEST and E.
      const xl = W * 0.1285; // left extreme of the turn
      const span = S.x - xl;
      const y = (r: number) => S.y + r * dy;
      d =
        `M ${S.x} ${S.y} ` +
        `C ${S.x} ${y(0.325)}, ${S.x - 0.1206 * span} ${y(0.364)}, ${S.x - 0.316 * span} ${y(0.37)} ` +
        `C ${S.x - 0.6813 * span} ${y(0.39)}, ${xl - 0.0127 * span} ${y(0.35)}, ${xl} ${y(0.756)} ` +
        `C ${xl + 0.0085 * span} ${y(1.065)}, ${E.x - 0.37 * (E.x - xl)} ${y(1.032)}, ${E.x} ${E.y}`;
      ts = [0.127, 0.498, 0.749, 0.917]; // MAP, DESIGN, AUTOMATE, TEST: fractions of the target curve
    } else {
      // Phones: one smooth S. From the full stop it swings out to the right, sweeps left across the whole width and
      // eases down into the node above-left of "Build". Built as a Catmull-Rom spline through a few anchors, so the
      // direction never changes abruptly: no kinks, no bends beside "Build". Everything stays 16px+ inside the edges.
      // Phones: the smoothest possible line. A chain of true quarter-curves, each one leaving a point in exactly the
      // direction the last one arrived (horizontal or vertical at every join), so there is no wobble anywhere:
      // out to the right, a round turn down the right edge, a level sweep left, a second round turn down the
      // left lane, a round U under the node, then straight up into it. All 16px+ inside the screen edges.
      const k = 0.5523; // quarter-circle handle length (the final turn)
      const ks = 0.62; // slightly longer handles on the two big turns: softer curvature, a silkier line
      const L = 24; // the far-left turn, 16px+ inside the edge
      const R = { x: W - 28, y: S.y + 0.2 * dy }; // right turn
      const M = { x: W * 0.5, y: S.y + 0.5 * dy }; // middle of the sweep
      const Lp = { x: L, y: S.y + 0.74 * dy }; // left turn, heading down
      // out right, round turn down the right edge, level sweep left, one broad round turn at the left edge, and back
      // right into the node beside "Build". Every join has the same direction on both sides, so there is no wobble.
      d =
        `M ${S.x} ${S.y} ` +
        `C ${S.x + ks * (R.x - S.x)} ${S.y}, ${R.x} ${R.y - ks * (R.y - S.y)}, ${R.x} ${R.y} ` +
        `C ${R.x} ${R.y + ks * (M.y - R.y)}, ${M.x + ks * (R.x - M.x)} ${M.y}, ${M.x} ${M.y} ` +
        `C ${M.x - ks * (M.x - L)} ${M.y}, ${L} ${Lp.y - ks * (Lp.y - M.y)}, ${L} ${Lp.y} ` +
        `C ${L} ${Lp.y + k * (E.y - Lp.y)}, ${E.x - k * (E.x - L)} ${E.y}, ${E.x} ${E.y}`;
      ts = [0.1, 0.4, 0.69, 0.89];
    }
    track.setAttribute('d', d);
    line.setAttribute('d', d);
    L = line.getTotalLength();
    // Sample the path once per layout. Asking the SVG for a point on the path every frame is slow on phones.
    const N = 360;
    lut = new Float32Array((N + 1) * 3);
    for (let i = 0; i <= N; i++) {
      const q = line.getPointAtLength((L * i) / N);
      const q2 = line.getPointAtLength(Math.min(L, (L * i) / N + 1));
      const q1 = line.getPointAtLength(Math.max(0, (L * i) / N - 1));
      lut[i * 3] = q.x;
      lut[i * 3 + 1] = q.y;
      lut[i * 3 + 2] = (Math.atan2(q2.y - q1.y, q2.x - q1.x) * 180) / Math.PI;
    }

    const wanted = labels; // all four steps, on phones too

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
      // keep every pill at least 16px inside the screen edges
      const px = Math.min(W - 16 - p.w / 2, Math.max(16 + p.w / 2, pt.x));
      p.g.setAttribute('transform', `translate(${px.toFixed(1)} ${pt.y.toFixed(1)})`);
    });

    startG.setAttribute('transform', `translate(${S.x} ${S.y})`);
    endG.setAttribute('transform', `translate(${E.x} ${E.y})`);
  }

  // Static pieces: nodes and the light gradient.
  const popS = el<SVGGElement>('g', {}, 'pop');
  popS.append(el('circle', { r: 20 }, 'node-ring'), el('circle', { r: 9 }, 'node-dot'));
  startG.append(popS);
  const popE = el<SVGGElement>('g', {}, 'pop');
  popE.append(el('circle', { r: 12 }, 'node-ring'), el('circle', { r: 6 }, 'node-dot'));
  endG.append(popE, pulse);

  const lights = Array.from({ length: lightCount }, (_, i) => {
    const g = el<SVGGElement>('g', {}, 'light');
    g.style.opacity = '0';
    // The 6px glow is two stacked rects (no SVG filter: filters repaint every frame and are slow on phones)
    const outer = el('rect', { x: -CAPSULE_LEN / 2, y: -7.5, width: CAPSULE_LEN, height: 15, rx: 7.5 }, 'glow outer');
    const mid = el('rect', { x: -CAPSULE_LEN / 2, y: -4.5, width: CAPSULE_LEN, height: 9, rx: 4.5 }, 'glow mid');
    g.append(outer, mid, el('rect', { x: -CAPSULE_LEN / 2, y: -1.5, width: CAPSULE_LEN, height: 3, rx: 1.5 }, 'core'));
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
      const f = (len / L) * 360;
      const i0 = Math.min(359, Math.floor(f));
      const u = f - i0;
      const ax = lut[i0 * 3] + (lut[i0 * 3 + 3] - lut[i0 * 3]) * u;
      const ay = lut[i0 * 3 + 1] + (lut[i0 * 3 + 4] - lut[i0 * 3 + 1]) * u;
      const ang = lut[i0 * 3 + 2] + (lut[i0 * 3 + 5] - lut[i0 * 3 + 2]) * u;
      l.g.setAttribute('transform', `translate(${ax.toFixed(2)} ${ay.toFixed(2)}) rotate(${ang.toFixed(2)})`);
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
  window.addEventListener('hero-replay', () => {
    stop();
    t0Pending = true;
    lights.forEach((l) => { l.cycle = -1; l.g.style.opacity = '0'; });
    start();
  });
  addEventListener('scroll', () => (covered() ? stop() : start()), { passive: true });
  start();
}

// Build the wire after the first paint so it never competes with the first screen
if (hero && svg) requestAnimationFrame(() => requestAnimationFrame(() => init(hero, svg)));

export {};
