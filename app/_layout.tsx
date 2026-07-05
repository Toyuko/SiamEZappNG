import 'react-native-gesture-handler';
import '../global.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';

import { AppProviders } from '../components/providers/app-providers';
import { VoiceFirstProvider } from '../components/voice/VoiceFirstProvider';
import { LaunchAnimation } from '../components/ui/LaunchAnimation';
import { useAuth } from '../hooks/use-auth';
import { LaunchAnimationProvider } from '../hooks/use-launch-animation';
import { useAutoUpdate } from '../hooks/useAutoUpdate';
import { installDefaultFont } from '../lib/theme/install-default-font';
import { useAuthStore } from '../store/auth-store';

// Work around Android Fabric mount race in some navigation transitions.
enableScreens(false);

// Apply Geist as the default font on native (web uses global.css).
installDefaultFont();

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { bootstrapSession } = useAuth();
  const { accessToken, isGuest, isBootstrapping, userRole, user } = useAuthStore();
  const isFreelancer = userRole === 'freelancer' || user?.role === 'freelancer';
  // Non-blocking: Geist applies as soon as it loads (web also wires it via CSS).
  useFonts({ Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold });
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });
  const isE2E = process.env.EXPO_PUBLIC_E2E === 'true';
  const { checkForUpdate } = useAutoUpdate();
  // Keep the navigator mounted; only gate the launch overlay on bootstrap/fonts.
  const isReady = !isBootstrapping && (fontsLoaded || Boolean(fontError) || isE2E);
  const [launchComplete, setLaunchComplete] = useState(isE2E);
  const launchVariant = accessToken && !isGuest ? 'brief' : 'full';

  const launchContext = useMemo(
    () => ({ launchComplete: launchComplete || isE2E }),
    [isE2E, launchComplete],
  );
  const handleLaunchComplete = useCallback(() => setLaunchComplete(true), []);

  // Fallback: never leave the launch overlay blocking the app if the animation callback fails.
  useEffect(() => {
    if (launchComplete || !isReady) {
      return;
    }
    const fallbackMs = launchVariant === 'brief' ? 4_000 : 8_000;
    const timeout = setTimeout(() => setLaunchComplete(true), fallbackMs);
    return () => clearTimeout(timeout);
  }, [isReady, launchComplete, launchVariant]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (!launchComplete) {
      return;
    }
    void checkForUpdate();
  }, [checkForUpdate, launchComplete]);

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

  return (
    <LaunchAnimationProvider value={launchContext}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        {!launchComplete ? (
          <LaunchAnimation ready={isReady} variant={launchVariant} onComplete={handleLaunchComplete} />
        ) : null}
      </View>
    </LaunchAnimationProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <VoiceFirstProvider>
        <RootNavigator />
      </VoiceFirstProvider>
    </AppProviders>
  );
}
