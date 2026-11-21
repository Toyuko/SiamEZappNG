import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight } from 'lucide-react-native';
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
 * Conversion hero — brand first, gold BOOK CTA dominant.
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
  const titleParts = title.split(' EZ');
  const hasEzSplit = titleParts.length > 1 && title.toUpperCase().includes('EZ');

  return (
    <FadeInView delay={0} distance={18}>
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={{
          borderRadius: radius.hero,
          paddingHorizontal: spacing.cardPadding,
          paddingTop: spacing.cardPadding,
          paddingBottom: spacing.cardPadding + 6,
          overflow: 'hidden',
          minHeight: 220,
          ...shadows.cardMedium,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -40,
            top: -32,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: 'rgba(255, 211, 47, 0.14)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -28,
            bottom: -48,
            width: 180,
            height: 110,
            borderTopLeftRadius: 90,
            borderTopRightRadius: 90,
            backgroundColor: 'rgba(16, 44, 118, 0.5)',
          }}
        />

        <View className="flex-row items-center gap-3">
          <Image source={LOGO} style={{ width: 52, height: 52, borderRadius: 26 }} />
          <View className="min-w-0 flex-1">
            {badge ? (
              <Text
                className="text-[11px] font-semibold uppercase"
                style={{ color: siam.yellow.DEFAULT, letterSpacing: 0.7 }}
              >
                {badge}
              </Text>
            ) : null}
            {hasEzSplit ? (
              <Text className="text-[28px] font-bold tracking-tight leading-8" style={{ color: '#FFFFFF' }}>
                {titleParts[0]}{' '}
                <Text style={{ color: siam.yellow.DEFAULT }}>EZ</Text>
                {titleParts.slice(1).join(' EZ')}
              </Text>
            ) : (
              <Text className="text-[28px] font-bold tracking-tight leading-8" style={{ color: '#FFFFFF' }}>
                {title}
              </Text>
            )}
          </View>
        </View>

        <Text className="mt-3 text-[15px] leading-5" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {subtitle}
        </Text>

        <View className="mt-5 gap-2.5">
          <Button
            label={primaryLabel}
            variant="accent"
            gradient
            minHeight={56}
            textColor={accentForeground}
            onPress={onPrimaryPress}
          >
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color={accentForeground} strokeWidth={2.4} />
              <Text className="text-[17px] font-semibold" style={{ color: accentForeground }}>
                {primaryLabel}
              </Text>
              <ChevronRight size={18} color={accentForeground} strokeWidth={2.4} />
            </View>
          </Button>
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
