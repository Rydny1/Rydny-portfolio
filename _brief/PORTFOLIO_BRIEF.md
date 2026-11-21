# Portfolio rebuild brief v2 (for Claude Code)

Owner: Rydny Ihims, Riga. Builds software and automations.
Live today: https://rydny1.github.io/Rydny-portfolio/
Repo: github.com/Rydny1/Rydny-portfolio

Read this whole file before touching code. Then work gate by gate (section 15). Ask Rydny before anything that costs money, changes hosting, or adds a service.

Reference files shipped with this brief (folder `_brief/`):
- `mockup/hero.png` (approved hero), `mockup/proof-section.png` (work section sketch), `mockup/index.html` (rough static sketch, fonts not bundled). Match the feel, beat the quality.
- `assets/wall-light.webm` (1.2 MB), `assets/wall-light.mp4` (2.6 MB, re-encode under 2 MB), `assets/wall-light-poster.jpg`: hero footage. Source: Pexels video 35666006 (free licence).
- `assets/portfolio-picture.png`: Rydny's portrait, 1254x1254.

---

## 1. Who this site is for

Anyone who wants to know who Rydny is. That includes founders, hiring managers, clients and other engineers. Treat every one of them as a professional who reads fast and spots fluff instantly.

The site must prove one thing in 10 seconds: **this person finds real problems and ships working fixes.**

Tone: professional, direct, confident, no bluffing. Every claim on the page must be true and checkable.

## 2. The concept: "The room"

The site is one quiet room in daylight. Real light moves across a real plaster wall. Leaf shadows drift. Giant type sits on that wall. The work comes after, on paper.

**The signature moment (hero):** "Find the problem." top left. "Build the fix." lower right, in italic. The full stop after "problem." is the trigger of a live workflow. See `mockup/hero.png`.

The wire is one smooth, flowing curve through the big open space under "Find the problem." (see `mockup/hero.png`):
- Shape: it drops from the full stop, sweeps left across the open wall, loops down, then glides right into "Build the fix." Built from smooth cubic curves only. No corners, no straight runs, no dashes.
- Line: solid 2.2px orange, round caps, over a soft ink shadow track (8px, 10% opacity).
- Four step pills sit on the curve: MAP, DESIGN, AUTOMATE (active, orange fill), TEST. Paper fill, ink hairline border, 11px monospace caps, a small status dot.
- **Three lights travel the line on a loop**, 1.4s apart, 4.2s per trip, ease in and out. Each light is a soft glowing head (warm white core, orange glow) with a short fading tail of 4 dots behind it. When a light passes a pill, the pill's dot flashes.
- Start node: orange dot on the full stop with a soft ring. End node: orange dot just before "Build".
- Build the lights with GSAP MotionPath (or SVG animateMotion), never by animating layout.

Load sequence (1.6s total, once per session):
1. "Find the problem" rises in, line by line.
2. The full stop pops in orange with a soft ring (the trigger fires).
3. The wire draws from the full stop. Each pill switches on as the line reaches it (dot turns orange, tiny scale 0.96 to 1).
4. The line reaches its end. "Build the fix." rises in.
5. Lead text, buttons and facts fade up. The three lights start looping.

On scroll the hero wire fades and the same orange line continues as the page wire through every section.

In production, build the route from the real text positions (getBoundingClientRect on the full stop and on the "B" of "Build") and rebuild on resize. Never hard-code coordinates. Below 900px wide, the curve becomes a tall S between the two lines, with two pills (MAP, AUTOMATE) and two lights.

No portrait in the hero. Every award-level personal portfolio studied leads with type plus one signature element. The face goes in About.

Why it works:
- **Alive.** The shadows never stop moving. Slow, calm, real footage. No gradients, no blobs, no 3D.
- **Premium.** Warm plaster, ink type, one orange accent. The same language as Aesop and good architecture studios.
- **Readable.** The wall is light and low-contrast, so ink text sits on it at 12:1 or better. Sky footage could not do this: bright clouds behind text change contrast every frame.
- **On-message.** A calm room says "thinks before building". That is Rydny's whole pitch.

