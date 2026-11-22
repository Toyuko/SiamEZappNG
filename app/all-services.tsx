import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryChips, type CategoryFilterId } from '../components/services/CategoryChips';
import { ServiceSearchBar } from '../components/services/ServiceSearchBar';
import { ServicesDirectory } from '../components/services/ServicesDirectory';
import { VOICE_FAB_SCROLL_EXTRA } from '../components/voice/voice-fab-layout';
import { filterServicesByQuery, getCategoryLabel } from '../features/services/service-display';
import { getActiveServices } from '../features/services/services.data';
import { SERVICE_CATEGORIES } from '../features/services/services.types';
import type { ServiceCategoryId } from '../features/services/services.types';
import { t } from '../lib/i18n/i18n';
import { useLanguageStore } from '../lib/i18n/useLanguageStore';
import { spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';

function isServiceCategoryId(value: string): value is ServiceCategoryId {
  return SERVICE_CATEGORIES.some((item) => item.id === value);
}

function readCategoryParam(value: string | string[] | undefined): CategoryFilterId {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && isServiceCategoryId(raw)) {
    return raw;
  }
  return 'all';
}

/**
 * Filtered services directory — opened from category discovery cards.
 */
export default function AllServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const { category: categoryParam } = useLocalSearchParams<{ category?: string | string[] }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>(() => readCategoryParam(categoryParam));

  useEffect(() => {
    setActiveCategory(readCategoryParam(categoryParam));
  }, [categoryParam]);

  const catalog = useMemo(() => getActiveServices(), []);
  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === 'all' ? catalog : catalog.filter((item) => item.category === (activeCategory as ServiceCategoryId));
    return filterServicesByQuery(byCategory, searchQuery, language);
  }, [activeCategory, catalog, language, searchQuery]);

  const title =
    activeCategory === 'all' ? t('services.allServices') : getCategoryLabel(activeCategory as ServiceCategoryId);
  const subtitle =
    activeCategory === 'all'
      ? t('services.directorySubtitle')
      : t('services.serviceCount', { count: filtered.length });

  const onSelectCategory = (category: CategoryFilterId) => {
    setActiveCategory(category);
    if (category === 'all') {
      router.setParams({ category: undefined });
      return;
    }
    router.setParams({ category });
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
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground }}>{title}</Text>
          <Text style={{ fontSize: 13, lineHeight: 18, color: colors.muted }}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: spacing.medium,
          paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA,
          gap: spacing.stackMd,
        }}
      >
        <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} backgroundColor={colors.card} />
        <CategoryChips activeCategory={activeCategory} onSelect={onSelectCategory} />
        <ServicesDirectory
          services={filtered}
          groupByCategory={activeCategory === 'all' && searchQuery.trim().length === 0}
          source="all_services_catalog"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
