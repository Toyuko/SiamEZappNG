import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingStore = {
  hasCompletedTutorial: boolean;
  completeTutorial: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      hasCompletedTutorial: false,
      completeTutorial: () => set({ hasCompletedTutorial: true }),
    }),
    {
      name: 'siamez-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasCompletedTutorial: state.hasCompletedTutorial }),
    },
  ),
);
