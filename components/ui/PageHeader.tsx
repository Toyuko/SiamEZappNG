import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useOscillation } from '../../lib/anim/use-oscillation';
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
  /** Optional pill label (web: “Professional Thai Services”) */
  badge?: string;
  onBack?: () => void;
  backLabel?: string;
  rightSlot?: ReactNode;
  /** Primary — full-width CTA on gradient (white pill) */
  primaryCta?: PageHeaderCta;
  secondaryCta?: PageHeaderCta;
};

const ctaShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.22,
  shadowRadius: 14,
  elevation: 8,
} as const;

/** Slowly drifting decorative orb that gives the hero some life. */
function FloatingOrb({
  size,
  color,
  top,
  bottom,
  left,
  right,
  range,
  phaseOffset,
  duration,
}: {
  size: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  range: number;
  phaseOffset: number;
  duration: number;
}) {
  const t = useOscillation(duration, phaseOffset);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + t.value * 0.45,
    transform: [
      { translateY: t.value * range },
      { translateX: t.value * (range * 0.5) },
      { scale: 1 + t.value * 0.22 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          bottom,
          left,
          right,
        },
        animatedStyle,
      ]}
    />
  );
}

/** Subtle infinite pulse to keep the primary CTA feeling alive. */
function PulseView({ children, style }: { children: ReactNode; style?: object }) {
  const p = useOscillation(1500);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + p.value * 0.05 }] }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function PageHeader({ title, subtitle, badge, onBack, backLabel, rightSlot, primaryCta, secondaryCta }: PageHeaderProps) {
  const singlePrimary = Boolean(primaryCta && !secondaryCta);

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
      <FloatingOrb size={170} color="rgba(255,206,45,0.55)" top={-52} right={-30} range={52} phaseOffset={0} duration={3400} />
      <FloatingOrb size={124} color="rgba(255,255,255,0.30)" bottom={-40} left={-28} range={-46} phaseOffset={0.33} duration={4200} />
      <FloatingOrb size={80} color="rgba(255,206,45,0.42)" top={38} left={26} range={40} phaseOffset={0.66} duration={5000} />
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
            ...ctaShadow,
            shadowOpacity: 0.18,
          }}
        >
          <Text style={{ color: accentForeground, fontSize: 13, fontWeight: '700' }}>{badge}</Text>
        </View>
      ) : null}

      <View className="flex-row items-start justify-between gap-3" style={{ marginTop: badge ? spacing.stackMd : 0 }}>
        <View className="min-w-0 flex-1">
          <Text className="text-3xl font-bold tracking-tight" style={{ color: '#ffffff' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-2.5 text-base leading-6" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot}
      </View>

      {primaryCta || secondaryCta ? (
        <View style={{ marginTop: spacing.stackLg + 4, gap: spacing.stackMd }}>
          {primaryCta ? (
            <PulseView style={singlePrimary ? { borderRadius: radius.button, ...ctaShadow } : undefined}>
              <Button
                label={primaryCta.label}
                onPress={primaryCta.onPress}
                variant={primaryCta.variant ?? 'accent'}
                gradient={primaryCta.variant !== 'secondary'}
                rounded
                fullWidth
                backgroundColor={primaryCta.variant === 'secondary' ? '#ffffff' : undefined}
                textColor={primaryCta.variant === 'secondary' ? siam.blue.dark : accentForeground}
                borderColor={primaryCta.variant === 'secondary' ? 'transparent' : undefined}
              />
            </PulseView>
          ) : null}
          {secondaryCta ? (
            <Button
              label={secondaryCta.label}
              onPress={secondaryCta.onPress}
              variant="secondary"
              rounded
              fullWidth
              backgroundColor="transparent"
              textColor="#ffffff"
              borderColor="rgba(255,255,255,0.85)"
            />
          ) : null}
        </View>
      ) : null}
    </LinearGradient>
  );
}
