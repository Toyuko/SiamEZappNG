import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceCarouselCard } from './ServiceCarouselCard';

type ServiceCarouselProps = {
  services: ServiceItem[];
  /** Fraction of window height reserved for the carousel (0–1). */
  heightFraction?: number;
};

const CARD_GAP = spacing.stackMd;

export function ServiceCarousel({ services, heightFraction = 0.36 }: ServiceCarouselProps) {
  const { colors } = useTheme();
  const { width: screenWidth, height: windowHeight } = useWindowDimensions();
  const pageWidth = screenWidth - spacing.screenPaddingX * 2;
  const cardHeight = Math.round(windowHeight * heightFraction);
  const listRef = useRef<FlatList<ServiceItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / (pageWidth + CARD_GAP));
      setActiveIndex(Math.max(0, Math.min(services.length - 1, index)));
    },
    [pageWidth, services.length],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ServiceItem>) => (
      <View style={{ width: pageWidth, marginRight: CARD_GAP }}>
        <ServiceCarouselCard service={item} cardHeight={cardHeight} />
      </View>
    ),
    [cardHeight, pageWidth],
  );

  if (services.length === 0) {
    return (
      <View style={{ height: cardHeight, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-center text-base font-semibold" style={{ color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text className="mt-2 max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.stackSm }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold" style={{ color: colors.foreground }}>
          {t('services.featuredServices')}
        </Text>
        <Text className="text-[11px]" style={{ color: colors.muted }}>
          {t('services.swipeToExplore')}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={services}
        keyExtractor={(item) => item.slug}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={pageWidth + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: pageWidth + CARD_GAP,
          offset: (pageWidth + CARD_GAP) * index,
          index,
        })}
        style={{ height: cardHeight }}
        contentContainerStyle={{ paddingRight: CARD_GAP }}
      />

      {services.length > 1 ? (
        <View className="flex-row items-center justify-center gap-2">
          {services.map((service, index) => (
            <View
              key={service.slug}
              style={{
                width: index === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: index === activeIndex ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
