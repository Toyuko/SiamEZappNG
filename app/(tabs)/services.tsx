import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips, type CategoryFilterId } from '../../components/services/CategoryChips';
import { PopularServices } from '../../components/services/PopularServices';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
import { ServicesDirectory } from '../../components/services/ServicesDirectory';
import { ServicesPageHeader } from '../../components/services/ServicesPageHeader';
import { MockAdPanel } from '../../components/ui/MockAdPanel';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { filterServicesByQuery } from '../../features/services/service-display';
import { getActiveServices, getFeaturedServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { shadows, spacing } from '../../lib/theme/tokens';
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
    const featuredSlugs = new Set(featured.map((item) => item.slug));
    const preferred = filtered.filter((item) => featuredSlugs.has(item.slug));
    return (preferred.length > 0 ? preferred : filtered).slice(0, 6);
  }, [featured, filtered]);

  const searching = searchQuery.trim().length > 0;
  const showGroupedDirectory = !searching && activeCategory === 'all';

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
      <ServicesPageHeader compact />

      <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: spacing.medium,
            paddingTop: spacing.stackMd,
            paddingBottom: 100 + VOICE_FAB_SCROLL_EXTRA,
            gap: spacing.stackMd,
          }}
        >
          <View className="flex-row items-center" style={{ gap: 8 }}>
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
                height: 48,
                minWidth: 80,
                paddingHorizontal: 10,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                ...shadows.cardLight,
              })}
            >
              <Ionicons name="grid-outline" size={16} color={colors.primary} />
              <Text className="text-[10px] font-semibold" style={{ color: colors.primary }}>
                {t('services.categoriesButton')}
              </Text>
            </Pressable>
          </View>

          <ServiceSearchResults query={searchQuery} />

          <CategoryChips activeCategory={activeCategory} onSelect={onSelectCategory} />

          {!searching ? (
            <>
              {/* Directory first — browseable services above the fold */}
              <ServicesDirectory
                services={filtered}
                groupByCategory={showGroupedDirectory}
                title={t('services.allServices')}
                subtitle={t('services.directorySubtitle')}
                source="services_directory"
              />

              {activeCategory === 'all' && popular.length > 0 ? (
                <PopularServices services={popular} />
              ) : null}

              {activeCategory === 'all' ? <MockAdPanel height={96} /> : null}
            </>
          ) : (
            <ServicesDirectory
              services={filtered}
              groupByCategory={false}
              title={t('search.resultCount', { count: filtered.length })}
              source="services_search"
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
