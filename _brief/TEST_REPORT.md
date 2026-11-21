# Test report

## Gate 1: Structure (21 Nov 2026)

Run with `npm run build && npm run test:gate`. Screenshots land in `_brief/shots/`.

| # | Test | Result |
|---|---|---|
| 1 | `astro check` (strict TS) | Pass, 0 errors, 0 warnings, 0 hints |
| 2 | Build | Pass, 0 warnings |
| 4 | axe-core (wcag2a, 2aa, 21aa, best-practice), desktop | Pass, 0 violations |
| 5 | html-validate on index and 404 | Pass |
| 6 | Internal anchors and 6 external links | Pass (200) |
| 7 | Bundle size | JS 0.9 KB inline, CSS about 12 KB. Budgets 60 KB and 25 KB |
| 8 | No horizontal overflow at 360, 390, 768, 1024, 1280, 1440, 1920. No console errors | Pass |
| 9 | JavaScript disabled, all copy visible | Pass (33 strings) |
| 10 | Reduced motion: video not playing | Pass |
| 15 | Video plays on screen, pauses off screen | Pass |
|   | No em or en dashes in rendered page | Pass |

Not run yet (later gates): Lighthouse (3), WebKit and Firefox scroll (12), perf trace (13), keyboard walk (14), OG preview (16), device checklist (17).

### Found and fixed
- Mobile overflow at 360px: project grid item grew to its content. Fixed with `minmax(0, 1fr)` and wrapping flow pills.
- Contrast: brief's `mist` #6E6A63 measures 4.45:1 on paper, just under AA. Changed to #66625B (about 5:1).
- Hero H1 at 12vw overflowed. Used 7.4vw (max 128px), which matches the approved mockup.
- GitHub link `Rydny1/quicklist` returns 404.

### Open questions for Rydny
1. QuickList repo is not public at `github.com/Rydny1/quicklist`. Link currently points at your GitHub profile. Make the repo public, or give the right URL?
2. Steady now links to `github.com/Rydny1/steady-fitness` (the only public match). Correct?
3. Brief gives the hero H1 two sizes (12vw and 6.8vw). I used 7.4vw to match the mockup. OK?
4. Mist colour tweak above. OK?
5. Nav: hero spec lists "Contact" as a link, copy rules also want a "Get in touch" outline nav button. Currently the link row only. Which one?
6. Vercel project not created yet, so SITE_URL in `src/config.ts` is a placeholder. Confirm I may create the free Vercel project for Gate 5.
7. Only 1003x1254 of the portrait exists, so 1440w crop was skipped (would be upscaled).

### Rubric (self-score, structure only, so Design is not judged yet)
Design n/a, Usability 8, Creativity n/a (no wire yet), Content 9. Weakest: no wire, no day-light overlays, APEX and Altays screenshots have a dark band inside the frame.
