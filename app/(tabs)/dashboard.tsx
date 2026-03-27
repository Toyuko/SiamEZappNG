import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { Header } from '../../components/ui/Header';
import { LoadingState } from '../../components/ui/loading-state';
import { MetricCard } from '../../components/ui/metric-card';
import { Section } from '../../components/ui/Section';
import { useCases } from '../../hooks/use-cases';
import { useInvoices } from '../../hooks/use-invoices';
import { t } from '../../lib/i18n/i18n';
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
  const casesQuery = useCases();
  const invoicesQuery = useInvoices();

  const isLoading = casesQuery.isLoading || invoicesQuery.isLoading;
  const isError = casesQuery.isError || invoicesQuery.isError;
  const error = (casesQuery.error ?? invoicesQuery.error) as unknown;
  const cases = toArray<{ id: string }>(casesQuery.data);
  const invoices = toArray<{ status?: string }>(invoicesQuery.data);
  const activeCases = cases.length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== 'PAID').length;

  if (isLoading) {
    return <LoadingState label={t('dashboard.loading')} />;
  }

  if (isError) {
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('dashboard.loadError')}
        onRetry={() => {
          void casesQuery.refetch();
          void invoicesQuery.refetch();
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} gradient />

        <View className="flex-row gap-3">
          <MetricCard title={t('dashboard.activeCases')} value={activeCases} />
          <MetricCard title={t('dashboard.pendingInvoices')} value={pendingInvoices} />
        </View>

        <Section title={t('dashboard.recentActivity')} subtitle={t('dashboard.recentActivitySubtitle')}>
          <Card>
            <Text style={{ color: colors.mutedText }}>
              {activeCases > 0
                ? t('dashboard.activityWithCases')
                : t('dashboard.activityNoCases')}
            </Text>
          </Card>
          <Button label={t('dashboard.startBooking')} onPress={() => router.push('/(tabs)/book')} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

