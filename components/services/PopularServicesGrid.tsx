import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  getServiceDescription,
  getServiceTitle,
} from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

const ACCENTS = ['#0645B5', '#DB2777', '#EA580C', '#7C3AED', '#059669', '#0D9488', '#C026D3', '#1559D6'];

type PopularServicesGridProps = {
  services: ServiceItem[];
  onViewAll?: () => void;
};

export function PopularServicesGrid({ services, onViewAll }: PopularServicesGridProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((s) => s.language);

  if (services.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.stackMd }}>
      <View className="flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View style={{ width: 4, height: 18, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
          <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
            {t('services.popularTitle')}
          </Text>
        </View>
        {onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
            <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
              {t('services.viewAll')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
        {services.map((service, index) => {
          const title = getServiceTitle(service, language);
          const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
          const accent = ACCENTS[index % ACCENTS.length];
          return (
            <Pressable
              key={service.slug}
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => {
                trackFunnel('service_viewed', { slug: service.slug, source: 'popular_grid' });
                router.push(`/services/${service.slug}`);
              }}
              style={({ pressed }) => ({
                width: '48%',
                minHeight: 142,
                padding: spacing.small,
                borderRadius: radius.xl,
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
                    width: 44,
                    height: 44,
                    borderRadius: radius.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: tint,
                  }}
                >
                  <Ionicons name={service.icon} size={22} color={accent} />
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
              <Text className="mt-2.5 text-[15px] font-semibold" numberOfLines={2} style={{ color: colors.foreground }}>
                {title}
              </Text>
              <Text className="mt-1 text-xs leading-4" numberOfLines={2} style={{ color: colors.muted }}>
                {getServiceDescription(service, language)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
