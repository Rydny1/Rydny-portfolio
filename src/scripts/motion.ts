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
// Each kind is a different spatial move, so the page does not feel like one fade repeated:
//   fade   content settles in from below with a slight turn
//   wipe   images open upward out of a tilted plane, while the picture inside settles from a zoom (depth)
//   iris   a circle opens from the centre (the portrait)
//   wipex  rows slide open from the left edge
//   title  headline words rise from behind a mask with a turn, the orange full stop pops last
//   words  paragraphs rise word by word from behind a mask
//   letters  the footer name rises letter by letter
type Kind = 'fade' | 'wipe' | 'iris' | 'wipex' | 'title' | 'words' | 'letters';
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

const HIDDEN: Partial<Record<Kind, Record<string, string>>> = {
  fade: { opacity: '0', transform: 'translateY(44px) rotate(1.4deg)' },
  wipe: { clipPath: 'inset(100% 0 0 0)', transform: 'perspective(1400px) rotateX(8deg) translateY(44px) scale(0.97)' },
  iris: { clipPath: 'circle(0% at 50% 62%)' },
  wipex: { opacity: '0', transform: 'translateX(-28px)' },
};
const PART_HIDDEN: Partial<Record<Kind, string>> = {
  title: 'translateY(118%) rotate(5deg)',
  words: 'translateY(112%) rotate(2.5deg)',
  letters: 'translateY(105%) rotate(7deg)',
};

function split(h: HTMLElement) {
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
  const box = HIDDEN[kind];
  if (box) Object.assign(el.style, box);
  const part = PART_HIDDEN[kind];
  if (part) it.parts?.forEach((p) => (p.style.transform = part));
  if (it.stop) {
    it.stop.style.transform = 'scale(0)';
    it.stop.style.display = 'inline-block';
  }
}

function clear(it: Item) {
  const { el } = it;
  el.style.removeProperty('opacity');
  el.style.removeProperty('transform');
  el.style.removeProperty('clip-path');
  it.parts?.forEach((p) => p.style.removeProperty('transform'));
  it.stop?.style.removeProperty('transform');
}

// The moves of each kind, as a list of animations. The same list is played forward on entry and reversed on exit,
// so whatever comes in one way goes out the same way.
interface Spec {
  target: HTMLElement;
  frames: Keyframe[];
  dur: number;
  delay: number;
}
function specsFor(it: Item): Spec[] {
  const { kind, el, delay } = it;
  const inner = el.querySelector<HTMLElement>('img, video');
  const specs: Spec[] = [];
  if (kind === 'fade') {
    specs.push({ target: el, frames: [{ opacity: 0, transform: 'translateY(44px) rotate(1.4deg)' }, { opacity: 1, transform: 'none' }], dur: 950, delay });
  } else if (kind === 'wipe') {
    specs.push({
      target: el,
      frames: [
        { clipPath: 'inset(100% 0 0 0)', transform: 'perspective(1400px) rotateX(8deg) translateY(44px) scale(0.97)' },
        { clipPath: 'inset(0 0 0 0)', transform: 'none' },
      ],
      dur: 1250,
      delay,
    });
    if (inner) specs.push({ target: inner, frames: [{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], dur: 1600, delay });
  } else if (kind === 'iris') {
    specs.push({ target: el, frames: [{ clipPath: 'circle(0% at 50% 62%)' }, { clipPath: 'circle(82% at 50% 50%)' }], dur: 1300, delay });
    if (inner) specs.push({ target: inner, frames: [{ transform: 'scale(1.22)' }, { transform: 'scale(1)' }], dur: 1700, delay });
  } else if (kind === 'wipex') {
    // The observed row is only moved and faded; the clip goes on its inner child. (A clipped element reports zero
    // visible area to the observer, which would read as "scrolled away" and hide the row again.)
    specs.push({ target: el, frames: [{ opacity: 0, transform: 'translateX(-28px)' }, { opacity: 1, transform: 'none' }], dur: 1000, delay });
    const child = el.firstElementChild as HTMLElement | null;
    if (child) specs.push({ target: child, frames: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], dur: 1000, delay });
  } else if (kind === 'title') {
    it.parts?.forEach((p, i) => specs.push({ target: p, frames: [{ transform: PART_HIDDEN.title! }, { transform: 'none' }], dur: 900, delay: delay + i * 95 }));
    const n = it.parts?.length ?? 0;
    if (it.stop) specs.push({ target: it.stop, frames: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], dur: 380, delay: delay + n * 95 + 260 });
  } else if (kind === 'words') {
    const n = it.parts?.length ?? 1;
    const step = Math.min(34, 780 / n); // long paragraphs stay under about 0.8s of stagger
    it.parts?.forEach((p, i) => specs.push({ target: p, frames: [{ transform: PART_HIDDEN.words! }, { transform: 'none' }], dur: 800, delay: delay + i * step }));
  } else if (kind === 'letters') {
    it.parts?.forEach((p, i) => specs.push({ target: p, frames: [{ transform: PART_HIDDEN.letters! }, { transform: 'none' }], dur: 950, delay: delay + i * 55 }));
  }
  return specs;
}

