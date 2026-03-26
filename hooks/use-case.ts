import { useQuery } from '@tanstack/react-query';

import { getCaseById } from '../features/cases/cases.api';

export function useCase(id: string | undefined) {
  return useQuery({
    queryKey: ['case', id],
    enabled: Boolean(id),
    queryFn: () => getCaseById(id!),
  });
}

