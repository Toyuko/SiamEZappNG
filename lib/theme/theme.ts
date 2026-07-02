import { useColorScheme } from 'react-native';

import { siam } from './tokens';
import { useThemeStore } from './useThemeStore';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

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
  headerBg: string;
  headerBorder: string;
  headerText: string;
  headerTextMuted: string;
};

/**
 * Modern SiamEZ theme: a crisp white light mode and a striking near-black dark
 * mode. Both are tuned so the brand blue + gold pop cleanly against the neutral
 * background.
 */
export const themeColors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    text: '#0f172a',
    primary: siam.blue.DEFAULT,
    mutedText: '#64748b',
    muted: '#64748b',
    border: '#e8ebf0',
    danger: '#dc2626',
    success: '#16a34a',
    headerBg: '#ffffff',
    headerBorder: '#e8ebf0',
    headerText: '#0f172a',
    headerTextMuted: '#64748b',
  },
  dark: {
    // Near-black, OLED-friendly surfaces that make blue + gold vivid.
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
    headerBg: '#0a0a0c',
    headerBorder: '#27272b',
    headerText: '#f4f4f5',
    headerTextMuted: '#a1a1aa',
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
    isDark: resolvedTheme === 'dark',
    themeMode,
  };
}
