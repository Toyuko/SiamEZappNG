import { Calendar, ChevronRight, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  getServiceDescription,
  getServiceTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { motion } from '../../lib/theme/motion';
import { accentForeground, radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { Button } from '../ui/Button';
import { ServicePosterHero } from './ServicePosterHero';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type FeaturedPromoCardProps = {
  service: ServiceItem;
  width: number;
  height: number;
  isActive?: boolean;
};

/**
 * Large immersive featured campaign card — image-led with gradient + Book Now.
 */
export function FeaturedPromoCard({ service, width, height, isActive = true }: FeaturedPromoCardProps) {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const openBook = () => {
    trackFunnel('booking_started', { slug: service.slug, source: 'featured_promo' });
    router.push({ pathname: '/(tabs)/book', params: { serviceSlug: service.slug } });
  };

  const openDetails = () => {
    trackFunnel('service_viewed', { slug: service.slug, source: 'featured_promo' });
    router.push(`/services/${service.slug}`);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
      onPress={openDetails}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.cardPress });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.cardPress });
      }}
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius: 26,
          overflow: 'hidden',
          backgroundColor: siam.blue.navy,
          ...shadows.cardMedium,
        },
      ]}
    >
      <ServicePosterHero
        service={service}
        width={width}
        height={height}
        resizeMode="cover"
        showLoading
        indicatorColor="#FFFFFF"
        accessibilityLabel={title}
      />

      <LinearGradient
        colors={['rgba(5,42,112,0.05)', 'rgba(5,42,112,0.35)', 'rgba(5,42,112,0.92)']}
        locations={[0, 0.45, 1]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        pointerEvents="none"
      />

      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          padding: spacing.cardPadding,
          justifyContent: 'space-between',
        }}
      >
        <View className="flex-row items-start justify-between">
          <View
            style={{
              backgroundColor: siam.yellow.DEFAULT,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: radius.full,
            }}
          >
            <Text className="text-[11px] font-bold uppercase" style={{ color: accentForeground, letterSpacing: 0.5 }}>
              {t('services.featuredBadge')}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.18)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: radius.full,
            }}
          >
            <Text className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>
              {t('services.swipeToExplore')}
            </Text>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text className="text-[11px] font-semibold uppercase" style={{ color: siam.yellow.DEFAULT, letterSpacing: 0.6 }}>
            {t('services.easyFastReliable')}
          </Text>
          <Text
            className="text-[28px] font-bold tracking-tight leading-8"
            numberOfLines={2}
            style={{ color: '#FFFFFF' }}
          >
            {title}
          </Text>
          <Text className="text-[14px] leading-5" numberOfLines={2} style={{ color: 'rgba(255,255,255,0.9)' }}>
            {description}
          </Text>

          <View style={{ gap: 8, marginTop: 4 }}>
            <Button
              label={t('cta.bookNow')}
              variant="accent"
              gradient
              minHeight={54}
              textColor={accentForeground}
              onPress={openBook}
            >
              <View className="flex-row items-center gap-2">
                <Calendar size={18} color={accentForeground} strokeWidth={2.4} />
                <Text className="text-[16px] font-bold" style={{ color: accentForeground }}>
                  {t('cta.bookNow')}
                </Text>
                <ChevronRight size={18} color={accentForeground} strokeWidth={2.4} />
              </View>
            </Button>
            <Button
              label={t('services.moreInfo')}
              variant="secondary"
              minHeight={48}
              backgroundColor="rgba(255,255,255,0.14)"
              borderColor="rgba(255,255,255,0.35)"
              textColor="#FFFFFF"
              onPress={openDetails}
            >
              <View className="flex-row items-center gap-2">
                <Info size={17} color="#FFFFFF" strokeWidth={2.2} />
                <Text className="text-[15px] font-semibold" style={{ color: '#FFFFFF' }}>
                  {t('services.moreInfo')}
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}
