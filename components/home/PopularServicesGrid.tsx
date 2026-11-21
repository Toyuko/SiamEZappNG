import { useRouter } from 'expo-router';
import {
  Car,
  FileText,
  Heart,
  Home,
  LayoutGrid,
  Plane,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getServiceDescription, getServiceShortTitle } from '../../features/services/service-display';
import { serviceCatalog } from '../../features/services/services.data';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { motion } from '../../lib/theme/motion';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { FadeInView } from '../ui/FadeInView';
import { Section } from '../ui/Section';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Curated home tiles mapped to real catalog slugs (siam-ez.com offerings). */
const HOME_TILES: Array<{
  slug: string | null;
  icon: LucideIcon;
  accent: string;
  labelKey?: string;
}> = [
  { slug: 'visa-services', icon: Plane, accent: '#2450C4' },
  { slug: 'marriage-registration', icon: Heart, accent: '#DB2777' },
  { slug: 'driver-license', icon: Car, accent: '#EA580C' },
  { slug: 'translation-services', icon: FileText, accent: '#7C3AED' },
  { slug: 'police-clearance', icon: ShieldCheck, accent: '#059669' },
  { slug: 'vehicle-registration', icon: Wrench, accent: '#0D9488' },
  { slug: 'construction-handyman', icon: Home, accent: '#C026D3' },
  { slug: null, icon: LayoutGrid, accent: '#3567F6', labelKey: 'home.moreServices' },
];

function ServiceTile({
  title,
  description,
  accent,
  Icon,
  delay,
  onPress,
}: {
  title: string;
  description: string;
  accent: string;
  Icon: LucideIcon;
  delay: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <FadeInView delay={delay} distance={12} style={{ width: '48%', flexGrow: 1 }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(motion.pressScale, { duration: motion.cardPress });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: motion.cardPress });
        }}
        style={[
          animatedStyle,
          {
            minHeight: 142,
            padding: spacing.small,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.cardLight,
          },
        ]}
      >
        <View
          className="mb-2.5 h-11 w-11 items-center justify-center"
          style={{ borderRadius: radius.md, backgroundColor: `${accent}1A` }}
        >
          <Icon size={22} color={accent} strokeWidth={2.2} />
        </View>
        <Text className="text-[15px] font-semibold" numberOfLines={2} style={{ color: colors.foreground }}>
          {title}
        </Text>
        <Text className="mt-1 text-xs leading-4" numberOfLines={2} style={{ color: colors.muted }}>
          {description}
        </Text>
        <Text className="mt-auto pt-2 text-sm font-semibold" style={{ color: accent }}>
          →
        </Text>
      </AnimatedPressable>
    </FadeInView>
  );
}

type PopularServicesGridProps = {
  title: string;
  subtitle?: string;
};

export function PopularServicesGrid({ title, subtitle }: PopularServicesGridProps) {
  const router = useRouter();
  const language = useLanguageStore((s) => s.language);

  return (
    <Section title={title} subtitle={subtitle}>
      <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
        {HOME_TILES.map((tile, index) => {
          if (!tile.slug) {
            return (
              <ServiceTile
                key="more"
                title={t(tile.labelKey ?? 'home.moreServices')}
                description={t('home.moreServicesHint')}
                accent={tile.accent}
                Icon={tile.icon}
                delay={40 + index * motion.serviceCardStagger}
                onPress={() => router.push('/(tabs)/services')}
              />
            );
          }

          const service = serviceCatalog.find((item) => item.slug === tile.slug);
          if (!service) {
            return null;
          }

          const serviceTitle = getServiceShortTitle(service, language);
          return (
            <ServiceTile
              key={tile.slug}
              title={serviceTitle}
              description={getServiceDescription(service, language)}
              accent={tile.accent}
              Icon={tile.icon}
              delay={40 + index * motion.serviceCardStagger}
              onPress={() => {
                trackFunnel('booking_started', { slug: tile.slug!, source: 'home_service_grid' });
                router.push({ pathname: '/(tabs)/book', params: { serviceSlug: tile.slug! } });
              }}
            />
          );
        })}
      </View>
    </Section>
  );
}
