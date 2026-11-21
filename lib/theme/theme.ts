import { useColorScheme } from 'react-native';

import { siam, surfaces } from './tokens';
import { useThemeStore } from './useThemeStore';

export type ThemeMode = 'light' | 'dark' | 'night' | 'system';
export type ResolvedTheme = 'light' | 'dark' | 'night';

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  /** @deprecated Prefer `foreground` — kept for existing screens */
  text: string;
  primary: string;
  /** @deprecated Prefer `muted` */
  mutedText: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  headerTextMuted: string;
};

/**
 * SiamEZ theme: crisp blue-tinted light mode; OLED dark / midnight night.
 * Brand blue + gold stay vivid on every surface.
 */
export const themeColors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: surfaces.background,
    foreground: surfaces.textPrimary,
    card: surfaces.card,
    cardForeground: surfaces.textPrimary,
    text: surfaces.textPrimary,
    primary: siam.blue.DEFAULT,
    mutedText: surfaces.textSecondary,
    muted: surfaces.textSecondary,
    border: '#E2E8F4',
    danger: surfaces.error,
    success: surfaces.success,
    warning: surfaces.warning,
    headerBg: surfaces.card,
    headerBorder: '#E2E8F4',
    headerText: surfaces.textPrimary,
    headerTextMuted: surfaces.textSecondary,
  },
  dark: {
    background: '#0a0a0c',
    foreground: '#f4f4f5',
    card: '#161619',
    cardForeground: '#f4f4f5',
    text: '#f4f4f5',
    primary: siam.blue.bright,
    mutedText: '#a1a1aa',
    muted: '#a1a1aa',
    border: '#27272b',
    danger: '#f87171',
    success: '#22c55e',
    warning: '#fbbf24',
    headerBg: '#0a0a0c',
    headerBorder: '#27272b',
    headerText: '#f4f4f5',
    headerTextMuted: '#a1a1aa',
  },
  night: {
    background: '#0a0f1f',
    foreground: '#e7ecf7',
    card: '#141d33',
    cardForeground: '#e7ecf7',
    text: '#e7ecf7',
    primary: siam.blue.bright,
    mutedText: '#93a0bd',
    muted: '#93a0bd',
    border: '#26314f',
    danger: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    headerBg: '#0a0f1f',
    headerBorder: '#26314f',
    headerText: '#e7ecf7',
    headerTextMuted: '#93a0bd',
  },
};

function resolveTheme(mode: ThemeMode, systemScheme: ReturnType<typeof useColorScheme>): ResolvedTheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const resolvedTheme = resolveTheme(themeMode, systemScheme);

  return {
    colors: themeColors[resolvedTheme],
    isDark: resolvedTheme !== 'light',
    resolvedTheme,
    themeMode,
  };
}
