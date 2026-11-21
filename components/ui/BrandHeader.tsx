import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { heroGradient, radius, shadows, spacing } from '../../lib/theme/tokens';

type BrandHeaderProps = {
  title: string;
  subtitle?: string;
};

/**
 * Compact branded blue header for secondary screens (More, Account).
 */
export function BrandHeader({ title, subtitle }: BrandHeaderProps) {
  return (
    <LinearGradient
      colors={[...heroGradient.colors]}
      start={heroGradient.start}
      end={heroGradient.end}
      style={{
        borderRadius: radius.xl,
        paddingHorizontal: spacing.cardPadding,
        paddingVertical: spacing.cardPadding,
        overflow: 'hidden',
        ...shadows.cardMedium,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -30,
          top: -24,
          width: 110,
          height: 110,
          borderRadius: 55,
          backgroundColor: 'rgba(21, 89, 214, 0.35)',
        }}
      />
      <Text className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1.5 text-sm leading-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {subtitle}
        </Text>
      ) : null}
    </LinearGradient>
  );
}
