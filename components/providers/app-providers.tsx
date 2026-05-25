import { PropsWithChildren, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { usePushNotifications } from '../../hooks/use-push-notifications';
import { setI18nLanguage } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { useTheme } from '../../lib/theme/theme';

function AppEnvironment() {
  const language = useLanguageStore((state) => state.language);
  const { isDark } = useTheme();

  usePushNotifications();

  useEffect(() => {
    setI18nLanguage(language);
  }, [language]);

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export function AppProviders({ children }: PropsWithChildren) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 20_000,
            retry: 1,
          },
        },
      }),
    [],
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppEnvironment />
        {children}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
