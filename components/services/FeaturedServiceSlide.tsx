import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { getServiceTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServicePosterHero } from './ServicePosterHero';

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
      style={{ width, height }}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View style={[{ width, height }, animatedStyle]}>
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
            width={width}
            height={height}
            resizeMode="cover"
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
