import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ServiceItem } from '../../features/services/services.types';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { FeaturedPromoCard } from './FeaturedPromoCard';

const H_PAD = spacing.medium;
/** Tall promo card — dominant but not taller than the viewport. */
const CARD_ASPECT = 1.08;

type FeaturedPromoCarouselProps = {
  services: ServiceItem[];
};

/**
 * Large featured campaign carousel — dominant marketplace hero.
 */
export function FeaturedPromoCarousel({ services }: FeaturedPromoCarouselProps) {
  const { colors } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const pageWidth = windowWidth;
  const cardWidth = Math.max(280, windowWidth - H_PAD * 2);
  const cardHeight = Math.min(
    Math.round(windowHeight * 0.52),
    Math.max(340, Math.round(cardWidth * CARD_ASPECT)),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<ServiceItem>>(null);

  const data = useMemo(() => services.slice(0, 8), [services]);

  const settle = useCallback(
    (offsetX: number) => {
      if (pageWidth <= 0 || data.length === 0) return;
      const next = Math.max(0, Math.min(data.length - 1, Math.round(offsetX / pageWidth)));
      setActiveIndex((current) => (current === next ? current : next));
    },
    [data.length, pageWidth],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settle(event.nativeEvent.contentOffset.x);
    },
    [settle],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ServiceItem>) => (
      <View style={{ width: pageWidth, alignItems: 'center' }}>
        <FeaturedPromoCard
          service={item}
          width={cardWidth}
          height={cardHeight}
          isActive={index === activeIndex}
        />
      </View>
    ),
    [activeIndex, cardHeight, cardWidth, pageWidth],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.duration(380)}>
      <View style={{ marginHorizontal: -H_PAD }}>
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(item) => item.slug}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={data.length > 1}
          scrollEnabled={data.length > 1}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={(event) => {
            const velocity = event.nativeEvent.velocity?.x ?? 0;
            if (Math.abs(velocity) < 0.05) {
              settle(event.nativeEvent.contentOffset.x);
            }
          }}
          getItemLayout={(_, index) => ({
            length: pageWidth,
            offset: pageWidth * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          renderItem={renderItem}
        />
      </View>

      {data.length > 1 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            marginTop: 14,
          }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {data.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <View
                key={item.slug}
                style={{
                  width: selected ? 18 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: selected ? siam.blue.DEFAULT : colors.border,
                }}
              />
            );
          })}
        </View>
      ) : null}
    </Animated.View>
  );
}
