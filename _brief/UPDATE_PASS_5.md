# Update pass 5

Read all of this before touching code. Work through it in order. Screenshot before and after every change with Playwright, look at every screenshot yourself, and fix what you see before reporting. Log every change in `_brief/CHANGELOG.md` with one line on why.

You have creative freedom. If you are at least 80% sure a change makes the site better, make it and log it. If anything looks broken, misaligned or cheap, fix it without asking. Bigger ideas go in your report for approval.

Reference images in `_brief/references/`:
- `current-hero-approved.png`: the current hero. **Approved.** This is the visual standard for the whole site. Keep the ink-black headline, the cream wall, the orange line and the pills exactly in this spirit.
- `current-footer.png`: current footer. Good, with two bugs (see 3).
- `whatifix-rows-reference.png`: layout reference for What I fix.
- `contact-reference.png`: layout reference for the contact section.

---

## 0. Rewrite CLAUDE.md first

`CLAUDE.md` describes an old direction (Mercedes "engineered restraint", Clash Display, "no serif anywhere", a 3D aluminium control, GitHub Pages). None of that is true any more, and it contradicts the build. Rewrite it so it describes the site as it is now and after this pass:
- Concept: "the room". Real leaf shadows on a cream plaster wall. One orange workflow line from "Find the problem" to "Build the fix."
- Colours: cream wall and paper (main), ink #1F2023 (text), vintage green #2E4636 (rare: cursor leaf, active flow step, What I fix hover), orange (accent only: the line, its nodes, the full stops after section titles, the primary button, the live dot). Night #17181A for contact and footer.
- Type: Fraunces (display), Plus Jakarta Sans (body).
- Stack: Astro static, plain TypeScript scripts, Vercel. Point to `_brief/PORTFOLIO_BRIEF.md` and this file as the source of truth.
- Keep the useful rules from the old file that still apply: no fabricated claims, no testimonials without a name, company and link, reduced-motion fallbacks everywhere, every section paints its own background.

## 1. Spacing and fit (top priority)

Rydny had to zoom out to see the hero as intended. On his laptop (1920x1080 at 125% Windows scaling, so the CSS viewport is about 1536x730 minus browser UI), it does not fit at 100%.

- Add these to the viewport test matrix and make the hero fit, with nothing clipped and nothing crowded, at 100% zoom:
  1536x695, 1366x657, 1280x601, 1440x789, 1920x969, 1280x720, 2560x1271
  (laptop sizes with real browser UI taken off).
- Size the hero type from **both** width and height, for example `font-size: min(11.5vw, 19vh)`, then clamp. Height is the real constraint on laptops.
- The hero must feel like `current-hero-approved.png` at every one of those sizes. Same proportions, same breathing room.
- Then do a spacing pass on the whole page: 8px scale only, consistent section rhythm, no gap that doesn't separate two ideas, no element touching another. Check alignment to the 12-column grid at 1280, 1440 and 1536.

## 2. Copy changes

- Every "Let's talk" becomes **"Get in touch"**: nav button, hero primary, and the line after each project ("Want something like this? Get in touch."). It asks for less, so more people do it.
- Remove the "Remote" fact from the hero. Keep "End to end" and "5+ products".
- Contact title becomes **"Get in touch."** with the orange full stop (same object as "Proof." and "What I fix."). Lead under it: "Hiring, building something new, or making what you have better. Send a note and you get a straight answer."
- `What I fix` title gets its orange full stop too: "What I fix."

## 3. Bugs from the screenshots

- Remove the hairline border under the nav bar. Blur only, no line.
- In `current-footer.png` there is a blurred orange blob behind the top-left of the nav. Find it and remove it (likely the light, a node glow or the cursor bleeding through the glass).
- The light on the hero line shows a white streak near DESIGN. Make sure only the blue-grey light is visible.

## 4. The hero line while scrolling

The wall already blurs as the page slides over the hero. The line and pills must go with it:
- As you scroll from 0 to 60% of the hero, the line and pills fade to 0 and soften (opacity plus blur up to 6px), scrubbed to scroll.
- GPU-friendly: blur the SVG layer as one element, or crossfade to a pre-blurred copy. Never re-blur per frame on many elements.
- Reverse cleanly when scrolling back up.

## 5. The cursor: a leaf

Replace the glass ring. The ring covers the text under it, so you can't read what you're hovering.

- A small leaf (about 22px), simple line-art silhouette with a soft fill. Vintage green #2E4636 at about 55% opacity, thin 1px stroke of the same green at full strength. It must look elegant and minimal, never cartoonish.
- `mix-blend-mode: multiply` so the text under it stays fully readable (green over ink stays ink).
- Follows the pointer with a light spring (stiffness tuned so it trails by a few frames). It rotates toward the direction of travel, and when idle it sways a few degrees, like a leaf settling.
- Over links and buttons: scales to 1.35, tilts 20 degrees, fill goes to 75%.
- Over project images: the leaf stays small and a "View project" label sits beside it (16px to the right), never on top of the image.
- Over text inputs: native text cursor, leaf hidden.
- Touch devices, and `prefers-reduced-motion`: no custom cursor at all.
- It ties the cursor to the leaf shadows on the wall: one world.

