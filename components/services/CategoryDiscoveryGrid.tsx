import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { spacing } from '../../lib/theme/tokens';
import { CategoryDiscoveryCard } from './CategoryDiscoveryCard';

const GRID_GAP = 12;

/** Preferred discovery order from the redesign brief (skip empty categories). */
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
  /** Limit cards on the Services landing preview. Omit for full list. */
  limit?: number;
  compact?: boolean;
};

/**
 * 2-column premium category image grid — pixel widths for reliable native layout.
 */
export function CategoryDiscoveryGrid({ onSelect, limit, compact = false }: CategoryDiscoveryGridProps) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(280, windowWidth - spacing.medium * 2);
  const cardWidth = Math.floor((contentWidth - GRID_GAP) / 2);

  const categoryIds = useMemo(() => {
    const ordered = DISCOVERY_ORDER.filter((id) => SERVICE_CATEGORY_ORDER.includes(id));
    const withServices = ordered.filter((id) => getServicesByCategory(id).length > 0);
    return typeof limit === 'number' ? withServices.slice(0, limit) : withServices;
  }, [limit]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
      {categoryIds.map((categoryId) => (
        <CategoryDiscoveryCard
          key={categoryId}
          categoryId={categoryId}
          width={cardWidth}
          compact={compact}
          onPress={onSelect}
        />
      ))}
    </View>
  );
}
