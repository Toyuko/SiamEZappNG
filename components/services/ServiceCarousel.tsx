import { useCallback } from 'react';

import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { TripletPager } from '../ui/TripletPager';
import { ServiceCarouselCard } from './ServiceCarouselCard';

type ServiceCarouselProps = {
  services: ServiceItem[];
  carouselHeight?: number;
  heightFraction?: number;
};

export function ServiceCarousel({ services, carouselHeight, heightFraction }: ServiceCarouselProps) {
  const renderItem = useCallback(
    (service: ServiceItem, size: { cardHeight: number; cardWidth: number }) => (
      <ServiceCarouselCard service={service} cardHeight={size.cardHeight} cardWidth={size.cardWidth} portrait />
    ),
    [],
  );

  return (
    <TripletPager
      items={services}
      carouselHeight={carouselHeight}
      heightFraction={heightFraction ?? 0.38}
      headerTitle={t('services.featuredServices')}
      headerHint={t('services.swipeToExplore')}
      keyExtractor={(service) => service.slug}
      renderItem={renderItem}
      emptyTitle={t('services.emptyTitle')}
      emptyHint={t('services.emptyHint')}
    />
  );
}
