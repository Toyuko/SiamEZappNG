import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  FlatList,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { FeaturedServiceSlide } from './FeaturedServiceSlide';
import { ServiceActionButtons } from './ServiceActionButtons';

const MAX_DOTS = 7;
const DOTS_HEIGHT = 18;

type FeaturedServiceCarouselProps = {
  services: ServiceItem[];
  /** Changes when the screen focuses again so the pager returns to the new featured service. */
  visitKey: number;
  /** Stays fixed under the poster while featured services swipe. */
  belowFeature?: ReactNode;
};

type Frame = {
  width: number;
  height: number;
};

export function paginationWindow(count: number, active: number, max = MAX_DOTS): { start: number; end: number } {
  if (count <= max) {
    return { start: 0, end: Math.max(0, count) };
  }
  const half = Math.floor(max / 2);
  let start = Math.max(0, active - half);
  let end = start + max;
  if (end > count) {
    end = count;
    start = Math.max(0, end - max);
  }
  return { start, end };
}

export function FeaturedServiceCarousel({ services, visitKey, belowFeature }: FeaturedServiceCarouselProps) {
  const { colors, isDark } = useTheme();
  const listRef = useRef<FlatList<ServiceItem>>(null);
  const appliedVisit = useRef<number | null>(null);
  const activeSlugRef = useRef<string | null>(services[0]?.slug ?? null);
  const scrollX = useSharedValue(0);
  const pageWidthSv = useSharedValue(0);
  const lastReportedIndex = useSharedValue(0);
  const [frame, setFrame] = useState<Frame>({ width: 0, height: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackedVisit, setTrackedVisit] = useState(visitKey);

  if (trackedVisit !== visitKey) {
    setTrackedVisit(visitKey);
    setActiveIndex(0);
    activeSlugRef.current = services[0]?.slug ?? null;
  }

  useEffect(() => {
    pageWidthSv.value = frame.width;
  }, [frame.width, pageWidthSv]);

  const settleOnOffset = useCallback(
    (offsetX: number) => {
      if (frame.width <= 0 || services.length === 0) {
        return;
      }
      const next = Math.max(0, Math.min(services.length - 1, Math.round(offsetX / frame.width)));
      activeSlugRef.current = services[next]?.slug ?? null;
      lastReportedIndex.value = next;
      setActiveIndex((current) => (current === next ? current : next));
    },
    [frame.width, lastReportedIndex, services],
  );

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
        const pageWidth = pageWidthSv.value;
        if (pageWidth <= 0) {
          return;
        }
        const next = Math.max(0, Math.round(event.contentOffset.x / pageWidth));
        if (next !== lastReportedIndex.value) {
          lastReportedIndex.value = next;
          runOnJS(settleOnOffset)(event.contentOffset.x);
        }
      },
    },
    [settleOnOffset],
  );

  useEffect(() => {
    if (frame.width <= 0 || services.length === 0) {
      setActiveIndex(0);
      activeSlugRef.current = services[0]?.slug ?? null;
      return;
    }

    const visitChanged = appliedVisit.current !== visitKey;
    appliedVisit.current = visitKey;
    const slug = visitChanged ? services[0]?.slug : activeSlugRef.current;
    let next = services.findIndex((item) => item.slug === slug);
    if (next < 0) {
      next = 0;
    }
    activeSlugRef.current = services[next]?.slug ?? null;
    lastReportedIndex.value = next;
    setActiveIndex(next);
    scrollX.value = next * frame.width;
    listRef.current?.scrollToOffset({ offset: next * frame.width, animated: false });
  }, [frame.width, lastReportedIndex, scrollX, services, visitKey]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settleOnOffset(event.nativeEvent.contentOffset.x);
    },
    [settleOnOffset],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ServiceItem>) => (
      <FeaturedServiceSlide
        service={item}
        index={index}
        width={frame.width}
        height={frame.height}
        scrollX={scrollX}
        isActive={index === activeIndex}
        total={services.length}
      />
    ),
    [activeIndex, frame.height, frame.width, scrollX, services.length],
  );

  const activeService = services[activeIndex] ?? services[0];
  const showDots = services.length > 1;
  const dotWindow = paginationWindow(services.length, activeIndex);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1, minHeight: 180, overflow: 'hidden' }}
        onLayout={(event) => {
          const width = Math.round(event.nativeEvent.layout.width);
          const height = Math.round(event.nativeEvent.layout.height);
          setFrame((current) =>
            Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1 ? current : { width, height },
          );
        }}
      >
        {services.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {t('services.emptyTitle')}
            </Text>
            <Text style={[styles.emptyHint, { color: colors.muted }]}>{t('services.emptyHint')}</Text>
          </View>
        ) : frame.width > 0 && frame.height > 0 ? (
          <Animated.FlatList
            key={visitKey}
            ref={listRef}
            data={services}
            keyExtractor={(item) => item.slug}
            extraData={activeIndex}
            horizontal
            pagingEnabled
            bounces={services.length > 1}
            scrollEnabled={services.length > 1}
            decelerationRate="fast"
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={onScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={(event) => {
              const velocity = event.nativeEvent.velocity?.x ?? 0;
              if (Math.abs(velocity) < 0.05) {
                settleOnOffset(event.nativeEvent.contentOffset.x);
              }
            }}
            renderItem={renderItem}
            getItemLayout={(_, index) => ({
              length: frame.width,
              offset: frame.width * index,
              index,
            })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            style={{ height: frame.height, flexGrow: 0 }}
          />
        ) : null}

        <View pointerEvents="none" style={styles.headerRow}>
          <View style={[styles.headerChip, { backgroundColor: isDark ? 'rgba(24,24,27,0.78)' : 'rgba(255,255,255,0.88)' }]}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>
              {t('services.featuredServices')}
            </Text>
          </View>
          {services.length > 1 ? (
            <View style={[styles.headerChip, { backgroundColor: isDark ? 'rgba(24,24,27,0.78)' : 'rgba(255,255,255,0.88)' }]}>
              <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>
                {t('services.swipeToExplore')}
              </Text>
            </View>
          ) : null}
        </View>

        {activeService ? (
          <View pointerEvents="box-none" style={styles.floatingActions}>
            {showDots ? (
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={styles.dots}>
                {Array.from({ length: dotWindow.end - dotWindow.start }, (_, offset) => {
                  const index = dotWindow.start + offset;
                  const selected = index === activeIndex;
                  return (
                    <View
                      key={`dot-${index}`}
                      style={{
                        width: selected ? 18 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: selected ? colors.primary : 'rgba(255,255,255,0.92)',
                        borderWidth: 1,
                        borderColor: 'rgba(15,23,42,0.28)',
                      }}
                    />
                  );
                })}
              </View>
            ) : null}
            <View pointerEvents="auto" style={styles.floatingButtons}>
              <ServiceActionButtons service={activeService} />
            </View>
          </View>
        ) : null}
      </View>

      {belowFeature ? <View style={{ flexShrink: 0, marginTop: spacing.stackSm }}>{belowFeature}</View> : null}
    </View>
  );
}

const styles = {
  headerRow: {
    position: 'absolute' as const,
    top: spacing.stackSm,
    left: spacing.screenPaddingX,
    right: spacing.screenPaddingX,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  headerChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '68%' as const,
  },
  floatingActions: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screenPaddingX,
    paddingBottom: spacing.stackMd,
    gap: spacing.stackSm,
  },
  floatingButtons: {
    opacity: 0.75,
  },
  empty: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 24,
  },
  emptyHint: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: 'center' as const,
    fontSize: 14,
    lineHeight: 20,
  },
  dots: {
    height: DOTS_HEIGHT,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
};
