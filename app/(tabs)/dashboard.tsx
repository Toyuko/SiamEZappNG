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
import { useInvoices } from '../../hooks/use-invoices';
import { useLifeEventRuns } from '../../hooks/use-life-events';
import { useMarketplaceEngagement } from '../../hooks/use-marketplace-engagement';
import { useRecommendations } from '../../hooks/use-recommendations';
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
  const { colors } = useTheme();
  const overviewQuery = useDashboard();
  const casesQuery = useCases();
  const invoicesQuery = useInvoices();
  const goalsQuery = useGoals();
  const lifeEventsQuery = useLifeEventRuns();
  const engagementQuery = useMarketplaceEngagement();
  const recommendationsQuery = useRecommendations();

  const isLoading = overviewQuery.isLoading && (casesQuery.isLoading || invoicesQuery.isLoading);
  const isError = overviewQuery.isError && casesQuery.isError && invoicesQuery.isError;
  const error = (overviewQuery.error ?? casesQuery.error ?? invoicesQuery.error) as unknown;
  const cases = toArray<{ id: string }>(casesQuery.data);
  const invoices = toArray<{ status?: string }>(invoicesQuery.data);
  const activeCases = overviewQuery.data?.activeCases ?? cases.length;
  const pendingInvoices =
    overviewQuery.data?.pendingInvoices ??
    invoices.filter(
      (invoice) => invoice.status !== 'PAID' && invoice.status !== 'paid'
    ).length;
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
          void invoicesQuery.refetch();
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader
          title={t('dashboard.title')}
          subtitle="Your Platform workspace — goals, journeys, bookings, and saved listings."
          primaryCta={{ label: t('cta.bookNow'), onPress: () => router.push('/(tabs)/book') }}
        />

        <TrustStats />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[46%] flex-1">
            <MetricCard title={t('dashboard.activeCases')} value={activeCases} />
          </View>
          <View className="min-w-[46%] flex-1">
            <MetricCard title={t('dashboard.pendingInvoices')} value={pendingInvoices} />
          </View>
          <View className="min-w-[46%] flex-1">
            <MetricCard title="Active goals" value={activeGoals} />
          </View>
          <View className="min-w-[46%] flex-1">
            <MetricCard title="Life events" value={activeLifeEvents} />
          </View>
        </View>

        <Section title="Quick links" subtitle="Continue where you left off on web or mobile">
          <Card>
            <View className="gap-2">
              {[
                { label: 'Concierge', path: '/(tabs)/concierge' as const, meta: 'Journey AI' },
                { label: 'Search', path: '/(tabs)/search' as const, meta: 'Unified' },
                { label: 'Goals', path: '/(tabs)/goals' as const, meta: `${activeGoals} active` },
                {
                  label: 'Life Events',
                  path: '/(tabs)/life-events' as const,
                  meta: `${activeLifeEvents} in progress`,
                },
                {
                  label: 'Workflows',
                  path: '/(tabs)/workflows' as const,
                  meta: 'Templates & runs',
                },
                {
                  label: 'Saved & Compare',
                  path: '/(tabs)/saved' as const,
                  meta: `${savedCount} saved`,
                },
                { label: 'Seller hub', path: '/(tabs)/seller' as const, meta: 'Views & enquiries' },
                { label: 'Documents', path: '/(tabs)/documents' as const, meta: 'Files & uploads' },
                { label: 'Cases', path: '/(tabs)/cases' as const, meta: `${activeCases} open` },
              ].map((item) => (
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

        <Section title="Recommendations" subtitle="From the Platform recommendation engine">
          <Card>
            {suggestions.length === 0 ? (
              <Text className="text-sm leading-5" style={{ color: colors.muted }}>
                Browse listings and set goals to unlock personalized suggestions.
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
                ? `${recentUpdates} recent updates from your Platform workspace.`
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
