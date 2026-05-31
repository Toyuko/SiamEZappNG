import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import {
  resolveVoiceIntent,
  type FuzzySearchHit,
  type VoiceIntent,
} from '../features/services/service-search';
import { useVoiceSearch } from './use-voice-search';

export type VoiceNavigationPhase = 'idle' | 'listening' | 'processing' | 'results';

export type UseVoiceNavigationOptions = {
  /** Max results shown when intent is ambiguous */
  resultsLimit?: number;
  /** Navigate to service detail on direct high-confidence match */
  onDirectMatch?: (slug: string) => void;
};

export function useVoiceNavigation(options: UseVoiceNavigationOptions = {}) {
  const router = useRouter();
  const { resultsLimit = 6, onDirectMatch } = options;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [phase, setPhase] = useState<VoiceNavigationPhase>('idle');
  const [transcript, setTranscript] = useState('');
  const [resultHits, setResultHits] = useState<FuzzySearchHit[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  const resetSession = useCallback(() => {
    setPhase('idle');
    setTranscript('');
    setResultHits([]);
    setErrorMessage(null);
    processingRef.current = false;
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    resetSession();
  }, [resetSession]);

  const navigateToService = useCallback(
    (slug: string) => {
      closeSheet();
      if (onDirectMatch) {
        onDirectMatch(slug);
        return;
      }
      router.push(`/services/${slug}`);
    },
    [closeSheet, onDirectMatch, router],
  );

  const applyIntent = useCallback(
    (intent: VoiceIntent) => {
      if (intent.type === 'empty') {
        setPhase('idle');
        setTranscript(intent.transcript);
        setResultHits([]);
        return;
      }

      if (intent.type === 'direct') {
        setTranscript(intent.transcript);
        navigateToService(intent.service.slug);
        return;
      }

      setTranscript(intent.transcript);
      setResultHits(intent.results.slice(0, resultsLimit));
      setPhase('results');
    },
    [navigateToService, resultsLimit],
  );

  const handleTranscript = useCallback(
    (text: string) => {
      if (processingRef.current) {
        return;
      }
      processingRef.current = true;
      setPhase('processing');
      setTranscript(text);
      const intent = resolveVoiceIntent(text);
      applyIntent(intent);
      processingRef.current = false;
    },
    [applyIntent],
  );

  const { isListening, interimTranscript, startListening, stopListening, abortListening } = useVoiceSearch({
    onTranscript: handleTranscript,
    onError: (message) => {
      setErrorMessage(message);
      setPhase('idle');
    },
  });

  const openSheet = useCallback(() => {
    resetSession();
    setSheetOpen(true);
    setPhase('listening');
    void startListening();
  }, [resetSession, startListening]);

  const cancelListening = useCallback(() => {
    abortListening();
    closeSheet();
  }, [abortListening, closeSheet]);

  const finishListeningEarly = useCallback(() => {
    if (isListening) {
      stopListening();
    }
  }, [isListening, stopListening]);

  const selectResult = useCallback(
    (slug: string) => {
      navigateToService(slug);
    },
    [navigateToService],
  );

  const liveTranscript = isListening ? interimTranscript : transcript;

  return {
    sheetOpen,
    phase,
    isListening,
    liveTranscript,
    resultHits,
    errorMessage,
    openSheet,
    closeSheet,
    cancelListening,
    finishListeningEarly,
    selectResult,
    retryListening: openSheet,
  };
}