## 6. Project flows: scroll-driven steps

Under each project there are three steps joined by the orange line (for example Canteen posts → Students pinged → Meal claimed). Turn them into a scroll-driven sequence tied to that project's position on screen:

- When the flow enters the viewport, step 1 becomes active: green fill (#2E4636), paper text, scale 1.08.
- As you keep scrolling, the blue-grey light travels the line from step 1 to step 2, then step 2 activates the same way. Step 1 settles back to scale 1 but keeps a green outline and a small tick, so it reads as done.
- By the time the project is leaving the viewport, step 3 is active.
- Scrubbed to scroll (GSAP ScrollTrigger or a scroll-progress function you already have), smooth in both directions. Scrolling up reverses it.
- Reduced motion: all three shown as done, no light.
- Same light as the hero (3px capsule, core #E6EEF6). One visual language.

## 7. What I fix

Rebuild as large rows on the same cream paper as Proof. No colour blocks. Layout as `whatifix-rows-reference.png`:
- Each row: small index (01, 02, 03), title in Fraunces about 64px, a round arrow on the right, a thin hairline between rows.
- Hover (fine pointers): the title turns vintage green, slides 24px right and gains an orange full stop, the description fades in on the right, and the arrow fills ink. 0.4s, the standard ease.
- Touch: rows are an accordion. Tap to expand the description.

## 8. Contact transition

Contact and footer stay night (#17181A). The change into night must never be a hard edge:
- Scrub the page background (or an overlay's opacity) from cream to night over about one screen of scrolling as contact approaches.
- The leaf shadows keep drifting faintly on the night background (very low opacity, screen blend), so you never leave the room.
- Layout as `contact-reference.png`: big "Get in touch." top left, lead top right, a hairline, then the letter form, then the footer.

## 9. Mobile: a different experience, not a shrunken desktop

Phones are where most people will open this. Design the phone version as its own thing: fast, thumb-first, app-like. Inspiration: the best mobile award sites and native apps (smooth snapping, bottom sheets, one task per screen).

- **Hero:** full-bleed wall. Headline stacked left. A short vertical S of the line between the two lines with two pills (MAP, AUTOMATE). One light. "Get in touch" button plus "See the work" link, then the two facts in one row.
- **Bottom action bar:** after the hero, a small floating "Get in touch" pill appears at the bottom, inside the thumb zone. It hides while the contact section is on screen.
- **Menu:** a "Menu" text button top right opens a bottom sheet that slides up, with big Fraunces links, the Riga time and the email. Swipe down or tap outside to close.
- **Proof:** a horizontal swipe carousel with scroll-snap. Each card is about 86% of the screen width so the next one peeks in. An orange progress line under it shows the position. Each card: screenshot, name, badge, Problem / Fix / Result in one short line each, the mini flow, and "Get in touch".
- **What I fix:** accordion rows.
- **About:** portrait full width with leaf shadows over it, text below.
- **Contact:** the letter becomes a stepper, one question per screen inside the section: name → what you'd like (big tap pills) → the short version → email → Send. A thin orange progress line at the top fills as you go, and the light runs along it on each step. Use the right keyboards (`type=email`, `autocomplete`), 48px tap targets, and keep what was typed if they go back.
- **Motion on phones:** shorter (0.3 to 0.5s), tap feedback (scale 0.97 on press), no cursor code, no heavy backdrop blur (it lags on mid-range Android: use a solid tinted bar instead).
- **Media:** a mobile cut of the wall video at 720p under 1 MB. Poster only on Save-Data or slow connections.
- **Test on:** 360x740, 375x667, 390x844, 393x852, 412x915, plus landscape 844x390. Throttled to mid-range Android in Playwright. Scrolling must stay at 60fps with no jank.

## 10. Animation standard

Animations should be lively, premium and professional, not complex for the sake of it. Every animation has a job: guide the eye, confirm an action, or show the process.
- One easing family across the site. Durations 0.3s to 0.9s. Nothing bounces, nothing spins.
- Section titles reveal line by line from behind a mask. Their orange full stop pops in last (scale 0 to 1, 0.3s).
- Images wipe open (clip-path) as they enter.
- Everything reverses cleanly when scrolling up.
- Reduced motion: final states only, everywhere.

## 11. Done means

- All existing gate tests pass, plus the new laptop viewports and phone sizes.
- Lighthouse mobile: Performance 95+, Accessibility 100, Best Practices 100, SEO 100.
- No console errors. No layout shift.
- Report: before and after screenshots of hero, Proof, What I fix, Contact and footer at 1536x695, 1440x789 and 390x844. A screen recording of the hero line, the leaf cursor, a project flow scrolling, and the phone contact stepper. Then your top 3 ideas to push it further.
