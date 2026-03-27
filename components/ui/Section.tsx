import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { spacing } from '../../lib/theme/tokens';
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
    <View className={`${className}`} style={{ gap: spacing.stackLg }}>
      <View style={{ gap: spacing.stackSm }}>
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: spacing.stackMd }}>{children}</View>
    </View>
  );
}
