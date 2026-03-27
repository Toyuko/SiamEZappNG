import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemeMode } from './theme';

type ThemeStore = {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setTheme: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'siamez-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeMode: state.themeMode }),
    },
  ),
);
