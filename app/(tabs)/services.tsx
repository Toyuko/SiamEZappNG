import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import type { CategoryFilterId } from '../../components/services/CategoryChips';
import { FeaturedServiceCarousel } from '../../components/services/FeaturedServiceCarousel';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
import { ServicesScreenHeader } from '../../components/services/ServicesScreenHeader';
import { MockAdPanel } from '../../components/ui/MockAdPanel';
import { DEFAULT_MOCK_AD, getImageAdHeight, getMockAdForCategory } from '../../features/ads/mock-ads';
import { nextFeaturedVisit } from '../../features/services/featured-visit';
import { filterServicesByQuery, getCategoryLabel } from '../../features/services/service-display';
import { getActiveServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import type { AppLanguage } from '../../lib/i18n/i18n';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type FeaturedVisit = {
  id: number;
  services: ServiceItem[];
};

function withAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return hex;
  }
  const red = Number.parseInt(raw.slice(0, 2), 16);
  const green = Number.parseInt(raw.slice(2, 4), 16);
  const blue = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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

function visibleSlugSet(
  services: ServiceItem[],
  category: CategoryFilterId,
  query: string,
  language: AppLanguage,
): Set<string> | null {
  if (category === 'all' && query.trim().length === 0) {
    return null;
  }
  const categoryList = category === 'all' ? services : services.filter((item) => item.category === category);
  return new Set(filterServicesByQuery(categoryList, query, language).map((item) => item.slug));
}

export default function ServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const softLaunch = useSoftLaunch();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const language = useLanguageStore((state) => state.language);
  const { category: categoryParam } = useLocalSearchParams<{ category?: string | string[] }>();
  const initialCategory = readCategoryParam(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>(initialCategory);
  const filtersRef = useRef({ activeCategory: initialCategory, searchQuery: '', language });
  filtersRef.current = { activeCategory, searchQuery, language };
  const hasFocusedOnce = useRef(false);
  const [visit, setVisit] = useState<FeaturedVisit>(() => {
    const catalog = getActiveServices();
    const visible =
      initialCategory === 'all' ? null : new Set(catalog.filter((item) => item.category === initialCategory).map((item) => item.slug));
    return { id: 1, services: nextFeaturedVisit(catalog, visible) };
  });

  const refreshVisit = useCallback(() => {
    const filters = filtersRef.current;
    const catalog = getActiveServices();
    const visible = visibleSlugSet(catalog, filters.activeCategory, filters.searchQuery, filters.language);
    setVisit((current) => ({
      id: current.id + 1,
      services: nextFeaturedVisit(catalog, visible),
    }));
  }, []);

  const catalogCount = getActiveServices().length;
  const awaitingCatalog = useRef(catalogCount === 0);

  useEffect(() => {
    if (!awaitingCatalog.current || catalogCount === 0) {
      return;
    }
    awaitingCatalog.current = false;
    refreshVisit();
  }, [catalogCount, refreshVisit]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return () => {
          Keyboard.dismiss();
        };
      }
      refreshVisit();
      return () => {
        Keyboard.dismiss();
      };
    }, [refreshVisit]),
  );

  useEffect(() => {
    const nextCategory = readCategoryParam(categoryParam);
    if (nextCategory !== 'all') {
      setActiveCategory(nextCategory);
    }
  }, [categoryParam]);

  const filteredServices = useMemo(() => {
    let list = visit.services;
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }
    return filterServicesByQuery(list, searchQuery, language);
  }, [activeCategory, language, searchQuery, visit.services]);

  const sectionTitle =
    activeCategory === 'all'
      ? t('services.allServices')
      : getCategoryLabel(activeCategory);

  const mockAd = activeCategory !== 'all' ? getMockAdForCategory(activeCategory) : DEFAULT_MOCK_AD;
  const adWidth = windowWidth;
  const naturalAdHeight = mockAd.variant === 'image' ? getImageAdHeight(mockAd, adWidth) || 96 : 96;
  const adHeight = Math.min(naturalAdHeight, windowHeight < 760 ? 76 : 100);

  const clearCategoryFilter = () => {
    setActiveCategory('all');
    router.replace('/(tabs)/services');
  };

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right']} style={{ backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingBottom: spacing.stackSm }}>
        <View style={{ flex: 1, minHeight: 0 }}>
          <FeaturedServiceCarousel
            services={filteredServices}
            visitKey={visit.id}
            topOverlay={
              <View
                pointerEvents="box-none"
                style={{
                  paddingTop: insets.top + spacing.stackSm,
                  paddingHorizontal: spacing.screenPaddingX,
                  gap: spacing.stackMd,
                }}
              >
                <View pointerEvents="none">
                  <ServicesScreenHeader title={t('services.title')} subtitle={t('services.subtitle')} />
                </View>
                {softLaunch.showSmartMatch ? (
                  <View
                    style={{
                      opacity: 0.75,
                      borderRadius: radius.button,
                      backgroundColor: colors.primary,
                      overflow: 'hidden',
                    }}
                  >
                    <Pressable
                      onPress={() => router.push('/smart-match')}
                      accessibilityRole="button"
                      accessibilityLabel={t('auth.tryAiMatching')}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.9 : 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        minHeight: 44,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      })}
                    >
                      <Text className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                        {t('services.smartMatchBanner')}
                      </Text>
                      <Ionicons name="sparkles-outline" size={16} color="#FFCE2D" />
                    </Pressable>
                  </View>
                ) : null}

                <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.stackSm }}>
                  <View collapsable={false} style={{ flex: 1 }}>
                    <ServiceSearchBar
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      backgroundColor={withAlpha(colors.card, 0.94)}
                    />
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

                <ServiceSearchResults query={searchQuery} />

                {activeCategory !== 'all' ? (
                  <Pressable
                    onPress={clearCategoryFilter}
                    accessibilityRole="button"
                    accessibilityLabel={t('services.clearCategoryFilter')}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.66 : 0.75,
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
            }
            belowFeature={
              <MockAdPanel key={activeCategory} width={adWidth} height={adHeight} ad={mockAd} />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
