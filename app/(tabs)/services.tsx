import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CategoryFilterId } from '../../components/services/CategoryChips';
import { CategoryTiles } from '../../components/services/CategoryTiles';
import { ExpandableCategorySections } from '../../components/services/ExpandableCategorySections';
import { FeaturedPromoCarousel } from '../../components/services/FeaturedPromoCarousel';
import { PopularServicesGrid } from '../../components/services/PopularServicesGrid';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
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

/** Curated popular tiles — still resolved from live catalog data. */
const POPULAR_SLUG_ORDER = [
  'visa-services',
  'marriage-registration',
  'driver-license',
  'translation-services',
] as const;

const POPULAR_LIMIT = 4;

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

function pickPopularServices(pool: ServiceItem[], limit: number): ServiceItem[] {
  const bySlug = new Map(pool.map((item) => [item.slug, item]));
  const curated: ServiceItem[] = [];
  for (const slug of POPULAR_SLUG_ORDER) {
    const hit = bySlug.get(slug);
    if (hit) curated.push(hit);
  }
  if (curated.length >= limit) {
    return curated.slice(0, limit);
  }
  const used = new Set(curated.map((item) => item.slug));
  const fillers = pool.filter(
    (item) => !used.has(item.slug) && (item.badges.includes('popular') || item.featured),
  );
  return [...curated, ...fillers].slice(0, limit);
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

  const popular = useMemo(
    () => pickPopularServices(categoryFiltered, POPULAR_LIMIT),
    [categoryFiltered],
  );

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
      {/* —— LOCKED TOP HALF —— */}
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

          {/* Featured carousel — locked visual; only hidden while searching or when a category chip filters. */}
          {!searching && activeCategory === 'all' ? (
            <FeaturedPromoCarousel services={featuredOrder} />
          ) : null}

          {/* —— REDESIGNED LOWER HALF (below featured) —— */}
          {!searching ? (
            <View style={{ gap: spacing.stackLg }}>
              <CategoryTiles activeCategory={activeCategory} onSelect={onSelectCategory} />

              <PopularServicesGrid
                services={popular}
                onViewAll={() => router.push('/all-services')}
                emptyMessage
              />

              <ExpandableCategorySections
                services={activeCategory === 'all' ? catalog : categoryFiltered}
                activeCategory={activeCategory}
              />

              <MockAdPanel height={112} />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
