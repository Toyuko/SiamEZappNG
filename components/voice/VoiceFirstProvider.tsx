import { createContext, useContext, type PropsWithChildren } from 'react';

import { useVoiceNavigation } from '../../hooks/use-voice-navigation';
import { GlobalVoiceButton } from './GlobalVoiceButton';
import { VoiceListeningSheet } from './VoiceListeningSheet';

type VoiceFirstContextValue = ReturnType<typeof useVoiceNavigation>;

const VoiceFirstContext = createContext<VoiceFirstContextValue | null>(null);

export function VoiceFirstProvider({ children }: PropsWithChildren) {
  const voice = useVoiceNavigation();

  return (
    <VoiceFirstContext.Provider value={voice}>
      {children}
      <GlobalVoiceButton />
      <VoiceListeningSheet />
    </VoiceFirstContext.Provider>
  );
}

export function useVoiceFirst(): VoiceFirstContextValue {
  const ctx = useContext(VoiceFirstContext);
  if (!ctx) {
    throw new Error('useVoiceFirst must be used within VoiceFirstProvider');
  }
  return ctx;
}
