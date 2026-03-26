import { Redirect } from 'expo-router';

import { LoadingState } from '../components/ui/loading-state';
import { useAuthStore } from '../store/auth-store';

export default function Index() {
  const { accessToken, isGuest, isBootstrapping } = useAuthStore();
  if (isBootstrapping) {
    return <LoadingState label="Restoring your session..." />;
  }
  return <Redirect href={accessToken || isGuest ? '/(tabs)/home' : '/(auth)/login'} />;
}
