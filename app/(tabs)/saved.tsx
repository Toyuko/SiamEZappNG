import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/error-state';
import { LoadingState } from '../../components/ui/loading-state';
import { PageHeader } from '../../components/ui/PageHeader';
import { Section } from '../../components/ui/Section';
import {
  deleteSavedSearch,
  fetchSavedSearches,
} from '../../features/marketplace/saved-searches.api';
import type { HubListingCard } from '../../features/marketplace/marketplace.types';
import { useMarketplaceEngagement } from '../../hooks/use-marketplace-engagement';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

function formatMoney(amount: number, currency = 'THB') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ListingRow({
  card,
  onPress,
}: {
  card: HubListingCard;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Card>
        <View className="flex-row gap-3">
          <Image
            source={{ uri: card.heroImageUrl }}
            className="h-16 w-16 rounded-lg"
            resizeMode="cover"
          />
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-semibold" style={{ color: colors.foreground }} numberOfLines={2}>
              {card.title}
            </Text>
            {card.subtitle ? (
              <Text className="mt-0.5 text-xs" style={{ color: colors.muted }} numberOfLines={1}>
                {card.subtitle}
              </Text>
            ) : null}
            <Text className="mt-1 text-sm font-semibold" style={{ color: colors.primary }}>
              {formatMoney(card.priceAmount, card.priceCurrency)}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

export default function SavedHubScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const engagement = useMarketplaceEngagement();
  const searchesQuery = useQuery({
    queryKey: ['saved-searches'],
    queryFn: fetchSavedSearches,
  });
  const removeSearch = useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['saved-searches'] }),
  });

  if (engagement.isLoading) {
    return <LoadingState label="Loading saved listings…" />;
  }

  if (engagement.isError) {
    return (
      <ErrorState
        label={
          engagement.error instanceof Error
            ? engagement.error.message
            : 'Unable to load saved hub'
        }
        onRetry={() => void engagement.refetch()}
      />
    );
  }

  const data = engagement.data;
  const openCard = (card: HubListingCard) => {
    if (card.listingType === 'vehicle') {
      router.push(`/sales/${card.listingId}`);
    } else {
      router.push(`/real-estate/${card.listingId}`);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: spacing.sectionGap,
          paddingBottom: 40,
        }}
      >
        <PageHeader
          title="Saved & Compare"
          subtitle={`${data?.savedCount ?? 0} saved · ${data?.compareCount ?? 0} in compare · Platform 2.1`}
        />

        <Section title="Saved searches" subtitle="Filter presets synced with the website">
          {(searchesQuery.data ?? []).length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Save marketplace filters on the website or via API — they appear here.
              </Text>
            </Card>
          ) : (
            (searchesQuery.data ?? []).map((search) => (
              <Card key={search.id}>
                <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                  {search.name}
                </Text>
                <Text className="mt-1 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                  {search.listingType}
                </Text>
                <Pressable
                  className="mt-2 self-start"
                  onPress={() => {
                    Alert.alert('Delete saved search?', search.name, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => removeSearch.mutate(search.id),
                      },
                    ]);
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.muted }}>
                    Delete
                  </Text>
                </Pressable>
              </Card>
            ))
          )}
        </Section>

        <Section title="Saved" subtitle="Synced with the website buyer hub">
          {(data?.saved ?? []).length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Save vehicles or properties from listing details to see them here.
              </Text>
            </Card>
          ) : (
            (data?.saved ?? []).map((card) => (
              <ListingRow
                key={`saved-${card.listingType}-${card.listingId}`}
                card={card}
                onPress={() => openCard(card)}
              />
            ))
          )}
        </Section>

        <Section title="Recently viewed" subtitle="Last listings you opened">
          {(data?.recent ?? []).length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Browse the marketplace to build your history.
              </Text>
            </Card>
          ) : (
            (data?.recent ?? []).map((card) => (
              <ListingRow
                key={`recent-${card.listingType}-${card.listingId}`}
                card={card}
                onPress={() => openCard(card)}
              />
            ))
          )}
        </Section>

        <Section title="Compare" subtitle="Up to 3 listings">
          {(data?.compare ?? []).length === 0 ? (
            <Card>
              <Text className="text-sm" style={{ color: colors.muted }}>
                Add listings to compare from detail screens.
              </Text>
            </Card>
          ) : (
            (data?.compare ?? []).map((card) => (
              <ListingRow
                key={`compare-${card.listingType}-${card.listingId}`}
                card={card}
                onPress={() => openCard(card)}
              />
            ))
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
