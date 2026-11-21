import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips, type CategoryFilterId } from '../../components/services/CategoryChips';
import { FeaturedPromoCarousel } from '../../components/services/FeaturedPromoCarousel';
import { PopularServicesGrid } from '../../components/services/PopularServicesGrid';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
import { ServicesPageHeader } from '../../components/services/ServicesPageHeader';
import { MockAdPanel } from '../../components/ui/MockAdPanel';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { filterServicesByQuery } from '../../features/services/service-display';
import { getActiveServices, getFeaturedServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

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
  const language = useLanguageStore((state) => state.language);
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

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, []),
  );

  const catalog = useMemo(() => getActiveServices(), []);
  const featured = useMemo(() => {
    const list = getFeaturedServices();
    return list.length > 0 ? list : catalog.slice(0, 6);
  }, [catalog]);

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'all' ? catalog : catalog.filter((item) => item.category === activeCategory);
    return filterServicesByQuery(byCategory, searchQuery, language);
  }, [activeCategory, catalog, language, searchQuery]);

  const popular = useMemo(() => {
    const featuredSlugs = new Set(getFeaturedServices().map((item) => item.slug));
    const preferred = filtered.filter((item) => featuredSlugs.has(item.slug));
    const pool = preferred.length > 0 ? preferred : filtered;
    return pool.slice(0, 8);
  }, [filtered]);

  const searching = searchQuery.trim().length > 0;

  const onSelectCategory = (category: CategoryFilterId) => {
    setActiveCategory(category);
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
            gap: spacing.section,
          }}
        >
          {/* Search + Categories shortcut */}
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

          <ServiceSearchResults query={searchQuery} />

          {!searching ? (
            <>
              <FeaturedPromoCarousel services={featured} />

              <MockAdPanel height={132} />

              <View style={{ gap: spacing.stackSm }}>
                <Text className="text-base font-bold" style={{ color: colors.foreground }}>
                  {t('services.browseByCategory')}
                </Text>
                <CategoryChips activeCategory={activeCategory} onSelect={onSelectCategory} />
              </View>

              <PopularServicesGrid
                services={popular}
                onViewAll={() => {
                  setActiveCategory('all');
                  router.replace('/(tabs)/services');
                }}
              />
            </>
          ) : (
            <View style={{ gap: spacing.stackMd }}>
              <CategoryChips activeCategory={activeCategory} onSelect={onSelectCategory} />
              {filtered.length === 0 ? (
                <View className="items-center py-10">
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    {t('services.noResults')}
                  </Text>
                </View>
              ) : (
                <PopularServicesGrid services={filtered.slice(0, 12)} />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
