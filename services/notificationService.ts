import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { EZ_NOTIFICATION_SOUND } from '../lib/audio/play-notification-sound';
import { api } from '../lib/api';
import { t } from '../lib/i18n/i18n';
import { getNotifications, isAndroidExpoGo } from '../lib/notifications/load-notifications';

export const CHAT_MESSAGE_NOTIFICATION_TYPE = 'chat_message';
export const AUTO_APPROVAL_NOTIFICATION_TYPE = 'auto_approval';

const notifications = getNotifications();

if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      // Android needs this for the heads-up banner; channel sound is `ez_notification.wav`.
      // iOS/web: we play the EZ cue ourselves in the received listener / toast helpers.
      shouldPlaySound: Platform.OS === 'android',
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function canRegisterPushToken() {
  if (Platform.OS === 'web') {
    return false;
  }
  if (!Device.isDevice) {
    return false;
  }
  // Remote push was removed from Android Expo Go in SDK 53. Importing the
  // module throws, so registration is limited to dev and release builds.
  if (isAndroidExpoGo()) {
    return false;
  }
  return true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  const notificationsModule = getNotifications();
  if (!notificationsModule) {
    return;
  }

  await notificationsModule.setNotificationChannelAsync('default', {
    name: t('notifications.channelName'),
    importance: notificationsModule.AndroidImportance.HIGH,
    sound: EZ_NOTIFICATION_SOUND,
    enableVibrate: true,
  });
}

export async function registerPushTokenWithBackend(): Promise<string | null> {
  if (!canRegisterPushToken()) {
    return null;
  }

  const notificationsModule = getNotifications();
  if (!notificationsModule) {
    return null;
  }

  const { status: existingStatus } = await notificationsModule.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await notificationsModule.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  await ensureAndroidChannel();

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(
        '[push] Missing EAS projectId (run `eas init`). Skipping Expo push token registration.',
      );
    }
    return null;
  }

  let pushToken;
  try {
    pushToken = await notificationsModule.getExpoPushTokenAsync({ projectId });
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[push] Failed to get Expo push token', error);
    }
    return null;
  }

  await api.post('/api/users/push-token', { token: pushToken.data });

  return pushToken.data;
}

/** Best-effort server-side push token cleanup on logout. Errors are ignored. */
export async function unregisterPushTokenFromBackend(): Promise<void> {
  try {
    await api.delete('/api/users/push-token');
  } catch {
    // ignore — logout must continue
  }
}

export function getNotificationJobId(
  data: Record<string, unknown> | undefined,
): string | null {
  const jobId = data?.jobId;
  return typeof jobId === 'string' && jobId.length > 0 ? jobId : null;
}
