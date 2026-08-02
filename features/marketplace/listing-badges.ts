export type ListingBadge = 'new' | 'featured' | 'reduced' | 'verified';

/** Mirrors Platform 2.1 `src/lib/marketplace/badges.ts`. */
export function computeListingBadges(input: {
  createdAt: string | Date;
  isBoosted?: boolean;
  boostExpiresAt?: string | Date | null;
  previousPriceAmount?: number | null;
  priceAmount: number;
  isVerified?: boolean;
  now?: Date;
  newWithinDays?: number;
}): ListingBadge[] {
  const now = input.now ?? new Date();
  const newWithinDays = input.newWithinDays ?? 14;
  const createdAt =
    input.createdAt instanceof Date
      ? input.createdAt
      : new Date(input.createdAt);
  const boostExpiresAt = input.boostExpiresAt
    ? input.boostExpiresAt instanceof Date
      ? input.boostExpiresAt
      : new Date(input.boostExpiresAt)
    : null;

  const newestAllowed = now.getTime() - newWithinDays * 24 * 60 * 60 * 1000;
  const badges: ListingBadge[] = [];

  if (!Number.isNaN(createdAt.getTime()) && createdAt.getTime() >= newestAllowed) {
    badges.push('new');
  }
  if (
    input.isBoosted &&
    (!boostExpiresAt || boostExpiresAt.getTime() > now.getTime())
  ) {
    badges.push('featured');
  }
  if (
    input.previousPriceAmount != null &&
    input.previousPriceAmount > input.priceAmount &&
    input.priceAmount > 0
  ) {
    badges.push('reduced');
  }
  if (input.isVerified) badges.push('verified');
  return badges;
}

export function badgeLabel(badge: ListingBadge): string {
  switch (badge) {
    case 'new':
      return 'New';
    case 'featured':
      return 'Featured';
    case 'reduced':
      return 'Price drop';
    case 'verified':
      return 'Verified';
  }
}
