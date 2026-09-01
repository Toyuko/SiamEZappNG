import { useMutation } from '@tanstack/react-query';

import { sendFreelancerInquiry } from '../features/freelancer/freelancer-profile.api';
import type { FreelancerInquiryInput } from '../features/freelancer/freelancer-profile.types';

export function useSendFreelancerInquiry() {
  return useMutation({
    mutationFn: (input: FreelancerInquiryInput) => sendFreelancerInquiry(input),
  });
}