On top of the room runs **one thin orange wire**: a workflow line. It starts under the hero call to action and runs down the page. Each section is a node. The node lights up when you arrive. Inside each project, a mini flow (3 steps on the same orange line) shows how the fix works. The wire is the "automation" story. It also guides the eye to the next thing to read.

Delete the 3D prism and every WebGL / Three.js file. Nothing 3D anywhere.

## 3. Where the direction comes from

- **The 6 reference reels Rydny sent:**
  - Design rule "hierarchy": 1 big, 1 or 2 medium, the rest small.
  - Design rule "isolation effect": the one thing that looks different is the thing people remember.
  - Two "one accent color" reels: a single strong color directs attention.
  - The "boring vs styled" reel: oversized editorial type over real imagery.
  - The SEO checklist reel: titles, meta, OG image, canonical, sitemap, 404, alt text, no console logs, no source maps, small bundles, mobile layout.
- **Aesop.com:** real close-up footage, warm darks, quiet type, generous space. Proof that "alive" can be calm.
- **Awwwards portfolio winners, screenshotted 21 Nov 2026:**
  - johnbolster.design: giant name, one thin line curving through it. Our wire idea, made the hero.
  - dennypratama.com: "I design it. / I build it." split across the screen. Same two-beat structure as ours.
  - lucaslima.design: statement-first hero, small expertise table, warm off-white.
  - twandeniet.com and paulfey.me: the site is a room you enter. That is the "place" feeling.
  - Common to almost all: tiny meta text in the corners (role, city, local time), no photo in the hero, one accent at most.
- **Awwwards scoring:** Site of the Day entries are scored Design 40%, Usability 30%, Creativity 20%, Content 10%. A recent portfolio Site of the Day scored 7.49 / 10. Use this rubric for self-review (section 14).

## 4. Design rules (hard)

