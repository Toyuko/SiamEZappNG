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
 * Conversion hero — matches screenshot: deep blue card, yellow Book CTA, white secondary.
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
    <FadeInView delay={0} distance={16}>
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={{
          borderRadius: radius.hero,
          paddingHorizontal: spacing.cardPadding,
          paddingTop: spacing.cardPadding,
          paddingBottom: spacing.cardPadding + 4,
          overflow: 'hidden',
          ...shadows.cardMedium,
        }}
      >
        {/* Soft lighter-blue orb — screenshot decorative circle */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -48,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: 'rgba(21, 89, 214, 0.35)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: -36,
            bottom: -56,
            width: 160,
            height: 100,
            borderTopLeftRadius: 80,
            borderTopRightRadius: 80,
            backgroundColor: 'rgba(5, 42, 112, 0.55)',
          }}
        />

        <View className="flex-row items-center gap-3">
          <Image source={LOGO} style={{ width: 44, height: 44, borderRadius: 22 }} />
          <View className="min-w-0 flex-1">
            {badge ? (
              <Text
                className="text-[11px] font-semibold uppercase"
                style={{ color: siam.yellow.DEFAULT, letterSpacing: 0.8 }}
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

        <Text className="mt-3 text-[14px] leading-5" style={{ color: 'rgba(255,255,255,0.92)' }}>
          {subtitle}
        </Text>

        <View className="mt-4 gap-2.5">
          <Button
            label={primaryLabel}
            variant="accent"
            gradient
            minHeight={54}
            textColor={accentForeground}
            onPress={onPrimaryPress}
          >
            <View className="flex-row items-center gap-2">
              <Calendar size={18} color={accentForeground} strokeWidth={2.4} />
              <Text className="text-[16px] font-semibold" style={{ color: accentForeground }}>
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
              backgroundColor="rgba(5, 42, 112, 0.45)"
              borderColor="rgba(255,255,255,0.28)"
              textColor="#FFFFFF"
            />
          ) : null}
        </View>
      </LinearGradient>
    </FadeInView>
  );
}
