# FINAL SPEC (the only spec)

This file replaces UPDATE_PASS_5, 6 and 7 (now in `_brief/archive/`, for history only, do not follow them). If anything else disagrees with this file or with the images in `_brief/target/`, this file and the images win.

## 1. The look: match the v5 images exactly

`_brief/target/` is the design. Match it section by section:
- `0-full-page.png`: overall flow and rhythm
- `1-hero.png`, `2-proof.png`, `3-what-i-fix.png`, `4-contact-and-footer.png`
- `mockup-source.html`: read the real values (sizes, weights, spacing, curve, pill styles) from it. Do not ship it.

Compare loop for every section: screenshot your build at 1440x900, put it side by side with the target, run a pixel diff (pixelmatch or odiff), list every difference, fix, repeat. Save the comparisons to `_brief/report/compare/`. Then check laptops (1536x695, 1366x657, 1280x601) and keep the same proportions.

What the images fix in place:
- Headlines vintage green #2E4636 ("Find the problem.", "Build the fix.", "Proof.", "What I fix.", "The short version."). Paper colour on night.
- Body text ink #1F2023. Project names ink.
- Green in small doses: AUTOMATE pill, hackathon badge, What I fix row hover.
- "Get in touch" is the CTA everywhere. Two hero facts only (End to end, 5+ products).
- Cream wall from the hero through About. No colour blocks mid-page.
- Contact and footer on night, reached by a smooth fade over about one screen of scrolling. No hard edge.
- Nav: blurred glass behind the logo and links only, no border, text sharp.

## 2. The one change from the images: the accent colour

The images use a bright orange. Replace it everywhere with:
- `--signal` **#E4572E** for the line, nodes, full stops and live dot.
- `--signal-fill` **#EA6236** (or the nearest value of the same hue that gives ink text at least 4.5:1) for the "Get in touch" and "Send it" buttons.

Tokens only, no hard-coded orange. That is the only visual difference from the images.

## 3. Behaviour (the images can't show this)

- **One travelling light** on the hero line: a 3px capsule about 28px long, core #E6EEF6 fading at both ends, 5.5s per trip, ease-in-out. The end node pulses once, then a 0.8s pause, then repeat. Pill dots flash as it passes.
- **Hero on scroll:** the wall, the line and the pills soften and fade together (opacity plus blur, scrubbed), and reverse when scrolling back up.
- **Page line with a droplet:** the vertical orange line down the page has a small teardrop at its tip (about 10x14px, soft glow) that trails the line by 80 to 120ms, merges into each section node with a small pulse, and ends in the "Still running" node.
- **Project steps on scroll:** under each project, step 1 turns green (scale 1.08) as the flow enters view, the light carries it to step 2, then step 3 by the time the project leaves. Done steps keep a green outline and a tick. Reverses on scroll up.
- **Animations replay every time** an element enters the viewport, in both directions. They start early (10 to 15% visible), last 0.4 to 0.7s, and jump to the end on fast scrolls. They never hold content back.
- **Leaf cursor** (fine pointers only): a small, minimal vintage-green leaf, multiply blend so text stays readable, trails with a light spring, tilts toward movement. It grows slightly over links and shows "View project" beside it (not on top) over project images. It switches to a light tone over night sections, uses the native caret in inputs, and is absent on touch devices and with reduced motion.
- **What I fix hover** as in `3-what-i-fix.png`. On touch, rows become tap-to-open accordions.
- **Reduced motion:** final states everywhere.

## 4. Projects: same layout, richer media

Keep the layout in `2-proof.png`. Inside it:
- Show the top of each site (`object-position: top`). No crops through words.
- Replace each screenshot with a short silent loop (6 to 8s) of the real product in use. WebM plus MP4, under 1.2 MB, poster first, plays only in view. Poster only on reduced motion or Save-Data. Rydny approves each loop.
- Images wipe open on enter.

## 5. Phones

Same design language, built for thumbs:
- Header: name left, two-line menu button right (opens a bottom sheet with big links, the Riga time and the email). After the hero, a floating "Get in touch" pill sits at the bottom, hidden while contact is on screen.
- Hero: "Find the problem." left, "Build the fix." right-aligned. The line runs from the full stop to just before the "B", with two pills (MAP, AUTOMATE), all at least 16px inside the edges. "Software and automation" stays full size. The time gets smaller and quieter ("Riga 00:45").
- Projects: a swipe carousel with snap, cards about 86% wide, flows stacked vertically.
- What I fix: accordion. Contact: one question per screen, with a progress line the light runs along.
- The vertical page line is hidden under 600px; section titles keep a small orange dot.
- Shorter motion (0.3 to 0.5s), tap feedback, no heavy blur, a 720p wall video under 1 MB.
- Test at 360x740, 375x667, 390x844, 393x852, 412x915 and 844x390.

## 6. Housekeeping

- Rewrite `CLAUDE.md` to describe this site and point to this file (the current one describes an old Mercedes-style direction).
- Fix: the grey strip under the nav at the top of Proof, the faded third Altays step on phones, the tiny tools line in About (14px, sentence case).
- Speed: Total Blocking Time under 150ms, Lighthouse mobile 95+ in all four categories.

## Report

Side-by-side target vs build for all four sections plus diffs, the old vs new orange, phone screenshots at 390x844 and 360x740, a scroll recording on desktop and phone, and a list of anything you changed on purpose, with the reason.