1. **Hierarchy per section:** 1 big, 1 or 2 medium, the rest small. If two things fight, shrink one.
2. **Orange is a system with one exception.** Allowed orange: the wire, active nodes, mini-flow lines, and **one** solid orange element per viewport (usually the main button). Everything else is ink, paper or mist. Badges are ink with paper text.
3. **Real backgrounds only.** The hero uses the wall footage. Other sections sit on paper (#EEE9E3) with real images: project screenshots and the portrait.
4. **Type is the design.** Big Fraunces headlines. No icons as decoration. No emoji. No skill bars. No three-card grids. No glassmorphism. No purple.
5. **Nothing is centered by default.** Left-aligned editorial layout on a 12-column grid.
6. **Every image has a job.** If it does not prove something, cut it.

### Color
| Token | Hex | Use |
|---|---|---|
| ink | #1F2023 | text, badges |
| paper | #EEE9E3 | sections |
| signal | #FF5A1F | the orange system above |
| mist | #6E6A63 | labels, captions |

Contrast (checked): ink on paper 13:1. Ink on orange 5.2:1 (buttons: ink text on orange fill). **Orange text on paper is banned** (2.6:1).

### Type
- Fraunces (variable) for headlines. Plus Jakarta Sans for body. Self-host both as woff2, latin subset, `font-display: swap`, preload the two used in the hero.
- Hero H1: clamp(52px, 6.8vw, 104px), line-height 0.95, tracking -0.025em.
- Section H2: clamp(72px, 11vw, 176px), line-height 0.86 ("Proof." in the mockup).
- H3: 44px. Body: 18px / 1.6, max 62ch. Lead: 20 to 21px. Labels: 12px, uppercase, 0.14em tracking, weight 600.

### Spacing
- 8px scale only: 8, 16, 24, 32, 48, 64, 96, 128, 192.
- Section padding: clamp(96px, 16vh, 200px).
- Max width 1280px. Side padding clamp(20px, 5vw, 64px).

## 5. Motion rules

- Library: GSAP + ScrollTrigger (+ SplitText for headline reveals). Lenis for smooth scroll. Check the current GSAP licence before installing.
- Animate only `transform` and `opacity`. Never width, height, top, left or filter on scroll.
- **Wire:** SVG path, `stroke-dashoffset` scrubbed to scroll. Nodes switch to orange when their section crosses 50% of the viewport.
- **Mini flows:** step 1 lights, then the line draws, then step 2, then step 3. 0.9s total. Plays once.
- **Headlines:** line-by-line rise (SplitText lines, 24px, 0.8s, ease "expo.out", 0.08s stagger). Body fades in after.
- **Portrait:** leaf shadows pass over it (in the mockup: `mix-blend-mode: multiply` on the frame over the video). Tiny parallax on scroll, max 24px.
- **Hero video:** plays muted, loops seamlessly, pauses when off screen (IntersectionObserver).
- Durations 0.4s to 0.9s (hero sequence excepted). Nothing bounces. Nothing spins.

### Light through the day (scroll)
The room's light changes as you scroll, like a day passing:
- Hero: soft morning light. The wall as filmed.
- Proof: the wall stays behind every paper section as a fixed layer at low strength, so you never leave the room. Paper sections are 92% opaque paper over it, so the leaf shadows still drift faintly behind the work.
- What I fix: golden hour. A warm overlay (#F2B880, multiply) fades in.
- About: late afternoon. Warmer, shadows longer (overlay stronger).
- Contact: evening. A dark overlay fades the room to near ink. Text flips to paper colour. One warm lamp glow (radial gradient) sits behind the email address. The wire's last node glows there.
- Do it with stacked overlay layers whose **opacity** is scrubbed to scroll. Never animate CSS filter (too slow).

### Hover (every interactive thing responds)
- Orange button: magnetic (moves up to 6px toward the cursor), an ink fill wipes in from the left on hover, text turns paper, a small arrow slides in.
- Text links: the underline draws left to right in orange, 0.35s.
- Nav links: letters roll up and are replaced by the same word (two stacked copies, translateY).
- Project screenshots: image scales 1.0 to 1.04 inside a fixed frame, and a small "View project" pill follows the cursor.
- Step pills in the hero: hovering one lights it orange and slows the lights for a beat.
- Email in Contact: letters lift one by one (stagger 0.015s), underline draws in orange.
- Custom cursor only over projects (the "View project" pill). Normal cursor everywhere else. No cursor effects on touch devices.

### Premium moments (no 3D, all relevant)
1. **Hero workflow** (above). The signature.
2. **"Watch it run" scene** in What I fix. A pinned, scroll-scrubbed section, about 150vh. On the left, a stack of task cards ("New order", "Invoice", "Follow-up email", "Weekly report"). As you scroll, each card travels along the orange wire, through a pill, and lands in a "Done" column with a tick. A small counter reads "Tasks left: 12" and ticks down to 0. Label it clearly: "Example workflow". No fake client numbers.
3. **Mini flows** inside each project: the same smooth line and travelling lights, small. They run through the three steps when the project enters view.

The hero sets the standard. Every section must match its level: same line language, same lights, same pills, same spacing discipline.
4. **Big footer:** "Rydny Ihims" set huge in Fraunces across the full width in the evening section. The page wire ends at a final node next to it with a tiny live label: "Still running".
5. **Live Riga clock** in the hero meta row (updates every minute).
- `prefers-reduced-motion`: no video (poster only), wire fully drawn, no reveals, no smooth scroll.
- **Progressive enhancement:** all content is visible in the HTML. JS adds a `js` class to `<html>`, and only then are elements hidden for reveals. The current site hides everything until scroll fires, and a full-page screenshot comes out blank. That must never happen again.

## 6. Page structure and final copy

Use this copy exactly. If a line breaks the layout, ask Rydny before changing words. No em dashes or en dashes anywhere on the site.

### 01 Hero (the wall, full viewport, layout as `mockup/hero.png`)
- Top meta row, 14px: **Rydny Ihims** (Fraunces) · Software and automation · Work  About  Contact · Riga [live local time] GMT+2
- **H1, two lines, clamp(64px, 12vw, 200px), weight 380, tracking -0.045em:**
  - "Find the problem." top left
  - "Build the fix." lower right, italic
- The orange wire from the full stop to "Build" (section 2).
- Bottom left: lead "I turn slow, manual processes into software and automations that run on their own." Then button (orange, the one per viewport) "See the proof" and text link "Tell me what you're working on".
- Bottom right, three facts: **End to end** / Idea, design, build, launch · **5+ products** / Built from zero · **Remote** / Europe, UK and the Gulf
- The hackathon win is not a hero fact. It lives on the PlateShare badge and in About.
- Mobile: lines stack left-aligned, wire becomes a short vertical curve between them, facts drop under the CTA.

### 02 Proof (work)
- **H2:** Proof.
- Lead: Three problems. Three working fixes.

Each project: large screenshot (7 cols) + text (5 cols): badge or label, name, Problem / Fix / Result list, mini flow.

**PlateShare** (badge: 1st place · Global Challenge Hackathon)
- Problem: Campus canteens bin good food at closing. Students go hungry at 5 pm.
- Fix: One WhatsApp message from the canteen. Every student gets pinged. First reply claims the meal. Nothing to install.
- Result: Won first place. The bot runs on a live database.
- Flow: Canteen posts → Students pinged → Meal claimed
- Links: GitHub (github.com/Rydny1/PlateShare)
- Image: github.com/Rydny1/PlateShare/raw/main/docs/dashboard-overview.png

**APEX** (label: Analysis engine)
- Problem: Bookmakers misprice football matches. Spotting it by hand takes hours every week.
- Fix: An engine that prices every match on its own and flags where the bookmaker got it wrong.
- Result: Working engine with a live demo online.
- Image: use the current screenshot. Rydny is fixing APEX and will send a new one. Keep the image swappable from `projects.ts`.
- Flow: Odds in → Match priced → Mistakes flagged
- Links: Live site (apex-ai-analysis.vercel.app), GitHub

**Altays** (label: E-commerce rebuild, Dubai)
- Problem: A Dubai marble furniture brand on a template WordPress site that undersold the product.
- Fix: Rebuilt from scratch in Next.js as a custom online store, designed around the stone.
- Result: Built and delivered to the client.
- No live link. Do not link to any Altays domain.
- Flow: Browse the stone → Pick a piece → Send an enquiry

Small line under the projects: More: Steady (fitness app), QuickList (listings platform). Links to GitHub.

### 03 What I fix
- **H2:** What I fix.
- Three large typographic rows, numbered, no cards:
  - **01 Manual processes.** Data entry, follow-ups, reports, handovers. The work your team repeats every day, automated end to end.
  - **02 Websites and web apps.** Fast, sharp, and built for one job: getting the visitor to act.
  - **03 The problem behind the problem.** Before any code, I map where the time and money actually go. If the right fix is a better process, you hear that first.

### 04 About
- Portrait (`assets/portfolio-picture.png`) framed on the wall footage like a print, 4:5, with the leaf shadows passing over it (multiply blend). This is where the face lives.
- Small caption: Rydny Ihims, Riga 2026
- **H2:** The short version.
- Body:
  I'm Rydny Ihims. I build software and automations.
  The problems I get handed usually start as lost time. Lost money. Someone doing the same task by hand, every day.
  My job: find where it breaks, design the fix, build it, and make sure it keeps running.
  Raised in Cameroon. Lived in Dubai. Now in Riga, studying Computer Science at the University of Latvia. I work in English and French.
  First place at the Global Challenge Hackathon, for a WhatsApp system that sends leftover canteen food to hungry students.
- Quote, small, set apart: "What stands in the way becomes the way." Marcus Aurelius, Meditations
- Tools, one quiet line: React · Next.js · TypeScript · Python · Laravel · MySQL · n8n · REST APIs

### 05 Contact
- Nav button and every secondary CTA on the site: "Get in touch" (nav, outline) and "Tell me what you're working on" (text links). Never "Bring me a problem": it tells the visitor something is wrong with them.
- **H2:** What are you working on?
- Lead: A new idea, or something that already runs and should run better. Tell me where you want it to go. You get a straight answer: how to get there and what it takes.
- Email, large: rydny01@gmail.com (orange underline draws in on hover)
- Small links: GitHub · LinkedIn · Download CV (hide the CV link until Rydny supplies the PDF; keep the slot in `copy.ts`)
- Footer: © 2026 Rydny Ihims. Built by hand in Riga.

## 7. Assets

- Hero video: `_brief/assets/wall-light.*`. Serve WebM first, MP4 fallback. Poster is the LCP image: serve as AVIF + WebP + JPG, under 80 KB.
- Portrait: `_brief/assets/portfolio-picture.png`. Export 4:5 crops at 480, 960 and 1440 wide, AVIF + WebP. Under 120 KB at 960w.
- Project screenshots: existing site assets + PlateShare repo image. Re-export at 1600w, AVIF + WebP, `loading="lazy"` below the fold, explicit width and height on every image.
- If a better wall clip is needed, use Pexels or Coverr only, same look: warm light plaster, slow soft shadows, no people. Show Rydny before swapping.

## 8. Architecture rules

- **Stack:** Astro (static output) + TypeScript strict. React only if a component truly needs it (none should).
- **Structure:**
  ```
  src/
    content/projects.ts   all project data in one typed array
    content/copy.ts       all page copy in one place
    components/           Nav, Hero, Proof, Project, MiniFlow, WhatIFix, About, Contact, Wire
    styles/tokens.css     every color, font, size, space as a CSS variable
    styles/global.css
    scripts/motion.ts     all GSAP code, one entry, gsap.context() cleanup
  public/                 fonts, favicons, og image, robots.txt
  ```
- No hard-coded colors or sizes inside components. Tokens only.
- One H1 per page. Semantic sections with `aria-labelledby`.
- JS budget: under 60 KB gzipped total on the home page. CSS under 25 KB.
- No layout shift: reserve space for every image and video.
- Commit after every gate with a clear message. Push to a `revamp` branch, not main.
- Hosting: Vercel (free tier). Preview deploy per gate. No custom domain for now. Do not buy anything. Rydny will buy rydny.com later; keep the canonical URL in one config value so the switch is one line.

## 9. SEO

- Title: Rydny Ihims | Software and Automation, Riga
- Meta description: Rydny Ihims builds software, web apps and automations that take manual work off people's desks. Based in Riga. See the proof.
- Open Graph + Twitter card: 1200x630, wall + portrait + "I find the problem. Then I build the fix."
- JSON-LD `Person`: name, jobTitle "Software and Automation Developer", url, image, address Riga LV, alumniOf/affiliation University of Latvia, sameAs GitHub + LinkedIn.
- Canonical, sitemap.xml, robots.txt, custom 404 ("Wrong room." + link home), full favicon set, alt text on every image.
- 301 redirect from the old GitHub Pages URL once the custom domain is live (later).

## 10. Security (static site version of ship-safe)

- vercel.json headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, frame-ancestors 'none'.
- No secrets in the client. No source maps in production. No console.log in production.
- Contact: email link only. If a form is added later: honeypot + rate limit + server-side validation.
- Verify every npm package name before installing (typosquats).
- Vercel Web Analytics on (free tier).

## 11. Performance budgets (fail the gate if missed)

| Metric | Budget (mobile, 4G) |
|---|---|
| Lighthouse Performance | 95+ |
| Accessibility, Best Practices, SEO | 100 |
| LCP | under 2.0 s |
| CLS | under 0.05 |
| INP | under 200 ms |
| Total transfer, first load | under 1.5 MB (video loads after LCP) |
| JS | under 60 KB gz |

Current site for comparison (measured 21 Nov 2026, Lighthouse mobile): Performance 45, LCP 4.7 s, page weight 834 KB, main thread blocked by the WebGL prism.

## 12. Testing (run every gate, report results)

**Automated**
1. `astro check` and `tsc --noEmit`: zero errors.
2. Build passes with zero warnings.
3. Lighthouse CI on the preview URL, mobile and desktop. Budgets above enforced.
4. axe-core accessibility scan via Playwright on every section: zero violations.
5. HTML validation (W3C validator or html-validate): zero errors.
6. Link check: every internal and external link returns 200.
7. Bundle report: JS and CSS sizes vs budget.

**Visual (Playwright MCP)**
8. Screenshot every section at 360, 390, 768, 1024, 1280, 1440 and 1920 wide. Look at each one. Check: alignment to grid, spacing on the 8px scale, no orphan words in headlines, no text over busy footage, only one solid orange element per viewport.
9. Full-page screenshot with JavaScript **disabled**: every word must be visible.
10. Full-page screenshot with `prefers-reduced-motion: reduce`: no video, wire drawn, all content visible.
11. Compare against `_brief/mockup/*.png`. The build must look at least as good.

**Behaviour**
12. Scroll the whole page in Chromium, WebKit and Firefox (Playwright). No console errors. Wire draws in sync with scroll. Nodes light at the right section.
13. Performance trace while scrolling: no long tasks over 50 ms, steady 60 fps on a mid-range laptop profile, no layout shift.
14. Keyboard only: tab through every link and button. Visible focus ring (2px ink outline, 3px offset). Skip-to-content link works.
15. Video pauses when scrolled out of view and when the tab is hidden.
16. OG preview: check the card with a link-preview tester (e.g. opengraph.xyz) for LinkedIn, WhatsApp and X.

**Real devices (Rydny does these, you prepare the checklist)**
17. iPhone Safari and an Android Chrome phone: scroll feel, video autoplay, text sizes, tap targets 44px+.

Write results into `_brief/TEST_REPORT.md` at each gate: what passed, what failed, what you fixed.

## 13. Self-review rubric (score yourself honestly before every gate)

Score 1 to 10 using the Awwwards weights. Do not show Rydny a gate under 7.5 overall.

| Area | Weight | What a 9 looks like here |
|---|---|---|
| Design | 40% | Strict hierarchy, perfect spacing, footage and type feel like one place |
| Usability | 30% | Instant load, clear path to proof and contact, flawless on phones |
| Creativity | 20% | The wire and the living wall feel intentional, not decorative |
| Content | 10% | Every line is true, short and specific |

Then list the 3 weakest spots and fix them before showing.

## 14. Copy rules

- Talk about the visitor's progress, never their flaws. CTAs invite, they never diagnose.
- Describe what Rydny does and show proof. Do not hand him job titles he hasn't held. The headline shows the method; the work proves it.
- Every claim must be checkable from a link on the page.
- General claims are fine only when true. "5+ products built from zero" is true (APEX, PlateShare, Altays, Steady, QuickList). Invented numbers, client counts or results are banned.

## 14b. What not to do

- No AI-looking defaults: no gradient blobs, no glass cards, no centered hero with a pill badge, no "Hi, I'm X 👋".
- No fake numbers, testimonials or logos.
- No new copy. Copy changes go through Rydny.
- No new paid services, fonts or packages without asking.

## 15. Gates

1. **Structure.** Astro build, all copy and images in place, zero animation, JS disabled still perfect. Tests 1, 2, 5, 6, 9.
2. **Design.** Tokens, type, spacing, grid, hero wall footage, portrait, proof strip. Tests 8, 11 + rubric. Wait for Rydny's OK.
3. **Motion.** Wire, nodes, mini flows, headline reveals, smooth scroll, reduced motion. Tests 10, 12, 13, 15.
4. **Hardening.** SEO, headers, performance budgets, accessibility. Tests 3, 4, 7, 14, 16. Write TEST_REPORT.md.
5. **Ship.** Vercel preview. Rydny tests on his phone. No domain yet.

## Open items for Rydny
- [ ] New APEX screenshot once the fixes are done
- [ ] CV PDF (being updated now)
- [ ] rydny.com: later, not now
