import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  getServiceDescription,
  getServiceShortTitle,
  getServiceTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

const CATEGORY_ACCENT: Record<ServiceItem['category'], string> = {
  'driving-vehicle': '#0645B5',
  'immigration-legal': '#1559D6',
  'translation-documents': '#7C3AED',
  'home-property': '#C026D3',
  'transport-private-driver': '#0D9488',
  'events-lifestyle': '#DB2777',
  'business-services': '#EA580C',
};

type ServiceDiscoveryCardProps = {
  service: ServiceItem;
  source: string;
  /** Show a short description under the title. */
  showDescription?: boolean;
  /** Prefer shortTitle for denser accordion tiles. */
  useShortTitle?: boolean;
};

/**
 * Compact marketplace service tile — 2-column discovery grids & accordions.
 */
export function ServiceDiscoveryCard({
  service,
  source,
  showDescription = true,
  useShortTitle = false,
}: ServiceDiscoveryCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const displayTitle = useShortTitle
    ? getServiceShortTitle(service, language)
    : getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const accent = CATEGORY_ACCENT[service.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={displayTitle}
      onPress={() => {
        trackFunnel('service_viewed', { slug: service.slug, source });
        router.push(`/services/${service.slug}`);
      }}
      style={({ pressed }) => ({
        width: '48%',
        minHeight: showDescription ? 108 : 72,
        paddingHorizontal: spacing.small,
        paddingVertical: spacing.stackMd,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.9 : 1,
        ...shadows.cardLight,
      })}
    >
      <View className="flex-row items-start justify-between">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tint,
          }}
        >
          <Ionicons name={service.icon} size={18} color={accent} />
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.muted} />
      </View>
      <Text
        className="mt-2 text-[13px] font-semibold leading-4"
        numberOfLines={2}
        style={{ color: colors.foreground }}
      >
        {displayTitle}
      </Text>
      {showDescription ? (
        <Text className="mt-1 text-[11px] leading-[14px]" numberOfLines={2} style={{ color: colors.muted }}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
