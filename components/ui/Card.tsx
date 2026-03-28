import type { ReactNode } from 'react';
import { View } from 'react-native';

import { type CardShadowLevel, radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Visual depth — stats use medium, featured quotes use strong */
  shadow?: CardShadowLevel;
  /** Tighter padding and radius for carousels and dense layouts */
  compact?: boolean;
};

function resolveShadow(level: CardShadowLevel, isDark: boolean) {
  if (isDark) {
    if (level === 'medium') {
      return shadows.cardDarkMedium;
    }
    if (level === 'strong') {
      return shadows.cardDarkStrong;
    }
    return shadows.cardDark;
  }
  if (level === 'medium') {
    return shadows.cardMedium;
  }
  if (level === 'strong') {
    return shadows.cardStrong;
  }
  return shadows.cardLight;
}

export function Card({ children, className = '', shadow: shadowLevel = 'default', compact = false }: CardProps) {
  const { colors, isDark } = useTheme();
  const shadowStyle = resolveShadow(shadowLevel, isDark);

  return (
    <View
      className={`${className}`}
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: compact ? radius.lg : radius.xl,
        padding: compact ? spacing.cardPaddingCompact : spacing.cardPadding,
        ...shadowStyle,
      }}
    >
      {children}
    </View>
  );
}
