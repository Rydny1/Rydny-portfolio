# Test report

Run everything with `npm run build && npm run test:gate`. Screenshots land in `_brief/shots/`.

## Update pass (22 Nov 2026): 68 of 68 automated checks pass

| Area | Checks | Result |
|---|---|---|
| Type check (`astro check`, strict) and build | 0 errors, 0 warnings, 0 hints | Pass |
| axe-core (wcag2a, 2aa, 21aa, best-practice) on the full page including the form and night section | 0 violations | Pass |
| html-validate on index and 404 | 0 errors | Pass |
| Links: internal anchors and external | all resolve, all 200 | Pass |
| JavaScript disabled: every copy line visible | 33 strings | Pass |
| No em or en dashes in rendered page | none | Pass |
| Hero fits first screen, nothing clipped or overlapping, no overflow | 22 viewports: phones 360 to 430, landscape phones, tablets, laptops 1280 to 1536, 1680, 1920, 2560, ultrawide 3440 | Pass |
| No horizontal overflow, no console errors, footer name not clipped | 360, 390, 768, 1024, 1280, 1440, 1920 | Pass |
| Hero wire: pills built (4 desktop, 2 phone), light moves, no script errors | desktop and phone | Pass |
| Light smoothness | frame gaps p95 16.7 ms, max 16.8 ms (steady 60 fps) | Pass |
| Pinned hero, fixed nav, page wire (5 nodes), scroll blur, night nav, all nodes lit at end | 1440 | Pass |
| Contact form: empty submit error + aria-invalid + focus, role=alert, keyboard-only fill and submit, success state, payload | Chromium | Pass |
| API: valid, honeypot, too fast, bad email, bad choice, long message, foreign origin, oversize, bad JSON, rate limit (6th is 429) | handler imported directly | Pass |
| Reduced motion: video not playing | | Pass |
| Video plays on screen, pauses when scrolled away | | Pass |
| Bundle (raw): JS 16.8 KB, CSS 24.1 KB | budgets 60 KB and 25 KB | Pass (CSS close to the limit) |

Live: https://rydny-portfolio.vercel.app (Vercel project `rydny-portfolio`, GitHub linked, branch `revamp`).

### Not run yet
- Lighthouse mobile and desktop (budgets: Perf 95+, others 100, LCP under 2.0s, CLS under 0.05). Needs a run on the Vercel URL.
- WebKit and Firefox scroll runs, long-task trace, OG card preview, real-device checklist.
- Keyboard walk beyond the form (skip link, nav, focus ring on every control) is partly covered by axe but not scripted.
- The contact API runs as a stub (logs only). It has not been exercised on Vercel itself yet.

### Known limits
- Rate limit is per function instance (in memory). Exact limiting needs a shared store (Upstash or Vercel KV): needs your OK.
- Cursor and magnetic buttons are mouse only. Touch devices get none of it, by design.
- Page wire x position uses the content column; on very narrow phones it sits 10px from the edge.

### Real-device checklist (for you)
1. iPhone Safari and an Android phone: hero fits one screen, S-curve readable, light moves, wall video autoplays.
2. Tap targets 44px or larger: nav button, "Let's talk", pills, Send it.
3. Form: type with the on-screen keyboard, check the blanks grow and the page does not jump.
4. Scroll feel: pinned hero, blur, page wire.
