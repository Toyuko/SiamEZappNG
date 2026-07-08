import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { CategoryFilterId } from '../../components/services/CategoryChips';
import { ServiceCarousel } from '../../components/services/ServiceCarousel';
import { ServiceSearchBar } from '../../components/services/ServiceSearchBar';
import { ServicesScreenHeader } from '../../components/services/ServicesScreenHeader';
import { MockAdPanel } from '../../components/ui/MockAdPanel';
import { getMockAdForCategory } from '../../features/ads/mock-ads';
import { filterServicesByQuery, getCategoryLabel } from '../../features/services/service-display';
import { getActiveServices } from '../../features/services/services.data';
import { shuffleServices } from '../../features/services/shuffle-services';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const CAROUSEL_HEIGHT_FRACTION = 0.38;
const AD_HEIGHT_FRACTION = 0.30;
const PAGE_HEADER_HEIGHT = 160;

function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return SERVICE_CATEGORIES.some((item) => item.id === value);
}

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const language = useLanguageStore((state) => state.language);
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>('all');
  const [shuffledServices] = useState(() => shuffleServices(getActiveServices()));

  useEffect(() => {
    if (categoryParam && isServiceCategoryId(categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredServices = useMemo(() => {
    let list = shuffledServices;
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }
    return filterServicesByQuery(list, searchQuery, language);
  }, [activeCategory, language, searchQuery, shuffledServices]);

  const sectionTitle =
    activeCategory === 'all'
      ? t('services.allServices')
      : getCategoryLabel(activeCategory);

  const mockAd = activeCategory !== 'all' ? getMockAdForCategory(activeCategory) : undefined;

  const clearCategoryFilter = () => {
    setActiveCategory('all');
    router.replace('/(tabs)/services');
  };

  const contentHeight = windowHeight - PAGE_HEADER_HEIGHT - 100;
  const carouselHeight = Math.round(
    contentHeight * (CAROUSEL_HEIGHT_FRACTION / (CAROUSEL_HEIGHT_FRACTION + AD_HEIGHT_FRACTION)),
  );
  const adHeight = Math.round(
    contentHeight * (AD_HEIGHT_FRACTION / (CAROUSEL_HEIGHT_FRACTION + AD_HEIGHT_FRACTION)),
  );

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ paddingHorizontal: spacing.screenPaddingX }}>
        <View style={{ gap: spacing.stackMd, paddingTop: spacing.stackSm, paddingBottom: spacing.stackSm }}>
          <ServicesScreenHeader title={t('services.title')} subtitle={t('services.subtitle')} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
            <View style={{ flex: 1 }}>
              <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <Pressable
              onPress={() => router.push('/categories')}
              accessibilityRole="button"
              accessibilityLabel={t('services.categoriesButton')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                height: 52,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingHorizontal: 12,
                borderRadius: radius.button,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <Ionicons name="grid-outline" size={18} color={colors.primary} />
              <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                {t('services.categoriesButton')}
              </Text>
            </Pressable>
          </View>

          {activeCategory !== 'all' ? (
            <Pressable
              onPress={clearCategoryFilter}
              accessibilityRole="button"
              accessibilityLabel={t('services.clearCategoryFilter')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: radius.full,
                backgroundColor: colors.primary,
              })}
            >
              <Text className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                {sectionTitle}
              </Text>
              <Ionicons name="close" size={14} color="#ffffff" />
            </Pressable>
          ) : null}
        </View>

        <View style={{ paddingBottom: spacing.stackMd }}>
          <ServiceCarousel services={filteredServices} carouselHeight={carouselHeight} />
          <View style={{ height: spacing.stackMd }} />
          <MockAdPanel key={activeCategory} height={adHeight} ad={mockAd} />
        </View>
      </View>
    </SafeAreaView>
  );
}
