import { Redirect } from 'expo-router';

import { LoadingState } from '../components/ui/loading-state';
import { t } from '../lib/i18n/i18n';
import { useAuthStore } from '../store/auth-store';

export default function Index() {
  const { accessToken, isGuest, isBootstrapping } = useAuthStore();
  if (isBootstrapping) {
    return <LoadingState label={t('common.loading')} />;
  }
  if (accessToken && !isGuest) {
    return <Redirect href="/(tabs)/dashboard" />;
  }
  return <Redirect href={isGuest ? '/(tabs)/home' : '/(auth)/login'} />;
}
