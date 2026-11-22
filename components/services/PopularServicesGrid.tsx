import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceDiscoveryCard } from './ServiceDiscoveryCard';

const GRID_GAP = 10;

type PopularServicesGridProps = {
  services: ServiceItem[];
  onViewAll?: () => void;
  title?: string;
  emptyMessage?: boolean;
};

/**
 * Reliable 2-column popular grid using pixel widths (not % — avoids native collapse).
 */
export function PopularServicesGrid({
  services,
  onViewAll,
  title,
  emptyMessage = false,
}: PopularServicesGridProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(280, windowWidth - spacing.medium * 2);
  const cardWidth = Math.floor((contentWidth - GRID_GAP) / 2);

  if (services.length === 0) {
    if (!emptyMessage) {
      return null;
    }
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24, gap: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text style={{ maxWidth: 280, textAlign: 'center', fontSize: 14, lineHeight: 20, color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <View style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
            {title ?? t('services.popularTitle')}
          </Text>
        </View>
        {onViewAll ? (
          <Pressable onPress={onViewAll} hitSlop={8} accessibilityRole="button">
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
              {t('services.viewAll')}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
        {services.map((service) => (
          <ServiceDiscoveryCard
            key={service.slug}
            service={service}
            source="popular_grid"
            width={cardWidth}
          />
        ))}
      </View>
    </View>
  );
}
