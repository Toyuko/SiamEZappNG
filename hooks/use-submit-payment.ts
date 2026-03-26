import { useMutation } from '@tanstack/react-query';

import { submitPayment, type SubmitPaymentPayload } from '../features/payments/payments.mutations';

export function useSubmitPayment() {
  return useMutation({
    mutationFn: (payload: SubmitPaymentPayload) => submitPayment(payload),
  });
}

