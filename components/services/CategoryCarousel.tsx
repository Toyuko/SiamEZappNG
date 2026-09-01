import { useCallback } from 'react';

import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { TripletPager } from '../ui/TripletPager';
import { CategoryCard } from './CategoryCard';

type CategoryCarouselProps = {
  carouselHeight?: number;
  heightFraction?: number;
  onCategoryPress?: (categoryId: ServiceCategoryId) => void;
};

export function CategoryCarousel({ carouselHeight, heightFraction, onCategoryPress }: CategoryCarouselProps) {
  const categoryIds = SERVICE_CATEGORIES.map((item) => item.id);

  const renderItem = useCallback(
    (categoryId: ServiceCategoryId, size: { cardHeight: number; cardWidth: number }) => (
      <CategoryCard
        categoryId={categoryId}
        cardHeight={size.cardHeight}
        cardWidth={size.cardWidth}
        portrait
        onPress={onCategoryPress}
      />
    ),
    [onCategoryPress],
  );

  return (
    <TripletPager
      items={categoryIds}
      carouselHeight={carouselHeight}
      heightFraction={heightFraction ?? 0.38}
      headerTitle={t('services.categoriesPage.title')}
      headerHint={t('services.swipeToExplore')}
      keyExtractor={(categoryId) => categoryId}
      renderItem={renderItem}
      emptyTitle={t('services.emptyTitle')}
      emptyHint={t('services.emptyHint')}
    />
  );
}
