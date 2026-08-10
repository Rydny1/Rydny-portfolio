import { useEffect, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import GlassButton from './GlassButton';
import { withBase } from '../lib/base';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', href: withBase('/'), sectionId: 'home' },
  { label: 'Work', href: withBase('/#work'), sectionId: 'work' },
  { label: 'About', href: withBase('/#about'), sectionId: 'about' },
  { label: 'Skills', href: withBase('/#skills'), sectionId: 'skills' },
  { label: 'Contact', href: withBase('/#contact'), sectionId: 'contact' },
];

const SCROLL_SECTIONS = ['home', 'work', 'about', 'skills', 'contact'];

const EASE = [0.22, 0.61, 0.36, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(160px circle at ${mouseX}px ${mouseY}px, rgba(245,241,232,0.18), transparent 70%)`;

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        let current = 'home';
        for (const id of SCROLL_SECTIONS) {
          const el = document.getElementById(id);
          if (el && window.scrollY >= el.offsetTop - 140) current = id;
        }
        setActiveSection(current);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }
  function handleMouseLeave() {
    mouseX.set(-999);
    mouseY.set(-999);
  }

  return (
    <>
      <div className={`navbar-wrap theme-dark${scrolled ? ' navbar-wrap--scrolled' : ''}`}>
        <a href={withBase('/')} className="navbar__brand-pill">
          <span>Rydny I.</span>
        </a>

        <nav
          className="navbar__links-pill"
          aria-label="Primary"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}>
          <motion.div className="navbar__spotlight" style={{ background: spotlight }} aria-hidden="true" />
          {NAV_LINKS.map((link) => {
            const active = activeSection === link.sectionId;
            return (
              <a key={link.label} href={link.href} className={`nav-link${active ? ' nav-link--active' : ''}`}>
                {link.label}
                {active && (
                  <motion.span
                    className="nav-link__underline"
                    layoutId="nav-underline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        <div className="navbar__right">
          <GlassButton href={withBase('/#contact')} className="navbar__cta">
            Get in touch
          </GlassButton>
          <button
            className={`hamburger${menuOpen ? ' hamburger--open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav theme-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}>
            <nav className="mobile-nav__links" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}>
                  {link.label}
                </motion.a>
              ))}
              <GlassButton href={withBase('/#contact')} className="mobile-nav__cta">
                Hire Me
              </GlassButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
