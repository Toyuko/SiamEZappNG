import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

import { t } from '../i18n/i18n';

export const JOB_APPROVED_NOTIFICATION_TYPE = 'job_approved';

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

