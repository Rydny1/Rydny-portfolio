// Scroll behaviour: reveals, mini flows, portrait parallax, the page wire and the footer letters.
// Content is visible in the HTML. Animations start from a hidden frame only when an element enters view
// (WAAPI fill: backwards), so nothing can stay hidden if a script fails.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function onEnter(els: Element[], fn: (el: HTMLElement) => void, threshold = 0.15) {
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        fn(e.target as HTMLElement);
      }
    },
    { threshold, rootMargin: '0px 0px -6% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

if (!reduced) {
  // 1. Fade and rise as sections arrive
  onEnter(Array.from(document.querySelectorAll('[data-reveal]')), (el) => {
    el.animate(
      [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 800, delay: Number(el.dataset.delay ?? 0), easing: EASE, fill: 'backwards' },
    );
  });

  // 2. Mini flows: step 1 lights, line draws, step 2, line, step 3. 0.9s total, once.
  onEnter(
    Array.from(document.querySelectorAll('[data-flow]')),
    (flow) => {
      const steps = Array.from(flow.querySelectorAll<HTMLElement>('.step'));
      const lines = Array.from(flow.querySelectorAll<HTMLElement>('.line'));
      const fade = (el: HTMLElement, at: number) =>
        el.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 150, delay: at, easing: 'ease-out', fill: 'backwards' });
      fade(steps[0]!, 0);
      lines.forEach((ln, i) => {
        ln.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 300, delay: 150 + i * 300, easing: 'ease-in-out', fill: 'backwards' });
        fade(steps[i + 1]!, 450 + i * 300);
      });
    },
    0.5,
  );

  // 3. Footer letters rise one by one
  onEnter(
    Array.from(document.querySelectorAll('[data-letters]')),
    (big) => {
      big.querySelectorAll<HTMLElement>('.ch').forEach((ch, i) => {
        ch.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 900, delay: i * 45, easing: EASE, fill: 'backwards' });
      });
    },
    0.35,
  );
}

// 4. Portrait parallax, 24px at most
const par = document.querySelector<HTMLElement>('[data-parallax] img');
const frame = par?.closest<HTMLElement>('[data-parallax]') ?? null;

// 5. Page wire: one orange line down the left edge of the page. Nodes light as you pass each section.
const main = document.querySelector<HTMLElement>('main');
const NS = 'http://www.w3.org/2000/svg';
const mk = <T extends SVGElement>(tag: string, attrs: Record<string, string | number> = {}, cls?: string) => {
  const n = document.createElementNS(NS, tag) as T;
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (cls) n.setAttribute('class', cls);
  return n;
};

interface WireNode {
  y: number;
  el: SVGGElement;
  on: boolean;
}
let nodes: WireNode[] = [];
let progressLine: SVGLineElement | null = null;
let total = 0;
let mainTop = 0;
let svg: SVGSVGElement | null = null;

function buildWire() {
  if (!main) return;
  svg?.remove();
  const wrap = main.querySelector<HTMLElement>('.wrap');
  const endEl = document.querySelector('[data-end-node]');
  const contact = document.querySelector('#contact');
  if (!wrap || !endEl || !contact) return;
  const mr = main.getBoundingClientRect();
  mainTop = mr.top + scrollY;
  const wr = wrap.getBoundingClientRect();
  const x = Math.max(10, wr.left + parseFloat(getComputedStyle(wrap).paddingLeft) * 0.5);

  const rel = (el: Element, f = 0.5) => {
    const r = el.getBoundingClientRect();
    return r.top + scrollY - mainTop + r.height * f;
  };
  const marks = [
    { el: document.querySelector('#proof-title'), f: 0.5 },
    { el: document.querySelector('#fix-title'), f: 0.5 },
    { el: document.querySelector('#about-title'), f: 0.5 },
    { el: document.querySelector('#contact-title'), f: 0.3 },
  ].filter((m): m is { el: Element; f: number } => !!m.el);
  const endY = rel(endEl, 0.5);
  const contactTop = rel(contact, 0);
  total = endY;

  svg = mk<SVGSVGElement>('svg', { width: mr.width, height: main.offsetHeight }, 'pagewire');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.append(
    mk('line', { x1: x, y1: 0, x2: x, y2: contactTop, class: 'pw-track' }),
    mk('line', { x1: x, y1: contactTop, x2: x, y2: endY, class: 'pw-track night' }),
  );
  progressLine = mk<SVGLineElement>('line', { x1: x, y1: 0, x2: x, y2: endY }, 'pw-line');
  progressLine.style.strokeDasharray = String(endY);
  svg.append(progressLine);

  nodes = [...marks.map((m) => rel(m.el, m.f)), endY].map((y, i, arr) => {
    const g = mk<SVGGElement>('g', {}, 'pw-node' + (y >= contactTop ? ' night' : '') + (i === arr.length - 1 ? ' end' : ''));
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.append(mk('circle', { r: 13 }, 'ring'), mk('circle', { r: 6 }, 'dot'));
    svg!.append(g);
    return { y, el: g, on: false };
  });
  main.prepend(svg);
  update();
}

let ticking = false;
function update() {
  ticking = false;
  if (frame && par && !reduced) {
    const r = frame.getBoundingClientRect();
    const p = clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1, 1);
    par.style.transform = `translateY(${(-p * 24).toFixed(1)}px) scale(1.1)`;
  }
  if (progressLine) {
    // The reading point sits at 55% of the screen, easing to the bottom edge near the end of the page
    // so the final node always lights.
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const f = 0.55 + 0.45 * clamp((scrollY - (maxScroll - innerHeight)) / innerHeight, 0, 1);
    const here = scrollY + innerHeight * f - mainTop;
    const p = clamp(here, 0, total);
    progressLine.style.strokeDashoffset = String(total - p);
    for (const n of nodes) {
      const on = here >= n.y;
      if (on !== n.on) {
        n.on = on;
        n.el.classList.toggle('on', on);
      }
    }
  }
}
const schedule = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
};
addEventListener('scroll', schedule, { passive: true });

if (main) {
  buildWire();
  void document.fonts?.ready.then(buildWire);
  let t = 0;
  new ResizeObserver(() => {
    clearTimeout(t);
    t = window.setTimeout(buildWire, 120);
  }).observe(main);
}
update();

export {};
