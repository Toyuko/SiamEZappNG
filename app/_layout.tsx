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
  const { accessToken, isBootstrapping } = useAuthStore();

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const isProtectedRoute = segments[0] !== '(auth)';
    const inAuthGroup = segments[0] === '(auth)';
    if (!accessToken && isProtectedRoute) {
      router.replace('/(auth)/login');
    }
    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [accessToken, isBootstrapping, router, segments]);

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
