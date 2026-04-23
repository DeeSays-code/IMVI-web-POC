/**
 * Shared Framer Motion variants. Every curve here is either cubic-bezier
 * (0.19, 1, 0.22, 1) — cinematic — or (0.4, 0, 0.2, 1) — standard. No spring,
 * no ease-in-out default. Spec §2.2.
 */
import type { Transition, Variants } from 'framer-motion';

export const EASE_CINEMATIC = [0.19, 1, 0.22, 1] as const;
export const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CINEMATIC as unknown as number[] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: EASE_CINEMATIC as unknown as number[] },
  },
};

export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_CINEMATIC as unknown as number[] },
  },
};

export const routeTransition: Transition = {
  duration: 0.22,
  ease: EASE_STANDARD as unknown as number[],
};
