// All project data. To swap a screenshot, change `image` (files live in public/img).
// `video` stays null until Rydny approves the loop (loops live in _brief/report/loops until then).
export interface Project {
  slug: string;
  index: string;
  name: string;
  badge?: string; // ink badge with paper text
  badgeHref?: string; // the badge links here (proof of the win)
  label?: string; // plain small label when there is no badge
  problem: string;
  fix: string;
  result: string;
  flow: [string, string, string];
  links: { label: string; href: string }[];
  caption: string;
  tone: 'light' | 'dark'; // brightness of the screenshot, so the cursor leaf can adapt
  image: { src: string; width: number; height: number; alt: string };
  video: { webm: string; mp4: string } | null;
}

export const projects: Project[] = [
  {
    slug: 'plateshare',
    index: '01',
    name: 'PlateShare',
    badge: '1st place · Global Challenge Hackathon',
    badgeHref: 'https://github.com/Rydny1/PlateShare',
    problem: 'Campus canteens bin good food at closing. Students go hungry at 5 pm.',
    fix: 'One WhatsApp message from the canteen. Every student gets pinged. First reply claims the meal.',
    result: 'Won first place. The bot runs on a live database.',
    flow: ['Canteen posts', 'Students pinged', 'Meal claimed'],
    links: [{ label: 'GitHub', href: 'https://github.com/Rydny1/PlateShare' }],
    caption: 'github.com/Rydny1/PlateShare',
    tone: 'light',
    image: { src: 'plateshare', width: 1440, height: 900, alt: 'PlateShare dashboard showing active food offers and claim progress' },
    video: null,
  },
  {
    slug: 'apex',
    index: '02',
    name: 'APEX',
    label: 'Analysis engine',
    problem: 'Bookmakers misprice football matches. Spotting it by hand takes hours every week.',
    fix: 'An engine that prices every match on its own and flags where the bookmaker got it wrong.',
    result: 'Working engine with a live demo online.',
    flow: ['Odds in', 'Match priced', 'Mistakes flagged'],
    links: [
      { label: 'Live site', href: 'https://apex-ai-analysis.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/Rydny1/apex-ai-analysis' },
    ],
    caption: 'apex-ai-analysis.vercel.app',
    tone: 'dark',
    image: { src: 'apex', width: 1600, height: 1000, alt: 'APEX homepage: Football, priced before the market catches up' },
    video: null,
  },
  {
    slug: 'altays',
    index: '03',
    name: 'Altays',
    label: 'E-commerce rebuild, Dubai',
    problem: 'A Dubai marble furniture brand on a template WordPress site that undersold the product.',
    fix: 'Rebuilt from scratch in Next.js as a custom online store, designed around the stone.',
    result: 'Built and delivered to the client.',
    flow: ['Browse the stone', 'Pick a piece', 'Send an enquiry'],
    links: [], // No live link by instruction.
    caption: 'Client project, Dubai',
    tone: 'dark',
    image: { src: 'altays', width: 1200, height: 560, alt: 'Altays marble furniture online store homepage' },
    video: null,
  },
];
