// Phones: the contact letter becomes a stepper, one question per screen.
// name (+ company) -> what you would like -> the short version -> email -> Send.
// A thin orange line at the top fills as you go and the light runs along it on each step.
// Typed values stay in the form, so going back never loses anything.

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const errBox = document.querySelector<HTMLElement>('[data-error]');
const mq = matchMedia('(max-width: 899px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (form && errBox) init(form, errBox);

function init(form: HTMLFormElement, errBox: HTMLElement) {
  const steps = Array.from(form.querySelectorAll<HTMLElement>(':scope > .line'));
  const actions = form.querySelector<HTMLElement>('.actions')!;
  const submit = actions.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const prefer = actions.querySelector<HTMLElement>('.prefer');
  const last = steps.length - 1;
  let i = 0;
  let on = false;

  const bar = document.createElement('div');
  bar.className = 'stepbar';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<i class="fill"></i><i class="glow"></i>';
  const fill = bar.querySelector<HTMLElement>('.fill')!;
  const glow = bar.querySelector<HTMLElement>('.glow')!;
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('aria-live', 'polite');
  const nav = document.createElement('div');
  nav.className = 'stepnav';
  nav.innerHTML = '<button type="button" class="btn next" data-magnetic-off>Next</button><button type="button" class="link back">Back</button>';
  const next = nav.querySelector<HTMLButtonElement>('.next')!;
  const back = nav.querySelector<HTMLButtonElement>('.back')!;

  const val = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
  const check = (n: number): string => {
    if (n === 0 && val('name').length < 1) return 'Please add your name.';
    if (n === 1 && !form.querySelector('input[name=choice]:checked')) return 'Please pick what you would like to do.';
    if (n === 2 && val('message').length < 5) return 'Please write a line or two about what you need.';
    if (n === 3 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) return 'Please enter a valid email so I can reply.';
    return '';
  };
  const firstField = (n: number) => {
    if (n === 1) return null; // choice: no keyboard
    return steps[n]?.querySelector<HTMLElement>('input:not([type=radio]), textarea') ?? null;
  };

  let prevEnd = 0;
  const show = (n: number, focus = true) => {
    i = n;
    steps.forEach((s, k) => (s.hidden = k !== n));
    submit.hidden = n !== last;
    next.hidden = n === last;
    back.hidden = n === 0;
    if (prefer) prefer.hidden = n !== last;
    errBox.textContent = '';
    status.textContent = `Step ${n + 1} of ${steps.length}`;
    const target = (n + 1) / steps.length;
    fill.style.transform = `scaleX(${target})`;
    // the light runs along the line from the old end to the new end
    const w = bar.clientWidth;
    if (!reduced && w) {
      glow.animate(
        [
          { transform: `translateX(${prevEnd * w - 28}px)`, opacity: 0 },
          { transform: `translateX(${prevEnd * w - 14}px)`, opacity: 1, offset: 0.2 },
          { transform: `translateX(${target * w - 14}px)`, opacity: 1, offset: 0.8 },
          { transform: `translateX(${target * w}px)`, opacity: 0 },
        ],
        { duration: 450, easing: 'ease-in-out' },
      );
    }
    prevEnd = target;
    if (focus) firstField(n)?.focus({ preventScroll: false });
  };

  const goNext = () => {
    const msg = check(i);
    if (msg) {
      errBox.textContent = msg;
      const f = firstField(i) ?? steps[i]?.querySelector<HTMLElement>('input');
      f?.setAttribute('aria-invalid', 'true');
      f?.focus();
      return;
    }
    show(Math.min(last, i + 1));
  };
  next.addEventListener('click', goNext);
  back.addEventListener('click', () => show(Math.max(0, i - 1)));
  form.addEventListener('change', (e) => {
    if (on && i === 1 && (e.target as HTMLInputElement).name === 'choice') setTimeout(goNext, 260); // big pills advance on tap
  });
  form.addEventListener('keydown', (e) => {
    if (on && e.key === 'Enter' && i < last && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      goNext();
    }
  });

  const enable = () => {
    if (on) return;
    on = true;
    form.classList.add('stepper');
    form.prepend(bar, status);
    actions.before(nav);
    prevEnd = 0;
    show(0, false);
  };
  const disable = () => {
    if (!on) return;
    on = false;
    form.classList.remove('stepper');
    bar.remove();
    status.remove();
    nav.remove();
    steps.forEach((s) => (s.hidden = false));
    submit.hidden = false;
    if (prefer) prefer.hidden = false;
  };
  const sync = () => (mq.matches ? enable() : disable());
  mq.addEventListener('change', sync);
  sync();

  // If the server rejects a field, jump to the step that holds it
  form.addEventListener('invalid-field', ((e: CustomEvent<string>) => {
    const idx = { name: 0, company: 0, choice: 1, message: 2, email: 3 }[e.detail] ?? last;
    if (on) show(idx);
  }) as EventListener);
}

export {};
