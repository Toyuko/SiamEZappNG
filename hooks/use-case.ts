import { useQuery } from '@tanstack/react-query';

import { getCaseById } from '../features/cases/cases.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function useCase(id: string | undefined) {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['case', id],
    enabled: enabled && Boolean(id),
    queryFn: () => getCaseById(id!),
  });
}

