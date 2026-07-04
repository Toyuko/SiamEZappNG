import { createContext, useContext } from 'react';

type LaunchAnimationContextValue = {
  /** True once the launch overlay has finished and the app is revealed. */
  launchComplete: boolean;
};

const LaunchAnimationContext = createContext<LaunchAnimationContextValue>({
  launchComplete: true,
});

export const LaunchAnimationProvider = LaunchAnimationContext.Provider;

export function useLaunchAnimation() {
  return useContext(LaunchAnimationContext);
}
