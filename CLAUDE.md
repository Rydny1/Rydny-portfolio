# CLAUDE.md — Rydny Ihims Portfolio

This file is the standing brief for this project. It captures the concept,
the direction, and the decisions made so far, so any session picking this
project back up — human or agent — starts from the same understanding
instead of re-deriving it from scratch.

## THE PROJECT

A personal portfolio for Rydny Ihims, a full-stack developer based in Riga,
Latvia. The audience is **hiring clients, recruiters, and companies**
deciding whether to work with him — not a general public audience, not a
creative-community audience. The site's one job: create a premium first
impression precise enough that it becomes a reason to hire him, not just a
list of what he's built.

Previous version: a single-page site with a dark green-black,
teal-glassmorphism aesthetic — the generic "AI-generated dev portfolio"
look (blur on every surface, pill-radius on everything, a fake terminal
widget, an infinite pulsing "available" dot). That version is being fully
rebuilt.

## THE DIRECTION — "engineered restraint"

The visual language is inspired by what Mercedes-Benz communicates —
**not literal car imagery** (no grilles, no chrome badges, no showroom
clichés) — but the underlying qualities: precision, tactile material
quality, confidence expressed through quality rather than noise.

**Important calibration, learned during this build:** restraint applies to
*taste* (no dark patterns, no fabricated claims, no gimmicky decoration),
not to *ambition*. The site owner has been explicit and repeated on this
point: he wants the most premium, most impressive execution achievable —
real animation, a genuine 3D signature moment, real dependencies (React,
Framer Motion, Three.js/React Three Fiber) where they earn their place.
Early instinct on this project leaned too minimal/quiet in a few places
(motion that was too subtle to read as "alive," a hero that felt "dead")
and had to be corrected upward based on direct feedback. When in doubt,
err toward more considered craft, not less — the ceiling here is "does
this look expensive and deliberate," not "is this the least amount of
motion possible."

## DESIGN TOKENS

Defined in `src/styles/global.css`.

**Color:**

| Token | Hex | Role |
|---|---|---|
| `--graphite` | `#1B1D1F` | Dark ground — hero, footer, contact intro band |
| `--anthracite` | `#2A2D30` | Tonal depth step on dark sections |
| `--porcelain` | `#F1EFEA` | Light ground — About/Skills/Projects/Certs, the majority of the site |
| `--pewter` | `#8B8880` | Secondary text / hairlines (raw value; see `--ink-on-dark`/`--ink-on-light` for contrast-safe text) |
| `--brushed` | `#C2B59B` | The one accent — rules, labels, large numerals, the 3D control's material. Never a glow, never a decorative fill |
| `--oxide` | `#B4472F` | Errors only |
| `--moss` | `#5F6F52` | Success states only |

`--accent-ui` is a theme-aware alias: resolves to a darker bronze
(`--brushed-on-light`, `#8F7A5A`) on light backgrounds and to `--brushed`
itself on dark ones. **Use `--accent-ui` for any functional UI indicator**
(borders, focus rings, underlines) — raw `--brushed` only hits 1.76:1
contrast against porcelain, well under the 3:1 floor for interactive
indicators, and was a real bug once (invisible focus rings on light
sections) before this split existed.

`.theme-dark` / `.theme-light` only **redefine the CSS custom properties**
— they do not paint anything. Every real section must explicitly declare
its own `background: var(--bg); color: var(--text);`. This was a real bug
once: a themed section that never painted its background rendered
porcelain-text-on-porcelain, invisible. The one deliberate exception is
the navbar's floating pills, which need the color-variable cascade
*without* the paint, since they already carry their own translucent glass
background.

**Type:** `--font-display` (Clash Display, loaded via Fontshare) for
headlines, section headings, the hero name, and large numerals.
`--font-body` (Plus Jakarta Sans, Google Fonts) for everything else — body
copy, nav, labels, forms. Plus Jakarta Sans alone, at light weight, was
tried first and read as "boring" / too minimal — Clash Display on display
elements is the fix. Scale: `12/14/16/18/22/28/40/56/76` (px, as rem
custom properties `--fs-*`).

