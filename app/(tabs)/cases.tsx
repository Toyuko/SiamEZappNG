import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { FadeInView } from '../../components/ui/FadeInView';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/status-badge';
import { TrustStats } from '../../components/ui/TrustStats';
import { useCases } from '../../hooks/use-cases';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function CasesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data, isLoading, isError, refetch, error } = useCases();

  if (isLoading) {
    return <LoadingState label={t('cases.loading')} />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : t('cases.loadError')} onRetry={() => void refetch()} />;
  }

  const listHeader = (
    <View style={{ gap: spacing.sectionGap, marginBottom: spacing.stackMd }}>
      <FadeInView delay={0} distance={22}>
        <PageHeader title={t('cases.title')} subtitle={t('cases.subtitle')} />
      </FadeInView>
      <FadeInView delay={100}>
        <TrustStats />
      </FadeInView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<EmptyState label={t('cases.empty')} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: spacing.stackMd }}
        renderItem={({ item, index }) => (
          <FadeInView delay={Math.min(index * 60, 300)} distance={16} scaleFrom={0.98}>
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
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
            </Card>
          </FadeInView>
        )}
      />
    </SafeAreaView>
  );
}
