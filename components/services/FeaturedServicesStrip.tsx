import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
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
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CARD_WIDTH = 248;

type FeaturedServicesStripProps = {
  services: ServiceItem[];
};

function FeaturedCard({ service }: { service: ServiceItem }) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const openDetails = () => {
    trackFunnel('service_viewed', { slug: service.slug, source: 'featured_strip' });
    router.push(`/services/${service.slug}`);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
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
          width: CARD_WIDTH,
          padding: spacing.cardPaddingCompact,
          borderRadius: radius.xl,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.cardLight,
        },
      ]}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tint,
          }}
        >
          <Ionicons name={service.icon} size={22} color={colors.primary} accessibilityIgnoresInvertColors />
        </View>
        <View
          style={{
            backgroundColor: siam.yellow.DEFAULT,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: radius.full,
          }}
        >
          <Text className="text-[9px] font-bold uppercase" style={{ color: accentForeground, letterSpacing: 0.4 }}>
            {t('services.badgePopular')}
          </Text>
        </View>
      </View>

      <Text className="mt-2.5 text-[15px] font-bold leading-5" numberOfLines={2} style={{ color: colors.foreground }}>
        {title}
      </Text>
      <Text className="mt-1 text-[12px] leading-4" numberOfLines={2} style={{ color: colors.muted }}>
        {description}
      </Text>

      <View className="mt-3 flex-row items-center gap-0.5">
        <Text className="text-[12px] font-semibold" style={{ color: colors.primary }}>
          {t('services.moreInfo')}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary} />
      </View>
    </AnimatedPressable>
  );
}

/**
 * Compact horizontal featured strip — replaces the oversized 500px promo carousel.
 */
export function FeaturedServicesStrip({ services }: FeaturedServicesStripProps) {
  const { colors } = useTheme();
  const data = services.slice(0, 6);

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.stackSm }}>
      <View>
        <View className="flex-row items-center gap-2">
          <View style={{ width: 4, height: 18, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            {t('services.featuredServices')}
          </Text>
        </View>
        <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.popularSubtitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={{
          gap: spacing.stackMd,
          paddingVertical: 2,
          paddingRight: spacing.stackSm,
        }}
      >
        {data.map((service) => (
          <FeaturedCard key={service.slug} service={service} />
        ))}
      </ScrollView>
    </View>
  );
}
