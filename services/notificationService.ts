import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from '../lib/api';
import { t } from '../lib/i18n/i18n';

export const CHAT_MESSAGE_NOTIFICATION_TYPE = 'chat_message';
export const AUTO_APPROVAL_NOTIFICATION_TYPE = 'auto_approval';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function canRegisterPushToken() {
  if (Platform.OS === 'web') {
    return false;
  }
  if (!Device.isDevice) {
    return false;
  }
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  if (Platform.OS === 'android' && isDevBuild) {
    return false;
  }
  return true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: t('notifications.channelName'),
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function registerPushTokenWithBackend(): Promise<string | null> {
  if (!canRegisterPushToken()) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  await ensureAndroidChannel();

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const pushToken = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  await api.post('/api/users/push-token', { token: pushToken.data });

  return pushToken.data;
}

export function getNotificationJobId(
  data: Record<string, unknown> | undefined,
): string | null {
  const jobId = data?.jobId;
  return typeof jobId === 'string' && jobId.length > 0 ? jobId : null;
}
