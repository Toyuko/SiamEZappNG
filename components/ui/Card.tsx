import type { ReactNode } from 'react';
import { View } from 'react-native';

import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  const { colors, isDark } = useTheme();
  const shadowStyle = isDark ? shadows.cardDark : shadows.cardLight;

  return (
    <View
      className={`${className}`}
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radius.xl,
        padding: spacing.cardPadding,
        ...shadowStyle,
      }}
    >
      {children}
    </View>
  );
}
