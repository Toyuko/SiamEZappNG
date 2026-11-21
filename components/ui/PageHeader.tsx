import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';

import { accentForeground, heroGradient, radius, siam, spacing } from '../../lib/theme/tokens';
import { Button } from './Button';

export type PageHeaderCta = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

type PageHeaderProps = {
  title: string;
  subtitle?: string | ReactNode;
  /** Optional pill label */
  badge?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  primaryCta?: PageHeaderCta;
  secondaryCta?: PageHeaderCta;
};

/**
 * Shared branded header — static decorative orbs (no continuous loops).
 */
export function PageHeader({ title, subtitle, badge, onBack, backLabel, rightSlot, primaryCta, secondaryCta }: PageHeaderProps) {
  return (
    <LinearGradient
      colors={[...heroGradient.colors]}
      start={heroGradient.start}
      end={heroGradient.end}
      style={{
        borderRadius: radius.xl,
        padding: spacing.cardPadding,
        overflow: 'hidden',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: 'rgba(21, 89, 214, 0.35)',
          top: -48,
          right: -28,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(5, 42, 112, 0.45)',
          bottom: -36,
          left: -24,
        }}
      />

      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={backLabel ?? 'Back'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            minHeight: 48,
            minWidth: 48,
            marginBottom: spacing.stackSm,
            gap: 4,
          }}
        >
          <ChevronLeft size={22} color="#ffffff" strokeWidth={2.5} />
          {backLabel ? (
            <Text className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.95)' }}>
              {backLabel}
            </Text>
          ) : null}
        </Pressable>
      ) : null}

      {badge ? (
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: siam.yellow.DEFAULT,
            paddingHorizontal: spacing.stackMd + 2,
            paddingVertical: 6,
            borderRadius: radius.full,
            marginBottom: spacing.stackMd,
          }}
        >
          <Text style={{ color: accentForeground, fontSize: 13, fontWeight: '700' }}>{badge}</Text>
        </View>
      ) : null}

      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-3xl font-bold tracking-tight" style={{ color: '#ffffff' }}>
            {title}
          </Text>
          {typeof subtitle === 'string' ? (
            <Text className="mt-2 text-sm leading-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
        {rightSlot}
      </View>

      {primaryCta || secondaryCta ? (
        <View className="mt-4 gap-2.5">
          {primaryCta ? (
            <Button
              label={primaryCta.label}
              variant={primaryCta.variant === 'secondary' ? 'secondary' : 'accent'}
              gradient={primaryCta.variant !== 'secondary'}
              onPress={primaryCta.onPress}
              textColor={primaryCta.variant === 'secondary' ? '#FFFFFF' : accentForeground}
              backgroundColor={primaryCta.variant === 'secondary' ? 'rgba(255,255,255,0.12)' : undefined}
              borderColor={primaryCta.variant === 'secondary' ? 'rgba(255,255,255,0.35)' : undefined}
            />
          ) : null}
          {secondaryCta ? (
            <Button
              label={secondaryCta.label}
              variant="secondary"
              onPress={secondaryCta.onPress}
              backgroundColor="rgba(255,255,255,0.12)"
              borderColor="rgba(255,255,255,0.35)"
              textColor="#FFFFFF"
            />
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
}
