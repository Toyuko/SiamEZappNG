/**
 * Design tokens — SiamEZ screenshot source of truth + siam-ez.com.
 * Deep royal blue dominant, yellow for conversion CTAs only.
 */

export const siam = {
  blue: {
    /** Primary brand blue */
    DEFAULT: '#0645B5',
    /** Interactive / bright */
    light: '#1559D6',
    bright: '#1559D6',
    /** Primary dark */
    dark: '#06358E',
    /** Primary deep / navy */
    navy: '#052A70',
    /** Soft tint for chips / icon wells */
    tint: '#EEF4FF',
  },
  yellow: {
    /** Primary conversion yellow (Services marketplace CTA) */
    DEFAULT: '#FFD400',
    light: '#FFDF32',
    dark: '#F0BF00',
  },
  gray: {
    DEFAULT: '#5C7395',
    light: '#A5B5CC',
    dark: '#102858',
  },
} as const;

/** Semantic surfaces (light-mode defaults; runtime theme may override). */
export const surfaces = {
  background: '#F3F7FF',
  card: '#FFFFFF',
  textPrimary: '#102858',
  textSecondary: '#5C7395',
  border: '#DCE6F7',
  disabled: '#A5B5CC',
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
  sectionGap: 24,
  sectionGapLg: 28,
  screenPaddingX: 16,
  cardPadding: 18,
  cardPaddingCompact: 14,
  stackSm: 8,
  stackMd: 12,
  stackLg: 16,
} as const;

export const radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 22,
  hero: 26,
  button: 16,
  full: 9999,
} as const;

/** Foreground on yellow/accent surfaces */
export const accentForeground = '#102858';

export type ShadowStyle = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export const shadows = {
  cardLight: {
    shadowColor: '#052A70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  } satisfies ShadowStyle,
  cardMedium: {
    shadowColor: '#052A70',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 5,
  } satisfies ShadowStyle,
  cardStrong: {
    shadowColor: '#052A70',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
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
  hero: { fontSize: 30, fontWeight: '700' as const, lineHeight: 36 },
  section: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  cardTitle: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  supporting: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
} as const;

/** Hero gradient — deep → dark → primary */
export const heroGradient = {
  colors: [siam.blue.navy, siam.blue.dark, siam.blue.DEFAULT] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const goldGradient = {
  colors: [siam.yellow.light, siam.yellow.DEFAULT, siam.yellow.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};

export const brandGradient = {
  colors: [siam.blue.bright, siam.blue.DEFAULT, siam.blue.dark] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
