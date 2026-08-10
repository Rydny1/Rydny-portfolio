import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { withBase } from '../../lib/base';
import './WorkGrid.css';

const EASE = [0.22, 0.61, 0.36, 1] as const;

type Project = {
  title: string;
  image: string;
  oneLiner: string;
  longDesc: string;
  tags: string[];
  accentTag?: string;
  live?: string;
  github?: string;
  placeholder?: boolean;
};

const PROJECTS: Project[] = [
  {
    title: 'APEX: an AI that finds mispriced bets',
    image: withBase('/assets/APEX_hompage.webp'),
    oneLiner: 'Bookmakers set odds on football matches. Sometimes they get the price wrong.',
    longDesc:
      'APEX reads the data, runs the math, and stays quiet until it finds a real mistake in the price. No hunches, no tips. When it flags something, the numbers back it up. It tracks its own record so there is nothing to hide behind. Built on the Claude API, hosted on Vercel. Currently turning it into a web app where you log in, press one button, and get today\'s picks.',
    tags: ['Claude API', 'Next.js', 'Vercel'],
    accentTag: 'Claude API',
    live: 'https://apex-ai-analysis.vercel.app',
    github: 'https://github.com/Rydny1/apex-ai-analysis',
  },
  {
    title: 'ALTAYS: a luxury stone and furniture store, rebuilt',
    image: withBase('/assets/ALTAYS_heroimg.webp'),
    oneLiner: 'Altays sells marble dining sets and custom furniture out of Dubai.',
    longDesc:
      'Their old site was slow and looked like a template. I rebuilt it into something that feels like the product: heavy, warm, and expensive in the right way. Real stone photography instead of stock images. Custom fonts. A layout that breathes. Fast on a phone. Cart and checkout built in, ready for payments. The kind of site where the design earns the price tag.',
    tags: ['React', 'E-commerce', 'Dubai'],
    accentTag: 'React',
    live: 'https://altaystradingllc.com',
  },
  {
    title: 'Eclat',
    image: withBase('/assets/Eclat_heroimg.webp'),
    oneLiner: 'A cosmetics client site. Full details coming soon.',
    longDesc: 'Details coming soon.',
    tags: ['Web'],
    placeholder: true,
  },
];

export default function WorkGrid() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="work-grid">
      {PROJECTS.map((project, i) => {
        const expanded = expandedIndex === i;
        const dimmed = expandedIndex !== null && !expanded;
        const peerFaded = expandedIndex === null && hoveredIndex !== null && hoveredIndex !== i;
        return (
          <motion.article
            key={project.title}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`work-card${dimmed ? ' work-card--dimmed' : ''}${peerFaded ? ' work-card--peer-faded' : ''}`}
            transition={{ layout: { duration: 0.5, ease: EASE }, opacity: { duration: 0.8, ease: EASE }, scale: { duration: 0.25, ease: EASE } }}
            whileHover={expandedIndex === null ? { scale: 1.02 } : undefined}
            onHoverStart={() => setHoveredIndex(i)}
            onHoverEnd={() => setHoveredIndex(null)}
            style={{ transformOrigin: 'center' }}>
            <motion.div layout="position" className="work-card__media">
              <div className="work-card__chrome" aria-hidden="true">
                <span className="work-card__dot" />
                <span className="work-card__dot" />
                <span className="work-card__dot" />
                <span className="work-card__url" />
              </div>
              <img src={project.image} alt={`${project.title} screenshot`} loading="lazy" />
            </motion.div>

            <motion.div layout="position" className="work-card__body">
              <h3 className="work-card__title">{project.title}</h3>
              <p className="work-card__desc">{project.oneLiner}</p>

              <div className="work-card__tags">
                {project.tags.map((tag) => (
                  <span key={tag} className={`tag${tag === project.accentTag ? ' tag--accent' : ''}`}>
                    {tag}
                  </span>
                ))}
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.p
                    className="work-card__long"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}>
                    {project.longDesc}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="work-card__actions">
                {!project.placeholder && (
                  <button
                    type="button"
                    className="work-card__readmore"
                    onClick={() => setExpandedIndex(expanded ? null : i)}>
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer" className="work-card__link">
                    Live site
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="work-card__link">
                    GitHub
                  </a>
                )}
              </div>
            </motion.div>
          </motion.article>
        );
      })}
    </div>
  );
}
