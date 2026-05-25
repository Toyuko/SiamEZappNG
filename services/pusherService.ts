import Pusher from 'pusher-js/react-native';

import { pusherPayloadToDto } from '../lib/chat/pusher-payload';
import { appConfig } from '../lib/config';
import { useAuthStore } from '../store/auth-store';
import type { JobChatMessageDto, JobChatRealtimeConfig } from '../types/chat';
import { JOB_CHAT_PUSHER_EVENT, jobChatChannel } from '../types/chat';
import { JOB_TRACKING_UPDATED_EVENT, jobTrackingChannel } from '../types/tracking';
import type { JobBoardFeedItem } from '../types/job-board';
import {
  JOB_BOARD_NEW_JOB_EVENT,
  PRIVATE_SPECIAL_JOBS_CHANNEL,
  PUBLIC_JOB_BOARD_CHANNEL,
} from '../types/job-board';

let pusherClient: Pusher | null = null;
let privatePusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  const key = process.env.EXPO_PUBLIC_PUSHER_KEY?.trim();
  const cluster = process.env.EXPO_PUBLIC_PUSHER_CLUSTER?.trim();

  if (!key || !cluster) {
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(key, { cluster });
  }

  return pusherClient;
}

export type JobBoardSubscription = {
  unsubscribe: () => void;
};

export type SubscribeToJobBoardOptions = {
  isSpecialMember?: boolean;
};

/**
 * Subscribes to `public-job-board` (and optionally `private-special-jobs`)
 * and listens for `new-job-posted` events.
 */
export function subscribeToJobBoard(
  onNewJob: (job: JobBoardFeedItem) => void,
  options?: SubscribeToJobBoardOptions,
): JobBoardSubscription | null {
  const pusher = getPusherClient();
  if (!pusher) {
    return null;
  }

  const handler = (job: JobBoardFeedItem) => onNewJob(job);

  const publicChannel = pusher.subscribe(PUBLIC_JOB_BOARD_CHANNEL);
  publicChannel.bind(JOB_BOARD_NEW_JOB_EVENT, handler);

  let specialChannel: ReturnType<Pusher['subscribe']> | null = null;
  if (options?.isSpecialMember) {
    specialChannel = pusher.subscribe(PRIVATE_SPECIAL_JOBS_CHANNEL);
    specialChannel.bind(JOB_BOARD_NEW_JOB_EVENT, handler);
  }

  return {
    unsubscribe: () => {
      publicChannel.unbind(JOB_BOARD_NEW_JOB_EVENT, handler);
      pusher.unsubscribe(PUBLIC_JOB_BOARD_CHANNEL);

      if (specialChannel) {
        specialChannel.unbind(JOB_BOARD_NEW_JOB_EVENT, handler);
        pusher.unsubscribe(PRIVATE_SPECIAL_JOBS_CHANNEL);
      }
    },
  };
}

function defaultPusherAuthEndpoint() {
  return `${appConfig.apiUrl.replace(/\/+$/, '')}/api/chat/pusher-auth`;
}

function resolvePusherCredentials(realtime?: JobChatRealtimeConfig | null) {
  const key = realtime?.pusherKey?.trim() || process.env.EXPO_PUBLIC_PUSHER_KEY?.trim();
  const cluster = realtime?.pusherCluster?.trim() || process.env.EXPO_PUBLIC_PUSHER_CLUSTER?.trim();
  return key && cluster ? { key, cluster } : null;
}

/** Pusher client with private-channel auth (Bearer token). */
export function getPrivatePusherClient(realtime?: JobChatRealtimeConfig | null): Pusher | null {
  const credentials = resolvePusherCredentials(realtime);
  if (!credentials) {
    return null;
  }

  const authEndpoint = realtime?.authEndpoint?.trim() || defaultPusherAuthEndpoint();

  if (!privatePusherClient) {
    privatePusherClient = new Pusher(credentials.key, {
      cluster: credentials.cluster,
      channelAuthorization: {
        endpoint: authEndpoint,
        transport: 'ajax',
        headersProvider: () => {
          const token = useAuthStore.getState().accessToken;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    });
  }

  return privatePusherClient;
}

export type JobChatSubscription = {
  unsubscribe: () => void;
};

export type JobChannelSubscription = {
  unsubscribe: () => void;
};

export type SubscribeToJobChannelHandlers = {
  onTrackingUpdated?: (payload: unknown) => void;
  onNewMessage?: (message: JobChatMessageDto) => void;
};

/**
 * Subscribes to `private-job-{jobId}` for `tracking-updated` and `new-message` events.
 */
export function subscribeToJobChannel(
  jobId: string,
  handlers: SubscribeToJobChannelHandlers,
  realtime?: JobChatRealtimeConfig | null,
): JobChannelSubscription | null {
  const pusher = getPrivatePusherClient(realtime);
  if (!pusher) {
    return null;
  }

  const channelName = realtime?.channel?.trim() || jobTrackingChannel(jobId);
  const messageEvent = realtime?.event ?? JOB_CHAT_PUSHER_EVENT;
  const channel = pusher.subscribe(channelName);

  const trackingHandler = (payload: unknown) => {
    handlers.onTrackingUpdated?.(payload);
  };

  const messageHandler = (payload: unknown) => {
    const message = pusherPayloadToDto(payload, jobId);
    if (message) {
      handlers.onNewMessage?.(message);
    }
  };

  if (handlers.onTrackingUpdated) {
    channel.bind(JOB_TRACKING_UPDATED_EVENT, trackingHandler);
  }

  if (handlers.onNewMessage) {
    channel.bind(messageEvent, messageHandler);
  }

  return {
    unsubscribe: () => {
      if (handlers.onTrackingUpdated) {
        channel.unbind(JOB_TRACKING_UPDATED_EVENT, trackingHandler);
      }
      if (handlers.onNewMessage) {
        channel.unbind(messageEvent, messageHandler);
      }
      pusher.unsubscribe(channelName);
    },
  };
}

/**
 * Subscribes to `private-job-{jobId}-chat` and listens for `new-message` events.
 */
export function subscribeToJobChat(
  jobId: string,
  onMessage: (message: JobChatMessageDto) => void,
  realtime?: JobChatRealtimeConfig | null,
): JobChatSubscription | null {
  const pusher = getPrivatePusherClient(realtime);
  if (!pusher) {
    return null;
  }

  const channelName = realtime?.channel?.trim() || jobChatChannel(jobId);
  const eventName = realtime?.event ?? JOB_CHAT_PUSHER_EVENT;

  const channel = pusher.subscribe(channelName);
  const handler = (payload: unknown) => {
    const message = pusherPayloadToDto(payload, jobId);
    if (message) {
      onMessage(message);
    }
  };

  channel.bind(eventName, handler);

  return {
    unsubscribe: () => {
      channel.unbind(eventName, handler);
      pusher.unsubscribe(channelName);
    },
  };
}
