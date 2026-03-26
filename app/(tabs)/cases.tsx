import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { StatusBadge } from '../../components/ui/status-badge';
import { useCases } from '../../hooks/use-cases';

export default function CasesScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, error } = useCases();

  if (isLoading) {
    return <LoadingState label="Loading cases..." />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : 'Unable to load cases.'} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">My Cases</Text>
      <Text className="mt-1 text-slate-500">Follow status, updates, and documents for each case.</Text>

      <FlatList
        className="mt-5"
        data={data ?? []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState label="No active cases found." />}
        renderItem={({ item }) => (
          <Pressable
            className="mb-3 rounded-2xl border border-slate-200 bg-white p-4"
            onPress={() => router.push(`/cases/${item.id}`)}
          >
            <Text className="text-base font-semibold text-slate-900">{item.title}</Text>
            <Text className="mt-1 text-slate-500">{item.serviceType}</Text>
            <View className="mt-3 flex-row items-center justify-between">
              <StatusBadge status={item.status} />
              <Text className="text-xs text-slate-400">{new Date(item.updatedAt).toLocaleDateString()}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
