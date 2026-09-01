import { useQuery } from '@tanstack/react-query';

import { getMyDocuments } from '../features/documents/documents.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function useDocuments() {
  const enabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['my-documents'],
    queryFn: getMyDocuments,
    enabled,
  });
}
