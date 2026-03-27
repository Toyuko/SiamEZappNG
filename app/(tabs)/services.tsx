import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { serviceCatalog, serviceCategories } from '../../features/services/services.data';
import { t } from '../../lib/i18n/i18n';
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

  return (
    <SafeAreaView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
      <Header title={t('services.title')} subtitle={t('services.subtitle')} gradient />

      <Input placeholder={t('services.searchPlaceholder')} value={query} onChangeText={setQuery} className="mt-4" />

      <View className="mt-3 flex-row flex-wrap gap-2">
        {serviceCategories.map((item) => (
          <Pressable
            key={item}
            className="rounded-full px-4 py-2.5"
            style={{
              backgroundColor: category === item ? colors.primary : colors.card,
              borderColor: colors.border,
              borderWidth: category === item ? 0 : 1,
            }}
            onPress={() => setCategory(item)}
          >
            <Text className="font-semibold" style={{ color: category === item ? '#ffffff' : colors.mutedText }}>
              {item === 'All' ? t('services.allCategory') : item}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        className="mt-4"
        data={filtered}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <Card>
            <Pressable onPress={() => router.push(`/services/${item.slug}`)}>
              <Text className="text-2xl">{item.icon}</Text>
              <Text className="mt-2 text-lg font-semibold" style={{ color: colors.text }}>{item.title}</Text>
              <Text className="mt-1" style={{ color: colors.mutedText }}>{item.shortDescription}</Text>
            </Pressable>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

