import { useQuery } from '@tanstack/react-query';

import { getMyCases } from '../features/cases/cases.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function useCases() {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['my-cases'],
    queryFn: getMyCases,
    enabled,
  });
}
