import { useQuery } from '@tanstack/react-query';

import { fetchRecommendations } from '../features/recommendations/recommendations.api';
import { useLanguageStore } from '../lib/i18n/useLanguageStore';

export function useRecommendations(enabled = true) {
  const language = useLanguageStore((s) => s.language);
  const locale = language === 'th' ? 'th' : 'en';

  return useQuery({
    queryKey: ['recommendations', locale],
    queryFn: () => fetchRecommendations(locale, 6),
    enabled,
  });
}
