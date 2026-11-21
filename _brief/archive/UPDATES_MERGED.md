# Updates merged: passes 5, 6, 7 and the leaf feedback

One resolved list. Where the passes disagree, the later one wins, and the decision is written down. Status is kept current as the work goes. Source files: `UPDATE_PASS_5.md`, `UPDATE_PASS_6.md`, `UPDATE_PASS_7.md`, plus Rydny's leaf feedback in chat.

## Decisions on conflicts

| Topic | Decision | Why |
|---|---|---|
| Animations play once (pass 5 s10) vs replay (pass 7 s1) | **Replay every time the element enters, both directions.** One observer for everything. Reduced motion: final states. | Pass 7 is later and explicit. |
| Menu button text "Menu" (pass 5 s9) vs two thin lines (pass 6 s2) | **Two thin ink lines, 44x44, aria-label "Menu".** Opens the bottom sheet. | Pass 6 is later. |
| Mobile CTA (pass 5) | Floating "Get in touch" pill after the hero, hidden over contact. No "Get in touch" in the mobile header. | Pass 6 s2. |
| Cursor ring (pass 4) vs leaf (pass 5 s5) vs leaf feedback | **Leaf, ~20px, solid 1.5px green outline, faded green inside (30%), 2x on links, "View project" label beside it over project images.** Multiply blend. Touch and reduced motion: none. | Rydny's feedback: outline solid and visible, inside transparent, enlarges on hover. |
| Project flow horizontal (mockup) vs vertical on phones (pass 6 s4) | **Vertical on every screen.** On desktop the text column is only 4 of 12 columns, three pills do not fit on one line. | Same component, same scroll sequence everywhere. |
| Proof layout (pass 7 s3) vs carousel (pass 5 s9) | Desktop: exhibit with 8-col pinned media. Phones: swipe carousel, same media. | Each pass covers a different breakpoint. |
| Page line on phones (pass 7 s6) | Under 600px: hide the vertical line and droplet; small orange dot next to each section title. | Pass 7. |
| Hero line on scroll (pass 5 s4) | Fades and blurs to 0 over 0 to 60% of the hero, one SVG element. | Pass 5. |
| What I fix title colour (reference image shows green) | Ink with orange full stop; green only on row hover. | Pass 5 text beats the screenshot. |

## Work list

### A. Foundations
- [x] CLAUDE.md rewritten (p5 s0)
- [x] Accent `--signal` #E4572E, `--signal-fill` #EA6236 (4.88:1 with ink), tokens only (p6 s1)
- [x] "Get in touch" everywhere, "Remote" fact removed, orange full stops on titles, new contact lead (p5 s2)
- [x] Nav hairline removed (p5 s3, p7 s4)
- [x] Orange blob behind nav fixed (page-wire nodes fade under the nav) (p5 s3)
- [x] Light glow blue-grey, passes under the pills (p5 s3)
- [x] Hero fits 1536x695, 1366x657, 1280x601, 1440x789, 1920x969, 1280x720, 2560x1271 (p5 s1)
- [x] 8px scale audit and fixes (p5 s1)
- [x] Hero line and pills fade and blur on scroll (p5 s4)
- [x] Leaf cursor (p5 s5), tuned to the feedback

### B. Proof (p5 s6, p6 s4, p7 s3)
- [ ] Big media 8/12 columns, 16:10, hairline frame, caption, top of site shown, no crop through text
- [ ] Pinned media, text scrolls past; next project slides over
- [ ] Big quiet index 01, 02, 03; Result set large (Fraunces ~24px)
- [ ] Vertical flow with scroll-driven green steps and the light (p5 s6)
- [ ] Image wipe (clip-path) plus 30px inner parallax
- [ ] Loops pipeline: WebM + MP4, poster first, in view only. Loops stay in `_brief/report/loops/` until Rydny approves each one
- [ ] Phones: swipe carousel, 86% cards, orange progress line

### C. What I fix (p5 s7)
- [ ] Big rows, index, 64px Fraunces titles, round arrow, hairlines
- [ ] Hover: green title slides 24px, orange full stop, description fades in, arrow fills ink
- [ ] Touch: accordion

### D. Contact and footer (p5 s8, p7 s4)
- [ ] Layout per reference: big title left, lead right, hairline, letter, footer row
- [ ] Cream to night blended, no hard edge (scrubbed)
- [ ] Faint leaf shadows keep drifting on the night background
- [ ] Tighten spacing between form, links and "Still running"
- [ ] About tools line: 14px, sentence case, mist, middle dots

### E. Motion system (p5 s10, p7 s1, s2, s5)
- [ ] One observer system; replay both directions; start at 10 to 15% visible; 0.4 to 0.7s; jump to final if scrolled fast
- [ ] Titles rise from behind a mask; orange full stop pops last
- [ ] Page line droplet with spring lag, merges into nodes, lands in "Still running"
- [ ] Pinned hero fully covered by Proof (grey strip bug)
- [ ] Total Blocking Time under 150 ms: defer non-critical setup past load

### F. Phones (p5 s9, p6 s2 to s5, p7 s6)
- [ ] Two-line menu button, bottom-sheet menu (links, Riga time, email), swipe or tap outside to close
- [ ] Floating "Get in touch" pill after the hero, hidden over contact
- [ ] Hero: node and pills at least 16px from every edge; meta row 12px, "Riga 00:45", 24px gap; line ends on a clear node above-left of the "B"
- [ ] What I fix accordion; About portrait with leaf shadows; contact stepper (one question per screen)
- [ ] Solid tinted bar instead of backdrop blur; tap feedback; shorter motion
- [ ] Mobile wall video (720p under 1 MB); poster only on Save-Data or slow connections
- [ ] Every section tuned at 360, 375, 390, 412

### G. Proof of work
- [ ] All gate tests pass plus phone sizes; throttled mid-range Android profile at 60fps
- [ ] Lighthouse mobile: Performance 95+, A11y, Best Practices, SEO 100
- [ ] Report: before and after at 1536x695, 1440x789, 390x844, 360x740; old and new accent; recordings (hero line, leaf cursor, flows, phone stepper, full scroll desktop and phone); Lighthouse numbers; the project loops for approval; top 3 ideas

## Cleaned up
Deleted generated screenshots (`_brief/shots`), the earlier pass's report media, and two scripts superseded by `scripts/pass-shots.mjs`. Not touched: `.aider.*` files in the project root (old tool history from August, not mine, safe to delete if you want), `_brief/references`, `_brief/old-assets`.
