/**
 * Design tokens — SiamEZ brand (siam-ez.com + mobile UI concept).
 * Royal blue dominant, gold for actions, white content surfaces.
 */

export const siam = {
  blue: {
    /** Primary brand blue */
    DEFAULT: '#2450C4',
    /** Vibrant / interactive blue */
    light: '#3567F6',
    bright: '#3567F6',
    /** Dark blue */
    dark: '#163A9D',
    /** Deep navy */
    navy: '#102C76',
  },
  yellow: {
    /** Primary gold CTA */
    DEFAULT: '#FFD32F',
    light: '#FFE566',
    /** Gold highlight */
    dark: '#FFC928',
  },
  gray: {
    DEFAULT: '#64748B',
    light: '#94A3B8',
    dark: '#15234D',
  },
} as const;

/** Semantic surfaces (light-mode defaults; runtime theme may override). */
export const surfaces = {
  background: '#F5F8FF',
  card: '#FFFFFF',
  textPrimary: '#15234D',
  textSecondary: '#64748B',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  white: '#FFFFFF',
} as const;

/** 8-point spacing system */
export const spacing = {
  micro: 4,
  compact: 8,
  small: 12,
  standard: 16,
  medium: 20,
  section: 24,
  large: 32,
  hero: 40,
  major: 48,
  /** Between major sections (default) */
  sectionGap: 24,
  /** Between major sections — home & marketing screens */
  sectionGapLg: 32,
  /** Screen horizontal inset */
  screenPaddingX: 16,
  /** Default card body padding */
  cardPadding: 20,
  /** Dense cards */
  cardPaddingCompact: 14,
  /** Inline stacks */
  stackSm: 8,
  stackMd: 12,
  stackLg: 16,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 22,
  hero: 26,
  /** Primary CTAs */
  button: 16,
  full: 9999,
} as const;

/** Foreground used on gold/accent surfaces */
export const accentForeground = '#15234D';

export type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const shadows = {
  cardLight: {
    shadowColor: '#102C76',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  } satisfies ShadowStyle,
  cardMedium: {
    shadowColor: '#102C76',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  } satisfies ShadowStyle,
  cardStrong: {
    shadowColor: '#102C76',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  } satisfies ShadowStyle,
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

export const typography = {
  hero: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  section: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  cardTitle: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  supporting: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  button: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
} as const;

/** Hero gradient — royal blue depth */
export const heroGradient = {
  colors: [siam.blue.navy, siam.blue.dark, siam.blue.DEFAULT] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** Gold gradient for accent CTAs */
export const goldGradient = {
  colors: [siam.yellow.light, siam.yellow.DEFAULT, siam.yellow.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

/** Brighter blue gradient for primary CTAs */
export const brandGradient = {
  colors: [siam.blue.bright, siam.blue.DEFAULT, siam.blue.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
