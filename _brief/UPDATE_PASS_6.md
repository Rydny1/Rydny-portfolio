# Update pass 6: mobile polish and accent colour

Do this after UPDATE_PASS_5.md (or merge it into the same pass if you are mid-way). Same rules: screenshot before and after, check your own work, log every change in `_brief/CHANGELOG.md`.

Reference screenshots in `_brief/references/`: `mobile-hero-current.png` and `mobile-project-current.png` (phone view as of 22 Nov 2026).

## 1. Accent colour: a deeper red-orange

The bright orange (#FF5A1F) reads slightly neon next to the faded vintage green and cream. Move it a step redder and deeper, towards persimmon. It feels more vintage, pairs better with the green, and is more visible on cream.

- `--signal` (line, nodes, light trail, full stops, live dot, focus underline): **#E4572E**. It reaches 3.05:1 on cream (passes the 3:1 rule for graphics; the old orange only reached 2.58:1).
- `--signal-fill` (primary button fill, with ink text on top): **#EA6236** or the nearest value of the same hue that gives ink text at least 4.5:1. Check with a contrast tool and log the final hex.
- Replace every hard-coded orange. Tokens only.
- Re-check the hero, the full stops and the buttons side by side, old against new, and include both in the report.

## 2. Mobile header

- Remove "Let's talk" from the mobile header. Top right gets a **menu button**: two thin ink lines (no circle, no box), 44x44 tap area, `aria-label="Menu"`. It opens the bottom-sheet menu from pass 5 section 9.
- The call to action moves to the floating "Get in touch" pill at the bottom (pass 5, section 9), shown after the hero.

## 3. Mobile hero fixes (see `mobile-hero-current.png`)

- **The orange node is cut off at the right edge** (about one third of the way down). Every node, pill and the light must stay inside the safe area: at least 16px from every edge. Re-route the curve if needed.
- **The meta row crowds:** "Software and automation" and "Riga 00:45 GMT+2" nearly touch. On phones, drop it to 12px, show the time as "Riga 00:45" (no GMT), and keep at least 24px between them.
- With "Remote" removed (pass 5), the facts become two columns with room to breathe.
- The headline size is right. Do not change it.
- The line currently stops above "Build" with a loose tail. Make it land on a clear end node, just above and to the left of the "B", lined up with the text's left edge.

## 4. Mobile project cards (see `mobile-project-current.png`)

- The three flow pills wrap onto two lines and squeeze the line between them to a few pixels. On phones, show the flow **vertically**: three steps stacked, joined by a short vertical orange line, each label on one line. The scroll-driven green step sequence (pass 5, section 6) runs top to bottom.
- Tighten the Problem / Fix / Result spacing so one card fits in about one and a half screens.
- These cards then live inside the swipe carousel from pass 5.

## 5. Your job: find the balance

Phones decide the first impression for most visitors. Go through every section at 360, 375, 390 and 412 wide and tune it yourself: font sizes, line heights, spacing, what to show and what to hide. Rules:
- Big type stays big. Small type gets smaller and quieter rather than wrapping awkwardly.
- If something doesn't earn its space on a phone, hide it on phones and log why.
- Nothing touches the edges (16px minimum). Nothing collides.
- It must feel as premium as the desktop hero. Calm, spacious, deliberate.

Report: phone screenshots of every section at 390x844 and 360x740, before and after, plus the old and new accent comparison.
