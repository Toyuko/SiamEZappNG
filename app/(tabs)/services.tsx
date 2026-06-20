import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips, type CategoryFilterId } from '../../components/services/CategoryChips';
import { ServiceDetailSheet } from '../../components/services/ServiceDetailSheet';
import { ServiceIconPager } from '../../components/services/ServiceIconPager';
import { ServiceSearchBar } from '../../components/services/ServiceSearchBar';
import { ServicesScreenHeader } from '../../components/services/ServicesScreenHeader';
import { filterServicesByQuery } from '../../features/services/service-display';
import { getActiveServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function ServicesScreen() {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    let list = getActiveServices();
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }
    return filterServicesByQuery(list, searchQuery, language);
  }, [activeCategory, language, searchQuery]);

  const sectionTitle =
    activeCategory === 'all'
      ? t('services.allServices')
      : t(SERVICE_CATEGORIES.find((item) => item.id === activeCategory)?.labelKey ?? 'services.allServices');

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ paddingHorizontal: spacing.screenPaddingX }}>
        <View style={{ gap: spacing.stackMd, paddingTop: spacing.stackSm, paddingBottom: spacing.stackSm }}>
          <ServicesScreenHeader title={t('services.title')} subtitle={t('services.subtitle')} />
          <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} />
          <CategoryChips activeCategory={activeCategory} onSelect={setActiveCategory} />
          <View style={{ gap: 2 }}>
            <Text className="text-sm font-bold" style={{ color: colors.foreground }}>
              {sectionTitle}
            </Text>
            <Text className="text-[11px]" style={{ color: colors.muted }}>
              {t('services.serviceCount', { count: filteredServices.length })}
            </Text>
          </View>
        </View>

        <ServiceIconPager services={filteredServices} onSelectService={setSelectedService} />
      </View>

      <ServiceDetailSheet
        service={selectedService}
        visible={selectedService != null}
        onClose={() => setSelectedService(null)}
      />
    </SafeAreaView>
  );
}
