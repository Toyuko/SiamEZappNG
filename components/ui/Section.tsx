import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type SectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function Section({ title, subtitle, children, className = '' }: SectionProps) {
  const { colors } = useTheme();

  return (
    <View className={`space-y-3 ${className}`}>
      <View>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm" style={{ color: colors.mutedText }}>{subtitle}</Text> : null}
      </View>
      <View className="space-y-3">{children}</View>
    </View>
  );
}
