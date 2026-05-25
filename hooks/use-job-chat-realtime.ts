import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { enrichChatMessage } from '../lib/chat/enrich-message';
import { subscribeToJobChat } from '../services/pusherService';
import type { JobChatMessageDto, JobChatRealtimeConfig, WebChatParticipant } from '../types/chat';

const POLL_INTERVAL_MS = 5000;

type UseJobChatRealtimeOptions = {
  jobId: string;
  enabled: boolean;
  realtime?: JobChatRealtimeConfig | null;
  participant?: WebChatParticipant | null;
  onMessage: (message: JobChatMessageDto) => void;
  onSync?: () => void | Promise<void>;
};

export function useJobChatRealtime({
  jobId,
  enabled,
  realtime,
  participant,
  onMessage,
  onSync,
}: UseJobChatRealtimeOptions) {
  const [isLive, setIsLive] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToJobChat>>(null);
  const onMessageRef = useRef(onMessage);
  const onSyncRef = useRef(onSync);
  const participantRef = useRef(participant);

  onMessageRef.current = onMessage;
  onSyncRef.current = onSync;
  participantRef.current = participant;

  const handlePusherMessage = useCallback(
    (dto: JobChatMessageDto) => {
      const enriched = enrichChatMessage(dto, participantRef.current);
      onMessageRef.current(enriched);
    },
    [],
  );

  const setupSubscription = useCallback(() => {
    subscriptionRef.current?.unsubscribe();

    const subscription = subscribeToJobChat(jobId, handlePusherMessage, realtime);
    subscriptionRef.current = subscription;
    setIsLive(subscription != null);
  }, [handlePusherMessage, jobId, realtime]);

  useEffect(() => {
    if (!enabled || !jobId) {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      setIsLive(false);
      return;
    }

    setupSubscription();

    const pollTimer = setInterval(() => {
      void onSyncRef.current?.();
    }, POLL_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void onSyncRef.current?.();
        setupSubscription();
      }
    });

    return () => {
      clearInterval(pollTimer);
      appStateSubscription.remove();
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      setIsLive(false);
    };
  }, [enabled, jobId, setupSubscription]);

  return { isLive };
}
