import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { useInvoices } from '../../hooks/use-invoices';

export default function BookScreen() {
  const { data, isLoading, isError, refetch, error } = useInvoices();

  if (isLoading) {
    return <LoadingState label="Loading invoices..." />;
  }

  if (isError) {
    return <ErrorState label={error instanceof Error ? error.message : 'Unable to load invoices.'} onRetry={() => void refetch()} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold text-slate-900">Invoices</Text>
      <Text className="mt-1 text-slate-500">Track invoice status and due dates.</Text>

      <View className="mt-4 gap-3">
        {(data ?? []).length === 0 ? (
          <EmptyState label="No invoices found." />
        ) : (
          data?.map((invoice) => (
            <View key={invoice.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="font-semibold text-slate-900">{invoice.invoiceNo}</Text>
              <Text className="mt-1 text-slate-500">
                {invoice.currency} {invoice.amount.toLocaleString()}
              </Text>
              <Text className="mt-2 text-xs text-slate-400">
                Due {new Date(invoice.dueDate).toLocaleDateString()} - {invoice.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}
