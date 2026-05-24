import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AutoApprovalTimer } from '../../components/freelancer/auto-approval-timer';
import { LiveTransitToggle } from '../../components/tracking/LiveTransitToggle';
import { TrackingStepper } from '../../components/tracking/TrackingStepper';
import { UpdateProgressSheet } from '../../components/tracking/UpdateProgressSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useFreelancerJobTracking } from '../../hooks/use-freelancer-job-tracking';
import { useLiveTransitTracking } from '../../hooks/use-live-transit-tracking';
import { t } from '../../lib/i18n/i18n';
import { isAwaitingReviewStatus } from '../../lib/jobs/auto-approve';
import { trackingProgressPercent } from '../../lib/jobs/tracking-steps';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type JobTrackingScreenProps = {
  jobId: string;
};

export function JobTrackingScreen({ jobId }: JobTrackingScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, isGuest, accessToken } = useAuthStore();
  const { data, isLoading, isError, refetch, error, isRefetching } = useFreelancerJobTracking(jobId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { liveTransitActive, liveTransitBusy, setLiveTransitActive } = useLiveTransitTracking(jobId);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/freelancer');
  }, [router]);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole === 'client') {
      router.replace('/(tabs)/dashboard');
    }
  }, [accessToken, isGuest, router, userRole]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return <LoadingState label={t('tracking.freelancerLoading')} />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('tracking.freelancerLoadError')}
        onRetry={() => void refetch()}
      />
    );
  }

  const { job, steps, isTrackable } = data;
  const progress =
    isTrackable && steps && job.trackingStatus
      ? trackingProgressPercent(steps, job.trackingStatus)
      : 0;
  const canUpdate = job.status === 'in_progress' && isTrackable && steps;
  const awaitingReview = isAwaitingReviewStatus(job.status);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <PageHeader
          title={job.title}
          subtitle={t('tracking.trackTraceTitle')}
          onBack={handleBack}
          backLabel={t('tracking.backToPortal')}
        />

        {awaitingReview && job.completionSubmittedAt ? (
          <AutoApprovalTimer status={job.status} completionSubmittedAt={job.completionSubmittedAt} />
        ) : null}

        <Card>
          {job.service ? (
            <Text className="text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
              {job.service.name}
            </Text>
          ) : null}
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            {t(`freelancer.status.${job.status}`)}
          </Text>
          {isTrackable && steps ? (
            <View className="mt-3" style={{ gap: spacing.stackSm }}>
              <View className="flex-row justify-between">
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {t('freelancer.progress')}
                </Text>
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                  {progress}%
                </Text>
              </View>
              <View style={{ height: 8, borderRadius: 9999, backgroundColor: colors.border, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: 9999,
                  }}
                />
              </View>
            </View>
          ) : (
            <Text className="mt-3 text-sm leading-5" style={{ color: colors.muted }}>
              {t('tracking.notTrackable')}
            </Text>
          )}
        </Card>

        {isTrackable && steps ? (
          <Card>
            <Text className="mb-4 text-base font-semibold" style={{ color: colors.foreground }}>
              {t('tracking.timelineTitle')}
            </Text>
            <TrackingStepper
              steps={steps}
              currentStatus={job.trackingStatus}
              notes={job.trackingNotes}
              emptyMessage={t('tracking.noHistoryYet')}
            />
          </Card>
        ) : null}

        {canUpdate ? (
          <>
            <LiveTransitToggle
              active={liveTransitActive}
              busy={liveTransitBusy}
              disabled={liveTransitBusy}
              onToggle={(value) => void setLiveTransitActive(value)}
            />
            <Button
              label={t('tracking.updateProgress')}
              disabled={liveTransitBusy}
              onPress={() => setSheetOpen(true)}
            />
          </>
        ) : null}
      </ScrollView>

      {canUpdate && steps ? (
        <UpdateProgressSheet
          visible={sheetOpen}
          jobId={jobId}
          steps={steps}
          currentStatus={job.trackingStatus}
          currentNotes={job.trackingNotes}
          onClose={() => setSheetOpen(false)}
          onSaved={() => void refetch()}
        />
      ) : null}
    </SafeAreaView>
  );
}
