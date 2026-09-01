import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { MetricCard } from '../../components/ui/metric-card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { useCorporateDashboard } from '../../hooks/use-corporate-dashboard';
import { isCorporateRole } from '../../lib/auth/role';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

export function CorporateDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { userRole, user, accessToken, isGuest } = useAuthStore();
  const isCorporate = isCorporateRole(userRole, user?.role);
  const dashboardQuery = useCorporateDashboard();

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
      return;
    }
    if (userRole && !isCorporate) {
      router.replace(userRole === 'freelancer' ? '/(tabs)/freelancer' : '/(tabs)/dashboard');
    }
  }, [accessToken, isCorporate, isGuest, router, userRole]);

  if (dashboardQuery.isLoading) {
    return <LoadingState label={t('corporate.dashboard.loading')} />;
  }

  if (dashboardQuery.isError) {
    const error = dashboardQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('corporate.dashboard.loadError')}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const metrics = dashboardQuery.data?.metrics;
  const companyName = dashboardQuery.data?.company.name;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={t('corporate.dashboard.title')}
          subtitle={companyName ? t('corporate.dashboard.subtitleNamed', { name: companyName }) : t('corporate.dashboard.subtitle')}
          badge={t('corporate.verifiedBusiness')}
        />

        <Section title={t('corporate.dashboard.insights')} subtitle={t('corporate.dashboard.insightsSubtitle')}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.stackMd, paddingRight: 8 }}
          >
            <View style={{ width: 160 }}>
              <MetricCard title={t('corporate.metrics.activeJobs')} value={metrics?.activeJobs ?? 0} />
            </View>
            <View style={{ width: 160 }}>
              <MetricCard title={t('corporate.metrics.appClicks')} value={metrics?.appClicks ?? 0} />
            </View>
            <View style={{ width: 160 }}>
              <MetricCard title={t('corporate.metrics.adImpressions')} value={metrics?.adImpressions ?? 0} />
            </View>
            <View style={{ width: 160 }}>
              <MetricCard title={t('corporate.metrics.hiredFreelancers')} value={metrics?.hiredFreelancers ?? 0} />
            </View>
          </ScrollView>
        </Section>

        <Section title={t('corporate.dashboard.quickActions')} subtitle={t('corporate.dashboard.quickActionsSubtitle')}>
          <Card>
            <View className="gap-3">
              <Button
                label={t('corporate.dashboard.postJob')}
                gradient
                onPress={() => router.push('/(tabs)/corporate-jobs')}
              />
              <Button
                label={t('corporate.dashboard.launchAd')}
                variant="accent"
                gradient
                onPress={() => router.push('/(tabs)/corporate-ads')}
              />
              <Button
                label="Smart Hiring"
                variant="secondary"
                onPress={() => router.push('/smart-match')}
              />
              <Button
                label={t('corporate.dashboard.viewPublicProfile')}
                variant="secondary"
                onPress={() =>
                  router.push(`/company/${dashboardQuery.data?.company.slug ?? 'demo'}` as never)
                }
              />
            </View>
          </Card>
        </Section>

        <Section title={t('corporate.dashboard.recentJobs')} subtitle={t('corporate.dashboard.recentJobsSubtitle')}>
          {(dashboardQuery.data?.recentJobs ?? []).slice(0, 3).map((job) => (
            <Card key={job.id} compact>
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {job.title}
              </Text>
              <Text className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>
                {job.status.replace('_', ' ')}
              </Text>
              <Text className="mt-2 text-sm leading-5" style={{ color: colors.muted }} numberOfLines={2}>
                {job.description}
              </Text>
            </Card>
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
