import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { CategoryFilterId } from '../../components/services/CategoryChips';
import { ServiceCarousel } from '../../components/services/ServiceCarousel';
import { ServiceSearchBar } from '../../components/services/ServiceSearchBar';
import { ServicesScreenHeader } from '../../components/services/ServicesScreenHeader';
import { AdSlot } from '../../components/ui/AdSlot';
import { filterServicesByQuery, getCategoryLabel } from '../../features/services/service-display';
import { getActiveServices } from '../../features/services/services.data';
import { shuffleServices } from '../../features/services/shuffle-services';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const CAROUSEL_HEIGHT_FRACTION = 0.36;
const AD_HEIGHT_FRACTION = 0.34;

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

  const adHeight = Math.round(windowHeight * AD_HEIGHT_FRACTION);

  const clearCategoryFilter = () => {
    setActiveCategory('all');
    router.replace('/(tabs)/services');
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ paddingHorizontal: spacing.screenPaddingX }}>
        <View style={{ gap: spacing.stackMd, paddingTop: spacing.stackSm, paddingBottom: spacing.stackSm }}>
          <View className="flex-row items-start justify-between gap-3">
            <View style={{ flex: 1 }}>
              <ServicesScreenHeader title={t('services.title')} subtitle={t('services.subtitle')} />
            </View>
            <Pressable
              onPress={() => router.push('/categories')}
              accessibilityRole="button"
              accessibilityLabel={t('services.categoriesButton')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.button,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              })}
            >
              <Ionicons name="grid-outline" size={16} color={colors.primary} />
              <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                {t('services.categoriesButton')}
              </Text>
            </Pressable>
          </View>

          <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} />

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

        <View style={{ flex: 1, gap: spacing.stackMd, paddingBottom: spacing.stackMd }}>
          <ServiceCarousel services={filteredServices} heightFraction={CAROUSEL_HEIGHT_FRACTION} />
          <AdSlot height={adHeight} />
        </View>
      </View>
    </SafeAreaView>
  );
}
