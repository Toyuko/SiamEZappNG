import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';

export type ConciergeLocale = 'en' | 'th';

export type ConciergeDeepLink = {
  href: string;
  label: string;
  kind: 'listing' | 'service' | 'life_event' | 'search';
};

export type ConciergeServiceRecommendation = {
  slug: string;
  name: string;
  shortDescription: string;
  score?: number;
};

export type ConciergeReply = {
  content: string;
  recommendations: ConciergeServiceRecommendation[];
  deepLinks?: ConciergeDeepLink[];
  mode: 'rule' | 'llm' | 'mock-stream';
};

export type ConciergeHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export async function sendConciergeMessage(input: {
  message: string;
  locale?: ConciergeLocale;
  history?: ConciergeHistoryItem[];
}) {
  const response = await api.post<ConciergeReply | ApiEnvelope<ConciergeReply>>(
    '/api/v1/concierge/chat',
    {
      message: input.message,
      locale: input.locale ?? 'en',
      history: input.history ?? [],
    }
  );
  return unwrapApiData(response);
}
