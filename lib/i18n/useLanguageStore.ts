import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { detectDeviceLanguage, setI18nLanguage } from './i18n';
import type { AppLanguage } from './i18n';

type LanguageStore = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: detectDeviceLanguage(),
      setLanguage: (language) => {
        setI18nLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'siamez-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          setI18nLanguage(state.language);
        }
      },
    },
  ),
);
