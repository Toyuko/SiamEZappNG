import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/status-badge';
import { useCases } from '../../hooks/use-cases';
import { trackFunnel } from '../../lib/analytics/funnel';
import { formatDisplayDate } from '../../lib/datetime/format';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type TabId = 'active' | 'completed';

const COMPLETED_STATUSES = new Set(['COMPLETED', 'CANCELLED', 'CLOSED', 'DONE']);

export default function CasesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading, isError, refetch, error } = useCases();
  const [tab, setTab] = useState<TabId>('active');

  const cases = data ?? [];
  const filtered = useMemo(() => {
    if (tab === 'completed') {
      return cases.filter((item) => COMPLETED_STATUSES.has(String(item.status).toUpperCase()));
    }
    return cases.filter((item) => !COMPLETED_STATUSES.has(String(item.status).toUpperCase()));
  }, [cases, tab]);

  const activeCount = cases.filter((item) => !COMPLETED_STATUSES.has(String(item.status).toUpperCase())).length;

  if (isLoading) {
    return <LoadingState label={t('cases.loading')} />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : t('cases.loadError')} onRetry={() => void refetch()} />;
  }

  const listHeader = (
    <View style={{ gap: spacing.sectionGap, marginBottom: spacing.stackMd }}>
      <PageHeader title={t('cases.title')} subtitle={t('cases.subtitle')} />
      <View className="flex-row gap-2">
        {(
          [
            { id: 'active' as const, label: t('cases.tabActive', { count: activeCount }) },
            { id: 'completed' as const, label: t('cases.tabCompleted') },
          ] as const
        ).map((item) => {
          const selected = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: radius.full,
                alignItems: 'center',
                backgroundColor: selected ? siam.yellow.DEFAULT : colors.card,
                borderWidth: 1,
                borderColor: selected ? siam.yellow.dark : colors.border,
              }}
            >
              <Text className="text-sm font-semibold" style={{ color: selected ? siam.blue.navy : colors.foreground }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={{ gap: 16 }}>
            <EmptyState label={t('cases.empty')} />
            <Button
              label={t('home.bookService')}
              variant="accent"
              gradient
              onPress={() => {
                trackFunnel('booking_started', { source: 'cases_empty' });
                router.push('/(tabs)/book');
              }}
            />
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: spacing.stackMd }}
        renderItem={({ item }) => (
          <Card>
            <Pressable onPress={() => router.push(`/cases/${item.id}`)}>
              <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                {item.title}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                {item.serviceType}
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <StatusBadge status={item.status} />
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {formatDisplayDate(item.updatedAt, language)}
                </Text>
              </View>
            </Pressable>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
