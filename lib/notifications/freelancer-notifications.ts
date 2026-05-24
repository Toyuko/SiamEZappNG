import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { api } from '../api';
import { t } from '../i18n/i18n';

export const JOB_APPROVED_NOTIFICATION_TYPE = 'job_approved';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function showJobApprovedAlert() {
  Alert.alert(t('freelancer.notifications.jobApprovedTitle'), t('freelancer.jobApproved'), [
    { text: 'OK', style: 'default' },
  ]);
}

function isJobApprovedPayload(data: Record<string, unknown> | undefined) {
  if (!data) {
    return false;
  }
  const type = data.type ?? data.event;
  return type === JOB_APPROVED_NOTIFICATION_TYPE || type === 'job.approved';
}

export function handleFreelancerNotification(notification: Notifications.Notification) {
  const data = notification.request.content.data as Record<string, unknown> | undefined;
  if (isJobApprovedPayload(data)) {
    showJobApprovedAlert();
  }
}

/** Push tokens are unreliable on Android emulators (no FCM). Skip token fetch there. */
function canRegisterPushToken() {
  if (Platform.OS === 'web') {
    return false;
  }
  const isDevBuild = typeof __DEV__ !== 'undefined' && __DEV__;
  if (Platform.OS === 'android' && isDevBuild) {
    return false;
  }
  return true;
}

export async function registerForFreelancerPushNotifications() {
  if (!canRegisterPushToken()) {
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('freelancer', {
        name: t('freelancer.notifications.channelName'),
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const pushToken = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    try {
      await api.post('/api/push/register-device', {
        token: pushToken.data,
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version,
      });
    } catch {
      // Optional when backend is unavailable.
    }

    return pushToken;
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[freelancer-notifications] Push registration skipped:', error);
    }
    return null;
  }
}
