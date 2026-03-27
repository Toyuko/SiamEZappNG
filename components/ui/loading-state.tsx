import { ActivityIndicator, Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-6" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator color={colors.primary} />
      <Text style={{ color: colors.mutedText }}>{label}</Text>
    </View>
  );
}
