import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { accentForeground, heroGradient, radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { Button } from '../ui/Button';
import { FadeInView } from '../ui/FadeInView';

type BookingPromoBannerProps = {
  variant?: 'promo' | 'track';
};

/**
 * Secondary conversion / track banner — blue card with gold CTA.
 */
export function BookingPromoBanner({ variant = 'promo' }: BookingPromoBannerProps) {
  const router = useRouter();
  const isTrack = variant === 'track';

  return (
    <FadeInView delay={120} distance={14}>
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={{
          borderRadius: radius.xl,
          padding: spacing.cardPadding,
          overflow: 'hidden',
          ...shadows.cardMedium,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -24,
            top: -20,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 211, 47, 0.14)',
          }}
        />
        <Text className="text-lg font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
          {isTrack ? t('home.trackBanner.title') : t('home.promoBanner.title')}
        </Text>
        <Text className="mt-1.5 text-sm leading-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
          {isTrack ? t('home.trackBanner.subtitle') : t('home.promoBanner.subtitle')}
        </Text>
        <View className="mt-4">
          <Button
            label={isTrack ? t('home.trackBanner.cta') : t('home.promoBanner.cta')}
            variant="accent"
            gradient
            minHeight={52}
            textColor={accentForeground}
            onPress={() => {
              if (isTrack) {
                trackFunnel('support_contacted', { source: 'home_track_banner' });
                router.push('/(tabs)/cases');
                return;
              }
              trackFunnel('booking_started', { source: 'home_promo_banner' });
              router.push('/(tabs)/book');
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            bottom: 0,
            width: 48,
            height: 4,
            borderRadius: 2,
            backgroundColor: siam.yellow.DEFAULT,
          }}
        />
      </LinearGradient>
    </FadeInView>
  );
}
