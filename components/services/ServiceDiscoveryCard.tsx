import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  getServiceDescription,
  getServiceShortTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

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
  /** Explicit pixel width from parent grid — avoids % width collapse on native. */
  width: number;
};

/**
 * Marketplace popular tile — fixed width, icon + title + short copy.
 */
export function ServiceDiscoveryCard({ service, source, width }: ServiceDiscoveryCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceShortTitle(service, language);
  const description = getServiceDescription(service, language);
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
        width,
        minHeight: 128,
        padding: 12,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.92 : 1,
        ...shadows.cardLight,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${accent}18`,
          marginBottom: 10,
        }}
      >
        <Ionicons name={service.icon} size={20} color={accent} />
      </View>

      <Text
        style={{ fontSize: 14, fontWeight: '700', lineHeight: 18, color: colors.foreground }}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        style={{ marginTop: 4, fontSize: 11, lineHeight: 14, color: colors.muted, flexGrow: 1 }}
        numberOfLines={2}
      >
        {description}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 13, fontWeight: '700', color: accent }}>→</Text>
    </Pressable>
  );
}
