# CLAUDE.md: Rydny Ihims portfolio

Standing brief for this project. Source of truth, in order: `_brief/PORTFOLIO_BRIEF.md`, then the update passes (`_brief/UPDATE_PASS_5.md`, `_brief/UPDATE_PASS_6.md`), then this file. Later passes override earlier ones. Every change is logged in `_brief/CHANGELOG.md` with one line on why. Test results live in `_brief/TEST_REPORT.md`.

## The project

Portfolio for Rydny Ihims (Riga), who builds software and automations. Audience: anyone deciding whether to hire or work with him: founders, hiring managers, clients, engineers. The site proves one thing in ten seconds: he finds real problems and ships working fixes. Main goal: people reach out. Phones decide most first impressions.

## Concept: "the room"

One quiet room in daylight. Real leaf shadows drift across a cream plaster wall (looping video). Giant type sits on the wall; the work comes after, on paper.

One orange workflow line runs from "Find the problem" to "Build the fix." Four step pills sit on it (MAP, DESIGN, AUTOMATE, TEST) and one blue-grey light travels it. The same line continues down the page and ends at a live node in the footer. The hero is pinned: the page slides over it and the wall blurs.

The approved visual standard is `_brief/references/current-hero-approved.png`: ink-black headline, cream wall, orange line, pills.

## Colour (tokens in `src/styles/tokens.css`, never hard-code)

| Token | Use |
|---|---|
| cream wall and paper `#EEE9E3` | main surfaces (sections are 92% opaque so the wall drifts faintly behind) |
| ink `#1F2023` | text |
| vintage green `#2E4636` | rare: the cursor leaf, the active flow step, What I fix hover |
| orange `--signal` | accent only: the line and its nodes, the full stops after section titles, the live dot, focus underlines. `--signal-fill` is the button fill (ink text on top) |
| night `#17181A` | contact and footer |
| glass `#E6EEF6` | the light that travels the line |

One solid orange element per viewport (the primary button). Orange text on paper is banned for body text.

## Type

Fraunces (display, variable, self-hosted) and Plus Jakarta Sans (body). No other fonts.

## Stack

Astro (static output), TypeScript strict, plain TypeScript scripts in `src/scripts/` (no framework, no animation library: Web Animations API, CSS and small rAF loops), Vercel (project `rydny-portfolio`, GitHub linked, branch `revamp`). The contact form posts to `api/contact.ts`, a Vercel function that is a stub (validates, logs) until Rydny approves an email service. Canonical URL lives in `src/config.ts` only.

All copy is in `src/content/copy.ts`, all project data in `src/content/projects.ts`.

## Rules that still apply

- No fabricated claims, numbers, clients or testimonials. A testimonial only comes back with a full name, company and link.
- No em or en dashes anywhere on the site.
- Copy changes go through Rydny. Talk about the visitor's progress, never their flaws. CTAs invite ("Get in touch"), they never diagnose.
- Every section paints its own background. Theme classes never paint for you.
- Reduced motion: a settled, static fallback for every animation, not just shorter durations.
- Content is visible in the HTML. Scripts may only start animations when an element enters view; nothing is hidden up front, so a full-page screenshot or a failed script never shows a blank page.
- Animate only transform and opacity (plus clip-path and stroke-dashoffset). Never layout properties, never per-frame blur on many elements.
- 8px spacing scale. 16px minimum from every screen edge on phones. Focus ring: 2px, 3px offset.
- Budgets: Lighthouse mobile Performance 95+, Accessibility, Best Practices and SEO 100; JS under 60 KB gzipped; CSS under 25 KB.

## Working agreement

Rydny wants a designer-developer, not an order taker: if at least 80% sure a change is better, make it and log it; list bigger ideas for approval. Study reference sites (dennypratama.com, johnbolster.design, lucaslima.design) before deciding. One task at a time. Check every device size (`npm run test:gate`), look at your own screenshots, and fix what you see before reporting. Ask before spending money, buying domains or adding paid services.
