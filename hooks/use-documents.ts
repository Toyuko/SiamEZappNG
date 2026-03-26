import { useQuery } from '@tanstack/react-query';

import { getMyDocuments } from '../features/documents/documents.api';

export function useDocuments() {
  return useQuery({
    queryKey: ['my-documents'],
    queryFn: getMyDocuments,
  });
}
