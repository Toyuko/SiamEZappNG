import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { serviceCatalog, type ServiceItem } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const SERVICE_FILTER_CHIPS = ['All', 'Visa', 'Marriage', 'Translation', 'Business'] as const;
type ServiceFilterChip = (typeof SERVICE_FILTER_CHIPS)[number];

const ICON_SURFACE: Record<ServiceItem['category'], { light: string; dark: string }> = {
  Legal: { light: 'rgba(44, 84, 198, 0.14)', dark: 'rgba(91, 118, 224, 0.26)' },
  Translation: { light: 'rgba(91, 118, 224, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
  Mobility: { light: 'rgba(44, 84, 198, 0.1)', dark: 'rgba(91, 118, 224, 0.2)' },
  Business: { light: 'rgba(255, 206, 45, 0.22)', dark: 'rgba(255, 206, 45, 0.16)' },
  Concierge: { light: 'rgba(44, 84, 198, 0.12)', dark: 'rgba(91, 118, 224, 0.22)' },
};

function matchesFilter(item: ServiceItem, chip: ServiceFilterChip): boolean {
  if (chip === 'All') {
    return true;
  }
  if (chip === 'Visa') {
    return item.slug === 'visa-services';
  }
  if (chip === 'Marriage') {
    return item.slug === 'marriage-registration';
  }
  if (chip === 'Translation') {
    return item.category === 'Translation';
  }
  if (chip === 'Business') {
    return item.category === 'Business';
  }
  return true;
}

function filterChipLabel(chip: ServiceFilterChip): string {
  switch (chip) {
    case 'All':
      return t('services.allCategory');
    case 'Visa':
      return t('services.filterVisa');
    case 'Marriage':
      return t('services.filterMarriage');
    case 'Translation':
      return t('services.filterTranslation');
    case 'Business':
      return t('services.filterBusiness');
    default:
      return chip;
  }
}

export default function ServicesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [filterChip, setFilterChip] = useState<ServiceFilterChip>('All');

  const filtered = useMemo(
    () =>
      serviceCatalog.filter((item) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          q.length === 0 ||
          item.title.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q);
        return matchesQuery && matchesFilter(item, filterChip);
      }),
    [query, filterChip],
  );

  const header = (
    <View style={{ gap: spacing.stackLg, paddingBottom: spacing.stackMd }}>
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle')} />

      <Card shadow="medium">
        <Input
          placeholder={t('services.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
          leftIcon={<Ionicons name="search" size={20} color={colors.muted} />}
        />
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.stackSm, paddingVertical: 2 }}>
        {SERVICE_FILTER_CHIPS.map((chip) => {
          const selected = filterChip === chip;
          return (
            <Pressable
              key={chip}
              className="rounded-full px-4 py-2.5"
              style={{
                backgroundColor: selected ? colors.primary : colors.card,
                borderColor: colors.border,
                borderWidth: selected ? 0 : 1,
              }}
              onPress={() => setFilterChip(chip)}
            >
              <Text className="text-sm font-semibold" style={{ color: selected ? '#ffffff' : colors.foreground }}>
                {filterChipLabel(chip)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const empty = (
    <View className="items-center px-2 py-10">
      <View
        className="mb-4 h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: isDark ? 'rgba(91, 118, 224, 0.2)' : 'rgba(44, 84, 198, 0.1)' }}
      >
        <Ionicons name="layers-outline" size={28} color={colors.primary} />
      </View>
      <Text className="text-center text-lg font-bold" style={{ color: colors.foreground }}>
        {t('services.emptyTitle')}
      </Text>
      <Text className="mt-2 max-w-[300px] text-center text-sm leading-5" style={{ color: colors.muted }}>
        {t('services.emptyHint')}
      </Text>
      <View className="mt-6 w-full max-w-xs">
        <Button
          label={t('services.allCategory')}
          variant="secondary"
          onPress={() => {
            setQuery('');
            setFilterChip('All');
          }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.stackLg }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const tint = ICON_SURFACE[item.category][isDark ? 'dark' : 'light'];
          const priceLine =
            item.cardPriceBaht != null && item.cardPriceBaht.length > 0
              ? t('services.priceFromBaht', { amount: item.cardPriceBaht })
              : null;
          const badgeLabel =
            item.cardBadge === 'popular'
              ? t('services.badgePopular')
              : item.cardBadge === 'fast'
                ? t('services.badgeFast')
                : null;

          return (
            <Card shadow="medium">
              <Pressable
                onPress={() => router.push(`/services/${item.slug}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}. ${t('services.viewDetails')}`}
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
              >
                <View className="flex-row gap-3">
                  <View
                    className="h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: tint }}
                  >
                    <Ionicons name={item.icon} size={26} color={colors.primary} accessibilityIgnoresInvertColors />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-base font-bold leading-6" style={{ color: colors.foreground }} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="mt-1.5 text-sm leading-5" style={{ color: colors.muted }} numberOfLines={3}>
                      {item.shortDescription}
                    </Text>
                    {(priceLine || badgeLabel) ? (
                      <View className="mt-3 flex-row flex-wrap items-center gap-2">
                        {priceLine ? (
                          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                            {priceLine}
                          </Text>
                        ) : null}
                        {badgeLabel ? (
                          <View
                            className="rounded-full px-2.5 py-1"
                            style={{
                              backgroundColor: isDark ? 'rgba(91, 118, 224, 0.25)' : 'rgba(44, 84, 198, 0.1)',
                            }}
                          >
                            <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                              {badgeLabel}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>

              <View style={{ marginTop: spacing.stackMd, gap: spacing.stackSm }}>
                <Button
                  label={t('cta.bookNow')}
                  onPress={() => router.push({ pathname: '/(tabs)/book', params: { serviceSlug: item.slug } })}
                />
                <Button
                  label={t('services.viewDetails')}
                  variant="secondary"
                  onPress={() => router.push(`/services/${item.slug}`)}
                />
              </View>
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}
