import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '../../lib/theme/theme';

type HeaderProps = {
  title: string;
  subtitle?: string;
  gradient?: boolean;
  rightSlot?: ReactNode;
};

export function Header({ title, subtitle, gradient = false, rightSlot }: HeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View className="rounded-3xl p-6" style={{ backgroundColor: gradient ? colors.primary : isDark ? '#020617' : '#0f172a' }}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-white">{title}</Text>
          {subtitle ? <Text className="mt-2 text-base text-blue-100">{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
    </View>
  );
}
