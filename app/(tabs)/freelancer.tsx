import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ActiveJobsTrack } from '../../components/freelancer/active-jobs-track';
import { JobFeedSection } from '../../components/freelancer/job-feed-section';
import { RevenueTracker } from '../../components/freelancer/revenue-tracker';
import { SubscriptionCard } from '../../components/freelancer/subscription-card';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAcceptFreelancerJob } from '../../hooks/use-accept-freelancer-job';
import { useFreelancerDashboard } from '../../hooks/use-freelancer-dashboard';
import { useMarkJobComplete } from '../../hooks/use-mark-job-complete';
import type { FreelancerVerificationStatus } from '../../features/freelancer/freelancer.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

function verificationLabel(status: FreelancerVerificationStatus | undefined) {
  switch (status) {
    case 'verified':
      return t('freelancer.verified');
    case 'rejected':
      return t('freelancer.verificationRejected');
    default:
      return t('freelancer.verificationPending');
  }
}

export default function FreelancerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, accessToken, isGuest } = useAuthStore();
  const dashboardQuery = useFreelancerDashboard();
  const acceptMutation = useAcceptFreelancerJob();
  const completeMutation = useMarkJobComplete();
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);
  const [completingJobId, setCompletingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    // Only redirect confirmed clients — avoid racing bootstrap before role is hydrated.
    if (userRole === 'client') {
      router.replace('/(tabs)/dashboard');
    }
  }, [accessToken, isGuest, router, userRole]);

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingJobId(jobId);
    try {
      await acceptMutation.mutateAsync(jobId);
    } catch (error) {
      Alert.alert(
        t('freelancer.acceptErrorTitle'),
        error instanceof Error ? error.message : t('freelancer.acceptErrorMessage'),
      );
    } finally {
      setAcceptingJobId(null);
    }
  };

  const handleMarkDone = async (jobId: string) => {
    setCompletingJobId(jobId);
    try {
      await completeMutation.mutateAsync(jobId);
      Alert.alert(t('freelancer.markDoneSuccessTitle'), t('freelancer.markDoneSuccessMessage'));
    } catch (error) {
      Alert.alert(
        t('freelancer.markDoneErrorTitle'),
        error instanceof Error ? error.message : t('freelancer.markDoneErrorMessage'),
      );
    } finally {
      setCompletingJobId(null);
    }
  };

  if (dashboardQuery.isLoading) {
    return <LoadingState label={t('freelancer.dashboard.loading')} />;
  }

  if (dashboardQuery.isError) {
    const error = dashboardQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('freelancer.dashboard.loadError')}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const data = dashboardQuery.data;
  const profile = data?.profile;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <View style={{ gap: spacing.stackMd }}>
          <PageHeader title={t('freelancer.dashboardTitle')} subtitle={t('freelancer.dashboardSubtitle')} />
          <Badge
            label={
              profile?.verificationStatus === 'verified' && profile.averageRating > 0
                ? `${verificationLabel(profile.verificationStatus)} · ★ ${profile.averageRating.toFixed(1)}`
                : verificationLabel(profile?.verificationStatus)
            }
            variant={profile?.verificationStatus === 'verified' ? 'success' : 'info'}
          />
        </View>

        {data?.revenue ? <RevenueTracker revenue={data.revenue} /> : null}

        <SubscriptionCard />

        <JobFeedSection
          jobs={data?.openJobs ?? []}
          acceptingJobId={acceptingJobId}
          onAcceptJob={(jobId) => void handleAcceptJob(jobId)}
        />

        <ActiveJobsTrack
          jobs={data?.activeJobs ?? []}
          completingJobId={completingJobId}
          onMarkDone={(jobId) => void handleMarkDone(jobId)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
