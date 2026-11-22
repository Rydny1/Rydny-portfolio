// All page copy lives here. Do not edit wording without Rydny's OK. No em or en dashes.
export const copy = {
  meta: {
    title: 'Rydny Ihims | Software and Automation, Riga',
    description:
      "Rydny Ihims builds software, web apps and automations that take manual work off people's desks. Based in Riga. See the proof.",
  },
  nav: {
    name: 'Rydny Ihims',
    role: 'Software and automation',
    links: [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: { label: 'Get in touch', href: '#contact' },
    city: 'Riga',
    skip: 'Skip to content',
  },
  hero: {
    line1: 'Find the problem',
    line2: 'Build the fix.',
    lead: 'I turn slow, manual processes into software and automations that run on their own.',
    primary: { label: 'Get in touch', href: '#contact' },
    secondary: { label: 'See the work', href: '#work' },
    facts: [
      { title: 'End to end', text: 'Idea, design, build, launch' },
      { title: '5+ products', text: 'Built from zero' },
    ],
    steps: ['MAP', 'DESIGN', 'AUTOMATE', 'TEST'],
  },
  proof: {
    title: 'Proof',
    lead: 'Three problems. Three working fixes.',
    labels: { problem: 'Problem', fix: 'Fix', result: 'Result' },
    ask: { text: 'Want something like this?', label: 'Get in touch', href: '#contact' },
    more: {
      prefix: 'More:',
      items: [
        { label: 'Steady (fitness app)', href: 'https://github.com/Rydny1/steady-fitness' },
        // QuickList (school project, repo not public) left out on purpose, per Rydny.
      ],
    },
  },
  fix: {
    title: 'What I fix',
    lead: 'Most work starts with one of these.',
    rows: [
      {
        n: '01',
        title: 'Manual processes',
        text: 'Data entry, follow-ups, reports, handovers. Automated end to end.',
      },
      {
        n: '02',
        title: 'Websites and web apps',
        text: 'Fast, sharp, and built for one job: getting the visitor to act.',
      },
      {
        n: '03',
        title: 'The problem behind the problem',
        text: 'I map where the time and money go first. Sometimes the fix is a better process.',
      },
    ],
  },
  about: {
    title: 'The short version',
    caption: 'Rydny Ihims, Riga 2026',
    alt: 'Portrait of Rydny Ihims',
    paragraphs: [
      "I'm Rydny. I build software and automations for people whose work has outgrown doing it by hand.",
      'I start by finding where the time goes. Then I design the fix, build it, and stay with it until it runs on its own.',
      'I grew up in Cameroon, lived in Dubai, and now study Computer Science at the University of Latvia in Riga. I work in English and French, and I enter hackathons whenever I can.',
    ],
    quote: { text: 'What stands in the way becomes the way.', cite: 'Marcus Aurelius, Meditations' },
    tools: ['React', 'Next.js', 'TypeScript', 'Python', 'Laravel', 'MySQL', 'n8n', 'REST APIs'],
  },
  contact: {
    title: 'Get in touch',
    lead: 'Hiring, building something new, or making what you have better. Send a note and you get a straight answer.',
    form: {
      hi: "Hi Rydny, I'm",
      from: 'from',
      like: "I'd like to",
      short: 'The short version:',
      reach: 'Reach me at',
      nameLabel: 'Your name',
      companyLabel: 'Company, optional',
      emailLabel: 'Your email address',
      namePh: 'your name',
      companyPh: 'company',
      messagePh: 'one or two lines',
      emailPh: 'email',
      choices: ['Build something new', 'Improve what I have', 'Hire you', 'Just say hi'],
      submit: 'Send it',
      sent: "Sent. I'll get back to you within 2 working days.",
      prefer: 'or email',
    },
    email: 'rydny01@gmail.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/Rydny1' },
      { label: 'LinkedIn', href: 'https://linkedin.com/in/rydny-ihims' },
    ],
    // Set to the PDF path once Rydny supplies it; the link stays hidden while null.
    cv: null as string | null,
    cvLabel: 'Download CV',
    status: 'Still running',
    footer: '© 2026 Rydny Ihims. Built by hand in Riga.',
  },
  notFound: { title: 'Wrong room.', link: 'Back to the front door' },
} as const;
