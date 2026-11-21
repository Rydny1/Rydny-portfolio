// All project data. To swap a screenshot, change `image` (files live in public/img).
export interface Project {
  slug: string;
  name: string;
  badge?: string; // ink badge with paper text
  label?: string; // plain small label when there is no badge
  problem: string;
  fix: string;
  result: string;
  flow: [string, string, string];
  links: { label: string; href: string }[];
  image: { src: string; width: number; height: number; alt: string; position: string };
}

export const projects: Project[] = [
  {
    slug: 'plateshare',
    name: 'PlateShare',
    badge: '1st place · Global Challenge Hackathon',
    problem: 'Campus canteens bin good food at closing. Students go hungry at 5 pm.',
    fix: 'One WhatsApp message from the canteen. Every student gets pinged. First reply claims the meal. Nothing to install.',
    result: 'Won first place. The bot runs on a live database.',
    flow: ['Canteen posts', 'Students pinged', 'Meal claimed'],
    links: [{ label: 'GitHub', href: 'https://github.com/Rydny1/PlateShare' }],
    image: { src: 'plateshare', width: 1440, height: 900, alt: 'PlateShare dashboard showing active food offers and claim progress', position: 'left top' },
  },
  {
    slug: 'apex',
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
    image: { src: 'apex', width: 1200, height: 559, alt: 'APEX homepage: Football, priced before the market catches up', position: 'left center' },
  },
  {
    slug: 'altays',
    name: 'Altays',
    label: 'E-commerce rebuild, Dubai',
    problem: 'A Dubai marble furniture brand on a template WordPress site that undersold the product.',
    fix: 'Rebuilt from scratch in Next.js as a custom online store, designed around the stone.',
    result: 'Built and delivered to the client.',
    flow: ['Browse the stone', 'Pick a piece', 'Send an enquiry'],
    links: [], // No live link by instruction.
    image: { src: 'altays', width: 1200, height: 560, alt: 'Altays marble furniture online store homepage', position: 'center' },
  },
];
