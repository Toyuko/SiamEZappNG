import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CategoryFilterId } from '../../components/services/CategoryChips';
import { CategoryTiles } from '../../components/services/CategoryTiles';
import { FeaturedPromoCarousel } from '../../components/services/FeaturedPromoCarousel';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
import { ServicesDirectory } from '../../components/services/ServicesDirectory';
import { ServicesPageHeader } from '../../components/services/ServicesPageHeader';
import { MockAdPanel } from '../../components/ui/MockAdPanel';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { nextFeaturedVisit } from '../../features/services/featured-visit';
import { getActiveServices, getFeaturedServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function getFeaturedPool(): ServiceItem[] {
  const list = getFeaturedServices();
  return list.length > 0 ? list : getActiveServices().slice(0, 6);
}

function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return SERVICE_CATEGORIES.some((item) => item.id === value);
}

function readCategoryParam(value: string | string[] | undefined): CategoryFilterId {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && isServiceCategoryId(raw)) {
    return raw;
  }
  return 'all';
}

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string | string[] }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>(readCategoryParam(categoryParam));

  useEffect(() => {
    const nextCategory = readCategoryParam(categoryParam);
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from route only
  }, [categoryParam]);

  const catalog = useMemo(() => getActiveServices(), []);
  /** Shuffled once per Services visit — stable across re-renders. */
  const [featuredOrder, setFeaturedOrder] = useState<ServiceItem[]>(() => nextFeaturedVisit(getFeaturedPool()));
  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
      } else {
        // Fresh shuffle when returning to Services; avoid consecutive first-slide repeats.
        setFeaturedOrder(nextFeaturedVisit(getFeaturedPool()));
      }
      return () => {
        Keyboard.dismiss();
      };
    }, []),
  );

  const categoryFiltered = useMemo(() => {
    if (activeCategory === 'all') {
      return catalog;
    }
    return catalog.filter((item) => item.category === activeCategory);
  }, [activeCategory, catalog]);

  const searching = searchQuery.trim().length > 0;

  const onSelectCategory = (category: CategoryFilterId) => {
    setActiveCategory(category);
    setSearchQuery('');
    if (category === 'all') {
      router.replace('/(tabs)/services');
      return;
    }
    router.setParams({ category });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ServicesPageHeader />

      <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: spacing.medium,
            paddingTop: spacing.standard,
            paddingBottom: 100 + VOICE_FAB_SCROLL_EXTRA,
            gap: spacing.stackLg,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View style={{ flex: 1 }}>
              <ServiceSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                backgroundColor={colors.card}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('services.categoriesButton')}
              onPress={() => router.push('/categories')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                height: 54,
                minWidth: 96,
                paddingHorizontal: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                ...shadows.cardLight,
              })}
            >
              <Ionicons name="grid-outline" size={18} color={colors.primary} />
              <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
                {t('services.categoriesButton')}
              </Text>
            </Pressable>
          </View>

          {searching ? <ServiceSearchResults query={searchQuery} /> : null}

          {!searching && activeCategory === 'all' ? (
            <FeaturedPromoCarousel services={featuredOrder} />
          ) : null}

          {!searching ? (
            <View style={{ gap: spacing.stackLg }}>
              <CategoryTiles activeCategory={activeCategory} onSelect={onSelectCategory} />

              {activeCategory !== 'all' ? (
                <ServicesDirectory
                  services={categoryFiltered}
                  groupByCategory={false}
                  source="services_category_filter"
                />
              ) : null}

              <MockAdPanel height={112} />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
