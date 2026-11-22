import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDiscoveryGrid } from '../components/services/CategoryDiscoveryGrid';
import { VOICE_FAB_SCROLL_EXTRA } from '../components/voice/voice-fab-layout';
import { SERVICE_CATEGORIES } from '../features/services/services.types';
import type { ServiceCategoryId } from '../features/services/services.types';
import { trackFunnel } from '../lib/analytics/funnel';
import { t } from '../lib/i18n/i18n';
import { spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';

function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return SERVICE_CATEGORIES.some((item) => item.id === value);
}

/**
 * Dedicated Categories browser — premium image cards, navigates into filtered services.
 */
export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string | string[] }>();

  useEffect(() => {
    const raw = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;
    if (raw && isServiceCategoryId(raw)) {
      router.replace({ pathname: '/all-services', params: { category: raw } });
    }
  }, [categoryParam, router]);

  const openCategory = (categoryId: ServiceCategoryId) => {
    trackFunnel('service_category_selected', { category: categoryId, source: 'categories_page' });
    router.push({ pathname: '/all-services', params: { category: categoryId } });
  };

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.stackMd,
          paddingHorizontal: spacing.medium,
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
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.foreground }}>
            {t('services.categoriesPage.title')}
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
            {t('services.categoriesPage.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.medium,
          paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA,
          gap: spacing.stackLg,
        }}
      >
        <CategoryDiscoveryGrid onSelect={openCategory} />
      </ScrollView>
    </SafeAreaView>
  );
}
