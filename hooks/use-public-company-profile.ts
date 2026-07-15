import { useQuery } from '@tanstack/react-query';

import { fetchPublicCompanyProfile } from '../features/corporate/corporate.api';

export function usePublicCompanyProfile(companyIdOrSlug?: string) {
  return useQuery({
    queryKey: ['public-company-profile', companyIdOrSlug],
    queryFn: () => fetchPublicCompanyProfile(companyIdOrSlug!),
    enabled: Boolean(companyIdOrSlug),
  });
}
