/**
 * Motion presets for Framer Motion + CSS — keep animations subtle / enterprise-grade.
 */

export const easings = {
  /** Smooth deceleration (Stripe / Linear-ish) */
  out: [0.22, 1, 0.36, 1],
  inOut: [0.45, 0, 0.55, 1],
};

export const duration = {
  xs: 0.12,
  sm: 0.18,
  md: 0.28,
  lg: 0.42,
};

export const stagger = {
  fast: 0.04,
  normal: 0.07,
  slow: 0.1,
};

/** Framer Motion transition helper */
export function transitionEaseOut(durationSeconds = duration.md, delay = 0) {
  return {
    duration: durationSeconds,
    delay,
    ease: easings.out,
  };
}