const running = new Map<Item, Animation[]>();
const stopAnims = (it: Item) => {
  running.get(it)?.forEach((a) => a.cancel());
  running.delete(it);
};

function play(it: Item) {
  stopAnims(it);
  it.armed = false;
  it.shown = true;
  clear(it);
  if (isFast()) return;
  const anims = specsFor(it).map((s) => s.target.animate(s.frames, { duration: s.dur * K, delay: s.delay * K, easing: EASE, fill: 'backwards' }));
  running.set(it, anims);
}

// Exit: the same moves in reverse, a touch quicker, then the element rests in its hidden state ready for the next entry.
function exit(it: Item) {
  stopAnims(it);
  it.shown = false;
  if (isFast()) {
    hide(it);
    return;
  }
  const specs = specsFor(it);
  if (!specs.length) {
    hide(it);
    return;
  }
  const anims = specs.map((s, i) =>
    s.target.animate([...s.frames].reverse(), { duration: s.dur * 0.62 * K, delay: Math.min(i * 22, 240) * K, easing: 'cubic-bezier(0.55, 0, 0.9, 0.4)', fill: 'forwards' }),
  );
  running.set(it, anims);
  void Promise.all(anims.map((a) => a.finished.catch(() => null))).then(() => {
    if (running.get(it) === anims) {
      anims.forEach((a) => a.cancel());
      running.delete(it);
      hide(it);
    }
  });
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const it = items.get(e.target);
      if (!it) continue;
      const tall = e.boundingClientRect.height > innerHeight * 3;
      if (e.intersectionRatio >= 0.18 || (e.isIntersecting && e.intersectionRatio > 0 && tall)) {
        if (!it.shown) play(it);
      } else if (e.intersectionRatio < 0.08 && it.shown && !tall) {
        exit(it); // leaving the screen: play the entrance backwards
      }
    }
  },
  { threshold: [0, 0.08, 0.18], rootMargin: '0px 0px -8% 0px' },
);

export function reveal(el: HTMLElement, kind: Kind, delay = 0) {
  // A clipped element reports zero visible area to the observer, so wipes and irises are observed through their parent.
  const target = kind === 'wipe' || kind === 'iris' ? (el.parentElement ?? el) : el;
  if (reduced || items.has(target)) return;
  const it: Item = { el, kind, delay, shown: false, armed: false };
  if (kind === 'title' || kind === 'words') {
    split(el);
    it.parts = Array.from(el.querySelectorAll<HTMLElement>('.twi'));
    it.stop = el.querySelector<HTMLElement>('.fs');
  }
  if (kind === 'letters') it.parts = Array.from(el.querySelectorAll<HTMLElement>('.ch'));
  items.set(target, it);
  io.observe(target);
}

export function initReveals() {
  const all = (sel: string, kind: Kind, delayed = true) =>
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => reveal(el, kind, delayed ? Number(el.dataset.delay ?? 0) : 0));
  all('[data-reveal]', 'fade');
  all('[data-wipe]', 'wipe');
  all('[data-iris]', 'iris');
  all('[data-wipex]', 'wipex');
  all('[data-title]', 'title', false);
  all('[data-words]', 'words');
  all('[data-letters]', 'letters', false);
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
