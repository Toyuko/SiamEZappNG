import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { AutoApprovalTimer } from '../../components/freelancer/auto-approval-timer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useFreelancerJob } from '../../hooks/use-freelancer-job';
import { useMarkJobComplete } from '../../hooks/use-mark-job-complete';
import { t } from '../../lib/i18n/i18n';
import { jobProgressPercent } from '../../lib/jobs/auto-approve';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export default function FreelancerJobDetailScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userRole, isGuest, accessToken } = useAuthStore();
  const { data, isLoading, isError, refetch, error } = useFreelancerJob(id);
  const completeMutation = useMarkJobComplete();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole === 'client') {
      router.replace('/(tabs)/dashboard');
    }
  }, [accessToken, isGuest, router, userRole]);

  const canMarkDone = data?.status === 'in_progress';

  const handleMarkDone = async () => {
    if (!id) {
      return;
    }
    setIsSubmitting(true);
    try {
      await completeMutation.mutateAsync(id);
      await refetch();
      Alert.alert(t('freelancer.markDoneSuccessTitle'), t('freelancer.markDoneSuccessMessage'));
    } catch (submitError) {
      Alert.alert(
        t('freelancer.markDoneErrorTitle'),
        submitError instanceof Error ? submitError.message : t('freelancer.markDoneErrorMessage'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState label={t('freelancer.jobDetail.loading')} />;
  }

  if (isError) {
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('freelancer.jobDetail.loadError')}
        onRetry={() => void refetch()}
      />
    );
  }

  const progress = data ? jobProgressPercent(data.status) : 0;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={data?.title ?? t('freelancer.jobDetail.untitled')}
          subtitle={t('freelancer.progress')}
        />

        <AutoApprovalTimer status={data?.status ?? 'open'} completionSubmittedAt={data?.completionSubmittedAt} />

        <Card>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t(`freelancer.status.${data?.status ?? 'open'}`)}
          </Text>
          <Text className="mt-1 text-base font-semibold" style={{ color: colors.foreground }}>
            {progress}%
          </Text>
          <Text className="mt-3 text-sm leading-5" style={{ color: colors.muted }}>
            {data?.description}
          </Text>
          <Text className="mt-3 text-sm" style={{ color: colors.muted }}>
            {data?.postedBy.name ?? data?.postedBy.email}
          </Text>
          {data ? (
            <Text className="mt-2 text-sm font-medium" style={{ color: colors.foreground }}>
              {formatJobAmount(data.amount, data.currency)}
            </Text>
          ) : null}
        </Card>

        {canMarkDone ? (
          <Button
            label={t('freelancer.markAsDone')}
            disabled={isSubmitting || completeMutation.isPending}
            onPress={() => void handleMarkDone()}
          />
        ) : null}

        <Button
          label={t('freelancer.viewTracking')}
          variant="secondary"
          onPress={() => router.push(`/freelancer/tracking/${id}`)}
        />

        {data?.status === 'completed' ? (
          <Text className="text-center text-sm" style={{ color: '#d97706' }}>
            {t('freelancer.awaitingClientApproval')}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
