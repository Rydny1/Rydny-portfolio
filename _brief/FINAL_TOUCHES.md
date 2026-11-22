# Final touches (after FINAL_SPEC)

The site is close. Lighthouse mobile on rydny-portfolio-v2.vercel.app (22 Nov 2026): 100 / 100 / 100 / 100, LCP 1.7s, TBT 50ms. Keep those numbers. This pass is polish only. Do not change the design, colours or copy beyond what is listed here.

Recordings of the live site: `_brief/references/live-desktop.mp4` and `live-mobile.mp4`. Watch both first.

## 1. Motion audit (top priority)

Rydny sees small faults in the animations. Everything must feel swift and smooth.
- Record a Chrome performance trace while scrolling the whole page down and back up, slowly and fast, on desktop and on a throttled mid-range phone profile. Fix every dropped frame, long task and layout shift.
- Check every animated element for: flicker when it replays, double triggers, elements jumping to a start state while visible, animations fighting each other (sticky media vs reveals vs the page line), anything stuck half-way after a fast scroll.
- Rule: transform and opacity only. One scroll loop (one rAF or one ScrollTrigger instance) drives everything. No scroll listeners per element.
- Every animation must reach a clean final state if the user scrolls past it quickly.
- Record the before and after at 1x and 0.5x speed for the hero light, the project steps, the droplet, the section reveals and the night transition.

## 2. Bugs seen in the recordings

- **Nav readability.** The glass nav is almost transparent, so its links collide with content underneath (for example "About" and "Contact" sitting on top of the "PlateShare" heading). Make the bar more solid: paper at about 78% plus 16px blur on cream, night at about 78% on dark. Also hide it on scroll down and bring it back on scroll up (desktop and phone).
- **Grey band at the top of Proof** (desktop and phone): the pinned hero still shows through as a blurred strip under the nav. Proof must fully cover it.
- **Cream to night** passes through a muddy cold grey band. Fade over a full screen of scrolling and go through warm tones (cream → warm taupe → night), never mid-grey.
- **APEX screenshot** shows a dashboard full of 0.0% values. It reads as broken. Use a frame with real numbers, or crop to the headline area until Rydny sends the fixed APEX screen.

## 3. Phones

- **Hero line:** the TEST pill hangs off the left edge and the route loops around too much. On phones use two pills only (MAP, AUTOMATE), a clean S from the full stop down to just before the right-aligned "Build", everything at least 16px inside the edges.
- **Hide the vertical page line under 600px.** It crowds the text. Keep a small orange dot beside each section title.
- **Project flow pills wrap and cramp** ("Canteen posts / Students pinged / Meal claimed"). Stack them vertically on phones, joined by a short vertical line, one line of text each.
- **Floating "Get in touch" pill** covers content. Hide it while scrolling down and show it on scroll up, and add bottom padding to the last element of each section so nothing important sits under it.
- **Carousel:** keep the swipe, but start the track 16px in from the screen edge so it doesn't fight the iOS back-swipe. Add small previous and next arrows beside the "01 / 03" counter.
- **Battery:** pause the wall video when off screen or when the tab is hidden. Use a solid tinted nav instead of blur on phones.

## 4. Content and conversion

- **Email, one click.** In the contact section on desktop, make the email a button that copies to the clipboard, with a quiet "Copied" confirmation that fades out after 1.5s. Keep the mailto link as a fallback.
- **Altays needs proof.** It is the only project with no link. Add a short silent walkthrough loop (6 to 8s) from the local Altays build, and a "Watch walkthrough" link that opens it larger. Do not link the client's domain.
- **Steady:** give it one short line instead of a bare link, e.g. "More: Steady, a fitness app with voice logging." (copy to be confirmed by Rydny).

## 5. Leave as is (considered and rejected)

- No 3D or WebGL. The site sells working systems to clients and employers, and its clarity is the edge.
- No tech-stack tags. The quiet text line is deliberate.
- No tilt or parallax on project frames.
- "What I fix" is already server-rendered: the rows are in the HTML. No change needed.

## Report

Before and after recordings (desktop and phone), the performance trace summary, the list of every animation fault found and fixed, and Lighthouse mobile numbers.
