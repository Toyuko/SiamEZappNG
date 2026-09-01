import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type RecommendationSuggestion = {
  kind: 'service' | 'listing' | 'life_event';
  id: string;
  title: string;
  reason: string;
  href?: string;
  score?: number;
};

export type RecommendationResult = {
  suggestions: RecommendationSuggestion[];
  polished: boolean;
};

export async function fetchRecommendations(locale: 'en' | 'th' = 'en', limit = 6) {
  const response = await api.get<
    RecommendationResult | ApiEnvelope<RecommendationResult>
  >(`/api/v1/recommendations?locale=${locale}&limit=${limit}`);
  return unwrapApiData(response);
}
