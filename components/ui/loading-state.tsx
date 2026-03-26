import { ActivityIndicator, Text, View } from 'react-native';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator />
      <Text className="text-slate-500">{label}</Text>
    </View>
  );
}
