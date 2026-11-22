// Scrub-to-scroll pieces that are not reveals: parallax (portrait, project media) and the page wire with its droplet.
// Reveals, flows and the shared scroll scheduler live in motion.ts and flows.ts.
import { onFrame, reduced, clamp, schedule } from './motion';

// ---------- parallax ----------
const portrait = document.querySelector<HTMLElement>('[data-parallax] img');
const portraitFrame = portrait?.closest<HTMLElement>('[data-parallax]') ?? null;
const panes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax-in]'));

function parallax(vh: number) {
  if (reduced) return;
  if (portraitFrame && portrait) {
    const r = portraitFrame.getBoundingClientRect();
    const p = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
    portrait.style.transform = `translateY(${(-p * 24).toFixed(1)}px) scale(1.1)`;
  }
  for (const pane of panes) {
    const r = pane.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100) continue;
    const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
    pane.style.setProperty('--py', `${(-p * 30).toFixed(1)}px`);
  }
}

// ---------- drifting titles: each section title slides sideways as it crosses the screen, in alternating directions ----------
const drifts = Array.from(document.querySelectorAll<HTMLElement>('[data-drift]'));
function drift(vh: number) {
  if (reduced) return;
  const amount = innerWidth * (innerWidth < 900 ? 0.03 : 0.04);
  for (const el of drifts) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -80 || r.top > vh + 80) continue;
    const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
    el.style.transform = `translateX(${(Number(el.dataset.drift) * p * amount).toFixed(1)}px)`;
  }
}

// ---------- page wire ----------
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
  ring: SVGElement;
  on: boolean;
  merged: boolean;
}
let nodes: WireNode[] = [];
let progressLine: SVGLineElement | null = null;
let drop: SVGGElement | null = null;
let total = 0;
let mainTop = 0;
let svg: SVGSVGElement | null = null;
let wireX = 10;

// The droplet trails the tip of the line with a slight spring lag (settles in about 100ms)
let dropY = 0;
let dropTarget = 0;
let dropRunning = false;
function dropLoop() {
  dropY += (dropTarget - dropY) * 0.16;
  if (Math.abs(dropTarget - dropY) < 0.3) dropY = dropTarget;
  paintDrop();
  if (dropY !== dropTarget) requestAnimationFrame(dropLoop);
  else dropRunning = false;
}
function paintDrop() {
  if (!drop) return;
  // shrink into a node as it arrives, re-form below it
  let nearest = Infinity;
  for (const n of nodes) nearest = Math.min(nearest, Math.abs(dropY - n.y));
  const s = clamp((nearest - 4) / 18, 0, 1);
  const atEnd = nodes.length > 0 && dropY >= nodes[nodes.length - 1]!.y - 1;
  const visible = dropY > 2 && !atEnd;
  drop.style.opacity = visible ? '1' : '0';
  drop.setAttribute('transform', `translate(${wireX} ${dropY.toFixed(1)}) scale(${s.toFixed(2)})`);
  for (const n of nodes) {
    const merging = Math.abs(dropY - n.y) < 6 && n.on;
    if (merging && !n.merged) {
      n.merged = true;
      n.ring.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)', opacity: 0.35 }, { transform: 'scale(1)' }], { duration: 450, easing: 'ease-out' });
    } else if (!merging && Math.abs(dropY - n.y) > 22) n.merged = false;
  }
}

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
  wireX = Math.max(10, wr.left + parseFloat(getComputedStyle(wrap).paddingLeft) * 0.5);

  const rel = (el: Element, f = 0.5) => {
    const r = el.getBoundingClientRect();
    return r.top + scrollY - mainTop + r.height * f;
  };
  const wide = innerWidth >= 900; // on phones the projects sit side by side in a carousel, so no per-project checkpoints
  const marks = [
    { el: document.querySelector('#proof-title'), f: 0.5 },
    ...(wide ? ['#p-plateshare', '#p-apex', '#p-altays'].map((id) => ({ el: document.querySelector(id), f: 0.5 })) : []),
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
    mk('line', { x1: wireX, y1: 0, x2: wireX, y2: contactTop, class: 'pw-track' }),
    mk('line', { x1: wireX, y1: contactTop, x2: wireX, y2: endY, class: 'pw-track night' }),
  );
  progressLine = mk<SVGLineElement>('line', { x1: wireX, y1: 0, x2: wireX, y2: endY }, 'pw-line');
  progressLine.style.strokeDasharray = String(endY);
  svg.append(progressLine);

  nodes = [...marks.map((m) => rel(m.el, m.f)), endY].map((y, i, arr) => {
    const g = mk<SVGGElement>('g', {}, 'pw-node' + (y >= contactTop ? ' night' : '') + (i === arr.length - 1 ? ' end' : ''));
    g.setAttribute('transform', `translate(${wireX} ${y})`);
    const ring = mk<SVGCircleElement>('circle', { r: 13 }, 'ring');
    g.append(ring, mk('circle', { r: 6 }, 'dot'));
    svg!.append(g);
    return { y, el: g, ring, on: false, merged: false };
  });

  // Teardrop, tip pointing down, 10px wide and 14px tall; the tip sits on the end of the drawn line
  drop = mk<SVGGElement>('g', {}, 'pw-drop');
  // A raindrop: pointed at the top, round bulb at the bottom, the bulb resting on the tip of the line
  const shape = mk<SVGPathElement>('path', { d: 'M0 -15 C -1.2 -11 -5 -8.5 -5 -5 A5 5 0 0 0 5 -5 C 5 -8.5 1.2 -11 0 -15 Z' });
  const halo = mk<SVGCircleElement>('circle', { cx: 0, cy: -5, r: 9 });
  halo.setAttribute('class', 'halo');
  drop.append(halo, shape);
  svg.append(drop);
  main.prepend(svg);
  update(scrollY, innerHeight);
}

function update(sy: number, vh: number) {
  parallax(vh);
  drift(vh);
  if (!progressLine) return;
  // The reading point sits at 55% of the screen, easing to the bottom edge near the end of the page
  // so the final node always lights.
  const maxScroll = document.documentElement.scrollHeight - vh;
  const f = 0.55 + 0.45 * clamp((sy - (maxScroll - vh)) / vh, 0, 1);
  const here = sy + vh * f - mainTop;
  const p = clamp(here, 0, total);
  progressLine.style.strokeDashoffset = String(total - p);
  dropTarget = p;
  if (!dropRunning) {
    dropRunning = true;
    requestAnimationFrame(dropLoop);
  }
  for (const n of nodes) {
    n.el.classList.toggle('hide', n.y + mainTop - sy < 96);
    const on = here >= n.y;
    if (on !== n.on) {
      n.on = on;
      n.el.classList.toggle('on', on);
    }
  }
}

if (main) {
  buildWire();
  void document.fonts?.ready.then(buildWire);
  let t = 0;
  new ResizeObserver(() => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      buildWire();
      schedule();
    }, 120);
  }).observe(main);
}
onFrame(update);

export {};
