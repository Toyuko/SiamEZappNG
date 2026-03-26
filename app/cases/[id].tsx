import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { useCase } from '../../hooks/use-case';
import { useAuthStore } from '../../store/auth-store';

export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isGuest, accessToken } = useAuthStore();
  const { data, isLoading, isError, refetch, error } = useCase(id);

  useEffect(() => {
    if (isGuest || !accessToken) {
      router.replace('/(auth)/login');
    }
  }, [accessToken, isGuest, router]);

  if (isLoading) {
    return <LoadingState label="Loading case..." />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : 'Unable to load case.'} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Case Detail</Text>
      <Text className="mt-2 text-slate-500">Case ID: {id}</Text>

      <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="font-semibold text-slate-900">{data?.title ?? 'Untitled case'}</Text>
        <Text className="mt-2 text-slate-500">{data?.serviceType ?? 'Service type unavailable'}</Text>
        <Text className="mt-2 text-xs text-slate-400">Status: {String(data?.status ?? 'UNKNOWN')}</Text>
      </View>
    </SafeAreaView>
  );
}
