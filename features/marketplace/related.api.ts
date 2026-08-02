import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { MarketplaceListingType } from './marketplace.types';

export type RelatedListingCard = {
  id: string;
  title: string;
  href: string;
  listingType: MarketplaceListingType;
};

export type RelatedListingsResponse = {
  related: RelatedListingCard[];
  alsoViewed: RelatedListingCard[];
};

export async function fetchRelatedListings(
  listingType: MarketplaceListingType,
  listingId: string,
  limit = 6
) {
  const response = await api.get<
    RelatedListingsResponse | ApiEnvelope<RelatedListingsResponse>
  >(`/api/v1/marketplace/${listingType}/${listingId}/related?limit=${limit}`);
  return unwrapApiData(response);
}
