# "How it works" drafts, for approval

Written only from the repos (code and READMEs). Not published: the toggle is built but `src/content/how.ts` is empty until you approve. Say "approved" or send edits.

## PlateShare (github.com/Rydny1/PlateShare)
1. **Built with:** a Node.js and Express bot using Twilio WhatsApp and a Supabase database, plus a Next.js and TypeScript dashboard for canteen staff.
2. **The hard problem:** many students can reply at once, but each meal can only go to one of them, and only before the closing time.
3. **How it solves it:** a claim only succeeds if the post is still open in the database, so the first reply wins and everyone after is told it is taken. Replies after the deadline are refused with a clear message.

Source notes: `api/index.js` (the claim update is filtered on `status = 'open'`; `isPastDeadline`), `api/schema.sql`, README. The README says the dashboard runs on sample data today and the bot is the part on a real database. The card's "Result" line says "The bot runs on a live database", which matches.

## APEX (github.com/Rydny1/apex-ai-analysis)
1. **Built with:** Next.js and TypeScript, Supabase for data and sign-in, Claude for the written read of each match, and plain deterministic code for the maths.
2. **The hard problem:** a likely winner is not the same as a good bet, because the bookmaker's margin eats most of the apparent advantage.
3. **How it solves it:** the "value gate" strips the margin out of the odds and only makes a pick when its own probability beats the market's by a minimum edge (2%, or 3% for weaker picks). No edge, no pick.

Source notes: `src/lib/engine/pipeline/s7-gate.ts` (MIN_EDGE_PCT 2.0, MIN_EDGE_PCT_LEAN 3.0, de-vig function), README.

## Altays (github.com/Rydny1/altays-trading, private repo)
1. **Built with:** Next.js 15 and TypeScript, Tailwind, Framer Motion, a Zustand cart, and react-hook-form with zod for every form.
2. **The hard problem:** the furniture is cut to order, so a plain add-to-cart shop is not enough. Customers also need to ask for custom pieces, upload a sketch, or request a stone sample.
3. **How it solves it:** separate validated forms for special requests, sketch uploads and sample requests, protected by a hidden honeypot field, a rate limit and an optional Turnstile check.

Source notes: `app/api/custom-request/route.ts`, `components/forms/*`, `lib/rate-limit.ts`, `lib/turnstile.ts`, README.

### Things to know about Altays before publishing
- The repo is **private**, so a recruiter cannot open it. That is why the card has no GitHub link.
- The repo README says it is a storefront you are "building", with **no payment gateway and no database** (orders and forms are validated and logged only). The card's Result says "Built and delivered to the client." Please confirm that line is accurate for what the client received.
