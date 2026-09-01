import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type {
  HubListingCard,
  ListingEngagementState,
  MarketplaceEngagementHub,
  MarketplaceListingType,
} from './marketplace.types';

export async function fetchMarketplaceEngagement() {
  const response = await api.get<
    MarketplaceEngagementHub | ApiEnvelope<MarketplaceEngagementHub>
  >('/api/v1/marketplace/engagement');
  return unwrapApiData(response);
}

export async function saveMarketplaceListing(
  listingType: MarketplaceListingType,
  listingId: string
) {
  const response = await api.put<
    { saved: boolean } | ApiEnvelope<{ saved: boolean }>
  >(`/api/v1/marketplace/saved/${listingType}/${listingId}`);
  return unwrapApiData(response);
}

export async function unsaveMarketplaceListing(
  listingType: MarketplaceListingType,
  listingId: string
) {
  const response = await api.delete<
    { saved: boolean } | ApiEnvelope<{ saved: boolean }>
  >(`/api/v1/marketplace/saved/${listingType}/${listingId}`);
  return unwrapApiData(response);
}

export async function addMarketplaceCompare(
  listingType: MarketplaceListingType,
  listingId: string
) {
  const response = await api.put(`/api/v1/marketplace/compare/${listingType}/${listingId}`);
  return unwrapApiData(response);
}

export async function removeMarketplaceCompare(
  listingType: MarketplaceListingType,
  listingId: string
) {
  const response = await api.delete(`/api/v1/marketplace/compare/${listingType}/${listingId}`);
  return unwrapApiData(response);
}

export async function recordMarketplaceView(
  listingType: MarketplaceListingType,
  listingId: string
) {
  const response = await api.post<
    ListingEngagementState | ApiEnvelope<ListingEngagementState>
  >(`/api/v1/marketplace/views/${listingType}/${listingId}`);
  return unwrapApiData(response);
}

export type { HubListingCard };
