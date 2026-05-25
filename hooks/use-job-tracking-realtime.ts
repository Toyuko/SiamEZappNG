import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { mergeTrackingUpdatedPayload } from '../lib/tracking/pusher-payload';
import { t } from '../lib/i18n/i18n';
import { fetchJobTracking } from '../services/trackingApi';
import { subscribeToJobChannel } from '../services/pusherService';
import { useAuthStore } from '../store/auth-store';
import type { JobChatMessageDto, JobChatRealtimeConfig } from '../types/chat';
import type { JobTrackingPayload } from '../types/tracking';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TOAST_MS = 4500;

export type TrackingMessageToast = {
  id: string;
  message: string;
};

export function jobTrackingQueryKey(jobId: string, role: 'client' | 'freelancer') {
  return ['job-tracking', jobId, role] as const;
}

type UseJobTrackingRealtimeOptions = {
  jobId: string;
  role: 'client' | 'freelancer';
  enabled: boolean;
  /** When true (chat screen focused), new-message toasts are suppressed. */
  isChatFocused?: boolean;
  onNewMessageWhileChatFocused?: (message: JobChatMessageDto) => void;
  /** Called after a background → active transition (e.g. reload chat history). */
  onAppForeground?: () => void;
  realtime?: JobChatRealtimeConfig | null;
};

export function useJobTrackingRealtime({
  jobId,
  role,
  enabled,
  isChatFocused = false,
  onNewMessageWhileChatFocused,
  onAppForeground,
  realtime,
}: UseJobTrackingRealtimeOptions) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const queryKey = jobTrackingQueryKey(jobId, role);

  const [isLive, setIsLive] = useState(false);
  const [toasts, setToasts] = useState<TrackingMessageToast[]>([]);
  const toastIdRef = useRef(0);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToJobChannel>>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message: string) => {
    const id = `tracking-toast-${++toastIdRef.current}`;
    setToasts((previous) => [...previous, { id, message }]);
    const timer = setTimeout(() => dismissToast(id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [dismissToast]);

  const silentRefetch = useCallback(async () => {
    try {
      const data = await fetchJobTracking(jobId, role);
      queryClient.setQueryData<JobTrackingPayload>(queryKey, data);
    } catch {
      // Background sync — ignore transient failures.
    }
  }, [jobId, queryClient, queryKey, role]);

  const applyTrackingUpdate = useCallback(
    (payload: unknown) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      queryClient.setQueryData<JobTrackingPayload>(queryKey, (current) => {
        if (!current) {
          return current;
        }
        return mergeTrackingUpdatedPayload(current, payload);
      });
    },
    [queryClient, queryKey],
  );

  const handleNewMessage = useCallback(
    (message: JobChatMessageDto) => {
      if (message.senderId === user?.id) {
        return;
      }

      if (isChatFocused) {
        onNewMessageWhileChatFocused?.(message);
        return;
      }

      const name = message.senderName?.trim() || t('common.unknownUser');
      pushToast(t('tracking.newMessageToast', { name }));
    },
    [isChatFocused, onNewMessageWhileChatFocused, pushToast, user?.id],
  );

  const setupSubscription = useCallback(() => {
    subscriptionRef.current?.unsubscribe();

    const subscription = subscribeToJobChannel(
      jobId,
      {
        onTrackingUpdated: applyTrackingUpdate,
        onNewMessage: handleNewMessage,
      },
      realtime,
    );

    subscriptionRef.current = subscription;
    setIsLive(subscription != null);
  }, [applyTrackingUpdate, handleNewMessage, jobId, realtime]);

  useEffect(() => {
    if (!enabled || !jobId) {
      return;
    }

    setupSubscription();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void silentRefetch();
        onAppForeground?.();
        setupSubscription();
      }
    });

    return () => {
      appStateSubscription.remove();
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      setIsLive(false);
    };
  }, [enabled, jobId, onAppForeground, setupSubscription, silentRefetch]);

  return {
    isLive,
    toasts,
    dismissToast,
    silentRefetch,
  };
}
