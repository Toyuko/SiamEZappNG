import { useQuery } from '@tanstack/react-query';

import { getMyCases } from '../features/cases/cases.api';

export function useCases() {
  return useQuery({
    queryKey: ['my-cases'],
    queryFn: getMyCases,
  });
}
