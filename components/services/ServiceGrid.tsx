import { View } from 'react-native';

import { filterServicesByQuery } from '../../features/services/service-display';
import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { AppLanguage } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { ServiceIconCard } from './ServiceIconCard';

type ServiceGridProps = {
  categoryIndex: number;
  searchQuery: string;
  language: AppLanguage;
};

const GRID_ROW_GAP = spacing.stackMd;

export function ServiceGrid({ categoryIndex, searchQuery, language }: ServiceGridProps) {
  const categoryId = SERVICE_CATEGORY_ORDER[categoryIndex] ?? SERVICE_CATEGORY_ORDER[0];
  const services = filterServicesByQuery(getServicesByCategory(categoryId), searchQuery, language);

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: GRID_ROW_GAP,
      }}
    >
      {services.map((service) => (
        <View key={service.slug} style={{ width: '48%' }}>
          <ServiceIconCard service={service} variant="grid" />
        </View>
      ))}
    </View>
  );
}
