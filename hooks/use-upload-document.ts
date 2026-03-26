import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadDocument, type UploadDocumentPayload } from '../features/documents/documents.api';

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) => uploadDocument(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-documents'] });
    },
  });
}

