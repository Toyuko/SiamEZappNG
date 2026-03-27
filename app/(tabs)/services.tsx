import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { serviceCatalog, serviceCategories } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof serviceCategories)[number]>('All');

  const filtered = useMemo(
    () =>
      serviceCatalog.filter((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(query.toLowerCase()) || item.shortDescription.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All' || item.category === category;
        return matchesQuery && matchesCategory;
      }),
    [query, category],
  );

  const header = (
    <View style={{ gap: spacing.stackLg, paddingBottom: spacing.stackMd }}>
      <PageHeader title={t('services.title')} subtitle={t('services.subtitle')} />

      <Card>
        <Input placeholder={t('services.searchPlaceholder')} value={query} onChangeText={setQuery} />
      </Card>
      <Card>
        <View className="flex-row flex-wrap gap-2">
          {serviceCategories.map((item) => (
            <Pressable
              key={item}
              className="rounded-full px-4 py-2.5"
              style={{
                backgroundColor: category === item ? colors.primary : colors.background,
                borderColor: colors.border,
                borderWidth: category === item ? 0 : 1,
              }}
              onPress={() => setCategory(item)}
            >
              <Text className="font-semibold" style={{ color: category === item ? '#ffffff' : colors.muted }}>
                {item === 'All' ? t('services.allCategory') : item}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.slug}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: spacing.stackMd }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.stackMd }} />}
        renderItem={({ item }) => (
          <Card>
            <Pressable onPress={() => router.push(`/services/${item.slug}`)}>
              <Text className="text-2xl">{item.icon}</Text>
              <Text className="mt-2 text-lg font-bold" style={{ color: colors.foreground }}>
                {item.title}
              </Text>
              <Text className="mt-1 text-sm leading-5" style={{ color: colors.muted }}>
                {item.shortDescription}
              </Text>
            </Pressable>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
