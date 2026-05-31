import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { useLanguageStore } from '../lib/i18n/useLanguageStore';

type UseVoiceSearchOptions = {
  /** Called when speech recognition completes with a final transcript */
  onTranscript: (text: string) => void;
  /** Called when recognition fails or permissions are denied */
  onError?: (message: string) => void;
};

function speechLocaleForAppLanguage(language: 'en' | 'th'): string {
  return language === 'th' ? 'th-TH' : 'en-US';
}

export function useVoiceSearch({ onTranscript, onError }: UseVoiceSearchOptions) {
  const language = useLanguageStore((state) => state.language);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const finalTranscriptRef = useRef('');

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    const text = finalTranscriptRef.current.trim();
    if (text.length > 0) {
      onTranscript(text);
    }
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript ?? '';
    if (event.isFinal) {
      finalTranscriptRef.current = transcript;
      setInterimTranscript(transcript);
    } else {
      setInterimTranscript(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setInterimTranscript('');
    if (event.error === 'aborted') {
      return;
    }
    onError?.(event.message ?? event.error);
  });

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const abortListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }

    const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
    if (!available) {
      onError?.('Speech recognition is not available on this device.');
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      onError?.('Microphone and speech recognition permissions are required.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: speechLocaleForAppLanguage(language),
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: Platform.OS === 'ios',
    });
  }, [isListening, language, onError, stopListening]);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    abortListening,
  };
}
