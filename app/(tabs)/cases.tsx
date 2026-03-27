import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { Header } from '../../components/ui/Header';
import { LoadingState } from '../../components/ui/loading-state';
import { StatusBadge } from '../../components/ui/status-badge';
import { useCases } from '../../hooks/use-cases';
import { t } from '../../lib/i18n/i18n';
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

  return (
    <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <Header title={t('cases.title')} subtitle={t('cases.subtitle')} gradient />

      <FlatList
        className="mt-5"
        data={data ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState label={t('cases.empty')} />}
        renderItem={({ item }) => (
          <Card className="mb-3">
            <Pressable onPress={() => router.push(`/cases/${item.id}`)}>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>{item.title}</Text>
              <Text className="mt-1" style={{ color: colors.mutedText }}>{item.serviceType}</Text>
              <View className="mt-3 flex-row items-center justify-between">
                <StatusBadge status={item.status} />
                <Text className="text-xs" style={{ color: colors.mutedText }}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
              </View>
            </Pressable>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
