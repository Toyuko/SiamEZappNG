import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDiscoveryGrid } from '../components/services/CategoryDiscoveryGrid';
import { VOICE_FAB_SCROLL_EXTRA } from '../components/voice/voice-fab-layout';
import type { ServiceCategoryId } from '../features/services/services.types';
import { trackFunnel } from '../lib/analytics/funnel';
import { t } from '../lib/i18n/i18n';
import { radius, shadows, spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';

/**
 * Dedicated Categories browser — opened from the Services landing Categories button.
 * Does not alter the approved Services landing page.
 */
export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: spacing.medium,
          paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA,
          gap: spacing.stackLg,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 44,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: 12,
            gap: 8,
            ...shadows.cardLight,
          }}
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('services.categoriesSearchPlaceholder')}
            placeholderTextColor={colors.muted}
            accessibilityLabel={t('services.categoriesSearchPlaceholder')}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={{
              flex: 1,
              fontSize: 15,
              color: colors.foreground,
              paddingVertical: 10,
            }}
          />
        </View>

        <CategoryDiscoveryGrid onSelect={openCategory} query={query} />
      </ScrollView>
    </SafeAreaView>
  );
}
