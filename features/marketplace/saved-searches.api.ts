import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { MarketplaceListingType } from './marketplace.types';

export type SavedSearch = {
  id: string;
  name: string;
  listingType: MarketplaceListingType;
  query: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export async function fetchSavedSearches() {
  const response = await api.get<SavedSearch[] | ApiEnvelope<SavedSearch[]>>(
    '/api/v1/saved-searches'
  );
  return unwrapApiData(response);
}

export async function createSavedSearch(input: {
  name: string;
  listingType: MarketplaceListingType;
  query: Record<string, string>;
}) {
  const response = await api.post<SavedSearch | ApiEnvelope<SavedSearch>>(
    '/api/v1/saved-searches',
    input
  );
  return unwrapApiData(response);
}

export async function deleteSavedSearch(id: string) {
  const response = await api.delete<{ deleted: boolean } | ApiEnvelope<{ deleted: boolean }>>(
    `/api/v1/saved-searches/${id}`
  );
  return unwrapApiData(response);
}
