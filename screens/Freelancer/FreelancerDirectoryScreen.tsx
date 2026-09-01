import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Star } from 'lucide-react-native';

import { FreelancerSkillChips } from '../../components/freelancer/FreelancerSkillChips';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/empty-state';
import { ErrorState } from '../../components/ui/error-state';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import type { FreelancerPublicCard } from '../../features/freelancer/freelancer-profile.types';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import { useFreelancerDirectory } from '../../hooks/use-freelancer-directory';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function FreelancerCard({ item, onPress }: { item: FreelancerPublicCard; onPress: () => void }) {
  const { colors } = useTheme();
  const name = item.user.name?.trim() || t('freelancer.publicProfile.unnamed');
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card>
        <View className="flex-row items-start gap-3">
          {item.user.image ? (
            <Image
              source={{ uri: item.user.image }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
          ) : (
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(44, 84, 198, 0.12)' }}
            >
              <Text className="text-base font-bold" style={{ color: colors.primary }}>
                {initials || '?'}
              </Text>
            </View>
          )}

          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-base font-bold" style={{ color: colors.foreground }} numberOfLines={1}>
                {name}
              </Text>
              {item.verificationStatus === 'verified' ? (
                <Badge label={t('freelancer.verified')} variant="success" />
              ) : null}
            </View>

            {item.title ? (
              <View
                className="mt-2 self-start rounded-lg px-2.5 py-1"
                style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-xs font-semibold" style={{ color: colors.muted }} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            ) : null}

            {item.averageRating > 0 ? (
              <View className="mt-2 flex-row items-center gap-1">
                <Star size={14} color={colors.primary} fill={colors.primary} />
                <Text className="text-xs font-semibold" style={{ color: colors.foreground }}>
                  {item.averageRating.toFixed(1)}
                </Text>
                {item.totalReviews > 0 ? (
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    ({item.totalReviews})
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-3">
          <FreelancerSkillChips skills={item.skills} maxVisible={4} />
        </View>

        {item.hourlyRate != null ? (
          <Text className="mt-3 text-sm font-bold" style={{ color: colors.primary }}>
            {t('freelancer.publicProfile.fromRate', { amount: formatJobAmount(item.hourlyRate) })}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

export function FreelancerDirectoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const debouncedSkill = useDebouncedValue(skillFilter, 300);

  const directoryQuery = useFreelancerDirectory({
    q: debouncedQuery,
    skill: debouncedSkill,
  });

  const items = useMemo(
    () => directoryQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [directoryQuery.data?.pages],
  );

  if (directoryQuery.isLoading) {
    return <LoadingState label={t('freelancer.publicProfile.directory.loading')} />;
  }

  if (directoryQuery.isError && items.length === 0) {
    const error = directoryQuery.error as unknown;
    return (
      <ErrorState
        label={error instanceof Error ? error.message : t('freelancer.publicProfile.directory.loadError')}
        onRetry={() => void directoryQuery.refetch()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: spacing.stackMd, paddingBottom: 40, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.stackMd, marginBottom: spacing.stackSm }}>
            <PageHeader
              title={t('freelancer.publicProfile.directory.title')}
              subtitle={t('freelancer.publicProfile.directory.subtitle')}
              onBack={() => router.back()}
              primaryCta={{ label: 'Try AI Matching', onPress: () => router.push('/smart-match') }}
            />
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder={t('freelancer.publicProfile.directory.searchPlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Search size={18} color={colors.muted} />}
            />
            <Input
              value={skillFilter}
              onChangeText={setSkillFilter}
              placeholder={t('freelancer.publicProfile.directory.skillPlaceholder')}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        }
        renderItem={({ item }) => (
          <FreelancerCard item={item} onPress={() => router.push(`/freelancers/${item.slug}`)} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={directoryQuery.isRefetching && !directoryQuery.isFetchingNextPage}
            onRefresh={() => void directoryQuery.refetch()}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (directoryQuery.hasNextPage && !directoryQuery.isFetchingNextPage) {
            void directoryQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          directoryQuery.isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={<EmptyState label={t('freelancer.publicProfile.directory.empty')} />}
      />
    </SafeAreaView>
  );
}
