import { Text, View } from 'react-native';

export function MetricCard({ title, value }: { title: string; value: string | number }) {
  return (
    <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
      <Text className="text-sm text-slate-500">{title}</Text>
      <Text className="mt-2 text-2xl font-bold text-slate-900">{value}</Text>
    </View>
  );
}
