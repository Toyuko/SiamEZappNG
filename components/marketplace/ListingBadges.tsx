import { Text, View } from 'react-native';

import {
  badgeLabel,
  computeListingBadges,
  type ListingBadge,
} from '../../features/marketplace/listing-badges';
import { useTheme } from '../../lib/theme/theme';

export function ListingBadges(props: {
  createdAt: string;
  priceAmount: number;
  previousPriceAmount?: number | null;
  isBoosted?: boolean;
  boostExpiresAt?: string | null;
  isVerified?: boolean;
}) {
  const { colors } = useTheme();
  const badges = computeListingBadges(props);
  if (badges.length === 0) return null;

  return (
    <View className="mt-2 flex-row flex-wrap gap-1.5">
      {badges.map((badge) => (
        <BadgeChip key={badge} badge={badge} color={colors.primary} border={colors.border} />
      ))}
    </View>
  );
}

function BadgeChip({
  badge,
  color,
  border,
}: {
  badge: ListingBadge;
  color: string;
  border: string;
}) {
  return (
    <View
      className="rounded-md border px-2 py-0.5"
      style={{ borderColor: border, backgroundColor: 'transparent' }}
    >
      <Text className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
        {badgeLabel(badge)}
      </Text>
    </View>
  );
}
