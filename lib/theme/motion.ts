/**
 * Shared motion timings — short, purposeful, reduced-motion friendly.
 * Prefer transform + opacity. Never block the user on animation.
 */

export const motion = {
  screenTransition: 220,
  cardPress: 120,
  buttonPress: 110,
  heroEntrance: 520,
  serviceCardEntrance: 280,
  serviceCardStagger: 50,
  bookingStep: 200,
  success: 520,
  pressScale: 0.97,
  buttonPressScale: 0.96,
} as const;

export type MotionKey = keyof typeof motion;
