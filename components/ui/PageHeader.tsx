import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { heroGradient, radius, siam, spacing } from '../../lib/theme/tokens';
import { Button } from './Button';

export type PageHeaderCta = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional pill label (web: “Professional Thai Services”) */
  badge?: string;
  rightSlot?: ReactNode;
  /** Primary — full-width blue CTA; secondary — outline on gradient */
  primaryCta?: PageHeaderCta;
  secondaryCta?: PageHeaderCta;
};

export function PageHeader({ title, subtitle, badge, rightSlot, primaryCta, secondaryCta }: PageHeaderProps) {
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
          <Text className="text-3xl font-bold" style={{ color: '#ffffff' }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-2 text-base leading-6" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {rightSlot}
      </View>

      {primaryCta || secondaryCta ? (
        <View style={{ marginTop: spacing.stackLg, gap: spacing.stackSm }}>
          {primaryCta ? (
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
