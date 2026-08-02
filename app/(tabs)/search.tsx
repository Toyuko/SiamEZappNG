import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import { fetchUnifiedSearch } from '../../features/search/unified-search.api';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function openHref(router: ReturnType<typeof useRouter>, href?: string, id?: string) {
  if (!href && !id) return;
  const path = (href ?? '').replace(/^\/(en|th)/, '');
  if (path.startsWith('/sales/') || href?.includes('/sales/')) {
    router.push(`/sales/${path.split('/').pop() || id}`);
    return;
  }
  if (path.startsWith('/real-estate/')) {
    router.push(`/real-estate/${path.split('/').pop() || id}`);
    return;
  }
  if (path.startsWith('/services/') || path.startsWith('/book/')) {
    router.push(`/services/${path.split('/').pop() || id}`);
    return;
  }
  if (id) router.push(`/services/${id}`);
}

export default function UnifiedSearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'th' ? 'th' : 'en';
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const searchQuery = useQuery({
    queryKey: ['unified-search', submitted, locale],
    queryFn: () => fetchUnifiedSearch(submitted, locale),
    enabled: submitted.trim().length > 0,
  });

  const groups = searchQuery.data?.groups;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: spacing.sectionGap,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          title="Search"
          subtitle="Unified Platform search — services, vehicles, properties, help."
        />

        <Card>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search the platform…"
            onSubmitEditing={() => setSubmitted(query.trim())}
            returnKeyType="search"
          />
          <Pressable
            className="mt-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: colors.primary }}
            onPress={() => setSubmitted(query.trim())}
          >
            <Text className="text-center text-sm font-semibold text-white">Search</Text>
          </Pressable>
        </Card>

        {searchQuery.isFetching ? (
          <Text className="text-sm" style={{ color: colors.muted }}>
            Searching…
          </Text>
        ) : null}

        {groups ? (
          <>
            {(
              [
                ['services', 'Services'],
                ['vehicles', 'Vehicles'],
                ['properties', 'Properties'],
                ['lifeEvents', 'Life events'],
                ['goals', 'Goals'],
                ['bookings', 'Bookings'],
                ['help', 'Help'],
              ] as const
            ).map(([key, label]) => {
              const items = (groups as Record<string, Array<{ id: string; title: string; href?: string }>>)[
                key
              ];
              if (!items?.length) return null;
              return (
                <Section key={key} title={label}>
                  <Card>
                    <View className="gap-2">
                      {items.map((item) => (
                        <Pressable
                          key={`${key}-${item.id}`}
                          onPress={() => openHref(router, item.href, item.id)}
                        >
                          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                            {item.title}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Card>
                </Section>
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
