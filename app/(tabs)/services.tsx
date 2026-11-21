import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { Button } from '../../components/ui/Button';
import { ServiceSearchBar } from '../../components/services/ServiceSearchBar';
import {
  filterServicesByQuery,
  getCategoryLabel,
  getServiceDescription,
  getServiceTitle,
} from '../../features/services/service-display';
import { getActiveServices } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type CategoryFilterId = ServiceCategoryId | 'all';

const CATEGORY_PILLS: CategoryFilterId[] = [
  'all',
  'immigration-legal',
  'driving-vehicle',
  'translation-documents',
  'home-property',
];

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

function ServiceListCard({ item }: { item: ServiceItem }) {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const title = getServiceTitle(item, language);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        trackFunnel('service_viewed', { slug: item.slug });
        router.push(`/services/${item.slug}`);
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.9 : 1,
        ...shadows.cardLight,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${siam.blue.DEFAULT}14`,
        }}
      >
        <Ionicons name={(item.icon as keyof typeof Ionicons.glyphMap) || 'grid-outline'} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text className="text-[16px] font-semibold" numberOfLines={1} style={{ color: colors.foreground }}>
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5" numberOfLines={2} style={{ color: colors.muted }}>
          {getServiceDescription(item, language)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const { category: categoryParam } = useLocalSearchParams<{ category?: string | string[] }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterId>(readCategoryParam(categoryParam));

  useEffect(() => {
    const nextCategory = readCategoryParam(categoryParam);
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from route only
  }, [categoryParam]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, []),
  );

  const services = useMemo(() => {
    const catalog = getActiveServices();
    const byCategory =
      activeCategory === 'all' ? catalog : catalog.filter((item) => item.category === activeCategory);
    return filterServicesByQuery(byCategory, searchQuery, language);
  }, [activeCategory, language, searchQuery]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          paddingBottom: 100 + VOICE_FAB_SCROLL_EXTRA,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 4 }}>
            <View>
              <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.foreground }}>
                {t('services.title')}
              </Text>
              <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
                {t('services.subtitle')}
              </Text>
            </View>

            <ServiceSearchBar value={searchQuery} onChangeText={setSearchQuery} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORY_PILLS.map((item) => {
                const selected = item === activeCategory;
                const label = item === 'all' ? t('services.filterAll') : getCategoryLabel(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setActiveCategory(item);
                      if (item === 'all') {
                        router.replace('/(tabs)/services');
                      } else {
                        router.setParams({ category: item });
                      }
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radius.full,
                      backgroundColor: selected ? siam.yellow.DEFAULT : colors.card,
                      borderWidth: 1,
                      borderColor: selected ? siam.yellow.dark : colors.border,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: selected ? siam.blue.navy : colors.foreground }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Button
              label={t('home.bookService')}
              variant="accent"
              gradient
              onPress={() => {
                trackFunnel('booking_started', { source: 'services_header_cta' });
                router.push('/(tabs)/book');
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('services.noResults')}
            </Text>
          </View>
        }
        renderItem={({ item }) => <ServiceListCard item={item} />}
      />
    </SafeAreaView>
  );
}
