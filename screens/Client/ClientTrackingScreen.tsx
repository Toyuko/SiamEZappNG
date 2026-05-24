import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ClientApprovalBanner } from '../../components/tracking/ClientApprovalBanner';
import { TrackingStepper } from '../../components/tracking/TrackingStepper';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useClientJobTracking } from '../../hooks/use-client-job-tracking';
import { t } from '../../lib/i18n/i18n';
import { isAwaitingReviewStatus } from '../../lib/jobs/auto-approve';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { approveClientJob } from '../../services/trackingApi';
import { useAuthStore } from '../../store/auth-store';

type ClientTrackingScreenProps = {
  jobId: string;
};

export function ClientTrackingScreen({ jobId }: ClientTrackingScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isGuest, accessToken } = useAuthStore();
  const { data, isLoading, isError, refetch, error, isRefetching } = useClientJobTracking(jobId);
  const [confirming, setConfirming] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, isGuest, router]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  async function handleApprove() {
    setConfirming(true);
    setApproveError(null);
    try {
      await approveClientJob(jobId);
      await refetch();
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : t('tracking.approveFailed'));
    } finally {
      setConfirming(false);
    }
  }

  if (isLoading) {
    return <LoadingState label={t('tracking.clientLoading')} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('tracking.clientLoadError')}
        onRetry={() => void refetch()}
      />
    );
  }

  const { job, steps, trackingHistory, isTrackable } = data;
  const showApprovalBanner =
    isAwaitingReviewStatus(job.status) &&
    job.trackingStatus === 'DELIVERED' &&
    job.completionSubmittedAt != null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {showApprovalBanner && job.completionSubmittedAt ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
          <ClientApprovalBanner
            completionSubmittedAt={job.completionSubmittedAt}
            onConfirm={() => void handleApprove()}
            confirming={confirming}
            error={approveError}
          />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <PageHeader title={job.title} subtitle={t('tracking.pageTitle')} />

        <Card>
          {job.service ? (
            <Text className="text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
              {t('tracking.serviceName')}: {job.service.name}
            </Text>
          ) : null}
          {job.freelancer ? (
            <Text className="mt-2 text-sm" style={{ color: colors.foreground }}>
              {t('tracking.assignedFreelancer')}: {job.freelancer.displayName}
            </Text>
          ) : (
            <Text className="mt-2 text-sm" style={{ color: colors.muted }}>
              {t('tracking.freelancerPending')}
            </Text>
          )}
          <Text className="mt-2 text-xs" style={{ color: colors.muted }}>
            {t('tracking.currentStatus')}: {job.trackingStatus ?? '—'}
          </Text>
        </Card>

        {job.status === 'approved' ? (
          <View
            style={{
              borderRadius: 12,
              backgroundColor: `${colors.success}18`,
              padding: spacing.cardPaddingCompact,
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.success }}>
              {t('tracking.jobApproved')}
            </Text>
          </View>
        ) : null}

        {isTrackable && steps ? (
          <Card>
            <Text className="mb-4 text-base font-semibold" style={{ color: colors.foreground }}>
              {t('tracking.timelineTitle')}
            </Text>
            <TrackingStepper
              steps={steps}
              currentStatus={job.trackingStatus}
              trackingHistory={trackingHistory}
              emptyMessage={t('tracking.noHistoryYet')}
            />
          </Card>
        ) : (
          <Card>
            <Text className="text-sm leading-5" style={{ color: colors.muted }}>
              {t('tracking.notTrackable')}
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
