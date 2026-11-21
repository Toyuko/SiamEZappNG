/**
 * Design tokens aligned with SiamEZ brand assets + website (siam-ez.com).
 * Visual source of truth: royal blue / gold elephant identity.
 */

export const siam = {
  blue: {
    DEFAULT: '#2454D8',
    light: '#3979FF',
    dark: '#153DAE',
    bright: '#3979FF',
    navy: '#102B72',
  },
  yellow: {
    DEFAULT: '#FFD329',
    light: '#FFE566',
    dark: '#FFB900',
  },
  gray: {
    DEFAULT: '#374151',
    light: '#68758D',
    dark: '#15213A',
  },
} as const;

export const spacing = {
  /** Between major sections (default) */
  sectionGap: 24,
  /** Between major sections — home & marketing screens */
  sectionGapLg: 32,
  /** Screen horizontal inset */
  screenPaddingX: 20,
  /** Default card body padding */
  cardPadding: 20,
  /** Dense cards (e.g. testimonial carousel) */
  cardPaddingCompact: 14,
  /** Inline stacks (title → body) */
  stackSm: 8,
  stackMd: 12,
  stackLg: 16,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  /** Buttons / inputs — matches the web `rounded-lg` feel */
  button: 12,
  full: 9999,
} as const;

/** Foreground used on gold/accent surfaces (matches web yellow CTA text). */
export const accentForeground = '#15213A';

export type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const shadows = {
  /** Subtle card lift — light surfaces */
  cardLight: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  } satisfies ShadowStyle,
  /** Stats / metrics — medium depth */
  cardMedium: {
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 7,
  } satisfies ShadowStyle,
  /** Featured quote / testimonial — stronger depth */
  cardStrong: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 12,
  } satisfies ShadowStyle,
  /** Dark / night surfaces */
  cardDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  } satisfies ShadowStyle,
  cardDarkMedium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  } satisfies ShadowStyle,
  cardDarkStrong: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
  } satisfies ShadowStyle,
} as const;

export type CardShadowLevel = 'default' | 'medium' | 'strong';

/** Hero gradient — royal blue depth matching brand banners */
export const heroGradient = {
  colors: [siam.blue.navy, siam.blue.dark, siam.blue.DEFAULT] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** Gold gradient for striking accent CTAs (matches the SiamEZ yellow palette). */
export const goldGradient = {
  colors: [siam.yellow.light, siam.yellow.DEFAULT, siam.yellow.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** Brighter blue gradient for primary CTAs / accents. */
export const brandGradient = {
  colors: [siam.blue.bright, siam.blue.DEFAULT, siam.blue.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
