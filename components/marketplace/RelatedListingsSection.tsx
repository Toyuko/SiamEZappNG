import { useQuery } from '@tanstack/react-query';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '../ui/Card';
import { Section } from '../ui/Section';
import { fetchRelatedListings } from '../../features/marketplace/related.api';
import type { MarketplaceListingType } from '../../features/marketplace/marketplace.types';
import { useTheme } from '../../lib/theme/theme';

export function RelatedListingsSection({
  listingType,
  listingId,
}: {
  listingType: MarketplaceListingType;
  listingId: string;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const query = useQuery({
    queryKey: ['related-listings', listingType, listingId],
    queryFn: () => fetchRelatedListings(listingType, listingId),
    enabled: Boolean(listingId),
  });

  const related = query.data?.related ?? [];
  const alsoViewed = query.data?.alsoViewed ?? [];
  if (!query.isSuccess || (related.length === 0 && alsoViewed.length === 0)) {
    return null;
  }

  const open = (type: MarketplaceListingType, id: string) => {
    if (type === 'vehicle') router.push(`/sales/${id}`);
    else router.push(`/real-estate/${id}`);
  };

  return (
    <View className="gap-4">
      {related.length > 0 ? (
        <Section title="Related listings" subtitle="Similar inventory from the Platform">
          <Card>
            <View className="gap-2">
              {related.map((item) => (
                <Pressable key={item.id} onPress={() => open(item.listingType, item.id)}>
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Section>
      ) : null}
      {alsoViewed.length > 0 ? (
        <Section title="People also viewed" subtitle="Based on marketplace activity">
          <Card>
            <View className="gap-2">
              {alsoViewed.map((item) => (
                <Pressable key={`${item.listingType}-${item.id}`} onPress={() => open(item.listingType, item.id)}>
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {item.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </Section>
      ) : null}
    </View>
  );
}
