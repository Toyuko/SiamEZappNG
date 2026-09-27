import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getServiceTitle } from '../../features/services/service-display';
import { getServicePosterImageUrl } from '../../features/services/service-poster-images';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServicePosterHero } from './ServicePosterHero';

const posterRatioCache = new Map<string, number>();

function fitPoster(maxWidth: number, maxHeight: number, widthOverHeight: number | null) {
  if (!widthOverHeight || maxWidth <= 0 || maxHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }
  let cardWidth = maxWidth;
  let cardHeight = cardWidth / widthOverHeight;
  if (cardHeight > maxHeight) {
    cardHeight = maxHeight;
    cardWidth = cardHeight * widthOverHeight;
  }
  return {
    width: Math.max(1, Math.round(cardWidth)),
    height: Math.max(1, Math.round(cardHeight)),
  };
}

type FeaturedServiceSlideProps = {
  service: ServiceItem;
  index: number;
  width: number;
  height: number;
  scrollX: SharedValue<number>;
  isActive: boolean;
  total: number;
};

export function FeaturedServiceSlide({
  service,
  index,
  width,
  height,
  scrollX,
  isActive,
  total,
}: FeaturedServiceSlideProps) {
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceTitle(service, language);
  const frame = isDark ? colors.background : '#101828';
  const shadowStyle = isDark ? shadows.cardDarkMedium : shadows.cardMedium;
  const [widthOverHeight, setWidthOverHeight] = useState<number | null>(() => posterRatioCache.get(service.slug) ?? null);
  const fitted = fitPoster(width, height, widthOverHeight);

  useEffect(() => {
    const cached = posterRatioCache.get(service.slug);
    if (cached) {
      setWidthOverHeight(cached);
      return;
    }

    let cancelled = false;
    Image.getSize(
      getServicePosterImageUrl(service.slug),
      (imageWidth, imageHeight) => {
        if (cancelled || imageWidth <= 0 || imageHeight <= 0) {
          return;
        }
        const ratio = imageWidth / imageHeight;
        posterRatioCache.set(service.slug, ratio);
        setWidthOverHeight(ratio);
      },
      () => {},
    );

    return () => {
      cancelled = true;
    };
  }, [service.slug]);

  const animatedStyle = useAnimatedStyle(() => {
    const position = index * width;
    const scale = interpolate(scrollX.value, [position - width, position, position + width], [0.96, 1, 0.96], 'clamp');
    const opacity = interpolate(scrollX.value, [position - width, position, position + width], [0.84, 1, 0.84], 'clamp');
    return {
      opacity,
      transform: [{ scale }],
    };
  }, [index, width]);

  return (
    <View
      style={{ width, height, alignItems: 'center', justifyContent: 'flex-end' }}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View style={[{ width: fitted.width, height: fitted.height }, animatedStyle]}>
        <View
          style={[
            styles.stage,
            shadowStyle,
            {
              backgroundColor: frame,
              borderColor: colors.border,
            },
          ]}
        >
          <ServicePosterHero
            service={service}
            width={fitted.width}
            height={fitted.height}
            resizeMode="contain"
            showLoading
            indicatorColor={isDark ? '#e4e4e7' : '#ffffff'}
            accessibilityLabel={
              isActive ? t('services.featuredServiceLabel', { title, current: index + 1, total }) : undefined
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
