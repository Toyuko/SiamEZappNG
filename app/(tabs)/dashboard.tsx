import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { MetricCard } from '../../components/ui/metric-card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { TrustStats } from '../../components/ui/TrustStats';
import { useCases } from '../../hooks/use-cases';
import { useDashboard } from '../../hooks/use-dashboard';
import { useGoals } from '../../hooks/use-goals';
import { useLifeEventRuns } from '../../hooks/use-life-events';
import { useMarketplaceEngagement } from '../../hooks/use-marketplace-engagement';
import { useRecommendations } from '../../hooks/use-recommendations';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (value && typeof value === 'object') {
    const maybeItems = (value as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) {
      return maybeItems as T[];
    }
    const maybeResults = (value as { results?: unknown }).results;
    if (Array.isArray(maybeResults)) {
      return maybeResults as T[];
    }
  }
  return [];
}

export default function DashboardScreen() {
  const router = useRouter();
  const softLaunch = useSoftLaunch();
  const { colors } = useTheme();
  const overviewQuery = useDashboard();
  const casesQuery = useCases();
  const goalsQuery = useGoals();
  const lifeEventsQuery = useLifeEventRuns();
  const engagementQuery = useMarketplaceEngagement();
  const recommendationsQuery = useRecommendations();

  const isLoading = overviewQuery.isLoading || casesQuery.isLoading;
  const isError = overviewQuery.isError || casesQuery.isError;
  const error = (overviewQuery.error ?? casesQuery.error) as unknown;
  const cases = toArray<{ id: string }>(casesQuery.data);
  const activeCases = overviewQuery.data?.activeCases ?? cases.length;
  const recentUpdates = overviewQuery.data?.recentUpdates ?? 0;
  const activeGoals = (goalsQuery.data ?? []).filter((g) => g.status === 'active').length;
  const activeLifeEvents = (lifeEventsQuery.data ?? []).filter((r) => r.status === 'active').length;
  const savedCount = engagementQuery.data?.savedCount ?? 0;
  const suggestions = recommendationsQuery.data?.suggestions ?? [];

  if (isLoading) {
    return <LoadingState label={t('dashboard.loading')} />;
  }

  if (isError) {
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('dashboard.loadError')}
        onRetry={() => {
          void overviewQuery.refetch();
          void casesQuery.refetch();
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={t('dashboard.title')}
          subtitle={softLaunch.enabled ? t('dashboard.softLaunchSubtitle') : t('dashboard.fullSubtitle')}
          primaryCta={
            softLaunch.enabled
              ? { label: t('dashboard.askSiamez'), onPress: () => router.push('/(tabs)/concierge') }
              : { label: t('cta.bookNow'), onPress: () => router.push('/(tabs)/book') }
          }
        />

        <TrustStats />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <MetricCard title={t('dashboard.activeCases')} value={activeCases} />
          </View>
          {softLaunch.enabled ? null : (
            <>
              <View className="min-w-[46%] flex-1">
                <MetricCard title="Active goals" value={activeGoals} />
              </View>
              <View className="min-w-[46%] flex-1">
                <MetricCard title="Life events" value={activeLifeEvents} />
              </View>
            </>
          )}
        </View>

        <Section title={t('dashboard.quickLinks')} subtitle={t('dashboard.quickLinksSubtitle')}>
          <Card>
            <View className="gap-2">
              {[
                { label: t('dashboard.askSiamez'), path: '/(tabs)/concierge' as const, meta: 'Concierge', softLaunch: true },
                { label: 'Search', path: '/(tabs)/search' as const, meta: 'Unified', softLaunch: true },
                {
                  label: 'Goals',
                  path: '/(tabs)/goals' as const,
                  meta: `${activeGoals} active`,
                  softLaunch: false,
                },
                {
                  label: 'Life Events',
                  path: '/(tabs)/life-events' as const,
                  meta: `${activeLifeEvents} in progress`,
                  softLaunch: false,
                },
                {
                  label: 'Workflows',
                  path: '/(tabs)/workflows' as const,
                  meta: 'Templates & runs',
                  softLaunch: false,
                },
                {
                  label: 'Saved & Compare',
                  path: '/(tabs)/saved' as const,
                  meta: `${savedCount} saved`,
                  softLaunch: false,
                },
                {
                  label: 'Seller hub',
                  path: '/(tabs)/seller' as const,
                  meta: 'Views & enquiries',
                  softLaunch: true,
                },
                {
                  label: t('documents.title'),
                  path: '/(tabs)/documents' as const,
                  meta: 'Files & uploads',
                  softLaunch: true,
                },
                {
                  label: t('cases.title'),
                  path: '/(tabs)/cases' as const,
                  meta: `${activeCases} open`,
                  softLaunch: true,
                },
              ]
                .filter((item) => !softLaunch.enabled || item.softLaunch !== false)
                .map((item) => (
                <Pressable
                  key={item.path}
                  onPress={() => router.push(item.path)}
                  className="flex-row items-center justify-between rounded-xl px-3 py-3"
                  style={{ backgroundColor: colors.background }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {item.label}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    {item.meta}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Section>

        <Section title={t('dashboard.recommendations')} subtitle={t('dashboard.recommendationsSubtitle')}>
          <Card>
            {suggestions.length === 0 ? (
              <Text className="text-sm leading-5" style={{ color: colors.muted }}>
                {softLaunch.enabled
                  ? t('dashboard.recommendationsEmptySoft')
                  : t('dashboard.recommendationsEmpty')}
              </Text>
            ) : (
              <View className="gap-3">
                {suggestions.slice(0, 5).map((item) => (
                  <View key={`${item.kind}-${item.id}`}>
                    <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4" style={{ color: colors.muted }}>
                      {item.reason}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </Section>

        <Section title={t('dashboard.recentActivity')} subtitle={t('dashboard.recentActivitySubtitle')}>
          <Card>
            <Text className="text-sm leading-5" style={{ color: colors.muted }}>
              {recentUpdates > 0
                ? t('dashboard.activityUpdates', { count: recentUpdates })
                : activeCases > 0
                  ? t('dashboard.activityWithCases')
                  : t('dashboard.activityNoCases')}
            </Text>
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
