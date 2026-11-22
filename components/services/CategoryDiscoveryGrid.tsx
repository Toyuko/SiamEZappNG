import { useMemo } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

import { getCategoryLabel } from '../../features/services/service-display';
import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { CategoryDiscoveryCard } from './CategoryDiscoveryCard';

const GRID_GAP = 12;

/** Preferred order from the Categories redesign brief. */
const DISCOVERY_ORDER: ServiceCategoryId[] = [
  'driving-vehicle',
  'immigration-legal',
  'translation-documents',
  'home-property',
  'transport-private-driver',
  'events-lifestyle',
  'business-services',
];

type CategoryDiscoveryGridProps = {
  onSelect: (categoryId: ServiceCategoryId) => void;
  /** Optional filter query for category names. */
  query?: string;
};

function camelKey(categoryId: ServiceCategoryId): string {
  const map: Record<ServiceCategoryId, string> = {
    'driving-vehicle': 'drivingVehicle',
    'immigration-legal': 'immigrationLegal',
    'translation-documents': 'translationDocuments',
    'home-property': 'homeProperty',
    'transport-private-driver': 'transportPrivateDriver',
    'events-lifestyle': 'eventsLifestyle',
    'business-services': 'businessServices',
  };
  return map[categoryId];
}

/**
 * 2-column premium category image grid for the Categories screen.
 */
export function CategoryDiscoveryGrid({ onSelect, query = '' }: CategoryDiscoveryGridProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(280, windowWidth - spacing.medium * 2);
  const cardWidth = Math.floor((contentWidth - GRID_GAP) / 2);
  const trimmed = query.trim().toLowerCase();

  const categoryIds = useMemo(() => {
    const ordered = DISCOVERY_ORDER.filter((id) => SERVICE_CATEGORY_ORDER.includes(id));
    const withServices = ordered.filter((id) => getServicesByCategory(id).length > 0);
    if (!trimmed) {
      return withServices;
    }
    return withServices.filter((id) => {
      const label = getCategoryLabel(id).toLowerCase();
      const description = t(`services.categoryDescriptions.${camelKey(id)}`).toLowerCase();
      return label.includes(trimmed) || description.includes(trimmed) || id.includes(trimmed);
    });
  }, [trimmed]);

  if (categoryIds.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 32, gap: 6 }}>
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
      {categoryIds.map((categoryId) => (
        <CategoryDiscoveryCard
          key={categoryId}
          categoryId={categoryId}
          width={cardWidth}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}
