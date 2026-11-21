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
