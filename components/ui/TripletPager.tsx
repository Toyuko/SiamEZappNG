import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { chunkIntoPages } from '../../features/services/grid-layout';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const PAGE_GAP = spacing.stackMd;
const COL_GAP = spacing.stackSm;
const HEADER_ROW_HEIGHT = 22;
const DOTS_HEIGHT = 18;
/** How many times to repeat pages for seamless infinite forward/back swiping. */
const LOOP_REPEATS = 120;
export const TRIPLET_ITEMS_PER_PAGE = 3;

export type TripletCardSize = {
  cardHeight: number;
  cardWidth: number;
};

type TripletPagerProps<T> = {
  items: T[];
  /** Height of the card row in px — overrides heightFraction when set. */
  carouselHeight?: number;
  heightFraction?: number;
  headerTitle: string;
  headerHint: string;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, size: TripletCardSize) => ReactNode;
  emptyTitle: string;
  emptyHint: string;
  /** Loop pages endlessly when swiping (default true). */
  infinite?: boolean;
};

export function TripletPager<T>({
  items,
  carouselHeight: carouselHeightProp,
  heightFraction = 0.38,
  headerTitle,
  headerHint,
  keyExtractor,
  renderItem,
  emptyTitle,
  emptyHint,
  infinite = true,
}: TripletPagerProps<T>) {
  const { colors } = useTheme();
  const { width: screenWidth, height: windowHeight } = useWindowDimensions();
  const pageWidth = screenWidth - spacing.screenPaddingX * 2;
  const pageStride = pageWidth + PAGE_GAP;
  const carouselHeight = carouselHeightProp ?? Math.round(windowHeight * heightFraction);
  const cardWidth = Math.floor((pageWidth - COL_GAP * (TRIPLET_ITEMS_PER_PAGE - 1)) / TRIPLET_ITEMS_PER_PAGE);
  const cardSize: TripletCardSize = { cardHeight: carouselHeight, cardWidth };
  const listRef = useRef<FlatList<T[]>>(null);
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(() => chunkIntoPages(items, TRIPLET_ITEMS_PER_PAGE), [items]);
  const pageCount = pages.length;
  const useInfiniteLoop = infinite && pageCount > 1;

  const loopedPages = useMemo(() => {
    if (!useInfiniteLoop) {
      return pages;
    }
    return Array.from({ length: LOOP_REPEATS }, () => pages).flat();
  }, [pages, useInfiniteLoop]);

  const loopAnchorIndex = useMemo(() => {
    if (!useInfiniteLoop) {
      return 0;
    }
    return Math.floor(LOOP_REPEATS / 2) * pageCount;
  }, [pageCount, useInfiniteLoop]);

  const showDots = pageCount > 1;
  const blockHeight =
    HEADER_ROW_HEIGHT + spacing.stackSm + carouselHeight + (showDots ? DOTS_HEIGHT + spacing.stackSm : 0);

  const scrollToLoopIndex = useCallback(
    (index: number, animated = false) => {
      listRef.current?.scrollToOffset({ offset: index * pageStride, animated });
    },
    [pageStride],
  );

  useEffect(() => {
    setActivePage(0);
    scrollToLoopIndex(useInfiniteLoop ? loopAnchorIndex : 0, false);
  }, [items, loopAnchorIndex, scrollToLoopIndex, useInfiniteLoop]);

  const normalizeLoopIndex = useCallback(
    (index: number) => {
      if (!useInfiniteLoop) {
        return Math.max(0, Math.min(pageCount - 1, index));
      }
      return ((index % pageCount) + pageCount) % pageCount;
    },
    [pageCount, useInfiniteLoop],
  );

  const recenterLoopIfNeeded = useCallback(
    (index: number) => {
      if (!useInfiniteLoop) {
        return;
      }

      const edgeBuffer = pageCount * 2;
      if (index > edgeBuffer && index < loopedPages.length - edgeBuffer) {
        return;
      }

      const realPage = normalizeLoopIndex(index);
      const nextIndex = Math.floor(LOOP_REPEATS / 2) * pageCount + realPage;
      scrollToLoopIndex(nextIndex, false);
    },
    [loopedPages.length, normalizeLoopIndex, pageCount, scrollToLoopIndex, useInfiniteLoop],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / pageStride);
      const realPage = normalizeLoopIndex(index);
      setActivePage(realPage);
      recenterLoopIfNeeded(index);
    },
    [normalizeLoopIndex, pageStride, recenterLoopIfNeeded],
  );

  const renderPage = useCallback(
    ({ item: pageItems, index: pageIndex }: ListRenderItemInfo<T[]>) => {
      const slots: (T | null)[] = [...pageItems];
      while (slots.length < TRIPLET_ITEMS_PER_PAGE) {
        slots.push(null);
      }

      return (
        <View
          style={{
            width: pageWidth,
            marginRight: PAGE_GAP,
            flexDirection: 'row',
            height: carouselHeight,
          }}
        >
          {slots.map((item, index) => {
            const slotStyle = {
              width: cardWidth,
              height: carouselHeight,
              marginRight: index < TRIPLET_ITEMS_PER_PAGE - 1 ? COL_GAP : 0,
            };

            if (!item) {
              return <View key={`empty-${pageIndex}-${index}`} style={slotStyle} />;
            }

            return (
              <View key={`${pageIndex}-${keyExtractor(item)}`} style={slotStyle}>
                {renderItem(item, cardSize)}
              </View>
            );
          })}
        </View>
      );
    },
    [cardSize, cardWidth, carouselHeight, keyExtractor, pageWidth, renderItem],
  );

  if (items.length === 0) {
    return (
      <View style={{ height: carouselHeight, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.foreground }}>
          {emptyTitle}
        </Text>
        <Text
          style={{
            marginTop: 8,
            maxWidth: 280,
            textAlign: 'center',
            fontSize: 14,
            lineHeight: 20,
            color: colors.muted,
          }}
        >
          {emptyHint}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height: blockHeight, flexShrink: 0 }}>
      <View
        style={{
          height: HEADER_ROW_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.stackSm,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{headerTitle}</Text>
        <Text style={{ fontSize: 11, color: colors.muted }}>{headerHint}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={loopedPages}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={pageStride}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderPage}
        getItemLayout={(_, index) => ({
          length: pageStride,
          offset: pageStride * index,
          index,
        })}
        initialScrollIndex={useInfiniteLoop ? loopAnchorIndex : undefined}
        onScrollToIndexFailed={() => {
          scrollToLoopIndex(useInfiniteLoop ? loopAnchorIndex : 0, false);
        }}
        style={{ height: carouselHeight, flexGrow: 0 }}
        contentContainerStyle={{ paddingRight: PAGE_GAP }}
      />

      {showDots ? (
        <View
          style={{
            height: DOTS_HEIGHT,
            marginTop: spacing.stackSm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {pages.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={{
                width: index === activePage ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activePage ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
