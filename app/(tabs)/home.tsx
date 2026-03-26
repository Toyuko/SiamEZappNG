import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { MetricCard } from '../../components/ui/metric-card';
import { useDashboard } from '../../hooks/use-dashboard';

export default function HomeScreen() {
  const { data, isLoading, isError, refetch, error } = useDashboard();

  if (isLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : 'Unable to load dashboard.'} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View>
          <Text className="text-2xl font-bold text-slate-900">Client Dashboard</Text>
          <Text className="mt-1 text-slate-500">Track your active immigration and legal work in real-time.</Text>
        </View>

        <View className="flex-row gap-3">
          <MetricCard title="Active Cases" value={data?.activeCases ?? 0} />
          <MetricCard title="Pending Invoices" value={data?.pendingInvoices ?? 0} />
        </View>

        <View className="rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-sm text-slate-500">Recent updates</Text>
          <Text className="mt-2 text-2xl font-bold text-slate-900">{data?.recentUpdates ?? 0}</Text>
          <Text className="mt-2 text-slate-500">Open your case timeline for full details.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
