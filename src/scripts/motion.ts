// One motion system for the whole page.
//  - onFrame(fn): a single rAF-throttled scroll/resize scheduler for everything scrubbed to scroll.
//  - One IntersectionObserver drives every reveal. Reveals replay each time an element enters, in both scroll
//    directions. Leaving resets quietly while the element is off screen. Nothing is hidden before its first
//    entry, so a full-page screenshot or a failed script never shows a blank page.
//  - Fast scrolling jumps straight to the final state. Reduced motion: final states only (nothing runs).

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const K = matchMedia('(max-width: 899px)').matches ? 0.7 : 1; // phones: shorter, 0.3 to 0.5s motion

// ---------- single scroll scheduler ----------
type FrameFn = (scrollY: number, vh: number, velocity: number) => void;
const frameFns = new Set<FrameFn>();
let ticking = false;
let lastY = scrollY;
let lastT = performance.now();
let velocity = 0; // px per ms, absolute

function run() {
  ticking = false;
  const now = performance.now();
  const dt = Math.max(1, now - lastT);
  velocity = Math.abs(scrollY - lastY) / dt;
  lastY = scrollY;
  lastT = now;
  frameFns.forEach((fn) => fn(scrollY, innerHeight, velocity));
}
export function schedule() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(run);
  }
}
export function onFrame(fn: FrameFn) {
  frameFns.add(fn);
  schedule();
}
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule);

export const isFast = () => velocity > 2.2; // about 2200 px per second

// ---------- reveals ----------
type Kind = 'fade' | 'wipe' | 'title' | 'letters';
interface Item {
  el: HTMLElement;
  kind: Kind;
  delay: number;
  shown: boolean; // has played at least once and is currently in its final state
  armed: boolean; // currently hidden, waiting for the next entry
  parts?: HTMLElement[];
  stop?: HTMLElement | null;
}
const items = new Map<Element, Item>();

const hiddenStyle: Record<'fade' | 'wipe', Record<string, string>> = {
  fade: { opacity: '0', transform: 'translateY(24px)' },
  wipe: { clipPath: 'inset(100% 0 0 0)' },
};

function splitTitle(h: HTMLElement) {
  if (h.dataset.split) return;
  h.dataset.split = '1';
  const stop = h.querySelector<HTMLElement>('.fs');
  const nodes = Array.from(h.childNodes).filter((n) => n !== stop);
  nodes.forEach((n) => n.remove());
  const frag = document.createDocumentFragment();
  nodes.forEach((n) => {
    if (n.nodeType === 1 && (n as Element).tagName === 'BR') {
      frag.append(document.createElement('br'));
      return;
    }
    const words = (n.textContent ?? '').trim().split(/\s+/).filter(Boolean);
    words.forEach((word, i) => {
      const w = document.createElement('span');
      w.className = 'tw';
      const wi = document.createElement('span');
      wi.className = 'twi';
      wi.textContent = word;
      w.append(wi);
      frag.append(w);
      if (i < words.length - 1) frag.append(document.createTextNode(' '));
    });
  });
  h.prepend(frag);
}

function hide(it: Item) {
  const { el, kind } = it;
  it.armed = true;
  it.shown = false;
  if (kind === 'fade' || kind === 'wipe') Object.assign(el.style, hiddenStyle[kind]);
  else if (kind === 'title') {
    it.parts?.forEach((p) => (p.style.transform = 'translateY(115%)'));
    if (it.stop) {
      it.stop.style.transform = 'scale(0)';
      it.stop.style.display = 'inline-block';
    }
  } else if (kind === 'letters') it.parts?.forEach((p) => (p.style.transform = 'translateY(105%)'));
}

function clear(it: Item) {
  const { el, kind } = it;
  if (kind === 'fade') {
    el.style.removeProperty('opacity');
    el.style.removeProperty('transform');
  } else if (kind === 'wipe') el.style.removeProperty('clip-path');
  else {
    it.parts?.forEach((p) => p.style.removeProperty('transform'));
    it.stop?.style.removeProperty('transform');
  }
}

function play(it: Item) {
  const { kind, el, delay } = it;
  it.armed = false;
  it.shown = true;
  const instant = isFast();
  clear(it);
  if (instant) return;
  const opts = (d: number, dl = 0): KeyframeAnimationOptions => ({ duration: d * K, delay: dl * K, easing: EASE, fill: 'backwards' });
  if (kind === 'fade') el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], opts(650, delay));
  else if (kind === 'wipe') el.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], opts(800, delay));
  else if (kind === 'title') {
    it.parts?.forEach((p, i) => p.animate([{ transform: 'translateY(115%)' }, { transform: 'none' }], opts(600, delay + i * 70)));
    const n = it.parts?.length ?? 0;
    it.stop?.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 300 * K, delay: (delay + n * 70 + 240) * K, easing: EASE, fill: 'backwards' });
  } else if (kind === 'letters') it.parts?.forEach((p, i) => p.animate([{ transform: 'translateY(105%)' }, { transform: 'none' }], opts(700, delay + i * 40)));
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const it = items.get(e.target);
      if (!it) continue;
      if (e.intersectionRatio >= 0.12 || (e.isIntersecting && e.intersectionRatio > 0 && e.boundingClientRect.height > innerHeight * 3)) {
        if (!it.shown) play(it);
      } else if (e.intersectionRatio === 0 && it.shown) {
        hide(it); // off screen: reset quietly so it can play again
      }
    }
  },
  { threshold: [0, 0.12] },
);

export function reveal(el: HTMLElement, kind: Kind, delay = 0) {
  // A clipped element reports zero visible area to the observer, so a wipe is observed through its parent.
  const target = kind === 'wipe' ? (el.parentElement ?? el) : el;
  if (reduced || items.has(target)) return;
  const it: Item = { el, kind, delay, shown: false, armed: false };
  if (kind === 'title') {
    splitTitle(el);
    it.parts = Array.from(el.querySelectorAll<HTMLElement>('.twi'));
    it.stop = el.querySelector<HTMLElement>('.fs');
  }
  if (kind === 'letters') it.parts = Array.from(el.querySelectorAll<HTMLElement>('.ch'));
  items.set(target, it);
  io.observe(target);
}

export function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => reveal(el, 'fade', Number(el.dataset.delay ?? 0)));
  document.querySelectorAll<HTMLElement>('[data-wipe]').forEach((el) => reveal(el, 'wipe', Number(el.dataset.delay ?? 0)));
  document.querySelectorAll<HTMLElement>('[data-title]').forEach((el) => reveal(el, 'title'));
  document.querySelectorAll<HTMLElement>('[data-letters]').forEach((el) => reveal(el, 'letters'));
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
