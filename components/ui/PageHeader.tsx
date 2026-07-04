import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';

import { heroGradient, radius, siam, spacing } from '../../lib/theme/tokens';
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
            backgroundColor: `${siam.yellow.DEFAULT}33`,
            paddingHorizontal: spacing.stackMd,
            paddingVertical: 6,
            borderRadius: radius.full,
          }}
        >
          <Text style={{ color: siam.yellow.DEFAULT, fontSize: 13, fontWeight: '600' }}>{badge}</Text>
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
            <View style={singlePrimary ? { borderRadius: radius.button, ...ctaShadow } : undefined}>
              <Button
                label={primaryCta.label}
                onPress={primaryCta.onPress}
                variant={primaryCta.variant ?? 'primary'}
                rounded
                fullWidth
                backgroundColor="#ffffff"
                textColor={siam.blue.dark}
                borderColor="transparent"
              />
            </View>
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
