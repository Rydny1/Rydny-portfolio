import { useEffect, useState } from 'react';
import './ScrollToTop.css';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Lenis animates scroll independently of native window.scrollY in
    // places (see BaseLayout's reveal script) — hooking its own scroll
    // event, with a native fallback when reduced-motion skips Lenis
    // entirely, keeps this in sync with what's actually on screen.
    const toggleVisibility = () => setIsVisible(window.scrollY > 500);
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on('scroll', toggleVisibility);
    } else {
      window.addEventListener('scroll', toggleVisibility, { passive: true });
    }
    toggleVisibility();
    return () => {
      if (lenis) lenis.off('scroll', toggleVisibility);
      else window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    const lenis = (window as any).__lenis;
    if (lenis) lenis.scrollTo(0, { duration: 1.0 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? 'is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
