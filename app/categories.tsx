import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CategoryCarousel } from '../components/services/CategoryCarousel';
import { ServiceCarousel } from '../components/services/ServiceCarousel';
import { MockAdPanel } from '../components/ui/MockAdPanel';
import { getMockAdForCategory } from '../features/ads/mock-ads';
import { getCategoryLabel } from '../features/services/service-display';
import { getServicesByCategory } from '../features/services/services.data';
import type { ServiceCategoryId } from '../features/services/services.types';
import { t } from '../lib/i18n/i18n';
import { radius, spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';

/** Share of screen below the page header reserved for the category carousel row. */
const CAROUSEL_HEIGHT_FRACTION = 0.38;
/** Share of screen below the page header reserved for the ad panel. */
const AD_HEIGHT_FRACTION = 0.30;
const PAGE_HEADER_HEIGHT = 72;

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId | null>(null);
  const contentHeight = windowHeight - PAGE_HEADER_HEIGHT - 100;
  const carouselHeight = Math.round(contentHeight * (CAROUSEL_HEIGHT_FRACTION / (CAROUSEL_HEIGHT_FRACTION + AD_HEIGHT_FRACTION)));
  const adHeight = Math.round(contentHeight * (AD_HEIGHT_FRACTION / (CAROUSEL_HEIGHT_FRACTION + AD_HEIGHT_FRACTION)));
  const categoryServices = useMemo(
    () => (selectedCategory ? getServicesByCategory(selectedCategory) : []),
    [selectedCategory],
  );
  const mockAd = selectedCategory ? getMockAdForCategory(selectedCategory) : undefined;

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: spacing.screenPaddingX }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.stackMd,
            paddingTop: spacing.stackSm,
            paddingBottom: spacing.stackMd,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.foreground }}>{t('services.categoriesPage.title')}</Text>
            <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>{t('services.categoriesPage.subtitle')}</Text>
          </View>
        </View>

        {selectedCategory ? (
          <Pressable
            onPress={() => setSelectedCategory(null)}
            accessibilityRole="button"
            accessibilityLabel={t('services.clearCategoryFilter')}
            style={({ pressed }) => ({
              opacity: pressed ? 0.88 : 1,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: spacing.stackSm,
              borderRadius: radius.full,
              backgroundColor: colors.primary,
            })}
          >
            <Text className="text-xs font-semibold" style={{ color: '#ffffff' }}>
              {getCategoryLabel(selectedCategory)}
            </Text>
            <Ionicons name="close" size={14} color="#ffffff" />
          </Pressable>
        ) : null}

        {selectedCategory ? (
          <ServiceCarousel services={categoryServices} carouselHeight={carouselHeight} />
        ) : (
          <CategoryCarousel carouselHeight={carouselHeight} onCategoryPress={setSelectedCategory} />
        )}
        <View style={{ height: spacing.stackMd }} />
        <MockAdPanel key={selectedCategory ?? 'all'} height={adHeight} ad={mockAd} />
      </View>
    </SafeAreaView>
  );
}
