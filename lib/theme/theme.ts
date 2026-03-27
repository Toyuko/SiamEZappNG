import { useColorScheme } from 'react-native';

import { useThemeStore } from './useThemeStore';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  primary: string;
  mutedText: string;
  border: string;
  danger: string;
  success: string;
};

export const themeColors: Record<ResolvedTheme, ThemeColors> = {
  light: {
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    primary: '#2563eb',
    mutedText: '#64748b',
    border: '#e2e8f0',
    danger: '#dc2626',
    success: '#16a34a',
  },
  dark: {
    background: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    primary: '#3b82f6',
    mutedText: '#94a3b8',
    border: '#334155',
    danger: '#f87171',
    success: '#22c55e',
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
