import { Pressable, Text, View } from 'react-native';

type ErrorStateProps = {
  label?: string;
  onRetry?: () => void;
};

export function ErrorState({ label = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <Text className="text-center text-red-700">{label}</Text>
      {onRetry ? (
        <Pressable className="mt-3 self-center rounded-lg bg-red-600 px-4 py-2" onPress={onRetry}>
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
