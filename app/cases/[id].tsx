import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { Header } from '../../components/ui/Header';
import { LoadingState } from '../../components/ui/loading-state';
import { useCase } from '../../hooks/use-case';
import { t } from '../../lib/i18n/i18n';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export default function CaseDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isGuest, accessToken } = useAuthStore();
  const { data, isLoading, isError, refetch, error } = useCase(id);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, isGuest, router]);

  if (isLoading) {
    return <LoadingState label={t('caseDetail.loading')} />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : t('caseDetail.loadError')} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <Header title={t('caseDetail.title')} subtitle={t('caseDetail.caseId', { id })} gradient />

      <Card className="mt-4">
        <Text className="font-semibold" style={{ color: colors.text }}>{data?.title ?? t('caseDetail.untitled')}</Text>
        <Text className="mt-2" style={{ color: colors.mutedText }}>{data?.serviceType ?? t('caseDetail.serviceTypeUnavailable')}</Text>
        <Text className="mt-2 text-xs" style={{ color: colors.mutedText }}>{t('cases.status')}: {String(data?.status ?? 'UNKNOWN')}</Text>
      </Card>
    </SafeAreaView>
  );
}
