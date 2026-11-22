import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  getServiceDescription,
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
};

/**
 * Compact 2-column marketplace tile — icon beside title (not stacked).
 */
export function ServiceDiscoveryCard({ service, source }: ServiceDiscoveryCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const description = getServiceDescription(service, language);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const accent = CATEGORY_ACCENT[service.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        trackFunnel('service_viewed', { slug: service.slug, source });
        router.push(`/services/${service.slug}`);
      }}
      style={({ pressed }) => ({
        width: '48.5%',
        minHeight: 92,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.9 : 1,
        ...shadows.cardLight,
      })}
    >
      <View className="flex-row items-start" style={{ gap: 10 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tint,
          }}
        >
          <Ionicons name={service.icon} size={17} color={accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View className="flex-row items-start justify-between" style={{ gap: 4 }}>
            <Text
              className="flex-1 text-[13px] font-bold leading-4"
              numberOfLines={2}
              style={{ color: colors.foreground }}
            >
              {title}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.muted} style={{ marginTop: 1 }} />
          </View>
          <Text
            className="mt-1 text-[11px] leading-[14px]"
            numberOfLines={2}
            style={{ color: colors.muted }}
          >
            {description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
