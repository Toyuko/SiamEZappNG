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

/** Mirrors SiamEZ web `globals.css` light / dark themes */
export const themeColors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: '#ffffff',
    foreground: '#1f2937',
    card: '#ffffff',
    cardForeground: '#1f2937',
    text: '#1f2937',
    primary: siam.blue.DEFAULT,
    mutedText: '#6b7280',
    muted: '#6b7280',
    border: '#e5e7eb',
    danger: '#dc2626',
    success: '#16a34a',
    headerBg: '#ffffff',
    headerBorder: '#e5e7eb',
    headerText: '#374151',
    headerTextMuted: '#6b7280',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    cardForeground: '#f8fafc',
    text: '#f8fafc',
    primary: siam.blue.light,
    mutedText: '#94a3b8',
    muted: '#94a3b8',
    border: '#334155',
    danger: '#f87171',
    success: '#22c55e',
    headerBg: '#0f172a',
    headerBorder: '#334155',
    headerText: '#f1f5f9',
    headerTextMuted: '#94a3b8',
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
