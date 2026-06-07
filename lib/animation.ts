import type { Variants, Transition } from "framer-motion";

// Shared easing curves
export const ease = {
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  out: [0, 0, 0.2, 1] as const,
};

// Shared transitions
export const transition = {
  fast: { duration: 0.2, ease: ease.smooth },
  base: { duration: 0.4, ease: ease.smooth },
  slow: { duration: 0.7, ease: ease.out },
  spring: { type: "spring", stiffness: 300, damping: 28 },
  springGentle: { type: "spring", stiffness: 120, damping: 20 },
} satisfies Record<string, Transition>;

// Page wake-up: staggered container
export const wakeUpContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Individual element fade-up entrance
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.out },
  },
};

// Fade in only (no movement)
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth },
  },
};

// Scale up entrance
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: ease.spring },
  },
};
