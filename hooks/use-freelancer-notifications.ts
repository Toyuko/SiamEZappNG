import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

import {
  handleFreelancerNotification,
  registerForFreelancerPushNotifications,
} from '../lib/notifications/freelancer-notifications';
import { useAuthStore } from '../store/auth-store';

export function useFreelancerNotifications() {
  const userRole = useAuthStore((state) => state.userRole);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);

  useEffect(() => {
    if (userRole !== 'freelancer' || !accessToken || isGuest) {
      return;
    }

    void registerForFreelancerPushNotifications();

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      handleFreelancerNotification,
    );
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => handleFreelancerNotification(response.notification),
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [accessToken, isGuest, userRole]);
}
