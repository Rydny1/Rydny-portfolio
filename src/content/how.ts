// "How it works" bullets per project slug: built with, the hard problem, how it solves it.
// Written only from each project's repo (see _brief/how-it-works-drafts.md).
export const how: Record<string, [string, string, string]> = {
  plateshare: [
    'A Node.js and Express bot using Twilio WhatsApp and a Supabase database, plus a Next.js and TypeScript dashboard for canteen staff.',
    'Many students can reply at once, but each meal can only go to one of them, and only before the closing time.',
    'A claim only succeeds if the post is still open in the database, so the first reply wins and everyone after is told it is taken. Replies after the deadline are refused with a clear message.',
  ],
  apex: [
    'Next.js and TypeScript, Supabase for data and sign-in, Claude for the written read of each match, and plain deterministic code for the maths.',
    'A likely winner is not the same as a good bet, because the bookmaker\u2019s margin eats most of the apparent advantage.',
    'The value gate strips the margin out of the odds and only makes a pick when its own probability beats the market\u2019s by a minimum edge (2%, or 3% for weaker picks). No edge, no pick.',
  ],
  altays: [
    'Next.js 15 and TypeScript, Tailwind, Framer Motion, a Zustand cart, and react-hook-form with zod for every form.',
    'The furniture is cut to order, so a plain add-to-cart shop is not enough. Customers also need to ask for custom pieces, upload a sketch, or request a stone sample.',
    'Separate validated forms for special requests, sketch uploads and sample requests, protected by a hidden honeypot field, a rate limit and an optional Turnstile check.',
  ],
};
