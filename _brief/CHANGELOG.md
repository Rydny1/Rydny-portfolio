# Changelog

One line per change, with why. Newest at the bottom.

- Section padding cut to clamp(72px, 12vh, 152px) (about 25% less); project, head and About gaps trimmed. Why: too much empty space between ideas.
- One CTA phrase everywhere: hero primary and nav say "Let's talk", hero link says "See the work", each project ends with "Want something like this? Let's talk." Why: one action, one phrase, more people reach out.
- About body replaced with the new three paragraphs; hackathon line removed (it stays on the PlateShare badge only). Why: tighter story, no repetition.
- Hero fits one screen on every device class (phones, tablets, desktops incl. ultrawide); 22 viewports are tested on every run. Why: hero must never overload or leave a gap.
- Mobile hero facts became a 3-column strip. Why: lets the hero fit one phone screen.
- Nav gets an outlined button; role and Riga time moved to a meta row below it (pattern from dennypratama.com). Why: both nav styles appear on the best reference sites.
- QuickList dropped from the "More" line (school project, repo not public). Why: Rydny's call.
- Mist colour darkened to #66625B. Why: brief value failed AA contrast (4.45:1).
- Hero wire built: smooth curve from the full stop to "Build", four step pills (two on phones), nodes at both ends. Route is computed from real text positions and rebuilt on resize. Why: brief signature element; never hard-coded.
- One light replaces three: a 28px by 3px capsule (core #E6EEF6, faint 6px glow), 5.5s ease-in-out trip, end node pulses once (scale 1 to 1.6, 0.6s), 0.8s pause, repeat. Pill dots flash blue-grey for 0.3s as it passes. Why: each trip reads as one job done. Two-light variant: add ?lights=2 to the URL.
- Hero load sequence runs once per session; every duration and delay is base x 1.18 (one variable, --k). Pure CSS so nothing can stay hidden if JS fails. Why: 15% slower, per request.
- Wire on phones ends above the "B" instead of beside it. Why: the side approach cut through the letter.
- Pills sit at fixed fractions of the curve instead of mockup coordinates. Why: at 1440 the "Build" line starts left of the full stop, unlike the mockup, so mapped pills hit the text.
- Contact is now a letter: inline underlined blanks that grow as you type (native field-sizing, mirror fallback), choice pills as a real radio group in a fieldset, orange underline draws in on focus, visually hidden labels, errors in a role=alert region, full keyboard use. Why: brief item 6.
- Submit: on success the orange line draws from the button to an end node, the blue-grey light travels it, the form is replaced by the "Sent" message. Reduced motion skips straight to the message.
- /api/contact (Vercel function, Web Request/Response signature): server validation, honeypot (looks like success, delivers nothing), 3s minimum fill time, 5 per hour per IP, origin check, 6 KB body cap. Stub only: it logs the message to the Vercel function logs. No email service added. Why: ship-safe, and waiting on Rydny's OK for delivery.
- Contact and footer sit on night (#17181A) with paper text. Why: evening light, per brief.
- Buttons: ink fill wipes in from the left on hover, arrow slides in, magnetic up to 6px (hero and Send it).
- Hero is now pinned (sticky) and the page slides over it like a curtain. As it does, the wall blurs (a pre-blurred image fades in, so only opacity changes) and the hero type fades out. Paper sections are 92% opaque so the blurred wall drifts faintly behind. Why: Rydny asked for a sticky hero with a little blur; matches the brief's "you never leave the room".
- Nav is fixed and persistent: glass bar appears after scrolling, switches to paper text over the dark contact section, nav words roll up on hover. "Let's talk" is always one tap away. Why: main goal is people reaching out.
- Glass cursor on fine pointers (clear ring with backdrop blur, grows over links, shows "View" over project images). Native cursor is kept over form fields and hidden only once the script runs. Why: Rydny's request after studying dennypratama.com. This widens the brief's "custom cursor only over projects" rule; easy to narrow.
- Project screenshots link to the live site (or GitHub) with a slow zoom to 1.04 on hover. Why: the image is the first thing people click.
- Page wire: one orange line down the left of the page, drawn by scroll, with a node per section that lights at 55% of the screen. It ends at a live node beside "Still running". Why: brief's workflow line, and it makes the footer earn its place.
- Reveals: sections fade and rise as they arrive, mini flows draw step by step (0.9s, once), portrait drifts up to 24px, footer name rises letter by letter. All start from a hidden frame only when the element enters view, so a full-page screenshot or failed script can never leave content blank. Why: brief's progressive-enhancement rule.
- Footer name sized to the container (min(14.2vw, 206px)); a test now checks it never clips. Why: it was clipping at 1440.

## Update passes 5 and 6 (22 Nov 2026)
- CLAUDE.md rewritten: concept "the room", the current palette, type, stack, and the rules that still apply. Why: the old file described a 3D, Clash Display, GitHub Pages site that no longer exists.
- Accent moved to a deeper red-orange: `--signal` #E4572E (3.05:1 on cream, passes the 3:1 graphics rule; old orange was 2.58:1), `--signal-fill` #EA6236 for the button (ink text 4.88:1). Hard-coded oranges in the contact success animation now use the tokens. Why: pass 6, more vintage next to the green and cream.
- Added `--green` #2E4636 and `--glass-deep` #A9BDD1 tokens.
- Every "Let's talk" is now "Get in touch" (nav, hero, after each project). Contact title is "Get in touch." with a new lead. "Remote" fact removed. Section titles carry an orange full stop (Proof, What I fix, The short version, Get in touch). Why: pass 5 copy; I added the stop to About too for consistency.
- Removed the hairline under the nav bar (blur only).
- Orange blob behind the nav in the footer was a page-wire node glowing through the glass. Nodes now fade out when they are within 96px of the top.
- The light's glow is now blue-grey (#A9BDD1) instead of near white, and the light passes underneath the pills so it no longer washes out the labels.
- Headlines are now vintage green (#2E4636): hero "Find the problem." and "Build the fix.", and the section titles Proof, What I fix, The short version. Full stops stay orange. Contact and footer titles stay paper on night. Why: Rydny's picture shows green headlines; the written pass said ink-black and green only as small accents, so I had followed the text instead of the picture. The picture wins.
- Soft sage tint over the wall (hero) and in the cream sections (#EAE8DE at 92%). Why: the picture and pass 6 describe "faded vintage green and cream".
- Nav is now thin (about 56px bar) with a progressive blur: strongest at the top, fading to clear in the lower third, light tint so content stays visible behind it. The glass sits behind the logo, links and button (z-index -1) so the text is never blurred. Why: Rydny's request; the first version put the blur layer in front of the text.
- Leaf cursor reads the colour under it: vintage green over bright areas, light grey-white (no multiply) over dark ones (night sections, dark screenshots, ink buttons). Outline solid 1.5px, inside faded (30%), 2x on links. Why: Rydny's feedback.
- Pass 7: replaying reveals (one observer, both directions, jump to final on fast scroll), droplet on the page line, Proof rebuilt as an exhibit (8/12 pinned media, big index, large result, vertical scroll-driven green flow, wipe plus 30px parallax), mobile carousel with progress line, anchor scroll lands flush so the pinned hero never peeks above a section, phones hide the page line and show section dots, About tools line 14px sentence case.
- Pass 6 phones: two-line menu button with a bottom-sheet menu, floating "Get in touch" pill after the hero (hidden over contact), contact stepper (one question per screen with progress line and light), meta row 12px without GMT, 24px side padding so nodes stay 16px+ from edges, hero line re-routed inside the safe area, flows vertical, 720p wall video (806 KB MP4) for phones, poster only on Save-Data or slow networks.
- Altays image is shown whole (not cropped) because its domain no longer resolves and the only source is 2.14:1. APEX still re-captured from the live site (top of page, 16:10). Loop for APEX built from real frames (700 KB MP4) in _brief/report/loops, not shipped until approved.

## Content pass (last)
- About quote now "An hour lost at a bottleneck is an hour lost for the entire system." (Eliyahu M. Goldratt, The Goal). Replaces Marcus Aurelius; the Drucker and Gerber versions were superseded by Rydny's correction.
- Availability line "Open to freelance projects, internships and part-time roles." added as the last sentence of the About text and under the contact lead, so visitors can tell what Rydny is open to.
- Contact lead replaced with "Tell me what you're trying to solve. You'll get a straight answer on what to build, what to automate, and whether I'm the right person for it." Lead column widened to 36ch to fit it.
- Removed the "More:" line under Proof (Steady, African Grill). African Grill's link returns 404, and Rydny asked to drop the whole line.
- PlateShare badge now reads "1st place · Global Challenge Hackathon" and links to the repo (README says "Winner, Global Challenge hackathon").
- Built the closed "How it works" toggle on project cards (smooth grid-rows open, keyboard accessible, aria-expanded, reduced-motion safe). It stays hidden until `src/content/how.ts` is filled; drafts are in `_brief/how-it-works-drafts.md`, awaiting approval.
- Footer is now just "© 2026 Rydny Ihims" (removed "Built by hand in Riga"). Removed "internships" from the availability line (copy.ts, README). What I fix lead gains "Each one gives time and money back." so the page states the outcome, not only the method. "How it works" toggles are now published on all three cards using the approved drafts.

## Three bug fixes
- Email is now a copy button (new CopyEmail component, used in the contact section and the mobile menu; the footer has no email). Click, Enter or Space copies, a "Copied" label shows 1.5s then fades, screen readers hear "Email copied", a separate "or open in email app" mailto link sits under it, and if the clipboard API fails the text is selected as a fallback.
- Project counter read "04 / 03" on the last card. The total now comes from the projects data (`data-total`), progress is clamped to 0..1 and the index to 1..total, and it recalculates on resize. Verified 01, 02, 03 / 03 when swiping to the end, overscrolling and resizing.
- "How it works" opened every card visually because phone cards stretched to the tallest card. The rail now uses `align-items: flex-start`, so each card keeps its own height (open card 1241px, others 818 and 717 on a phone; aria-expanded is true only on the clicked card).

## Phone fit, animations on real phones, scroll smoothness
- Phone hero is exactly one screen (`height: 100vh` then `100svh`). Padding, headline size, copy, button and gaps use rem and svh clamps, so they scale with the screen; the hard minimums (430px headline block, 128px gap, 104px top padding, 52px button) that pushed it past one screen are gone. On screens shorter than 600px the two supporting facts are hidden, under 440px (landscape) the lead too. Checked 320x568 up to 430x800, landscape 800x360 and 667x375, tablet 768x1024: hero height equals the viewport, nothing cut off, no sideways scroll.
- Zero animation on real phones: the site switched every animation off when the browser reports "reduce motion". Android turns that on with Remove animations and battery saver, while desktop phone emulation never does. Reduced motion now means calm, not none: reveals play as plain fades, the hero load-in and the orange line and light still run. Parallax, drifting titles, the cursor and background video stay off.
- Scroll stutter: removed the live backdrop blur on the phone nav (a masked backdrop blur is a common Android stutter cause), the per-frame blur on the hero line on phones, and the blended, endlessly drifting overlay on the portrait on phones.

## Hero intro plays every time, and the stutter cause
- The hero opening (headline, line drawing, pills, light) was set to play once per browser session, which is why a refresh showed it plain. It now plays on every load, and again whenever you scroll back up to the top (it restarts the running CSS animations and the light).
- Main cause of the stutter: the travelling light asked the SVG for three points on the path every frame. On a throttled mid-range phone that was the single biggest cost (about 1.5 s over one scroll). The path is now sampled once per layout into a lookup table. Measured at 4x CPU slowdown on a phone-size screen: median frame 42 ms to 18 ms, frames slower than 34 ms 109 to 3.

## Contact: email as a copy pill
- Email moved from the small faded line after the Send button to a prominent pill under the contact lead, with a copy icon that turns into a tick when copied. Why: on phones the old line was easy to miss; the email is now the first thing you can act on.
