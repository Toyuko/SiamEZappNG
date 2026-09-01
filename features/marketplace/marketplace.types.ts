export type MarketplaceListingType = 'vehicle' | 'property';

export type HubListingCard = {
  listingType: MarketplaceListingType;
  listingId: string;
  title: string;
  priceAmount: number;
  priceCurrency: string;
  heroImageUrl: string;
  href: string;
  subtitle?: string;
  savedAt?: string;
  viewedAt?: string;
};

export type MarketplaceEngagementHub = {
  saved: HubListingCard[];
  recent: HubListingCard[];
  compare: HubListingCard[];
  savedCount: number;
  compareCount: number;
};

export type ListingEngagementState = {
  saved: boolean;
  inCompare: boolean;
  compareCount: number;
};
