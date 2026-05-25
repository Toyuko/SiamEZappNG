import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AutoApprovalTimer } from '../../components/freelancer/auto-approval-timer';
import { LiveIndicator } from '../../components/tracking/LiveIndicator';
import { LiveTransitToggle } from '../../components/tracking/LiveTransitToggle';
import { TrackingMessageToastBanner } from '../../components/tracking/TrackingMessageToast';
import { TrackingStepper } from '../../components/tracking/TrackingStepper';
import { UpdateProgressSheet } from '../../components/tracking/UpdateProgressSheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useFreelancerJobTracking } from '../../hooks/use-freelancer-job-tracking';
import { useJobTrackingRealtime } from '../../hooks/use-job-tracking-realtime';
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
  const isFocused = useIsFocused();
  const { data, isLoading, isError, refetch, error, isRefetching } = useFreelancerJobTracking(jobId);
  const { isLive, toasts, dismissToast } = useJobTrackingRealtime({
    jobId,
    role: 'freelancer',
    enabled: isFocused && !isLoading && !isError && Boolean(data),
  });
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

  const { job, steps, trackingHistory, isTrackable } = data;
  const progress =
    isTrackable && steps && job.trackingStatus
      ? trackingProgressPercent(steps, job.trackingStatus)
      : 0;
  const canUpdate = job.status === 'in_progress' && isTrackable && steps;
  const awaitingReview = isAwaitingReviewStatus(job.status);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {toasts.length > 0 ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 8,
            left: 16,
            right: 16,
            zIndex: 20,
            gap: 8,
          }}
        >
          {toasts.map((toast) => (
            <TrackingMessageToastBanner
              key={toast.id}
              toast={toast}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <PageHeader
          title={job.title}
          subtitle={
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 24 }}>
                {t('tracking.trackTraceTitle')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>#{job.id}</Text>
              <LiveIndicator active={isLive} />
            </View>
          }
          onBack={handleBack}
          backLabel={t('tracking.backToPortal')}
          rightSlot={
            <Pressable
              onPress={() => router.push(`/freelancer/chat/${jobId}`)}
              accessibilityRole="button"
              accessibilityLabel={t('tracking.openChat')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{t('tracking.openChat')}</Text>
            </Pressable>
          }
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
              trackingHistory={trackingHistory}
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
