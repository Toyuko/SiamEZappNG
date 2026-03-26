import { Text, View } from 'react-native';

export function EmptyState({ label }: { label: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-slate-300 p-6">
      <Text className="text-center text-slate-500">{label}</Text>
    </View>
  );
}
