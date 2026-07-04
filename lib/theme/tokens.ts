/**
 * Design tokens aligned with SiamEZ web (globals.css + tailwind.config).
 * Source: https://github.com/Toyuko/SiamEZwebNG
 */

export const siam = {
  blue: {
    DEFAULT: '#2C54C6',
    light: '#3D5FCE',
    dark: '#2344B0',
    bright: '#5B76E0',
  },
  yellow: {
    DEFAULT: '#FFCE2D',
    light: '#FFD84D',
    dark: '#E6B828',
  },
  gray: {
    DEFAULT: '#374151',
    light: '#6b7280',
    dark: '#1f2937',
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
  md: 12,
  lg: 16,
  xl: 24,
  /** Buttons / inputs — matches web rounded-lg feel on mobile */
  button: 16,
  full: 9999,
} as const;

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  } satisfies ShadowStyle,
  /** Stats / metrics — medium depth */
  cardMedium: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
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

/** Hero gradient — matches web HeroSection `from-siam-blue via-siam-blue-light to-siam-blue` */
export const heroGradient = {
  colors: [siam.blue.dark, siam.blue.light, siam.blue.DEFAULT] as const,
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
};
