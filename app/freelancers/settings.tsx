import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { FreelancerSettingsScreen } from '../../screens/Freelancer/FreelancerSettingsScreen';
import { useAuthStore } from '../../store/auth-store';

export default function FreelancerSettingsRoute() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);

  useEffect(() => {
    if (!accessToken || isGuest) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, isGuest, router]);

  if (!accessToken || isGuest) {
    return null;
  }

  return <FreelancerSettingsScreen />;
}
