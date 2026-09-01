import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadAdCampaignWithImage, type UploadAdCampaignInput } from '../features/corporate/corporate.api';

export function useUploadAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadAdCampaignInput) => uploadAdCampaignWithImage(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['corporate-dashboard'] });
    },
  });
}
