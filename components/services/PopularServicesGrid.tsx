import { Pressable, Text, View } from 'react-native';

import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceDiscoveryCard } from './ServiceDiscoveryCard';

type PopularServicesGridProps = {
  services: ServiceItem[];
  onViewAll?: () => void;
  title?: string;
  emptyMessage?: boolean;
};

/**
 * Compact 2-column popular service tiles.
 */
export function PopularServicesGrid({
  services,
  onViewAll,
  title,
  emptyMessage = false,
}: PopularServicesGridProps) {
  const { colors } = useTheme();

  if (services.length === 0) {
    if (!emptyMessage) {
      return null;
    }
    return (
      <View className="items-center py-6" style={{ gap: 6 }}>
        <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text className="max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.stackMd }}>
      <View className="flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            {title ?? t('services.popularTitle')}
          </Text>
        </View>
        {onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
            <Text className="text-[13px] font-semibold" style={{ color: colors.primary }}>
              {t('services.viewAll')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row flex-wrap justify-between" style={{ gap: 8 }}>
        {services.map((service) => (
          <ServiceDiscoveryCard key={service.slug} service={service} source="popular_grid" />
        ))}
      </View>
    </View>
  );
}
