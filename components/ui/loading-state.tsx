import { ActivityIndicator, Text, View } from 'react-native';

import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background, gap: spacing.stackMd, paddingVertical: spacing.sectionGap }}
    >
      <ActivityIndicator color={colors.primary} size="large" />
      <Text className="text-center text-base" style={{ color: colors.muted }}>
        {label}
      </Text>
    </View>
  );
}
