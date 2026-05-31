import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ReviewBottomSheet } from '../../components/ReviewBottomSheet';
import { Button } from '../../components/ui/Button';
import { ClientApprovalBanner } from '../../components/tracking/ClientApprovalBanner';
import { LiveIndicator } from '../../components/tracking/LiveIndicator';
import { TrackingMessageToastBanner } from '../../components/tracking/TrackingMessageToast';
import { TrackingStepper } from '../../components/tracking/TrackingStepper';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useClientJobTracking } from '../../hooks/use-client-job-tracking';
import { useJobTrackingRealtime } from '../../hooks/use-job-tracking-realtime';
import { t } from '../../lib/i18n/i18n';
import { isAwaitingReviewStatus } from '../../lib/jobs/auto-approve';
import { isReviewEligible } from '../../lib/jobs/review-eligibility';
import { reviewDismissedKey, reviewSubmittedKey } from '../../lib/jobs/review-storage';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { approveClientJob } from '../../services/trackingApi';
import { useAuthStore } from '../../store/auth-store';

type ClientTrackingScreenProps = {
  jobId: string;
};

export function ClientTrackingScreen({ jobId }: ClientTrackingScreenProps) {
  const router = useRouter();
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/cases');
  }, [router]);
  const { colors } = useTheme();
  const { isGuest, accessToken } = useAuthStore();
  const isFocused = useIsFocused();
  const { data, isLoading, isError, refetch, error, isRefetching } = useClientJobTracking(jobId);
  const { isLive, toasts, dismissToast } = useJobTrackingRealtime({
    jobId,
    role: 'client',
    enabled: isFocused && !isLoading && !isError && Boolean(data),
  });
  const [confirming, setConfirming] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [reviewSheetVisible, setReviewSheetVisible] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [reviewPrefsLoaded, setReviewPrefsLoaded] = useState(false);
  const wasReviewEligibleRef = useRef(false);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, isGuest, router]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [submitted, dismissed] = await Promise.all([
        AsyncStorage.getItem(reviewSubmittedKey(jobId)),
        AsyncStorage.getItem(reviewDismissedKey(jobId)),
      ]);
      if (cancelled) {
        return;
      }
      if (submitted === '1') {
        setHasSubmittedReview(true);
      }
      if (dismissed === '1') {
        setReviewDismissed(true);
      }
      setReviewPrefsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const reviewEligible = data
    ? isReviewEligible(data.job.status, data.job.trackingStatus)
    : false;

  useEffect(() => {
    if (!data || !reviewPrefsLoaded || hasSubmittedReview) {
      return;
    }
    if (reviewEligible && !wasReviewEligibleRef.current && !reviewDismissed) {
      setReviewSheetVisible(true);
    }
    wasReviewEligibleRef.current = reviewEligible;
  }, [data, reviewEligible, reviewDismissed, hasSubmittedReview, reviewPrefsLoaded]);

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

  const handleReviewClose = useCallback(() => {
    setReviewSheetVisible(false);
    if (!hasSubmittedReview) {
      setReviewDismissed(true);
      void AsyncStorage.setItem(reviewDismissedKey(jobId), '1');
    }
  }, [hasSubmittedReview, jobId]);

  const handleReviewSubmitted = useCallback(() => {
    setHasSubmittedReview(true);
    setReviewSheetVisible(false);
    void AsyncStorage.setItem(reviewSubmittedKey(jobId), '1');
  }, [jobId]);

  const showLeaveReviewCta = reviewEligible && reviewDismissed && !hasSubmittedReview;

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
      {toasts.length > 0 ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: showApprovalBanner ? 72 : 8,
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
        <PageHeader
          title={job.title}
          subtitle={
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 24 }}>
                {t('tracking.pageTitle')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>#{job.id}</Text>
              <LiveIndicator active={isLive} />
            </View>
          }
          onBack={handleBack}
          backLabel={t('tracking.backToPortal')}
          rightSlot={
            <Pressable
              onPress={() => router.push(`/client/chat/${jobId}`)}
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
            {showLeaveReviewCta ? (
              <View style={{ marginTop: spacing.stackLg, paddingTop: spacing.stackMd }}>
                <Button
                  label={t('tracking.leaveReview')}
                  onPress={() => setReviewSheetVisible(true)}
                />
              </View>
            ) : null}
          </Card>
        ) : (
          <Card>
            <Text className="text-sm leading-5" style={{ color: colors.muted }}>
              {t('tracking.notTrackable')}
            </Text>
            {showLeaveReviewCta ? (
              <View style={{ marginTop: spacing.stackLg, paddingTop: spacing.stackMd }}>
                <Button
                  label={t('tracking.leaveReview')}
                  onPress={() => setReviewSheetVisible(true)}
                />
              </View>
            ) : null}
          </Card>
        )}
      </ScrollView>

      <ReviewBottomSheet
        visible={reviewSheetVisible}
        jobId={jobId}
        freelancerName={job.freelancer?.displayName}
        onClose={handleReviewClose}
        onSubmitted={handleReviewSubmitted}
      />
    </SafeAreaView>
  );
}
