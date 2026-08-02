import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type UnifiedSearchGroups = {
  services: Array<{ id: string; title: string; href?: string; division?: string }>;
  vehicles: Array<{ id: string; title: string; href?: string; division?: string }>;
  properties: Array<{ id: string; title: string; href?: string; division?: string }>;
  help: Array<{ id: string; title: string; href?: string; division?: string }>;
  lifeEvents?: Array<{ id: string; title: string; href?: string; division?: string }>;
  goals?: Array<{ id: string; title: string; href?: string; division?: string }>;
  bookings?: Array<{ id: string; title: string; href?: string; division?: string }>;
};

export type UnifiedSearchResult = {
  query: string;
  groups: UnifiedSearchGroups;
};

export async function fetchUnifiedSearch(query: string, locale: 'en' | 'th' = 'en') {
  const q = encodeURIComponent(query.trim());
  const response = await api.get<
    UnifiedSearchResult | ApiEnvelope<UnifiedSearchResult>
  >(`/api/v1/search?q=${q}&locale=${locale}`);
  return unwrapApiData(response);
}
