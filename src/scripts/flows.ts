// Project flows, scrubbed to scroll and fully reversible.
// t runs 0 to 1 as the flow moves from the lower part of the screen to the upper part:
//   step 1 active from t > 0, light runs line 1 (0.12 to 0.45), step 2 active from 0.48 (step 1 done),
//   light runs line 2 (0.55 to 0.88), step 3 active from 0.9 (step 2 done).
import { onFrame, clamp } from './motion';

interface Flow {
  el: HTMLElement;
  steps: HTMLElement[];
  lines: HTMLElement[];
  lights: HTMLElement[];
  widths: number[];
  state: string;
  pos: number[];
}

const flows: Flow[] = Array.from(document.querySelectorAll<HTMLElement>('[data-flow]')).map((el) => {
  const lines = Array.from(el.querySelectorAll<HTMLElement>('.line'));
  return {
    el,
    steps: Array.from(el.querySelectorAll<HTMLElement>('.step')),
    lines,
    lights: lines.map((l) => l.querySelector<HTMLElement>('.light')!),
    widths: lines.map((l) => l.offsetWidth),
    state: '',
    pos: lines.map(() => -1),
  };
});

const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

function apply(f: Flow, t: number) {
  const s1 = t > 0 ? (t >= 0.48 ? 'done' : 'active') : 'idle';
  const s2 = t >= 0.48 ? (t >= 0.9 ? 'done' : 'active') : 'idle';
  const s3 = t >= 0.9 ? 'active' : 'idle';
  const key = s1 + s2 + s3;
  if (key !== f.state) {
    f.state = key;
    [s1, s2, s3].forEach((v, i) => f.steps[i]?.setAttribute('data-state', v));
  }
  [seg(t, 0.12, 0.45), seg(t, 0.55, 0.88)].forEach((p, i) => {
    const light = f.lights[i];
    if (!light) return;
    const rounded = Math.round(p * 200) / 200;
    if (rounded === f.pos[i]) return;
    f.pos[i] = rounded;
    const w = f.widths[i] ?? 24;
    light.style.opacity = p > 0 && p < 1 ? String(Math.min(1, p / 0.08, (1 - p) / 0.08)) : '0';
    light.style.transform = `translateX(${(p * (w + 28) - 28).toFixed(1)}px)`;
  });
}

if (flows.length) {
  addEventListener('resize', () => flows.forEach((f) => (f.widths = f.lines.map((l) => l.offsetWidth))));
  onFrame((_sy, vh) => {
    for (const f of flows) {
      const top = f.el.getBoundingClientRect().top;
      apply(f, clamp((vh * 0.88 - top) / (vh * 0.88 - vh * 0.32), 0, 1));
    }
  });
}

export {};
