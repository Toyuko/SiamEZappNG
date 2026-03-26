import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';

import { AppProviders } from '../components/providers/app-providers';
import { LoadingState } from '../components/ui/loading-state';
import { useAuth } from '../hooks/use-auth';
import { useAuthStore } from '../store/auth-store';

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrapSession } = useAuth();
  const { accessToken, isGuest, isBootstrapping } = useAuthStore();

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const isProtectedRoute = segments[0] !== '(auth)';
    const inAuthGroup = segments[0] === '(auth)';
    const [topLevel, tabRoute] = segments as string[];
    const isSensitiveRoute =
      topLevel === 'cases' ||
      topLevel === 'documents' ||
      topLevel === 'dashboard' ||
      topLevel === 'payments' ||
      (topLevel === '(tabs)' && (tabRoute === 'cases' || tabRoute === 'documents'));

    if (!accessToken && !isGuest && isProtectedRoute) {
      router.replace('/(auth)/login');
    }
    if (isGuest && isSensitiveRoute) {
      router.replace('/(auth)/login');
    }
    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [accessToken, isBootstrapping, isGuest, router, segments]);

  if (isBootstrapping) {
    return <LoadingState label="Preparing your workspace..." />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
