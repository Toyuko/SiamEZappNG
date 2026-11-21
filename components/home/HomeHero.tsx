import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View } from 'react-native';

import { accentForeground, heroGradient, radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { Button } from '../ui/Button';
import { FadeInView } from '../ui/FadeInView';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

type HomeHeroProps = {
  badge?: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
};

/**
 * Compact conversion hero — brand first, gold BOOK CTA second.
 */
export function HomeHero({
  badge,
  title,
  subtitle,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: HomeHeroProps) {
  return (
    <FadeInView delay={0} distance={18}>
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={{
          borderRadius: radius.xl,
          paddingHorizontal: spacing.cardPadding,
          paddingTop: spacing.cardPadding,
          paddingBottom: spacing.cardPadding + 4,
          overflow: 'hidden',
          ...shadows.cardMedium,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -36,
            top: -28,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: 'rgba(255, 211, 41, 0.12)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -20,
            bottom: -40,
            width: 160,
            height: 90,
            borderTopLeftRadius: 80,
            borderTopRightRadius: 80,
            backgroundColor: 'rgba(16, 43, 114, 0.45)',
          }}
        />

        <View className="flex-row items-center gap-3">
          <Image source={LOGO} style={{ width: 48, height: 48, borderRadius: 24 }} />
          <View className="min-w-0 flex-1">
            {badge ? (
              <Text
                className="text-[11px] font-semibold uppercase"
                style={{ color: siam.yellow.DEFAULT, letterSpacing: 0.6 }}
              >
                {badge}
              </Text>
            ) : null}
            <Text className="text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
              {title}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-sm leading-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {subtitle}
        </Text>

        <View className="mt-4 gap-2.5">
          <Button
            label={primaryLabel}
            variant="accent"
            gradient
            onPress={onPrimaryPress}
            textColor={accentForeground}
          />
          {secondaryLabel && onSecondaryPress ? (
            <Button
              label={secondaryLabel}
              variant="secondary"
              onPress={onSecondaryPress}
              backgroundColor="rgba(255,255,255,0.12)"
              borderColor="rgba(255,255,255,0.35)"
              textColor="#FFFFFF"
            />
          ) : null}
        </View>
      </LinearGradient>
    </FadeInView>
  );
}