**Radius:** `--radius-control: 14px` (moderate rounding on buttons/inputs —
this is how Mercedes' own MBUX touch interface treats controls: rounded
controls, sharp-edged content). `--radius-pill` (full pill) is reserved
for **navbar chrome only** — the floating nav pills and the CTA button
inside them. `--radius-image: 0` for photography and content blocks. Full
pill radius elsewhere (buttons, cards, tags) was the specific "AI SaaS
template" tell the original site's audit rejected — don't reintroduce it
outside the navbar.

**Motion base:** easing `cubic-bezier(0.22, 0.61, 0.36, 1)` (mechanical
decelerate). Respect `prefers-reduced-motion` everywhere — every animated
component has a static/settled fallback state, not just a shorter
duration.

## ARCHITECTURE

Astro (static output), React islands (`client:visible`/`client:load`) for
anything genuinely interactive or animated, Framer Motion as the
animation engine, React Three Fiber + drei for the one 3D signature piece.
Not trying to stay "vanilla" or minimal-dependency — that was an early
instinct that the site owner explicitly overrode ("why are we sticking to
vanilla at all... I want the best"). Use the right tool; just don't
hydrate more of the page than actually needs it.

**Pages:**
- `/` — Home. Hero, About (photo lives here now, not in the hero — square
  4:5 crop, sharp corners, hairline border, not circular), Skills, Contact
  as sections. Projects and Certifications get **preview/teaser sections**
  here too (a few highlights + "View all" link) — the dedicated pages
  below carry the full depth. (Teaser sections are planned, not yet built
  as of this writing.)
- `/projects` — dedicated page. Grid of project cards, each with a
  "build plate" spec block (see below). A category filter (e.g. Web vs.
  Cloud & AI) exists in the data model from the start, but the filter UI
  itself only ships once there's real content in a second category —
  Apex (see CONTENT below) is that second category's first real entry.
- `/certifications` — dedicated page, room to add more over time.

**Deploy:** GitHub Pages, repo `Rydny1/Rydny-portfolio`. Needs switching
from legacy branch-serving to GitHub Actions-based deploy (Astro build →
`dist/` → Pages) since a build step now exists. Not yet done as of this
writing — see open items below.

Astro `base` is set to `/Rydny-portfolio` in `astro.config.mjs` (this is a
project page, not a `<user>.github.io` root site). Always build internal
links through `withBase()` in `src/lib/base.ts`, never a raw `/path`.

## SIGNATURE ELEMENTS

Distinctive elements are used in exactly one place each, deliberately —
that's what makes them read as intentional rather than decorative.

**The machined control** (`src/components/hero/`) — the hero's 3D
centerpiece. A single extruded aluminum-billet profile (one `THREE.Shape`
→ `ExtrudeGeometry`, not stacked primitives — an earlier stacked-disc
version visibly showed seams and was rejected). Rules that came out of
direct iteration with the client, in order of how firmly they were stated:
- Rotates continuously, fully, on **both horizontal (yaw) and vertical
  (pitch)** axes at all times — not a bounded wobble, not a subtle drift.
  This was explicitly corrected upward twice: first from "barely
  perceptible" to a bounded multi-axis sway, then again to true
  continuous 360° rotation on both axes when that still wasn't enough.
- No visible ground-plane/box underneath it — a soft `ContactShadows`
  blur only. A flat plane mesh was tried and explicitly rejected as
  looking like "a square box."
- Has a permanent caption ("Selected work") next to it — an unlabeled
  floating object doesn't communicate anything on its own to someone
  glancing for three seconds.
- Slows (not stops) on hover/cursor-proximity so cursor-tilt reads
  clearly; click navigates to `/projects`.
- Material: `MeshPhysicalMaterial`, metalness ~1, roughness ~0.33,
  anisotropy for the brushed-metal streak. Lighting via drei
  `Environment` + `Lightformer` (no external HDRI fetch — kept
  self-contained). `ACESFilmicToneMapping`.
- Mobile is the priority device, not an afterthought — this is where
  most traffic actually is. WebGL capability is checked (`supportsWebGL`
  in `HeroVisual.tsx`) with a CSS-only metal-sheen fallback for
  unsupported/reduced-motion cases.

**The build plate** (Projects page) — a hairline-ruled spec block per
project card (`ROLE / STACK / STATUS`), styled like a manufacturer's plate
in a door jamb. Used only on project cards.

**Glass buttons** — translucent/blurred surface with a hover shine sweep,
reserved for the single primary action per view (hero CTA, form submit,
nav "Hire Me"). Everywhere else uses a plain hairline ghost button. This
was a deliberate scoping decision to reconcile "I want glass buttons" with
the broader anti-glassmorphism direction — glass as a rare signature, not
a blanket surface treatment.

**Spotlight navbar** — three separate floating glass pill modules (logo,
nav links, CTA), not one full-width bar. The links pill has a
cursor-following radial highlight (one shared `useMotionValue`-driven
listener, not per-item state) and an animated sliding underline
(`layoutId` shared-element transition) tracking the active section as you
scroll the home page. No circular elements in the nav chrome — no avatar
image, no circular hamburger background — only the pill containers
themselves are rounded.

## CONTENT — what's real, what's decided

- **ALTAYS Marble** — luxury furniture e-commerce, live at
  altaystradingllc.com. HTML/CSS/JS/React.
- **African Grill** — restaurant site, live at
  rydny1.github.io/African-Grill.
- **QuickList** (shown as "Event Management System") — PHP/Laravel/MySQL,
  repo at github.com/Rydny1/quicklist, no live deploy (repo link only,
  placeholder image kept as-is per owner's instruction).
- **Apex** — AI-powered pre-match football analysis tool (value-betting
  model; Claude Sonnet for the qualitative read, deterministic code for
  the math). Next.js/TypeScript/Supabase. Live at
  apex-ai-analysis.vercel.app, repo github.com/Rydny1/apex-ai-analysis.
  This is the first real "Cloud & AI" category project.
- **Testimonials — cut entirely.** The three on the old site read as
  fabricated (uniform casual voice across three different "people," no
  full names, no verifiable links). Recommendation stands: only bring
  testimonials back with a full name + company + link attached.
- **Stats — trimmed to two**: "3+ Years Experience" and "5+ Projects
  Delivered." The old site's "2 Languages" / "1 Certification" cards were
  cut — never enumerate something you have only one of.
- **Fraunces (the old display serif) — dropped entirely**, replaced first
  by Plus Jakarta Sans alone, then by Clash Display for display use once
  Jakarta-alone read as too plain. No serif anywhere on this site.

## WHAT NOT TO DO

- No dark patterns: no fake urgency, no fabricated stats, no invented
  testimonials.
- No glassmorphism/pill-radius outside the specifically scoped exceptions
  above (glass buttons, nav chrome). Reintroducing it broadly is the
  exact "generic AI SaaS template" look this rebuild exists to escape.
- No ambient/looping motion that isn't the 3D control specifically — other
  motion (scroll reveals, hover states) should be event-driven and
  settle, not loop forever.
- Don't fabricate project details, dates, or specs. If a fact isn't
  confirmed, ask rather than invent — this cost real credibility on the
  old site (see testimonials, above).

## OPEN / IN PROGRESS

- Homepage preview/teaser sections for Projects and Certifications (not
  yet built).
- Full content/copy pass — flagged as needed but not yet scoped in
  detail.
- Mobile responsiveness pass across all pages (phones are the priority
  device).
- GitHub Actions deploy workflow + switching the repo's Pages source from
  legacy branch to Actions.
- Full scroll-reveal motion system (currently a static placeholder —
  `.reveal`/`.hairline-draw` classes exist in `global.css` but aren't
  wired to an IntersectionObserver yet). When built, it must re-trigger
  in both scroll directions (fade in on enter, fade out on leave so it
  can replay), not just play once and stop.
