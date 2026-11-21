import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightSlot?: ReactNode;
  showChevron?: boolean;
  danger?: boolean;
};

export function MenuRow({
  icon,
  title,
  subtitle,
  onPress,
  rightSlot,
  showChevron = true,
  danger = false,
}: MenuRowProps) {
  const { colors, isDark } = useTheme();
  const tone = danger ? colors.danger : colors.primary;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={title}
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 py-3.5"
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <View
        className="h-10 w-10 items-center justify-center"
        style={{
          borderRadius: radius.md,
          backgroundColor: isDark ? 'rgba(21,89,214,0.2)' : siam.blue.tint,
        }}
      >
        <Ionicons name={icon} size={18} color={tone} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-base font-semibold" style={{ color: danger ? colors.danger : colors.foreground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs leading-4" style={{ color: colors.muted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot}
      {showChevron && onPress ? <Ionicons name="chevron-forward" size={18} color={colors.muted} /> : null}
    </Pressable>
  );
}
