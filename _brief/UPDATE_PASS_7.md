# Update pass 7: polish from a full scroll-through

Add this to the work from passes 5 and 6. Same rules: screenshot, self-check, log in `_brief/CHANGELOG.md`.

Source: full scroll recordings of commit 48b0aeb (desktop 1440x900 and phone 390x844), saved in `_brief/references/desktop-scroll.mp4` and `mobile-scroll.mp4`. Lighthouse mobile on that build: Performance 94, Accessibility 100, Best Practices 100, SEO 100. LCP 2.1s, Total Blocking Time 270ms, 1.39 MB.

## 1. Animations replay, every time

Right now reveals and mini flows play once. Make every animation play **each time** its element enters the viewport, in both scroll directions, on desktop and phones.
- Enter: play. Leave: reset quietly, out of sight, so it can play again. Never animate anything out while the user is looking at it.
- Animations never hold content back. Start them as soon as 10 to 15% of the element is visible, keep them short (0.4 to 0.7s), and if the user scrolls fast, jump straight to the final state. Nobody waits for an animation to read something.
- Make them **robust**: sure, clear motion you can actually see, not faint fades. Headlines rise from behind a mask, images wipe open, flows run step by step, the orange full stops pop in last.
- One IntersectionObserver (or ScrollTrigger) system for everything. No per-element listeners.
- Reduced motion: final states only.

## 2. The page line gets a droplet head

The vertical orange line that runs down the page gets a small **droplet** at its leading end:
- A teardrop pointing down, about 10px wide and 14px tall, the same orange (`--signal`), with a soft glow (6px, 25% opacity).
- It rides the tip of the line as scroll draws it, with a slight spring lag (it settles 80 to 120ms after the line stops), so it feels like a drop of liquid sliding down.
- When it reaches a section node, it merges into the node with a tiny pulse, then a new droplet forms below and carries on.
- At the end it lands in the "Still running" node.
- Phones: see 6.

## 3. Projects: make them premium

The three projects currently read like a document: the same layout three times, small screenshots, lots of text, and crops that cut words in half (the Altays image shows "ut from one / ock. Finished").

Rebuild the Proof section so each project feels like an exhibit:
- **Big media.** The image takes 8 of 12 columns on desktop, 16:10, inside a thin hairline frame with a small caption under it (for example "apex-ai-analysis.vercel.app"). Show the **top of each site** (`object-position: top`). No crops through text.
- **Moving screens.** Replace each static screenshot with a short silent loop (6 to 8s) of the real product being scrolled or used, recorded with Playwright from the live site or local build. WebM plus MP4, under 1.2 MB each, poster first, plays only while in view, pauses off screen. Reduced motion or Save-Data: poster only. Rydny approves each loop before it ships.
- **Sticky reading.** On desktop, while a project scrolls through, the media stays pinned and the text column scrolls past it. When the next project arrives, its media slides up over the previous one.
- **A big index number** per project in Fraunces, quiet (mist colour): 01, 02, 03.
- **The result is the payoff.** Problem and Fix stay as small labelled lines. Result is set larger (Fraunces, about 24px) so the outcome is what people remember.
- Image reveal: a clip-path wipe upward on enter, plus a slight parallax inside the frame (max 30px).
- The scroll-driven green steps from pass 5 section 6 run under each project.
- Phones: the swipe carousel from pass 5, with the same media loops.

## 4. Bugs seen in the recording

- **Desktop:** after the hero, a grey blurred strip about 50px tall stays visible under the nav at the top of Proof (the pinned hero showing through). Proof must fully cover the hero.
- **Nav:** still has a hairline under it on desktop and phones. Remove it (pass 5).
- **Cream to night:** About ends and contact starts with a hard horizontal edge, on both desktop and phones. Blend it as described in pass 5 section 8.
- **Tools line in About:** tiny uppercase is hard to read. Use 14px, sentence case, mist colour, separated by middle dots.
- **Contact on desktop:** too much empty space between the form, the links and "Still running". Tighten it to the rhythm of the rest of the page.
- **Mobile Altays flow:** the third step ("Send an enquiry") renders faded as if it never activated. Fix it with the new step sequence.

## 5. Speed

- Total Blocking Time is 270ms. Find the main-thread work on load (likely the hero wire build, cursor and scroll setup all at once) and defer anything not needed for the first screen until after load. Target under 150ms.
- Keep Performance at 95+ after adding the project loops (they load lazily, only near the viewport).

## 6. Phones

- The page line sits very close to the text on phones. On screens under 600px, hide the vertical page line and its droplet. Keep the section nodes as a small orange dot next to each section title instead.
- Everything else for phones is in pass 5 section 9 and pass 6.

## Report

Before and after recordings of a full scroll on desktop and phone, Lighthouse mobile numbers, and the three project loops for Rydny to approve.
