/* ============================================================
   MAIN.JS — Rydny Ihims Portfolio
============================================================ */

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   NAV — scroll solidify + active link
============================================================ */
(function initNav() {
  const navbar   = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActiveLink();
  }, { passive: true });

  function highlightActiveLink() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
})();

/* ============================================================
   HAMBURGER / MOBILE NAV
============================================================ */
(function initMobileNav() {
  const btn       = $('#hamburger');
  const overlay   = $('#mobileNav');
  const mobileLinks = $$('.mobile-nav__link, .mobile-nav__cta');

  function open() {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () =>
    overlay.classList.contains('open') ? close() : open()
  );

  mobileLinks.forEach(link => link.addEventListener('click', close));
})();

/* ============================================================
   HERO — DOT GRID CANVAS
============================================================ */
(function initCanvas() {
  const canvas = $('#dotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DOT_SPACING = 36;
  const DOT_RADIUS  = 1;
  const DOT_OPACITY = 0.18;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(139, 170, 173, ${DOT_OPACITY})`;
    for (let x = DOT_SPACING / 2; x < canvas.width; x += DOT_SPACING) {
      for (let y = DOT_SPACING / 2; y < canvas.height; y += DOT_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
})();

/* ============================================================
   HERO — TYPEWRITER EFFECT
============================================================ */
(function initTypewriter() {
  const el = $('#typedText');
  if (!el) return;

  const phrases = [
    'Full-Stack Web Apps',
    'Clean User Experiences',
    'Scalable Backend Systems',
    'Things That Actually Work',
  ];

  let phraseIdx  = 0;
  let charIdx    = 0;
  let isDeleting = false;
  const SPEED_TYPE   = 70;
  const SPEED_DELETE = 38;
  const PAUSE_END    = 1800;
  const PAUSE_START  = 300;

  function tick() {
    const phrase   = phrases[phraseIdx];
    const displayed = isDeleting
      ? phrase.slice(0, charIdx - 1)
      : phrase.slice(0, charIdx + 1);

    el.textContent = displayed;
    isDeleting ? charIdx-- : charIdx++;

    let delay = isDeleting ? SPEED_DELETE : SPEED_TYPE;

    if (!isDeleting && charIdx === phrase.length) {
      delay = PAUSE_END;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      delay = PAUSE_START;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 800);
})();

/* ============================================================
   SCROLL REVEAL — Intersection Observer
============================================================ */
(function initReveal() {
  const elements = $$('.reveal, .reveal-stagger');

  /* Assign stagger delays to groups of .reveal-stagger siblings */
  const groups = new Map();
  $$('.reveal-stagger').forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(children => {
    children.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   SCROLL TO TOP
============================================================ */
(function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 300;
    btn.hidden = !show;
  }, { passive: true });

  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

/* ============================================================
   CONTACT FORM — Formspree + client-side validation
============================================================ */
(function initContactForm() {
  const form       = $('#contactForm');
  const successEl  = $('#formSuccess');
  const errorEl    = $('#formError');
  if (!form) return;

  const ENDPOINT = 'https://formspree.io/f/xrerllze';

  function fieldOf(id) { return document.getElementById(id); }

  function showFieldError(field, msg) {
    const errSpan = field.parentElement.querySelector('.form-field-error');
    if (errSpan) errSpan.textContent = msg;
    field.classList.add('form-input--error');
  }

  function clearFieldError(field) {
    const errSpan = field.parentElement.querySelector('.form-field-error');
    if (errSpan) errSpan.textContent = '';
    field.classList.remove('form-input--error');
  }

  function validate() {
    const name    = fieldOf('formName');
    const email   = fieldOf('formEmail');
    const message = fieldOf('formMessage');
    let valid = true;

    /* Name: required, letters/spaces/hyphens, 3–50 chars */
    const nameVal = name.value.trim();
    if (!nameVal) {
      showFieldError(name, 'This field is required'); valid = false;
    } else if (nameVal.length < 3 || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]{3,50}$/.test(nameVal)) {
      showFieldError(name, nameVal.length < 3 ? 'Please enter a valid name' : nameVal.length > 50 ? 'Name is too long' : 'Please enter a valid name'); valid = false;
    } else {
      clearFieldError(name);
    }

    /* Email: required, valid format */
    const emailVal = email.value.trim();
    if (!emailVal) {
      showFieldError(email, 'This field is required'); valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showFieldError(email, 'Please enter a valid email address'); valid = false;
    } else {
      clearFieldError(email);
    }

    /* Message: required, 20–500 chars */
    const msgVal = message.value.trim();
    if (!msgVal) {
      showFieldError(message, 'This field is required'); valid = false;
    } else if (msgVal.length < 20) {
      showFieldError(message, 'Message too short — tell me a little more'); valid = false;
    } else if (msgVal.length > 500) {
      showFieldError(message, 'Message too long'); valid = false;
    } else {
      clearFieldError(message);
    }

    return valid;
  }

  /* Clear inline errors on input */
  ['formName', 'formEmail', 'formMessage'].forEach(id => {
    const el = fieldOf(id);
    if (el) el.addEventListener('input', () => clearFieldError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        successEl.hidden = false;
        errorEl.hidden   = true;
        form.reset();
        setTimeout(() => { successEl.hidden = true; }, 6000);
      } else {
        throw new Error('non-ok');
      }
    } catch {
      errorEl.hidden   = false;
      successEl.hidden = true;
      setTimeout(() => { errorEl.hidden = true; }, 8000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    }
  });
})();

/* ============================================================
   FOOTER — current year
============================================================ */
(function setYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ============================================================
   SMOOTH SCROLL — anchor links
============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();
