import 'react-native-gesture-handler';
import '../global.css';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';

import { AppProviders } from '../components/providers/app-providers';
import { LoadingState } from '../components/ui/loading-state';
import { useAuth } from '../hooks/use-auth';
import { t } from '../lib/i18n/i18n';
import { useAuthStore } from '../store/auth-store';

// Work around Android Fabric mount race in some navigation transitions.
enableScreens(false);

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrapSession } = useAuth();
  const { accessToken, isGuest, isBootstrapping, userRole, user } = useAuthStore();
  const isFreelancer = userRole === 'freelancer' || user?.role === 'freelancer';
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const isE2E = process.env.EXPO_PUBLIC_E2E === 'true';

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (fontError && __DEV__) {
      console.warn('[fonts] Icon fonts failed to load', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    const isProtectedRoute = segments[0] !== '(auth)';
    const inAuthGroup = segments[0] === '(auth)';
    const [topLevel, tabRoute] = segments as string[];
    const isSensitiveRoute =
      topLevel === 'cases' ||
      topLevel === 'client' ||
      topLevel === 'documents' ||
      topLevel === 'dashboard' ||
      topLevel === 'payments' ||
      topLevel === 'freelancer' ||
      (topLevel === '(tabs)' &&
        (tabRoute === 'dashboard' ||
          tabRoute === 'cases' ||
          tabRoute === 'documents' ||
          tabRoute === 'profile' ||
          tabRoute === 'freelancer'));
    const isAuthenticated = Boolean(accessToken) && !isGuest;

    if (!accessToken && !isGuest && isProtectedRoute) {
      router.replace('/(auth)/login');
      return;
    }
    if (isGuest && isSensitiveRoute) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated && userRole === 'client' && (topLevel === 'freelancer' || tabRoute === 'freelancer')) {
      router.replace('/(tabs)/dashboard');
      return;
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace(isFreelancer ? '/(tabs)/freelancer' : '/(tabs)/dashboard');
      return;
    }
  }, [accessToken, isBootstrapping, isFreelancer, isGuest, router, segments, userRole]);

  if (isBootstrapping || (!fontsLoaded && !isE2E)) {
    return <LoadingState label={t('common.loading')} />;
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
