import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import {
  getNotificationJobId,
  registerPushTokenWithBackend,
} from '../services/notificationService';
import { handleFreelancerNotification } from '../lib/notifications/freelancer-notifications';
import { useAuthStore } from '../store/auth-store';

function navigateToJobChat(
  router: ReturnType<typeof useRouter>,
  jobId: string,
  role: 'client' | 'freelancer' | null,
) {
  const path =
    role === 'freelancer' ? `/freelancer/chat/${jobId}` : `/client/chat/${jobId}`;
  router.push(path);
}

export function usePushNotifications() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userRole = useAuthStore((state) => state.userRole);

  useEffect(() => {
    if (!accessToken || isGuest) {
      return;
    }

    void registerPushTokenWithBackend().catch(() => undefined);

    const onNotification = (notification: Notifications.Notification) => {
      handleFreelancerNotification(notification);
    };

    const onResponse = (response: Notifications.NotificationResponse) => {
      handleFreelancerNotification(response.notification);

      const data = response.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      const jobId = getNotificationJobId(data);
      if (jobId) {
        navigateToJobChat(router, jobId, userRole);
      }
    };

    const receivedSubscription = Notifications.addNotificationReceivedListener(onNotification);
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(onResponse);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [accessToken, isGuest, router, userRole]);
}
