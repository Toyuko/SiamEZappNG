import { Redirect } from 'expo-router';

import { LoadingState } from '../components/ui/loading-state';
import { isCorporateRole } from '../lib/auth/role';
import { t } from '../lib/i18n/i18n';
import { useAuthStore } from '../store/auth-store';

export default function Index() {
  const { accessToken, isGuest, isBootstrapping, userRole, user } = useAuthStore();
  const isFreelancer = userRole === 'freelancer' || user?.role === 'freelancer';
  const isCorporate = isCorporateRole(userRole, user?.role);
  if (isBootstrapping) {
    return <LoadingState label={t('common.loading')} />;
  }
  if (accessToken && !isGuest) {
    if (isCorporate) {
      return <Redirect href="/(tabs)/corporate" />;
    }
    if (isFreelancer) {
      return <Redirect href="/(tabs)/freelancer" />;
    }
    return <Redirect href="/(tabs)/services" />;
  }
  return <Redirect href={isGuest ? '/(tabs)/services' : '/(auth)/login'} />;
}
