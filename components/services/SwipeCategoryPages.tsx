import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ServiceIconCard } from './ServiceIconCard';
import { filterServicesByQuery } from '../../features/services/service-display';
import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import type { AppLanguage } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type CategoryPage = {
  id: ServiceCategoryId;
  labelKey: string;
};

type SwipeCategoryPagesProps = {
  searchQuery: string;
  language: AppLanguage;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
};

const GRID_GAP = spacing.stackMd;
const GRID_COLUMNS = 2;

function CategoryServiceGrid({
  categoryId,
  searchQuery,
  language,
  pageWidth,
}: {
  categoryId: ServiceCategoryId;
  searchQuery: string;
  language: AppLanguage;
  pageWidth: number;
}) {
  const { colors } = useTheme();
  const services = useMemo(() => {
    const inCategory = getServicesByCategory(categoryId);
    return filterServicesByQuery(inCategory, searchQuery, language);
  }, [categoryId, searchQuery, language]);

  const cardWidth = (pageWidth - GRID_GAP) / GRID_COLUMNS;

  if (services.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4 py-10">
        <Text className="text-center text-base font-semibold" style={{ color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.stackLg }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: GRID_GAP,
        }}
      >
        {services.map((service) => (
          <View key={service.slug} style={{ width: cardWidth }}>
            <ServiceIconCard service={service} variant="grid" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function SwipeCategoryPages({
  searchQuery,
  language,
  activeIndex,
  onActiveIndexChange,
}: SwipeCategoryPagesProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const pageWidth = windowWidth - spacing.screenPaddingX * 2;
  const listRef = useRef<FlatList<CategoryPage>>(null);

  const pages = useMemo<CategoryPage[]>(
    () =>
      SERVICE_CATEGORY_ORDER.map((id) => {
        const config = SERVICE_CATEGORIES.find((item) => item.id === id);
        return { id, labelKey: config?.labelKey ?? id };
      }),
    [],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, index));
      listRef.current?.scrollToIndex({ index: clamped, animated: true });
      onActiveIndexChange(clamped);
    },
    [onActiveIndexChange, pages.length],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      onActiveIndexChange(Math.max(0, Math.min(pages.length - 1, index)));
    },
    [onActiveIndexChange, pageWidth, pages.length],
  );

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<CategoryPage>) => (
      <View style={{ width: pageWidth, flex: 1 }}>
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.foreground }}>
          {t(item.labelKey)}
        </Text>
        <CategoryServiceGrid
          categoryId={item.id}
          searchQuery={searchQuery}
          language={language}
          pageWidth={pageWidth}
        />
      </View>
    ),
    [colors.foreground, language, pageWidth, searchQuery],
  );

  return (
    <View style={{ flex: 1, gap: spacing.stackMd }}>
      <ScrollCategoryTabs activeIndex={activeIndex} onSelect={scrollToIndex} />

      <View className="flex-row items-center justify-center gap-2">
        {pages.map((page, index) => (
          <View
            key={page.id}
            style={{
              width: index === activeIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: index === activeIndex ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(item) => item.id}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
        style={{ flex: 1 }}
      />
    </View>
  );
}

type ScrollCategoryTabsProps = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

function ScrollCategoryTabs({ activeIndex, onSelect }: ScrollCategoryTabsProps) {
  const { colors } = useTheme();
  const tabsRef = useRef<FlatList<(typeof SERVICE_CATEGORIES)[number]>>(null);
  const [tabListWidth, setTabListWidth] = useState(0);

  const scrollTabIntoView = useCallback(
    (index: number) => {
      if (tabListWidth <= 0) {
        return;
      }
      tabsRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    },
    [tabListWidth],
  );

  useEffect(() => {
    scrollTabIntoView(activeIndex);
  }, [activeIndex, scrollTabIntoView]);

  return (
    <FlatList
      ref={tabsRef}
      data={SERVICE_CATEGORIES}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => setTabListWidth(e.nativeEvent.layout.width)}
      contentContainerStyle={{ gap: spacing.stackSm, paddingVertical: 2 }}
      renderItem={({ item, index }) => {
        const selected = index === activeIndex;
        return (
          <Pressable
            onPress={() => {
              onSelect(index);
              scrollTabIntoView(index);
            }}
            className="rounded-full px-3.5 py-2"
            style={{
              backgroundColor: selected ? colors.primary : colors.card,
              borderColor: colors.border,
              borderWidth: selected ? 0 : 1,
            }}
          >
            <Text className="text-xs font-semibold" style={{ color: selected ? '#ffffff' : colors.foreground }}>
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
