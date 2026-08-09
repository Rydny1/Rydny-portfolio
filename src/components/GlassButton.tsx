import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type GlassButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: 'glass' | 'ghost';
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  download?: boolean;
  target?: string;
  rel?: string;
};

/**
 * The site's one deliberate glass surface. Reserved for the single
 * highest-priority action per view — nowhere else gets this treatment.
 * Shine plays once per hover/focus, never idle-loops.
 */
export default function GlassButton({
  children,
  href,
  className = '',
  variant = 'glass',
  type = 'button',
  onClick,
  disabled,
  download,
  target,
  rel,
}: GlassButtonProps) {
  const classes = `btn btn--${variant} ${className}`.trim();

  const shine =
    variant === 'glass' ? (
      <motion.span
        className="btn--glass__shine"
        variants={{ rest: { x: '-130%', opacity: 0 }, hover: { x: '130%', opacity: 1 } }}
        transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
        aria-hidden="true"
      />
    ) : null;

  const content = (
    <>
      <span className="btn__label">{children}</span>
      {shine}
    </>
  );

  const sharedProps = {
    className: classes,
    initial: 'rest',
    whileHover: 'hover',
    whileFocus: 'hover',
    whileTap: { scale: 0.97 },
    transition: { type: 'spring' as const, stiffness: 500, damping: 32, mass: 0.5 },
  };

  if (href) {
    return (
      <motion.a href={href} download={download} target={target} rel={rel} {...sharedProps}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...sharedProps}>
      {content}
    </motion.button>
  );
}
