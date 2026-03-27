import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  const { colors } = useTheme();

  return (
    <View className={`rounded-3xl p-5 ${className}`} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
      {children}
    </View>
  );
}
