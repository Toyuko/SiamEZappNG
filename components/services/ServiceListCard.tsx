import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { motion } from '../../lib/theme/motion';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORY_ACCENT: Record<ServiceItem['category'], string> = {
  'driving-vehicle': '#0645B5',
  'immigration-legal': '#1559D6',
  'translation-documents': '#7C3AED',
  'home-property': '#C026D3',
  'transport-private-driver': '#0D9488',
  'events-lifestyle': '#DB2777',
  'business-services': '#EA580C',
};

type ServiceListCardProps = {
  service: ServiceItem;
  source?: string;
};

/**
 * Compact premium service row — icon aligned with title, short description, chevron.
 */
export function ServiceListCard({ service, source = 'services_directory' }: ServiceListCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const accent = CATEGORY_ACCENT[service.category];
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        trackFunnel('service_viewed', { slug: service.slug, source });
        router.push(`/services/${service.slug}`);
      }}
      onPressIn={() => {
        scale.value = withTiming(motion.pressScale, { duration: motion.cardPress });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: motion.cardPress });
      }}
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.cardLight,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tint,
        }}
      >
        <Ionicons name={service.icon} size={19} color={accent} accessibilityIgnoresInvertColors />
      </View>

      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text
          className="text-[14px] font-bold leading-5"
          numberOfLines={1}
          style={{ color: colors.foreground }}
        >
          {title}
        </Text>
        <Text
          className="text-[12px] leading-[15px]"
          numberOfLines={1}
          style={{ color: colors.muted }}
        >
          {description}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginLeft: spacing.micro }} />
    </AnimatedPressable>
  );
}
